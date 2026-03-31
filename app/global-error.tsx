'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-white flex items-center justify-center min-h-screen font-sans">
        <div className="text-center p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Ocorreu um erro crítico</h2>
          <p className="text-slate-400 mb-8 text-sm">
            Pedimos desculpas pelo inconveniente. O sistema encontrou um problema inesperado.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-all"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
