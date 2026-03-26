import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Ciep - Centro Integrado de Ensino Profissionalizante',
  description: 'Sistema de gestão escolar moderno.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="font-sans bg-slate-950 text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
