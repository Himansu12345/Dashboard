import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || "";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!MONGODB_URI) throw new Error("Database URL is missing");
  await mongoose.connect(MONGODB_URI);
}

// 📡 FETCH Insights from the Isolated Cloud Vault
export async function GET(request: Request) {
  try {
    await connectDB();
    const subject = new URL(request.url).searchParams.get("subject");
    if (!subject) return NextResponse.json({ error: "Invalid subject" }, { status: 400 });

    const db = mongoose.connection.db;
    const doc = await db.collection("mcq_insights_vault").findOne({ subjectKey: subject });
    
    return NextResponse.json({ insightsMap: doc?.insightsMap || {} }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load insights" }, { status: 500 });
  }
}

// 💾 SAVE Insights to the Isolated Cloud Vault
export async function PUT(request: Request) {
  try {
    await connectDB();
    const subject = new URL(request.url).searchParams.get("subject");
    if (!subject) return NextResponse.json({ error: "Invalid subject" }, { status: 400 });

    const { insightsMap } = await request.json();
    const db = mongoose.connection.db;

    await db.collection("mcq_insights_vault").updateOne(
      { subjectKey: subject },
      { $set: { insightsMap, updatedAt: Date.now() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save insights" }, { status: 500 });
  }
}