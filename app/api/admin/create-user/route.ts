import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role, course, status, avatarUrl } = await request.json();

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Create the user in Supabase Auth
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!userData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // 2. Update the profile in the profiles table
    // The trigger might have already created a profile, so we use upsert
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userData.user.id,
        full_name: fullName,
        email: email,
        role: role || 'student',
        course: course || '',
        status: status || 'active',
        avatar_url: avatarUrl,
      }, { onConflict: 'user_id' });

    if (profileError) {
      // If update fails, we might want to delete the user, but for now just log it
      console.error('Error updating profile:', profileError);
      return NextResponse.json({ error: 'User created but profile update failed: ' + profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: userData.user });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
