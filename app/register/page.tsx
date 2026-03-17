'use client';

import React from 'react';
import Link from 'next/link';
import { User, Mail, School, Lock, LockKeyhole, Eye, EyeOff, ArrowLeft, Edit3, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useMounted } from '@/hooks/useMounted';
import Image from 'next/image';

export default function RegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const mounted = useMounted();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    ra: '',
    course: '',
    password: '',
    confirmPassword: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('A imagem deve ter no máximo 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: authData.user.id,
              full_name: formData.fullName,
              email: formData.email,
              ra: formData.ra,
              course: formData.course,
              role: 'student',
              avatar_url: avatarUrl,
            },
          ]);

        if (profileError) throw profileError;
        
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col items-center p-4">
      <header className="w-full max-w-md flex items-center justify-between py-4 mb-4">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-white">Crie sua conta</h2>
        <div className="w-10" />
      </header>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">Cadastre-se</h1>
          <p className="text-slate-400">Preencha os dados abaixo para começar sua jornada acadêmica.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleRegister}>
          {/* Photo Upload */}
          <div className="flex flex-col items-center mb-6">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group"
            >
              <div className="size-24 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center overflow-hidden relative">
                {avatarUrl ? (
                  mounted && <Image src={avatarUrl} alt="Preview" fill className="object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-600" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 p-1.5 rounded-full border-2 border-slate-950">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </button>
            <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Foto de Perfil (Opcional)</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ex: João Silva"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">E-mail Institucional</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu.email@instituicao.edu.br"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">Matrícula (RA)</label>
              <input 
                type="text"
                required
                value={formData.ra}
                onChange={(e) => setFormData({ ...formData, ra: e.target.value })}
                placeholder="0000000"
                className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white placeholder:text-slate-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">Curso</label>
              <select 
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white outline-none appearance-none"
              >
                <option value="">Selecione</option>
                <option value="Mecânica de Motos">Mecânica de Motos</option>
                <option value="Mecânica Automotiva">Mecânica Automotiva</option>
                <option value="Mecânica Elétrica">Mecânica Elétrica</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white placeholder:text-slate-500 outline-none"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">Confirmar Senha</label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400">
            Já tem uma conta? 
            <Link href="/" className="text-green-500 font-bold hover:underline ml-1">Acessar</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
