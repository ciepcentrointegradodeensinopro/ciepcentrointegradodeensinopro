'use client';

import React from 'react';
import { CheckCircle, ArrowRight, Home, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMounted } from '@/hooks/useMounted';

export default function RegisterSuccessPage() {
  const router = useRouter();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full space-y-8"
      >
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
              className="size-24 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500/30"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
            
            {/* Decorative particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0.5],
                  x: Math.cos(i * 60 * Math.PI / 180) * 60,
                  y: Math.sin(i * 60 * Math.PI / 180) * 60
                }}
                transition={{ 
                  delay: 0.5, 
                  duration: 1, 
                  repeat: Infinity, 
                  repeatDelay: 2 
                }}
                className="absolute top-1/2 left-1/2 size-2 bg-green-500 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Cadastro Realizado!</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Sua conta foi criada com sucesso. Agora você já pode acessar todos os recursos do portal.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-left space-y-4">
          <div className="flex items-start gap-4">
            <div className="size-10 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200">Perfil Ativo</h3>
              <p className="text-sm text-slate-500">Seus dados foram processados e seu acesso está liberado.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="size-10 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
              <Home className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200">Painel de Controle</h3>
              <p className="text-sm text-slate-500">Acesse cronogramas, notas e materiais de apoio.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 pt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Ir para Meu Login
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <Link 
            href="/profile"
            className="text-slate-500 font-bold hover:text-white transition-colors"
          >
            Completar meu perfil
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
