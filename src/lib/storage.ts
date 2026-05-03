const PREFIX = 'cap621_';

function key(name: string): string {
  return `${PREFIX}${name}`;
}

// ── Seen question IDs ─────────────────────────────────────────────────────────

export function getSeenIds(category: string): string[] {
  try {
    const raw = localStorage.getItem(key(`seen_${category}`));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addSeenId(category: string, id: string): void {
  const ids = getSeenIds(category);
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(key(`seen_${category}`), JSON.stringify(ids));
  }
}

export function clearSeenIds(category: string): void {
  localStorage.removeItem(key(`seen_${category}`));
}

// ── Daily selection cache ─────────────────────────────────────────────────────

export function getDailySelection(dateKey: string): { ids: string[] } | null {
  try {
    const raw = localStorage.getItem(key(`daily_${dateKey}`));
    return raw ? (JSON.parse(raw) as { ids: string[] }) : null;
  } catch {
    return null;
  }
}

export function setDailySelection(dateKey: string, ids: string[]): void {
  localStorage.setItem(key(`daily_${dateKey}`), JSON.stringify({ ids }));
}
