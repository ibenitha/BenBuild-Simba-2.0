import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireStaff, isAuthError } from '@/lib/supabase/api-auth';

// GET /api/customer-flags — staff/manager/admin only
export async function GET(request: NextRequest) {
  const auth = await requireStaff();
  if (isAuthError(auth)) return auth;

  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const customerEmail = searchParams.get('customerEmail');

  try {
    let query = supabase.from('customer_flags').select('*');

    if (customerEmail) {
      query = query.eq('customer_email', customerEmail);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch customer flags' }, { status: 500 });
  }
}

// POST /api/customer-flags — staff/manager/admin only
export async function POST(request: NextRequest) {
  const auth = await requireStaff();
  if (isAuthError(auth)) return auth;

  const supabase = createClient();
  const body = await request.json();

  try {
    const { customerEmail, branchId, orderId, flagType, comment } = body;

    if (!customerEmail || !branchId || !orderId || !flagType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('customer_flags')
      .insert({
        customer_email: customerEmail,
        branch_id: branchId,
        order_id: orderId,
        flag_type: flagType,
        comment: comment || '',
        flagged_by: auth.userId, // Track who flagged
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to create customer flag' }, { status: 500 });
  }
}
