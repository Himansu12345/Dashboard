import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type {
  SubjectNode,
  SubjectDashboardConfig,
  SubjectNoteDocument,
  SubjectNoteEntry,
  SubjectProgress,
  SubjectCompletionTimes,
  SubjectNodeStatusMap,
} from "../types";
import { trackNoteAction } from "@/trackingService";

type ThemeMode = "dark" | "light";

type SubjectProgressApiPayload = {
  checkedUids: string[];
  completionTimes: SubjectCompletionTimes;
  updatedAt?: number;
};

type ReportEventType =
  | "note_complete"
  | "note_uncomplete"
  | "note_revise"
  | "note_star"
  | "note_unstar";

type ReportEventStatus = {
  isChecked?: boolean;
  isStarred?: boolean;
  completedAt?: number;
  revisedAt?: number;
  revisions?: number[];
};

type NodeReportMeta = {
  uid: string;
  label: string;
  path: string[];
  subject: string;
  chapter: string;
  topic: string;
  subtopic: string;
  pointText: string;
};

type DerivedNodeStatus = {
  isChecked: boolean;
  completedAt?: number;
  revisedAt?: number;
  revisions?: number[];
};

type NormalizedCompletionRecord = {
  completedAt: number;
  revisedAt?: number;
  revisions: number[];
};

const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item);

        if (initialValue instanceof Set) {
          setValue(new Set(Array.isArray(parsed) ? parsed : []) as T);
        } else {
          setValue(parsed);
        }
      }
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setValue(item as T);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setLocalStorageValue = useCallback(
    (newValue: T | ((val: T) => T)) => {
      if (typeof window === "undefined") return;

      try {
        setValue((prevValue) => {
          const valueToStore =
            newValue instanceof Function ? newValue(prevValue) : newValue;

          let itemToStore: unknown = valueToStore;
          if (valueToStore instanceof Set) {
            itemToStore = Array.from(valueToStore);
          }

          window.localStorage.setItem(key, JSON.stringify(itemToStore));
          return valueToStore;
        });
      } catch (e) {
        console.warn(`Error setting localStorage key "${key}":`, e);
      }
    },
    [key],
  );

  return [value, setLocalStorageValue] as const;
};

function flattenSubjectTree(nodes: SubjectNode[]): SubjectNode[] {
  const result: SubjectNode[] = [];

  const walk = (items: SubjectNode[]) => {
    for (const item of items) {
      result.push(item);
      if (item.children?.length) {
        walk(item.children);
      }
    }
  };

  walk(nodes);
  return result;
}

function safeNodeLabel(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function buildNodeMetaMap(
  nodes: SubjectNode[],
  subjectName: string,
): Map<string, NodeReportMeta> {
  const map = new Map<string, NodeReportMeta>();

  const walk = (items: SubjectNode[], pathLabels: string[]) => {
    for (const node of items) {
      const currentLabel = safeNodeLabel(node.label);
      const nextPath = currentLabel
        ? [...pathLabels, currentLabel]
        : [...pathLabels];

      const chapter = nextPath[0] ?? "";
      const topic = nextPath[1] ?? "";
      const subtopic = nextPath[2] ?? "";
      const pointText =
        nextPath.length >= 4
          ? nextPath[nextPath.length - 1]
          : !node.children?.length
            ? currentLabel
            : "";

      map.set(node.uid, {
        uid: node.uid,
        label: currentLabel,
        path: nextPath,
        subject: subjectName || "",
        chapter,
        topic,
        subtopic,
        pointText,
      });

      if (node.children?.length) {
        walk(node.children, nextPath);
      }
    }
  };

  walk(nodes, []);
  return map;
}

async function postReportEvent(payload: Record<string, unknown>) {
  try {
    const response = await fetch("/api/report-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.warn(
        "Failed to post report event:",
        response.status,
        response.statusText,
        text,
      );
    }
  } catch (error) {
    console.warn("Failed to post report event:", error);
  }
}

