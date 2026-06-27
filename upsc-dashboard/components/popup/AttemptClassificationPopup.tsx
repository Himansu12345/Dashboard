import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  MotionModalBackdrop,
  MotionModalPanel,
} from "@/components/motion/MotionWrappers";
import {
  getSubtopicOptionsForTopic,
  syllabusTrackerTree,
} from "@/lib/data/syllabusTrackerTree";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import type { AttemptResponse } from "@/lib/api/attempts";

const SUBJECT_OPTIONS = syllabusTrackerTree.map((item) => ({
  label: item.title,
  value: item.progressKey || item.title,
  chapters: item.chapters,
}));
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"] as const;

function getSubjectOption(subjectValue: string) {
  return SUBJECT_OPTIONS.find(
    (item) => item.value === subjectValue || item.label === subjectValue,
  );
}

function getInitialSubject(attempt: AttemptResponse): string {
  if (!attempt.subject) return "";
  return getSubjectOption(attempt.subject)?.value || "";
}

function getInitialTopic(subject: string, attemptTopic: string | null): string {
  const subjectOption = getSubjectOption(subject);
  const topics = subjectOption?.chapters || [];
  if (!topics.length) return "";
  if (attemptTopic) {
    const matchedTopic = topics.find(
      (item) =>
        item.title === attemptTopic || item.progressKey === attemptTopic,
    );
    if (matchedTopic) return matchedTopic.progressKey || matchedTopic.title;
  }
  return topics[0]?.progressKey || topics[0]?.title || "";
}

function getInitialDifficulty(attempt: AttemptResponse): (typeof DIFFICULTY_OPTIONS)[number] {
  const normalizedDifficulty = String(attempt.difficulty || "").trim();
  if (DIFFICULTY_OPTIONS.includes(normalizedDifficulty as (typeof DIFFICULTY_OPTIONS)[number])) {
    return normalizedDifficulty as (typeof DIFFICULTY_OPTIONS)[number];
  }
  return "Easy";
}

function getInitialSubtopic(
  subject: string,
  topic: string,
  attemptSubtopic: string | null | undefined,
): string {
  if (!subject || !topic) return "";
  const subtopicOptions = getSubtopicOptionsForTopic(subject, topic);
  if (subtopicOptions.length === 0) return "";
  if (
    attemptSubtopic &&
    subtopicOptions.some((item) => item.title === attemptSubtopic)
  ) {
    return attemptSubtopic;
  }
  return subtopicOptions[0]?.title || "";
}

interface AttemptClassificationPopupProps {
  attempt: AttemptResponse | null;
  isSubmitting: boolean;
  errorMessage?: string;
  onConfirm: (payload: {
    id: string;
    subject: string;
    topic: string;
    subtopic: string | null;
    difficulty: string;
  }) => Promise<void> | void;
}

