import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 🛡️ PRO FIX: Support multiple env variable fallbacks and ensure robust URL construction
const rawBackendUrl = 
  process.env.BACKEND_API_URL || 
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  process.env.NEXT_PUBLIC_API_URL || 
  "http://localhost:5000/api";

const cleanUrl = rawBackendUrl.replace(/\/+$/, "");
const apiBase = cleanUrl.endsWith("api") ? cleanUrl : `${cleanUrl}/api`;
const BACKEND_REPORT_EVENTS_URL = `${apiBase}/report-events`;

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
    console.error(`POST proxy failed to target: ${BACKEND_REPORT_EVENTS_URL}`, error);
    return NextResponse.json(
      { error: "Failed to forward report event." },
      { status: 500 },
    );
  }
}