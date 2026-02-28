// kujuana/apps/web/app/api/health/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "kujuana-web",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}