import type { RawSubjectNode } from "@/app/subject-dashboard/types";
import { RAW_D as RAW_ANCIENT } from "@/app/subject-dashboard/data/ancientHistoryData";
import { RAW_D as RAW_ART_CULTURE } from "@/app/subject-dashboard/data/artCultureData";
import { RAW_D as RAW_ECONOMICS } from "@/app/subject-dashboard/data/economicsData";
import { RAW_D as RAW_GEOGRAPHY } from "@/app/subject-dashboard/data/geographyData";
import { RAW_D as RAW_MODERN_HISTORY } from "@/app/subject-dashboard/data/modernHistoryData";
import { RAW_D as RAW_POLITY } from "@/app/subject-dashboard/data/polityData";
import { RAW_D as RAW_SC_TECH } from "@/app/subject-dashboard/data/scTechData";

type ChapterNode = Pick<RawSubjectNode, "id" | "label" | "children">;

export interface NoteChapterTopicLink {
  slug: string;
  title: string;
  confidence: number;
  isSuggested: boolean;
}

export interface NoteChapterOption {
  id: string;
  label: string;
  topicLinks: NoteChapterTopicLink[];
}

export interface SubjectNoteChapterMap {
  subject: string;
  noteChapters: NoteChapterOption[];
  allTopicLinks: Record<string, { chapterId: string; chapterLabel: string; confidence: number }>;
}

const SUBJECT_NOTES: Record<string, RawSubjectNode[]> = {
  "Ancient History": RAW_ANCIENT,
  "Art&Culture": RAW_ART_CULTURE,
  Economics: RAW_ECONOMICS,
  Geography: RAW_GEOGRAPHY,
  "Modern History": RAW_MODERN_HISTORY,
  Polity: RAW_POLITY,
  "Science&Tech": RAW_SC_TECH,
};

const STOP_WORDS = new Set([
  "and",
  "the",
  "of",
  "to",
  "in",
  "for",
  "with",
  "on",
  "under",
  "from",
  "part",
  "chapter",
  "india",
  "indian",
  "upsc",
  "its",
  "their",
  "into",
  "through",
  "between",
  "within",
  "after",
  "before",
  "during",
  "history",
  "culture",
  "technology",
  "science",
  "modern",
  "ancient",
  "art",
]);

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 3 &&
        !STOP_WORDS.has(token) &&
        !/^(?:[ivxlcdm]+|\d+)$/.test(token),
    );
}

function collectLabels(node: ChapterNode, level = 0, maxDepth = 2): string[] {
  const labels = [node.label];
  if (!node.children || level >= maxDepth) return labels;
  node.children.forEach((child) => {
    labels.push(...collectLabels(child, level + 1, maxDepth));
  });
  return labels;
}

function scoreTopicAgainstChapter(topicTitle: string, chapter: ChapterNode): number {
  const topicNormalized = normalizeText(topicTitle);
  const topicTokens = tokenize(topicTitle);
  const chapterLabelNormalized = normalizeText(chapter.label);
  const chapterLabelTokens = new Set(tokenize(chapter.label));
  const chapterCorpus = collectLabels(chapter);
  const chapterCorpusNormalized = chapterCorpus.map((label) => normalizeText(label));
  const chapterCorpusTokens = new Set(
    chapterCorpus.flatMap((label) => tokenize(label)),
  );

  let score = 0;

  if (topicNormalized.includes(chapterLabelNormalized) || chapterLabelNormalized.includes(topicNormalized)) {
    score += 140;
  }

  topicTokens.forEach((token) => {
    if (chapterLabelTokens.has(token)) {
      score += 24;
      return;
    }
    if (chapterCorpusTokens.has(token)) {
      score += 8;
    }
  });

  chapterCorpusNormalized.forEach((label) => {
    if (!label) return;
    if (topicNormalized.includes(label) || label.includes(topicNormalized)) {
      score += 60;
    }
  });

  return score;
}

export function getSubjectNoteChapters(subject: string): NoteChapterOption[] {
  const nodes = SUBJECT_NOTES[subject] || [];
  return nodes.map((node, index) => ({
    id: node.id || `chapter-${index + 1}`,
    label: node.label,
    topicLinks: [],
  }));
}

export function buildSubjectNoteChapterMap(
  subject: string,
  quizTopics: Array<{ slug: string; title: string }>,
): SubjectNoteChapterMap {
  const rawChapters = (SUBJECT_NOTES[subject] || []) as ChapterNode[];
  const noteChapters = rawChapters.map((chapter, index) => ({
    id: chapter.id || `chapter-${index + 1}`,
    label: chapter.label,
    topicLinks: [] as NoteChapterTopicLink[],
  }));

  const allTopicLinks: SubjectNoteChapterMap["allTopicLinks"] = {};

  quizTopics.forEach((topic) => {
    const scored = rawChapters.map((chapter, index) => {
      const confidence = scoreTopicAgainstChapter(topic.title, chapter);
      return {
        chapter,
        chapterId: noteChapters[index]?.id || `chapter-${index + 1}`,
        chapterLabel: noteChapters[index]?.label || chapter.label,
        confidence,
      };
    });

    scored.sort((a, b) => b.confidence - a.confidence);
    const best = scored[0];

    if (best) {
      allTopicLinks[topic.slug] = {
        chapterId: best.chapterId,
        chapterLabel: best.chapterLabel,
        confidence: best.confidence,
      };
    }

    noteChapters.forEach((noteChapter) => {
      const matching = scored.find((item) => item.chapterId === noteChapter.id);
      if (!matching) return;

      const isSuggested = matching.chapterId === best?.chapterId;
      if (isSuggested || matching.confidence > 0) {
        noteChapter.topicLinks.push({
          slug: topic.slug,
          title: topic.title,
          confidence: matching.confidence,
          isSuggested,
        });
      }
    });
  });

  return {
    subject,
    noteChapters: noteChapters.map((chapter) => ({
      ...chapter,
      topicLinks: chapter.topicLinks.sort((a, b) => {
        if (a.isSuggested !== b.isSuggested) return a.isSuggested ? -1 : 1;
        if (a.confidence !== b.confidence) return b.confidence - a.confidence;
        return a.title.localeCompare(b.title);
      }),
    })),
    allTopicLinks,
  };
}
