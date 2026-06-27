import type { PracticeQuestionDetail, PracticeRecord } from "@/types/records";
import type { ReviewDateOption, ReviewGroupedDate, ReviewSortOrder } from "./reviewPopupTypes";

export function toTimestamp(value: string | undefined): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getReviewDateOptions(
  details: PracticeQuestionDetail[],
  record: PracticeRecord | null,
): ReviewDateOption[] {
  const options = new Map<string, string>();
  details.forEach((detail) => {
    const dateKey = detail.sourceRecordDateValue || record?.dateValue || "undated";
    const dateLabel = detail.sourceRecordDate || record?.date || "N/A";
    if (!options.has(dateKey)) {
      options.set(dateKey, dateLabel);
    }
  });
  return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
}

export function getGroupedDetails(
  details: PracticeQuestionDetail[],
  record: PracticeRecord | null,
  reviewDateFilter: string,
  reviewSortOrder: ReviewSortOrder,
): ReviewGroupedDate[] {
  const filteredDetails = details.filter((detail) => {
    if (reviewDateFilter === "all") return true;
    return (detail.sourceRecordDateValue || record?.dateValue || "undated") === reviewDateFilter;
  });

  const dateGroups = new Map<
    string,
    {
      dateKey: string;
      dateLabel: string;
      attempts: Map<
        string,
        {
          recordId: string;
          createdAt: string;
          details: PracticeQuestionDetail[];
        }
      >;
    }
  >();

  filteredDetails.forEach((detail) => {
    const dateKey = detail.sourceRecordDateValue || record?.dateValue || "undated";
    const dateLabel = detail.sourceRecordDate || record?.date || "N/A";
    const recordId = detail.sourceRecordId || record?.id || "attempt";
    const createdAt = detail.sourceRecordCreatedAt || record?.createdAt || "";

    const dateGroup = dateGroups.get(dateKey) || {
      dateKey,
      dateLabel,
      attempts: new Map(),
    };
    const attemptGroup = dateGroup.attempts.get(recordId) || {
      recordId,
      createdAt,
      details: [],
    };

    attemptGroup.details.push(detail);
    dateGroup.attempts.set(recordId, attemptGroup);
    dateGroups.set(dateKey, dateGroup);
  });

  const sortedDateGroups = Array.from(dateGroups.values()).sort((first, second) => {
    const direction = reviewSortOrder === "date-asc" ? 1 : -1;
    return (toTimestamp(first.dateKey) - toTimestamp(second.dateKey)) * direction;
  });

  return sortedDateGroups.map((dateGroup) => {
    const attempts = Array.from(dateGroup.attempts.values())
      .sort((first, second) => toTimestamp(first.createdAt) - toTimestamp(second.createdAt))
      .map((attempt, index) => ({
        recordId: attempt.recordId,
        attemptNumber: index + 1,
        details: attempt.details,
      }));

    return {
      dateKey: dateGroup.dateKey,
      dateLabel: dateGroup.dateLabel,
      attempts,
    };
  });
}
