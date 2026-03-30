'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { DollarSign, User, Calendar, Link as LinkIcon, Send, Search, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

import { Toast } from '@/components/Toast';

export default function UploadBoletoPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [students, setStudents] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null);
  const [amount, setAmount] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [fileUrl, setFileUrl] = React.useState('');
  const [barcode, setBarcode] = React.useState('');

  const [toast, setToast] = React.useState<{ message: string; isVisible: boolean; type: 'success' | 'error' }>({
    message: '',
    isVisible: false,
    type: 'success'
  });

  React.useEffect(() => {
    const fetchStudents = async () => {
      console.log('UploadBoletoPage: Fetching students...');
      
      // First, let's see if we can fetch ANY profiles to check connection and data
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('role, full_name');
      
      if (allProfilesError) {
        console.error('UploadBoletoPage: Error fetching all profiles', allProfilesError);
      } else {
        console.log('UploadBoletoPage: Total profiles found:', allProfiles?.length || 0);
        console.log('UploadBoletoPage: Roles found:', [...new Set(allProfiles?.map(p => p.role))]);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name');
      
      if (error) {
        console.error('UploadBoletoPage: Error fetching students', error);
      } else {
        console.log('UploadBoletoPage: Students with role=student fetched', data?.length || 0);
        if (data && data.length > 0) {
          console.log('UploadBoletoPage: First student:', data[0].full_name);
        }
      }
      setStudents(data || []);
    };

    if (isAdmin) {
      fetchStudents();
    } else {
      console.log('UploadBoletoPage: User is not admin, skipping fetch. isAdmin:', isAdmin);
    }
  }, [isAdmin]);

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePublish = async () => {
    if (!selectedStudent || !amount || !dueDate || !fileUrl) {
      setToast({
        message: 'Por favor, preencha todos os campos obrigatórios.',
        isVisible: true,
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('payments').insert({
        student_id: selectedStudent.id,
        amount: parseFloat(amount.replace(',', '.')),
        due_date: dueDate,
        file_url: fileUrl,
        barcode: barcode,
        status: 'pending'
      });

      if (error) throw error;

      setToast({
        message: 'Boleto cadastrado com sucesso!',
        isVisible: true,
        type: 'success'
      });
      
      setTimeout(() => {
        router.push('/finance');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      setToast({
        message: 'Erro ao cadastrar: ' + (error.message || 'Erro desconhecido'),
        isVisible: true,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (!isAdmin) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header title="Lançar Boleto" />

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          {/* Student Selection */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-300">Selecionar Aluno</label>
            
            {selectedStudent ? (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{selectedStudent.full_name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="text-[10px] font-bold text-red-500 uppercase"
                >
                  Alterar
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nome..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 h-14 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/50">
                  {filteredStudents.length > 0 ? filteredStudents.map(student => (
                    <button 
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className="w-full p-4 text-left hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0 flex items-center gap-3"
                    >
                      <Users className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-bold">{student.full_name}</p>
                      </div>
                    </button>
                  )) : (
                    <p className="p-4 text-center text-xs text-slate-500">Nenhum aluno encontrado.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Valor (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 h-14 pl-10 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Vencimento</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 h-14 pl-10 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Link do Boleto (Drive/PDF)</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="Cole o link do arquivo aqui..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 h-14 pl-10 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Código de Barras (Opcional)</label>
              <input 
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Linha digitável para copiar e colar"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 h-14 px-4 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 z-50">
        <div className="max-w-md mx-auto w-full">
          <button 
            onClick={handlePublish}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Lançar Mensalidade
              </>
            )}
          </button>
        </div>
      </footer>

      <Toast 
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
