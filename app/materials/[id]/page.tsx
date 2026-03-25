'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { FileText, Download, CheckCircle, MessageSquare, Clock, File, PlayCircle, Eye, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useMounted } from '@/hooks/useMounted';

export default function MaterialDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const mounted = useMounted();
  const [material, setMaterial] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchMaterial = async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();

      if (!error) {
        setMaterial(data);
      }
      setLoading(false);
    };

    if (id) fetchMaterial();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Header title="Material não encontrado" />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <FileText className="w-16 h-16 text-slate-700 mb-4" />
          <p className="text-slate-400">O material solicitado não foi encontrado.</p>
          <button 
            onClick={() => router.push('/materials')}
            className="mt-6 text-green-500 font-bold"
          >
            Voltar para a lista
          </button>
        </main>
      </div>
    );
  }

  const isVideo = material.type === 'Video';
  const isPDF = material.type === 'PDF';

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // Handle Google Drive links for embedding
    if (url.includes('drive.google.com')) {
      if (url.includes('/view')) {
        return url.replace('/view', '/preview');
      }
      if (url.includes('/open?id=')) {
        return url.replace('/open?id=', '/file/d/') + '/preview';
      }
      if (!url.endsWith('/preview')) {
        return url + (url.endsWith('/') ? 'preview' : '/preview');
      }
    }
    return url;
  };

  const getDisciplineName = (key: string) => {
    const mapping: Record<string, string> = {
      motos: 'Mecânica de Motos',
      auto: 'Mecânica Automotiva',
      eletrica: 'Mecânica Elétrica',
    };
    return mapping[key] || key;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header title="Detalhes do Material" />

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          {/* Category Tag */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest">
              {material.category || 'Material Complementar'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-extrabold leading-tight">{material.title}</h1>

          {/* Author / Info */}
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full overflow-hidden border-2 border-green-500/20 relative">
              <Image 
                src="https://picsum.photos/seed/prof/100/100" 
                alt="Professor" 
                fill
                className="object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-sm font-bold">Prof. Roberto Silva</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Postado em {mounted ? new Date(material.created_at).toLocaleDateString('pt-BR') : ''} • {getDisciplineName(material.discipline) || 'Geral'}
              </p>
            </div>
          </div>

          {/* Description */}
          {material.description && (
            <div className="bg-green-500/5 rounded-2xl p-4 border border-green-500/10">
              <h3 className="text-xs font-bold text-green-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
                <MessageSquare className="w-4 h-4" /> Nota do Professor
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                {material.description}
              </p>
            </div>
          )}

          {/* PDF Viewer / Video Preview / Link Card */}
          {(isPDF || isVideo) && material.file_url && material.file_url.includes('drive.google.com') ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Eye className="w-4 h-4" /> {isVideo ? 'Visualização do Vídeo' : 'Visualização do PDF'}
                </h3>
                <button 
                  onClick={() => window.open(material.file_url, '_blank')}
                  className="text-[10px] font-bold text-green-500 uppercase hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Abrir em nova aba
                </button>
              </div>
              <div 
                onClick={() => setIsViewerOpen(true)}
                className="relative aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-2xl cursor-pointer group"
              >
                <iframe 
                  src={getEmbedUrl(material.file_url)} 
                  className="w-full h-full border-none pointer-events-none"
                  allow="autoplay; encrypted-media"
                ></iframe>
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Ver em Tela Cheia
                  </div>
                </div>
              </div>
            </div>
          ) : isPDF && material.file_url ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Visualização do PDF
                </h3>
                <button 
                  onClick={() => window.open(material.file_url, '_blank')}
                  className="text-[10px] font-bold text-green-500 uppercase hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Abrir em nova aba
                </button>
              </div>
              <div 
                onClick={() => setIsViewerOpen(true)}
                className="relative aspect-[3/4] w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-2xl cursor-pointer group"
              >
                <iframe 
                  src={getEmbedUrl(material.file_url)} 
                  className="w-full h-full border-none pointer-events-none"
                  allow="autoplay"
                ></iframe>
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Ver em Tela Cheia
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => material.file_url && window.open(material.file_url, '_blank')}
              className="relative aspect-[3/4] w-full rounded-2xl bg-slate-900 overflow-hidden border-2 border-dashed border-green-500/20 group cursor-pointer hover:border-green-500 transition-all"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="size-24 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {isVideo ? (
                    <PlayCircle className="w-12 h-12 text-green-500" />
                  ) : (
                    <FileText className="w-12 h-12 text-green-500" />
                  )}
                </div>
                <p className="text-lg font-bold mb-1 truncate w-full px-4">{material.title}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  {isVideo ? 'Clique para assistir no Drive' : 'Clique para abrir o arquivo'}
                </p>
              </div>
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => material.file_url && window.open(material.file_url, '_blank')}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
            >
              <Download className="w-5 h-5" /> {isVideo ? 'Assistir Vídeo' : 'Baixar Material'}
            </button>
            <button className="w-full bg-slate-900 border-2 border-green-500/30 hover:border-green-500 text-green-500 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
              <CheckCircle className="w-5 h-5" /> Marcar como lido
            </button>
          </div>
        </div>
      </main>

      <BottomNav />

      {/* Full Screen Viewer Modal */}
      <AnimatePresence>
        {isViewerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col"
          >
            <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setIsViewerOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="min-w-0">
                  <h2 className="font-bold truncate text-sm">{material.title}</h2>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    {getDisciplineName(material.discipline)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.open(material.file_url, '_blank')}
                  className="p-2 text-green-500 hover:bg-green-500/10 rounded-full transition-colors"
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </header>
            
            <main className="flex-1 bg-slate-950 relative overflow-hidden">
              <iframe 
                src={getEmbedUrl(material.file_url)} 
                className="w-full h-full border-none"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            </main>

            <footer className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
              <button 
                onClick={() => window.open(material.file_url, '_blank')}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> Baixar Arquivo
              </button>
              <button 
                onClick={() => setIsViewerOpen(false)}
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
