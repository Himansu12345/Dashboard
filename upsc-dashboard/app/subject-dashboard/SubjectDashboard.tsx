/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAttempts, updateAttemptQuestionNote } from "@/lib/api/attempts";
import { DashboardControls } from "./components/DashboardControls";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStyles } from "./components/DashboardStyles";
import { DashboardHeaderStyles } from "./components/DashboardHeaderStyles";
import { MasteryLegend } from "./components/MasteryLegend";
import { ProgressBar } from "./components/ProgressBar";
import { TopBar } from "./components/TopBar";
import { TreeView } from "./components/TreeView";
import { useSubjectDashboardState } from "./hooks/useSubjectDashboardState";
import type {
  ChapterAttemptSummary,
  ChapterWrongQuestionEntry,
  SubjectDashboardConfig,
  SubjectNode,
  SubjectNoteDocument,
} from "./types";

type SubjectDashboardProps = SubjectDashboardConfig & {
  data: SubjectNode[];
};

function formatPercent(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function formatDateTime(value: string | number | null) {
  if (!value) return "Unknown time";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function flattenNodes(nodes: SubjectNode[]): SubjectNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.children ? flattenNodes(node.children) : []),
  ]);
}

function buildChapterAttemptSummaries(
  chapterNodes: SubjectNode[],
  attempts: Awaited<ReturnType<typeof fetchAttempts>>,
  quizSubjectName: string | undefined,
) {
  if (!quizSubjectName) return {} as Record<string, ChapterAttemptSummary>;

  const chapterByLabel = new Map(
    chapterNodes.map((node) => [node.label, node.uid] as const),
  );
  const grouped = new Map<string, Awaited<ReturnType<typeof fetchAttempts>>>();

  attempts.forEach((attempt) => {
    if ((attempt.subject || "Unknown") !== quizSubjectName) return;
    if (attempt.deletedAt) return;
    const chapterLabel = attempt.subtopic || "";
    const chapterUid = chapterByLabel.get(chapterLabel);
    if (!chapterUid) return;
    const existing = grouped.get(chapterUid) || [];
    existing.push(attempt);
    grouped.set(chapterUid, existing);
  });

  const summaries: Record<string, ChapterAttemptSummary> = {};

  chapterNodes.forEach((node) => {
    const chapterAttempts = (grouped.get(node.uid) || []).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const totals = chapterAttempts.reduce(
      (result, attempt) => {
        result.total += attempt.total;
        result.correct += attempt.correct;
        result.incorrect += attempt.incorrect;
        result.skipped += attempt.skipped;
        return result;
      },
      { total: 0, correct: 0, incorrect: 0, skipped: 0 },
    );

    const attempted = totals.correct + totals.incorrect;
    const accuracy = attempted > 0 ? (totals.correct / attempted) * 100 : 0;
    const percentage =
      totals.total > 0 ? (totals.correct / totals.total) * 100 : 0;

    summaries[node.uid] = {
      attempts: chapterAttempts.length,
      total: totals.total,
      correct: totals.correct,
      incorrect: totals.incorrect,
      skipped: totals.skipped,
      accuracy,
      percentage,
      latestAttemptAt: chapterAttempts[0]?.createdAt || null,
      history: chapterAttempts.map((attempt) => ({
        id: attempt._id,
        topic: attempt.topic || "Unknown topic",
        scoreLabel: `${attempt.correct}/${attempt.total}`,
        accuracy: attempt.accuracy,
        percentage:
          attempt.total > 0 ? (attempt.correct / attempt.total) * 100 : 0,
        createdAt: attempt.createdAt,
        total: attempt.total,
        correct: attempt.correct,
        incorrect: attempt.incorrect,
        skipped: attempt.skipped,
      })),
      wrongQuestions: chapterAttempts.flatMap((attempt) =>
        (attempt.incorrectDetails || []).map((detail) => ({
          attemptId: attempt._id,
          topic: attempt.topic || "Unknown topic",
          createdAt: attempt.createdAt,
          question: detail.question,
          options: detail.options || [],
          correctAnswer: detail.correctAnswer,
          selectedAnswer: detail.selectedAnswer,
          notes: detail.notes || (detail.note ? [detail.note] : []),
          why: detail.why || "",
        })),
      ),
    };
  });

  return summaries;
}

