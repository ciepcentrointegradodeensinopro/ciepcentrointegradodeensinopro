'use server';

import { getSupabaseAdmin } from '@/lib/supabase';

export async function syncUsersAction() {
  console.log('AdminAction: Starting user sync...');
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return { 
        success: false, 
        error: 'Chave de serviço (SUPABASE_SERVICE_ROLE_KEY) não encontrada nas configurações. Para sincronizar o banco, você precisa adicionar esta chave no menu de Configurações (Settings).' 
      };
    }
    
    // 1. Get all users from auth.users
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('AdminAction: Error listing auth users', authError);
      return { success: false, error: authError.message };
    }

    console.log(`AdminAction: Found ${authUsers.length} users in Auth. Checking Profiles...`);

    // 2. Insert or Update profiles for each auth user
    // We do them one by one or in batches
    const profilesToUpsert = authUsers.map(user => ({
      user_id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      email: user.email,
      role: user.user_metadata?.role || 'student',
      course: user.user_metadata?.course || 'Sem curso',
      turma: user.user_metadata?.turma || 'Sem turma',
      status: user.user_metadata?.status || 'pending'
    }));

    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilesToUpsert, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('AdminAction: Error upserting profiles', upsertError);
      return { success: false, error: upsertError.message };
    }

    console.log('AdminAction: User sync completed successfully');
    return { success: true, count: authUsers.length };
  } catch (error: any) {
    console.error('AdminAction: Exception in syncUsers', error);
    return { success: false, error: error.message };
  }
}
