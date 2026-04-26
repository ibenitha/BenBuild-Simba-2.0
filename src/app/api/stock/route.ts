import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireStaff, isAuthError } from '@/lib/supabase/api-auth';
import { products } from '@/lib/products';

// GET /api/stock?branchId=xxx — get stock for a branch (public read)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');
    const branchId2 = searchParams.get('branchId2');

    if (!branchId) return NextResponse.json({ error: 'branchId required' }, { status: 400 });

    const supabase = createClient();

    // If comparing two branches, return both
    if (branchId2) {
      const [res1, res2] = await Promise.all([
        supabase.from('branch_stock').select('product_id, quantity').eq('branch_id', branchId),
        supabase.from('branch_stock').select('product_id, quantity').eq('branch_id', branchId2),
      ]);

      if (res1.error) throw res1.error;
      if (res2.error) throw res2.error;

      const buildMap = (data: { product_id: string; quantity: number }[]) => {
        const map: Record<string, number> = {};
        products.forEach(p => { map[p.id] = 25; });
        (data ?? []).forEach(row => { map[row.product_id] = row.quantity; });
        return map;
      };

      return NextResponse.json({
        [branchId]: buildMap(res1.data ?? []),
        [branchId2]: buildMap(res2.data ?? []),
      });
    }

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

// PATCH /api/stock — update stock (staff/manager/admin only)
export async function PATCH(req: NextRequest) {
  const auth = await requireStaff();
  if (isAuthError(auth)) return auth;

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
        quantity: Math.max(0, quantity ?? 0),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'branch_id,product_id' });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update stock.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
