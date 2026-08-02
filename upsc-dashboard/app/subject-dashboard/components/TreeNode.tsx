"use client";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type {
  ChapterAttemptSummary,
  SubjectCompletionTimes,
  SubjectNode,
  SubjectNodeStatusMap,
} from "../types";

/* -------------------------------------------------------------------------- */
/* ICONS                                                                      */
/* -------------------------------------------------------------------------- */

function IconChevron({
  open,
  className = "",
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      aria-hidden="true"
      className={className}
      style={{
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 160ms ease",
      }}
    >
      <path
        d="M7.2 4.8L12.4 10l-5.2 5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        d="M10 3a7 7 0 106.57 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 6v4l2.8 1.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.6 2.7h3.1v3.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        d="M4 13.8l-.5 2.7 2.7-.5L15 8l-2.2-2.2L4 13.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M11.8 4.7L14 2.5a1.4 1.4 0 012 2L13.8 6.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconStarFilled() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        d="M10 2.8l2.1 4.25 4.7.68-3.4 3.32.8 4.68L10 13.6 5.8 15.73l.8-4.68L3.2 7.73l4.7-.68L10 2.8z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        d="M4 15.5V10m4 5.5V6m4 9.5V11m4 4.5V4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const PRIORITY_LABELS = {
  high: "HIGH",
  mid: "MID",
  low: "LOW",
} as const;

type PriorityKey = keyof typeof PRIORITY_LABELS;

type HistoryEntry = {
  label: string;
  timestamp: number;
};

const timestampFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function normalizePriority(value?: string | null): PriorityKey | null {
  if (!value) return null;
  const raw = String(value).trim().toLowerCase();
  if (raw === "high" || raw === "h") return "high";
  if (raw === "mid" || raw === "medium" || raw === "m") return "mid";
  if (raw === "low" || raw === "l") return "low";
  return null;
}

/* -------------------------------------------------------------------------- */
/* HISTORY POPUP                                                              */
/* -------------------------------------------------------------------------- */

function HistoryPopupPortal({
  anchorRef,
  popupRef,
  isOpen,
  onClose,
  historyEntries,
  formatTimestamp,
  nodeLabel,
}: {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  popupRef: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
  historyEntries: HistoryEntry[];
  formatTimestamp: (value: number) => string;
  nodeLabel: string;
}) {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();

      const popupWidth = 320;
      const gap = 10;

      let left = rect.right - popupWidth;
      left = Math.max(16, Math.min(left, window.innerWidth - popupWidth - 16));

      let top = rect.bottom + gap;
      const estimatedHeight = Math.min(360, 72 + historyEntries.length * 44);
      if (top + estimatedHeight > window.innerHeight - 16) {
        top = Math.max(16, rect.top - estimatedHeight - gap);
      }

      setPosition({
        top,
        left,
        width: popupWidth,
      });
    };

    updatePosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popupRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [anchorRef, historyEntries.length, isOpen, onClose, popupRef]);

  if (!isOpen || !position || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={popupRef}
      className="history-popup"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 999999,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="history-popup-title">Progress History</div>
      <div className="history-popup-list">
        {historyEntries.length === 0 ? (
          <div className="history-popup-empty">
            No history yet for {nodeLabel}.
          </div>
        ) : (
          historyEntries.map((entry) => (
            <div
              key={`${entry.label}-${entry.timestamp}`}
              className="history-popup-item"
            >
              <span>{entry.label}</span>
              <span>{formatTimestamp(entry.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type TreeNodeProps = {
  node: SubjectNode;
  checkedUids: Set<string>;
  completionTimes: SubjectCompletionTimes;
  nodeStatuses: SubjectNodeStatusMap;
  effectiveCollapsed: Set<string>;
  indeterminateUids: Set<string>;
  starredUids: Set<string>;
  notes: Record<string, string>;
  visibleUids: Set<string>;
  chapterUids: Set<string>;
  chapterAttemptSummaries: Record<string, ChapterAttemptSummary>;
  nodeRenderVersions: Map<string, number>;
  treeRenderVersion: number;
  onCheck: (uid: string, checked: boolean) => void;
  onLogRevision: (uid: string) => void;
  onOpenChapterStats: (uid: string) => void;
  onToggleCollapse: (uid: string) => void;
  onToggleNote: (uid: string) => void;
  onToggleStar: (uid: string) => void;
};

/* -------------------------------------------------------------------------- */
/* NOTE LABEL PARSING                                                         */
/* -------------------------------------------------------------------------- */

type RenderLine =
  | { kind: "plain"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "number"; index: number; text: string }
  | { kind: "pill"; text: string }
  | { kind: "case"; text: string }
  | { kind: "trap"; text: string }
  | { kind: "section"; text: string }
  | { kind: "subtle"; text: string };

type StructuredBlock =
  | { type: "singleTitle"; text: string }
  | { type: "paragraphs"; lines: string[] }
  | { type: "bullets"; items: string[] }
  | { type: "numbers"; items: { index: number; text: string }[] }
  | { type: "mixedOutline"; items: OutlineItem[] }
  | { type: "caseCard"; title?: string; body: string[]; list?: string[] }
  | { type: "trapCard"; body: string[] }
  | { type: "conceptCard"; title: string; body: string[] }
  | { type: "pill"; text: string };

type OutlineItem = {
  index: number;
  text: string;
  bullets?: string[];
};

const BULLET_PREFIX = /^(?:[-•●▪◦‣]\s+)(.+)$/;
const NUMBER_PREFIX = /^(\d+)[.)]\s+(.+)$/;
const SPLIT_NUMBER_ONLY = /^(\d+)[.)]\s*$/;
const ROMAN_HEADING = /^(?:[IVXLCDM]+)\s*[-–:]\s+/i;

/**
 * Tokens that frequently end a broken line in legal/polity notes
 * and should usually merge with the next line.
 */
const ABBREVIATION_END_RE =
  /\b(?:v|vs|Art|Arts|Artcl|Sec|Secs|No|Nos|Dr|Mr|Mrs|Ms|Prof|Govt|Inst|Univ|Ltd|Co|Corp|Pvt|St|Mt|Sr|Jr|etc|CAA|SC|HC|RS|LS|UPSC|DPSP|FR|OCI|NRI)\.$/i;

/**
 * Matches trailing initials / dotted abbreviations:
 * R.M.D.C.
 * A.K.
 * B.N. Rau
 * U.S.
 */
const INITIALS_END_RE = /(?:\b(?:[A-Z]\.){2,}|(?:[A-Z]\.){1,}[A-Z]\.?)$/;

/**
 * If next line begins with one of these shapes, it is often a continuation
 * of the previous broken legal line rather than a fresh note line.
 */
const CONTINUATION_AFTER_NEWLINE_RE =
  /^(?:[A-Z][a-z]+|[A-Z]{2,}|[a-z]+|["'(][A-Za-z]|of|the|and|for|in|on|to|with|by|or|de|la|van|von|under|over|into|from|through|within|without|after|before|not|only|any|all)\b/;

/**
 * Next-line starters that almost always mean "same sentence / same case citation"
 * rather than a new point.
 */
const LEGAL_CONTINUATION_START_RE =
  /^(?:v\.?|vs\.?|Union|State|Govt|Government|India|Court|Commission|Board|Council|Parliament|Legislature|Inst\.?|Institute|University|Authority|Corporation|Company|of|the|and|under|for|in|on|to|with|by|\(\d{4}\)|\[[^\]]+\]|\([^)]+\)|[A-Z][a-z]+)/i;

/**
 * Previous line endings that strongly indicate the sentence is incomplete
 * and should merge with the next line.
 */
const HARD_CONTINUATION_END_RE =
  /(?:\b(?:v|vs|under|of|for|to|with|by|and|or|the|a|an|includes?|means?|held|said|that|which|where|when|because|if|not)\.?|[,:;(\-–—])$/i;
function isAbbreviationEnding(fragment: string) {
  const s = fragment.trim();
  return ABBREVIATION_END_RE.test(s) || INITIALS_END_RE.test(s);
}

function endsLikeHardContinuation(fragment: string) {
  const s = fragment.trim();
  return HARD_CONTINUATION_END_RE.test(s);
}

function looksLikeLegalContinuation(line: string) {
  const s = line.trim();
  return LEGAL_CONTINUATION_START_RE.test(s);
}

function isLikelyFreshStructuralLine(line: string) {
  const s = line.trim();
  if (!s) return false;

  return (
    BULLET_PREFIX.test(s) ||
    NUMBER_PREFIX.test(s) ||
    SPLIT_NUMBER_ONLY.test(s) ||
    isTrapLine(s) ||
    isCaseLine(s) ||
    isPillLine(s) ||
    looksLikeCapsHeading(s) ||
    ROMAN_HEADING.test(s)
  );
}
function looksLikeInlineHeading(line: string) {
  const s = line.trim();
  if (!s) return false;

  // Already-structured / special lines should not be hijacked as inline headings
  if (
    BULLET_PREFIX.test(s) ||
    NUMBER_PREFIX.test(s) ||
    SPLIT_NUMBER_ONLY.test(s) ||
    isTrapLine(s) ||
    isCaseLine(s) ||
    isPillLine(s) ||
    looksLikeCapsHeading(s) ||
    ROMAN_HEADING.test(s)
  ) {
    return false;
  }

  // If it already looks like a sentence or legal citation, leave it alone
  if (/[.?!]$/.test(s)) return false;
  if (s.includes(":")) return false;
  if (/\b(?:v\.?|vs\.?)\b/i.test(s)) return false;

  // Strong known subheadings used in your polity notes
  if (
    /^(?:Equality Before Law|Equal Protection of Laws|Includes|Exceptions?|Restrictions?|Conditions?|Prohibited grounds|Implied rights|Clauses|Scope|Meaning|Test|Features|Sources|Kinds|Types|Classification)$/i.test(
      s,
    )
  ) {
    return true;
  }

  return false;
}
function splitRawLines(input: string): string[] {
  const rawLines = input
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .split("\n")
    .map((line) => line.replace(/\t/g, " ").trim())
    .filter((line) => line.length > 0);

  if (rawLines.length <= 1) return rawLines;

  const merged: string[] = [];

  for (const rawLine of rawLines) {
    const line = rawLine.trim();

    if (!line) continue;

    if (merged.length === 0) {
      merged.push(line);
      continue;
    }

    const prev = merged[merged.length - 1];
    const prevTrim = prev.trim();
    const currTrim = line.trim();

    if (!prevTrim || !currTrim) {
      merged.push(line);
      continue;
    }

    const currentLooksStructural = isLikelyFreshStructuralLine(currTrim);

    const shouldMergeByAbbreviation =
      isAbbreviationEnding(prevTrim) &&
      CONTINUATION_AFTER_NEWLINE_RE.test(currTrim);

    const shouldMergeByHardContinuation =
      endsLikeHardContinuation(prevTrim) &&
      looksLikeLegalContinuation(currTrim) &&
      !currentLooksStructural;
    const shouldMergeByCitationPattern =
      // Ends with dotted initials / legal abbreviations
      (INITIALS_END_RE.test(prevTrim) ||
        // Ends with common legal short forms that genuinely break across lines
        /\b(?:v\.?|vs\.?|Inst\.?|Govt\.?|Univ\.?|Ltd\.?|Corp\.?|Pvt\.?|Co\.?)$/i.test(
          prevTrim,
        ) ||
        // Ends with a year/parenthetical and next line is still clearly continuation
        /\(\d{4}\)\.?$/.test(prevTrim) ||
        // Ends with a dangling opening-bracket style legal fragment
        /(?:\([^)]+|\[[^\]]+)$/.test(prevTrim)) &&
      looksLikeLegalContinuation(currTrim) &&
      !currentLooksStructural;
    /**
     * Extra safety:
     * If previous line clearly looks unfinished and next line is short legal continuation,
     * merge them instead of creating ugly broken paragraphs.
     */
    // const shouldMergeBySentenceFlow =
    //   !/[.?!]$/.test(prevTrim) &&
    //   looksLikeLegalContinuation(currTrim) &&
    //   !currentLooksStructural;

    const shouldMerge =
      shouldMergeByAbbreviation ||
      shouldMergeByHardContinuation ||
      shouldMergeByCitationPattern;
    // || shouldMergeBySentenceFlow
    if (shouldMerge) {
      merged[merged.length - 1] = `${prevTrim} ${currTrim}`
        .replace(/\s+/g, " ")
        .trim();
    } else {
      merged.push(line);
    }
  }

  return merged;
}

function looksLikeCapsHeading(line: string) {
  const cleaned = line.replace(/[^\w\s/&()-]/g, "").trim();
  if (!cleaned) return false;
  const letters = cleaned.replace(/[^A-Za-z]/g, "");
  if (letters.length < 4) return false;
  return cleaned === cleaned.toUpperCase();
}

function isTrapLine(line: string) {
  return /^TRAP\s*:/i.test(line);
}

function isCaseLine(line: string) {
  return /^CASE\s*:/i.test(line);
}

function isPillLine(line: string) {
  return /^ARTICLE\s+\d+/i.test(line) || /^ART\s*\d+/i.test(line);
}

function cleanCasePrefix(line: string) {
  return line.replace(/^CASE\s*:\s*/i, "").trim();
}

function cleanTrapPrefix(line: string) {
  return line.replace(/^TRAP\s*:\s*/i, "").trim();
}

function explodeInlineBullets(line: string): string[] {
  if (!line.includes("•")) return [line];
  return line
    .split("•")
    .map((part) => part.trim())
    .filter(Boolean);
}

function explodeInlineNumbers(line: string): string[] {
  const matches = [...line.matchAll(/(?:^|\s)(\d+)[.)]\s+/g)];
  if (matches.length < 2) return [line];

  const parts: string[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].index ?? 0;
    const actualStart =
      start === 0 ? start : start + (matches[i][0].startsWith(" ") ? 1 : 0);
    const end =
      i + 1 < matches.length
        ? (matches[i + 1].index ?? line.length)
        : line.length;
    const chunk = line.slice(actualStart, end).trim();
    if (chunk) parts.push(chunk);
  }
  return parts.length > 0 ? parts : [line];
}

function normalizeLines(input: string): string[] {
  const raw = splitRawLines(input);
  const out: string[] = [];

  for (const rawLine of raw) {
    const byBullet = explodeInlineBullets(rawLine);
    for (const maybeBullet of byBullet) {
      const byNumbers = explodeInlineNumbers(maybeBullet);
      out.push(...byNumbers);
    }
  }

  return out.map((line) => line.trim()).filter(Boolean);
}

function parseRenderLines(input: string): RenderLine[] {
  const lines = normalizeLines(input);
  const result: RenderLine[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (isTrapLine(line)) {
      result.push({ kind: "trap", text: cleanTrapPrefix(line) });
      continue;
    }

    if (isCaseLine(line)) {
      result.push({ kind: "case", text: cleanCasePrefix(line) });
      continue;
    }

    if (isPillLine(line)) {
      result.push({ kind: "pill", text: line });
      continue;
    }

    const splitNumber = line.match(SPLIT_NUMBER_ONLY);
    if (splitNumber) {
      const next = lines[i + 1];
      if (next) {
        result.push({
          kind: "number",
          index: Number(splitNumber[1]),
          text: next,
        });
        i += 1;
        continue;
      }
    }

    const numbered = line.match(NUMBER_PREFIX);
    if (numbered) {
      result.push({
        kind: "number",
        index: Number(numbered[1]),
        text: numbered[2].trim(),
      });
      continue;
    }

    const bullet = line.match(BULLET_PREFIX);
    if (bullet) {
      result.push({ kind: "bullet", text: bullet[1].trim() });
      continue;
    }

    if (
      looksLikeCapsHeading(line) ||
      ROMAN_HEADING.test(line) ||
      looksLikeInlineHeading(line)
    ) {
      result.push({ kind: "section", text: line });
      continue;
    }

    if (
      line.length <= 48 &&
      !/[.?!]$/.test(line) &&
      !line.includes(":") &&
      !line.includes("—") &&
      !line.includes("–") &&
      !/\b(?:v\.?|vs\.?|Art|Article|State|Union|Government|Court|Commission|Act|Case)\b/i.test(
        line,
      )
    ) {
      result.push({ kind: "subtle", text: line });
      continue;
    }

    result.push({ kind: "plain", text: line });
  }

  return result;
}

function buildOutline(lines: RenderLine[]): OutlineItem[] | null {
  const numberLines = lines.filter((line) => line.kind === "number") as Array<
    Extract<RenderLine, { kind: "number" }>
  >;

  if (numberLines.length === 0) return null;

  const outline: OutlineItem[] = [];
  let current: OutlineItem | null = null;

  for (const line of lines) {
    if (line.kind === "number") {
      current = {
        index: line.index,
        text: line.text,
        bullets: [],
      };
      outline.push(current);
      continue;
    }

    if (!current) return null;

    if (line.kind === "bullet") {
      current.bullets?.push(line.text);
      continue;
    }

    if (
      line.kind === "plain" ||
      line.kind === "subtle" ||
      line.kind === "section"
    ) {
      current.text = `${current.text} ${line.text}`.replace(/\s+/g, " ").trim();
      continue;
    }

    if (line.kind === "trap") {
      current.bullets?.push(`TRAP: ${line.text}`);
      continue;
    }

    if (line.kind === "case") {
      current.bullets?.push(`CASE: ${line.text}`);
      continue;
    }

    if (line.kind === "pill") {
      current.bullets?.push(line.text);
      continue;
    }
  }

  return outline.length > 0 ? outline : null;
}
function splitConceptTitle(
  line: string,
): { title: string; rest: string | null } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Match things like:
  // "Doctrine of Severability: Only offending part..."
  // "Meaning of 'Law' under Art 13: Includes..."
  // "Rule of Eclipse: ..."
  const colonIndex = trimmed.indexOf(":");
  if (colonIndex <= 0) return null;

  const title = trimmed.slice(0, colonIndex).trim();
  const rest = trimmed.slice(colonIndex + 1).trim();

  if (!title) return null;

  const conceptTitleRe =
    /^(?:Doctrine of|Meaning of|Rule of|Concept of|Scope of|Nature of|Object of|Test of|Article\s+\d+|Art\.?\s*\d+)/i;

  if (!conceptTitleRe.test(title)) return null;

  return {
    title,
    rest: rest || null,
  };
}

function shouldUseConceptCard(lines: RenderLine[]) {
  if (lines.length === 0) return false;
  if (lines[0].kind !== "plain") return false;

  const first = lines[0].text.trim();
  const parsed = splitConceptTitle(first);
  if (!parsed) return false;

  // Avoid hijacking very list-heavy structures
  const hasListyContent = lines.some(
    (line) =>
      line.kind === "bullet" ||
      line.kind === "number" ||
      line.kind === "trap" ||
      line.kind === "case",
  );

  return !hasListyContent;
}
function buildStructuredBlocks(label: string): StructuredBlock[] {
  const lines = parseRenderLines(label);
  if (lines.length === 0) return [];

  const outline = buildOutline(lines);
  if (outline && outline.length > 0) {
    return [{ type: "mixedOutline", items: outline }];
  }

  if (lines.every((line) => line.kind === "trap")) {
    return [
      {
        type: "trapCard",
        body: lines.map(
          (line) => (line as Extract<RenderLine, { kind: "trap" }>).text,
        ),
      },
    ];
  }

  if (shouldUseConceptCard(lines)) {
    const firstLine = lines[0].text.trim();
    const parsed = splitConceptTitle(firstLine);

    if (parsed) {
      const body: string[] = [];

      if (parsed.rest) {
        body.push(parsed.rest);
      }

      for (const line of lines.slice(1)) {
        body.push(line.text);
      }

      return [
        {
          type: "conceptCard",
          title: parsed.title,
          body,
        },
      ];
    }
  }

  const first = lines[0];
  const rest = lines.slice(1);

  const blocks: StructuredBlock[] = [];

  const firstLooksTitle =
    first.kind === "subtle" ||
    first.kind === "section" ||
    first.kind === "pill";

  if (firstLooksTitle) {
    if (first.kind === "pill") {
      blocks.push({ type: "pill", text: first.text });
    } else {
      blocks.push({ type: "singleTitle", text: first.text });
    }
  }

  const source = firstLooksTitle ? rest : lines;

  const paragraphs: string[] = [];
  const bullets: string[] = [];
  const numbers: { index: number; text: string }[] = [];

  const flushParagraphs = () => {
    if (paragraphs.length > 0) {
      blocks.push({ type: "paragraphs", lines: [...paragraphs] });
      paragraphs.length = 0;
    }
  };

  const flushBullets = () => {
    if (bullets.length > 0) {
      blocks.push({ type: "bullets", items: [...bullets] });
      bullets.length = 0;
    }
  };

  const flushNumbers = () => {
    if (numbers.length > 0) {
      blocks.push({ type: "numbers", items: [...numbers] });
      numbers.length = 0;
    }
  };

  for (const line of source) {
    if (line.kind === "bullet") {
      flushParagraphs();
      flushNumbers();
      bullets.push(line.text);
      continue;
    }

    if (line.kind === "number") {
      flushParagraphs();
      flushBullets();
      numbers.push({ index: line.index, text: line.text });
      continue;
    }

    if (line.kind === "trap") {
      flushParagraphs();
      flushBullets();
      flushNumbers();
      blocks.push({ type: "trapCard", body: [line.text] });
      continue;
    }

    if (line.kind === "case") {
      flushParagraphs();
      flushBullets();
      flushNumbers();
      blocks.push({ type: "caseCard", title: line.text, body: [] });
      continue;
    }

    if (line.kind === "pill") {
      flushParagraphs();
      flushBullets();
      flushNumbers();
      blocks.push({ type: "pill", text: line.text });
      continue;
    }

    if (line.kind === "section") {
      flushParagraphs();
      flushBullets();
      flushNumbers();
      blocks.push({ type: "singleTitle", text: line.text });
      continue;
    }

    flushBullets();
    flushNumbers();
    paragraphs.push(line.text);
  }

  flushParagraphs();
  flushBullets();
  flushNumbers();

  if (blocks.length === 0) {
    return [{ type: "paragraphs", lines: lines.map((line) => line.text) }];
  }

  return blocks;
}

/* -------------------------------------------------------------------------- */
/* RENDER HELPERS                                                             */
/* -------------------------------------------------------------------------- */

function renderStructuredLabel(label: string) {
  const blocks = buildStructuredBlocks(label);

  if (blocks.length === 0) {
    return <div className="note-copy">{label}</div>;
  }

  return (
    <div className="note-copy">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "singleTitle":
            return (
              <div key={index} className="note-title">
                {block.text}
              </div>
            );

          case "pill":
            return (
              <div key={index} className="note-pill">
                {block.text}
              </div>
            );

          case "paragraphs":
            return (
              <div key={index} className="note-paragraphs">
                {block.lines.map((line, lineIndex) => (
                  <p key={lineIndex} className="note-paragraph">
                    {line}
                  </p>
                ))}
              </div>
            );

          case "bullets":
            return (
              <ul key={index} className="note-bullets">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            );

          case "numbers":
            return (
              <ol key={index} className="note-numbered">
                {block.items.map((item, itemIndex) => (
                  <li key={`${item.index}-${itemIndex}`}>
                    <span className="num">{item.index}</span>
                    <div className="num-copy">{item.text}</div>
                  </li>
                ))}
              </ol>
            );

          case "mixedOutline":
            return (
              <ol key={index} className="note-outline">
                {block.items.map((item) => (
                  <li key={item.index} className="outline-item">
                    <div className="outline-head">
                      <span className="num">{item.index}</span>
                      <div className="outline-copy">{item.text}</div>
                    </div>

                    {item.bullets && item.bullets.length > 0 ? (
                      <ul className="outline-bullets">
                        {item.bullets.map((bullet, bulletIndex) => {
                          const isTrap = /^TRAP:\s*/i.test(bullet);
                          const isCase = /^CASE:\s*/i.test(bullet);

                          if (isTrap) {
                            return (
                              <li key={bulletIndex} className="outline-special">
                                <div className="trap-card compact">
                                  <span className="note-chip amber">TRAP</span>
                                  <div className="trap-copy">
                                    {bullet.replace(/^TRAP:\s*/i, "")}
                                  </div>
                                </div>
                              </li>
                            );
                          }

                          if (isCase) {
                            return (
                              <li key={bulletIndex} className="outline-special">
                                <div className="case-card compact">
                                  <span className="note-chip purple">CASE</span>
                                  <div className="case-copy">
                                    {bullet.replace(/^CASE:\s*/i, "")}
                                  </div>
                                </div>
                              </li>
                            );
                          }

                          return <li key={bulletIndex}>{bullet}</li>;
                        })}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ol>
            );

          case "caseCard":
            return (
              <div key={index} className="case-card">
                <span className="note-chip purple">CASE</span>

                {block.title ? (
                  <div className="case-title">{block.title}</div>
                ) : null}

                {block.body.length > 0 ? (
                  <div className="case-body">
                    {block.body.map((line, lineIndex) => (
                      <p key={lineIndex}>{line}</p>
                    ))}
                  </div>
                ) : null}

                {block.list && block.list.length > 0 ? (
                  <ol className="case-list">
                    {block.list.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ol>
                ) : null}
              </div>
            );
          case "conceptCard":
            return (
              <div key={index} className="concept-card">
                <div className="concept-title">{block.title}</div>
                <div className="concept-body">
                  {block.body.map((line, lineIndex) => (
                    <p key={lineIndex}>{line}</p>
                  ))}
                </div>
              </div>
            );
          case "trapCard":
            return (
              <div key={index} className="trap-card">
                <span className="note-chip amber">TRAP</span>
                <div className="trap-copy">
                  {block.body.map((line, lineIndex) => (
                    <p key={lineIndex}>{line}</p>
                  ))}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

function TreeNodeComponent(props: TreeNodeProps) {
  const {
    node,
    checkedUids,
    completionTimes,
    nodeStatuses,
    effectiveCollapsed,
    indeterminateUids,
    starredUids,
    notes,
    visibleUids,
    chapterUids,
    chapterAttemptSummaries,
    onCheck,
    onLogRevision,
    onOpenChapterStats,
    onToggleCollapse,
    onToggleNote,
    onToggleStar,
  } = props;

  const hasKids = !!node.children && node.children.length > 0;
  const isLeaf = !hasKids;
  const isCollapsed = effectiveCollapsed.has(node.uid);
  const nodeStatusValue = nodeStatuses[node.uid];

  const isObjectStatus =
    nodeStatusValue &&
    typeof nodeStatusValue === "object" &&
    !Array.isArray(nodeStatusValue);

  const nodeStatus = isObjectStatus
    ? (nodeStatusValue as {
        isChecked?: boolean;
        completedAt?: number;
        revisedAt?: number;
        revisions?: number[];
      })
    : null;

  const completionRecord = completionTimes[node.uid];
  const normalizedCompletionRecord =
    typeof completionRecord === "number"
      ? {
          completedAt: completionRecord,
          revisedAt: undefined,
          revisions: [] as number[],
        }
      : completionRecord && typeof completionRecord === "object"
        ? completionRecord
        : null;

  const derivedRecord = {
    isChecked: isLeaf
      ? checkedUids.has(node.uid)
      : Boolean(nodeStatus?.isChecked),
    completedAt: isLeaf
      ? normalizedCompletionRecord?.completedAt
      : nodeStatus?.completedAt,
    revisedAt: isLeaf
      ? normalizedCompletionRecord?.revisedAt
      : nodeStatus?.revisedAt,
    revisions: isLeaf
      ? Array.isArray(normalizedCompletionRecord?.revisions)
        ? normalizedCompletionRecord.revisions
        : []
      : Array.isArray(nodeStatus?.revisions)
        ? nodeStatus.revisions
        : [],
  };

  const isChecked = derivedRecord.isChecked;
  const isIndeterminate = indeterminateUids.has(node.uid);
  const isStarred = starredUids.has(node.uid);
  const hasNote = !!notes[node.uid];
  const isHidden = visibleUids.size > 0 && !visibleUids.has(node.uid);

  const normalizedPriority = normalizePriority(node.p);
  const isChapterNode = chapterUids.has(node.uid);
  const chapterSummary = chapterAttemptSummaries[node.uid];

  const checkboxRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const badgeAnchorRef = useRef<HTMLDivElement>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMarkingRevision, setIsMarkingRevision] = useState(false);

  const renderedLabel = useMemo(
    () => renderStructuredLabel(node.label),
    [node.label],
  );

  const revisionCount = derivedRecord.revisions?.length || 0;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const formatTimestamp = (timestamp: number) =>
    timestampFormatter.format(timestamp);

  const statusText = derivedRecord.completedAt
    ? [
        `Completed ${formatTimestamp(derivedRecord.completedAt)}`,
        derivedRecord.revisedAt
          ? `Revised ${formatTimestamp(derivedRecord.revisedAt)}`
          : null,
      ]
        .filter(Boolean)
        .join("  |  ")
    : "";

  const historyEntries: HistoryEntry[] = useMemo(() => {
    const entries: HistoryEntry[] = [];

    if (derivedRecord.completedAt) {
      entries.push({
        label: "Completed",
        timestamp: derivedRecord.completedAt,
      });
    }

    if (Array.isArray(derivedRecord.revisions)) {
      derivedRecord.revisions.forEach((timestamp, index) => {
        if (typeof timestamp === "number" && Number.isFinite(timestamp)) {
          entries.push({
            label: `Revision ${index + 1}`,
            timestamp,
          });
        }
      });
    }

    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }, [derivedRecord.completedAt, derivedRecord.revisions]);

  const handleRowClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    if (
      target.tagName === "INPUT" ||
      target.closest(".node-actions") ||
      target.closest(".history-popup") ||
      target.closest(".history-badge-wrap")
    ) {
      return;
    }

    if (hasKids) {
      onToggleCollapse(node.uid);
    }
  };

  const handleRevisionClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    if (!isLeaf || !derivedRecord.completedAt || isMarkingRevision) return;

    try {
      setIsMarkingRevision(true);
      await Promise.resolve(onLogRevision(node.uid));
    } finally {
      setIsMarkingRevision(false);
    }
  };

  if (isHidden) return null;

  return (
    <li
      id={`subject-node-${node.uid}`}
      data-subject-node-uid={node.uid}
      className={[
        "tnode",
        hasKids ? "has-kids" : "leaf",
        isCollapsed ? "collapsed" : "expanded",
        isChecked ? "checked" : "",
        isIndeterminate ? "indeterminate" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="ncard" onClick={handleRowClick}>
        <div className="nhead">
          <div className="nhead-left">
            {hasKids ? (
              <button
                type="button"
                className="collapse-btn"
                aria-label={isCollapsed ? "Expand node" : "Collapse node"}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleCollapse(node.uid);
                }}
              >
                <IconChevron open={!isCollapsed} />
              </button>
            ) : (
              <span className="collapse-spacer" />
            )}

            <input
              ref={checkboxRef}
              type="checkbox"
              checked={isChecked}
              onChange={(event) => {
                event.stopPropagation();
                onCheck(node.uid, event.target.checked);
              }}
              onClick={(event) => event.stopPropagation()}
            />

            <div className="node-copy">
              <div className="nlabel">{renderedLabel}</div>
              {statusText ? (
                <div className="node-meta">{statusText}</div>
              ) : null}
            </div>
          </div>

          <div className="nhead-right">
            {normalizedPriority ? (
              <span
                className={`pbadge ${normalizedPriority}`}
                onClick={(event) => event.stopPropagation()}
              >
                {PRIORITY_LABELS[normalizedPriority]}
              </span>
            ) : null}

            <div
              className="node-actions"
              onClick={(event) => event.stopPropagation()}
            >
              {isChapterNode && chapterSummary ? (
                <button
                  type="button"
                  className="act-btn chapter"
                  title="View chapter test analytics"
                  onClick={() => onOpenChapterStats(node.uid)}
                >
                  <IconChart />
                </button>
              ) : null}

              {isLeaf ? (
                <button
                  type="button"
                  className={`act-btn history ${
                    isMarkingRevision ? "disabled" : ""
                  }`}
                  title="Mark revision"
                  onClick={handleRevisionClick}
                  disabled={isMarkingRevision || !derivedRecord.completedAt}
                >
                  <IconHistory />
                </button>
              ) : null}

              <button
                type="button"
                className={`act-btn note ${hasNote ? "active" : ""}`}
                title={hasNote ? "Edit note" : "Add note"}
                onClick={() => onToggleNote(node.uid)}
              >
                <IconPencil />
              </button>

              <button
                type="button"
                className={`act-btn star ${isStarred ? "active" : ""}`}
                title={isStarred ? "Unstar" : "Star"}
                onClick={() => onToggleStar(node.uid)}
              >
                <IconStarFilled />
              </button>

              <div
                ref={badgeAnchorRef}
                className="history-badge-wrap"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className={`history-badge ${isHistoryOpen ? "active" : ""}`}
                  title="View progress history"
                  onClick={() => setIsHistoryOpen((prev) => !prev)}
                >
                  {revisionCount}
                </button>

                <HistoryPopupPortal
                  anchorRef={badgeAnchorRef}
                  popupRef={popupRef}
                  isOpen={isHistoryOpen}
                  onClose={() => setIsHistoryOpen(false)}
                  historyEntries={historyEntries}
                  formatTimestamp={formatTimestamp}
                  nodeLabel={node.label}
                />
              </div>
            </div>
          </div>
        </div>

        {hasNote && notes[node.uid] ? (
          <div className="user-note">{notes[node.uid]}</div>
        ) : null}
      </div>

      {hasKids ? (
        <ul className={`tnodes child ${isCollapsed ? "hidden" : ""}`}>
          {node.children?.map((child) => (
            <TreeNode key={child.uid} {...props} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

// ⚡ PRO POWER FIX: Activate the dormant recursive version engine to block 99% of checkbox render lag
function arePropsEqual(prevProps: TreeNodeProps, nextProps: TreeNodeProps) {
  const uid = prevProps.node.uid;
  const prevVersion = prevProps.nodeRenderVersions.get(uid);
  const nextVersion = nextProps.nodeRenderVersions.get(uid);

  return (
    prevVersion === nextVersion &&
    prevProps.treeRenderVersion === nextProps.treeRenderVersion &&
    prevProps.visibleUids.has(uid) === nextProps.visibleUids.has(uid)
  );
}

export const TreeNode = memo(TreeNodeComponent, arePropsEqual);
export default TreeNode;
