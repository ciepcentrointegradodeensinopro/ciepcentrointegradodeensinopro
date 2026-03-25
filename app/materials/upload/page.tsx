'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { CloudUpload, FileText, BookOpen, Layers, Eye, Send, ExternalLink, Link as LinkIcon, Upload, X as CloseIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Toast } from '@/components/Toast';

// Google API Config
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_APP_ID = process.env.NEXT_PUBLIC_GOOGLE_APP_ID;

export default function UploadMaterialPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [disciplines, setDisciplines] = React.useState<any[]>([]);
  const [loadingDisciplines, setLoadingDisciplines] = React.useState(true);

  React.useEffect(() => {
    const fetchDisciplines = async () => {
      const { data, error } = await supabase
        .from('disciplines')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        setDisciplines(data);
      } else {
        // Fallback
        setDisciplines([
          { slug: 'motos', name: 'Mecânica de Motos' },
          { slug: 'auto', name: 'Mecânica Automotiva' },
          { slug: 'eletrica', name: 'Mecânica Elétrica' },
        ]);
      }
      setLoadingDisciplines(false);
    };
    fetchDisciplines();
  }, []);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; isVisible: boolean; type: 'success' | 'error' }>({
    message: '',
    isVisible: false,
    type: 'success'
  });
  const [title, setTitle] = React.useState('');
  const [discipline, setDiscipline] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [fileUrl, setFileUrl] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Google Picker Logic
  const handleGoogleDrive = () => {
    if (!GOOGLE_API_KEY || !GOOGLE_CLIENT_ID) {
      setToast({
        message: 'Configuração do Google Drive ausente. Verifique as variáveis de ambiente (NEXT_PUBLIC_GOOGLE_API_KEY e NEXT_PUBLIC_GOOGLE_CLIENT_ID).',
        isVisible: true,
        type: 'error'
      });
      return;
    }

    // Load Google API
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      const gapi = (window as any).gapi;
      const google = (window as any).google;

      gapi.load('auth2', () => {
        gapi.auth2.authorize({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          immediate: false
        }, (authResult: any) => {
          if (authResult && !authResult.error) {
            const oauthToken = authResult.access_token;
            gapi.load('picker', () => {
              const picker = new google.picker.PickerBuilder()
                .addView(google.picker.ViewId.DOCS)
                .setOAuthToken(oauthToken)
                .setDeveloperKey(GOOGLE_API_KEY)
                .setAppId(GOOGLE_APP_ID || '')
                .setCallback((data: any) => {
                  if (data.action === google.picker.Action.PICKED) {
                    const doc = data.docs[0];
                    setFileUrl(doc.url);
                    setFileName(doc.name);
                    if (!title) setTitle(doc.name);
                  }
                })
                .build();
              picker.setVisible(true);
            });
          }
        });
      });
    };
    document.body.appendChild(script);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadProgress(10);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploadProgress(30);
      const { data, error } = await supabase.storage
        .from('materials')
        .upload(filePath, file);

      if (error) throw error;

      setUploadProgress(70);
      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      setFileUrl(publicUrl);
      setFileName(file.name);
      if (!title) setTitle(file.name.split('.')[0]);
      
      setUploadProgress(100);
      setToast({
        message: 'Arquivo carregado com sucesso!',
        isVisible: true,
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setToast({
        message: 'Erro ao carregar arquivo: ' + error.message,
        isVisible: true,
        type: 'error'
      });
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleLinkChange = (url: string) => {
    const isDrive = url.includes('drive.google.com');
    const wasDrive = fileUrl.includes('drive.google.com');
    
    setFileUrl(url);
    
    // Auto-detect Google Drive links and try to guess category
    if (isDrive && !wasDrive) {
      setFileName('Link do Google Drive');
      
      // If it's a common video format or has "video" in it, auto-select category
      if (url.toLowerCase().includes('video') || url.toLowerCase().includes('mp4')) {
        if (!category) setCategory('vid');
      } else if (url.toLowerCase().includes('pdf')) {
        if (!category) setCategory('pdf');
      }

      setToast({
        message: 'Link do Google Drive reconhecido com sucesso!',
        isVisible: true,
        type: 'success'
      });
    } else if (!url) {
      setFileName('');
    }
  };

  const handlePublish = async () => {
    if (!title || !fileUrl) {
      setToast({
        message: 'Por favor, preencha o título e selecione um arquivo.',
        isVisible: true,
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('UploadMaterialPage: Publishing material...', { title, category, discipline });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const { error } = await supabase.from('materials').insert({
        title,
        discipline,
        category,
        description,
        file_url: fileUrl,
        type: category === 'vid' ? 'Video' : 'PDF',
        status: isVisible ? 'active' : 'pending'
      });

      if (error) {
        console.error('UploadMaterialPage: Insert error', error);
        throw error;
      }

      console.log('UploadMaterialPage: Success!');
      setShowSuccess(true);
      setToast({
        message: 'Material publicado com sucesso!',
        isVisible: true,
        type: 'success'
      });
      
      // Clear form
      setTitle('');
      setFileUrl('');
      setFileName('');
      setDiscipline('');
      setCategory('');
      setDescription('');

      setTimeout(() => {
        router.push('/materials');
      }, 2000);
    } catch (error: any) {
      console.error('UploadMaterialPage: Publish exception', error);
      setToast({
        message: 'Erro ao publicar: ' + (error.message || 'Erro desconhecido'),
        isVisible: true,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header title="Upload de Materiais" />
      <Toast 
        message={toast.message} 
        isVisible={toast.isVisible} 
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
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
              <BookOpen className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sucesso!</h2>
            <p className="text-slate-400 text-sm mb-6">O material foi publicado corretamente no sistema.</p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "linear" }}
                className="bg-green-500 h-full"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-bold">Redirecionando...</p>
          </motion.div>
        </motion.div>
      )}

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          {/* Upload Area */}
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-green-500/40 bg-green-500/5 hover:bg-green-500/10 transition-colors px-6 py-8 cursor-pointer group"
            >
              <div className="size-12 bg-green-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-green-500">Upload Direto</p>
                <p className="text-[10px] text-green-500/60">Do seu computador</p>
              </div>
            </div>

            <div 
              onClick={handleGoogleDrive}
              className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 transition-colors px-6 py-8 cursor-pointer group"
            >
              <div className="size-12 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <ExternalLink className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-blue-500">Google Drive</p>
                <p className="text-[10px] text-blue-500/60">Abrir seletor</p>
              </div>
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Carregando arquivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="bg-green-500 h-full"
                />
              </div>
            </div>
          )}

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <LinkIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Ou cole o link manual</span>
              </div>
              <div className="flex gap-2 relative">
                <input 
                  type="text"
                  value={fileUrl}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950 h-12 px-4 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all pr-24"
                />
                {fileUrl.includes('drive.google.com') && (
                  <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-blue-500/20 text-blue-500 text-[8px] font-bold px-2 py-1 rounded uppercase tracking-tighter">
                    Drive Link
                  </div>
                )}
                {fileUrl && (
                  <button 
                    onClick={() => { setFileUrl(''); setFileName(''); }}
                    className="bg-red-500/10 text-red-500 px-3 rounded-xl text-xs font-bold"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-500">Certifique-se de que o link esteja configurado como &quot;Qualquer pessoa com o link pode ler&quot; no Google Drive.</p>
            </div>

          {fileName && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-xl flex items-center gap-3 border transition-all",
                fileUrl.includes('drive.google.com') 
                  ? "bg-blue-500/10 border-blue-500/20" 
                  : "bg-green-500/10 border-green-500/20"
              )}
            >
              {fileUrl.includes('drive.google.com') ? (
                <ExternalLink className="w-5 h-5 text-blue-500" />
              ) : (
                <FileText className="w-5 h-5 text-green-500" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{fileName}</p>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  fileUrl.includes('drive.google.com') ? "text-blue-500/60" : "text-green-500/60"
                )}>
                  {fileUrl.includes('drive.google.com') ? 'Link do Google Drive' : 'Arquivo selecionado'}
                </p>
              </div>
              <button 
                onClick={() => { setFileName(''); setFileUrl(''); }} 
                className="text-[10px] font-bold text-red-500 uppercase hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors"
              >
                Remover
              </button>
            </motion.div>
          )}

          {/* Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Título do Material</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Apostila de Matemática - Módulo 1"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 h-14 px-4 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Disciplina</label>
                <select 
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 h-14 px-4 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                >
                  <option value="">Selecione a disciplina</option>
                  {disciplines.map(d => (
                    <option key={d.slug} value={d.slug}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Categoria</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 h-14 px-4 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                >
                  <option value="">Tipo de material</option>
                  <option value="pdf">PDF / Apostila</option>
                  <option value="exe">Exercício</option>
                  <option value="vid">Vídeo Aula</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Descrição</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve resumo sobre o conteúdo do material..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 min-h-[120px] p-4 focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-green-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Visível para Alunos</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Alunos poderão visualizar após a publicação</span>
                </div>
              </div>
              <button 
                onClick={() => setIsVisible(!isVisible)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                  isVisible ? "bg-green-500" : "bg-slate-700"
                )}
              >
                <span 
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    isVisible ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
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
                Publicar Material
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