function normalizeStoredCompletionTimes(
  value: SubjectCompletionTimes | null | undefined,
): SubjectCompletionTimes {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const normalized: SubjectCompletionTimes = {};

  for (const [uid, record] of Object.entries(value)) {
    if (!record) continue;

    if (typeof record === "number" && Number.isFinite(record)) {
      normalized[uid] = record;
      continue;
    }

    if (typeof record !== "object" || Array.isArray(record)) continue;

    const typedRecord = record as {
      completedAt?: unknown;
      revisedAt?: unknown;
      revisions?: unknown;
    };

    const completedAt =
      typeof typedRecord.completedAt === "number" &&
      Number.isFinite(typedRecord.completedAt)
        ? typedRecord.completedAt
        : undefined;

    if (!completedAt) continue;

    const revisedAt =
      typeof typedRecord.revisedAt === "number" &&
      Number.isFinite(typedRecord.revisedAt)
        ? typedRecord.revisedAt
        : undefined;

    const revisions = Array.isArray(typedRecord.revisions)
      ? typedRecord.revisions.filter(
          (entry): entry is number =>
            typeof entry === "number" && Number.isFinite(entry),
        )
      : [];

    normalized[uid] = {
      completedAt,
      ...(typeof revisedAt === "number" ? { revisedAt } : {}),
      revisions,
    };
  }

  return normalized;
}

function normalizeCompletionRecord(
  value: SubjectCompletionTimes[string] | undefined,
): NormalizedCompletionRecord | null {
  if (!value) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return {
      completedAt: value,
      revisions: [],
    };
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const completedAt =
      typeof value.completedAt === "number" && Number.isFinite(value.completedAt)
        ? value.completedAt
        : undefined;

    if (!completedAt) return null;

    const revisedAt =
      typeof value.revisedAt === "number" && Number.isFinite(value.revisedAt)
        ? value.revisedAt
        : undefined;

    const revisions = Array.isArray(value.revisions)
      ? value.revisions.filter(
          (entry): entry is number =>
            typeof entry === "number" && Number.isFinite(entry),
        )
      : [];

    return {
      completedAt,
      ...(typeof revisedAt === "number" ? { revisedAt } : {}),
      revisions,
    };
  }

  return null;
}

function buildDerivedTreeStatuses(
  nodes: SubjectNode[],
  checkedUids: Set<string>,
  completionTimes: SubjectCompletionTimes,
) {
  const statusMap: SubjectNodeStatusMap = {};
  const indeterminate = new Set<string>();

  const visit = (node: SubjectNode): DerivedNodeStatus => {
    const hasKids = !!node.children?.length;

    if (!hasKids) {
      const record = normalizeCompletionRecord(completionTimes[node.uid]);
      const isChecked = checkedUids.has(node.uid);

      const leafStatus: DerivedNodeStatus = {
        isChecked,
        completedAt: record?.completedAt,
        revisedAt: record?.revisedAt,
        revisions: record?.revisions ?? [],
      };

      statusMap[node.uid] = leafStatus;
      return leafStatus;
    }

    const childStatuses = node.children!.map(visit);

    const allChecked =
      childStatuses.length > 0 &&
      childStatuses.every((child) => child.isChecked);

    const someChecked = childStatuses.some(
      (child) =>
        child.isChecked ||
        !!child.completedAt ||
        !!child.revisedAt ||
        (child.revisions?.length ?? 0) > 0,
    );

    if (!allChecked && someChecked) {
      indeterminate.add(node.uid);
    }

    const completedCandidates = childStatuses
      .map((child) => child.completedAt)
      .filter((v): v is number => typeof v === "number");

    const childRevisionArrays = childStatuses.map(
      (child) => child.revisions ?? [],
    );

    const commonRevisionCount =
      childRevisionArrays.length > 0
        ? Math.min(...childRevisionArrays.map((arr) => arr.length))
        : 0;

    const revisions: number[] = [];

    for (let i = 0; i < commonRevisionCount; i += 1) {
      const roundTimestamps = childRevisionArrays
        .map((arr) => arr[i])
        .filter(
          (v): v is number => typeof v === "number" && Number.isFinite(v),
        );

      if (roundTimestamps.length === childRevisionArrays.length) {
        revisions.push(Math.max(...roundTimestamps));
      }
    }

    const branchCompletedAt =
      allChecked && completedCandidates.length > 0
        ? Math.max(...completedCandidates)
        : undefined;

    const branchRevisedAt =
      revisions.length > 0 ? revisions[revisions.length - 1] : undefined;

    const branchStatus: DerivedNodeStatus = {
      isChecked: allChecked,
      completedAt: branchCompletedAt,
      revisedAt: branchRevisedAt,
      revisions,
    };

    statusMap[node.uid] = branchStatus;
    return branchStatus;
  };

  for (const node of nodes) {
    visit(node);
  }

  return { statusMap, indeterminate };
}

