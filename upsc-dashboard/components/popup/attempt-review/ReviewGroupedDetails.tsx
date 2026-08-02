import ReviewQuestionCard from "@/components/popup/attempt-review/ReviewQuestionCard";
import type { PracticeQuestionDetail } from "@/types/records";
import type { ReviewGroupedDate } from "./reviewPopupTypes";

interface ReviewGroupedDetailsProps {
  groupedDetails: ReviewGroupedDate[];
  deletingAttemptIdSet: Set<string>;
  onDeleteGroupedDate: (
    dateLabel: string,
    attemptIds: string[],
  ) => Promise<void>;
  onDeleteGroupedAttempt: (attemptId: string) => Promise<void>;
  onOpenNote: (detail: PracticeQuestionDetail) => void;
  onOpenWhy: (detail: PracticeQuestionDetail) => void;
  isSolveMode?: boolean;
}

export default function ReviewGroupedDetails({
  groupedDetails,
  deletingAttemptIdSet,
  onDeleteGroupedDate,
  onDeleteGroupedAttempt,
  onOpenNote,
  onOpenWhy,
  isSolveMode,
}: ReviewGroupedDetailsProps) {
  return (
    <div className="flex flex-col gap-8">
      {groupedDetails.map((group) => (
        <section key={group.dateKey} className="flex flex-col gap-4">
          {/* Date Group Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-4">
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">
                {group.dateLabel}
              </p>
              <span className="rounded-md bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                Attempts: {group.attempts.length}
              </span>
            </div>
            <button
              type="button"
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 transition-colors hover:bg-red-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                void onDeleteGroupedDate(
                  group.dateLabel,
                  group.attempts.map((attempt) => attempt.recordId),
                )
              }
              disabled={
                group.attempts.length > 0 &&
                group.attempts.every((attempt) =>
                  deletingAttemptIdSet.has(attempt.recordId),
                )
              }
            >
              {group.attempts.length > 0 &&
              group.attempts.every((attempt) =>
                deletingAttemptIdSet.has(attempt.recordId),
              )
                ? "Deleting..."
                : "Delete Date"}
            </button>
          </div>

          {/* Attempts List */}
          <div className="flex flex-col gap-6">
            {group.attempts.map((attempt) => (
              <section
                key={`${group.dateKey}-${attempt.attemptNumber}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.04] bg-[#07090C] shadow-sm"
              >
                {/* Attempt Card Header */}
                <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.02] px-5 py-3.5">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-200">
                      Attempt {attempt.attemptNumber}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {attempt.details.length} wrong/skipped questions
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-red-500/20 bg-transparent px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 transition-colors hover:bg-red-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() =>
                      void onDeleteGroupedAttempt(attempt.recordId)
                    }
                    disabled={deletingAttemptIdSet.has(attempt.recordId)}
                  >
                    {deletingAttemptIdSet.has(attempt.recordId)
                      ? "Deleting..."
                      : "Delete Attempt"}
                  </button>
                </div>

                {/* Questions List */}
                <div className="flex flex-col p-5 pb-0 sm:p-6 sm:pb-0">
                  {attempt.details.map((detail, index) => (
                    <ReviewQuestionCard
                      key={`${group.dateKey}-${attempt.attemptNumber}-${detail.question}-${index}`}
                      detail={detail}
                      index={index}
                      onOpenNote={onOpenNote}
                      onOpenWhy={onOpenWhy}
                      isSolveMode={isSolveMode}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
