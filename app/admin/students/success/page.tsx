'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { CheckCircle2, Users, PlusCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegistrationSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header title="Cadastro Concluído" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="mb-8"
        >
          <div className="size-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/30">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Cadastro Realizado!
          </h1>
          <p className="text-slate-400 max-w-xs mx-auto">
            O novo usuário foi registrado com sucesso e já pode acessar o sistema.
          </p>
        </motion.div>

        <div className="w-full max-w-xs space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              href="/admin/students"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl border border-slate-800 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <Users className="w-5 h-5 text-blue-400" />
              Ver Lista de Alunos
            </Link>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link 
              href="/admin/students/add"
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              Cadastrar Outro
            </Link>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => router.push('/dashboard')}
            className="text-slate-500 text-sm font-medium flex items-center justify-center gap-2 mx-auto pt-4 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </motion.button>
        </div>
      </main>

      <div className="p-8 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">
          Sistema de Gestão Escolar • CIEP
        </p>
      </div>
    </div>
  );
}