function SubjectNotesPopup({
  nodeLabel,
  documentState,
  onClose,
  onAddNote,
  onEditNote,
  onTrashNote,
  onRestoreNote,
  onDeleteForever,
}: {
  nodeLabel: string;
  documentState: SubjectNoteDocument;
  onClose: () => void;
  onAddNote: (content: string) => void;
  onEditNote: (noteId: string, content: string) => void;
  onTrashNote: (noteId: string) => void;
  onRestoreNote: (noteId: string) => void;
  onDeleteForever: (noteId: string) => void;
}) {
  const [tab, setTab] = useState<"active" | "trash">("active");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const notes = tab === "active" ? documentState.active : documentState.trash;

  return (
    <div className="chapter-stats-overlay" onClick={onClose}>
      <div
        className="chapter-stats-modal note-manager-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chapter-stats-head">
          <div>
            <p className="chapter-stats-kicker">Node Notes</p>
            <h3 className="chapter-stats-title">{nodeLabel}</h3>
            <p className="chapter-stats-subtitle">
              Add, edit, delete, restore, and manage your notes smartly.
            </p>
          </div>
          <button
            type="button"
            className="chapter-stats-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="note-manager-tabs">
          <button
            type="button"
            className={`note-manager-tab ${tab === "active" ? "active" : ""}`}
            onClick={() => setTab("active")}
          >
            Active Notes ({documentState.active.length})
          </button>
          <button
            type="button"
            className={`note-manager-tab ${tab === "trash" ? "active" : ""}`}
            onClick={() => setTab("trash")}
          >
            Recycle Bin ({documentState.trash.length})
          </button>
        </div>

        {tab === "active" && (
          <div className="note-manager-composer">
            <textarea
              className="note-manager-textarea"
              rows={5}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a sharp note, mnemonic, trap, or revision insight..."
            />
            <div className="note-manager-actions">
              {editingId ? (
                <button
                  type="button"
                  className="chapter-stats-close"
                  onClick={() => {
                    setEditingId(null);
                    setDraft("");
                  }}
                >
                  Cancel Edit
                </button>
              ) : null}
              <button
                type="button"
                className="note-manager-primary"
                onClick={() => {
                  const content = draft.trim();
                  if (!content) return;
                  if (editingId) onEditNote(editingId, content);
                  else onAddNote(content);
                  setEditingId(null);
                  setDraft("");
                }}
              >
                {editingId ? "Save Changes" : "Add Note"}
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="chapter-stats-empty">
            {tab === "active"
              ? "No active notes yet for this node."
              : "Recycle bin is empty."}
          </div>
        ) : (
          <div className="note-manager-list">
            {notes.map((entry, index) => (
              <div key={entry.id} className="note-manager-item">
                <div className="note-manager-item-head">
                  <div>
                    <strong>Note {index + 1}</strong>
                    <span>Updated {formatDateTime(entry.updatedAt)}</span>
                  </div>
                  <div className="note-manager-inline-actions">
                    {tab === "active" ? (
                      <>
                        <button
                          type="button"
                          className="note-manager-inline-btn"
                          onClick={() => {
                            setEditingId(entry.id);
                            setDraft(entry.content);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="note-manager-inline-btn danger"
                          onClick={() => onTrashNote(entry.id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="note-manager-inline-btn"
                          onClick={() => onRestoreNote(entry.id)}
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          className="note-manager-inline-btn danger"
                          onClick={() => onDeleteForever(entry.id)}
                        >
                          Delete Forever
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="note-manager-copy">{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WrongQuestionNotesPopup({
  chapterLabel,
  entries,
  onClose,
  onSaveQuestionNote,
  onDeleteQuestionNote,
}: {
  chapterLabel: string;
  entries: ChapterWrongQuestionEntry[];
  onClose: () => void;
  onSaveQuestionNote: (
    entry: ChapterWrongQuestionEntry,
    note: string,
    noteIndex?: number,
  ) => Promise<void>;
  onDeleteQuestionNote: (
    entry: ChapterWrongQuestionEntry,
    noteIndex: number,
  ) => Promise<void>;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const buildEntryKey = (entry: ChapterWrongQuestionEntry) =>
    `${entry.attemptId}::${entry.question}::${entry.selectedAnswer}`;

  return (
    <div className="chapter-stats-overlay" onClick={onClose}>
      <div
        className="chapter-stats-modal wrong-questions-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chapter-stats-head">
          <div>
            <p className="chapter-stats-kicker">View Wrongs</p>
            <h3 className="chapter-stats-title">{chapterLabel}</h3>
            <p className="chapter-stats-subtitle">
              Review incorrect questions and attach notes to each one.
            </p>
          </div>
          <button
            type="button"
            className="chapter-stats-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="chapter-stats-empty">
            No incorrect questions recorded for this chapter yet.
          </div>
        ) : (
          <div className="wrong-question-list">
            {entries.map((entry, index) => {
              const entryKey = buildEntryKey(entry);
              return (
                <div
                  key={`${entryKey}-${index}`}
                  className="wrong-question-card"
                >
                  <div className="wrong-question-head">
                    <div>
                      <strong>{entry.topic}</strong>
                      <span>{formatDateTime(entry.createdAt)}</span>
                    </div>
                    <div className="wrong-question-badges">
                      <span className="wrong-badge wrong">
                        Selected: {entry.selectedAnswer || "Skipped"}
                      </span>
                      <span className="wrong-badge correct">
                        Correct: {entry.correctAnswer}
                      </span>
                    </div>
                  </div>

                  <p className="wrong-question-copy">{entry.question}</p>

                  <div className="wrong-question-options">
                    {entry.options.map((option) => {
                      const isCorrect = option === entry.correctAnswer;
                      const isSelected = option === entry.selectedAnswer;
                      return (
                        <div
                          key={`${entryKey}-${option}`}
                          className={`wrong-question-option ${
                            isCorrect ? "correct" : isSelected ? "selected" : ""
                          }`}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>

                  <div className="wrong-question-notes">
                    <div className="wrong-question-notes-head">
                      <span>Notes</span>
                      <button
                        type="button"
                        className="note-manager-inline-btn"
                        onClick={() => {
                          setEditingKey(`${entryKey}::new`);
                          setDraft("");
                        }}
                      >
                        Add Note
                      </button>
                    </div>

                    {(entry.notes || []).length === 0 ? (
                      <div className="chapter-stats-empty compact">
                        No notes on this wrong question yet.
                      </div>
                    ) : (
                      <div className="wrong-question-note-list">
                        {entry.notes.map((note, noteIndex) => (
                          <div
                            key={`${entryKey}-note-${noteIndex}`}
                            className="wrong-question-note-item"
                          >
                            <p>{note}</p>
                            <div className="note-manager-inline-actions">
                              <button
                                type="button"
                                className="note-manager-inline-btn"
                                onClick={() => {
                                  setEditingKey(`${entryKey}::${noteIndex}`);
                                  setDraft(note);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="note-manager-inline-btn danger"
                                onClick={() =>
                                  void onDeleteQuestionNote(entry, noteIndex)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {editingKey?.startsWith(entryKey) ? (
                      <div className="note-manager-composer compact">
                        <textarea
                          className="note-manager-textarea"
                          rows={4}
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          placeholder="Write a mistake note, trap, or correction insight..."
                        />
                        <div className="note-manager-actions">
                          <button
                            type="button"
                            className="chapter-stats-close"
                            onClick={() => {
                              setEditingKey(null);
                              setDraft("");
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="note-manager-primary"
                            onClick={async () => {
                              const normalized = draft.trim();
                              if (!normalized) return;
                              const parts = editingKey.split("::");
                              const noteIndex =
                                parts.at(-1) === "new"
                                  ? undefined
                                  : Number(parts.at(-1));
                              await onSaveQuestionNote(
                                entry,
                                normalized,
                                Number.isInteger(noteIndex)
                                  ? noteIndex
                                  : undefined,
                              );
                              setEditingKey(null);
                              setDraft("");
                            }}
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterStatsPopup({
  chapterLabel,
  summary,
  onClose,
  onViewWrongs,
}: {
  chapterLabel: string;
  summary: ChapterAttemptSummary;
  onClose: () => void;
  onViewWrongs: () => void;
}) {
  return (
    <div className="chapter-stats-overlay" onClick={onClose}>
      <div
        className="chapter-stats-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chapter-stats-head">
          <div>
            <p className="chapter-stats-kicker">Chapter Test Intelligence</p>
            <h3 className="chapter-stats-title">{chapterLabel}</h3>
            <p className="chapter-stats-subtitle">
              All linked quiz attempts for this note chapter.
            </p>
          </div>
          <div className="chapter-stats-head-actions">
            <button
              type="button"
              className="note-manager-primary"
              onClick={onViewWrongs}
            >
              View Wrongs
            </button>
            <button
              type="button"
              className="chapter-stats-close"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="chapter-stats-grid">
          <div className="chapter-stats-tile">
            <span>Attempts</span>
            <strong>{summary.attempts}</strong>
          </div>
          <div className="chapter-stats-tile">
            <span>Score</span>
            <strong>
              {summary.correct}/{summary.total}
            </strong>
          </div>
          <div className="chapter-stats-tile">
            <span>Accuracy</span>
            <strong>{formatPercent(summary.accuracy)}</strong>
          </div>
          <div className="chapter-stats-tile">
            <span>Percentage</span>
            <strong>{formatPercent(summary.percentage)}</strong>
          </div>
        </div>

        <div className="chapter-stats-band">
          <div
            className="chapter-stats-band-fill correct"
            style={{
              width: `${summary.total ? (summary.correct / summary.total) * 100 : 0}%`,
            }}
          />
          <div
            className="chapter-stats-band-fill incorrect"
            style={{
              width: `${summary.total ? (summary.incorrect / summary.total) * 100 : 0}%`,
            }}
          />
          <div
            className="chapter-stats-band-fill skipped"
            style={{
              width: `${summary.total ? (summary.skipped / summary.total) * 100 : 0}%`,
            }}
          />
        </div>

        <div className="chapter-stats-meta">
          <span>Correct: {summary.correct}</span>
          <span>Incorrect: {summary.incorrect}</span>
          <span>Skipped: {summary.skipped}</span>
        </div>

        <div className="chapter-stats-history">
          <div className="chapter-stats-history-head">
            <span>Test History</span>
            <span>
              {summary.latestAttemptAt
                ? `Latest: ${formatDateTime(summary.latestAttemptAt)}`
                : "No attempts yet"}
            </span>
          </div>

          {summary.history.length === 0 ? (
            <div className="chapter-stats-empty">
              No quiz attempts are linked to this chapter yet.
            </div>
          ) : (
            <div className="chapter-stats-history-list">
              {summary.history.map((entry) => (
                <div key={entry.id} className="chapter-stats-history-item">
                  <div>
                    <strong>{entry.topic}</strong>
                    <span>{formatDateTime(entry.createdAt)}</span>
                  </div>
                  <div>
                    <strong>{entry.scoreLabel}</strong>
                    <span>
                      {formatPercent(entry.accuracy)} accuracy •{" "}
                      {formatPercent(entry.percentage)} score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SubjectDashboard({
  data,
  storageKeys,
  subtitle,
  title,
  quizSubjectName,
  smartModeData,
}: SubjectDashboardProps) {
  const [isSmartModeEnabled, setIsSmartModeEnabled] = useState(false);
  const activeData = useMemo(
    () =>
      isSmartModeEnabled && smartModeData && smartModeData.length > 0
        ? smartModeData
        : data,
    [data, isSmartModeEnabled, smartModeData],
  );
  const dashboard = useSubjectDashboardState(
    activeData,
    storageKeys,
    quizSubjectName,
  );
  const chapterNodes = useMemo(() => activeData, [activeData]);
  const allNodes = useMemo(() => flattenNodes(activeData), [activeData]);
  const chapterUids = useMemo(
    () => new Set(chapterNodes.map((node) => node.uid)),
    [chapterNodes],
  );
  const [chapterAttemptSummaries, setChapterAttemptSummaries] = useState<
    Record<string, ChapterAttemptSummary>
  >({});
  const [activeChapterUid, setActiveChapterUid] = useState<string | null>(null);
  const [isWrongsOpen, setIsWrongsOpen] = useState(false);

  const handleOpenChapterStats = useCallback(
    (uid: string) => {
      if (activeChapterUid === uid) return; // Avoid re-renders if already active
      setActiveChapterUid(uid);
      setIsWrongsOpen(false);
    },
    [activeChapterUid],
  );

  const refreshAttemptSummaries = useCallback(async () => {
    try {
      const attempts = await fetchAttempts();
      setChapterAttemptSummaries(
        buildChapterAttemptSummaries(chapterNodes, attempts, quizSubjectName),
      );
    } catch {
      setChapterAttemptSummaries({});
    }
  }, [chapterNodes, quizSubjectName]);

  useEffect(() => {
    let isCurrent = true;
    if (quizSubjectName) {
      refreshAttemptSummaries().catch(() => {
        /* Optionally handle error */
      });
    }
    return () => {
      isCurrent = false;
    };
  }, [quizSubjectName, refreshAttemptSummaries]);

  const activeChapterNode = activeChapterUid
    ? chapterNodes.find((node) => node.uid === activeChapterUid) || null
    : null;
  const activeChapterSummary = activeChapterUid
    ? chapterAttemptSummaries[activeChapterUid]
    : null;
  const activeNoteNode = dashboard.activeNoteUid
    ? allNodes.find((node) => node.uid === dashboard.activeNoteUid) || null
    : null;
  const activeNoteDocument = dashboard.activeNoteUid
    ? dashboard.noteDocuments[dashboard.activeNoteUid] || {
        active: [],
        trash: [],
      }
    : null;

  return (
    <>
      <TopBar
        theme={dashboard.theme}
        onToggleTheme={dashboard.toggleTheme}
        onToggleZen={() => dashboard.setIsZen(!dashboard.isZen)}
      />

      <div
        id="mainWrap"
        className={`mh-wrap ${dashboard.isRecall ? "active-recall" : ""}`}
      >
        <DashboardHeader title={title} subtitle={subtitle} />
        <ProgressBar progress={dashboard.progress} />
        <MasteryLegend />
        <DashboardControls
          searchQuery={dashboard.searchQuery}
          isRecall={dashboard.isRecall}
          isSmartModeEnabled={isSmartModeEnabled}
          canToggleSmartMode={Boolean(smartModeData?.length)}
          starFilter={dashboard.starFilter}
          onSearch={dashboard.handleSearch}
          onExpandAll={dashboard.expandAll}
          onCollapseAll={dashboard.collapseAll}
          onToggleRecall={() => dashboard.setIsRecall(!dashboard.isRecall)}
          onToggleSmartMode={() => setIsSmartModeEnabled((value) => !value)}
          onToggleStarFilter={() =>
            dashboard.setStarFilter(!dashboard.starFilter)
          }
        />
        <TreeView
          data={activeData}
          isSmartModeEnabled={isSmartModeEnabled}
          checkedUids={dashboard.checkedUids}
          completionTimes={dashboard.completionTimes}
          nodeStatuses={dashboard.nodeStatuses}
          effectiveCollapsed={dashboard.effectiveCollapsed}
          indeterminateUids={dashboard.indeterminateUids}
          starredUids={dashboard.starredUids}
          notes={dashboard.notes}
          visibleUids={dashboard.visibleUids}
          chapterUids={chapterUids}
          chapterAttemptSummaries={chapterAttemptSummaries}
          nodeRenderVersions={dashboard.nodeRenderVersions}
          treeRenderVersion={dashboard.treeRenderVersion}
          onCheck={dashboard.handleCheck}
          onLogRevision={dashboard.logRevision}
          onOpenChapterStats={handleOpenChapterStats}
          onToggleCollapse={dashboard.toggleCollapse}
          onToggleNote={dashboard.toggleNote}
          onToggleStar={dashboard.toggleStar}
        />
      </div>

      {activeNoteNode && activeNoteDocument && (
        <SubjectNotesPopup
          key={activeNoteNode.uid}
          nodeLabel={activeNoteNode.label}
          documentState={activeNoteDocument}
          onClose={dashboard.closeNoteManager}
          onAddNote={(content) =>
            dashboard.addNoteEntry(activeNoteNode.uid, content)
          }
          onEditNote={(noteId, content) =>
            dashboard.editNoteEntry(activeNoteNode.uid, noteId, content)
          }
          onTrashNote={(noteId) =>
            dashboard.trashNoteEntry(activeNoteNode.uid, noteId)
          }
          onRestoreNote={(noteId) =>
            dashboard.restoreNoteEntry(activeNoteNode.uid, noteId)
          }
          onDeleteForever={(noteId) =>
            dashboard.permanentlyDeleteNoteEntry(activeNoteNode.uid, noteId)
          }
        />
      )}

      {activeChapterNode && activeChapterSummary && !isWrongsOpen && (
        <ChapterStatsPopup
          chapterLabel={activeChapterNode.label}
          summary={activeChapterSummary}
          onClose={() => setActiveChapterUid(null)}
          onViewWrongs={() => setIsWrongsOpen(true)}
        />
      )}

      {activeChapterNode && activeChapterSummary && isWrongsOpen && (
        <WrongQuestionNotesPopup
          chapterLabel={activeChapterNode.label}
          entries={activeChapterSummary.wrongQuestions}
          onClose={() => setIsWrongsOpen(false)}
          onSaveQuestionNote={async (entry, note, noteIndex) => {
            await updateAttemptQuestionNote({
              id: entry.attemptId,
              question: entry.question,
              selectedAnswer: entry.selectedAnswer,
              correctAnswer: entry.correctAnswer,
              note,
              mode: typeof noteIndex === "number" ? "edit" : "add",
              noteIndex,
            });
            await refreshAttemptSummaries();
          }}
          onDeleteQuestionNote={async (entry, noteIndex) => {
            await updateAttemptQuestionNote({
              id: entry.attemptId,
              question: entry.question,
              selectedAnswer: entry.selectedAnswer,
              correctAnswer: entry.correctAnswer,
              note: "",
              mode: "delete",
              noteIndex,
            });
            await refreshAttemptSummaries();
          }}
        />
      )}
<DashboardHeaderStyles />

      <DashboardStyles />
    </>
  );
}
