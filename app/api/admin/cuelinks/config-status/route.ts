import { NextResponse } from "next/server";
import { isCuelinksConfigured } from "@/lib/cuelinks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * SAFE Diagnostic Endpoint
 *
 * GET /api/admin/cuelinks/config-status
 *
 * Confirms whether CUELINKS_API_KEY is configured in the server runtime.
 * Returns strictly:
 * {
 *   "configured": true | false,
 *   "environment": "production"
 * }
 *
 * NEVER exposes the key, even partially.
 */
export async function GET() {
  return NextResponse.json({
    configured: isCuelinksConfigured(),
    environment: "production",
  });
}
