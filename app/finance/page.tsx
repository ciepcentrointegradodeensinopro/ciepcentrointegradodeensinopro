'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { DollarSign, FileText, Copy, CheckCircle, Clock, Filter, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import { useMounted } from '@/hooks/useMounted';

export default function FinancePage() {
  const router = useRouter();
  const { profile, isAdmin, loading: authLoading } = useAuth();
  const mounted = useMounted();
  const [payments, setPayments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalOpen, setTotalOpen] = React.useState(0);

  const fetchData = React.useCallback(async () => {
    let query = supabase.from('payments').select('*, profiles(full_name, ra)');
    
    if (!isAdmin) {
      query = query.eq('student_id', profile.id);
    }

    const { data: paymentsData, error } = await query.order('due_date', { ascending: false });

    if (!error) {
      setPayments(paymentsData || []);
      const open = (paymentsData || [])
        .filter(p => p.status === 'pending')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);
      setTotalOpen(open);
    }
    setLoading(false);
  }, [profile, isAdmin]);

  React.useEffect(() => {
    if (!authLoading && profile) {
      fetchData();
    }
  }, [authLoading, profile, fetchData]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header 
        title="Financeiro" 
        rightAction={isAdmin ? (
          <button 
            onClick={() => router.push('/finance/upload')}
            className="p-2 text-green-500 hover:bg-green-500/10 rounded-full transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        ) : null}
      />

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-md mx-auto space-y-8">
          {/* Summary Card */}
          <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">TOTAL EM ABERTO</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-500">
                R$ {totalOpen.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-500">
                ({payments.filter(p => p.status === 'pending').length} boleto{payments.filter(p => p.status === 'pending').length !== 1 ? 's' : ''} pendente{payments.filter(p => p.status === 'pending').length !== 1 ? 's' : ''})
              </span>
            </div>
          </div>

          {/* List Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-bold">Mensalidades e Boletos</h2>
              <button className="p-2 text-slate-500 hover:text-white transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((bill, i) => (
                  <motion.div 
                    key={bill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">Mensalidade - {mounted ? new Date(bill.due_date).toLocaleDateString('pt-BR', { month: 'long' }) : ''}</h3>
                        {isAdmin && (
                          <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">
                            Aluno: {bill.profiles?.full_name}
                          </p>
                        )}
                        <p className="text-xs text-slate-500">Vencimento: {mounted ? new Date(bill.due_date).toLocaleDateString('pt-BR') : ''}</p>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        bill.status === 'paid' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                      )}>
                        {bill.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">R$ {Number(bill.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <div className="flex gap-2">
                        {bill.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => bill.file_url && window.open(bill.file_url, '_blank')}
                              className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                            >
                              <FileText className="w-4 h-4" /> PDF
                            </button>
                            {bill.barcode && (
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(bill.barcode);
                                  alert('Código copiado!');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-green-400 transition-colors"
                              >
                                <Copy className="w-4 h-4" /> Copiar Código
                              </button>
                            )}
                          </>
                        ) : (
                          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors">
                            <CheckCircle className="w-4 h-4" /> Recibo
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-12">Nenhum boleto encontrado.</p>
            )}
          </section>
        </div>
      </main>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
