import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/orders/[id] — update order status (assign, mark ready, complete)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, assignedTo } = body;

    const validStatuses = ['pending', 'accepted', 'ready', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const supabase = createClient();
    const update: Record<string, string> = {};
    if (status) update.status = status;
    if (assignedTo !== undefined) update.assigned_to = assignedTo;

    const { data, error } = await supabase
      .from('orders')
      .update(update)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update order.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
