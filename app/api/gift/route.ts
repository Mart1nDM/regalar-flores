import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { MESSAGE_MAX_LENGTH } from "@/lib/messages";

const GIFT_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAX_BODY_CHARS = 2_000_000;

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

function makeId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 14);
}

export async function POST(request: Request) {
  if (!hasRedis()) {
    return NextResponse.json({ error: "no-storage" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const m =
      typeof body.m === "string" ? body.m.slice(0, MESSAGE_MAX_LENGTH) : "";
    const img = typeof body.img === "string" ? body.img : "";
    if (!img || JSON.stringify(body).length > MAX_BODY_CHARS) {
      return NextResponse.json({ error: "bad-request" }, { status: 400 });
    }
    const id = makeId();
    await redis().set(`gift:${id}`, JSON.stringify({ m, img }), {
      ex: GIFT_TTL_SECONDS,
    });
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}