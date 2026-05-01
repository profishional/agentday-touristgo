"use client";

import { useEffect, useState } from "react";

type Row = {
  username: string;
  emoji: string;
  points: number;
  catches: number;
};

export function Leaderboard({
  refreshKey,
  currentUser,
}: {
  refreshKey: number;
  currentUser: string;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setRows(d.leaderboard ?? []))
      .catch(() => setRows([]));
  }, [refreshKey]);

  if (rows === null) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shimmer h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
        Be the first to catch a landmark.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((r, i) => {
        const me = r.username === currentUser;
        return (
          <div
            key={r.username}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              me
                ? "border-lime-400/60 bg-lime-400/5"
                : "border-zinc-800 bg-zinc-900/60"
            }`}
          >
            <div className="w-7 text-right text-sm font-bold text-zinc-500">
              {i + 1}
            </div>
            <div className="text-2xl">{r.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">
                {r.username}
                {me && (
                  <span className="ml-2 rounded bg-lime-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime-400">
                    You
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-500">{r.catches} catches</div>
            </div>
            <div className="font-mono text-lg font-bold text-lime-400">
              {r.points.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
