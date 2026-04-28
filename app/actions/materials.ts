'use server';

import { getSupabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function uploadMaterialAction(payload: any) {
  console.log('uploadMaterialAction: Starting...', { title: payload.title });

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { success: false, error: 'Configuração do servidor incompleta (service_role faltando).' };
  }

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
