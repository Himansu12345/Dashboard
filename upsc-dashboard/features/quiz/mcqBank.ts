import { promises as fs } from "fs";
import path from "path";
import type {
  QuizApiPayload,
  QuizMode,
  QuizOptionId,
  QuizQuestion,
} from "@/store/slices/quizSlice";
import {
  buildSubjectNoteChapterMap,
  type NoteChapterOption,
} from "@/lib/quiz/noteChapterMap";

export type McqDifficulty = "easy" | "medium" | "hard";

export interface McqChapterIndexItem {
  slug: string;
  title: string;
  fileName: string;
  questionCount: number;
  difficultyCounts: Record<McqDifficulty, number>;
}

export interface McqSubjectIndexItem {
  name: string;
  chapters: McqChapterIndexItem[];
  noteChapters?: NoteChapterOption[];
}

interface RawMcq {
  id?: string;
  q?: string;
  question?: string;
  options?: Partial<Record<QuizOptionId, string>>;
  answer?: string;
  correctOptionId?: string;
  difficulty?: string;
  explanation?: string;
}

interface RawMcqChapter {
  subject?: string;
  topic?: string;
  mcqs?: RawMcq[];
}

interface ParsedQuestionText {
  stem: string;
  statements: string[];
  instruction: string;
}

interface StatementNumberMatch {
  number: number;
  numberStart: number;
  contentStart: number;
}

export interface BuildMcqQuizRequest {
  subject: string;
  chapter: string;
  chapters?: string[];
  excludeQuestionIds?: string[];
  noteChapter?: string;
  noteChapterId?: string;
  mode?: QuizMode;
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  minutes: number;
}

const MCQ_BANK_DIR = path.join(process.cwd(), "features", "quiz", "mcq-bank");
const DIFFICULTIES: McqDifficulty[] = ["easy", "medium", "hard"];
const chapterCache = new Map<string, RawMcqChapter>();
let bankIndexCache: McqSubjectIndexItem[] | null = null;

