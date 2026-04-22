'use server';

import { getSupabaseAdmin } from '@/lib/supabase';

export async function syncUsersAction(manualKey?: string) {
  console.log('AdminAction: Starting exhaustive user sync...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  try {
    let supabaseAdmin = null;
    
    if (manualKey) {
      console.log('AdminAction: Using manual key for sync');
      if (supabaseUrl) {
        const { createClient } = await import('@supabase/supabase-js');
        supabaseAdmin = createClient(supabaseUrl, manualKey.trim(), {
          auth: { autoRefreshToken: false, persistSession: false }
        });
      }
    } else {
      supabaseAdmin = getSupabaseAdmin();
    }
    
    if (!supabaseAdmin) {
      return { 
        success: false, 
        error: `Configuração Incompleta: URL=${supabaseUrl ? 'OK' : 'AUSENTE'}. Forneça a chave service_role manualmente ou verifique as variáveis de ambiente.` 
      };
    }
    
    console.log(`AdminAction: Requesting user list from: ${supabaseUrl?.substring(0, 15)}...`);
    // 1. Get all users from auth.users
    const { data, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('AdminAction: Auth error details:', authError);
      return { 
        success: false, 
        error: `Erro Supabase Auth (${authError.status}): ${authError.message}. Verifique se a chave é a Service Role (não a Anon Key).` 
      };
    }

    const authUsers = data?.users || [];
    console.log(`AdminAction: Auth returned ${authUsers.length} users.`);

    if (authUsers.length === 0) {
      return { 
        success: true, 
        count: 0, 
        message: `Sincronização concluída, mas 0 usuários foram encontrados no Auth do Supabase (${supabaseUrl?.substring(0, 20)}...).` 
      };
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
