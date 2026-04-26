import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireStaff, isAuthError } from '@/lib/supabase/api-auth';

// POST /api/orders — place a new pickup or delivery order (requires auth)
export async function POST(req: NextRequest) {
  // Customers must be logged in to place orders
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const body = await req.json();
    const {
      customerName, customerEmail, branchId, timeSlot, deposit, items,
      orderType, deliveryAddress, deliveryDistrict, deliveryFee, totalAmount
    } = body;

    if (!customerName || !branchId || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Ensure the order email matches the authenticated user
    if (customerEmail && customerEmail !== auth.email) {
      return NextResponse.json({ error: 'Email mismatch.' }, { status: 403 });
    }

    const supabase = createClient();
    const orderId = `SB-${Date.now().toString().slice(-7)}`;

    // Insert order
    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      customer_name: customerName,
      customer_email: auth.email, // Always use authenticated email
      user_id: auth.userId,
      branch_id: branchId,
      time_slot: timeSlot || 'ASAP',
      deposit: deposit || 0,
      status: 'pending',
      order_type: orderType || 'pickup',
      delivery_address: deliveryAddress,
      delivery_district: deliveryDistrict,
      delivery_fee: deliveryFee || 0,
      total_amount: totalAmount || deposit,
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

// GET /api/orders — fetch orders
// - Customers: can only see their own orders
// - Staff/Manager/Admin: can see orders by branchId
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');
    const email = searchParams.get('email');

    const supabase = createClient();
    const isStaff = ['staff', 'manager', 'admin'].includes(auth.role);

    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (isStaff) {
      // Staff can filter by branch
      if (branchId) query = query.eq('branch_id', branchId);
      // Staff can also filter by email if needed
      if (email && !branchId) query = query.eq('customer_email', email);
    } else {
      // Customers see their own orders — match by user_id OR email (covers old orders without user_id)
      query = query.or(`user_id.eq.${auth.userId},customer_email.eq.${auth.email}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch orders.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
