import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Função auxiliar para validar se a URL é válida para o Supabase
const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
};

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = isValidUrl(rawUrl) ? rawUrl.trim() : 'https://placeholder.supabase.co';
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder').trim();

// Log seguro para diagnóstico (apenas no console do desenvolvedor)
if (typeof window !== 'undefined') {
  const maskedUrl = supabaseUrl.replace(/(https?:\/\/)(.*)(\.supabase\.co)/, '$1***$3');
  console.log('Supabase Connection:', { 
    url: maskedUrl, 
    configured: isSupabaseConfigured = isValidUrl(rawUrl) && supabaseAnonKey !== 'placeholder'
  });
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: typeof window !== 'undefined',
      persistSession: typeof window !== 'undefined',
      detectSessionInUrl: typeof window !== 'undefined'
    }
  }
);

export let isSupabaseConfigured = isValidUrl(rawUrl) && supabaseAnonKey !== 'placeholder' && supabaseUrl !== 'https://placeholder.supabase.co';

export const getSupabaseAdmin = () => {
  const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_KEY
  )?.trim();
  
  if (!isValidUrl(adminUrl)) {
    console.error('getSupabaseAdmin: URL inválida');
    return null;
  }
  if (!serviceRoleKey) {
    console.error('getSupabaseAdmin: Chave service_role ausente');
    return null;
  }
  return createClient(adminUrl.trim(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
