import { memo, useMemo } from "react";
import type {
  DateAnalyticsResult,
  DifficultyBreakdownRow,
  SubjectBreakdownRow,
  TopicBreakdownRow,
} from "@/types/analytics";

const EMPTY_ANALYTICS: DateAnalyticsResult = {
  dateKey: "",
  totalSubmissions: 0,
  totalQuestionsAttempted: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  totalSkipped: 0,
  accuracy: 0,
  subjectBreakdown: [],
  topicBreakdown: [],
  difficultyBreakdown: [],
};

interface AccuracyRow {
  questions: number;
  accuracy: number;
}

function pickBestByAccuracy<T extends AccuracyRow>(rows: T[]): T | null {
  if (!rows.length) return null;
  const eligible = rows.filter((row) => row.questions > 0);
  if (!eligible.length) return null;
  return eligible.reduce<T | null>((best, row) => {
    if (!best) return row;
    if (row.accuracy > best.accuracy) return row;
    if (row.accuracy === best.accuracy && row.questions > best.questions) return row;
    return best;
  }, null);
}

function pickWeakestByAccuracy<T extends AccuracyRow>(rows: T[]): T | null {
  if (!rows.length) return null;
  const eligible = rows.filter((row) => row.questions > 0);
  if (!eligible.length) return null;
  return eligible.reduce<T | null>((weakest, row) => {
    if (!weakest) return row;
    if (row.accuracy < weakest.accuracy) return row;
    if (row.accuracy === weakest.accuracy && row.questions > weakest.questions) return row;
    return weakest;
  }, null);
}

function pickDominantDifficulty(rows: DifficultyBreakdownRow[]): DifficultyBreakdownRow | null {
  if (!rows.length) return null;
  return rows.reduce<DifficultyBreakdownRow | null>((best, row) => {
    if (!best) return row;
    if (row.questions > best.questions) return row;
    return best;
  }, null);
}

function getMomentumLine(accuracy: number): string {
  if (accuracy >= 80) return "Strong precision momentum";
  if (accuracy >= 60) return "Stable performance build";
  return "Revision reinforcement recommended";
}

interface DateAnalyticsInsightsProps {
  analytics: DateAnalyticsResult;
  totalForDate: number;
}

function DateAnalyticsInsights({ analytics, totalForDate }: DateAnalyticsInsightsProps) {
  const safeAnalytics = useMemo(() => analytics || EMPTY_ANALYTICS, [analytics]);
  const safeAccuracy = Number.isFinite(safeAnalytics.accuracy) ? safeAnalytics.accuracy : 0;

  const insights = useMemo(() => {
    const bestSubject = pickBestByAccuracy<SubjectBreakdownRow>(safeAnalytics.subjectBreakdown || []);
    const weakestTopic = pickWeakestByAccuracy<TopicBreakdownRow>(safeAnalytics.topicBreakdown || []);
    const dominantDifficulty = pickDominantDifficulty(safeAnalytics.difficultyBreakdown || []);
    const focusCoverage =
      totalForDate === 0
        ? 0
        : Math.round(((safeAnalytics.totalSubmissions || 0) / totalForDate) * 100);

    return {
      bestSubject,
      weakestTopic,
      dominantDifficulty,
      focusCoverage,
    };
  }, [safeAnalytics, totalForDate]);

  return (
    <section className="date-insight-grid" aria-label="Smart performance insights">
      <article className="date-insight-card">
        <p className="date-insight-label">Best Subject</p>
        <p className="date-insight-value">
          {insights.bestSubject ? insights.bestSubject.subject : "N/A"}
        </p>
        <p className="date-insight-note">
          {insights.bestSubject ? `${insights.bestSubject.accuracy}% accuracy` : "Need more attempts"}
        </p>
      </article>

      <article className="date-insight-card">
        <p className="date-insight-label">Attention Topic</p>
        <p className="date-insight-value">
          {insights.weakestTopic ? insights.weakestTopic.topic : "N/A"}
        </p>
        <p className="date-insight-note">
          {insights.weakestTopic ? `${insights.weakestTopic.accuracy}% accuracy` : "No weak signal yet"}
        </p>
      </article>

      <article className="date-insight-card">
        <p className="date-insight-label">Dominant Difficulty</p>
        <p className="date-insight-value">
          {insights.dominantDifficulty ? insights.dominantDifficulty.difficulty : "N/A"}
        </p>
        <p className="date-insight-note">
          {insights.dominantDifficulty
            ? `${insights.dominantDifficulty.questions} questions`
            : "Difficulty spread unavailable"}
        </p>
      </article>

      <article className="date-insight-card">
        <p className="date-insight-label">Momentum Signal</p>
        <p className="date-insight-value">{safeAccuracy}%</p>
        <p className="date-insight-note">
          {getMomentumLine(safeAccuracy)} | Focus span {insights.focusCoverage}%
        </p>
      </article>
    </section>
  );
}

export default memo(DateAnalyticsInsights);
