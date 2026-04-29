'use client';

import Link from "next/link";
import React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
      <div className="text-center space-y-6 max-w-md">
        <h2 className="text-4xl font-bold text-green-500">404</h2>
        <h3 className="text-2xl font-bold">Página Não Encontrada</h3>
        <p className="text-slate-400">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-green-900/20"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
}
