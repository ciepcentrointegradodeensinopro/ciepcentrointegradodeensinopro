'use server';

import { getSupabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Função auxiliar genérica para garantir que o bucket existe
async function ensureBucket(supabase: any, bucketName: string) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.find((b: any) => b.name === bucketName);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 52428800 // 50MB
    });
  }
}

export async function uploadMaterialFileAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { success: false, error: 'Configuração do servidor incompleta.' };
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return { success: false, error: 'Nenhum arquivo enviado.' };
  }

  try {
    await ensureBucket(supabase, 'materiais');

    const fileExt = file.name.split('.').pop();
    const fileNameUnique = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('materiais')
      .upload(fileNameUnique, file, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('materiais')
      .getPublicUrl(fileNameUnique);

    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error('File Upload Error:', err);
    return { success: false, error: err.message };
  }
}

export async function uploadMaterialAction(payload: any) {
  console.log('SERVICE_ROLE presente?', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
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
