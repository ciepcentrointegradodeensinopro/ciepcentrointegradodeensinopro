'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, Search, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

import { useAuth } from '@/components/AuthProvider';
import { useMounted } from '@/hooks/useMounted';

import Image from 'next/image';

export default function StudentsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const mounted = useMounted();
  const [students, setStudents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('Todos');

  const fetchStudents = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                          student.ra?.toLowerCase().includes(search.toLowerCase()) ||
                          student.course?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'Todos') return matchesSearch;
    if (filter === 'Ativos') return matchesSearch && student.status === 'active';
    if (filter === 'Inativos') return matchesSearch && student.status === 'inactive';
    if (filter === 'Pendentes') return matchesSearch && student.status === 'pending';
    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir aluno');
      } else {
        setStudents(students.filter(s => s.id !== id));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-bold tracking-tight">Gerenciar Alunos</h1>
            </div>
            <Link 
              href="/admin/students/add"
              className="bg-green-500 hover:bg-green-400 text-white flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-green-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Aluno</span>
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-500 transition-colors w-5 h-5" />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, curso ou RA..."
                className="w-full bg-slate-900 border-none rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-green-500/50 text-base outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['Todos', 'Ativos', 'Inativos', 'Pendentes'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    filter === f ? "bg-green-500 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredStudents.length > 0 ? filteredStudents.map((student, i) => (
          <motion.div 
            key={student.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 w-14 h-14">
                {mounted && (
                  <Image 
                    src={student.avatar_url || `https://picsum.photos/seed/${student.id}/100/100`} 
                    alt={student.full_name || "Student Avatar"} 
                    fill
                    className="rounded-full bg-slate-800 object-cover" 
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className={cn("absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-slate-900 rounded-full bg-green-500")}></span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate">{student.full_name}</h3>
                <p className="text-slate-400 text-sm truncate">{student.course}</p>
                <div className="mt-1">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    student.status === 'active' ? "bg-green-500/10 text-green-500" :
                    student.status === 'inactive' ? "bg-red-500/10 text-red-500" :
                    "bg-yellow-500/10 text-yellow-500"
                  )}>
                    {student.status === 'active' ? 'Ativo' : 
                     student.status === 'inactive' ? 'Inativo' : 'Pendente'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-slate-500 hover:text-green-500 transition-colors"><Eye className="w-5 h-5" /></button>
                <button className="p-2 text-slate-500 hover:text-green-500 transition-colors"><Edit2 className="w-5 h-5" /></button>
                <button 
                  onClick={() => handleDelete(student.id)}
                  className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )) : (
          <p className="text-center text-slate-500 py-12">Nenhum aluno encontrado.</p>
        )}
      </main>

      <Link 
        href="/admin/students/add"
        className="fixed bottom-24 right-6 sm:hidden w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/40 active:scale-95 transition-transform z-20"
      >
        <Plus className="w-8 h-8" />
      </Link>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