/* -------------------------------------------------------------------------- */
/* NOTE HELPERS                                                               */
/* -------------------------------------------------------------------------- */

function createNoteEntry(content: string): SubjectNoteEntry {
  const now = Date.now();
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `note_${now}_${Math.random().toString(36).slice(2, 10)}`;

  return {
    id: random,
    content,
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeNoteDocument(
  value: SubjectNoteDocument | null | undefined,
): SubjectNoteDocument {
  const active = Array.isArray(value?.active) ? value!.active : [];
  const trash = Array.isArray(value?.trash) ? value!.trash : [];
  return { active, trash };
}

function buildEffectiveNoteDocuments(
  noteDocuments: Record<string, SubjectNoteDocument>,
  legacyNotes: Record<string, string>,
): Record<string, SubjectNoteDocument> {
  const merged: Record<string, SubjectNoteDocument> = {};

  for (const [uid, doc] of Object.entries(noteDocuments)) {
    merged[uid] = normalizeNoteDocument(doc);
  }

  for (const [uid, rawContent] of Object.entries(legacyNotes)) {
    const content = typeof rawContent === "string" ? rawContent.trim() : "";
    if (!content) continue;

    const existing = merged[uid];
    const hasExistingNotes =
      !!existing && (existing.active.length > 0 || existing.trash.length > 0);

    if (hasExistingNotes) continue;

    merged[uid] = {
      active: [
        {
          id: `legacy-${uid}`,
          content,
          createdAt: 0,
          updatedAt: 0,
        },
      ],
      trash: [],
    };
  }

  return merged;
}

function buildPreviewNotesMap(
  effectiveDocuments: Record<string, SubjectNoteDocument>,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [uid, doc] of Object.entries(effectiveDocuments)) {
    const firstActive = doc.active.find(
      (entry) => typeof entry.content === "string" && entry.content.trim(),
    );
    if (firstActive) {
      result[uid] = firstActive.content;
    }
  }

  return result;
}

function buildVisibleTreeUidSet(
  roots: SubjectNode[],
  searchQuery: string,
  starFilter: boolean,
  starredUids: Set<string>,
): Set<string> {
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const hasActiveFilter = normalizedSearch.length > 0 || starFilter;

  // No active search / star filter => don't hide anything.
  // TreeNode already treats empty visibleUids as "show full tree".
  if (!hasActiveFilter) {
    return new Set<string>();
  }

  const visible = new Set<string>();

  const matchesNode = (node: SubjectNode) => {
    const label =
      typeof node.label === "string" ? node.label.toLowerCase() : "";

    if (normalizedSearch && !label.includes(normalizedSearch)) {
      return false;
    }

    if (starFilter && !starredUids.has(node.uid)) {
      return false;
    }

    return true;
  };

  const visit = (node: SubjectNode): boolean => {
    const selfMatches = matchesNode(node);
    const childMatches = (node.children ?? []).some((child) => visit(child));
    const shouldShow = selfMatches || childMatches;

    if (shouldShow) {
      visible.add(node.uid);
    }

    return shouldShow;
  };

  for (const node of roots) {
    visit(node);
  }

  return visible;
}
export const useSubjectDashboardState = (
  activeData: SubjectNode[],
  storageKeys: SubjectDashboardConfig["storageKeys"],
  quizSubjectName: SubjectDashboardConfig["quizSubjectName"],
) => {
  const [theme, setTheme] = useLocalStorage<ThemeMode>(
    storageKeys.theme,
    "dark",
  );
  const [isZen, setIsZen] = useState(false);
  const [isRecall, setIsRecall] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState(false);

  const [checkedUids, setCheckedUids] = useLocalStorage<Set<string>>(
    storageKeys.checked,
    new Set(),
  );

  const [completionTimes, setCompletionTimes] =
    useLocalStorage<SubjectCompletionTimes>(storageKeys.completion, {});

  const [effectiveCollapsed, setEffectiveCollapsed] =
    useLocalStorage<Set<string>>(storageKeys.collapsed, new Set());

  const [starredUids, setStarredUids] = useLocalStorage<Set<string>>(
    storageKeys.starred,
    new Set(),
  );

  const [legacyNotes, setLegacyNotes] = useLocalStorage<Record<string, string>>(
    storageKeys.notes,
    {},
  );

  const [noteDocuments, setNoteDocuments] = useLocalStorage<
    Record<string, SubjectNoteDocument>
  >(storageKeys.noteDocuments, {});

  const [nodeRenderVersions] = useState<Map<string, number>>(new Map());
  const [treeRenderVersion] = useState(0);
  const [activeNoteUid, setActiveNoteUid] = useState<string | null>(null);

  const hasLoadedRemoteProgressRef = useRef(false);
  const skipNextSaveRef = useRef(true);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, [setTheme]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const expandAll = useCallback(() => {
    setEffectiveCollapsed(new Set());
  }, [setEffectiveCollapsed]);

  const collapseAll = useCallback(() => {
    const allParentUids = new Set<string>();

    const collectParents = (nodes: SubjectNode[]) => {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          allParentUids.add(node.uid);
          collectParents(node.children);
        }
      }
    };

    collectParents(activeData);
    setEffectiveCollapsed(allParentUids);
  }, [activeData, setEffectiveCollapsed]);

  const toggleCollapse = useCallback(
    (uid: string) => {
      setEffectiveCollapsed((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(uid)) {
          newSet.delete(uid);
        } else {
          newSet.add(uid);
        }
        return newSet;
      });
    },
    [setEffectiveCollapsed],
  );

  const toggleNote = useCallback((uid: string) => {
    setActiveNoteUid((prev) => (prev === uid ? null : uid));
  }, []);

  const closeNoteManager = useCallback(() => {
    setActiveNoteUid(null);
  }, []);

  const allNodes = useMemo(() => flattenSubjectTree(activeData), [activeData]);

  const nodeMetaMap = useMemo(
    () => buildNodeMetaMap(activeData, quizSubjectName || ""),
    [activeData, quizSubjectName],
  );

  const effectiveNoteDocuments = useMemo(
    () => buildEffectiveNoteDocuments(noteDocuments, legacyNotes),
    [noteDocuments, legacyNotes],
  );

  const notes = useMemo(
    () => buildPreviewNotesMap(effectiveNoteDocuments),
    [effectiveNoteDocuments],
  );

  const addNoteEntry = useCallback(
    (uid: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      setNoteDocuments((prev) => {
        const current = normalizeNoteDocument(
          effectiveNoteDocuments[uid] ?? prev[uid],
        );

        return {
          ...prev,
          [uid]: {
            active: [createNoteEntry(trimmed), ...current.active],
            trash: current.trash,
          },
        };
      });

      setLegacyNotes((prev) => ({
        ...prev,
        [uid]: trimmed,
      }));
    },
    [effectiveNoteDocuments, setLegacyNotes, setNoteDocuments],
  );

  const editNoteEntry = useCallback(
    (uid: string, noteId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      setNoteDocuments((prev) => {
        const current = normalizeNoteDocument(
          effectiveNoteDocuments[uid] ?? prev[uid],
        );

        const nextActive = current.active.map((entry) =>
          entry.id === noteId
            ? {
                ...entry,
                content: trimmed,
                updatedAt: Date.now(),
              }
            : entry,
        );

        const nextDoc: SubjectNoteDocument = {
          active: nextActive,
          trash: current.trash,
        };

        const firstActive = nextDoc.active[0]?.content?.trim() || "";

        setLegacyNotes((legacyPrev) => {
          const nextLegacy = { ...legacyPrev };
          if (firstActive) nextLegacy[uid] = firstActive;
          else delete nextLegacy[uid];
          return nextLegacy;
        });

        return {
          ...prev,
          [uid]: nextDoc,
        };
      });
    },
    [effectiveNoteDocuments, setLegacyNotes, setNoteDocuments],
  );

  const trashNoteEntry = useCallback(
    (uid: string, noteId: string) => {
      setNoteDocuments((prev) => {
        const current = normalizeNoteDocument(
          effectiveNoteDocuments[uid] ?? prev[uid],
        );

        const target = current.active.find((entry) => entry.id === noteId);
        if (!target) return prev;

        const nextDoc: SubjectNoteDocument = {
          active: current.active.filter((entry) => entry.id !== noteId),
          trash: [{ ...target, updatedAt: Date.now() }, ...current.trash],
        };

        const firstActive = nextDoc.active[0]?.content?.trim() || "";

        setLegacyNotes((legacyPrev) => {
          const nextLegacy = { ...legacyPrev };
          if (firstActive) nextLegacy[uid] = firstActive;
          else delete nextLegacy[uid];
          return nextLegacy;
        });

        return {
          ...prev,
          [uid]: nextDoc,
        };
      });
    },
    [effectiveNoteDocuments, setLegacyNotes, setNoteDocuments],
  );

  const restoreNoteEntry = useCallback(
    (uid: string, noteId: string) => {
      setNoteDocuments((prev) => {
        const current = normalizeNoteDocument(
          effectiveNoteDocuments[uid] ?? prev[uid],
        );

        const target = current.trash.find((entry) => entry.id === noteId);
        if (!target) return prev;

        const restored: SubjectNoteEntry = {
          ...target,
          updatedAt: Date.now(),
        };

        const nextDoc: SubjectNoteDocument = {
          active: [restored, ...current.active],
          trash: current.trash.filter((entry) => entry.id !== noteId),
        };

        const firstActive = nextDoc.active[0]?.content?.trim() || "";

        setLegacyNotes((legacyPrev) => ({
          ...legacyPrev,
          ...(firstActive ? { [uid]: firstActive } : {}),
        }));

        return {
          ...prev,
          [uid]: nextDoc,
        };
      });
    },
    [effectiveNoteDocuments, setLegacyNotes, setNoteDocuments],
  );

  const permanentlyDeleteNoteEntry = useCallback(
    (uid: string, noteId: string) => {
      setNoteDocuments((prev) => {
        const current = normalizeNoteDocument(
          effectiveNoteDocuments[uid] ?? prev[uid],
        );

        const nextDoc: SubjectNoteDocument = {
          active: current.active,
          trash: current.trash.filter((entry) => entry.id !== noteId),
        };

        const shouldRemoveDoc =
          nextDoc.active.length === 0 && nextDoc.trash.length === 0;

        if (shouldRemoveDoc) {
          const { [uid]: _removed, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [uid]: nextDoc,
        };
      });
    },
    [effectiveNoteDocuments, setNoteDocuments],
  );

  const { nodeStatuses, indeterminateUids } = useMemo(() => {
    const { statusMap, indeterminate } = buildDerivedTreeStatuses(
      activeData,
      checkedUids,
      completionTimes,
    );

    return {
      nodeStatuses: statusMap,
      indeterminateUids: indeterminate,
    };
  }, [activeData, checkedUids, completionTimes]);

  const progress: SubjectProgress = useMemo(() => {
    const leafNodes = allNodes.filter(
      (node) => !node.children || node.children.length === 0,
    );

    const totalLeaves = leafNodes.length;
    const checkedLeaves = leafNodes.filter((node) =>
      checkedUids.has(node.uid),
    ).length;

    const pct = totalLeaves > 0 ? (checkedLeaves / totalLeaves) * 100 : 0;

    return {
      checkedLeaves,
      totalLeaves,
      pct,
    };
  }, [allNodes, checkedUids]);

  const visibleUids = useMemo(() => {
    return buildVisibleTreeUidSet(
      activeData,
      searchQuery,
      starFilter,
      starredUids,
    );
  }, [activeData, searchQuery, starFilter, starredUids]);

  const saveSubjectProgress = useCallback(async () => {
    try {
      await fetch(
        `/api/subject-progress?subject=${encodeURIComponent(storageKeys.checked)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkedUids: Array.from(checkedUids),
            completionTimes,
          } satisfies SubjectProgressApiPayload),
        },
      );
    } catch (error) {
      console.warn("Failed to save subject progress:", error);
    }
  }, [storageKeys.checked, checkedUids, completionTimes]);

  const fetchSubjectProgress = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/subject-progress?subject=${encodeURIComponent(storageKeys.checked)}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        if (response.status !== 404) {
          console.warn("Failed to fetch subject progress:", response.status);
        }
        hasLoadedRemoteProgressRef.current = true;
        return;
      }

      const data = (await response.json()) as {
        progress?: SubjectProgressApiPayload | null;
      };

      const progressPayload = data?.progress;
      if (!progressPayload) {
        hasLoadedRemoteProgressRef.current = true;
        return;
      }

      const nextChecked = new Set(
        Array.isArray(progressPayload.checkedUids)
          ? progressPayload.checkedUids.filter(
              (uid): uid is string => typeof uid === "string",
            )
          : [],
      );

      const nextCompletionTimes = normalizeStoredCompletionTimes(
        progressPayload.completionTimes,
      );

      skipNextSaveRef.current = true;
      setCheckedUids(nextChecked);
      setCompletionTimes(nextCompletionTimes);
      hasLoadedRemoteProgressRef.current = true;
    } catch (error) {
      console.warn("Failed to load subject progress:", error);
      hasLoadedRemoteProgressRef.current = true;
    }
  }, [storageKeys.checked, setCheckedUids, setCompletionTimes]);

  useEffect(() => {
    hasLoadedRemoteProgressRef.current = false;
    skipNextSaveRef.current = true;

    setCheckedUids(new Set());
    setCompletionTimes({});

    void fetchSubjectProgress();
  }, [fetchSubjectProgress, setCheckedUids, setCompletionTimes]);

  useEffect(() => {
    if (!hasLoadedRemoteProgressRef.current) return;

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    void saveSubjectProgress();
  }, [checkedUids, completionTimes, saveSubjectProgress]);

  const reportSubjectEvent = useCallback(
    async (
      uid: string,
      eventType: ReportEventType,
      previousStatus: ReportEventStatus,
      newStatus: ReportEventStatus,
      extraMeta?: Record<string, unknown>,
    ) => {
      const meta = nodeMetaMap.get(uid);
      if (!meta) return;

      const actionTypeMap: Record<ReportEventType, string> = {
        note_complete: "completed",
        note_uncomplete: "uncompleted",
        note_revise: "revised",
        note_star: "starred",
        note_unstar: "unstarred",
      };

      const trackerPayload = {
        sourceModule: "subject-dashboard",
        actionType: actionTypeMap[eventType],
        previousStatus,
        newStatus,
        subject: meta.subject,
        chapter: meta.chapter,
        topic: meta.topic,
        subtopic: meta.subtopic,
        pointUid: meta.uid,
        pointText: meta.pointText || meta.label,
        meta: {
          label: meta.label,
          path: meta.path,
          ...extraMeta,
        },
      };

      try {
        await trackNoteAction(trackerPayload);
      } catch (error) {
        console.warn("Failed to write note action to IndexedDB:", error);
      }

      await postReportEvent({
        eventType,
        subject: meta.subject,
        chapter: meta.chapter,
        topic: meta.topic,
        subtopic: meta.subtopic,
        pointUid: meta.uid,
        pointText: meta.pointText || meta.label,
        label: meta.label,
        path: meta.path,
        sourcePage: "subject-dashboard",
        actionLabel: eventType,
        previousStatus,
        newStatus,
        meta: extraMeta ?? {},
        timestamp: new Date().toISOString(),
      });
    },
    [nodeMetaMap],
  );

  const handleCheck = useCallback(
    (uid: string, isChecked: boolean) => {
      const previousChecked = checkedUids.has(uid);
      const previousCompletion = normalizeCompletionRecord(completionTimes[uid]);

      const previousStatus: ReportEventStatus = {
        isChecked: previousChecked,
        completedAt: previousCompletion?.completedAt,
        revisedAt: previousCompletion?.revisedAt,
        revisions: previousCompletion?.revisions ?? [],
        isStarred: starredUids.has(uid),
      };

      const now = Date.now();

      setCheckedUids((prevChecked) => {
        const nextChecked = new Set(prevChecked);
        if (isChecked) nextChecked.add(uid);
        else nextChecked.delete(uid);
        return nextChecked;
      });

      setCompletionTimes((prevCompletionTimes) => {
        const nextCompletionTimes = { ...prevCompletionTimes };

        if (isChecked) {
          const existing = normalizeCompletionRecord(nextCompletionTimes[uid]);
          nextCompletionTimes[uid] = existing ?? {
            completedAt: now,
            revisions: [],
          };
        } else {
          delete nextCompletionTimes[uid];
        }

        return nextCompletionTimes;
      });

      const nextCompletionRecord = isChecked
        ? previousCompletion ?? { completedAt: now, revisions: [] }
        : undefined;

      const newStatus: ReportEventStatus = {
        isChecked,
        completedAt: nextCompletionRecord?.completedAt,
        revisedAt: nextCompletionRecord?.revisedAt,
        revisions: nextCompletionRecord?.revisions ?? [],
        isStarred: starredUids.has(uid),
      };

      void reportSubjectEvent(
        uid,
        isChecked ? "note_complete" : "note_uncomplete",
        previousStatus,
        newStatus,
      );
    },
    [
      checkedUids,
      completionTimes,
      starredUids,
      reportSubjectEvent,
      setCheckedUids,
      setCompletionTimes,
    ],
  );

  const logRevision = useCallback(
    (uid: string) => {
      const now = Date.now();
      const previousChecked = checkedUids.has(uid);
      const previousCompletion = normalizeCompletionRecord(completionTimes[uid]);

      const previousStatus: ReportEventStatus = {
        isChecked: previousChecked,
        completedAt: previousCompletion?.completedAt,
        revisedAt: previousCompletion?.revisedAt,
        revisions: previousCompletion?.revisions ?? [],
        isStarred: starredUids.has(uid),
      };

      const nextRecord: NormalizedCompletionRecord = {
        completedAt: previousCompletion?.completedAt ?? now,
        revisedAt: now,
        revisions: [...(previousCompletion?.revisions ?? []), now],
      };

      setCheckedUids((prevChecked) => {
        const nextChecked = new Set(prevChecked);
        nextChecked.add(uid);
        return nextChecked;
      });

      setCompletionTimes((prevCompletionTimes) => ({
        ...prevCompletionTimes,
        [uid]: nextRecord,
      }));

      const newStatus: ReportEventStatus = {
        isChecked: true,
        completedAt: nextRecord.completedAt,
        revisedAt: nextRecord.revisedAt,
        revisions: nextRecord.revisions,
        isStarred: starredUids.has(uid),
      };

      void reportSubjectEvent(uid, "note_revise", previousStatus, newStatus, {
        revisionCount: nextRecord.revisions.length,
      });
    },
    [
      checkedUids,
      completionTimes,
      starredUids,
      reportSubjectEvent,
      setCheckedUids,
      setCompletionTimes,
    ],
  );

  const toggleStar = useCallback(
    (uid: string) => {
      const wasStarred = starredUids.has(uid);
      const previousCompletion = normalizeCompletionRecord(completionTimes[uid]);

      const previousStatus: ReportEventStatus = {
        isChecked: checkedUids.has(uid),
        completedAt: previousCompletion?.completedAt,
        revisedAt: previousCompletion?.revisedAt,
        revisions: previousCompletion?.revisions ?? [],
        isStarred: wasStarred,
      };

      const nextStarred = !wasStarred;

      setStarredUids((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(uid)) newSet.delete(uid);
        else newSet.add(uid);
        return newSet;
      });

      const newStatus: ReportEventStatus = {
        isChecked: checkedUids.has(uid),
        completedAt: previousCompletion?.completedAt,
        revisedAt: previousCompletion?.revisedAt,
        revisions: previousCompletion?.revisions ?? [],
        isStarred: nextStarred,
      };

      void reportSubjectEvent(
        uid,
        nextStarred ? "note_star" : "note_unstar",
        previousStatus,
        newStatus,
      );
    },
    [
      starredUids,
      checkedUids,
      completionTimes,
      setStarredUids,
      reportSubjectEvent,
    ],
  );

  return {
    theme,
    toggleTheme,
    isZen,
    setIsZen,
    isRecall,
    setIsRecall,
    progress,
    searchQuery,
    starFilter,
    handleSearch,
    expandAll,
    collapseAll,
    setStarFilter,
    checkedUids,
    completionTimes,
    nodeStatuses,
    effectiveCollapsed,
    indeterminateUids,
    starredUids,
    notes,
    visibleUids,
    nodeRenderVersions,
    treeRenderVersion,
    handleCheck,
    logRevision,
    toggleCollapse,
    toggleNote,
    toggleStar,
    activeNoteUid,
    noteDocuments: effectiveNoteDocuments,
    closeNoteManager,
    addNoteEntry,
    editNoteEntry,
    trashNoteEntry,
    restoreNoteEntry,
    permanentlyDeleteNoteEntry,
  };
};