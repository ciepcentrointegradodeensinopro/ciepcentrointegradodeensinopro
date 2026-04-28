import { createClient } from '@supabase/supabase-js';

// Função auxiliar para extrair a URL correta caso o usuário tenha colado a chave JWT por engano
const extractSupabaseUrl = (urlOrJwt: string | undefined, anonKey: string | undefined): string => {
  const fallback = 'https://placeholder.supabase.co';
  
  // Se for uma URL válida, retorne ela
  if (urlOrJwt && (urlOrJwt.trim().startsWith('http://') || urlOrJwt.trim().startsWith('https://'))) {
    return urlOrJwt.trim();
  }

  // Se não for URL, vamos tentar extrair o "ref" (ID do projeto) de um possível token JWT (do urlOrJwt ou do anonKey)
  const tokenToCheck = urlOrJwt?.startsWith('eyJ') ? urlOrJwt : anonKey?.startsWith('eyJ') ? anonKey : null;
  
  if (tokenToCheck) {
    try {
      const payloadBase64 = tokenToCheck.split('.')[1];
      if (payloadBase64) {
        // Usa Buffer se estiver no servidor, atob no cliente
        const payloadStr = typeof window !== 'undefined' 
          ? window.atob(payloadBase64) 
          : Buffer.from(payloadBase64, 'base64').toString('utf8');
        const payload = JSON.parse(payloadStr);
        if (payload.ref) {
          return `https://${payload.ref}.supabase.co`;
        }
      }
    } catch (e) {
      console.error('Falha ao tentar extrair URL do Supabase do token JWT', e);
    }
  }

  return fallback;
};

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAnonKey = (rawAnonKey || 'placeholder').trim();
const supabaseUrl = extractSupabaseUrl(rawUrl, supabaseAnonKey);

export let isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder';

// Log seguro para diagnóstico (apenas no console do desenvolvedor)
if (typeof window !== 'undefined') {
  const maskedUrl = supabaseUrl.replace(/(https?:\/\/)(.*)(\.supabase\.co)/, '$1***$3');
  console.log('Supabase Connection:', { 
    url: maskedUrl, 
    configured: isSupabaseConfigured
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

export const getSupabaseAdmin = () => {
  const adminUrl = extractSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceRoleKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_KEY
  )?.trim();
  
  if (adminUrl === 'https://placeholder.supabase.co') {
    console.error('getSupabaseAdmin: URL do Supabase não configurada corretamente no servidor.');
    return null;
  }
  
  if (!serviceRoleKey) {
    console.error('getSupabaseAdmin: SUPABASE_SERVICE_ROLE_KEY ausente nas variáveis de ambiente.');
    return null;
  }

  return createClient(adminUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
