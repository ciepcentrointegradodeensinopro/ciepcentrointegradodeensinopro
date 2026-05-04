export async function GET() {
  const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!adminUrl || !serviceRoleKey) {
    return Response.json({ error: 'Faltam chaves de ambiente' }, { status: 500 });
  }

  // Fazendo as requisições puras de REST para não depender do client que pode falhar
  try {
    // 1. Criar o bucket
    const createBucketRes = await fetch(`${adminUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 'materials',
        name: 'materials',
        public: true
      })
    });
    
    const bucketText = await createBucketRes.text();

    // 2. Criar a policy de RLS para o auth (usando query REST na API pg do Supabase)
    // Para simplificar, como temos acesso Admin, vamos alterar o código e mandar o upload direto via Action no Servidor!

    return Response.json({ 
      success: true, 
      bucket: bucketText 
    });

  } catch (e: any) {
    return Response.json({ error: e.message });
  }
}
