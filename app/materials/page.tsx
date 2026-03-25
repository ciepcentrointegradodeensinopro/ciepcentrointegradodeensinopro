'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { FileText, Download, ChevronRight, Search, BookOpen, Clock, File, Plus, PlayCircle, Trash2, X, Eye, ExternalLink, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/Toast';
import { ConfirmationModal } from '@/components/ConfirmationModal';

import { useAuth } from '@/components/AuthProvider';
import { useMounted } from '@/hooks/useMounted';

export default function MaterialsListPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const mounted = useMounted();
  const [materials, setMaterials] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedMaterial, setSelectedMaterial] = React.useState<any>(null);
  const [materialToDelete, setMaterialToDelete] = React.useState<any>(null);
  const [toast, setToast] = React.useState<{ message: string; isVisible: boolean; type: 'success' | 'error' }>({
    message: '',
    isVisible: false,
    type: 'success'
  });

  const fetchMaterials = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setMaterials(data || []);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      
      if (error) throw error;
      
      setMaterials(materials.filter(m => m.id !== id));
      setToast({ message: 'Material excluído com sucesso!', isVisible: true, type: 'success' });
    } catch (error: any) {
      console.error('Error deleting material:', error);
      setToast({ message: 'Erro ao excluir material: ' + (error.message || 'Erro desconhecido'), isVisible: true, type: 'error' });
    } finally {
      setMaterialToDelete(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'PDF': return { icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10' };
      case 'VIDEO': return { icon: PlayCircle, color: 'text-green-500', bg: 'bg-green-500/10' };
      case 'WORD': return { icon: File, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'ZIP': return { icon: BookOpen, color: 'text-slate-500', bg: 'bg-slate-500/10' };
      default: return { icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' };
    }
  };

  const getDisciplineName = (key: string) => {
    const mapping: Record<string, string> = {
      motos: 'Mecânica de Motos',
      auto: 'Mecânica Automotiva',
      eletrica: 'Mecânica Elétrica',
    };
    return mapping[key] || key;
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      if (url.includes('/view')) return url.replace('/view', '/preview');
      if (url.includes('/open?id=')) return url.replace('/open?id=', '/file/d/') + '/preview';
      if (!url.endsWith('/preview')) return url + (url.endsWith('/') ? 'preview' : '/preview');
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-800 transition-colors">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Materiais de Estudo</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link 
                href="/materials/upload"
                className="p-2 text-green-500 hover:bg-green-500/10 rounded-full transition-colors"
                title="Upload"
              >
                <Plus className="w-6 h-6" />
              </Link>
            )}
            <button className="p-2 rounded-full hover:bg-slate-800 transition-colors">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          <section>
            <h2 className="text-lg font-bold mb-4 px-2">Materiais Disponíveis</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : materials.length > 0 ? (
              <div className="space-y-3">
                {materials.map((item, i) => {
                  const style = getIcon(item.type);
                  return (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:bg-slate-900 transition-colors"
                    >
                      <Link href={`/materials/${item.id}`} className="flex items-center gap-4 flex-1">
                        <div className={cn("size-12 rounded-xl flex items-center justify-center", style.bg)}>
                          <style.icon className={cn("w-6 h-6", style.color)} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold truncate">{item.title}</h3>
                          <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">{getDisciplineName(item.discipline)}</p>
                          <p className="text-xs text-slate-500">{item.type} • {mounted ? new Date(item.created_at).toLocaleDateString('pt-BR') : ''}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setMaterialToDelete(item);
                            }}
                            className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (item.file_url) {
                              setSelectedMaterial(item);
                            } else {
                              setToast({ message: 'Link não disponível para este material.', isVisible: true, type: 'error' });
                            }
                          }}
                          className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95"
                        >
                          Visualizar
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-12">Nenhum material disponível.</p>
            )}
          </section>
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
        isOpen={!!materialToDelete}
        onClose={() => setMaterialToDelete(null)}
        onConfirm={() => handleDelete(materialToDelete.id)}
        title="Excluir Material?"
        description={`Tem certeza que deseja excluir o material "${materialToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, Excluir"
        type="danger"
      />

      {/* Viewer Modal */}
      <AnimatePresence>
        {selectedMaterial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col"
          >
            <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setSelectedMaterial(null)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="min-w-0">
                  <h2 className="font-bold truncate text-sm">{selectedMaterial.title}</h2>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    {getDisciplineName(selectedMaterial.discipline)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.open(selectedMaterial.file_url, '_blank')}
                  className="p-2 text-green-500 hover:bg-green-500/10 rounded-full transition-colors"
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </header>
            
            <main className="flex-1 bg-slate-950 relative overflow-hidden">
              {selectedMaterial.file_url ? (
                <iframe 
                  src={getEmbedUrl(selectedMaterial.file_url)} 
                  className="w-full h-full border-none"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <FileText className="w-16 h-16 mb-4 opacity-20" />
                  <p>Visualização não disponível</p>
                </div>
              )}
            </main>

            <footer className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
              <button 
                onClick={() => window.open(selectedMaterial.file_url, '_blank')}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> Baixar Arquivo
              </button>
              <button 
                onClick={() => setSelectedMaterial(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm"
              >
                Fechar
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
