import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
      <h2 className="text-4xl font-bold mb-4">404 - Página não encontrada</h2>
      <p className="text-slate-400 mb-8">Desculpe, a página que você está procurando não existe.</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-all"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
