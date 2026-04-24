import { format } from 'date-fns';

const DAILY_OPEN_KEY = 'daily-open-date';

function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Returns 'first' if this is the first app open today, 'subsequent' otherwise. Marks the day as opened. */
export function checkAndMarkDailyOpen(): 'first' | 'subsequent' {
  const today = todayStr();
  const last = localStorage.getItem(DAILY_OPEN_KEY);
  localStorage.setItem(DAILY_OPEN_KEY, today);
  return last === today ? 'subsequent' : 'first';
}
