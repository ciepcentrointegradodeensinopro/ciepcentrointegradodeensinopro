import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const BOOTSTRAP_ADMIN_EMAIL = 'ciepcentrointegradodeensinopro@gmail.com';

type AdminAuthResult = { user: User } | { error: string; status: 401 | 403 };

/**
 * Verifica se a requisição carrega um Bearer token de um usuário admin.
 * Usado pelas rotas /api/system/* que executam operações privilegiadas.
 */
export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return { error: 'Unauthorized: No token provided', status: 401 };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { error: 'Unauthorized: Invalid token', status: 401 };
  }

  const { data: requesterProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const isAdmin = requesterProfile?.role === 'admin' || user.email === BOOTSTRAP_ADMIN_EMAIL;

  if (!isAdmin) {
    return { error: 'Forbidden: Admin access required', status: 403 };
  }

  return { user };
}
