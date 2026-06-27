"use client";

import { useMemo, useState } from "react";
import SyllabusTopicNotesPopup from "@/features/syllabus/components/SyllabusTopicNotesPopup";
import {
  syllabusTrackerTree,
  type SyllabusTrackerNodeItem,
  type SyllabusTrackerSubjectItem,
} from "@/lib/data/syllabusTrackerTree";
import type { AttemptResponse } from "@/lib/api/attempts";
import type {
  SyllabusDashboardPayload,
  SyllabusTopicNoteTarget,
} from "@/types/syllabus";

interface SyllabusTrackerScreenProps {
  dashboard: SyllabusDashboardPayload | null;
  attempts: AttemptResponse[];
  isLoading: boolean;
  isRefreshing: boolean;
  onBack: () => void;
}

type ProgressLookup = {
  subjectProgressByTitle: Map<string, number>;
  topicProgressByKey: Map<string, number>;
};

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function buildProgressLookup(
  dashboard: SyllabusDashboardPayload | null,
  attempts: AttemptResponse[],
): ProgressLookup {
  const subjectProgressByTitle = new Map<string, number>();
  const topicProgressByKey = new Map<string, number>();

  for (const node of dashboard?.nodes ?? []) {
    if (node.level === "subject") {
      subjectProgressByTitle.set(
        node.subject,
        clampPercentage(node.metrics.masteryScore),
      );
    }

    if (node.level === "topic") {
      topicProgressByKey.set(
        `${node.subject}::${node.label}`.toLowerCase(),
        clampPercentage(node.metrics.masteryScore),
      );
    }
  }

  const aggregates = new Map();
  for (const attempt of attempts) {
    const subject = String(attempt.subject || "").trim();
    const topic = String(attempt.topic || "").trim();
    const subtopic = String(attempt.subtopic || "").trim();
    if (!subject || !topic) continue;

    const key = `${subject}::${subtopic || topic}`.toLowerCase();
    const current = aggregates.get(key) || { totalAccuracy: 0, count: 0 };
    current.totalAccuracy += clampPercentage(Number(attempt.accuracy) || 0);
    current.count += 1;
    aggregates.set(key, current);
  }

  for (const [key, aggregate] of aggregates.entries()) {
    if (!aggregate.count) continue;
    topicProgressByKey.set(
      key,
      clampPercentage(aggregate.totalAccuracy / aggregate.count),
    );
  }

  return {
    subjectProgressByTitle,
    topicProgressByKey,
  };
}

function getLeafProgress(
  lookup: ProgressLookup,
  subjectKey: string,
  item: SyllabusTrackerNodeItem,
): number {
  return (
    lookup.topicProgressByKey.get(
      `${subjectKey}::${item.progressKey || item.title}`.toLowerCase(),
    ) || 0
  );
}

function getNodeProgress(
  lookup: ProgressLookup,
  subjectKey: string,
  item: SyllabusTrackerNodeItem,
): number {
  if (item.children && item.children.length > 0) {
    const childProgressValues = item.children.map((child) =>
      getNodeProgress(lookup, subjectKey, child),
    );
    const total = childProgressValues.reduce((sum, child) => sum + child, 0);
    const averagedChildProgress = clampPercentage(total / item.children.length);
    const directProgress = getLeafProgress(lookup, subjectKey, item);
    if (averagedChildProgress <= 0 && directProgress > 0) return directProgress;
    return averagedChildProgress;
  }

  return getLeafProgress(lookup, subjectKey, item);
}

function getSubjectProgress(
  lookup: ProgressLookup,
  subject: SyllabusTrackerSubjectItem,
): number {
  const subjectKey = subject.progressKey || subject.title;
  if (subject.chapters.length === 0) {
    return lookup.subjectProgressByTitle.get(subjectKey) || 0;
  }

  const total = subject.chapters.reduce(
    (sum, chapter) => sum + getNodeProgress(lookup, subjectKey, chapter),
    0,
  );
  return clampPercentage(total / subject.chapters.length);
}

function countLeafNodes(item: SyllabusTrackerNodeItem): number {
  if (!item.children || item.children.length === 0) return 1;
  return item.children.reduce((sum, child) => sum + countLeafNodes(child), 0);
}

function countMasteredLeaves(
  lookup: ProgressLookup,
  subjectKey: string,
  item: SyllabusTrackerNodeItem,
): number {
  if (!item.children || item.children.length === 0) {
    return getLeafProgress(lookup, subjectKey, item) >= 100 ? 1 : 0;
  }

  return item.children.reduce(
    (sum, child) => sum + countMasteredLeaves(lookup, subjectKey, child),
    0,
  );
}

function getLevelMeta(level: number): {
  label: string;
  className: string;
  countLabel: string;
} {
  if (level === 0) {
    return { label: "Chapter", className: "chapter", countLabel: "children" };
  }
  if (level === 1) {
    return { label: "Topic", className: "topic", countLabel: "subtopics" };
  }
  return { label: "Subtopic", className: "subtopic", countLabel: "items" };
}

