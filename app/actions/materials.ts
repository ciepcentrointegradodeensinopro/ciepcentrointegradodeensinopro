'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

export async function uploadMaterialAction(payload: any) {
  console.log('uploadMaterialAction: Starting...', { title: payload.title });

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = !supabaseUrl ? 'URL' : 'KEY';
    console.error(`uploadMaterialAction: Configuration missing (${missing})`);
    return { success: false, error: `Configuração do servidor incompleta (${missing} faltando).` };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('uploadMaterialAction: Attempting insert...');
    const { error } = await supabase
      .from('materials')
      .insert([payload]);

    if (error) {
      console.error('uploadMaterialAction insert error:', error);
      return { success: false, error: error.message };
    }

    console.log('uploadMaterialAction: Success!');
    return { success: true };
  } catch (err: any) {
    console.error('uploadMaterialAction critical exception:', err);
    return { success: false, error: err.message || 'Erro inesperado no servidor' };
  }
}
