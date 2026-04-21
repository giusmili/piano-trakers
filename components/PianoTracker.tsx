'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Utilities ──────────────────────────────────────────────────────────────────

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin',
                'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const pad = (n: number) => String(n).padStart(2, '0');

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const DURATION = 30 * 60;

// ── API helpers ────────────────────────────────────────────────────────────────

async function apiAdd(date: string): Promise<string[]> {
  const res = await fetch(`/api/sessions/${date}`, { method: 'POST' });
  return res.json();
}

async function apiRemove(date: string): Promise<string[]> {
  const res = await fetch(`/api/sessions/${date}`, { method: 'DELETE' });
  return res.json();
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

const THEME_COOKIE = 'piano_theme';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 an

function setThemeCookie(value: 'light' | 'dark') {
  document.cookie = `${THEME_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function useTheme(initial: 'light' | 'dark') {
  const [theme, setTheme] = useState<'light' | 'dark'>(initial);

  useEffect(() => {
    // Première visite sans cookie : détection système
    const hasCookie = document.cookie.includes(THEME_COOKIE);
    if (!hasCookie) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const detected = prefersDark ? 'dark' : 'light';
      setTheme(detected);
      document.documentElement.dataset.theme = detected;
      setThemeCookie(detected);
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      setThemeCookie(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}

function useTimer(onComplete: () => void) {
  const [remaining, setRemaining] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => { if (intervalRef.current) clearInterval(intervalRef.current); };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clear();
          setRunning(false);
          setFinished(true);
          onComplete();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return clear;
  }, [running, onComplete]);

  const toggle = () => setRunning(r => !r);

  const reset = () => {
    clear();
    setRunning(false);
    setFinished(false);
    setRemaining(DURATION);
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = ((DURATION - remaining) / DURATION) * 100;
  const label = finished ? 'Terminé !' : running ? 'Pause' : remaining === DURATION ? 'Démarrer' : 'Reprendre';

  return { minutes, seconds, progress, running, finished, toggle, reset, label };
}

function useCalendar(initial: string[]) {
  const [played, setPlayed] = useState<Set<string>>(new Set(initial));
  const today = useRef(new Date());
  const todayStr = formatDate(today.current);
  const [viewYear, setViewYear] = useState(today.current.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.current.getMonth());

  const shiftMonth = (dir: number) => {
    setViewMonth(m => {
      const next = m + dir;
      if (next < 0)  { setViewYear(y => y - 1); return 11; }
      if (next > 11) { setViewYear(y => y + 1); return 0; }
      return next;
    });
  };

  const markToday = useCallback(async () => {
    if (played.has(todayStr)) return;
    const dates = await apiAdd(todayStr);
    setPlayed(new Set(dates));
  }, [played, todayStr]);

  const toggleDate = useCallback(async (date: string, isPlayed: boolean) => {
    const dates = isPlayed ? await apiRemove(date) : await apiAdd(date);
    setPlayed(new Set(dates));
  }, []);

  const streak = (() => {
    const cursor = new Date(today.current);
    let s = 0;
    while (played.has(formatDate(cursor))) { s++; cursor.setDate(cursor.getDate() - 1); }
    return s;
  })();

  const monthKey = `${viewYear}-${pad(viewMonth + 1)}`;
  const monthCount = [...played].filter(d => d.startsWith(monthKey)).length;

  return {
    played, todayStr, viewYear, viewMonth, shiftMonth,
    markToday, toggleDate,
    streak, total: played.size, monthCount,
  };
}

function useToast() {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string) => {
    setMsg(text);
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 3000);
  }, []);

  return { msg, visible, show };
}

// ── Calendar grid ──────────────────────────────────────────────────────────────

function CalendarGrid({
  year, month, played, todayStr, onToggle,
}: {
  year: number; month: number; played: Set<string>; todayStr: string;
  onToggle: (date: string, isPlayed: boolean) => void;
}) {
  const firstDay    = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date();
  const rows: React.ReactNode[] = [];

  let day = 1;
  const totalRows = Math.ceil((startOffset + daysInMonth) / 7);

  for (let row = 0; row < totalRows; row++) {
    const cells: React.ReactNode[] = [];
    for (let col = 0; col < 7; col++) {
      const idx = row * 7 + col;
      if (idx < startOffset || day > daysInMonth) {
        cells.push(<td key={col} className="empty" aria-hidden="true" />);
      } else {
        const dateStr  = `${year}-${pad(month + 1)}-${pad(day)}`;
        const cellDate = new Date(year, month, day);
        const isToday  = dateStr === todayStr;
        const isFuture = cellDate > today;
        const isPlayed = played.has(dateStr);
        const monthName = MONTHS[month];
        const d = day;

        let cls = '';
        if (isToday)  cls += ' today';
        if (isFuture) cls += ' future';
        if (isPlayed) cls += ' played';

        let ariaLabel = '';
        if (isFuture) ariaLabel = `${d} ${monthName}, à venir`;
        else if (isPlayed) ariaLabel = `${d} ${monthName}, joué — cliquer pour retirer`;
        else ariaLabel = `${d} ${monthName} — marquer comme joué`;

        cells.push(
          <td key={col} className={cls.trim()}>
            <button
              type="button"
              disabled={isFuture}
              aria-label={ariaLabel}
              onClick={isFuture ? undefined : () => onToggle(dateStr, isPlayed)}
            >
              {d}
            </button>
          </td>
        );
        day++;
      }
    }
    rows.push(<tr key={row}>{cells}</tr>);
  }

  return <>{rows}</>;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PianoTracker({
  initialSessions,
  initialTheme,
}: {
  initialSessions: string[];
  initialTheme: 'light' | 'dark';
}) {
  const { theme, toggle: toggleTheme } = useTheme(initialTheme);
  const toast = useToast();
  const calendar = useCalendar(initialSessions);

  const handleTimerComplete = useCallback(async () => {
    await calendar.markToday();
    toast.show('🎹 Bravo ! Séance complétée.');
  }, [calendar, toast]);

  const timer = useTimer(handleTimerComplete);

  return (
    <>
      <button className="theme-toggle" type="button" onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}>
        <span className="icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
        <span className="label">{theme === 'dark' ? 'Clair' : 'Sombre'}</span>
      </button>

      <div className="container">
        <header>
          <h1>Piano <em>quotidien</em></h1>
          <p>30 minutes · chaque jour</p>
        </header>

        <main>
          {/* Timer */}
          <section
            className={`timer-card${timer.running ? ' running' : ''}`}
            aria-label="Minuteur de séance"
          >
            <h2>⏱ Minuteur de séance</h2>
            <time
              className={`timer-display${timer.finished ? ' done' : ''}`}
              dateTime={`PT${timer.minutes}M${timer.seconds}S`}
              aria-live="polite"
              aria-atomic="true"
            >
              {pad(timer.minutes)}:{pad(timer.seconds)}
            </time>
            <div className="progress-bar" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${timer.progress}%` }} />
            </div>
            <div className="timer-controls">
              <button className="btn btn-primary" type="button" onClick={timer.toggle}>
                {timer.label}
              </button>
              <button className="btn btn-secondary" type="button" onClick={timer.reset}>
                Réinitialiser
              </button>
            </div>
          </section>

          {/* Stats */}
          <section aria-label="Statistiques de pratique">
            <dl className="stats-row">
              <div className="stat-item">
                <dd className="accent">{calendar.streak}</dd>
                <dt>Jours de suite</dt>
              </div>
              <div className="stat-item">
                <dd>{calendar.total}</dd>
                <dt>Séances totales</dt>
              </div>
              <div className="stat-item">
                <dd>{calendar.monthCount}</dd>
                <dt>Ce mois-ci</dt>
              </div>
            </dl>
          </section>

          {/* Calendar */}
          <section className="calendar-section" aria-label="Calendrier des séances">
            <div className="calendar-header">
              <h2>Historique</h2>
              <nav className="month-nav" aria-label="Navigation mensuelle">
                <button className="nav-btn" type="button"
                  onClick={() => calendar.shiftMonth(-1)} aria-label="Mois précédent">
                  ◂
                </button>
                <h3>{MONTHS[calendar.viewMonth]} {calendar.viewYear}</h3>
                <button className="nav-btn" type="button"
                  onClick={() => calendar.shiftMonth(1)} aria-label="Mois suivant">
                  ▸
                </button>
              </nav>
            </div>
            <table className="calendar-table" aria-label="Calendrier de pratique">
              <thead>
                <tr>
                  {['L','M','M','J','V','S','D'].map((d, i) => (
                    <th key={i} scope="col">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CalendarGrid
                  year={calendar.viewYear}
                  month={calendar.viewMonth}
                  played={calendar.played}
                  todayStr={calendar.todayStr}
                  onToggle={calendar.toggleDate}
                />
              </tbody>
            </table>
          </section>
        </main>
      </div>

      <footer className="footer">
        <p>© Giusmili product — {new Date().getFullYear()}</p>
      </footer>

      <output className={`toast${toast.visible ? ' show' : ''}`} aria-live="polite">
        {toast.msg}
      </output>
    </>
  );
}
