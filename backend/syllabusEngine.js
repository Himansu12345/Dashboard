const { syllabusMap } = require("./syllabusMap");

function round2(value) {
  return Number(Number(value || 0).toFixed(2));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function startOfDay(value) {
  const parsed = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function formatDateKey(value) {
  const parsed = startOfDay(value);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function differenceInDays(laterValue, earlierValue) {
  const later = startOfDay(laterValue);
  const earlier = startOfDay(earlierValue);
  return Math.max(0, Math.round((later.getTime() - earlier.getTime()) / 86_400_000));
}

function normalizeString(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function buildTopicKey(subject, topic) {
  return `${normalizeString(subject)}::${normalizeString(topic)}`;
}

function getRetentionStatus(score) {
  if (score < 35) return "Needs Revision";
  if (score < 55) return "Shaky";
  if (score < 78) return "Stabilizing";
  return "Strong";
}

function getMasteryState(score, attempted) {
  if (!attempted) return "untouched";
  if (score < 45) return "weak";
  if (score < 75) return "improving";
  return "mastered";
}

function createSyllabusModels(mongoose) {
  const SyllabusNodeProgressSchema = new mongoose.Schema(
    {
      nodeKey: { type: String, required: true, unique: true, trim: true },
      subject: { type: String, required: true, trim: true },
      topic: { type: String, default: null, trim: true },
      level: { type: String, enum: ["root", "subject", "topic"], required: true },
      masteryScore: { type: Number, default: 0, min: 0, max: 100 },
      masteryState: { type: String, default: "untouched", trim: true },
      accuracy: { type: Number, default: 0, min: 0, max: 100 },
      retentionStrength: { type: Number, default: 0, min: 0, max: 100 },
      revisionHealth: { type: Number, default: 0, min: 0, max: 100 },
      consistencyImpact: { type: Number, default: 0, min: 0, max: 100 },
      repeatedMistakes: { type: Number, default: 0, min: 0 },
      revisionFrequency: { type: Number, default: 0, min: 0 },
      progressDelta: { type: Number, default: 0 },
      retentionStatus: { type: String, default: "Needs Revision", trim: true },
      recentlyMasteredAt: { type: Date, default: null },
      lastSyncedAt: { type: Date, default: Date.now },
    },
    { minimize: false },
  );

  const SyllabusProgressSnapshotSchema = new mongoose.Schema(
    {
      snapshotKey: { type: String, required: true, unique: true, trim: true },
      nodeKey: { type: String, required: true, trim: true },
      snapshotDate: { type: Date, required: true },
      masteryScore: { type: Number, default: 0, min: 0, max: 100 },
      retentionStrength: { type: Number, default: 0, min: 0, max: 100 },
      revisionHealth: { type: Number, default: 0, min: 0, max: 100 },
      consistencyImpact: { type: Number, default: 0, min: 0, max: 100 },
      lastSyncedAt: { type: Date, default: Date.now },
    },
    { minimize: false },
  );

  SyllabusNodeProgressSchema.index({ level: 1, subject: 1, topic: 1 });
  SyllabusProgressSnapshotSchema.index({ nodeKey: 1, snapshotDate: -1 });

  return {
    SyllabusNodeProgress:
      mongoose.models.SyllabusNodeProgress ||
      mongoose.model("SyllabusNodeProgress", SyllabusNodeProgressSchema),
    SyllabusProgressSnapshot:
      mongoose.models.SyllabusProgressSnapshot ||
      mongoose.model("SyllabusProgressSnapshot", SyllabusProgressSnapshotSchema),
  };
}

async function aggregateAttemptMetrics(Attempt) {
  const rows = await Attempt.aggregate([
    { $match: { deletedAt: null } },
    {
      $project: {
        subject: "$subject",
        topic: "$topic",
        subtopic: { $ifNull: ["$subtopic", ""] },
        accuracy: { $ifNull: ["$accuracy", 0] },
        incorrect: { $ifNull: ["$incorrect", 0] },
        skipped: { $ifNull: ["$skipped", 0] },
        attemptDate: {
          $ifNull: [
            {
              $dateFromString: {
                dateString: "$dateValue",
                format: "%Y-%m-%d",
                onError: null,
                onNull: null,
              },
            },
            { $ifNull: ["$createdAt", new Date()] },
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          subject: "$subject",
          topic: "$topic",
          subtopic: "$subtopic",
        },
        attemptCount: { $sum: 1 },
        accuracyTotal: { $sum: "$accuracy" },
        incorrectSum: { $sum: "$incorrect" },
        skippedSum: { $sum: "$skipped" },
        lastAttemptAt: { $max: "$attemptDate" },
        activeDates: {
          $addToSet: {
            $dateToString: { format: "%Y-%m-%d", date: "$attemptDate" },
          },
        },
      },
    },
    {
      $group: {
        _id: {
          subject: "$_id.subject",
          topic: "$_id.topic",
        },
        attemptCount: { $sum: "$attemptCount" },
        accuracyTotal: { $sum: "$accuracyTotal" },
        incorrectSum: { $sum: "$incorrectSum" },
        skippedSum: { $sum: "$skippedSum" },
        lastAttemptAt: { $max: "$lastAttemptAt" },
        activeDatesNested: { $push: "$activeDates" },
        subtopicBreakdown: {
          $push: {
            label: "$_id.subtopic",
            attemptCount: "$attemptCount",
            accuracyTotal: "$accuracyTotal",
            incorrectSum: "$incorrectSum",
            skippedSum: "$skippedSum",
            lastAttemptAt: "$lastAttemptAt",
          },
        },
      },
    },
  ]);

  const map = new Map();
  rows.forEach((row) => {
    const activeDates = Array.from(
      new Set(
        (Array.isArray(row.activeDatesNested) ? row.activeDatesNested : []).flat().filter(Boolean),
      ),
    ).sort();
    const attemptCount = Number(row.attemptCount) || 0;
    const subtopicBreakdown = (Array.isArray(row.subtopicBreakdown) ? row.subtopicBreakdown : [])
      .map((entry) => {
        const label = normalizeString(entry && entry.label);
        const entryAttemptCount = Number(entry && entry.attemptCount) || 0;
        const accuracyTotal = Number(entry && entry.accuracyTotal) || 0;
        const incorrectSum = Number(entry && entry.incorrectSum) || 0;
        const skippedSum = Number(entry && entry.skippedSum) || 0;
        if (!label || entryAttemptCount <= 0) return null;

        return {
          label,
          attemptCount: entryAttemptCount,
          accuracyAverage: round2(accuracyTotal / entryAttemptCount),
          incorrectSum,
          skippedSum,
          lastAttemptAt: entry && entry.lastAttemptAt ? entry.lastAttemptAt : null,
        };
      })
      .filter(Boolean);

    map.set(buildTopicKey(row._id.subject, row._id.topic), {
      attemptCount,
      accuracyAverage: attemptCount > 0 ? round2((Number(row.accuracyTotal) || 0) / attemptCount) : 0,
      incorrectSum: Number(row.incorrectSum) || 0,
      skippedSum: Number(row.skippedSum) || 0,
      lastAttemptAt: row.lastAttemptAt || null,
      activeDates,
      subtopicBreakdown,
    });
  });
  return map;
}

function getWeakSubtopicsFromAttemptMetric(attemptMetric, limit = 5) {
  const breakdown = Array.isArray(attemptMetric && attemptMetric.subtopicBreakdown)
    ? attemptMetric.subtopicBreakdown
    : [];

  return breakdown
    .filter((entry) => {
      const accuracy = Number(entry && entry.accuracyAverage) || 0;
      const mistakes = (Number(entry && entry.incorrectSum) || 0) + (Number(entry && entry.skippedSum) || 0);
      return accuracy < 80 || mistakes > 0;
    })
    .sort((first, second) => {
      const firstAccuracy = Number(first && first.accuracyAverage) || 0;
      const secondAccuracy = Number(second && second.accuracyAverage) || 0;
      if (firstAccuracy !== secondAccuracy) return firstAccuracy - secondAccuracy;

      const firstMistakes = (Number(first && first.incorrectSum) || 0) + (Number(first && first.skippedSum) || 0);
      const secondMistakes = (Number(second && second.incorrectSum) || 0) + (Number(second && second.skippedSum) || 0);
      if (firstMistakes !== secondMistakes) return secondMistakes - firstMistakes;

      const firstAttempts = Number(first && first.attemptCount) || 0;
      const secondAttempts = Number(second && second.attemptCount) || 0;
      if (firstAttempts !== secondAttempts) return secondAttempts - firstAttempts;

      return String(first && first.label).localeCompare(String(second && second.label));
    })
    .slice(0, limit)
    .map((entry) => entry.label);
}

async function aggregateRevisionMetrics(RevisionTopic) {
  const rows = await RevisionTopic.find({ status: "active" }).lean();
  const map = new Map();
  rows.forEach((row) => {
    map.set(buildTopicKey(row.subject, row.topic), row);
  });
  return map;
}

function buildSyntheticHistory(masteryScore, progressDelta) {
  const base = clamp(masteryScore - progressDelta * 2, 0, 100);
  const steps = [0, 0.35, 0.6, 0.78, 0.9, 1];
  return steps.map((step, index) => ({
    label: `W${index + 1}`,
    value: round2(clamp(base + (masteryScore - base) * step, 0, 100)),
  }));
}

function calculateTopicMetrics(topicKey, attemptMetric, revisionMetric, previousProgress) {
  const attemptCount = Number(attemptMetric && attemptMetric.attemptCount) || 0;
  const accuracy = round2(Number(attemptMetric && attemptMetric.accuracyAverage) || 0);
  const incorrectPressure =
    Number(attemptMetric && attemptMetric.incorrectSum) +
    Number(attemptMetric && attemptMetric.skippedSum);
  const retentionStrength = round2(Number(revisionMetric && revisionMetric.retentionScore) || 0);
  const repeatedMistakes = Number(revisionMetric && revisionMetric.repeatedMistakeCount) || 0;
  const revisionFrequency =
    (Array.isArray(revisionMetric && revisionMetric.reviewHistory)
      ? revisionMetric.reviewHistory.length
      : 0) + attemptCount;
  const lastReviewedAt =
    revisionMetric && revisionMetric.lastReviewedAt ? revisionMetric.lastReviewedAt : null;
  const lastAttemptAt = attemptMetric && attemptMetric.lastAttemptAt ? attemptMetric.lastAttemptAt : null;
  const activeDates = Array.isArray(attemptMetric && attemptMetric.activeDates)
    ? attemptMetric.activeDates
    : [];
  const recentSpanDays = activeDates.length > 0
    ? Math.max(1, differenceInDays(new Date(), activeDates[0]) + 1)
    : 60;
  const activeDensity = clamp((activeDates.length / Math.min(recentSpanDays, 60)) * 100, 0, 100);
  const recencyPenalty = lastReviewedAt || lastAttemptAt
    ? clamp(differenceInDays(new Date(), lastReviewedAt || lastAttemptAt) * 1.8, 0, 34)
    : 24;
  const revisionHealth = round2(
    clamp(retentionStrength * 0.58 + revisionFrequency * 5.4 - recencyPenalty, 0, 100),
  );
  const consistencyImpact = round2(
    clamp(activeDensity * 0.62 + revisionFrequency * 2.4 - repeatedMistakes * 2.6, 0, 100),
  );
  const masteryScore = round2(
    clamp(
      accuracy * 0.36 +
        retentionStrength * 0.26 +
        revisionHealth * 0.2 +
        consistencyImpact * 0.18 -
        incorrectPressure * 0.18 -
        repeatedMistakes * 2.8,
      0,
      100,
    ),
  );
  const attempted = attemptCount > 0 || revisionFrequency > 0;
  const masteryState = getMasteryState(masteryScore, attempted);
  const previousMastery = Number(previousProgress && previousProgress.masteryScore) || 0;
  const progressDelta = round2(masteryScore - previousMastery);
  const recentlyMasteredAt =
    masteryState === "mastered"
      ? previousProgress && previousProgress.masteryState === "mastered"
        ? previousProgress.recentlyMasteredAt || null
        : new Date()
      : null;

  return {
    topicKey,
    attempted,
    masteryScore,
    masteryState,
    accuracy,
    retentionStrength,
    revisionHealth,
    consistencyImpact,
    repeatedMistakes,
    revisionFrequency,
    progressDelta,
    retentionStatus: getRetentionStatus(retentionStrength),
    weakSubtopics: [],
    recentlyMasteredAt,
    revisionHistory:
      previousProgress && Array.isArray(previousProgress.revisionHistory)
        ? previousProgress.revisionHistory
        : buildSyntheticHistory(masteryScore, progressDelta),
  };
}

function aggregateLevelMetrics(entries) {
  const attemptedEntries = entries.filter((entry) => entry.attempted);
  const divisor = Math.max(1, entries.length);
  const attempted = attemptedEntries.length > 0;
  const masteryScore = round2(entries.reduce((sum, entry) => sum + entry.masteryScore, 0) / divisor);
  const accuracy = round2(entries.reduce((sum, entry) => sum + entry.accuracy, 0) / divisor);
  const retentionStrength = round2(
    entries.reduce((sum, entry) => sum + entry.retentionStrength, 0) / divisor,
  );
  const revisionHealth = round2(
    entries.reduce((sum, entry) => sum + entry.revisionHealth, 0) / divisor,
  );
  const consistencyImpact = round2(
    entries.reduce((sum, entry) => sum + entry.consistencyImpact, 0) / divisor,
  );
  const repeatedMistakes = entries.reduce((sum, entry) => sum + entry.repeatedMistakes, 0);
  const revisionFrequency = entries.reduce((sum, entry) => sum + entry.revisionFrequency, 0);
  const progressDelta = round2(
    entries.reduce((sum, entry) => sum + entry.progressDelta, 0) / divisor,
  );

  return {
    attempted,
    masteryScore,
    masteryState: getMasteryState(masteryScore, attempted),
    accuracy,
    retentionStrength,
    revisionHealth,
    consistencyImpact,
    repeatedMistakes,
    revisionFrequency,
    progressDelta,
    retentionStatus: getRetentionStatus(retentionStrength),
  };
}

async function getPreviousProgressMap(SyllabusNodeProgress) {
  const rows = await SyllabusNodeProgress.find({}).lean();
  const map = new Map();
  rows.forEach((row) => {
    map.set(row.nodeKey, row);
  });
  return map;
}

async function getSnapshotHistoryMap(SyllabusProgressSnapshot) {
  const rows = await SyllabusProgressSnapshot.find({})
    .sort({ snapshotDate: -1 })
    .lean();
  const map = new Map();

  rows.forEach((row) => {
    const list = map.get(row.nodeKey) || [];
    if (list.length < 6) {
      list.push({
        label: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
          new Date(row.snapshotDate),
        ),
        value: round2(row.masteryScore),
      });
      map.set(row.nodeKey, list);
    }
  });

  map.forEach((list, key) => {
    map.set(key, list.reverse());
  });

  return map;
}

function buildInsights(summary, subjectNodes, topicNodes) {
  const strongestSubjectNode = [...subjectNodes].sort(
    (first, second) => second.metrics.masteryScore - first.metrics.masteryScore,
  )[0];
  const fastestImprovingNode = [...topicNodes].sort(
    (first, second) => second.metrics.progressDelta - first.metrics.progressDelta,
  )[0];
  const recentMastered = topicNodes.filter((node) => node.recentlyMasteredAt);
  const weakNodes = topicNodes.filter((node) => node.masteryState === "weak");

  return [
    {
      id: "strongest-subject",
      title: "Strongest Subject Highlight",
      description: strongestSubjectNode
        ? `${strongestSubjectNode.label} is currently your strongest branch at ${strongestSubjectNode.metrics.masteryScore}% mastery.`
        : "No subject branch is strong yet.",
      tone: "mint",
    },
    {
      id: "fastest-improving",
      title: "Fastest Improving Topic",
      description: fastestImprovingNode
        ? `${fastestImprovingNode.label} is accelerating fastest with a ${fastestImprovingNode.metrics.progressDelta}% improvement swing.`
        : "No topic improvement signal yet.",
      tone: "teal",
    },
    {
      id: "recent-mastery",
      title: `${summary.recentlyMasteredCount} Topics Mastered This Month`,
      description:
        recentMastered.length > 0
          ? "Your tree is visibly lighting up as more topics move into the mastered state."
          : "No topics crossed into mastered status this month yet.",
      tone: "amber",
    },
    {
      id: "weak-area-glow",
      title: "Weak-Area Glow Indicators",
      description:
        weakNodes.length > 0
          ? `${weakNodes.length} topic nodes still need targeted reinforcement and revision pressure.`
          : "No weak areas are glowing critically right now.",
      tone: "rose",
    },
  ];
}

async function persistSyllabusProgress(models, nodes) {
  const now = new Date();
  const snapshotDateKey = formatDateKey(now);

  if (nodes.length === 0) return;

  await models.SyllabusNodeProgress.bulkWrite(
    nodes.map((node) => ({
      updateOne: {
        filter: { nodeKey: node.id },
        update: {
          $set: {
            nodeKey: node.id,
            subject: node.subject,
            topic: node.topic,
            level: node.level,
            masteryScore: node.metrics.masteryScore,
            masteryState: node.masteryState,
            accuracy: node.metrics.accuracy,
            retentionStrength: node.metrics.retentionStrength,
            revisionHealth: node.metrics.revisionHealth,
            consistencyImpact: node.metrics.consistencyImpact,
            repeatedMistakes: node.metrics.repeatedMistakes,
            revisionFrequency: node.metrics.revisionFrequency,
            progressDelta: node.metrics.progressDelta,
            retentionStatus: node.retentionStatus,
            recentlyMasteredAt: node.recentlyMasteredAt ? new Date(node.recentlyMasteredAt) : null,
            lastSyncedAt: now,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );

  await models.SyllabusProgressSnapshot.bulkWrite(
    nodes.map((node) => ({
      updateOne: {
        filter: { snapshotKey: `${node.id}:${snapshotDateKey}` },
        update: {
          $set: {
            snapshotKey: `${node.id}:${snapshotDateKey}`,
            nodeKey: node.id,
            snapshotDate: startOfDay(now),
            masteryScore: node.metrics.masteryScore,
            retentionStrength: node.metrics.retentionStrength,
            revisionHealth: node.metrics.revisionHealth,
            consistencyImpact: node.metrics.consistencyImpact,
            lastSyncedAt: now,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
}

async function buildSyllabusDashboard(models) {
  const previousProgressMap = await getPreviousProgressMap(models.SyllabusNodeProgress);
  const snapshotHistoryMap = await getSnapshotHistoryMap(models.SyllabusProgressSnapshot);
  const attemptMetrics = await aggregateAttemptMetrics(models.Attempt);
  const revisionMetrics = await aggregateRevisionMetrics(models.RevisionTopic);

  const nodes = [];
  const topicNodes = [];
  const subjectNodes = [];

  Object.entries(syllabusMap).forEach(([subject, topics]) => {
    const subjectTopicNodes = topics.map((topic) => {
      const topicId = `topic:${subject}:${topic}`;
      const attemptMetric = attemptMetrics.get(buildTopicKey(subject, topic));
      const metrics = calculateTopicMetrics(
        buildTopicKey(subject, topic),
        attemptMetric,
        revisionMetrics.get(buildTopicKey(subject, topic)),
        previousProgressMap.get(topicId),
      );

      const node = {
        id: topicId,
        parentId: `subject:${subject}`,
        label: topic,
        subject,
        topic,
        level: "topic",
        masteryState: metrics.masteryState,
        retentionStatus: metrics.retentionStatus,
        attempted: metrics.attempted,
        metrics: {
          masteryScore: metrics.masteryScore,
          accuracy: metrics.accuracy,
          retentionStrength: metrics.retentionStrength,
          revisionHealth: metrics.revisionHealth,
          consistencyImpact: metrics.consistencyImpact,
          repeatedMistakes: metrics.repeatedMistakes,
          revisionFrequency: metrics.revisionFrequency,
          progressDelta: metrics.progressDelta,
        },
        weakSubtopics: getWeakSubtopicsFromAttemptMetric(attemptMetric),
        revisionHistory: snapshotHistoryMap.get(topicId) || metrics.revisionHistory,
        recentlyMasteredAt: metrics.recentlyMasteredAt
          ? new Date(metrics.recentlyMasteredAt).toISOString()
          : null,
      };

      topicNodes.push(node);
      nodes.push(node);
      return node;
    });

    const subjectMetrics = aggregateLevelMetrics(subjectTopicNodes.map((node) => ({
      attempted: node.attempted,
      masteryScore: node.metrics.masteryScore,
      accuracy: node.metrics.accuracy,
      retentionStrength: node.metrics.retentionStrength,
      revisionHealth: node.metrics.revisionHealth,
      consistencyImpact: node.metrics.consistencyImpact,
      repeatedMistakes: node.metrics.repeatedMistakes,
      revisionFrequency: node.metrics.revisionFrequency,
      progressDelta: node.metrics.progressDelta,
    })));

    const subjectId = `subject:${subject}`;
    const subjectNode = {
      id: subjectId,
      parentId: "root:upsc",
      label: subject,
      subject,
      topic: null,
      level: "subject",
      masteryState: subjectMetrics.masteryState,
      retentionStatus: subjectMetrics.retentionStatus,
      attempted: subjectMetrics.attempted,
      metrics: {
        masteryScore: subjectMetrics.masteryScore,
        accuracy: subjectMetrics.accuracy,
        retentionStrength: subjectMetrics.retentionStrength,
        revisionHealth: subjectMetrics.revisionHealth,
        consistencyImpact: subjectMetrics.consistencyImpact,
        repeatedMistakes: subjectMetrics.repeatedMistakes,
        revisionFrequency: subjectMetrics.revisionFrequency,
        progressDelta: subjectMetrics.progressDelta,
      },
      weakSubtopics: subjectTopicNodes
        .flatMap((node) =>
          node.weakSubtopics.length > 0
            ? node.weakSubtopics.map((subtopic) => `${node.label}: ${subtopic}`)
            : node.masteryState === "weak"
              ? [node.label]
              : [],
        )
        .slice(0, 5),
      revisionHistory:
        snapshotHistoryMap.get(subjectId) || buildSyntheticHistory(subjectMetrics.masteryScore, subjectMetrics.progressDelta),
      recentlyMasteredAt: null,
    };

    subjectNodes.push(subjectNode);
    nodes.push(subjectNode);
  });

  const rootMetrics = aggregateLevelMetrics(subjectNodes.map((node) => ({
    attempted: node.attempted,
    masteryScore: node.metrics.masteryScore,
    accuracy: node.metrics.accuracy,
    retentionStrength: node.metrics.retentionStrength,
    revisionHealth: node.metrics.revisionHealth,
    consistencyImpact: node.metrics.consistencyImpact,
    repeatedMistakes: node.metrics.repeatedMistakes,
    revisionFrequency: node.metrics.revisionFrequency,
    progressDelta: node.metrics.progressDelta,
  })));

  const rootNode = {
    id: "root:upsc",
    parentId: null,
    label: "UPSC Mastery Map",
    subject: "UPSC",
    topic: null,
    level: "root",
    masteryState: rootMetrics.masteryState,
    retentionStatus: rootMetrics.retentionStatus,
    attempted: rootMetrics.attempted,
    metrics: {
      masteryScore: rootMetrics.masteryScore,
      accuracy: rootMetrics.accuracy,
      retentionStrength: rootMetrics.retentionStrength,
      revisionHealth: rootMetrics.revisionHealth,
      consistencyImpact: rootMetrics.consistencyImpact,
      repeatedMistakes: rootMetrics.repeatedMistakes,
      revisionFrequency: rootMetrics.revisionFrequency,
      progressDelta: rootMetrics.progressDelta,
    },
    weakSubtopics: topicNodes
      .flatMap((node) =>
        node.weakSubtopics.length > 0
          ? node.weakSubtopics.map((subtopic) => `${node.subject} - ${node.label}: ${subtopic}`)
          : node.masteryState === "weak"
            ? [`${node.subject} - ${node.label}`]
            : [],
      )
      .slice(0, 6),
    revisionHistory:
      snapshotHistoryMap.get("root:upsc") || buildSyntheticHistory(rootMetrics.masteryScore, rootMetrics.progressDelta),
    recentlyMasteredAt: null,
  };

  nodes.unshift(rootNode);

  const masteredTopics = topicNodes.filter((node) => node.masteryState === "mastered").length;
  const improvingTopics = topicNodes.filter((node) => node.masteryState === "improving").length;
  const weakTopics = topicNodes.filter((node) => node.masteryState === "weak").length;
  const untouchedTopics = topicNodes.filter((node) => node.masteryState === "untouched").length;
  const strongestSubjectNode = [...subjectNodes].sort(
    (first, second) => second.metrics.masteryScore - first.metrics.masteryScore,
  )[0];
  const fastestImprovingNode = [...topicNodes].sort(
    (first, second) => second.metrics.progressDelta - first.metrics.progressDelta,
  )[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentlyMasteredCount = topicNodes.filter(
    (node) => node.recentlyMasteredAt && new Date(node.recentlyMasteredAt) >= thirtyDaysAgo,
  ).length;

  const summary = {
    totalTopics: topicNodes.length,
    masteredTopics,
    improvingTopics,
    weakTopics,
    untouchedTopics,
    strongestSubject: strongestSubjectNode ? strongestSubjectNode.label : "No subject yet",
    fastestImprovingTopic: fastestImprovingNode ? fastestImprovingNode.label : "No topic yet",
    recentlyMasteredCount,
    overallMasteryScore: rootNode.metrics.masteryScore,
  };

  const insights = buildInsights(summary, subjectNodes, topicNodes);

  await persistSyllabusProgress(models, nodes);

  return {
    generatedAt: new Date().toISOString(),
    summary,
    nodes,
    insights,
  };
}

module.exports = {
  buildSyllabusDashboard,
  createSyllabusModels,
};
