"use client";

import { useEffect, useState } from "react";
import type { Landmark } from "@/lib/landmarks";
import { Onboarding } from "./Onboarding";
import { LandmarkList } from "./LandmarkList";
import { Leaderboard } from "./Leaderboard";
import { CatchFlow } from "./CatchFlow";

type User = { username: string; emoji: string };

export function Home({ landmarks }: { landmarks: Landmark[] }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeLandmark, setActiveLandmark] = useState<Landmark | null>(null);
  const [myCatches, setMyCatches] = useState<string[]>([]);
  const [tab, setTab] = useState<"map" | "leaderboard">("map");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem("snapscape:user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/leaderboard?username=${encodeURIComponent(user.username)}`)
      .then((r) => r.json())
      .then((d) => setMyCatches(d.myCatches ?? []))
      .catch(() => {});
  }, [user, refreshKey]);

  if (!user) {
    return (
      <Onboarding
        onSubmit={(u) => {
          localStorage.setItem("snapscape:user", JSON.stringify(u));
          setUser(u);
        }}
      />
    );
  }

  if (activeLandmark) {
    return (
      <CatchFlow
        landmark={activeLandmark}
        user={user}
        onClose={(caught) => {
          setActiveLandmark(null);
          if (caught) setRefreshKey((k) => k + 1);
        }}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-5 py-4 backdrop-blur">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Snapscape
          </div>
          <div className="text-lg font-bold">Catch Lisbon</div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">
          <span className="text-xl leading-none">{user.emoji}</span>
          <span className="text-sm font-medium">{user.username}</span>
        </div>
      </header>

      <div className="flex border-b border-zinc-800 px-5 text-sm">
        {(["map", "leaderboard"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-3 font-medium transition ${
              tab === t
                ? "border-lime-400 text-lime-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "map" ? "Spots" : "Leaderboard"}
          </button>
        ))}
      </div>

      <div className="flex-1 px-5 pb-24 pt-4">
        {tab === "map" ? (
          <LandmarkList
            landmarks={landmarks}
            myCatches={myCatches}
            onPick={setActiveLandmark}
          />
        ) : (
          <Leaderboard refreshKey={refreshKey} currentUser={user.username} />
        )}
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/90 px-5 py-3 text-center text-xs text-zinc-500 backdrop-blur">
        {myCatches.length} of {landmarks.length} caught · tap a spot to catch it
      </footer>
    </main>
  );
}