function Chevron({
  isOpen,
  isComplete,
}: {
  isOpen: boolean;
  isComplete: boolean;
}) {
  return (
    <span
      className={`tracker-subject-indicator${isComplete ? " is-complete" : ""}${
        isOpen ? " is-open" : ""
      }`}
      aria-hidden="true"
    />
  );
}

function TreeNodeRow({
  node,
  subjectTitle,
  subjectKey,
  lookup,
  level,
  pathTitles,
  pathKeys,
  onOpenTopicNotes,
}: {
  node: SyllabusTrackerNodeItem;
  subjectTitle: string;
  subjectKey: string;
  lookup: ProgressLookup;
  level: number;
  pathTitles: string[];
  pathKeys: string[];
  onOpenTopicNotes: (target: SyllabusTopicNoteTarget) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const progress = getNodeProgress(lookup, subjectKey, node);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const meta = getLevelMeta(level);
  const totalLeaves = hasChildren ? countLeafNodes(node) : 0;
  const completedLeaves = hasChildren
    ? countMasteredLeaves(lookup, subjectKey, node)
    : 0;
  const visualDepth = Math.min(level + 1, 3);
  const currentPathTitles = [...pathTitles, node.title];
  const currentPathKeys = [...pathKeys, node.progressKey || node.title];

  return (
    <div
      className={`tracker-tree-node tracker-tree-node-depth-${visualDepth}`}
    >
      {level > 0 ? <div className="tracker-tree-branch" aria-hidden="true" /> : null}
      {hasChildren ? (
        <button
          type="button"
          className={`tracker-subject-card tracker-subject-card-nested tracker-subject-card-depth-${
            visualDepth
          }${isOpen ? " is-selected" : ""}`}
          onClick={() => {
            setIsOpen((value) => !value);
          }}
        >
          <div className="tracker-subject-rail" />
          <div className="tracker-subject-content">
            <div className="tracker-node-head">
              <span className={`tracker-node-kicker tracker-node-kicker-${meta.className}`}>
                {meta.label}
              </span>
              <span className="tracker-node-count">
                {node.children?.length || 0} {meta.countLabel}
              </span>
            </div>
            <strong>{node.title}</strong>
            <div className="tracker-subject-progress-row">
              <div className="tracker-subject-progress-track">
                <span
                  className="tracker-subject-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>{progress.toFixed(2)}%</span>
            </div>
            <small className="tracker-subject-meta">
              {completedLeaves}/{totalLeaves} completed
            </small>
          </div>
          <Chevron isOpen={isOpen} isComplete={progress >= 100} />
        </button>
      ) : (
        <div
          className={`tracker-subject-card tracker-subject-card-nested tracker-subject-card-depth-${
            visualDepth
          } tracker-subject-card-leaf`}
        >
          <div className="tracker-subject-rail" />
          <div className="tracker-subject-content">
            <div className="tracker-node-head">
              <span className={`tracker-node-kicker tracker-node-kicker-${meta.className}`}>
                {meta.label}
              </span>
              <span className="tracker-node-count">Leaf Topic</span>
            </div>
            <strong>{node.title}</strong>
            <div className="tracker-subject-progress-row">
              <div className="tracker-subject-progress-track">
                <span
                  className="tracker-subject-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>{progress.toFixed(2)}%</span>
            </div>
            <small className="tracker-subject-meta">
              Personal notes stay saved for this topic.
            </small>
          </div>
          <button
            type="button"
            className="tracker-leaf-note-btn ripple-btn"
            onClick={() =>
              onOpenTopicNotes({
                subject: subjectTitle,
                topicKey: currentPathKeys.join("::"),
                topicLabel: node.title,
                path: [subjectTitle, ...currentPathTitles],
              })
            }
          >
            Notes
          </button>
        </div>
      )}

      {hasChildren && isOpen ? (
        <div className="tracker-tree-children">
          {node.children?.map((child) => (
            <TreeNodeRow
              key={`${node.id}-${child.id}`}
              node={child}
              subjectTitle={subjectTitle}
              subjectKey={subjectKey}
              lookup={lookup}
              level={level + 1}
              pathTitles={currentPathTitles}
              pathKeys={currentPathKeys}
              onOpenTopicNotes={onOpenTopicNotes}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SubjectRow({
  subject,
  lookup,
  defaultOpen = false,
  onOpenTopicNotes,
}: {
  subject: SyllabusTrackerSubjectItem;
  lookup: ProgressLookup;
  defaultOpen?: boolean;
  onOpenTopicNotes: (target: SyllabusTopicNoteTarget) => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const subjectKey = subject.progressKey || subject.title;
  const subjectProgress = getSubjectProgress(lookup, subject);
  const leafCount = subject.chapters.reduce(
    (sum, chapter) => sum + countLeafNodes(chapter),
    0,
  );
  const completedLeaves = subject.chapters.reduce(
    (sum, chapter) => sum + countMasteredLeaves(lookup, subjectKey, chapter),
    0,
  );

  return (
    <div className="tracker-tree-node tracker-tree-node-subject">
      <button
        type="button"
        className={`tracker-subject-card${isOpen ? " is-selected" : ""}`}
        onClick={() => setIsOpen((value) => !value)}
      >
        <div className="tracker-subject-rail" />
        <div className="tracker-subject-content">
          <div className="tracker-node-head">
            <span className="tracker-node-kicker tracker-node-kicker-subject">
              Subject
            </span>
            <span className="tracker-node-count">
              {subject.chapters.length} chapters
            </span>
          </div>
          <strong>{subject.title}</strong>
          <div className="tracker-subject-progress-row">
            <div className="tracker-subject-progress-track">
              <span
                className="tracker-subject-progress-fill"
                style={{ width: `${subjectProgress}%` }}
              />
            </div>
            <span>{subjectProgress.toFixed(2)}%</span>
          </div>
          <small className="tracker-subject-meta">
            {completedLeaves}/{leafCount} completed
          </small>
        </div>
        <Chevron isOpen={isOpen} isComplete={subjectProgress >= 100} />
      </button>

      {isOpen ? (
        <div className="tracker-tree-children">
          {subject.chapters.map((chapter) => (
            <TreeNodeRow
              key={`${subject.id}-${chapter.id}`}
              node={chapter}
              subjectTitle={subject.title}
              subjectKey={subjectKey}
              lookup={lookup}
              level={0}
              pathTitles={[]}
              pathKeys={[]}
              onOpenTopicNotes={onOpenTopicNotes}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function SyllabusTrackerScreen({
  dashboard,
  attempts,
  isLoading,
  isRefreshing,
  onBack,
}: SyllabusTrackerScreenProps) {
  const lookup = useMemo(
    () => buildProgressLookup(dashboard, attempts),
    [attempts, dashboard],
  );
  const [activeTopicNoteTarget, setActiveTopicNoteTarget] =
    useState<SyllabusTopicNoteTarget | null>(null);
  const firstSubject = syllabusTrackerTree[0] || null;
  const completedPercentage = clampPercentage(
    dashboard?.summary.totalTopics
      ? (dashboard.summary.masteredTopics / dashboard.summary.totalTopics) * 100
      : 0,
  );

  return (
    <section className="tracker-screen tracker-syllabus-screen">
      <header className="tracker-screen-header">
        <button
          type="button"
          className="tracker-back-button ripple-btn"
          onClick={onBack}
          aria-label="Go back"
        >
          &#8249;
        </button>
        <div>
          <h2 className="tracker-screen-title">SYLLABUS TRACKER</h2>
          <p className="tracker-screen-subtitle">
            {isRefreshing
              ? "Refreshing syllabus progress"
              : "Open a subject and keep drilling down through chapters, topics, and subtopics."}
          </p>
        </div>
      </header>

      <section className="tracker-summary-card">
        <div className="tracker-summary-ring-shell">
          <div
            className="tracker-summary-ring"
            style={{
              background: `conic-gradient(from 180deg, rgba(24, 236, 200, 0.92) 0deg ${
                completedPercentage * 3.6
              }deg, rgba(24, 236, 200, 0.14) ${completedPercentage * 3.6}deg 360deg)`,
            }}
          >
            <div className="tracker-summary-ring-core">
              <strong>{isLoading ? "..." : `${completedPercentage.toFixed(1)}%`}</strong>
              <span>Completed</span>
            </div>
          </div>
        </div>

        <div className="tracker-summary-line-shell">
          <div className="tracker-summary-line" />
          <div className="tracker-summary-stats">
            <span>{dashboard?.summary.masteredTopics ?? 0} mastered</span>
            <span>{dashboard?.summary.weakTopics ?? 0} weak</span>
            <span>{dashboard?.summary.untouchedTopics ?? 0} untouched</span>
          </div>
          {firstSubject ? (
            <p className="tracker-summary-helper">
              Start from <strong>{firstSubject.title}</strong>. Update{" "}
              <code>lib/data/syllabusTrackerTree.ts</code>{" "}
              whenever you want to refine deeper nested branches.
            </p>
          ) : null}
        </div>
      </section>

      <div className="tracker-subject-list">
        {syllabusTrackerTree.map((subject, index) => (
          <SubjectRow
            key={subject.id}
            subject={subject}
            lookup={lookup}
            defaultOpen={index === 0}
            onOpenTopicNotes={setActiveTopicNoteTarget}
          />
        ))}
      </div>

      <SyllabusTopicNotesPopup
        target={activeTopicNoteTarget}
        onClose={() => setActiveTopicNoteTarget(null)}
      />
    </section>
  );
}
