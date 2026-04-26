import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/supabase/api-auth';
import type { UserRole } from '@/types';

// GET /api/admin/users — list all users with their roles (admin only)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    let query = supabase
      .from('profiles')
      .select('id, full_name, email, role, branch_id, created_at')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/users — update a user's role (admin only)
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    const { userId, role, branchId } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required.' }, { status: 400 });
    }

    const validRoles: UserRole[] = ['customer', 'staff', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, branch_id: branchId ?? null })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update user role.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
