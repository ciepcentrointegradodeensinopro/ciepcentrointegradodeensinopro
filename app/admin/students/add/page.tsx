'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { User, Mail, Hash, School, Save, X, Camera, Edit3, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/Toast';

import { useAuth } from '@/components/AuthProvider';
import { useMounted } from '@/hooks/useMounted';
import Image from 'next/image';

export default function AddStudentPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading, profile } = useAuth();

  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);
  const mounted = useMounted();
  const [isActive, setIsActive] = React.useState(true);
  const [isAdminRole, setIsAdminRole] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [configReady, setConfigReady] = React.useState<boolean | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; isVisible: boolean; type: 'success' | 'error' }>({
    message: '',
    isVisible: false,
    type: 'success'
  });
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch('/api/admin/check-config');
        const data = await res.json();
        setConfigReady(data.configured);
      } catch (e) {
        console.error('Erro ao verificar configuração:', e);
        setConfigReady(false);
      }
    };
    checkConfig();
  }, []);

  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    password: '',
    course: '',
  });
  const [emailError, setEmailError] = React.useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setEmailError('Formato de e-mail inválido');
    } else {
      setEmailError(null);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    validateEmail(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setToast({ message: 'A imagem deve ter no máximo 1MB.', isVisible: true, type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setToast({ message: 'Por favor, insira um e-mail válido.', isVisible: true, type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Call the API route to create the user in Supabase Auth and update the profile
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: isAdminRole ? 'admin' : 'student',
          course: isAdminRole ? '' : formData.course,
          status: isActive ? 'active' : 'inactive',
          avatarUrl: avatarUrl,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        const text = await response.text();
        console.error('Resposta não-JSON recebida:', text);
        throw new Error('O servidor retornou uma resposta inválida. Verifique se a rota da API está configurada corretamente.');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar usuário');
      }

      // Log activity
      if (profile) {
        await supabase.from('activities').insert([
          {
            student_id: null, // This is an admin action
            action: `Adicionou ${isAdminRole ? 'administrador' : 'aluno'}: ${formData.fullName}`,
          }
        ]);
      }

      setShowSuccess(true);
      setToast({ message: 'Usuário cadastrado com sucesso!', isVisible: true, type: 'success' });
      setTimeout(() => {
        router.push('/admin/students');
      }, 2000);
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao salvar aluno', isVisible: true, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header title="Novo Usuário" />
      
      {configReady === false && (
        <div className="mx-4 mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-500 font-bold">
            <Lock className="w-5 h-5" />
            <span>Configuração Necessária</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            A chave <code className="bg-slate-900 px-1 rounded text-red-400">SUPABASE_SERVICE_ROLE_KEY</code> não foi encontrada. 
            Você precisa configurá-la nas <strong>Settings</strong> do AI Studio para permitir a criação de usuários com senha.
          </p>
        </div>
      )}

      <Toast 
        message={toast.message} 
        isVisible={toast.isVisible} 
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-xs text-center shadow-2xl shadow-green-500/10"
          >
            <div className="size-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sucesso!</h2>
            <p className="text-slate-400 text-sm mb-6">O usuário foi cadastrado corretamente no sistema.</p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="bg-green-500 h-full"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-bold">Redirecionando...</p>
          </motion.div>
        </motion.div>
      )}

      <main className="flex-1 overflow-y-auto pb-32">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          {/* Profile Picture Upload */}
          <div className="flex p-8 flex-col items-center">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className="size-32 rounded-full bg-slate-900 border-4 border-green-500/20 flex items-center justify-center overflow-hidden relative">
                {mounted && (
                  <Image 
                    src={avatarUrl || "https://picsum.photos/seed/upload/200/200"} 
                    alt="Profile" 
                    fill
                    className={cn("object-cover transition-opacity", !avatarUrl && "opacity-50 group-hover:opacity-30")}
                    referrerPolicy="no-referrer"
                  />
                )}
                {!avatarUrl && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full border-4 border-slate-950">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xl font-bold">Foto do Usuário</p>
              <p className="text-green-500 text-sm font-medium">Toque para carregar imagem</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="px-4 space-y-6">
            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-semibold px-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Digite o nome completo"
                  className="w-full pl-12 pr-4 h-14 rounded-xl border border-slate-800 bg-slate-900 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-semibold px-1">E-mail</label>
              <div className="relative">
                <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", emailError ? "text-red-500" : "text-slate-500")} />
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="exemplo@email.com"
                  className={cn(
                    "w-full pl-12 pr-4 h-14 rounded-xl border bg-slate-900 text-white focus:ring-2 transition-all outline-none",
                    emailError 
                      ? "border-red-500/50 focus:ring-red-500/40 focus:border-red-500" 
                      : "border-slate-800 focus:ring-green-500 focus:border-green-500"
                  )}
                />
              </div>
              {emailError && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider px-1 animate-in fade-in slide-in-from-top-1">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-semibold px-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Crie uma senha segura"
                  className="w-full pl-12 pr-12 h-14 rounded-xl border border-slate-800 bg-slate-900 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1">Mínimo de 6 caracteres</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-slate-400 text-sm font-semibold px-1">Status</label>
                <div className="flex items-center h-14 px-4 bg-slate-900 rounded-xl border border-slate-800 justify-between">
                  <span className="text-xs text-slate-400">{isActive ? 'Ativo' : 'Inativo'}</span>
                  <button 
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={cn(
                      "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                      isActive ? "bg-green-500" : "bg-slate-700"
                    )}
                  >
                    <span 
                      className={cn(
                        "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                        isActive ? "translate-x-5" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-sm font-semibold px-1">Administrador</label>
                <div className="flex items-center h-14 px-4 bg-slate-900 rounded-xl border border-slate-800 justify-between">
                  <span className="text-xs text-slate-400">{isAdminRole ? 'Sim' : 'Não'}</span>
                  <button 
                    type="button"
                    onClick={() => setIsAdminRole(!isAdminRole)}
                    className={cn(
                      "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                      isAdminRole ? "bg-purple-500" : "bg-slate-700"
                    )}
                  >
                    <span 
                      className={cn(
                        "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                        isAdminRole ? "translate-x-5" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>

            {!isAdminRole && (
              <div className="space-y-2">
                <label className="text-slate-400 text-sm font-semibold px-1">Curso</label>
                <div className="relative">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <select 
                    required={!isAdminRole}
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full pl-12 pr-10 h-14 rounded-xl border border-slate-800 bg-slate-900 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Selecione o curso</option>
                    <option value="Mecânica de Motos">Mecânica de Motos</option>
                    <option value="Mecânica Automotiva">Mecânica Automotiva</option>
                    <option value="Mecânica Elétrica">Mecânica Elétrica</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 flex flex-col gap-3 z-50">
            <div className="max-w-md mx-auto w-full flex flex-col gap-3">
              <button 
                type="submit"
                disabled={loading || configReady === false}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Salvando...' : 'Salvar Usuário'}
              </button>
              <button 
                type="button"
                onClick={() => router.back()}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
