/** Returns today's date as "YYYY-MM-DD" in Asia/Hong_Kong timezone. */
export function getHKDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Mulberry32 seeded PRNG. Returns a function that yields floats in [0, 1). */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Converts a "YYYY-MM-DD" string to a numeric seed. */
export function dateSeed(dateStr: string): number {
  // XOR the char codes so the seed varies meaningfully with date changes
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (Math.imul(seed, 31) + dateStr.charCodeAt(i)) >>> 0;
  }
  return seed;
}
