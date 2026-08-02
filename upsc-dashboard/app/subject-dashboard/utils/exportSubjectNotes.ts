import type { SubjectNode } from "../types";

type ExportStats = {
  chapters: number;
  topics: number;
  subtopics: number;
  points: number;
};

type ExportOptions = {
  title: string;
  modeLabel: string;
  generatedAt: Date;
};

type QuizDifficultyCounts = {
  easy: number;
  medium: number;
  hard: number;
};

export type SubjectQuizExportTopic = {
  topic: string;
} & QuizDifficultyCounts;

export type SubjectQuizExportSource = {
  chapters?: Array<{
    title?: string;
    difficultyCounts?: Partial<QuizDifficultyCounts>;
  }>;
};

function cleanInlineLabel(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function countLeafNodes(node: SubjectNode): number {
  if (!node.children?.length) return 1;
  return node.children.reduce((sum, child) => sum + countLeafNodes(child), 0);
}

function countImmediateSubtopics(topic: SubjectNode): number {
  return (topic.children || []).filter((child) => child.children?.length).length;
}

function collectStats(chapters: SubjectNode[]): ExportStats {
  return chapters.reduce<ExportStats>(
    (stats, chapter) => {
      const topics = chapter.children || [];
      stats.topics += topics.length;
      stats.points += countLeafNodes(chapter);

      topics.forEach((topic) => {
        stats.subtopics += countImmediateSubtopics(topic);
      });

      return stats;
    },
    {
      chapters: chapters.length,
      topics: 0,
      subtopics: 0,
      points: 0,
    },
  );
}

export function buildSubjectNotesExport(
  chapters: SubjectNode[],
  options: ExportOptions,
): string {
  const stats = collectStats(chapters);
  const lines: string[] = [
    `${options.title} - Subject Notes Export`,
    `Generated: ${options.generatedAt.toLocaleString()}`,
    `Mode: ${options.modeLabel}`,
    "",
    "Summary",
    `- Chapters: ${stats.chapters}`,
    `- Topics: ${stats.topics}`,
    `- Subtopics: ${stats.subtopics}`,
    "",
    "Detailed Structure",
  ];

  chapters.forEach((chapter, chapterIndex) => {
    const topics = chapter.children || [];
    const chapterSubtopicCount = topics.reduce(
      (sum, topic) => sum + countImmediateSubtopics(topic),
      0,
    );

    lines.push(
      "",
      `${chapterIndex + 1}. ${cleanInlineLabel(chapter.label)}`,
      `   Topics: ${topics.length} | Subtopics: ${chapterSubtopicCount} | Points: ${countLeafNodes(chapter)}`,
    );

    if (topics.length === 0) {
      lines.push("   No topics found under this chapter.");
      return;
    }

    topics.forEach((topic, topicIndex) => {
      const topicChildren = topic.children || [];
      const subtopics = topicChildren.filter((child) => child.children?.length);

      lines.push(
        "",
        `   ${chapterIndex + 1}.${topicIndex + 1}. Topic: ${cleanInlineLabel(topic.label)}`,
        `      Subtopics: ${subtopics.length} | Points: ${countLeafNodes(topic)}`,
      );

    if (subtopics.length > 0) {
  lines.push("      Subtopics:");
  subtopics.forEach((subtopic, subtopicIndex) => {
    lines.push(
      `      ${subtopicIndex + 1}. ${cleanInlineLabel(subtopic.label)} (${countLeafNodes(subtopic)} points)`
    );
  });
}
    });
  });

  return `${lines.join("\n")}\n`;
}

export function buildSubjectNotesExportFilename(title: string): string {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeTitle || "subject"}-notes-structure.txt`;
}

function toSafeCount(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.floor(numericValue)
    : 0;
}

export function buildSubjectQuizExport(
  source: SubjectQuizExportSource,
): string {
  const rows = (source.chapters || []).map<SubjectQuizExportTopic>((chapter) => {
    const counts = chapter.difficultyCounts || {};

    return {
      topic: cleanInlineLabel(chapter.title || "Untitled topic"),
      easy: toSafeCount(counts.easy),
      medium: toSafeCount(counts.medium),
      hard: toSafeCount(counts.hard),
    };
  });

  return `${JSON.stringify(rows, null, 2)}\n`;
}

export function buildSubjectQuizExportFilename(subject: string): string {
  const safeSubject = subject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeSubject || "subject"}-quiz-structure.json`;
}
