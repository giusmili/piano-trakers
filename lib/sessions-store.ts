import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR  = join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'sessions.json');

function load(): Set<string> {
  try {
    if (existsSync(DATA_FILE)) {
      return new Set(JSON.parse(readFileSync(DATA_FILE, 'utf-8')) as string[]);
    }
  } catch {}
  return new Set();
}

function persist(played: Set<string>) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify([...played].sort()), 'utf-8');
}

export function getSessions(): string[] {
  return [...load()].sort();
}

export function addSession(date: string): string[] {
  const played = load();
  played.add(date);
  persist(played);
  return [...played].sort();
}

export function removeSession(date: string): string[] {
  const played = load();
  played.delete(date);
  persist(played);
  return [...played].sort();
}
