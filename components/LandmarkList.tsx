"use client";

import type { Landmark } from "@/lib/landmarks";

const RARITY_STYLES: Record<Landmark["rarity"], string> = {
  common: "border-zinc-700 text-zinc-300",
  rare: "border-sky-500/50 text-sky-300",
  legendary: "border-amber-400/60 text-amber-300",
};

export function LandmarkList({
  landmarks,
  myCatches,
  onPick,
}: {
  landmarks: Landmark[];
  myCatches: string[];
  onPick: (l: Landmark) => void;
}) {
  return (
    <div className="space-y-3">
      {landmarks.map((l) => {
        const caught = myCatches.includes(l.id);
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => !caught && onPick(l)}
            disabled={caught}
            className={`flex w-full items-center gap-4 rounded-2xl border bg-zinc-900/60 p-4 text-left transition ${
              caught
                ? "border-lime-400/40 opacity-70"
                : "border-zinc-800 hover:border-zinc-600"
            }`}
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border text-3xl ${RARITY_STYLES[l.rarity]} bg-zinc-950`}
            >
              {l.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold">{l.name}</h3>
                {caught && (
                  <span className="rounded bg-lime-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime-400">
                    Caught
                  </span>
                )}
              </div>
              <p className="line-clamp-1 text-sm text-zinc-400">
                {l.description}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span
                  className={`rounded-full border px-1.5 py-0.5 font-medium uppercase tracking-wider ${RARITY_STYLES[l.rarity]}`}
                >
                  {l.rarity}
                </span>
                <span className="text-zinc-500">{l.points} pts</span>
              </div>
            </div>
            {!caught && (
              <div className="text-zinc-500">→</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
