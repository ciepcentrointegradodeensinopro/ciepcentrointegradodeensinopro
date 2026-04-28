import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Página Não Encontrada</h2>
      <p className="mb-4">Não foi possível encontrar a página solicitada.</p>
      <Link href="/" className="text-blue-500 hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  );
}
