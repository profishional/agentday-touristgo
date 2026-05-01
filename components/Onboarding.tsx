"use client";

import { useState } from "react";

const EMOJIS = ["🦁", "🐉", "🦊", "🦦", "🐙", "🦄", "🐲", "🦅", "🦋", "🐢", "🦜", "🦝"];

export function Onboarding({
  onSubmit,
}: {
  onSubmit: (u: { username: string; emoji: string }) => void;
}) {
  const [username, setUsername] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);

  const valid = username.trim().length >= 2 && username.trim().length <= 20;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6">
      <div className="w-full">
        <div className="mb-2 text-xs uppercase tracking-[0.3em] text-lime-400">
          Snapscape
        </div>
        <h1 className="mb-2 text-4xl font-bold leading-tight">
          Catch Lisbon.
        </h1>
        <p className="mb-10 text-zinc-400">
          Pokémon Go for tourists. Snap real scenic spots, climb the live leaderboard,
          unlock real Viator tours.
        </p>

        <label className="mb-2 block text-xs uppercase tracking-wider text-zinc-500">
          Pick an avatar
        </label>
        <div className="mb-6 grid grid-cols-6 gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`flex aspect-square items-center justify-center rounded-xl text-2xl transition ${
                emoji === e
                  ? "bg-lime-400/20 ring-2 ring-lime-400"
                  : "bg-zinc-900 hover:bg-zinc-800"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        <label className="mb-2 block text-xs uppercase tracking-wider text-zinc-500">
          Username
        </label>
        <input
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="lisbon_lover"
          maxLength={20}
          className="mb-6 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-lg outline-none transition focus:border-lime-400"
        />

        <button
          type="button"
          disabled={!valid}
          onClick={() => onSubmit({ username: username.trim(), emoji })}
          className="w-full rounded-xl bg-lime-400 px-6 py-4 text-lg font-bold text-zinc-950 transition disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          Start hunting →
        </button>
      </div>
    </main>
  );
}
