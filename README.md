# CIEP - Centro Integrado de Ensino Pró

Este é o sistema de gestão escolar do CIEP, desenvolvido com Next.js e Supabase.

## Como implantar na Vercel

1. **Conecte seu repositório:** No dashboard da Vercel, importe este projeto.
2. **Configure as Variáveis de Ambiente:** No passo de configuração, adicione as seguintes variáveis (conforme listado no `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase.
   - `NEXT_PUBLIC_GOOGLE_API_KEY`: Sua chave de API do Google (para integração com Drive).
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Seu Client ID do Google.
   - `NEXT_PUBLIC_GOOGLE_APP_ID`: Seu App ID do Google.
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Sua chave de API do Gemini (opcional).
3. **Build & Install:** A Vercel detectará automaticamente o Next.js. O comando de build padrão (`npm run build`) e o diretório de saída (`.next`) funcionarão corretamente.
4. **Deploy:** Clique em "Deploy" e aguarde a finalização.

## Tecnologias Utilizadas

- **Next.js 15+** (App Router)
- **Tailwind CSS** (Estilização)
- **Framer Motion** (Animações)
- **Supabase** (Banco de Dados e Autenticação)
- **Lucide React** (Ícones)
