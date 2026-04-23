'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

export async function uploadMaterialAction(payload: any) {
  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, error: 'Configuração do servidor incompleta (service_role faltando).' };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const { data, error } = await supabase
      .from('materials')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('uploadMaterialAction error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('uploadMaterialAction exception:', err);
    return { success: false, error: err.message || 'Erro inesperado no servidor' };
  }
}
