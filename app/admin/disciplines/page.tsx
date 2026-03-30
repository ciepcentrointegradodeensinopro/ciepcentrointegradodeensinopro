'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { BookOpen, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Toast } from '@/components/Toast';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export default function DisciplinesPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);
  const [disciplines, setDisciplines] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newDiscipline, setNewDiscipline] = React.useState({ name: '', slug: '' });
  const [isAdding, setIsAdding] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [disciplineToDelete, setDisciplineToDelete] = React.useState<any>(null);
  const [toast, setToast] = React.useState<{ message: string; isVisible: boolean; type: 'success' | 'error' }>({
    message: '',
    isVisible: false,
    type: 'success'
  });

  const fetchDisciplines = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('disciplines')
      .select('*')
      .order('name', { ascending: true });

    if (!error) {
      setDisciplines(data || []);
    } else {
      // Fallback to hardcoded if table doesn't exist yet
      setDisciplines([
        { id: '1', name: 'Mecânica de Motos', slug: 'motos' },
        { id: '2', name: 'Mecânica Automotiva', slug: 'auto' },
        { id: '3', name: 'Mecânica Elétrica', slug: 'eletrica' },
      ]);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchDisciplines();
  }, [fetchDisciplines]);

  const handleAdd = async () => {
    if (!newDiscipline.name || !newDiscipline.slug) return;
    
    const { data, error } = await supabase
      .from('disciplines')
      .insert([newDiscipline])
      .select();

    if (!error) {
      setDisciplines([...disciplines, data[0]]);
      setNewDiscipline({ name: '', slug: '' });
      setIsAdding(false);
      setToast({ message: 'Disciplina adicionada com sucesso!', isVisible: true, type: 'success' });
    } else {
      setToast({ message: 'Erro ao adicionar disciplina. Verifique se a tabela "disciplines" existe no Supabase.', isVisible: true, type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('disciplines').delete().eq('id', id);
    if (!error) {
      setDisciplines(disciplines.filter(d => d.id !== id));
      setToast({ message: 'Disciplina excluída com sucesso!', isVisible: true, type: 'success' });
    } else {
      setToast({ message: 'Erro ao excluir disciplina: ' + error.message, isVisible: true, type: 'error' });
    }
    setDisciplineToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header title="Gerenciar Disciplinas" />
      <Toast 
        message="Disciplina adicionada com sucesso!" 
        isVisible={showSuccess} 
        onClose={() => setShowSuccess(false)} 
      />

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold">Disciplinas Ativas</h2>
            <button 
              onClick={() => setIsAdding(true)}
              className="p-2 bg-green-500 text-slate-950 rounded-full hover:bg-green-400 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4"
            >
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase">Nome da Disciplina</label>
                <input 
                  type="text"
                  value={newDiscipline.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
                    setNewDiscipline({ name, slug });
                  }}
                  placeholder="Ex: Mecânica de Motos"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase">Identificador (Slug)</label>
                <input 
                  type="text"
                  value={newDiscipline.slug}
                  readOnly
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleAdd}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Salvar
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-3 rounded-xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : disciplines.length > 0 ? disciplines.map((d, i) => (
              <motion.div 
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">{d.name}</h3>
                    <p className="text-xs text-slate-500">Slug: {d.slug}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDisciplineToDelete(d)}
                  className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            )) : (
              <p className="text-center text-slate-500 py-12">Nenhuma disciplina cadastrada.</p>
            )}
          </div>
        </div>
      </main>

      <BottomNav isAdmin={isAdmin} />

      <Toast 
        message={toast.message} 
        isVisible={toast.isVisible} 
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      <ConfirmationModal 
        isOpen={!!disciplineToDelete}
        onClose={() => setDisciplineToDelete(null)}
        onConfirm={() => handleDelete(disciplineToDelete.id)}
        title="Excluir Disciplina?"
        description={`Tem certeza que deseja excluir a disciplina "${disciplineToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, Excluir"
        type="danger"
      />
    </div>
  );
}
