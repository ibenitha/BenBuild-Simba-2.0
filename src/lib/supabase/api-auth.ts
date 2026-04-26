/**
 * Shared auth helpers for API routes.
 * Use these to verify authentication and roles in route handlers.
 */
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/types';

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  branchId?: string;
}

/**
 * Verify the request has a valid session.
 * Returns the auth context or a 401 NextResponse.
 */
export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const supabase = createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    );
  }

  // Fetch role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_id')
    .eq('id', user.id)
    .single();

  return {
    userId: user.id,
    email: user.email ?? '',
    role: (profile?.role as UserRole) ?? 'customer',
    branchId: profile?.branch_id ?? undefined,
  };
}

/**
 * Verify the request has a valid session AND the user has staff/manager/admin role.
 * Returns the auth context or a 401/403 NextResponse.
 */
export async function requireStaff(): Promise<AuthContext | NextResponse> {
  const result = await requireAuth();

  if (result instanceof NextResponse) return result;

  const staffRoles: UserRole[] = ['staff', 'manager', 'admin'];
  if (!staffRoles.includes(result.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Staff access required.' },
      { status: 403 }
    );
  }

  return result;
}

/**
 * Verify the request has a valid session AND the user is a manager or admin.
 */
export async function requireManager(): Promise<AuthContext | NextResponse> {
  const result = await requireAuth();

  if (result instanceof NextResponse) return result;

  const managerRoles: UserRole[] = ['manager', 'admin'];
  if (!managerRoles.includes(result.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Manager access required.' },
      { status: 403 }
    );
  }

  return result;
}

/**
 * Verify the request has a valid session AND the user is an admin.
 */
export async function requireAdmin(): Promise<AuthContext | NextResponse> {
  const result = await requireAuth();

  if (result instanceof NextResponse) return result;

  if (result.role !== 'admin') {
    return NextResponse.json(
      { error: 'Insufficient permissions. Admin access required.' },
      { status: 403 }
    );
  }

  return result;
}

/** Type guard: check if result is an error response */
export function isAuthError(result: AuthContext | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
