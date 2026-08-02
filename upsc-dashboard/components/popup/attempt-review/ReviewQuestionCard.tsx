import { useState } from "react";
import type { PracticeQuestionDetail } from "@/types/records";
import { normalizeComparisonValue } from "@/components/popup/attempt-review/helpers";

interface ReviewQuestionCardProps {
  detail: PracticeQuestionDetail;
  index: number;
  onOpenNote: (detail: PracticeQuestionDetail) => void;
  onOpenWhy: (detail: PracticeQuestionDetail) => void;
  isSolveMode?: boolean;
}

export default function ReviewQuestionCard({
  detail,
  index,
  onOpenNote,
  onOpenWhy,
  isSolveMode,
}: ReviewQuestionCardProps) {
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<string | null>(
    null,
  );

  const normalizedCorrect = normalizeComparisonValue(detail.correctAnswer);
  const normalizedSelected =
    isSolveMode && localSelectedAnswer
      ? normalizeComparisonValue(localSelectedAnswer)
      : normalizeComparisonValue(detail.selectedAnswer);

  const isAnswerRevealed = !isSolveMode || localSelectedAnswer !== null;

  return (
    <article className="mb-5 flex flex-col rounded-2xl border border-white/[0.06] bg-[#0A0C10] p-5 shadow-sm transition-all sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-xs font-black text-slate-400">
          {index + 1}
        </span>
        <div className="flex flex-col gap-1.5 pt-0.5">
          {detail.question.split("\n").map((line, lineIndex) => (
            <span
              key={lineIndex}
              className="text-[15px] font-medium leading-relaxed text-slate-200"
            >
              {line}
            </span>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {detail.options.map((option) => {
          const normalizedOption = normalizeComparisonValue(option);

          let containerClass =
            "border-transparent bg-white/[0.02] text-slate-300 hover:bg-white/[0.04]";
          let labelTag = null;
          let isCorrect = false;
          let isSelected = false;

          if (isAnswerRevealed) {
            isCorrect =
              normalizedCorrect.length > 0 &&
              normalizedOption === normalizedCorrect;
            isSelected =
              normalizedSelected.length > 0 &&
              normalizedOption === normalizedSelected;

            if (isCorrect && isSelected) {
              containerClass =
                "border-l-4 border-l-emerald-500 border-y-white/[0.04] border-r-white/[0.04] bg-emerald-500/5 text-emerald-100";
              labelTag = (
                <span className="ml-auto rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Correct / Selected
                </span>
              );
            } else if (isCorrect) {
              containerClass =
                "border-l-4 border-l-emerald-500 border-y-white/[0.04] border-r-white/[0.04] bg-emerald-500/5 text-emerald-100";
              labelTag = (
                <span className="ml-auto rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Correct
                </span>
              );
            } else if (isSelected) {
              containerClass =
                "border-l-4 border-l-rose-500 border-y-white/[0.04] border-r-white/[0.04] bg-rose-500/5 text-rose-100";
              labelTag = (
                <span className="ml-auto rounded border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-rose-400">
                  Selected
                </span>
              );
            }
          } else if (isSolveMode && localSelectedAnswer === option) {
            containerClass =
              "border-l-4 border-l-indigo-500 border-y-white/[0.04] border-r-white/[0.04] bg-indigo-500/5 text-indigo-100";
          }

          return (
            <li
              key={`${detail.question}-${option}`}
              className={`flex min-h-[44px] cursor-pointer items-center rounded-r-xl border px-4 py-2 transition-all ${containerClass}`}
              onClick={() => {
                if (isSolveMode && !isAnswerRevealed) {
                  setLocalSelectedAnswer(option);
                }
              }}
            >
              <span className="text-sm">{option}</span>
              {labelTag}
            </li>
          );
        })}
      </ul>

      {isAnswerRevealed && (
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
          {isSolveMode && (
            <div className="text-xs font-bold uppercase tracking-widest">
              {normalizedSelected === normalizedCorrect ? (
                <span className="text-emerald-400">✓ Right this time</span>
              ) : (
                <span className="text-rose-400">✗ Still incorrect</span>
              )}
            </div>
          )}
          <div className="ml-auto flex gap-3">
            <button
              type="button"
              className="rounded-lg bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => onOpenWhy(detail)}
            >
              Why?
            </button>
            <button
              type="button"
              className="rounded-lg bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => onOpenNote(detail)}
            >
              View Note
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
