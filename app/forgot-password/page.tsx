'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao enviar o e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-slate-900 shadow-2xl rounded-2xl overflow-hidden border border-slate-800 p-8"
      >
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Recuperar Senha</h1>
        </div>

        {success ? (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="size-20 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">E-mail Enviado!</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enviamos um link de recuperação para <strong>{email}</strong>. 
                Por favor, verifique sua caixa de entrada e spam.
              </p>
            </div>
            <Link 
              href="/"
              className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all"
            >
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Insira o e-mail associado à sua conta e enviaremos as instruções para redefinir sua senha.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleResetRequest} className="space-y-6">
              <div className="space-y-2">
                <label className="text-slate-300 text-sm font-semibold">E-mail Institucional</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: estudante@universidade.edu"
                    className="w-full rounded-xl text-white border border-slate-700 bg-slate-800/50 h-14 pl-12 pr-4 focus:ring-2 focus:ring-green-500/40 focus:border-green-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-green-900/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