function titleFromSlug(slug: string): string {
  return slug
    .replace(/\.json$/i, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeDifficulty(value: string | undefined): McqDifficulty {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "hard") return "hard";
  if (
    normalized === "medium" ||
    normalized === "mid" ||
    normalized === "midium" ||
    normalized === "m"
  ) {
    return "medium";
  }
  return "easy";
}

function isOptionId(value: string): value is QuizOptionId {
  return value === "A" || value === "B" || value === "C" || value === "D";
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function assertSafePathSegment(value: string, label: string) {
  if (
    !value ||
    value.includes("/") ||
    value.includes("\\") ||
    value.includes("..")
  ) {
    throw new Error(`Invalid ${label}.`);
  }
}

async function readChapterFile(
  subject: string,
  chapterFileName: string,
): Promise<RawMcqChapter> {
  assertSafePathSegment(subject, "subject");
  assertSafePathSegment(chapterFileName, "chapter");

  const cacheKey = `${subject}/${chapterFileName}`;
  const cachedChapter = chapterCache.get(cacheKey);
  if (cachedChapter) return cachedChapter;

  const filePath = path.join(MCQ_BANK_DIR, subject, chapterFileName);
  const resolvedPath = path.resolve(filePath);
  const safeRoot = path.resolve(MCQ_BANK_DIR);

  if (!resolvedPath.startsWith(safeRoot)) {
    throw new Error("Invalid chapter path.");
  }

  const fileContent = await fs.readFile(resolvedPath, "utf8");
  const parsedChapter = JSON.parse(fileContent) as RawMcqChapter;
  chapterCache.set(cacheKey, parsedChapter);
  return parsedChapter;
}

function findStatementNumberMatches(text: string): StatementNumberMatch[] {
  const matches: StatementNumberMatch[] = [];
  const statementNumberPattern = /(^|\s)([1-9]\d?)\.\s+/g;
  let match: RegExpExecArray | null;

  while ((match = statementNumberPattern.exec(text)) !== null) {
    const leadingWhitespace = match[1] || "";
    matches.push({
      number: Number(match[2]),
      numberStart: match.index + leadingWhitespace.length,
      contentStart: statementNumberPattern.lastIndex,
    });
  }

  return matches;
}

function findStatementSequence(
  matches: StatementNumberMatch[],
): StatementNumberMatch[] {
  for (let index = 0; index < matches.length - 1; index += 1) {
    if (matches[index].number !== 1 || matches[index + 1].number !== 2) {
      continue;
    }

    const sequence = [matches[index]];
    let expectedNumber = 2;

    for (
      let nextIndex = index + 1;
      nextIndex < matches.length;
      nextIndex += 1
    ) {
      if (matches[nextIndex].number !== expectedNumber) {
        break;
      }

      sequence.push(matches[nextIndex]);
      expectedNumber += 1;
    }

    return sequence;
  }

  return [];
}

function splitTrailingInstruction(statement: string): {
  statement: string;
  instruction: string;
} {
  const trailingInstructionPattern =
    /\s+((?:Which\s+(?:of|among)|How\s+many|Select\s+the\s+correct|Choose\s+the\s+correct|Identify\s+the\s+correct|Pick\s+the\s+correct)\b[\s\S]*)$/i;
  const match = statement.match(trailingInstructionPattern);

  if (!match || match.index === undefined) {
    return { statement, instruction: "" };
  }

  const cleanStatement = statement.slice(0, match.index).trim();
  const instruction = match[1].trim();

  if (!cleanStatement || !instruction) {
    return { statement, instruction: "" };
  }

  return { statement: cleanStatement, instruction };
}

function parseQuestionText(rawText: string): ParsedQuestionText {
  const text = rawText.replace(/\s+/g, " ").trim();
  if (!text) return { stem: "", statements: [], instruction: "" };

  const sequence = findStatementSequence(findStatementNumberMatches(text));
  if (sequence.length === 0) {
    return { stem: text, statements: [], instruction: "" };
  }

  const stem = text.slice(0, sequence[0].numberStart).trim();
  const statements = sequence
    .map((match, index) => {
      const nextMatch = sequence[index + 1];
      const statementEnd = nextMatch ? nextMatch.numberStart : text.length;
      return text.slice(match.contentStart, statementEnd).trim();
    })
    .filter(Boolean);

  if (statements.length < 2) {
    return { stem: text, statements: [], instruction: "" };
  }

  const lastStatementIndex = statements.length - 1;
  const splitLastStatement = splitTrailingInstruction(
    statements[lastStatementIndex],
  );
  statements[lastStatementIndex] = splitLastStatement.statement;

  return {
    stem,
    statements,
    instruction: splitLastStatement.instruction,
  };
}

function normalizeQuestion(rawMcq: RawMcq, fallbackIndex: number): QuizQuestion | null {
  const answer = String(rawMcq.answer || rawMcq.correctOptionId || "")
    .trim()
    .toUpperCase();

  if (!isOptionId(answer) || !rawMcq.options) {
    return null;
  }

  const options = {
    A: rawMcq.options.A || "",
    B: rawMcq.options.B || "",
    C: rawMcq.options.C || "",
    D: rawMcq.options.D || "",
  };

  if (!options.A || !options.B || !options.C || !options.D) {
    return null;
  }

  const parsedQuestion = parseQuestionText(String(rawMcq.q || rawMcq.question || ""));
  if (!parsedQuestion.stem && parsedQuestion.statements.length === 0) return null;

  return {
    id: rawMcq.id || `mcq-${fallbackIndex + 1}`,
    questionType: normalizeDifficulty(rawMcq.difficulty),
    stem: parsedQuestion.stem,
    statements: parsedQuestion.statements,
    instruction: parsedQuestion.instruction,
    options,
    correctOptionId: answer,
    explanation: {
      coreConcept: rawMcq.explanation || "Answer checked from the selected MCQ bank file.",
      trapUsed: "",
      laxmikanthCitation: "",
      visionIasCitation: "",
    },
  };
}

function toDifficultyCounts(mcqs: RawMcq[]): Record<McqDifficulty, number> {
  return mcqs.reduce<Record<McqDifficulty, number>>(
    (counts, mcq) => {
      counts[normalizeDifficulty(mcq.difficulty)] += 1;
      return counts;
    },
    { easy: 0, medium: 0, hard: 0 },
  );
}

export async function getMcqBankIndex(): Promise<McqSubjectIndexItem[]> {
  if (bankIndexCache) return bankIndexCache;

  const entries = await fs.readdir(MCQ_BANK_DIR, { withFileTypes: true });
  const subjectDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const subjects = await Promise.all(
    subjectDirs.map(async (subjectName) => {
      const chapterEntries = await fs.readdir(path.join(MCQ_BANK_DIR, subjectName), {
        withFileTypes: true,
      });

      const chapters = await Promise.all(
        chapterEntries
          .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
          .map(async (entry) => {
            const chapter = await readChapterFile(subjectName, entry.name);
            const mcqs = Array.isArray(chapter.mcqs) ? chapter.mcqs : [];
            const slug = entry.name.replace(/\.json$/i, "");

            return {
              slug,
              title: chapter.topic || titleFromSlug(slug),
              fileName: entry.name,
              questionCount: mcqs.length,
              difficultyCounts: toDifficultyCounts(mcqs),
            };
          }),
      );

      return {
        name: subjectName,
        chapters: chapters.sort((a, b) => a.title.localeCompare(b.title)),
        noteChapters: buildSubjectNoteChapterMap(
          subjectName,
          chapters.map((chapter) => ({
            slug: chapter.slug,
            title: chapter.title,
          })),
        ).noteChapters,
      };
    }),
  );

  bankIndexCache = subjects.filter((subject) => subject.chapters.length > 0);
  return bankIndexCache;
}

function normalizeQuestionWithSource(
  rawMcq: RawMcq,
  fallbackIndex: number,
  sourceSlug: string,
): QuizQuestion | null {
  const question = normalizeQuestion(rawMcq, fallbackIndex);
  if (!question) return null;

  return {
    ...question,
    id: `${sourceSlug}:${question.id}`,
  };
}

export async function buildMcqQuizPayload(
  request: BuildMcqQuizRequest,
): Promise<QuizApiPayload> {
  const totalQuestions = Math.max(1, Math.floor(request.totalQuestions));
  const requestedCounts: Record<McqDifficulty, number> = {
    easy: Math.max(0, Math.floor(request.easyCount)),
    medium: Math.max(0, Math.floor(request.mediumCount)),
    hard: Math.max(0, Math.floor(request.hardCount)),
  };
  const requestedDifficultyTotal =
    requestedCounts.easy + requestedCounts.medium + requestedCounts.hard;

  if (requestedDifficultyTotal !== totalQuestions) {
    throw new Error("Easy + medium + hard question counts must equal total questions.");
  }

  const chapterSlugs = Array.from(
    new Set(
      (Array.isArray(request.chapters) && request.chapters.length > 0
        ? request.chapters
        : [request.chapter]
      )
        .map((chapter) => String(chapter || "").trim())
        .filter(Boolean),
    ),
  );

  if (chapterSlugs.length === 0) {
    throw new Error("At least one chapter is required.");
  }

  const chapters = await Promise.all(
    chapterSlugs.map(async (chapterSlug) => {
      const chapter = await readChapterFile(request.subject, `${chapterSlug}.json`);
      const rawMcqs = Array.isArray(chapter.mcqs) ? chapter.mcqs : [];

      return {
        slug: chapterSlug,
        title: chapter.topic || titleFromSlug(chapterSlug),
        questions: rawMcqs
          .map((mcq, index) => normalizeQuestionWithSource(mcq, index, chapterSlug))
          .filter((question): question is QuizQuestion => Boolean(question)),
      };
    }),
  );

  const normalizedQuestions = chapters.flatMap((chapter) => chapter.questions);

  if (normalizedQuestions.length === 0) {
    throw new Error("No valid MCQs found in this chapter.");
  }

  const excludedQuestionIds = new Set(
    (Array.isArray(request.excludeQuestionIds) ? request.excludeQuestionIds : [])
      .map((id) => String(id || "").trim())
      .filter(Boolean),
  );

  const selectedByDifficulty = DIFFICULTIES.flatMap((difficulty) => {
    const allAvailable = shuffle(
      normalizedQuestions.filter(
        (question) => question.questionType === difficulty,
      ),
    );
    const needed = requestedCounts[difficulty];
    const freshAvailable = allAvailable.filter(
      (question) => !excludedQuestionIds.has(question.id),
    );
    const available = freshAvailable.length >= needed ? freshAvailable : allAvailable;

    if (available.length < needed) {
      throw new Error(
        `${request.noteChapter || chapters.map((chapter) => chapter.title).join(", ")} has only ${available.length} ${difficulty} questions.`,
      );
    }

    return available.slice(0, needed);
  });

  return {
    sessionMeta: {
      subject: request.subject,
      topic:
        request.noteChapter ||
        (chapters.length === 1
          ? chapters[0].title
          : `${chapters[0].title} + ${chapters.length - 1} more`),
      noteChapter: request.noteChapter || "",
      noteChapterId: request.noteChapterId || "",
      mode: request.mode === "exam" ? "exam" : "practice",
      totalQuestions,
      totalTimeSeconds: Math.max(1, Math.floor(request.minutes)) * 60,
      timeLimitPerMcqSeconds: Math.max(1, Math.floor(request.minutes)) * 60,
    },
    questions: shuffle(selectedByDifficulty),
  };
}
