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
import { buildApiUrl } from "@/lib/api/client";

type ThemeMode = "dark" | "light";

type SubjectProgressApiPayload = {
  checkedUids: string[];
  completionTimes: SubjectCompletionTimes;
  updatedAt?: number;
};

type SubjectProgressApiResponse = {
  ok?: boolean;
  updatedAt?: number;
  progress?: SubjectProgressApiPayload | null;
  data?: SubjectProgressApiPayload | null;
  error?: string;
};

type SubjectProgressToast = {
  type: "success" | "error";
  message: string;
} | null;

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
  revisions: number[];
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

          // ⚡ PRO POWER FIX: Offload the heavy JSON parsing and disk I/O from the main UI thread.
          // This guarantees the UI updates instantly without waiting for the hard drive.
          setTimeout(() => {
            window.localStorage.setItem(key, JSON.stringify(itemToStore));
          }, 0);
          
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

function normalizeUpdatedAt(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
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

  // ⚡ PRO POWER FIX: Deleted the duplicate placeholder lines!
  const [activeNoteUid, setActiveNoteUid] = useState<string | null>(null);

  const hasLoadedRemoteProgressRef = useRef(false);
  const skipNextSaveRef = useRef(true);
  const subjectProgressUpdatedAtRef = useRef<number | null>(null);
  const pendingSaveTimeoutRef = useRef<number | null>(null);
  const subjectProgressSaveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const checkedUidsRef = useRef(checkedUids);
  const completionTimesRef = useRef(completionTimes);
  const starredUidsRef = useRef(starredUids);
  const [subjectProgressToast, setSubjectProgressToast] =
    useState<SubjectProgressToast>(null);

  useEffect(() => {
    checkedUidsRef.current = checkedUids;
  }, [checkedUids]);

  useEffect(() => {
    completionTimesRef.current = completionTimes;
  }, [completionTimes]);

  useEffect(() => {
    starredUidsRef.current = starredUids;
  }, [starredUids]);

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

  const collapseToExpandedUids = useCallback(
    (expandedUids: Set<string>) => {
      const collapsedParentUids = new Set<string>();

      const collectParents = (nodes: SubjectNode[]) => {
        for (const node of nodes) {
          if (node.children && node.children.length > 0) {
            if (!expandedUids.has(node.uid)) {
              collapsedParentUids.add(node.uid);
            }
            collectParents(node.children);
          }
        }
      };

      collectParents(activeData);
      setEffectiveCollapsed(collapsedParentUids);
    },
    [activeData, setEffectiveCollapsed],
  );

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

  // ⚡ PRO POWER FIX: Placed correctly AFTER all dependencies exist!
  const { nodeRenderVersions, treeRenderVersion } = useMemo(() => {
    const versions = new Map<string, number>();
    let globalVersion = 0;

    const visit = (node: SubjectNode): number => {
      const uid = node.uid;
      let selfVersion = 0;

      if (checkedUids.has(uid)) selfVersion += 1;
      if (indeterminateUids.has(uid)) selfVersion += 2;
      if (effectiveCollapsed.has(uid)) selfVersion += 4;
      if (starredUids.has(uid)) selfVersion += 8;
      if (activeNoteUid === uid) selfVersion += 16;

      const noteContent = notes[uid];
      if (noteContent) selfVersion += noteContent.length;

      const status = nodeStatuses[uid];
      if (status && typeof status === "object" && !Array.isArray(status)) {
        if (status.isChecked) selfVersion += 32;
        if (status.completedAt) selfVersion += (status.completedAt % 100000);
        if (status.revisedAt) selfVersion += (status.revisedAt % 100000);
        if (status.revisions) selfVersion += status.revisions.length * 64;
      }

      if (visibleUids.size > 0 && !visibleUids.has(uid)) {
        selfVersion += 128;
      }

      let childSum = 0;
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          childSum += visit(node.children[i]);
        }
      }

      const totalVersion = selfVersion + childSum;
      versions.set(uid, totalVersion);
      globalVersion += totalVersion;
      
      return totalVersion;
    };

    for (let i = 0; i < activeData.length; i++) {
      visit(activeData[i]);
    }

    return { nodeRenderVersions: versions, treeRenderVersion: globalVersion };
  }, [
    activeData,
    checkedUids,
    indeterminateUids,
    effectiveCollapsed,
    starredUids,
    notes,
    nodeStatuses,
    visibleUids,
    activeNoteUid
  ]);

  const applyRemoteSubjectProgress = useCallback(
    (progressPayload: SubjectProgressApiPayload) => {
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
      const nextUpdatedAt = normalizeUpdatedAt(progressPayload.updatedAt);

      checkedUidsRef.current = nextChecked;
      completionTimesRef.current = nextCompletionTimes;
      if (nextUpdatedAt !== null) {
        subjectProgressUpdatedAtRef.current = nextUpdatedAt;
      }

      skipNextSaveRef.current = true;
      setCheckedUids(nextChecked);
      setCompletionTimes(nextCompletionTimes);
    },
    [setCheckedUids, setCompletionTimes],
  );

  const fetchSubjectProgress = useCallback(async () => {
    try {
      const response = await fetch(
        buildApiUrl(
          `/api/subject-progress?subject=${encodeURIComponent(storageKeys.checked)}`,
        ),
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        if (response.status !== 404) {
          console.warn("Failed to fetch subject progress:", response.status);
        }
        hasLoadedRemoteProgressRef.current = true;
        return null;
      }

      const data = (await response.json()) as SubjectProgressApiResponse;

      const progressPayload = data?.progress;
      if (!progressPayload) {
        hasLoadedRemoteProgressRef.current = true;
        return null;
      }

      applyRemoteSubjectProgress(progressPayload);
      hasLoadedRemoteProgressRef.current = true;
      return progressPayload;
    } catch (error) {
      console.warn("Failed to load subject progress:", error);
      hasLoadedRemoteProgressRef.current = true;
      return null;
    }
  }, [applyRemoteSubjectProgress, storageKeys.checked]);

  const saveSubjectProgress = useCallback(
    async (options?: { keepalive?: boolean }) => {
      const runSave = async () => {
        try {
          const response = await fetch(
            buildApiUrl(
              `/api/subject-progress?subject=${encodeURIComponent(storageKeys.checked)}`,
            ),
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              keepalive: options?.keepalive,
              body: JSON.stringify({
                checkedUids: Array.from(checkedUidsRef.current),
                completionTimes: completionTimesRef.current,
                updatedAt: subjectProgressUpdatedAtRef.current ?? undefined,
              } satisfies SubjectProgressApiPayload),
            },
          );

          const data = (await response
            .json()
            .catch(() => null)) as SubjectProgressApiResponse | null;

          if (response.status === 409) {
            setSubjectProgressToast({
              type: "error",
              message:
                "Subject progress changed elsewhere. Loaded the newer server copy.",
            });
            const refreshedProgress = await fetchSubjectProgress();
            if (!refreshedProgress && data?.data) {
              applyRemoteSubjectProgress(data.data);
            }
            return;
          }

          if (!response.ok) {
            console.warn("Failed to save subject progress:", response.status);
            return;
          }

          const nextUpdatedAt =
            normalizeUpdatedAt(data?.updatedAt) ??
            normalizeUpdatedAt(data?.data?.updatedAt);

          if (nextUpdatedAt !== null) {
            subjectProgressUpdatedAtRef.current = nextUpdatedAt;
          }
        } catch (error) {
          console.warn("Failed to save subject progress:", error);
        }
      };

      const queuedSave = subjectProgressSaveQueueRef.current.then(
        runSave,
        runSave,
      );
      subjectProgressSaveQueueRef.current = queuedSave.catch(() => undefined);
      await queuedSave;
    },
    [applyRemoteSubjectProgress, fetchSubjectProgress, storageKeys.checked],
  );

  useEffect(() => {
    hasLoadedRemoteProgressRef.current = false;
    skipNextSaveRef.current = true;
    subjectProgressUpdatedAtRef.current = null;
    if (pendingSaveTimeoutRef.current !== null) {
      window.clearTimeout(pendingSaveTimeoutRef.current);
      pendingSaveTimeoutRef.current = null;
    }

    const emptyChecked = new Set<string>();
    const emptyCompletionTimes: SubjectCompletionTimes = {};
    checkedUidsRef.current = emptyChecked;
    completionTimesRef.current = emptyCompletionTimes;
    setCheckedUids(emptyChecked);
    setCompletionTimes(emptyCompletionTimes);

    void fetchSubjectProgress();
  }, [fetchSubjectProgress, setCheckedUids, setCompletionTimes]);

  useEffect(() => {
    if (!hasLoadedRemoteProgressRef.current) return;

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    if (pendingSaveTimeoutRef.current !== null) {
      window.clearTimeout(pendingSaveTimeoutRef.current);
    }

    pendingSaveTimeoutRef.current = window.setTimeout(() => {
      pendingSaveTimeoutRef.current = null;
      void saveSubjectProgress();
    }, 600);

    return () => {
      if (pendingSaveTimeoutRef.current !== null) {
        window.clearTimeout(pendingSaveTimeoutRef.current);
        pendingSaveTimeoutRef.current = null;
      }
    };
  }, [checkedUids, completionTimes, saveSubjectProgress]);

  const flushPendingSubjectProgressSave = useCallback(() => {
    if (pendingSaveTimeoutRef.current === null) return;

    window.clearTimeout(pendingSaveTimeoutRef.current);
    pendingSaveTimeoutRef.current = null;
    void saveSubjectProgress({ keepalive: true });
  }, [saveSubjectProgress]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushPendingSubjectProgressSave();
      }
    };

    const handlePageHide = () => {
      flushPendingSubjectProgressSave();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [flushPendingSubjectProgressSave]);

  useEffect(() => {
    if (!subjectProgressToast) return;

    const timeoutId = window.setTimeout(() => {
      setSubjectProgressToast(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [subjectProgressToast]);

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
        action: actionTypeMap[eventType],
        previousStatus,
        newStatus,
        subject: meta.subject,
        chapter: meta.chapter,
        topic: meta.topic,
        subtopic: meta.subtopic,
        pointUid: meta.uid,
        pointText: meta.pointText || meta.label,
        note: meta.pointText || meta.label,
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
      const currentCheckedUids = checkedUidsRef.current;
      const currentCompletionTimes = completionTimesRef.current;
      const currentStarredUids = starredUidsRef.current;
      const previousChecked = currentCheckedUids.has(uid);
      const previousCompletion = normalizeCompletionRecord(
        currentCompletionTimes[uid],
      );

      const previousStatus: ReportEventStatus = {
        isChecked: previousChecked,
        completedAt: previousCompletion?.completedAt,
        revisedAt: previousCompletion?.revisedAt,
        revisions: previousCompletion?.revisions ?? [],
        isStarred: currentStarredUids.has(uid),
      };

      const now = Date.now();

      setCheckedUids((prevChecked) => {
        const nextChecked = new Set(prevChecked);
        if (isChecked) nextChecked.add(uid);
        else nextChecked.delete(uid);
        checkedUidsRef.current = nextChecked;
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

        completionTimesRef.current = nextCompletionTimes;
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
        isStarred: currentStarredUids.has(uid),
      };

      void reportSubjectEvent(
        uid,
        isChecked ? "note_complete" : "note_uncomplete",
        previousStatus,
        newStatus,
      );
    },
    [
      reportSubjectEvent,
      setCheckedUids,
      setCompletionTimes,
    ],
  );

  const logRevision = useCallback(
    (uid: string) => {
      const now = Date.now();
      const currentCheckedUids = checkedUidsRef.current;
      const currentCompletionTimes = completionTimesRef.current;
      const currentStarredUids = starredUidsRef.current;
      const previousChecked = currentCheckedUids.has(uid);
      const previousCompletion = normalizeCompletionRecord(
        currentCompletionTimes[uid],
      );

      const previousStatus: ReportEventStatus = {
        isChecked: previousChecked,
        completedAt: previousCompletion?.completedAt,
        revisedAt: previousCompletion?.revisedAt,
        revisions: previousCompletion?.revisions ?? [],
        isStarred: currentStarredUids.has(uid),
      };

      const nextRecord: NormalizedCompletionRecord = {
        completedAt: previousCompletion?.completedAt ?? now,
        revisedAt: now,
        revisions: [...(previousCompletion?.revisions ?? []), now],
      };

      setCheckedUids((prevChecked) => {
        const nextChecked = new Set(prevChecked);
        nextChecked.add(uid);
        checkedUidsRef.current = nextChecked;
        return nextChecked;
      });

      setCompletionTimes((prevCompletionTimes) => {
        const nextCompletionTimes = {
          ...prevCompletionTimes,
          [uid]: nextRecord,
        };
        completionTimesRef.current = nextCompletionTimes;
        return nextCompletionTimes;
      });

      const newStatus: ReportEventStatus = {
        isChecked: true,
        completedAt: nextRecord.completedAt,
        revisedAt: nextRecord.revisedAt,
        revisions: nextRecord.revisions,
        isStarred: currentStarredUids.has(uid),
      };

      void reportSubjectEvent(uid, "note_revise", previousStatus, newStatus, {
        revisionCount: nextRecord.revisions.length,
      });
    },
    [
      reportSubjectEvent,
      setCheckedUids,
      setCompletionTimes,
    ],
  );

  const completeMany = useCallback(
    (uids: string[], options?: { source?: string; blockLabel?: string }) => {
      const uniqueUids = Array.from(new Set(uids)).filter(Boolean);
      if (uniqueUids.length === 0) return;

      const now = Date.now();
      const currentCheckedUids = checkedUidsRef.current;
      const currentCompletionTimes = completionTimesRef.current;
      const currentStarredUids = starredUidsRef.current;

      const events = uniqueUids.map((uid) => {
        const previousChecked = currentCheckedUids.has(uid);
        const previousCompletion = normalizeCompletionRecord(
          currentCompletionTimes[uid],
        );
        const nextCompletion = previousCompletion ?? {
          completedAt: now,
          revisions: [],
        };

        return {
          uid,
          previousStatus: {
            isChecked: previousChecked,
            completedAt: previousCompletion?.completedAt,
            revisedAt: previousCompletion?.revisedAt,
            revisions: previousCompletion?.revisions ?? [],
            isStarred: currentStarredUids.has(uid),
          } satisfies ReportEventStatus,
          newStatus: {
            isChecked: true,
            completedAt: nextCompletion.completedAt,
            revisedAt: nextCompletion.revisedAt,
            revisions: nextCompletion.revisions,
            isStarred: currentStarredUids.has(uid),
          } satisfies ReportEventStatus,
        };
      });

      const nextChecked = new Set(currentCheckedUids);
      uniqueUids.forEach((uid) => nextChecked.add(uid));
      checkedUidsRef.current = nextChecked;
      setCheckedUids(nextChecked);

      const nextCompletionTimes = { ...currentCompletionTimes };
      uniqueUids.forEach((uid) => {
        const existing = normalizeCompletionRecord(nextCompletionTimes[uid]);
        nextCompletionTimes[uid] = existing ?? {
          completedAt: now,
          revisions: [],
        };
      });
      completionTimesRef.current = nextCompletionTimes;
      setCompletionTimes(nextCompletionTimes);

      events.forEach((event) => {
        void reportSubjectEvent(
          event.uid,
          "note_complete",
          event.previousStatus,
          event.newStatus,
          {
            source: options?.source ?? "manual_time_block",
            blockLabel: options?.blockLabel,
            batchSize: uniqueUids.length,
          },
        );
      });
    },
    [reportSubjectEvent, setCheckedUids, setCompletionTimes],
  );

  const reviseMany = useCallback(
    (uids: string[], options?: { source?: string; blockLabel?: string }) => {
      const uniqueUids = Array.from(new Set(uids)).filter(Boolean);
      if (uniqueUids.length === 0) return;

      const now = Date.now();
      const currentCheckedUids = checkedUidsRef.current;
      const currentCompletionTimes = completionTimesRef.current;
      const currentStarredUids = starredUidsRef.current;

      const nextChecked = new Set(currentCheckedUids);
      const nextCompletionTimes = { ...currentCompletionTimes };

      const events = uniqueUids.map((uid) => {
        const previousChecked = currentCheckedUids.has(uid);
        const previousCompletion = normalizeCompletionRecord(
          currentCompletionTimes[uid],
        );
        const nextRecord: NormalizedCompletionRecord = {
          completedAt: previousCompletion?.completedAt ?? now,
          revisedAt: now,
          revisions: [...(previousCompletion?.revisions ?? []), now],
        };

        nextChecked.add(uid);
        nextCompletionTimes[uid] = nextRecord;

        return {
          uid,
          revisionCount: nextRecord.revisions.length,
          previousStatus: {
            isChecked: previousChecked,
            completedAt: previousCompletion?.completedAt,
            revisedAt: previousCompletion?.revisedAt,
            revisions: previousCompletion?.revisions ?? [],
            isStarred: currentStarredUids.has(uid),
          } satisfies ReportEventStatus,
          newStatus: {
            isChecked: true,
            completedAt: nextRecord.completedAt,
            revisedAt: nextRecord.revisedAt,
            revisions: nextRecord.revisions,
            isStarred: currentStarredUids.has(uid),
          } satisfies ReportEventStatus,
        };
      });

      checkedUidsRef.current = nextChecked;
      completionTimesRef.current = nextCompletionTimes;
      setCheckedUids(nextChecked);
      setCompletionTimes(nextCompletionTimes);

      events.forEach((event) => {
        void reportSubjectEvent(
          event.uid,
          "note_revise",
          event.previousStatus,
          event.newStatus,
          {
            source: options?.source ?? "manual_time_block",
            blockLabel: options?.blockLabel,
            batchSize: uniqueUids.length,
            revisionCount: event.revisionCount,
          },
        );
      });
    },
    [reportSubjectEvent, setCheckedUids, setCompletionTimes],
  );

  const toggleStar = useCallback(
    (uid: string) => {
      const currentCheckedUids = checkedUidsRef.current;
      const currentCompletionTimes = completionTimesRef.current;
      const currentStarredUids = starredUidsRef.current;
      const wasStarred = currentStarredUids.has(uid);
      const previousCompletion = normalizeCompletionRecord(
        currentCompletionTimes[uid],
      );

      const previousStatus: ReportEventStatus = {
        isChecked: currentCheckedUids.has(uid),
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
        isChecked: currentCheckedUids.has(uid),
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
    [setStarredUids, reportSubjectEvent],
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
    collapseToExpandedUids,
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
    completeMany,
    reviseMany,
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
    subjectProgressToast,
  };
};
