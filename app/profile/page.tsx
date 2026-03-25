'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { User, ChevronRight, Settings, Bell, Lock, CreditCard, BookOpen, LogOut, Edit2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useMounted } from '@/hooks/useMounted';
import Image from 'next/image';
import { Toast } from '@/components/Toast';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, isAdmin } = useAuth();
  const mounted = useMounted();
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Check file size (limit to 1MB for base64 storage)
    if (file.size > 1024 * 1024) {
      setSuccessMessage('A imagem deve ter no máximo 1MB.');
      setShowSuccess(true);
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
        
        setSuccessMessage('Foto de perfil atualizada!');
        setShowSuccess(true);
        // Refresh page to show new image after a delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error: any) {
        setSuccessMessage('Erro ao atualizar foto: ' + error.message);
        setShowSuccess(true);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const settingsItems = [
    { label: 'Informações da Conta', icon: User, href: '#' },
    { label: 'Notificações', icon: Bell, href: '#' },
    { label: 'Privacidade e Segurança', icon: Lock, href: '#' },
    { label: 'Financeiro - Boletos', icon: CreditCard, href: '/finance' },
    { label: 'Material', icon: BookOpen, href: '/materials' },
    { label: 'Carteira de estudante', icon: CreditCard, href: '/id-card' },
    { label: 'Declaração de Matrícula', icon: FileText, href: '/profile/declaration' },
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
      <Toast 
        message={successMessage} 
        isVisible={showSuccess} 
        onClose={() => setShowSuccess(false)} 
      />
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
                {mounted && (
                  <Image 
                    src={profile?.avatar_url || `https://picsum.photos/seed/${profile?.id}/200/200`} 
                    alt={profile?.full_name || "User Profile"} 
                    fill
                    className="object-cover" 
                    referrerPolicy="no-referrer"
                  />
                )}
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
              <p className="text-green-500 font-medium">{profile?.course || (isAdmin ? 'Administrador' : 'Estudante')}</p>
            </div>
            <button 
              onClick={() => {
                setSuccessMessage('Perfil atualizado com sucesso!');
                setShowSuccess(true);
              }}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-500/20 transition-all"
            >
              Editar Perfil
            </button>
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
