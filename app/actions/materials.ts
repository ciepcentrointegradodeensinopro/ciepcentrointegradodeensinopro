'use server';

import { getSupabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function uploadMaterialAction(payload: any) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { 
      success: false, 
      error: 'Configuração do servidor incompleta (service_role faltando).' 
    };
  }

  const { error } = await supabase.from('materials').insert([payload]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
