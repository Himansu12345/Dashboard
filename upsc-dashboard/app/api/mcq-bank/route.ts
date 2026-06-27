import { NextResponse } from "next/server";
import { buildMcqQuizPayload, type BuildMcqQuizRequest } from "@/features/quiz/mcqBank";

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
