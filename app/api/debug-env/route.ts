export async function GET() {
  return Response.json({
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'AUSENTE',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? `presente (${process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 10)}...)`
      : 'AUSENTE',
    NODE_ENV: process.env.NODE_ENV,
    todas_as_vars: Object.keys(process.env).filter(k => 
      k.includes('SUPA') || k.includes('SERVICE') || k.includes('ROLE')
    )
  });
}
