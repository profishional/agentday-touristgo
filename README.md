# Snapscape

**Pokémon Go for tourists.** Catch real-world scenic spots by photo, verified by a vision agent. Climb a global leaderboard. Get personalized Viator tours suggested for the spots you've collected.

Built for [Agents Day Lisbon](https://luma.com/agentsdaylisbon) — Viator Partner API prize track.

## 🎥 Demo

Live catch at the **Beato Innovation District (Unicorn Factory)** in Lisbon — onboarding → camera → streamed vision verification → ✓ catch + Viator drop.

<video src="https://github.com/profishional/agentday-touristgo/raw/main/docs/media/demo.mp4" controls width="320"></video>

▶ [Open demo video directly](docs/media/demo.mp4) (if it doesn't render inline above)

## How it works

1. Open the mobile web app, pick a username + emoji.
2. Walk to a Lisbon scenic spot.
3. Snap a photo of the landmark.
4. A vision agent checks **both** the photo (right landmark?) **and** your GPS (within 100m?). You can't cheat from your couch.
5. Catch granted → points awarded → real Viator tours that pass through that spot appear as suggestions.
6. Climb the global leaderboard, projected at the venue.

## Stack

- Next.js (App Router) on Vercel — mobile web, no install
- Claude Sonnet 4.6 vision for streamed landmark verification
- Viator Partner API for tour drops
- Vercel Postgres for users, catches, and leaderboard

## Status

🚧 In development for Agents Day Lisbon (May 2026).

See [`docs/superpowers/specs/2026-05-01-snapscape-design.md`](docs/superpowers/specs/2026-05-01-snapscape-design.md) for the full design spec.
