// In-memory store. Resets on server restart. Good enough for a demo.

type Catch = {
  username: string;
  emoji: string;
  landmarkId: string;
  points: number;
  caughtAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __snapscapeStore: { catches: Catch[] } | undefined;
}

const store =
  globalThis.__snapscapeStore ??
  (globalThis.__snapscapeStore = { catches: [] });

export function recordCatch(c: Catch) {
  store.catches.push(c);
}

export function getCatchesFor(username: string): Catch[] {
  return store.catches.filter((c) => c.username === username);
}

export function getLeaderboard(): {
  username: string;
  emoji: string;
  points: number;
  catches: number;
}[] {
  const byUser = new Map<
    string,
    { username: string; emoji: string; points: number; catches: number }
  >();
  for (const c of store.catches) {
    const entry = byUser.get(c.username) ?? {
      username: c.username,
      emoji: c.emoji,
      points: 0,
      catches: 0,
    };
    entry.points += c.points;
    entry.catches += 1;
    entry.emoji = c.emoji;
    byUser.set(c.username, entry);
  }
  return [...byUser.values()].sort((a, b) => b.points - a.points);
}

export function hasCaught(username: string, landmarkId: string): boolean {
  return store.catches.some(
    (c) => c.username === username && c.landmarkId === landmarkId,
  );
}
