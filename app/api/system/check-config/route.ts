import { NextResponse } from 'next/server';

export async function GET() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && serviceRoleKey);
  
  return NextResponse.json({ configured });
}
