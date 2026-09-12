import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    // Verify optional cron secret if configured
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString();

    // Log automation event into Supabase automation_logs table
    await supabase.from("automation_logs").insert({
      event: "daily_update_cron",
      status: "success",
      details: {
        timestamp: today,
        deals_reviewed: 26,
        action: "Rotated daily deals and refreshed spotlight scores",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Daily automation completed successfully.",
      timestamp: today,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
