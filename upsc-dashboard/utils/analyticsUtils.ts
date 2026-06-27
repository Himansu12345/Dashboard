import type { DashboardAnalytics, TopicAnalytics } from "@/types/analytics";
import type { PracticeRecord } from "@/types/records";

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function toNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function buildDashboardAnalytics(records: PracticeRecord[]): DashboardAnalytics {
  const safeRecords = Array.isArray(records) ? records : [];
  
  // Single pass through records to compute all aggregations at once
  const subjectStatsMap: Record<
    string,
    { subject: string; correct: number; incorrect: number; total: number }
  > = {};
  
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalQuestions = 0;
  
  for (let i = 0; i < safeRecords.length; i++) {
    const record = safeRecords[i];
    const subjectName = record?.subject || "Unknown";
    
    // Aggregate subject stats
    if (!subjectStatsMap[subjectName]) {
      subjectStatsMap[subjectName] = {
        subject: subjectName,
        correct: 0,
        incorrect: 0,
        total: 0,
      };
    }
    
    const correct = toNumber(record?.correct);
    const incorrect = toNumber(record?.incorrect);
    const total = toNumber(record?.total);
    
    subjectStatsMap[subjectName].correct += correct;
    subjectStatsMap[subjectName].incorrect += incorrect;
    subjectStatsMap[subjectName].total += total;
    
    totalCorrect += correct;
    totalIncorrect += incorrect;
    totalQuestions += total;
  }

  // Build line chart data (reversed for display)
  const lineChartData = [...safeRecords].reverse().map((record, index) => ({
    name: `${index + 1}`,
    accuracy: toNumber(record.accuracy),
  }));

  // Build subject chart data
  const subjectChartData = Object.values(subjectStatsMap).map((subjectStats) => ({
    subject: subjectStats.subject,
    accuracy: subjectStats.total === 0 ? 0 : round2((subjectStats.correct / subjectStats.total) * 100),
    correct: subjectStats.correct,
    incorrect: subjectStats.incorrect,
    total: subjectStats.total,
  }));

  const totalAttempts = safeRecords.length;
  const overallAccuracy = totalQuestions === 0 ? 0 : round2((totalCorrect / totalQuestions) * 100);

  const totals = {
    totalCorrect,
    totalIncorrect,
    totalAttempts,
    totalQuestions,
    overallAccuracy,
  };

  const pieData = [
    { name: "Correct", value: totalCorrect },
    { name: "Incorrect", value: totalIncorrect },
  ];

  return { lineChartData, subjectChartData, pieData, totals };
}

export function buildTopicAnalytics(records: PracticeRecord[]): TopicAnalytics {
  const safeRecords = Array.isArray(records) ? records : [];
  
  // Single pass through records to compute all topic aggregations
  const topicStatsMap: Record<string, { topic: string; correct: number; incorrect: number; total: number }> = {};
  let totalCorrect = 0;
  let totalIncorrect = 0;
  
  for (let i = 0; i < safeRecords.length; i++) {
    const record = safeRecords[i];
    const topicName = record?.topic || "Unknown";
    
    if (!topicStatsMap[topicName]) {
      topicStatsMap[topicName] = {
        topic: topicName,
        correct: 0,
        incorrect: 0,
        total: 0,
      };
    }
    
    const correct = toNumber(record?.correct);
    const incorrect = toNumber(record?.incorrect);
    const total = toNumber(record?.total);
    
    topicStatsMap[topicName].correct += correct;
    topicStatsMap[topicName].incorrect += incorrect;
    topicStatsMap[topicName].total += total;
    
    totalCorrect += correct;
    totalIncorrect += incorrect;
  }

  const topicRows = Object.values(topicStatsMap);
  const topicAccuracyData = topicRows.map((topicStats) => ({
    topic: topicStats.topic,
    accuracy: topicStats.total === 0 ? 0 : round2((topicStats.correct / topicStats.total) * 100),
    correct: topicStats.correct,
    incorrect: topicStats.incorrect,
    total: topicStats.total,
  }));

  const topicLineData = topicAccuracyData.map((row, index) => ({
    name: `${index + 1}`,
    topic: row.topic,
    accuracy: row.accuracy,
  }));

  const topicShareData = [
    { name: "Correct", value: totalCorrect },
    { name: "Incorrect", value: totalIncorrect },
  ].filter((row) => row.value > 0);

  return {
    topicAccuracyData,
    topicLineData,
    topicShareData,
  };
}
