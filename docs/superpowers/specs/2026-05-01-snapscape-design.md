# Snapscape — Design Spec

**Date:** 2026-05-01
**Event:** Agents Day Lisbon
**Prize target:** Viator Partner API — Build Next-Generation Travel Experiences
**One-liner:** Pokémon Go for tourists. Catch real-world scenic spots by photo, climb a global leaderboard, and get personalized Viator tours suggested for the spots you've collected.

---

## Why this product

The audience at Agents Day Lisbon is builders and founders who have seen every chatbot demo. To "wow" this room, the agentic capability has to do something visibly hard in the physical world. A vision agent verifying *"yes, that photo is the Belém Tower, taken from a real angle, by someone actually standing in front of it"* is concrete, tangible, and the kind of thing people screenshot.

The Viator Partner API plugs in natively: each catch unlocks 1–2 real Viator tours that pass through that landmark. The product becomes a **discovery funnel for paid experiences** — exactly the integration story the prize is asking for.

---

## Core user loop

1. Open web app on phone — no install, no signup. Pick a username + emoji avatar.
2. See a map of ~12 hand-picked Lisbon scenic spots with caught/uncaught state.
3. Walk near a spot, tap **Catch** → camera opens.
4. Snap a photo of the landmark.
5. Vision agent verifies in two streamed checks:
   - **Landmark match** (does the photo show the right thing?)
   - **GPS proximity** (is the device within 100m of the known coordinates?)
6. ✓ Catch confirmed → points awarded → leaderboard updates live → 1–2 nearby Viator tours appear as "you might also like."
7. Profile shows collection grid (caught vs. missing), total score, global rank.

---

## Architecture

### Components

- **Web frontend (Next.js App Router)** — mobile-first, served from Vercel. Pages: map, catch flow (camera), profile, leaderboard. No native install.
- **Vision verification API route** — receives photo + GPS, calls Claude Sonnet 4.6 with vision input, streams the agent's reasoning back to the client.
- **Viator suggestion API route** — given a landmark ID, queries the Viator Partner API for tours passing through and returns 1–2 with thumbnail, price, and booking URL. Falls back to seeded mock data if the API key isn't ready.
- **Storage (Vercel Postgres or KV)** — three tables/keys: `users`, `catches`, `landmarks` (read-only seed). Leaderboard is a SQL aggregation.
- **Landmarks seed** — JSON file with ~12 Lisbon spots: name, lat/lng, points value, hero image, Viator search keywords.

### Data flow (catch event)

```
Phone (camera + GPS)
    │
    ▼
POST /api/catch  { photo (base64), lat, lng, landmarkId }
    │
    ├─► Server: distance check (haversine, must be < 100m)
    │
    ├─► Claude Sonnet vision: "Is this a photo of <landmark>? Reply with confidence + reasoning."
    │   (streamed back to client as it generates)
    │
    ├─► If both pass: insert into `catches`, increment user score
    │
    ├─► Query Viator Partner API for tours near this landmark
    │
    ▼
Stream response: { verdict, reasoning, points, viatorSuggestions }
```

### Why these choices

- **Next.js + Vercel** — fastest path from zero to deployed mobile web. Edge functions handle the streaming neatly.
- **Claude Sonnet 4.6 vision** — strong landmark recognition, streams reasoning, single API call.
- **Postgres over KV** — leaderboard needs an `ORDER BY score DESC` aggregation. KV is awkward for that.
- **No auth** — friction kills demo conversion. Username+emoji is enough for a 24-hour event.

---

## What's *out* of scope (ruthless)

- Native apps. Mobile web only.
- Auth, password reset, email. Anonymous accounts only.
- More than one city. Lisbon only.
- Friends, social graph, trading.
- AR overlays, real-time multiplayer.
- Anti-cheat beyond GPS+vision combo. (If the demo gets gamed, fine — that's a story too.)
- Admin tools. Landmarks are hardcoded.

---

## The three "wow" beats

1. **Theatrical vision verification** — stream the agent's words live: *"Looking at the photo… I can see the lattice stonework characteristic of Manueline architecture… ✓ this is Jerónimos Monastery, photographed from the courtyard side. Confidence: 94%. GPS confirms within 28m. Catch granted."* This is what makes a phone feel like an agent.
2. **Real Viator tours appear.** Not mocked at the user — actual bookable tours, with prices, that pass through the spot you just caught. This is the prize-winning beat.
3. **Live leaderboard projected at the venue.** Audience populates it during breaks. The demo is the room.

---

## Demo-day pitch (90 seconds)

> "I built this in 2 days for the Viator prize. It's Pokémon Go for tourists — catch scenic spots by photo. The catch is verified by a vision agent that checks both the photo *and* your GPS, so you can't cheat from your couch. When you catch a spot, real Viator tours that pass through that spot appear as suggestions — that's how Viator monetizes the discovery funnel.
>
> Here's the global leaderboard. *(points at projected screen)* Everyone in this room played during the morning break. The top three caught all 12 Lisbon spots in under two hours."

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Viator Partner API access doesn't land in time | Realistic mock data seeded per landmark; swap to live data when key arrives. |
| iOS Safari camera/GPS quirks | Test on day 1 of build, before anything else is wired up. |
| Vision false-positives on similar buildings | GPS bound (must be within 100m) eliminates most. Combined verdict required. |
| Vision is slow → bad UX | Stream the reasoning. Slow becomes a feature. |
| Need to physically be in Lisbon to demo end-to-end | We are in Lisbon for the event. ✓ |

---

## Future (post-event, not v1)

- Quest lines: agent-curated multi-stop Viator tours based on your collection progress.
- Multi-city: Porto, Madrid, Barcelona.
- Photo gallery / shareable trip card.
- Social: see what your friends have caught.

These are *parking lot*, not v1.
