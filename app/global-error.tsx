'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
          <h2 className="text-4xl font-bold mb-4">Erro Crítico!</h2>
          <p className="text-slate-400 mb-8">Ocorreu um erro inesperado na aplicação.</p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
