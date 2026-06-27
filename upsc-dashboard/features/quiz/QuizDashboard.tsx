"use client";

import { useEffect, useMemo, useState } from "react";
import {
  failLoading,
  loadQuiz,
  startLoading,
  type QuizApiPayload,
  type QuizMode,
} from "@/store/slices/quizSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type {
  McqChapterIndexItem,
  McqSubjectIndexItem,
} from "@/features/quiz/mcqBank";
import QuizSessionPopup from "@/features/quiz/QuizSessionPopup";

const minuteOptions = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60];

interface QuizDashboardProps {
  bankIndex: McqSubjectIndexItem[];
}

function buildDefaultSplit(
  availableCount: number,
  difficultyCounts: { easy: number; medium: number; hard: number },
) {
  const target = Math.min(10, availableCount);
  const split = { easy: 0, medium: 0, hard: 0 };
  let remaining = target;

  split.medium = Math.min(Math.floor(target / 2), difficultyCounts.medium);
  remaining -= split.medium;
  split.easy = Math.min(remaining, difficultyCounts.easy);
  remaining -= split.easy;
  split.hard = Math.min(remaining, difficultyCounts.hard);
  remaining -= split.hard;

  (["easy", "medium", "hard"] as const).forEach((difficulty) => {
    if (remaining <= 0) return;
    const capacity = difficultyCounts[difficulty] - split[difficulty];
    const fill = Math.min(remaining, Math.max(0, capacity));
    split[difficulty] += fill;
    remaining -= fill;
  });

  return { total: target - remaining, ...split };
}

function partitionTopicsByChapter(
  noteChapter:
    | NonNullable<McqSubjectIndexItem["noteChapters"]>[number]
    | undefined,
  topics: McqChapterIndexItem[],
) {
  if (!noteChapter) {
    return { suggested: topics, other: [] as McqChapterIndexItem[] };
  }

  const suggestedSlugs = new Set(
    noteChapter.topicLinks
      .filter((link) => link.isSuggested)
      .map((link) => link.slug),
  );
  const relatedSlugs = new Set(noteChapter.topicLinks.map((link) => link.slug));

  const suggested = topics.filter((topic) => suggestedSlugs.has(topic.slug));
  if (suggested.length > 0) {
    return {
      suggested,
      other: topics.filter((topic) => !suggestedSlugs.has(topic.slug)),
    };
  }

  return {
    suggested: topics.filter((topic) => relatedSlugs.has(topic.slug)),
    other: topics.filter((topic) => !relatedSlugs.has(topic.slug)),
  };
}

