import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reviews?branchId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');

    const supabase = createClient();
    let query = supabase
      .from('branch_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (branchId) query = query.eq('branch_id', branchId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch reviews.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    const { branchId, customerName, rating, comment } = await req.json();
    if (!branchId || !rating) {
      return NextResponse.json({ error: 'branchId and rating required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('branch_reviews')
      .insert({ branch_id: branchId, customer_name: customerName || 'Anonymous', rating, comment: comment || '' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit review.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
