import { createClient } from '@supabase/supabase-js';

// Função auxiliar para extrair a URL correta caso o usuário tenha colado a chave JWT por engano
const extractSupabaseUrl = (urlOrJwt: string | undefined, anonKey: string | undefined): string => {
  const fallback = 'https://placeholder.supabase.co';
  
  // Se for uma URL válida, retorne ela (removendo barra no final se houver)
  if (urlOrJwt && (urlOrJwt.trim().startsWith('http://') || urlOrJwt.trim().startsWith('https://'))) {
    let url = urlOrJwt.trim();
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    return url;
  }

  // Se não for URL, vamos tentar extrair o "ref" (ID do projeto) de um possível token JWT (do urlOrJwt ou do anonKey)
  const tokenToCheck = urlOrJwt?.startsWith('eyJ') ? urlOrJwt : anonKey?.startsWith('eyJ') ? anonKey : null;
  
  if (tokenToCheck) {
    try {
      const payloadBase64 = tokenToCheck.split('.')[1];
      if (payloadBase64) {
        const payloadStr = atob(payloadBase64);
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

// Log para debug (apenas em desenvolvimento se necessário, mas aqui vamos deixar para ajudar o usuário)
if (typeof window !== 'undefined') {
  console.log('Supabase Env Check:', {
    hasUrl: !!rawUrl,
    urlType: typeof rawUrl,
    hasAnon: !!rawAnonKey,
    anonType: typeof rawAnonKey
  });
}

const supabaseAnonKey = (rawAnonKey || 'placeholder').trim();
const supabaseUrl = extractSupabaseUrl(rawUrl, supabaseAnonKey);

export let isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder';

export const checkSupabaseConnection = async () => {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { 'apiKey': supabaseAnonKey }
    });
    return res.ok;
  } catch (e) {
    console.error('Supabase Health Check Failed:', e);
    return false;
  }
};

// Log seguro para diagnóstico
if (typeof window !== 'undefined') {
  let maskedUrl = supabaseUrl;
  try {
    const urlObj = new URL(supabaseUrl);
    maskedUrl = `${urlObj.protocol}//***${urlObj.hostname.slice(-12)}`;
  } catch (e) {
    maskedUrl = 'Invalid URL';
  }
  
  console.log('Supabase Connection Status:', { 
    url: maskedUrl, 
    configured: isSupabaseConfigured,
    timestamp: new Date().toISOString()
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