function SelectChevron() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500 transition-colors group-hover:text-zinc-300">
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function QuizDashboard({ bankIndex }: QuizDashboardProps) {
  const dispatch = useAppDispatch();
  const questions = useAppSelector((state) => state.quiz.questions);
  const isLoading = useAppSelector((state) => state.quiz.isLoading);
  const error = useAppSelector((state) => state.quiz.error);

  const [subject, setSubject] = useState(bankIndex[0]?.name || "");
  const selectedSubject = useMemo(
    () => bankIndex.find((item) => item.name === subject) || bankIndex[0],
    [bankIndex, subject],
  );

  const [noteChapterId, setNoteChapterId] = useState(
    selectedSubject?.noteChapters?.[0]?.id || "",
  );
  const [topicSlug, setTopicSlug] = useState(
    selectedSubject?.chapters[0]?.slug || "",
  );
  const [mode, setMode] = useState<QuizMode>("practice");
  const [easyCount, setEasyCount] = useState(4);
  const [mediumCount, setMediumCount] = useState(4);
  const [hardCount, setHardCount] = useState(2);
  const [minutes, setMinutes] = useState(10);

  useEffect(() => {
    if (!selectedSubject) return;
    setNoteChapterId(selectedSubject.noteChapters?.[0]?.id || "");
  }, [selectedSubject]);

  const selectedNoteChapter = useMemo(
    () =>
      selectedSubject?.noteChapters?.find(
        (chapter) => chapter.id === noteChapterId,
      ) || selectedSubject?.noteChapters?.[0],
    [noteChapterId, selectedSubject],
  );

  const topicGroups = useMemo(
    () =>
      partitionTopicsByChapter(
        selectedNoteChapter,
        selectedSubject?.chapters || [],
      ),
    [selectedNoteChapter, selectedSubject],
  );

  useEffect(() => {
    const orderedTopics = [...topicGroups.suggested, ...topicGroups.other];
    if (orderedTopics.length === 0) {
      setTopicSlug("");
      return;
    }
    if (!orderedTopics.some((topic) => topic.slug === topicSlug)) {
      setTopicSlug(orderedTopics[0].slug);
    }
  }, [topicGroups, topicSlug]);

  const selectedTopic = useMemo(
    () =>
      selectedSubject?.chapters.find((topic) => topic.slug === topicSlug) ||
      selectedSubject?.chapters[0],
    [selectedSubject, topicSlug],
  );

  const availableCount = selectedTopic?.questionCount || 0;
  const difficultyCounts = selectedTopic?.difficultyCounts || {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  useEffect(() => {
    if (!selectedTopic) return;
    const split = buildDefaultSplit(
      selectedTopic.questionCount,
      selectedTopic.difficultyCounts,
    );
    setEasyCount(split.easy);
    setMediumCount(split.medium);
    setHardCount(split.hard);
  }, [selectedTopic]);

  const difficultyTotal = easyCount + mediumCount + hardCount;
  const canApply =
    !!(selectedSubject && selectedTopic) &&
    difficultyTotal > 0 &&
    minutes > 0 &&
    difficultyTotal <= availableCount &&
    easyCount <= difficultyCounts.easy &&
    mediumCount <= difficultyCounts.medium &&
    hardCount <= difficultyCounts.hard;
  const isSessionActive = questions.length > 0;

  async function handleApply() {
    if (!selectedSubject || !selectedTopic) return;

    dispatch(startLoading());
    try {
      const res = await fetch("/api/mcq-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject.name,
          chapter: selectedTopic.slug,
          noteChapter: selectedNoteChapter?.label || "",
          noteChapterId: selectedNoteChapter?.id || "",
          mode,
          totalQuestions: difficultyTotal,
          easyCount,
          mediumCount,
          hardCount,
          minutes,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Failed to initiate sequence.");
      }
      dispatch(loadQuiz(payload as QuizApiPayload));
    } catch (err) {
      dispatch(
        failLoading(
          err instanceof Error ? err.message : "Failed to initiate sequence.",
        ),
      );
    }
  }

  return (
    <main className="relative flex min-h-[80vh] flex-col overflow-hidden bg-[#030303] text-zinc-50 selection:bg-indigo-500/30">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(99,102,241,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,white,transparent_80%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 md:py-20 lg:py-28">
        {!isSessionActive && (
          <header className="mx-auto flex w-full flex-col gap-10 rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl md:p-12 lg:p-16">
            <div className="text-center">
              <p className="mt-2 text-base font-medium tracking-wide text-zinc-400 md:text-lg">
                Design your optimal focus protocol.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-12">
              <div className="xl:col-span-3">
                <div className="group relative">
                  <select
                    className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] px-5 pr-12 text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/18 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={selectedSubject?.name || ""}
                    onChange={(event) => setSubject(event.target.value)}
                  >
                    {bankIndex.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </div>

              <div className="xl:col-span-4">
                <div className="group relative">
                  <select
                    className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] px-5 pr-12 text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/18 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={selectedNoteChapter?.id || ""}
                    onChange={(event) => setNoteChapterId(event.target.value)}
                  >
                    {(selectedSubject?.noteChapters || []).map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.label}
                      </option>
                    ))}
                    {(!selectedSubject?.noteChapters ||
                      selectedSubject.noteChapters.length === 0) && (
                      <option value="">No linked note chapters</option>
                    )}
                  </select>
                  <SelectChevron />
                </div>
              </div>

              <div className="xl:col-span-3">
                <div className="group relative">
                  <select
                    className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] px-5 pr-12 text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/18 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={selectedTopic?.slug || ""}
                    onChange={(event) => setTopicSlug(event.target.value)}
                  >
                    {topicGroups.suggested.length > 0 && (
                      <optgroup label="Suggested for chapter">
                        {topicGroups.suggested.map((topic) => (
                          <option key={topic.slug} value={topic.slug}>
                            {topic.title}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {topicGroups.other.length > 0 && (
                      <optgroup label="Other topics">
                        {topicGroups.other.map((topic) => (
                          <option key={topic.slug} value={topic.slug}>
                            {topic.title}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <SelectChevron />
                </div>
              </div>

              <div className="xl:col-span-2">
                <div className="group relative">
                  <select
                    className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] px-5 pr-12 text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/18 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={mode}
                    onChange={(event) =>
                      setMode(
                        event.target.value === "exam" ? "exam" : "practice",
                      )
                    }
                  >
                    <option value="practice">Practice</option>
                    <option value="exam">Exam</option>
                  </select>
                  <SelectChevron />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 border-t border-white/5 pt-8 md:gap-5 md:pt-10">
              {[
                {
                  label: "Easy",
                  value: easyCount,
                  setValue: (value: string) => setEasyCount(Number(value)),
                  options: Array.from(
                    { length: difficultyCounts.easy + 1 },
                    (_, count) => count,
                  ),
                },
                {
                  label: "Medium",
                  value: mediumCount,
                  setValue: (value: string) => setMediumCount(Number(value)),
                  options: Array.from(
                    { length: difficultyCounts.medium + 1 },
                    (_, count) => count,
                  ),
                },
                {
                  label: "Hard",
                  value: hardCount,
                  setValue: (value: string) => setHardCount(Number(value)),
                  options: Array.from(
                    { length: difficultyCounts.hard + 1 },
                    (_, count) => count,
                  ),
                },
                {
                  label: "Timer",
                  value: minutes,
                  setValue: (value: string) => setMinutes(Number(value)),
                  options: minuteOptions,
                },
              ].map((item) => (
                <label
                  key={item.label}
                  className="group flex flex-1 basis-[130px] items-center justify-between gap-4 rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-3 md:py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/14 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]"
                >
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500 transition-colors group-hover:text-zinc-400">
                    {item.label}
                  </span>
                  <div className="group relative w-full max-w-[90px]">
                    <select
                      className="w-full appearance-none rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0d0f14,#090b0f)] px-3 py-2 pl-4 pr-8 text-center text-sm font-black text-zinc-100 outline-none transition-colors hover:border-white/14 focus:border-indigo-400"
                      value={item.value}
                      onChange={(event) => item.setValue(event.target.value)}
                    >
                      {item.options.map((option) => (
                        <option
                          className="bg-zinc-900"
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-500">
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </label>
              ))}

              <button
                onClick={handleApply}
                disabled={isLoading || !canApply}
                className="ml-2 h-[60px] w-40 rounded-2xl bg-white px-8 text-base font-bold text-black transition-all hover:bg-indigo-400 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] disabled:opacity-50 md:w-48"
              >
                {isLoading ? "..." : "INITIATE"}
              </button>
            </div>
          </header>
        )}

        {isSessionActive && <QuizSessionPopup />}

        {isLoading && !isSessionActive && (
          <div className="mt-24 flex flex-col items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-indigo-500/20" />
              <div className="absolute inset-2 rounded-full border-t-2 border-indigo-500 animate-[spin_2s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border-r-2 border-white/50 animate-[spin_3s_linear_infinite_reverse]" />
            </div>
            <p className="mt-8 font-mono text-base uppercase tracking-widest text-indigo-400">
              Constructing Quiz Matrix
            </p>
          </div>
        )}

        {error && (
          <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-base text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.1)] backdrop-blur-md">
            <svg
              className="mx-auto mb-4 h-10 w-10 opacity-80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
