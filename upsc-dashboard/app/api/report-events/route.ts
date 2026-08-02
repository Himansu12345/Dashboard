import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Uses server-side env variable (no NEXT_PUBLIC needed here)
const BACKEND_REPORT_EVENTS_URL = process.env.BACKEND_API_URL 
  ? `${process.env.BACKEND_API_URL}/report-events` 
  : "http://localhost:5000/api/report-events";
export async function POST(request: Request) {
  try {
    const body = await request.text();

    const response = await fetch(BACKEND_REPORT_EVENTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") || "application/json",
      },
      body,
      cache: "no-store",
    });

    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("POST /api/report-events proxy failed:", error);
    return NextResponse.json(
      { error: "Failed to forward report event." },
      { status: 500 },
    );
  }
}
