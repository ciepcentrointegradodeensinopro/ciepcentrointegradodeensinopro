'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Settings, Users, Shield, BookOpen, Bell, LogOut, ChevronRight, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Toast } from '@/components/Toast';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [schoolName, setSchoolName] = React.useState('CiepApp • Sistema de Gestão Politécnica');

  if (!authLoading && !isAdmin) {
    router.push('/dashboard');
    return null;
  }

  const handleSave = () => {
    setLoading(true);
    // In a real app, we would save this to a settings table
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
    }, 1000);
  };

  const settingsGroups = [
    {
      title: 'Gestão de Acesso',
      items: [
        { label: 'Gerenciar Administradores', icon: Shield, href: '/admin/students?filter=Admins', color: 'text-purple-500' },
        { label: 'Permissões de Alunos', icon: Users, href: '/admin/students', color: 'text-blue-500' },
      ]
    },
    {
      title: 'Conteúdo Acadêmico',
      items: [
        { label: 'Gerenciar Disciplinas', icon: BookOpen, href: '/admin/disciplines', color: 'text-green-500' },
        { label: 'Notificações Gerais', icon: Bell, href: '#', color: 'text-yellow-500', badge: 'Em breve' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header title="Configurações do Sistema" />
      <Toast 
        message="Configurações salvas com sucesso!" 
        isVisible={showSuccess} 
        onClose={() => setShowSuccess(false)} 
      />

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-md mx-auto space-y-8">
          {/* School Identity */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Identidade da Instituição</h2>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold">Nome do Sistema</label>
                <input 
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </section>

          {/* Settings Groups */}
          {settingsGroups.map((group, i) => (
            <section key={i} className="space-y-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">{group.title}</h2>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                {group.items.map((item, j) => (
                  <button
                    key={j}
                    onClick={() => item.href !== '#' && router.push(item.href)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 hover:bg-slate-800 transition-colors text-left",
                      j !== group.items.length - 1 && "border-b border-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg bg-slate-950", item.color)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        {item.badge && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                ))}
              </div>
            </section>
          ))}

          {/* Danger Zone */}
          <section className="pt-4">
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-bold hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </button>
          </section>
        </div>
      </main>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
