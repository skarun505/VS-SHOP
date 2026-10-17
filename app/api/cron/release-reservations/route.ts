import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/inventory";

export async function GET(req: Request) {
  try {
    const releasedCount = await releaseExpiredReservations();
    return NextResponse.json({
      success: true,
      releasedUnits: releasedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cron reservation release failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
