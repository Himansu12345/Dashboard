export type NoteMissionMode = "complete" | "revise";

export type PlannerProgressRecord =
  | number
  | {
      completedAt?: number;
      revisedAt?: number;
      revisions?: number[];
    };

export type SubjectProgressPayload = {
  checkedUids?: string[];
  completionTimes?: Record<string, PlannerProgressRecord>;
};

export type PlannerTopicTargetLike = {
  uid?: string;
  label?: string;
  leafUids?: string[];
  isCompleted?: boolean;
  isRevised?: boolean;
  totalLeafCount?: number;
  completedLeafCount?: number;
  revisedLeafCount?: number;
  completionPercent?: number;
  [key: string]: unknown;
};

export type PlannerNoteMissionLike = {
  mode?: NoteMissionMode;
  createdAt?: number;
  targets?: PlannerTopicTargetLike[];
  timeValidation?: {
    actualStart?: string | null;
    [key: string]: unknown;
  };
  progress?: {
    status?: string;
    completionPercent?: number;
    totalTargets?: number;
    completedTargets?: number;
    revisedTargets?: number;
    closedAt?: number;
    targets?: PlannerTopicTargetLike[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export function calculateNoteMissionProgress<T extends PlannerNoteMissionLike>(
  mission: T,
  subjectProgress?: SubjectProgressPayload,
  options?: {
    hydrateTarget?: (
      target: PlannerTopicTargetLike,
      mission: T,
    ) => PlannerTopicTargetLike;
  },
): T;

export function getMissionRevisionStart(
  mission: PlannerNoteMissionLike,
): number;

export function getNoteMissionMode(
  mission?: Pick<PlannerNoteMissionLike, "mode"> | null,
): NoteMissionMode;

export function isLeafRevised(
  uid: string,
  completionTimes: SubjectProgressPayload["completionTimes"],
  sinceTimestamp: number,
): boolean;

export function normalizeProgressRecord(
  value: PlannerProgressRecord,
): {
  completedAt?: number;
  revisedAt?: number;
  revisions: number[];
};
