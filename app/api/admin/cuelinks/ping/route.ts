import { NextResponse } from "next/server";
import { ping } from "@/lib/cuelinks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Server-side /ping test endpoint
 *
 * GET /api/admin/cuelinks/ping
 *
 * Calls:
 * GET https://developers.cuelinks.com/pub_api/v3/ping
 * with Authorization: Token ${process.env.CUELINKS_API_KEY}
 *
 * Exposes ONLY safe publisher metadata (ID, name) and connection status.
 * NEVER exposes secrets or keys.
 */
export async function GET() {
  try {
    const pingRes = await ping();

    return NextResponse.json({
      success: true,
      connected: true,
      publisher: {
        id: pingRes.publisher?.publisher_id || pingRes.publisher?.id,
        name: pingRes.publisher?.name,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const sanitizedError =
      typeof err?.message === "string"
        ? err.message.replace(/Token\s+[^\s]+/gi, "Token [REDACTED]")
        : "Failed to communicate with Cuelinks API";

    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: sanitizedError,
        timestamp: new Date().toISOString(),
      },
      {
        status:
          err.statusCode && err.statusCode >= 400 && err.statusCode < 600
            ? err.statusCode
            : 500,
      }
    );
  }
}
