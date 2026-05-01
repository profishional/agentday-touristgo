import { getCatchesFor, getLeaderboard } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = url.searchParams.get("username");

  return Response.json({
    leaderboard: getLeaderboard().slice(0, 50),
    myCatches: username
      ? getCatchesFor(username).map((c) => c.landmarkId)
      : [],
  });
}
