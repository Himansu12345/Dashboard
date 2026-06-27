import { createAttempt, type CreateAttemptPayload } from "@/lib/api/attempts";

const ATTEMPT_QUEUE_STORAGE_KEY = "upsc-attempt-save-queue-v1";

interface PendingAttemptEntry {
  attemptKey: string;
  payload: CreateAttemptPayload;
  queuedAt: string;
  retryCount: number;
  lastError: string | null;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readQueue(): PendingAttemptEntry[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(ATTEMPT_QUEUE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((entry): entry is PendingAttemptEntry => {
      return (
        entry &&
        typeof entry === "object" &&
        typeof entry.attemptKey === "string" &&
        entry.payload &&
        typeof entry.payload === "object"
      );
    });
  } catch {
    return [];
  }
}

function writeQueue(queue: PendingAttemptEntry[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ATTEMPT_QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

function upsertQueuedAttempt(payload: CreateAttemptPayload) {
  const queue = readQueue();
  const attemptKey = String(payload.attemptKey || payload.quizSignature || "").trim();
  if (!attemptKey) {
    throw new Error("Attempt queue requires a stable attempt key.");
  }

  const nextEntry: PendingAttemptEntry = {
    attemptKey,
    payload,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
    lastError: null,
  };

  const nextQueue = queue.some((entry) => entry.attemptKey === attemptKey)
    ? queue.map((entry) => (entry.attemptKey === attemptKey ? nextEntry : entry))
    : [...queue, nextEntry];

  writeQueue(nextQueue);
}

function removeQueuedAttempt(attemptKey: string) {
  const queue = readQueue().filter((entry) => entry.attemptKey !== attemptKey);
  writeQueue(queue);
}

export async function flushPendingAttemptQueue(): Promise<{
  syncedCount: number;
  pendingCount: number;
}> {
  const queue = readQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, pendingCount: 0 };
  }

  const nextQueue: PendingAttemptEntry[] = [];
  let syncedCount = 0;

  for (const entry of queue) {
    try {
      await createAttempt(entry.payload);
      syncedCount += 1;
    } catch (error) {
      nextQueue.push({
        ...entry,
        retryCount: entry.retryCount + 1,
        lastError: error instanceof Error ? error.message : "Unable to sync queued attempt.",
      });
    }
  }

  writeQueue(nextQueue);
  return {
    syncedCount,
    pendingCount: nextQueue.length,
  };
}

export async function saveAttemptWithLocalRetry(payload: CreateAttemptPayload): Promise<{
  synced: boolean;
  queued: boolean;
  pendingCount: number;
}> {
  const attemptKey = String(payload.attemptKey || payload.quizSignature || "").trim();
  if (!attemptKey) {
    throw new Error("Attempt queue requires a stable attempt key.");
  }

  upsertQueuedAttempt(payload);
  const result = await flushPendingAttemptQueue();
  const pendingQueue = readQueue();
  const queued = pendingQueue.some((entry) => entry.attemptKey === attemptKey);

  if (!queued) {
    removeQueuedAttempt(attemptKey);
  }

  return {
    synced: !queued,
    queued,
    pendingCount: result.pendingCount,
  };
}

export function getPendingAttemptQueueSize(): number {
  return readQueue().length;
}
