'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Clock, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PendingApprovalPage() {
  const { signOut, profile, loading } = useAuth();
  const router = useRouter();

  const isInactive = profile?.status === 'inactive';

  React.useEffect(() => {
    if (!loading && profile && profile.status === 'active') {
      router.push('/dashboard');
    }
  }, [profile, loading, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8"
      >
        <div className={cn(
          "size-24 rounded-full flex items-center justify-center mx-auto border-2",
          isInactive ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"
        )}>
          {isInactive ? (
            <ShieldAlert className="w-12 h-12 text-red-500" />
          ) : (
            <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight">
            {isInactive ? 'Conta Inativa' : 'Aguardando Aprovação'}
          </h1>
          <p className="text-slate-400 leading-relaxed">
            Olá, <span className="text-white font-bold">{profile?.full_name || 'Estudante'}</span>! 
            {isInactive 
              ? 'Sua conta está atualmente inativa. Entre em contato com a administração para mais informações.'
              : 'Seu cadastro foi realizado com sucesso, mas por medidas de segurança, sua conta precisa ser aprovada por um administrador antes de você acessar o sistema.'}
          </p>
        </div>

        {!isInactive && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-4 text-left">
              <div className="size-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm">O que acontece agora?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nossa equipe irá revisar seus dados. Assim que sua conta for aprovada, 
                  você terá acesso total à sua carteira digital e materiais.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-8 flex flex-col gap-4">
          {!isInactive && (
            <p className="text-xs text-slate-600">
              Isso geralmente leva menos de 24 horas úteis.
            </p>
          )}
          <button 
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors py-2"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </button>
        </div>
      </motion.div>
    </div>
  );
}
