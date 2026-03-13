'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { User, Download, School, Clock, ChevronRight, Settings, Bell, Lock, CreditCard, BookOpen, LogOut, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, isAdmin } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Check file size (limit to 1MB for base64 storage)
    if (file.size > 1024 * 1024) {
      alert('A imagem deve ter no máximo 1MB.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: base64String })
          .eq('id', profile.id);

        if (error) throw error;
        
        // Refresh page to show new image
        window.location.reload();
      } catch (error: any) {
        alert('Erro ao atualizar foto: ' + error.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const stats = [
    { label: 'Docs', value: '128', icon: Download },
    { label: 'Cursos', value: '12', icon: School },
    { label: 'Horas', value: '450', icon: Clock },
  ];

  const settingsItems = [
    { label: 'Informações da Conta', icon: User, href: '#' },
    { label: 'Notificações', icon: Bell, href: '#' },
    { label: 'Privacidade e Segurança', icon: Lock, href: '#' },
    { label: 'Financeiro - Boletos', icon: CreditCard, href: '/finance' },
    { label: 'Material', icon: BookOpen, href: '/materials' },
    { label: 'Carteira de estudante', icon: CreditCard, href: '/id-card' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <h2 className="text-lg font-bold">Perfil</h2>
        <button className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-md mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col items-center p-6 gap-6">
            <div className="relative">
              <div className="size-32 rounded-full border-4 border-green-500/20 overflow-hidden relative bg-slate-800">
                {uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : null}
                <Image 
                  src={profile?.avatar_url || `https://picsum.photos/seed/${profile?.id}/200/200`} 
                  alt={profile?.full_name || "User Profile"} 
                  fill
                  className="object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-1 right-1 bg-green-500 p-1.5 rounded-full border-4 border-slate-950 hover:bg-green-400 transition-colors disabled:opacity-50"
              >
                <Edit2 className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{profile?.full_name || 'Usuário'}</h1>
              <p className="text-green-500 font-medium">{profile?.course || (profile?.role === 'admin' ? 'Administrador' : 'Estudante')}</p>
            </div>
            <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-500/20 transition-all">
              Editar Perfil
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 px-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <stat.icon className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Settings List */}
          <div className="mt-8 px-4 space-y-6">
            <h3 className="text-lg font-bold px-2">Configurações</h3>
            <div className="space-y-1">
              {settingsItems.map((item, i) => (
                <Link 
                  key={i}
                  href={item.href}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-900 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-200">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </Link>
              ))}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-500/10 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 group-hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-200 group-hover:text-red-500">Sair</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
