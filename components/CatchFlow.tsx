"use client";

import { useEffect, useRef, useState } from "react";
import type { Landmark } from "@/lib/landmarks";

type User = { username: string; emoji: string };

type Stage =
  | { kind: "init" }
  | { kind: "locating" }
  | { kind: "camera"; lat: number; lng: number }
  | { kind: "verifying"; lat: number; lng: number; photo: string }
  | {
      kind: "result";
      approved: boolean;
      points?: number;
      reason?: string;
      message?: string;
      landmark?: { name: string; emoji: string; rarity: string };
      viator?: Landmark["viatorSuggestions"];
    };

type StreamEvent =
  | { type: "status"; message: string }
  | { type: "thinking"; delta: string }
  | {
      type: "final";
      approved: boolean;
      points?: number;
      reason?: string;
      message?: string;
      landmark?: { name: string; emoji: string; rarity: string };
      viator?: Landmark["viatorSuggestions"];
    };

export function CatchFlow({
  landmark,
  user,
  onClose,
}: {
  landmark: Landmark;
  user: User;
  onClose: (caught: boolean) => void;
}) {
  const [stage, setStage] = useState<Stage>({ kind: "init" });
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [thinking, setThinking] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get GPS first
  useEffect(() => {
    if (stage.kind !== "init") return;
    setStage({ kind: "locating" });

    if (!navigator.geolocation) {
      // Fallback: assume on-site for demo
      setStage({ kind: "camera", lat: landmark.lat, lng: landmark.lng });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStage({
          kind: "camera",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        // GPS denied or failed: assume on-site for demo
        setStage({ kind: "camera", lat: landmark.lat, lng: landmark.lng });
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [stage.kind, landmark.lat, landmark.lng]);

  // Open camera once we hit camera stage
  useEffect(() => {
    if (stage.kind !== "camera") return;
    let cancelled = false;

    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
      } catch {
        // No camera (e.g. desktop without webcam) — let user upload instead
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [stage.kind]);

  function snapAndVerify() {
    if (stage.kind !== "camera") return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    runVerification(stage.lat, stage.lng, dataUrl);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const lat =
        stage.kind === "camera"
          ? stage.lat
          : (stage.kind === "verifying" ? stage.lat : landmark.lat);
      const lng =
        stage.kind === "camera"
          ? stage.lng
          : (stage.kind === "verifying" ? stage.lng : landmark.lng);
      runVerification(lat, lng, dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function runVerification(lat: number, lng: number, dataUrl: string) {
    const m = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (!m) {
      setStage({
        kind: "result",
        approved: false,
        reason: "bad_image",
        message: "Could not read photo.",
      });
      return;
    }
    const mediaType = m[1];
    const photoBase64 = m[2];

    setStage({ kind: "verifying", lat, lng, photo: dataUrl });
    setStatusLog([]);
    setThinking("");

    const res = await fetch("/api/catch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        landmarkId: landmark.id,
        username: user.username,
        emoji: user.emoji,
        lat,
        lng,
        mediaType,
        photoBase64,
      }),
    });

    if (!res.ok || !res.body) {
      const err = await res.json().catch(() => ({}));
      setStage({
        kind: "result",
        approved: false,
        reason: err.error ?? "error",
        message: err.error ?? "Something went wrong.",
      });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line) as StreamEvent;
          if (event.type === "status") {
            setStatusLog((l) => [...l, event.message]);
          } else if (event.type === "thinking") {
            setThinking((t) => t + event.delta);
          } else if (event.type === "final") {
            setStage({
              kind: "result",
              approved: event.approved,
              points: event.points,
              reason: event.reason,
              message: event.message,
              landmark: event.landmark,
              viator: event.viator,
            });
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <button
          type="button"
          onClick={() => onClose(stage.kind === "result" && stage.approved)}
          className="text-zinc-400 hover:text-zinc-200"
        >
          ← Back
        </button>
        <div className="text-sm font-semibold">{landmark.name}</div>
        <div className="w-10" />
      </header>

      <div className="flex-1 px-5 py-6">
        {stage.kind === "init" || stage.kind === "locating" ? (
          <CenteredStatus title="Getting your location…" />
        ) : stage.kind === "camera" ? (
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            landmark={landmark}
            onSnap={snapAndVerify}
            onUpload={handleUpload}
          />
        ) : stage.kind === "verifying" ? (
          <Verifying
            photo={stage.photo}
            statusLog={statusLog}
            thinking={thinking}
          />
        ) : (
          <Result stage={stage} landmark={landmark} onClose={onClose} />
        )}
      </div>
    </main>
  );
}

function CenteredStatus({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[60dvh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-lime-400" />
      <div className="text-zinc-400">{title}</div>
    </div>
  );
}

function CameraView({
  videoRef,
  canvasRef,
  landmark,
  onSnap,
  onUpload,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  landmark: Landmark;
  onSnap: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{landmark.emoji}</div>
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              Target
            </div>
            <div className="font-bold">{landmark.name}</div>
          </div>
        </div>
      </div>

      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="pointer-events-none absolute inset-4 rounded-xl border-2 border-dashed border-lime-400/60" />
      </div>

      <button
        type="button"
        onClick={onSnap}
        className="pulse-glow flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-6 py-5 text-lg font-bold text-zinc-950"
      >
        📸 Snap & catch
      </button>

      <label className="block w-full cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 text-center text-zinc-400 hover:bg-zinc-800">
        Or upload a photo
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
        />
      </label>
    </div>
  );
}

function Verifying({
  photo,
  statusLog,
  thinking,
}: {
  photo: string;
  statusLog: string[];
  thinking: string;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="w-full" />
      </div>

      <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-lime-400">
          Vision agent
        </div>

        {statusLog.map((s, i) => (
          <div key={i} className="text-sm text-zinc-300">
            {s}
          </div>
        ))}

        {thinking && (
          <div className="mt-2 border-l-2 border-lime-400/50 pl-3 text-sm leading-relaxed text-zinc-200">
            {thinking}
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-lime-400" />
          </div>
        )}

        {!thinking && statusLog.length === 0 && (
          <div className="shimmer h-4 rounded" />
        )}
      </div>
    </div>
  );
}

function Result({
  stage,
  landmark,
  onClose,
}: {
  stage: Extract<Stage, { kind: "result" }>;
  landmark: Landmark;
  onClose: (caught: boolean) => void;
}) {
  if (!stage.approved) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6">
          <div className="mb-2 text-4xl">😕</div>
          <h2 className="mb-1 text-2xl font-bold">Not this time.</h2>
          <p className="text-zinc-300">
            {stage.message ?? "The vision agent couldn't confirm the catch."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onClose(false)}
          className="w-full rounded-2xl bg-zinc-800 px-6 py-4 font-bold"
        >
          Try again later
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-lime-400/60 bg-gradient-to-b from-lime-400/20 to-transparent p-6 text-center">
        <div className="mb-2 text-xs uppercase tracking-[0.3em] text-lime-400">
          Catch confirmed
        </div>
        <div className="mb-2 text-7xl">{landmark.emoji}</div>
        <div className="mb-1 text-2xl font-bold">{landmark.name}</div>
        <div className="font-mono text-3xl font-bold text-lime-400">
          +{stage.points} pts
        </div>
      </div>

      {stage.viator && stage.viator.length > 0 && (
        <div className="space-y-2">
          <div className="px-1 text-xs uppercase tracking-wider text-zinc-500">
            Viator tours that pass through here
          </div>
          {stage.viator.map((v) => (
            <a
              key={v.url}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600"
            >
              <div className="mb-1 text-xs uppercase tracking-wider text-amber-400">
                Viator · {v.price}
              </div>
              <div className="font-semibold">{v.title}</div>
              <div className="mt-1 text-sm text-zinc-500">
                Book on Viator →
              </div>
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onClose(true)}
        className="w-full rounded-2xl bg-lime-400 px-6 py-4 text-lg font-bold text-zinc-950"
      >
        Catch another →
      </button>
    </div>
  );
}
