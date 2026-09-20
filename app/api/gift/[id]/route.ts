import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function hasRedis(): boolean {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
      (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN),
  );
}

function redis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL!,
    token:
      process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN!,
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasRedis()) {
    return NextResponse.json({ error: "no-storage" }, { status: 404 });
  }
  try {
    const { id } = await params;
    if (!/^[a-f0-9]{14}$/.test(id)) {
      return NextResponse.json({ error: "not-found" }, { status: 404 });
    }
    const raw = await redis().get(`gift:${id}`);
    if (!raw) return NextResponse.json({ error: "not-found" }, { status: 404 });
    const parsed =
      typeof raw === "string"
        ? (JSON.parse(raw) as { m?: string; img?: string })
        : (raw as { m?: string; img?: string });
    if (typeof parsed.m !== "string") {
      return NextResponse.json({ error: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ m: parsed.m, img: parsed.img });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}