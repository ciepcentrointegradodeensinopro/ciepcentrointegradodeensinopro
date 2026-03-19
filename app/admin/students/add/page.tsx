'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { User, Mail, Hash, School, Save, X, Camera, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/Toast';

import { useAuth } from '@/components/AuthProvider';
import { useMounted } from '@/hooks/useMounted';
import Image from 'next/image';

export default function AddStudentPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const mounted = useMounted();
  const [isActive, setIsActive] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    ra: '',
    course: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email,
            ra: formData.ra,
            course: formData.course,
            status: isActive ? 'active' : 'inactive',
            role: 'student',
            avatar_url: avatarUrl,
          },
        ]);

      if (error) throw error;

      // Log activity
      if (profile) {
        await supabase.from('activities').insert([
          {
            student_id: null, // This is an admin action
            action: `Adicionou aluno: ${formData.fullName}`,
          }
        ]);
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push('/admin/students');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar aluno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header title="Adicionar Aluno" />
      <Toast 
        message="Aluno cadastrado com sucesso!" 
        isVisible={showSuccess} 
        onClose={() => setShowSuccess(false)} 
      />

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
              <p className="text-xl font-bold">Foto do Aluno</p>
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
                  placeholder="Digite o nome completo do aluno"
                  className="w-full pl-12 pr-4 h-14 rounded-xl border border-slate-800 bg-slate-900 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-semibold px-1">E-mail Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="exemplo@escola.com"
                  className="w-full pl-12 pr-4 h-14 rounded-xl border border-slate-800 bg-slate-900 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-slate-400 text-sm font-semibold px-1">RA (Matrícula)</label>
                <input 
                  type="text"
                  required
                  value={formData.ra}
                  onChange={(e) => setFormData({ ...formData, ra: e.target.value })}
                  placeholder="000.000"
                  className="w-full px-4 h-14 rounded-xl border border-slate-800 bg-slate-900 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-400 text-sm font-semibold px-1">Status</label>
                <div className="flex items-center h-14 px-4 bg-slate-900 rounded-xl border border-slate-800 justify-between">
                  <span className="text-sm text-slate-400">{isActive ? 'Ativo' : 'Inativo'}</span>
                  <button 
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                      isActive ? "bg-green-500" : "bg-slate-700"
                    )}
                  >
                    <span 
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        isActive ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-semibold px-1">Curso</label>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <select 
                  required
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
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 flex flex-col gap-3 z-50">
            <div className="max-w-md mx-auto w-full flex flex-col gap-3">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Salvando...' : 'Salvar Aluno'}
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
