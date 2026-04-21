import { cookies } from 'next/headers';
import { getSessions } from '@/lib/sessions-store';
import PianoTracker from '@/components/PianoTracker';

export default function Home() {
  const cookieStore = cookies();
  const initialSessions = getSessions();
  const initialTheme = (cookieStore.get('piano_theme')?.value ?? 'light') as 'light' | 'dark';

  return <PianoTracker initialSessions={initialSessions} initialTheme={initialTheme} />;
}
