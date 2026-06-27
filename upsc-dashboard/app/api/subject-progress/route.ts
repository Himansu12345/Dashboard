import { NextResponse } from "next/server";
import {
  readSubjectProgress,
  writeSubjectProgress,
  type StoredSubjectProgress,
} from "@/lib/subjectProgressStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validSubject(value: string | null): value is string {
  return Boolean(
    value &&
      /^upsc[-_][a-z0-9][a-z0-9_-]{0,80}checked$/i.test(value),
  );
}

function normalizeProgress(value: unknown): StoredSubjectProgress | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const input = value as Record<string, unknown>;
  if (!Array.isArray(input.checkedUids)) return null;

  const checkedUids = [
    ...new Set(
      input.checkedUids.filter(
        (uid): uid is string => typeof uid === "string" && uid.length <= 500,
      ),
    ),
  ];

  const completionTimes: StoredSubjectProgress["completionTimes"] = {};

  if (input.completionTimes && typeof input.completionTimes === "object") {
    for (const [uid, rawValue] of Object.entries(input.completionTimes)) {
      if (uid.length > 500 || rawValue == null) continue;

      // legacy numeric support
      if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
        completionTimes[uid] = {
          completedAt: rawValue,
          revisions: [],
        };
        continue;
      }

      if (typeof rawValue !== "object" || Array.isArray(rawValue)) continue;

      const record = rawValue as Record<string, unknown>;
      if (
        typeof record.completedAt !== "number" ||
        !Number.isFinite(record.completedAt)
      ) {
        continue;
      }

      const revisions = Array.isArray(record.revisions)
        ? record.revisions.filter(
            (time): time is number =>
              typeof time === "number" && Number.isFinite(time),
          )
        : [];

      completionTimes[uid] = {
        completedAt: record.completedAt,
        ...(revisions.length ? { revisions } : {}),
        ...(typeof record.revisedAt === "number" &&
        Number.isFinite(record.revisedAt)
          ? { revisedAt: record.revisedAt }
          : {}),
      };
    }
  }

  return {
    checkedUids,
    completionTimes,
    updatedAt: Date.now(),
  };
}

export async function GET(request: Request) {
  const subject = new URL(request.url).searchParams.get("subject");

  if (!validSubject(subject)) {
    return NextResponse.json({ error: "Invalid subject." }, { status: 400 });
  }

  return NextResponse.json(
    { progress: await readSubjectProgress(subject) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PUT(request: Request) {
  const subject = new URL(request.url).searchParams.get("subject");

  if (!validSubject(subject)) {
    return NextResponse.json({ error: "Invalid subject." }, { status: 400 });
  }

  const progress = normalizeProgress(await request.json());

  if (!progress) {
    return NextResponse.json(
      { error: "Invalid progress data." },
      { status: 400 },
    );
  }

  await writeSubjectProgress(subject, progress);
  return NextResponse.json({ ok: true, updatedAt: progress.updatedAt });
}