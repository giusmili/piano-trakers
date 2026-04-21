import { NextResponse } from 'next/server';
import { getSessions } from '@/lib/sessions-store';

export function GET() {
  return NextResponse.json(getSessions());
}
