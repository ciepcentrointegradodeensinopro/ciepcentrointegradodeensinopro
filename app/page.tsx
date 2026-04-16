'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Lock, LogIn, HelpCircle, Info, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';

export default function LoginPage() {
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<React.ReactNode>(null);
  const router = useRouter();

  React.useEffect(() => {
    console.log('LoginPage: Auth State Check', { 
      hasUser: !!user, 
      authLoading, 
      hasProfile: !!profile, 
      status: profile?.status,
      isAdmin 
    });

    if (!authLoading && user) {
      if (isAdmin || profile?.status === 'active') {
        console.log('LoginPage: Redirecting to dashboard');
        router.push('/dashboard');
      } else if (profile?.status === 'pending' || profile?.status === 'inactive') {
        console.log('LoginPage: Redirecting to pending approval');
        router.push('/pending-approval');
      }
    }
  }, [user, authLoading, profile, isAdmin, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-6"></div>
        <p className="text-slate-400 text-sm font-medium animate-pulse">Verificando acesso...</p>
        <button 
          onClick={() => {
            // This is a hack to force loading false if AuthProvider is stuck
            // We can't directly set AuthProvider's state, but we can try to reload
            window.location.reload();
          }}
          className="mt-8 text-xs text-slate-600 hover:text-slate-400 underline transition-colors"
        >
          Demorando muito? Clique aqui para recarregar
        </button>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('LoginPage: Attempting login for', email);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('LoginPage: Auth error', authError);
        if (authError.message.includes('Email not confirmed')) {
          setError(
            <div className="flex flex-col gap-1">
              <span>E-mail não confirmado.</span>
              <Link href={`/verify?email=${email}`} className="underline font-bold text-xs uppercase tracking-wider">
                Verificar conta agora
              </Link>
            </div>
          );
          return;
        }
        throw authError;
      }

      // After login, AuthProvider will catch the session change and handle redirects
      // We don't push to dashboard here to avoid bypassing the status check
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
          <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="size-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Sistema de Segurança v2.1</span>
          </div>
        </div>

        {user && (
          <div className="mx-6 mt-4 p-4 bg-blue-500/10 border border-blue-500/50 rounded-xl text-blue-400 text-xs font-medium flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span>Usuário detectado: {user.email}</span>
              <button onClick={() => signOut()} className="text-blue-500 underline">Sair</button>
            </div>
            {isAdmin ? (
              <div className="text-green-500 font-bold">Acesso Administrativo Identificado. Redirecionando...</div>
            ) : (
              <div>Status: {profile?.status || 'Carregando perfil...'}</div>
            )}
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg font-bold"
            >
              Forçar Entrada no Dashboard
            </button>
          </div>
        )}

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

          <div className="text-center mt-4 flex flex-col gap-2">
            <p className="text-slate-400 text-sm">
              Novo por aqui? 
              <Link href="/register" className="text-green-500 font-semibold hover:underline ml-1">Cadastre-se</Link>
            </p>
            <Link href="/verify" className="text-slate-500 text-xs hover:text-green-500 transition-colors">Já tem um código? Verifique sua conta</Link>
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
