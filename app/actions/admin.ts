'use server';

import { getSupabaseAdmin } from '@/lib/supabase';

export async function syncUsersAction() {
  console.log('AdminAction: Starting verbose user sync...');
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return { 
        success: false, 
        error: 'A chave SUPABASE_SERVICE_ROLE_KEY ainda não foi configurada no menu Settings.' 
      };
    }
    
    // 1. Get all users from auth.users (including those not yet confirmed)
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('AdminAction: Error listing auth users', authError);
      return { success: false, error: `Erro ao listar usuários do Auth: ${authError.message}` };
    }

    if (!authUsers || authUsers.length === 0) {
      return { success: true, count: 0, message: 'Nenhum usuário encontrado no sistema de autenticação.' };
    }

    console.log(`AdminAction: Found ${authUsers.length} users in Auth. Syncing profiles...`);

    // 2. Prepare profiles for upsert
    const profilesToUpsert = authUsers.map(user => ({
      user_id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      email: user.email,
      role: user.user_metadata?.role || 'student',
      course: user.user_metadata?.course || 'Sem curso',
      turma: user.user_metadata?.turma || 'Sem turma',
      status: user.user_metadata?.status || 'pending'
    }));

    // 3. Batch upsert using Admin Client to bypass RLS
    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilesToUpsert, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('AdminAction: Error upserting profiles', upsertError);
      return { success: false, error: `Erro ao salvar perfis: ${upsertError.message}` };
    }

    return { 
      success: true, 
      count: authUsers.length, 
      message: `${authUsers.length} usuários sincronizados com sucesso!` 
    };
  } catch (error: any) {
    console.error('AdminAction: Exception in syncUsers', error);
    return { success: false, error: `Falha técnica: ${error.message}` };
  }
}
