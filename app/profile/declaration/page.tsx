'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { FileText, Download, Printer, ChevronLeft, ShieldCheck, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useMounted } from '@/hooks/useMounted';
import { cn } from '@/lib/utils';

export default function EnrollmentDeclarationPage() {
  const { user, profile, isAdmin, loading } = useAuth();
  const mounted = useMounted();
  const [isPrinting, setIsPrinting] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col print:bg-white print:text-black">
      <div className="print:hidden">
        <Header title="Declaração de Matrícula" />
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Action Buttons - Hidden on Print */}
          <div className="flex flex-wrap gap-3 mb-8 print:hidden">
            <button 
              onClick={handlePrint}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all active:scale-95"
            >
              <Printer className="w-5 h-5" />
              Imprimir Declaração
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-5 h-5" />
              Baixar PDF
            </button>
          </div>

          {/* Declaration Document */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white text-black p-8 md:p-16 rounded-sm shadow-2xl min-h-[800px] flex flex-col print:shadow-none print:p-0 print:m-0"
            id="declaration-document"
          >
            {/* Document Header */}
            <div className="flex flex-col items-center text-center mb-12 border-b-2 border-slate-100 pb-8">
              <div className="size-20 bg-green-600 rounded-2xl flex items-center justify-center mb-4 print:bg-green-600">
                <ShieldCheck className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Ciep Centro Integrado de Ensino</h1>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Excelência em Educação Profissional</p>
            </div>

            {/* Document Title */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold uppercase underline underline-offset-8 decoration-green-600">Declaração de Matrícula</h2>
            </div>

            {/* Document Body */}
            <div className="flex-1 space-y-8 text-lg leading-relaxed text-justify">
              <p>
                Declaramos, para os devidos fins de direito, que o(a) aluno(a) 
                <span className="font-bold"> {profile?.full_name || user?.user_metadata?.full_name || '________________________________'}</span>, 
                encontra-se regularmente matriculado(a) e frequentando as aulas do curso de 
                <span className="font-bold"> {profile?.course || '________________________________'}</span> nesta instituição de ensino.
              </p>

              <p>
                Informamos ainda que o referido curso possui modalidade presencial/híbrida e o aluno mantém status de 
                <span className="font-bold uppercase text-green-700"> {profile?.status === 'active' ? 'Ativo' : 'Pendente'}</span> 
                em nossos registros acadêmicos até a presente data.
              </p>

              <p>
                Esta declaração é válida por 30 (trinta) dias a partir da data de sua emissão e destina-se a comprovação de vínculo estudantil.
              </p>
            </div>

            {/* Document Footer */}
            <div className="mt-20">
              <div className="flex flex-col items-center text-center mb-12">
                <p className="mb-12">Araruama - RJ, {formattedDate}.</p>
                
                <div className="w-64 border-t border-black pt-2">
                  <p className="font-bold text-sm uppercase">Secretaria Acadêmica</p>
                  <p className="text-xs text-slate-500">Ciep Centro Integrado de Ensino</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-100 text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>Araruama, Rio de Janeiro</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Phone className="w-3 h-3" />
                  <span>(22) 99999-9999</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Mail className="w-3 h-3" />
                  <span>contato@ciep.edu.br</span>
                </div>
              </div>
            </div>

            {/* Verification Code */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center">
              <p className="text-[8px] text-slate-400 uppercase tracking-widest">
                Código de Autenticidade: {mounted ? Math.random().toString(36).substring(2, 15).toUpperCase() : ''}-{today.getFullYear()}
              </p>
            </div>
          </motion.div>

          <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl print:hidden">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Informações Importantes
            </h3>
            <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
              <li>Esta declaração é gerada automaticamente pelo sistema.</li>
              <li>A validade do documento é de 30 dias.</li>
              <li>Para validação junto a órgãos externos, utilize o código de autenticidade no rodapé.</li>
              <li>Em caso de dúvidas, procure a secretaria da escola.</li>
            </ul>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <BottomNav isAdmin={isAdmin} />
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .min-h-screen {
            min-height: auto !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
