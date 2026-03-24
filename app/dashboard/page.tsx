'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Users, FileText, AlertCircle, Plus, Upload, DollarSign, Settings, ChevronRight, School, Bell, User, BookOpen, BadgeCheck, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useMounted } from '@/hooks/useMounted';

import Image from 'next/image';

export default function Dashboard() {
  const { user, profile, loading: authLoading, isAdmin } = useAuth();
  const mounted = useMounted();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<any[]>([]);
  const [activities, setActivities] = React.useState<any[]>([]);
  const router = useRouter();

  const fetchData = React.useCallback(async () => {
    console.log('Dashboard: fetchData called', { profileId: profile?.id, isAdmin });
    
    // For students, we need a profile. For admin, we can proceed even without a profile record
    // as long as the email matches.
    if (!profile && !isAdmin) {
      console.log('Dashboard: No profile and not admin, stopping fetch');
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      console.log('Dashboard: Fetching data. IsAdmin:', isAdmin);
      if (isAdmin) {
        // Fetch admin stats
        const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { count: materialCount } = await supabase.from('materials').select('*', { count: 'exact', head: true });
        const { count: pendingPayments } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        setStats([
          { label: 'TOTAL DE ALUNOS', value: studentCount || 0, trend: '+5.2%', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'MATERIAIS DISPONÍVEIS', value: materialCount || 0, trend: '+12%', icon: FileText, iconColor: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'PAGAMENTOS PENDENTES', value: pendingPayments || 0, trend: '-8%', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ]);

        const { data: activitiesData } = await supabase
          .from('activities')
          .select('*, profiles(full_name)')
          .order('created_at', { ascending: false })
          .limit(5);
        
        setActivities(activitiesData || []);
      } else {
        // Fetch student stats
        const { count: materialCount } = await supabase.from('materials').select('*', { count: 'exact', head: true });
        const { count: myPendingPayments } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('student_id', profile?.id).eq('status', 'pending');

        setStats([
          { label: 'MEUS CURSOS', value: 1, trend: 'Ativo', icon: BookOpen, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'MATERIAIS DISPONÍVEIS', value: materialCount || 0, trend: 'Novos', icon: FileText, iconColor: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'MENSALIDADES EM ABERTO', value: myPendingPayments || 0, trend: 'Pendente', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ]);

        const { data: myActivities } = await supabase
          .from('activities')
          .select('*')
          .eq('student_id', profile?.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setActivities(myActivities || []);
      }
      console.log('Dashboard: Data fetched successfully');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      console.log('Dashboard: Setting loading to false');
      setLoading(false);
    }
  }, [profile, isAdmin]);

  React.useEffect(() => {
    console.log('Dashboard: useEffect triggered', { authLoading, hasProfile: !!profile, isAdmin });
    if (!authLoading) {
      // If we have a profile OR we are an admin (by email), fetch data
      if (profile || isAdmin) {
        fetchData();
      } else {
        console.log('Dashboard: authLoading false, no profile and not admin, setting loading false');
        setLoading(false);
      }
    }
  }, [authLoading, profile, isAdmin, fetchData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const quickAccess = isAdmin ? [
    { label: 'Gerenciar Usuários', sub: 'Cadastros e matrículas', icon: Users, href: '/admin/students', color: 'bg-green-500' },
    { label: 'Upload de Materiais', sub: 'Arquivos e vídeos', icon: Upload, href: '/materials', color: 'bg-green-500' },
    { label: 'Controle Financeiro', sub: 'Mensalidades', icon: DollarSign, href: '/finance', color: 'bg-green-500' },
    { label: 'Configurações', sub: 'Ajustes do sistema', icon: Settings, href: '/admin/settings', color: 'bg-green-500' },
  ] : [
    { label: 'Meus Materiais', sub: 'Apostilas e vídeos', icon: BookOpen, href: '/materials', color: 'bg-green-500' },
    { label: 'Minha Carteira', sub: 'ID Estudantil', icon: BadgeCheck, href: '/id-card', color: 'bg-green-500' },
    { label: 'Financeiro', sub: 'Mensalidades e boletos', icon: DollarSign, href: '/finance', color: 'bg-green-500' },
    { label: 'Meu Perfil', sub: 'Dados cadastrais', icon: User, href: '/profile', color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-green-500 rounded-lg flex items-center justify-center">
            <School className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold">Ciep<span className="text-green-500">Gestão</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
            title="Sair"
          >
            <LogIn className="w-6 h-6 rotate-180" />
          </button>
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
          </button>
          <div className="size-10 rounded-full overflow-hidden border-2 border-green-500/20 relative">
            {mounted && (
              <Image 
                src={profile?.avatar_url || `https://picsum.photos/seed/${profile?.id}/100/100`} 
                alt="Profile" 
                fill
                className="object-cover" 
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
      </header>

      <main className="px-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Olá, {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}</h1>
          <p className="text-slate-400 mt-1">
            {isAdmin ? 'Bem-vindo ao seu painel de controle escolar.' : 'Bem-vindo ao seu portal do aluno.'}
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{stat.label}</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">{stat.value}</span>
                    <span className={cn("text-xs font-bold", stat.color || "text-green-500")}>{stat.trend}</span>
                  </div>
                </div>
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color || stat.iconColor || "text-white")} />
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", stat.color === 'text-red-500' ? 'bg-red-500' : 'bg-green-500')} 
                  style={{ width: '60%' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Access */}
        <section>
          <h2 className="text-xl font-bold mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 gap-4">
            {quickAccess.map((item, i) => (
              <Link 
                key={i}
                href={item.href}
                className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-900 transition-colors group"
              >
                <div className={cn("p-3 rounded-xl", item.color)}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{item.label}</h3>
                  <p className="text-xs text-slate-500">{item.sub}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-slate-800">
            <h2 className="font-bold">Atividade Recente</h2>
            <button className="text-green-500 text-xs font-bold">Ver tudo</button>
          </div>
          <div className="p-6 space-y-6">
            {activities.length > 0 ? activities.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {isAdmin 
                        ? (item.profiles?.full_name || 'Usuário') 
                        : (profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Você')}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{item.action}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">
                  {mounted ? new Date(item.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            )) : (
              <p className="text-slate-500 text-sm text-center py-4">Nenhuma atividade recente.</p>
            )}
          </div>
        </section>
      </main>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