export default function AttemptClassificationPopup({
  attempt,
  isSubmitting,
  errorMessage = "",
  onConfirm,
}: AttemptClassificationPopupProps) {
  const isOpen = Boolean(attempt);
  const initialSubject = attempt ? getInitialSubject(attempt) : "";
  const initialTopic = attempt ? getInitialTopic(initialSubject, attempt.topic) : "";
  const initialDifficulty = attempt ? getInitialDifficulty(attempt) : "Easy";
  const initialSubtopic = attempt
    ? getInitialSubtopic(initialSubject, initialTopic, attempt.subtopic)
    : "";
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [subtopic, setSubtopic] = useState(initialSubtopic);
  const [difficulty, setDifficulty] = useState<string>(initialDifficulty);
  const panelRef = useRef<HTMLElement | null>(null);
  const topicOptions = useMemo(
    () => getSubjectOption(subject)?.chapters || [],
    [subject],
  );
  const subtopicOptions = useMemo(
    () => getSubtopicOptionsForTopic(subject, topic),
    [subject, topic],
  );
  const isSubtopicRequired = subtopicOptions.length > 0;
  const canSubmit = Boolean(
    attempt &&
      subject &&
      topic &&
      difficulty &&
      (!isSubtopicRequired || subtopic) &&
      !isSubmitting,
  );

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "select, button",
  });

  function handleSubjectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextSubject = event.target.value;
    const nextTopics = getSubjectOption(nextSubject)?.chapters || [];
    setSubject(nextSubject);
    setTopic((previousTopic) => {
      if (!nextSubject || nextTopics.length === 0) return "";
      const hasPreviousTopic = nextTopics.some(
        (item) =>
          item.title === previousTopic || item.progressKey === previousTopic,
      );
      return hasPreviousTopic
        ? previousTopic
        : nextTopics[0]?.progressKey || nextTopics[0]?.title || "";
    });
    const nextTopic = nextTopics[0]?.progressKey || nextTopics[0]?.title || "";
    const nextSubtopics = getSubtopicOptionsForTopic(nextSubject, nextTopic);
    setSubtopic(nextSubtopics[0]?.title || "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!attempt || !canSubmit) return;
    await onConfirm({
      id: attempt._id,
      subject,
      topic,
      subtopic: isSubtopicRequired ? subtopic : null,
      difficulty,
    });
  }

  if (!attempt) return null;

  return createPortal(
    <MotionModalBackdrop className="subject-popup-backdrop classification-popup-backdrop">
      <MotionModalPanel
        ref={panelRef}
        className="subject-popup-panel glass-panel classification-popup-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Classify new attempt"
        aria-live="polite"
        tabIndex={-1}
      >
        <header className="subject-popup-header classification-popup-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">New Attempt Detected</p>
            <h3 className="subject-popup-title">Classify this attempt</h3>
            <p className="subject-popup-subtitle">
              Select subject and topic to include this attempt in accurate analytics.
            </p>
          </div>
        </header>

        <section className="date-popup-card classification-popup-stats">
          <div className="date-popup-card-head">
            <h4 className="date-popup-card-title">Attempt Summary</h4>
          </div>
          <div className="date-popup-badge-row">
            <span className="date-popup-badge is-accuracy">Total: {attempt.total}</span>
            <span className="date-popup-badge is-correct">Correct: {attempt.correct}</span>
            <span className="date-popup-badge is-incorrect">Incorrect: {attempt.incorrect}</span>
            <span className="date-popup-badge is-skipped">Skipped: {attempt.skipped}</span>
          </div>
        </section>

        <form className="classification-popup-form" onSubmit={handleSubmit}>
          <section className="subject-popup-filters classification-popup-filters">
            <label className="field classification-popup-field" title="Select attempt subject">
              <span className="field-label">Subject</span>
              <select
                value={subject}
                onChange={handleSubjectChange}
                className="field-control"
                disabled={isSubmitting}
                required
              >
                <option value="">Select Subject</option>
                {SUBJECT_OPTIONS.map((subjectItem) => (
                  <option key={subjectItem.value} value={subjectItem.value}>
                    {subjectItem.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field classification-popup-field" title="Select attempt topic">
              <span className="field-label">Topic</span>
              <select
                value={topic}
                onChange={(event) => {
                  const nextTopic = event.target.value;
                  const nextSubtopics = getSubtopicOptionsForTopic(subject, nextTopic);
                  setTopic(nextTopic);
                  setSubtopic(nextSubtopics[0]?.title || "");
                }}
                className="field-control"
                disabled={!subject || topicOptions.length === 0 || isSubmitting}
                required
              >
                {topicOptions.length > 0 ? (
                  topicOptions.map((topicItem) => (
                    <option
                      key={topicItem.id}
                      value={topicItem.progressKey || topicItem.title}
                    >
                      {topicItem.title}
                    </option>
                  ))
                ) : (
                  <option value="">Select Subject First</option>
                )}
              </select>
            </label>

            <label
              className="field classification-popup-field"
              title="Select attempt sub topic"
            >
              <span className="field-label">Sub Topic</span>
              <select
                value={subtopic}
                onChange={(event) => setSubtopic(event.target.value)}
                className="field-control"
                disabled={!topic || subtopicOptions.length === 0 || isSubmitting}
                required={isSubtopicRequired}
              >
                {subtopicOptions.length > 0 ? (
                  subtopicOptions.map((item) => (
                    <option key={item.id} value={item.title}>
                      {item.title}
                    </option>
                  ))
                ) : (
                  <option value="">No Sub Topics Available</option>
                )}
              </select>
            </label>

            <label className="field classification-popup-field" title="Select attempt difficulty">
              <span className="field-label">Difficulty</span>
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
                className="field-control"
                disabled={isSubmitting}
                required
              >
                {DIFFICULTY_OPTIONS.map((difficultyOption) => (
                  <option key={difficultyOption} value={difficultyOption}>
                    {difficultyOption}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {errorMessage ? (
            <p className="classification-popup-error" role="alert" aria-live="assertive">
              {errorMessage}
            </p>
          ) : null}

          <div className="classification-popup-actions">
            <button
              type="submit"
              className="action-btn action-btn-primary ripple-btn"
              disabled={!canSubmit}
            >
              {isSubmitting ? "Saving..." : "Confirm Classification"}
            </button>
          </div>
        </form>
      </MotionModalPanel>
    </MotionModalBackdrop>,
    document.body,
  );
}
