import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireStaff, isAuthError } from '@/lib/supabase/api-auth';

// PATCH /api/orders/[id] — update order status (staff/manager/admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Only staff, managers, and admins can update order status
  const auth = await requireStaff();
  if (isAuthError(auth)) return auth;

  try {
    const body = await req.json();
    const { status, assignedTo } = body;

    const validStatuses = ['pending', 'accepted', 'ready', 'dispatched', 'delivered', 'completed'];
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
