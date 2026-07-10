import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    // 1. Verify if the requester is an admin
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // 2. Parse request body
    const body = await request.json();
    const { email, password, fullName, role, course, turma, status, avatarUrl } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Initialize Supabase Admin Client
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error: Admin client not available' }, { status: 500 });
    }

    // 4. Create user in Supabase Auth
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
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
