'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { School, BadgeCheck, Download, Share2, Verified, QrCode } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';

import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';

export default function IDCardPage() {
  const { profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header title="Carteira de Estudante" />

      <main className="flex-1 p-6 flex flex-col items-center gap-6 max-w-md mx-auto w-full">
        {/* Digital ID Card */}
        <motion.div 
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-slate-900 border border-green-500/30 rounded-2xl overflow-hidden shadow-2xl relative"
        >
          {/* Top Accent Bar */}
          <div className="h-2 bg-green-500 w-full" />
          
          <div className="p-6">
            {/* School Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <School className="text-green-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider">CiepGestão Politécnica</h3>
                <p className="text-green-500/70 text-[10px] font-bold uppercase tracking-widest">Identidade Estudantil Digital</p>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex gap-4 mb-6">
              <div className="w-28 h-36 bg-slate-800 rounded-lg overflow-hidden border-2 border-green-500/20 flex-shrink-0 relative">
                <Image 
                  src={profile?.avatar_url || `https://picsum.photos/seed/${profile?.id}/200/300`} 
                  alt={profile?.full_name || "Student ID Photo"} 
                  fill
                  className="object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="mb-2">
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Nome</p>
                  <p className="text-xl font-bold">{profile?.full_name || 'Usuário'}</p>
                </div>
                <div className="mb-2">
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Curso</p>
                  <p className="text-green-500 text-sm font-bold">{profile?.course || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Matrícula</p>
                  <p className="text-sm font-medium">{profile?.ra || '---'}</p>
                </div>
              </div>
            </div>

            {/* Footer of Card */}
            <div className="flex items-end justify-between border-t border-slate-800 pt-4">
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Validade</p>
                <p className="text-sm font-bold">31/12/2026</p>
                <div className="mt-2 flex items-center gap-1 text-green-500">
                  <Verified className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Documento Ativo</span>
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <QrCode className="w-16 h-16 text-black" />
              </div>
            </div>
          </div>

          {/* Decorative Blur */}
          <div className="absolute -bottom-10 -right-10 size-40 bg-green-500/5 rounded-full blur-3xl"></div>
        </motion.div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 mt-4">
          <button className="w-full py-4 bg-green-600 hover:bg-green-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20">
            <Download className="w-5 h-5" />
            Baixar Versão Digital
          </button>
          <button className="w-full py-4 bg-green-500/10 hover:bg-green-500/20 text-green-500 font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-green-500/30">
            <Share2 className="w-5 h-5" />
            Compartilhar Acesso
          </button>
        </div>

        <p className="text-slate-500 text-[10px] text-center px-4 font-bold uppercase tracking-widest leading-relaxed">
          Este documento é válido em todo o território nacional conforme a Lei nº 12.852/2013 e o Decreto nº 8.537/2015.
        </p>
      </main>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
