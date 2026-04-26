import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError } from '@/lib/supabase/api-auth';

// GET /api/profile — get current user's profile
export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, branch_id, avatar_url, phone, created_at')
      .eq('id', auth.userId)
      .maybeSingle(); // won't 500 if row is missing

    if (error) {
      console.error('GET /api/profile error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Profile row might not exist yet for very old accounts — return safe defaults
    if (!data) {
      return NextResponse.json({
        id: auth.userId,
        full_name: '',
        email: auth.email,
        role: 'customer',
        branch_id: null,
        avatar_url: null,
        phone: null,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch profile.';
    console.error('GET /api/profile exception:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/profile — update current user's profile (name, phone, avatar)
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const body = await req.json();
    const { fullName, phone, avatarUrl } = body;

    // Build update object — only include defined fields
    const updates: Record<string, string | null> = {};
    if (fullName !== undefined) updates.full_name = String(fullName).trim();
    if (phone !== undefined) updates.phone = phone ? String(phone).trim() : null;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
    }

    const supabase = createClient();

    // Check if profile row exists first
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', auth.userId)
      .maybeSingle();

    let data, error;

    if (!existing) {
      // Profile doesn't exist — create it
      ({ data, error } = await supabase
        .from('profiles')
        .insert({
          id: auth.userId,
          email: auth.email,
          role: 'customer',
          ...updates,
        })
        .select()
        .single());
    } else {
      // Update existing profile
      ({ data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', auth.userId)
        .select()
        .single());
    }

    if (error) {
      console.error('PATCH /api/profile error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also sync full_name to Supabase auth metadata
    if (fullName) {
      await supabase.auth.updateUser({ data: { full_name: String(fullName).trim() } });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update profile.';
    console.error('PATCH /api/profile exception:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
