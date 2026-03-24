import { NextResponse } from 'next/server';

export async function GET() {
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  return NextResponse.json({ configured: hasKey });
}
