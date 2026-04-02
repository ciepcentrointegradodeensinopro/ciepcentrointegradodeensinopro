'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { LockKeyhole, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/Toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  
  const [email, setEmail] = React.useState(initialEmail);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; isVisible: boolean; type: 'success' | 'error' }>({
    message: '',
    isVisible: false,
    type: 'success'
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, insira seu e-mail.');
      return;
    }
    
    if (code.length < 6) {
      setError('Por favor, insira o código de 6 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      });

      if (verifyError) throw verifyError;

      setSuccess(true);
      setToast({ message: 'E-mail verificado com sucesso!', isVisible: true, type: 'success' });
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Código inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Por favor, insira seu e-mail para reenviar o código.');
      return;
    }
    
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) throw resendError;
      setToast({ message: 'Código reenviado com sucesso!', isVisible: true, type: 'success' });
    } catch (err: any) {
      setError(err.message || 'Erro ao reenviar código');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="p-6 flex items-center justify-between max-w-md mx-auto w-full">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Verificação</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 p-6 flex flex-col items-center max-w-md mx-auto w-full">
        <Toast 
          message={toast.message} 
          isVisible={toast.isVisible} 
          type={toast.type}
          onClose={() => setToast({ ...toast, isVisible: false })} 
        />

        <div className="mb-8 text-center">
          <div className="size-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
            <Mail className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2">Confirme seu E-mail</h2>
          <p className="text-slate-400 text-sm">
            Insira o código de 6 dígitos enviado para o seu e-mail institucional.
          </p>
        </div>

        {error && (
          <div className="w-full mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-8 bg-green-500/10 border border-green-500/30 rounded-2xl text-center flex flex-col items-center gap-4"
          >
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <div>
              <h3 className="text-xl font-bold text-green-500">Sucesso!</h3>
              <p className="text-slate-400 text-sm mt-1">Sua conta foi verificada. Redirecionando para o login...</p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleVerify} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@instituicao.edu.br"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white placeholder:text-slate-600 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">Código de 6 dígitos</label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white text-center text-2xl tracking-[0.5em] font-bold placeholder:text-slate-800 placeholder:text-sm placeholder:tracking-normal outline-none"
                />
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Confirmar Código'}
              </button>
              
              <button 
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="w-full py-3 bg-transparent text-green-500 font-bold text-sm rounded-xl hover:bg-green-500/10 transition-all disabled:opacity-50"
              >
                Reenviar Código
              </button>
            </div>
          </form>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="text-slate-500 text-sm font-bold hover:text-green-500 transition-colors">
            Voltar para o Login
          </Link>
        </div>
      </main>
    </div>
  );
}
