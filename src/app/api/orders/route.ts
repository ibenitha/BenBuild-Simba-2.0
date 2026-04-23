import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/orders — place a new pickup order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, branchId, timeSlot, deposit, items } = body;

    if (!customerName || !branchId || !timeSlot || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const supabase = createClient();
    const orderId = `SB-${Date.now().toString().slice(-7)}`;

    // Insert order
    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      customer_name: customerName,
      customer_email: customerEmail,
      branch_id: branchId,
      time_slot: timeSlot,
      deposit,
      status: 'pending',
    });

    if (orderError) throw orderError;

    // Insert order items
    const { error: itemsError } = await supabase.from('order_items').insert(
      items.map((item: { productId: string; name: string; quantity: number }) => ({
        order_id: orderId,
        product_id: item.productId,
        name: item.name,
        quantity: item.quantity,
      }))
    );

    if (itemsError) throw itemsError;

    // Decrement stock for each item at the branch
    for (const item of items) {
      const { data: stockRow } = await supabase
        .from('branch_stock')
        .select('quantity')
        .eq('branch_id', branchId)
        .eq('product_id', item.productId)
        .single();

      const current = stockRow?.quantity ?? 25;
      await supabase
        .from('branch_stock')
        .upsert({
          branch_id: branchId,
          product_id: item.productId,
          quantity: Math.max(0, current - item.quantity),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'branch_id,product_id' });
    }

    return NextResponse.json({ id: orderId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to place order.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/orders?branchId=xxx — fetch orders for a branch
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');

    const supabase = createClient();
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (branchId) query = query.eq('branch_id', branchId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch orders.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
