import { NextResponse } from 'next/server';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // 1. Verify if the requester is an admin
    const authHeader = request.headers.get('Authorization');
    let token = '';
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    // Verify the user with the token
    const { data: { user: requester }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !requester) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Check if requester is admin
    const { data: requesterProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', requester.id)
      .single();

    if (profileFetchError || requesterProfile?.role !== 'admin') {
      // Check if it's the default admin email
      const adminEmails = ['ciepcentrointegradodeensinopro@gmail.com', 'test@gmail.com'];
      if (!requester.email || !adminEmails.includes(requester.email)) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    // 2. Parse request body
    const body = await request.json();
    const { email, password, fullName, role, course, turma, status, avatarUrl } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Initialize Supabase Admin Client
    const supabaseAdmin = getSupabaseAdmin();

    // 4. Create user in Supabase Auth
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      }
    });

    if (createError) {
      console.error('Error creating auth user:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    const userId = authUser.user.id;

    // 5. Handle avatar upload if provided as base64
    let finalAvatarUrl = avatarUrl;
    if (avatarUrl && avatarUrl.startsWith('data:image/')) {
      try {
        const base64Data = avatarUrl.split(',')[1];
        const mimeType = avatarUrl.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1];
        const fileName = `${userId}-${Date.now()}.${extension}`;
        const buffer = Buffer.from(base64Data, 'base64');

        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from('avatars')
          .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
        } else {
          const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('avatars')
            .getPublicUrl(fileName);
          finalAvatarUrl = publicUrl;
        }
      } catch (e) {
        console.error('Exception during avatar upload:', e);
      }
    }

    // 6. Update the profile
    // The trigger might have already created a profile, so we use upsert or update.
    // Since the trigger sets role='student', we need to update it.
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userId,
        full_name: fullName,
        email: email,
        role: role || 'student',
        course: course || null,
        turma: turma || null,
        status: status || 'active',
        avatar_url: finalAvatarUrl || null,
      }, { onConflict: 'user_id' });

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // We might want to delete the auth user if profile creation fails, 
      // but let's keep it for now and just return error.
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: userId,
        email,
        fullName,
        role
      }
    });

  } catch (error: any) {
    console.error('System error in create-user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
