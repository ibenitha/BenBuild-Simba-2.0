import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { products } from '@/lib/products';

// GET /api/stock?branchId=xxx — get stock for a branch
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');
    if (!branchId) return NextResponse.json({ error: 'branchId required' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('branch_stock')
      .select('product_id, quantity')
      .eq('branch_id', branchId);

    if (error) throw error;

    // Build a map; seed missing products with default 25
    const stockMap: Record<string, number> = {};
    products.forEach(p => { stockMap[p.id] = 25; });
    (data ?? []).forEach(row => { stockMap[row.product_id] = row.quantity; });

    return NextResponse.json(stockMap);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch stock.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/stock — set a product out of stock at a branch
export async function PATCH(req: NextRequest) {
  try {
    const { branchId, productId, quantity } = await req.json();
    if (!branchId || !productId) {
      return NextResponse.json({ error: 'branchId and productId required' }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('branch_stock')
      .upsert({
        branch_id: branchId,
        product_id: productId,
        quantity: quantity ?? 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'branch_id,product_id' });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update stock.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
