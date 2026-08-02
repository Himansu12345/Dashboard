import { NextResponse } from "next/server";
import {
  buildMcqQuizPayload,
  getMcqBankIndex,
  type BuildMcqQuizRequest,
} from "@/features/quiz/mcqBank";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject")?.trim();
  const bankIndex = await getMcqBankIndex();

  if (!subject) {
    return NextResponse.json(bankIndex);
  }

  const subjectIndex = bankIndex.find((item) => item.name === subject);

  if (!subjectIndex) {
    return NextResponse.json(
      { error: `No MCQ bank found for ${subject}.` },
      { status: 404 },
    );
  }

  return NextResponse.json(subjectIndex);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<BuildMcqQuizRequest>;

    if (!body.subject || !body.chapter) {
      return NextResponse.json(
        { error: "Subject and chapter are required." },
        { status: 400 },
      );
    }

    const payload = await buildMcqQuizPayload({
      subject: body.subject,
      chapter: body.chapter,
      chapters: Array.isArray(body.chapters)
        ? body.chapters.filter((chapter): chapter is string => typeof chapter === "string")
        : undefined,
      excludeQuestionIds: Array.isArray(body.excludeQuestionIds)
        ? body.excludeQuestionIds.filter((id): id is string => typeof id === "string")
        : undefined,
      noteChapter: typeof body.noteChapter === "string" ? body.noteChapter : "",
      noteChapterId:
        typeof body.noteChapterId === "string" ? body.noteChapterId : "",
      mode: body.mode === "exam" ? "exam" : "practice",
      totalQuestions: Number(body.totalQuestions),
      easyCount: Number(body.easyCount),
      mediumCount: Number(body.mediumCount),
      hardCount: Number(body.hardCount),
      minutes: Number(body.minutes),
    });

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to build MCQ quiz.",
      },
      { status: 400 },
    );
  }
}
