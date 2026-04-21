import { NextResponse } from 'next/server';
import { addSession, removeSession } from '@/lib/sessions-store';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type RouteContext = { params: { date: string } };

export async function POST(_req: Request, ctx: RouteContext) {
  const { date } = ctx.params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: 'Format invalide (YYYY-MM-DD)' }, { status: 400 });
  }
  return NextResponse.json(addSession(date));
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const { date } = ctx.params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: 'Format invalide (YYYY-MM-DD)' }, { status: 400 });
  }
  return NextResponse.json(removeSession(date));
}
