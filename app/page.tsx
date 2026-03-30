'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Lock, LogIn, HelpCircle, Info, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex items-center justify-center p-4">
      <div 
        className="w-full max-w-[480px] bg-slate-900 shadow-2xl rounded-2xl overflow-hidden border border-slate-800"
      >
        {/* Logo Section */}
        <div className="flex items-center p-6 pb-2">
          <div className="text-green-500 flex size-12 items-center justify-center rounded-xl bg-green-500/10">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-slate-100 text-xl font-bold pl-4">Ciep - Centro Integrado de Ensino Profissionalizante</h2>
        </div>

        {/* Hero Image */}
        <div className="px-6 pt-4">
          <div className="w-full h-[240px] flex items-center justify-center rounded-xl bg-slate-800/50 overflow-hidden relative">
            <Image 
              src="https://lh3.googleusercontent.com/d/1hCUwRjRdjfohV4MliKVsC8Z7Ozty2308"
              alt="Ciep Logo"
              fill
              className="object-contain p-2"
              priority
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="px-6 pt-8 pb-2 text-center">
          <h1 className="text-white text-3xl font-bold">Bem-vindo ao AVA</h1>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-4 px-6 py-6" onSubmit={handleLogin}>
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

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 text-sm font-semibold">Senha</label>
              <Link href="/forgot-password" title="Recuperar senha" className="text-green-500 text-sm font-semibold hover:underline">Esqueceu a senha?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full rounded-xl text-white border border-slate-700 bg-slate-800/50 h-14 pl-12 pr-12 focus:ring-2 focus:ring-green-500/40 focus:border-green-500 outline-none transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input type="checkbox" id="remember" className="rounded border-slate-700 text-green-500 focus:ring-green-500 w-4 h-4 bg-slate-800" />
            <label htmlFor="remember" className="text-slate-400 text-sm font-medium cursor-pointer">Manter conectado</label>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-green-900/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Acessando...' : 'Acessar'}
            <LogIn className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">OU</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          <button 
            type="button"
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="w-full bg-white text-slate-900 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 hover:bg-slate-100"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>

          <div className="text-center mt-4">
            <p className="text-slate-400 text-sm">
              Novo por aqui? 
              <Link href="/register" className="text-green-500 font-semibold hover:underline ml-1">Cadastre-se</Link>
            </p>
          </div>
        </form>

        {/* Footer Support */}
        <div className="px-6 pb-8 pt-2">
          <div className="flex items-center gap-4 py-4">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">AJUDA E SUPORTE</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 p-3 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300 text-sm font-medium">Suporte de TI</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-3 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">
              <Info className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300 text-sm font-medium">Informações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
