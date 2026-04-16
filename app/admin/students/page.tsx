'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { syncUsersAction } from '@/app/actions/admin';
import { ArrowLeft, Search, Plus, Eye, Edit2, Trash2, Shield, UserCheck, RefreshCw, AlertCircle, Users } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/Toast';
import { ConfirmationModal } from '@/components/ConfirmationModal';

import { useAuth } from '@/components/AuthProvider';
import { useMounted } from '@/hooks/useMounted';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import Image from 'next/image';

function StudentsContent() {
  const router = useRouter();
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
  const mounted = useMounted();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState(searchParams.get('filter') || 'Todos');
  const [userToDelete, setUserToDelete] = React.useState<any>(null);
  const [userToApprove, setUserToApprove] = React.useState<any>(null);
  const [roleToToggle, setRoleToToggle] = React.useState<{ id: string; currentRole: string; fullName: string } | null>(null);
  const [toast, setToast] = React.useState<{ message: string; isVisible: boolean; type: 'success' | 'error' }>({
    message: '',
    isVisible: false,
    type: 'success'
  });

  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncUsersAction();
      if (result.success) {
        setToast({ message: `Sincronização concluída! ${result.count} usuários verificados.`, isVisible: true, type: 'success' });
        fetchUsers();
      } else {
        setToast({ message: `Erro na sincronização: ${result.error}`, isVisible: true, type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: `Exceção na sincronização: ${err.message}`, isVisible: true, type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('StudentsPage: Fetching users...');
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (supabaseError) {
        console.error('StudentsPage: Error fetching users:', supabaseError);
        setError(supabaseError.message);
        setToast({ 
          message: `Erro ao carregar usuários: ${supabaseError.message}`, 
          isVisible: true, 
          type: 'error' 
        });
      } else {
        console.log('StudentsPage: Users fetched successfully', data?.length || 0, 'users found');
        setUsers(data || []);
      }
    } catch (err: any) {
      console.error('StudentsPage: Exception fetching users:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => {
    const fullName = user.full_name || '';
    const course = user.course || '';
    const email = user.email || '';
    const searchLower = search.toLowerCase();

    const matchesSearch = fullName.toLowerCase().includes(searchLower) || 
                          course.toLowerCase().includes(searchLower) ||
                          email.toLowerCase().includes(searchLower);
    
    if (filter === 'Todos') return matchesSearch;
    if (filter === 'Alunos') return matchesSearch && user.role === 'student';
    if (filter === 'Admins') return matchesSearch && user.role === 'admin';
    if (filter === 'Ativos') return matchesSearch && user.status === 'active';
    if (filter === 'Pendentes') return matchesSearch && user.status === 'pending';
    if (filter === 'Inativos') return matchesSearch && user.status === 'inactive';
    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      setToast({ message: 'Erro ao excluir usuário', isVisible: true, type: 'error' });
    } else {
      setToast({ message: 'Usuário excluído com sucesso!', isVisible: true, type: 'success' });
      setUsers(users.filter(u => u.id !== id));
    }
    setUserToDelete(null);
  };

  const toggleRole = async (id: string, currentRole: string) => {
    const isSelf = currentUser?.id === users.find(u => u.id === id)?.user_id;
    
    if (isSelf) {
      setToast({ message: 'Você não pode alterar seu próprio cargo.', isVisible: true, type: 'error' });
      return;
    }

    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    console.log(`StudentsPage: Changing role for profile ID ${id} from ${currentRole} to ${newRole}`);
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('StudentsPage: Error updating role', error);
      setToast({ message: `Erro ao alterar cargo: ${error.message}`, isVisible: true, type: 'error' });
    } else {
      console.log('StudentsPage: Role updated successfully', data);
      setToast({ message: 'Cargo alterado com sucesso!', isVisible: true, type: 'success' });
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    }
    setRoleToToggle(null);
  };

  const approveUser = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', id);
    
    if (error) {
      setToast({ message: 'Erro ao aprovar usuário', isVisible: true, type: 'error' });
    } else {
      setToast({ message: 'Usuário aprovado com sucesso!', isVisible: true, type: 'success' });
      setUsers(users.map(u => u.id === id ? { ...u, status: 'active' } : u));
    }
    setUserToApprove(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <Toast 
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Gerenciar Usuários</h1>
                {!loading && (
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {users.length} usuários no total
                  </p>
                )}
              </div>
            </div>
            <Link 
              href="/admin/students/add"
              className="bg-green-500 hover:bg-green-400 text-white flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-green-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Usuário</span>
            </Link>
          </div>

            <div className="flex flex-col gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-500 transition-colors w-5 h-5" />
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou curso..."
                  className="w-full bg-slate-900 border-none rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-green-500/50 text-base outline-none"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {['Todos', 'Alunos', 'Admins', 'Ativos', 'Pendentes', 'Inativos'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                      filter === f ? "bg-green-500 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-3">
        {error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center space-y-4">
            <div className="size-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-red-500 font-bold uppercase tracking-widest text-[10px]">Erro Crítico</h3>
              <p className="text-slate-300 text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={() => fetchUsers()}
              className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm"
            >
              Tentar novamente
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredUsers.length > 0 ? filteredUsers.map((user, i) => (
          <motion.div 
            key={user.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 w-14 h-14">
                {mounted && (
                  <Image 
                    src={user.avatar_url || `https://picsum.photos/seed/${user.id}/100/100`} 
                    alt={user.full_name || "User Avatar"} 
                    fill
                    className="rounded-full bg-slate-800 object-cover" 
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className={cn(
                  "absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-slate-900 rounded-full",
                  user.status === 'active' ? "bg-green-500" : user.status === 'pending' ? "bg-amber-500" : "bg-slate-500"
                )}></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base truncate">{user.full_name}</h3>
                  {user.role === 'admin' && (
                    <Shield className="w-3 h-3 text-purple-500" />
                  )}
                </div>
                <p className="text-slate-400 text-xs truncate">{user.email}</p>
                <p className="text-slate-500 text-[10px] truncate">{user.course || 'Sem curso'}</p>
                <div className="mt-1 flex gap-2">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    user.status === 'active' ? "bg-green-500/10 text-green-500" : user.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {user.status === 'active' ? 'Ativo' : user.status === 'pending' ? 'Pendente' : 'Inativo'}
                  </span>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    user.role === 'admin' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {user.role === 'admin' ? 'Admin' : 'Aluno'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.status === 'pending' && (
                  <button 
                    onClick={() => setUserToApprove(user)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider border border-amber-500/20"
                    title="Aprovar Usuário"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Aprovar
                  </button>
                )}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setRoleToToggle({ id: user.id, currentRole: user.role, fullName: user.full_name })}
                    className="p-2 text-slate-500 hover:text-purple-500 transition-colors"
                    title="Alterar Cargo"
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setUserToDelete(user)}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="bg-slate-900/30 border border-slate-800/50 p-12 rounded-2xl text-center space-y-4">
            <div className="size-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-slate-200 font-bold capitalize">Nenhum aluno encontrado</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-[200px] mx-auto">
                Se você sabe que existem usuários criados, eles podem estar fora de sincronia com a lista de alunos.
              </p>
            </div>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-xl font-bold text-xs transition-all mx-auto border border-green-500/20 disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
              {isSyncing ? "Sincronizando..." : "Sincronizar Banco de Dados"}
            </button>
          </div>
        )}
      </main>

      <Link 
        href="/admin/students/add"
        className="fixed bottom-24 right-6 sm:hidden w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/40 active:scale-95 transition-transform z-20"
      >
        <Plus className="w-8 h-8" />
      </Link>

      <BottomNav isAdmin={isAdmin} />

      <ConfirmationModal 
        isOpen={!!userToApprove}
        onClose={() => setUserToApprove(null)}
        onConfirm={() => approveUser(userToApprove.id)}
        title="Aprovar Usuário?"
        description={`Deseja aprovar o cadastro de "${userToApprove?.full_name}"? O aluno terá acesso imediato ao sistema.`}
        confirmLabel="Sim, Aprovar"
        type="success"
      />

      <ConfirmationModal 
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => handleDelete(userToDelete.id)}
        title="Excluir Usuário?"
        description={`Tem certeza que deseja excluir o usuário "${userToDelete?.full_name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, Excluir"
        type="danger"
      />

      <ConfirmationModal 
        isOpen={!!roleToToggle}
        onClose={() => setRoleToToggle(null)}
        onConfirm={() => toggleRole(roleToToggle!.id, roleToToggle!.currentRole)}
        title="Alterar Cargo?"
        description={`Deseja alterar o cargo de "${roleToToggle?.fullName}" para ${roleToToggle?.currentRole === 'admin' ? 'Aluno' : 'Administrador'}?`}
        confirmLabel="Confirmar Alteração"
        type="warning"
      />
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={null}>
      <StudentsContent />
    </Suspense>
  );
}
