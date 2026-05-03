import { questions, type Question } from '../data/questions';
import { getHKDateString, seededRandom, dateSeed } from './dateUtils';
import {
  getSeenIds,
  addSeenId,
  clearSeenIds,
  getDailySelection,
  setDailySelection,
} from './storage';

const DAILY_COUNTS: Record<Question['category'], number> = {
  basic: 3,
  practical: 2,
  tricky: 1,
};

function pickFromCategory(
  category: Question['category'],
  count: number,
  rng: () => number,
  forceFresh = false,
): Question[] {
  const pool = questions.filter((q) => q.category === category);
  let seen = getSeenIds(category);

  let unseen = pool.filter((q) => !seen.includes(q.id));
  if (forceFresh || unseen.length < count) {
    clearSeenIds(category);
    seen = [];
    unseen = [...pool];
  }

  // Fisher-Yates shuffle using seeded RNG
  const shuffled = [...unseen];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const picked = shuffled.slice(0, count);
  picked.forEach((q) => addSeenId(category, q.id));
  return picked;
}

/** Returns today's 6 daily questions (3 basic + 2 practical + 1 tricky). */
export function getDailyQuestions(): Question[] {
  const dateKey = getHKDateString();
  const cached = getDailySelection(dateKey);
  if (cached) {
    const idSet = new Set(cached.ids);
    const ordered = cached.ids
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => q !== undefined);
    if (ordered.length === idSet.size && ordered.length === 6) {
      return ordered;
    }
  }

  const rng = seededRandom(dateSeed(dateKey));
  const selected: Question[] = [
    ...pickFromCategory('basic', DAILY_COUNTS.basic, rng),
    ...pickFromCategory('practical', DAILY_COUNTS.practical, rng),
    ...pickFromCategory('tricky', DAILY_COUNTS.tricky, rng),
  ];

  setDailySelection(dateKey, selected.map((q) => q.id));
  return selected;
}

/** Forces a new random set for today, ignoring the cached selection. */
export function regenerateDailyQuestions(): Question[] {
  const dateKey = getHKDateString();
  // Use a secondary seed derived from Date.now() so each regeneration differs
  const rng = seededRandom(dateSeed(dateKey) ^ (Date.now() >>> 0));
  const selected: Question[] = [
    ...pickFromCategory('basic', DAILY_COUNTS.basic, rng, true),
    ...pickFromCategory('practical', DAILY_COUNTS.practical, rng, true),
    ...pickFromCategory('tricky', DAILY_COUNTS.tricky, rng, true),
  ];

  setDailySelection(dateKey, selected.map((q) => q.id));
  return selected;
}
