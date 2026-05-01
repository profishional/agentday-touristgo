import Anthropic from "@anthropic-ai/sdk";
import {
  distanceMeters,
  getLandmark,
  type Landmark,
} from "@/lib/landmarks";
import { hasCaught, recordCatch } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic();

// Be lenient for demo so people not in Lisbon can still test.
const MAX_DISTANCE_M = 100_000;

function buildSystem(lm: Landmark) {
  return `You are a vision verifier for a tourist photo collection game called Snapscape.

The user claims to be photographing "${lm.name}" in Lisbon. ${lm.description}

Look at the photo carefully and decide if it shows ${lm.name}.

Reply with:
1. 1-3 short sentences describing what you see, like a thoughtful human inspector. Mention specific architectural or scenic details you recognize.
2. On a NEW LINE, output exactly one of:
   VERDICT: APPROVED
   VERDICT: REJECTED

Be reasonable. A photo taken from any angle, in any light, with people in it, is fine as long as it clearly shows ${lm.name}. Reject only if the photo shows something else entirely, is unrelated, or is too obscured to identify.`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body)
    return new Response(JSON.stringify({ error: "bad json" }), { status: 400 });

  const { landmarkId, username, emoji, lat, lng, photoBase64, mediaType } =
    body as {
      landmarkId: string;
      username: string;
      emoji: string;
      lat: number;
      lng: number;
      photoBase64: string;
      mediaType?: string;
    };

  const lm = getLandmark(landmarkId);
  if (!lm)
    return new Response(JSON.stringify({ error: "landmark not found" }), {
      status: 404,
    });

  if (!username || !emoji)
    return new Response(JSON.stringify({ error: "missing user" }), {
      status: 400,
    });

  if (hasCaught(username, landmarkId)) {
    return new Response(
      JSON.stringify({ error: "already_caught", landmark: lm.name }),
      { status: 400 },
    );
  }

  const distance = distanceMeters(lat, lng, lm.lat, lm.lng);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      try {
        send({
          type: "status",
          message: `📍 Pinging your GPS… you are ~${Math.round(distance).toLocaleString()}m from ${lm.name}`,
        });

        if (distance > MAX_DISTANCE_M) {
          send({
            type: "final",
            approved: false,
            reason: "too_far",
            message: `You're ${Math.round(distance / 1000)}km from ${lm.name}. Get closer to catch it!`,
          });
          controller.close();
          return;
        }

        send({
          type: "status",
          message: "✅ GPS check passed. Spinning up vision agent…",
        });

        const stream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 400,
          system: buildSystem(lm),
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type:
                      (mediaType as "image/jpeg" | "image/png" | "image/webp") ??
                      "image/jpeg",
                    data: photoBase64,
                  },
                },
                {
                  type: "text",
                  text: `Verify this is ${lm.name}.`,
                },
              ],
            },
          ],
        });

        let fullText = "";
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullText += event.delta.text;
            send({ type: "thinking", delta: event.delta.text });
          }
        }

        const approved = /VERDICT:\s*APPROVED/i.test(fullText);

        if (approved) {
          recordCatch({
            username,
            emoji,
            landmarkId,
            points: lm.points,
            caughtAt: Date.now(),
          });
          send({
            type: "final",
            approved: true,
            points: lm.points,
            landmark: { name: lm.name, emoji: lm.emoji, rarity: lm.rarity },
            viator: lm.viatorSuggestions,
          });
        } else {
          send({
            type: "final",
            approved: false,
            reason: "vision_rejected",
            message: "The vision agent couldn't confirm the landmark.",
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send({ type: "final", approved: false, reason: "error", message: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
    },
  });
}
