const TRACKING_MONTHS = 12;
const DAY_MS = 86_400_000;

function round2(value) {
  return Number(Number(value || 0).toFixed(2));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toDate(value) {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(value) {
  const parsed = toDate(value) || new Date();
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

function formatMonthKey(value) {
  const parsed = startOfDay(value);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function differenceInDays(laterValue, earlierValue) {
  const later = startOfDay(laterValue);
  const earlier = startOfDay(earlierValue);
  return Math.max(
    0,
    Math.round((later.getTime() - earlier.getTime()) / DAY_MS),
  );
}

function addDays(value, days) {
  const next = startOfDay(value);
  next.setDate(next.getDate() + days);
  return next;
}

function buildTopicLabel(subject, topic) {
  const safeSubject = String(subject || "").trim() || "Unknown";
  const safeTopic = String(topic || "").trim() || "Unknown";
  return `${safeSubject} - ${safeTopic}`;
}

function createConsistencyModels(mongoose) {
  const ConsistencyDaySchema = new mongoose.Schema(
    {
      dateKey: { type: String, required: true, unique: true, trim: true },
      date: { type: Date, required: true },
      monthKey: { type: String, required: true, trim: true },
      isActive: { type: Boolean, default: false },
      activityLevel: { type: Number, default: 0, min: 0, max: 4 },
      intensityScore: { type: Number, default: 0, min: 0 },
      attemptCount: { type: Number, default: 0, min: 0 },
      revisionCount: { type: Number, default: 0, min: 0 },
      revisedTopicsCount: { type: Number, default: 0, min: 0 },
      studyDurationMinutes: { type: Number, default: 0, min: 0 },
      qualityScore: { type: Number, default: 0, min: 0, max: 100 },
      consistencyImpact: { type: Number, default: 0, min: 0, max: 100 },
      retentionImpact: { type: Number, default: 0, min: 0, max: 100 },
      accuracyAverage: { type: Number, default: 0, min: 0, max: 100 },
      reviewSuccessRate: { type: Number, default: 0, min: 0, max: 100 },
      streakContinued: { type: Boolean, default: false },
      topics: { type: [String], default: [] },
      lastSyncedAt: { type: Date, default: Date.now },
    },
    { minimize: false },
  );

  ConsistencyDaySchema.index({ monthKey: 1, date: 1 });
  ConsistencyDaySchema.index({ isActive: 1, date: -1 });

  const ConsistencySnapshotSchema = new mongoose.Schema(
    {
      snapshotDateKey: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      snapshotDate: { type: Date, required: true },
      consistencyScore: { type: Number, default: 0, min: 0, max: 100 },
      consistencyState: { type: String, default: "Improving", trim: true },
      momentumState: { type: String, default: "Momentum Stable", trim: true },
      momentumDelta: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0, min: 0 },
      bestStreak: { type: Number, default: 0, min: 0 },
      comebackStreak: { type: Number, default: 0, min: 0 },
      activeThisMonth: { type: Number, default: 0, min: 0 },
      activeDays: { type: Number, default: 0, min: 0 },
      missedDays: { type: Number, default: 0, min: 0 },
      strongestWeekLabel: { type: String, default: "", trim: true },
      strongestWeekIntensity: { type: Number, default: 0, min: 0 },
      generatedAt: { type: Date, default: Date.now },
    },
    { minimize: false },
  );

  const StreakHistorySchema = new mongoose.Schema(
    {
      streakKey: { type: String, required: true, unique: true, trim: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      length: { type: Number, default: 0, min: 0 },
      status: {
        type: String,
        enum: ["active", "completed"],
        default: "completed",
      },
      type: {
        type: String,
        enum: ["standard", "comeback"],
        default: "standard",
      },
      gapBeforeDays: { type: Number, default: 0, min: 0 },
      lastSyncedAt: { type: Date, default: Date.now },
    },
    { minimize: false },
  );

  StreakHistorySchema.index({ endDate: -1, length: -1 });

  return {
    ConsistencyDay:
      mongoose.models.ConsistencyDay ||
      mongoose.model("ConsistencyDay", ConsistencyDaySchema),
    ConsistencySnapshot:
      mongoose.models.ConsistencySnapshot ||
      mongoose.model("ConsistencySnapshot", ConsistencySnapshotSchema),
    StreakHistory:
      mongoose.models.StreakHistory ||
      mongoose.model("StreakHistory", StreakHistorySchema),
  };
}

function calculateActivityLevel(intensityScore) {
  if (intensityScore <= 0) return 0;
  if (intensityScore < 55) return 1;
  if (intensityScore < 110) return 2;
  if (intensityScore < 180) return 3;
  return 4;
}

function averageGapBetweenActiveDays(days) {
  const activeIndexes = days
    .map((day, index) => (day.isActive ? index : -1))
    .filter((index) => index >= 0);

  if (activeIndexes.length <= 1) return days.length;

  let totalGap = 0;
  let gapCount = 0;
  for (let index = 1; index < activeIndexes.length; index += 1) {
    totalGap += activeIndexes[index] - activeIndexes[index - 1];
    gapCount += 1;
  }

  return gapCount > 0 ? totalGap / gapCount : days.length;
}

function longestMissedGap(days) {
  let longest = 0;
  let current = 0;
  days.forEach((day) => {
    if (day.isActive) {
      longest = Math.max(longest, current);
      current = 0;
      return;
    }
    current += 1;
  });
  return Math.max(longest, current);
}

function getConsistencyState(score) {
  if (score < 45) return "Weak";
  if (score < 65) return "Improving";
  if (score < 82) return "Disciplined";
  return "Elite Consistency";
}

function getMomentumState(delta) {
  if (delta > 6) return "Momentum Rising";
  if (delta < -6) return "Momentum Falling";
  return "Momentum Stable";
}

function buildStreakSegments(days) {
  const segments = [];
  let activeStartIndex = null;

  for (let index = 0; index < days.length; index += 1) {
    const day = days[index];
    if (day.isActive && activeStartIndex === null) {
      activeStartIndex = index;
      continue;
    }

    if (!day.isActive && activeStartIndex !== null) {
      const start = days[activeStartIndex];
      const end = days[index - 1];
      const gapBeforeDays =
        activeStartIndex === 0
          ? 0
          : days
                .slice(0, activeStartIndex)
                .reverse()
                .findIndex((previousDay) => previousDay.isActive) === -1
            ? activeStartIndex
            : days
                .slice(0, activeStartIndex)
                .reverse()
                .findIndex((previousDay) => previousDay.isActive);

      segments.push({
        streakKey: `${start.date}:${end.date}`,
        startDate: start.date,
        endDate: end.date,
        length: differenceInDays(end.date, start.date) + 1,
        status: "completed",
        type: gapBeforeDays >= 2 ? "comeback" : "standard",
        gapBeforeDays: gapBeforeDays >= 0 ? gapBeforeDays : 0,
      });
      activeStartIndex = null;
    }
  }

  if (activeStartIndex !== null) {
    const start = days[activeStartIndex];
    const end = days[days.length - 1];
    const gapBeforeDays =
      activeStartIndex === 0
        ? 0
        : days
              .slice(0, activeStartIndex)
              .reverse()
              .findIndex((previousDay) => previousDay.isActive) === -1
          ? activeStartIndex
          : days
              .slice(0, activeStartIndex)
              .reverse()
              .findIndex((previousDay) => previousDay.isActive);

    segments.push({
      streakKey: `${start.date}:${end.date}`,
      startDate: start.date,
      endDate: end.date,
      length: differenceInDays(end.date, start.date) + 1,
      status: end.isToday ? "active" : "completed",
      type: gapBeforeDays >= 2 ? "comeback" : "standard",
      gapBeforeDays: gapBeforeDays >= 0 ? gapBeforeDays : 0,
    });
  }

  return segments;
}

function buildAchievements(summary) {
  return [
    {
      id: "streak-7",
      title: "7 Day Streak",
      description: "A full week of uninterrupted revision consistency.",
      unlocked: summary.bestStreak >= 7,
      unlockedAt: summary.bestStreak >= 7 ? new Date().toISOString() : null,
      tone: "teal",
    },
    {
      id: "discipline-30",
      title: "30 Day Discipline",
      description:
        "A month-scale proof that your preparation rhythm is sustainable.",
      unlocked: summary.bestStreak >= 30,
      unlockedAt: summary.bestStreak >= 30 ? new Date().toISOString() : null,
      tone: "mint",
    },
    {
      id: "comeback",
      title: "Consistency Recovery",
      description:
        "Momentum rebuilt after friction, not just during perfect weeks.",
      unlocked: summary.comebackStreak >= 5,
      unlockedAt: summary.comebackStreak >= 5 ? new Date().toISOString() : null,
      tone: "amber",
    },
    {
      id: "warrior",
      title: "Revision Warrior",
      description:
        "Your strongest week carried meaningful revision load and retention pressure.",
      unlocked: summary.strongestWeek.intensityScore >= 420,
      unlockedAt:
        summary.strongestWeek.intensityScore >= 420
          ? new Date().toISOString()
          : null,
      tone: "rose",
    },
  ];
}

function buildMonthBuckets(days) {
  const monthMap = new Map();
  days.forEach((day) => {
    if (!monthMap.has(day.monthKey)) {
      const [year, month] = day.monthKey.split("-").map(Number);
      const label = new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
      }).format(new Date(year, month - 1, 1));
      monthMap.set(day.monthKey, {
        key: day.monthKey,
        label,
        year,
        month,
        days: [],
      });
    }
    monthMap.get(day.monthKey).days.push(day);
  });
  return Array.from(monthMap.values());
}

async function aggregateAttemptDays(Attempt) {
  const rows = await Attempt.aggregate([
    { $match: { deletedAt: null } },
    {
      $project: {
        effectiveDate: {
          $ifNull: [
            "$dateValue",
            {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Kolkata", // 🌍 PRO FIX: Lock aggregations to Indian Standard Time
              },
            },
          ],
        },
        subject: 1,
        topic: 1,
        total: { $ifNull: ["$total", 0] },
        accuracy: { $ifNull: ["$accuracy", 0] },
      },
    },
    {
      $group: {
        _id: "$effectiveDate",
        attemptCount: { $sum: 1 },
        totalQuestions: { $sum: "$total" },
        averageAccuracy: { $avg: "$accuracy" },
        topics: {
          $addToSet: {
            subject: "$subject",
            topic: "$topic",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const map = new Map();
  rows.forEach((row) => {
    map.set(row._id, row);
  });
  return map;
}

async function aggregateRevisionDays(RevisionTopic) {
  const rows = await RevisionTopic.aggregate([
    { $match: { status: "active", "reviewHistory.0": { $exists: true } } },
    { $unwind: "$reviewHistory" },
    {
      $project: {
        effectiveDate: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$reviewHistory.reviewedAt",
            timezone: "Asia/Kolkata", // 🌍 PRO FIX: Ensure night-owl revisions count for the correct day
          },
        },
        subject: 1,
        topic: 1,
        outcome: "$reviewHistory.outcome",
        retentionDelta: {
          $subtract: [
            { $ifNull: ["$reviewHistory.retentionScoreAfter", 0] },
            { $ifNull: ["$reviewHistory.retentionScoreBefore", 0] },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$effectiveDate",
        reviewCount: { $sum: 1 },
        correctReviewCount: {
          $sum: {
            $cond: [{ $eq: ["$outcome", "correct"] }, 1, 0],
          },
        },
        revisedTopics: {
          $addToSet: {
            subject: "$subject",
            topic: "$topic",
          },
        },
        averageRetentionDelta: { $avg: "$retentionDelta" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const map = new Map();
  rows.forEach((row) => {
    map.set(row._id, row);
  });
  return map;
}

function buildDateRange(attemptMap, revisionMap) {
  const today = startOfDay(new Date());
  const earliestKey = [...attemptMap.keys(), ...revisionMap.keys()].sort()[0];
  if (!earliestKey) {
    const fallbackStart = new Date(
      today.getFullYear(),
      today.getMonth() - (TRACKING_MONTHS - 1),
      1,
    );
    return { startDate: startOfDay(fallbackStart), endDate: today };
  }
  return { startDate: startOfDay(earliestKey), endDate: today };
}

function buildDailyTimeline(attemptMap, revisionMap) {
  const { startDate, endDate } = buildDateRange(attemptMap, revisionMap);
  const days = [];
  let previousDayActive = false;

  for (
    let cursor = new Date(startDate);
    cursor <= endDate;
    cursor = addDays(cursor, 1)
  ) {
    const dateKey = formatDateKey(cursor);
    const attemptRow = attemptMap.get(dateKey) || null;
    const revisionRow = revisionMap.get(dateKey) || null;

    const attemptCount = Number(attemptRow && attemptRow.attemptCount) || 0;
    const totalQuestions = Number(attemptRow && attemptRow.totalQuestions) || 0;
    const averageAccuracy = round2(
      Number(attemptRow && attemptRow.averageAccuracy) || 0,
    );
    const attemptTopics = Array.isArray(attemptRow && attemptRow.topics)
      ? attemptRow.topics
      : [];

    const revisionCount = Number(revisionRow && revisionRow.reviewCount) || 0;
    const correctReviewCount =
      Number(revisionRow && revisionRow.correctReviewCount) || 0;
    const reviewSuccessRate =
      revisionCount > 0
        ? round2((correctReviewCount / revisionCount) * 100)
        : 0;
    const revisedTopics = Array.isArray(
      revisionRow && revisionRow.revisedTopics,
    )
      ? revisionRow.revisedTopics
      : [];
    const averageRetentionDelta =
      Number(revisionRow && revisionRow.averageRetentionDelta) || 0;

    const combinedTopics = Array.from(
      new Set(
        [...attemptTopics, ...revisedTopics].map((topicEntry) =>
          buildTopicLabel(
            topicEntry && topicEntry.subject,
            topicEntry && topicEntry.topic,
          ),
        ),
      ),
    );

    const revisedTopicsCount = combinedTopics.length;
    const studyDurationMinutes = Math.round(
      totalQuestions * 2.1 + revisionCount * 11 + revisedTopicsCount * 4.5,
    );
    const qualityScore = round2(
      clamp(averageAccuracy * 0.68 + reviewSuccessRate * 0.32, 0, 100),
    );
    const consistencyImpact = round2(
      clamp(
        attemptCount * 14 +
          revisionCount * 12 +
          revisedTopicsCount * 8 +
          qualityScore * 0.34,
        0,
        100,
      ),
    );
    const retentionImpact = round2(
      clamp(
        revisionCount * 16 +
          reviewSuccessRate * 0.42 +
          Math.max(0, averageRetentionDelta) * 2.8 +
          revisedTopicsCount * 4,
        0,
        100,
      ),
    );
    const intensityScore = round2(
      clamp(
        attemptCount * 11 +
          revisionCount * 21 +
          revisedTopicsCount * 14 +
          studyDurationMinutes * 0.24 +
          qualityScore * 0.38 +
          retentionImpact * 0.22,
        0,
        280,
      ),
    );
    const activityLevel = calculateActivityLevel(intensityScore);
    const isActive = intensityScore > 0;

    days.push({
      date: dateKey,
      monthKey: formatMonthKey(cursor),
      dayOfWeek: cursor.getDay(),
      isToday: dateKey === formatDateKey(new Date()),
      isActive,
      activityLevel,
      intensityScore,
      attemptCount,
      revisionCount,
      revisedTopicsCount,
      studyDurationMinutes,
      qualityScore,
      consistencyImpact,
      retentionImpact,
      accuracyAverage: averageAccuracy,
      reviewSuccessRate,
      streakContinued: isActive && previousDayActive,
      topics: combinedTopics.slice(0, 12),
    });

    previousDayActive = isActive;
  }

  return days;
}

function buildSummary(days) {
  const today = startOfDay(new Date());
  const currentMonthKey = formatMonthKey(today);
  const trackedDays = days.length > 0 ? days : [];
  const activeDays = trackedDays.filter((day) => day.isActive);
  const last42Days = trackedDays.slice(-42);
  const last14Days = trackedDays.slice(-14);
  const previous14Days = trackedDays.slice(-28, -14);
  const segments = buildStreakSegments(trackedDays);

  let currentStreak = 0;
  for (let index = trackedDays.length - 1; index >= 0; index -= 1) {
    if (!trackedDays[index].isActive) break;
    currentStreak += 1;
  }

  const bestStreak = segments.reduce(
    (maxValue, segment) => Math.max(maxValue, segment.length),
    0,
  );
  const latestCompletedComeback = [...segments]
    .reverse()
    .find((segment) => segment.type === "comeback");
  const comebackStreak =
    currentStreak > 0 &&
    segments[segments.length - 1] &&
    segments[segments.length - 1].type === "comeback"
      ? currentStreak
      : latestCompletedComeback
        ? latestCompletedComeback.length
        : 0;

  const activeThisMonth = trackedDays.filter(
    (day) => day.isActive && day.monthKey === currentMonthKey,
  ).length;

  const totalRevisionMinutes = trackedDays.reduce(
    (sum, day) => sum + day.studyDurationMinutes,
    0,
  );

  const windowActiveRate =
    last42Days.length > 0
      ? last42Days.filter((day) => day.isActive).length / last42Days.length
      : 0;
  const averageWindowQuality =
    last42Days.length > 0
      ? last42Days.reduce((sum, day) => sum + day.qualityScore, 0) /
        last42Days.length
      : 0;
  const averageGap = averageGapBetweenActiveDays(last42Days);
  const gapPenalty = Math.max(0, longestMissedGap(last42Days) - 2) * 4.5;
  const regularityScore = clamp(24 - (averageGap - 1) * 4.8, 0, 24);
  const streakScore = clamp((Math.min(currentStreak, 30) / 30) * 18, 0, 18);
  const recoveryBonus = comebackStreak >= 5 ? 6 : 0;
  const consistencyScore = round2(
    clamp(
      windowActiveRate * 40 +
        regularityScore +
        streakScore +
        averageWindowQuality * 0.22 +
        recoveryBonus -
        gapPenalty,
      3,
      99,
    ),
  );

  const recentMomentumScore =
    last14Days.reduce((sum, day) => sum + day.intensityScore, 0) /
      Math.max(1, last14Days.length) +
    (last14Days.filter((day) => day.isActive).length /
      Math.max(1, last14Days.length)) *
      42;
  const previousMomentumScore =
    previous14Days.reduce((sum, day) => sum + day.intensityScore, 0) /
      Math.max(1, previous14Days.length) +
    (previous14Days.filter((day) => day.isActive).length /
      Math.max(1, previous14Days.length)) *
      42;
  const momentumDelta = round2(recentMomentumScore - previousMomentumScore);

  let strongestWeek = {
    label: "No active week yet",
    startDate: trackedDays[0] ? trackedDays[0].date : formatDateKey(today),
    endDate: trackedDays[0] ? trackedDays[0].date : formatDateKey(today),
    intensityScore: 0,
    activeDays: 0,
  };

  for (let index = 0; index < trackedDays.length; index += 1) {
    const slice = trackedDays.slice(index, index + 7);
    if (slice.length === 0) continue;
    const sliceIntensity = round2(
      slice.reduce((sum, day) => sum + day.intensityScore, 0),
    );
    if (sliceIntensity <= strongestWeek.intensityScore) continue;

    const startDate = slice[0].date;
    const endDate = slice[slice.length - 1].date;
    strongestWeek = {
      label: `${startDate} to ${endDate}`,
      startDate,
      endDate,
      intensityScore: sliceIntensity,
      activeDays: slice.filter((day) => day.isActive).length,
    };
  }

  return {
    summary: {
      currentStreak,
      bestStreak,
      comebackStreak,
      activeDays: activeDays.length,
      missedDays: trackedDays.length - activeDays.length,
      activeThisMonth,
      totalRevisionMinutes,
      consistencyScore,
      consistencyState: getConsistencyState(consistencyScore),
      momentumState: getMomentumState(momentumDelta),
      momentumDelta,
      strongestWeek,
    },
    streakHistory: segments,
  };
}

async function persistConsistencyArtifacts(
  models,
  days,
  summary,
  streakHistory,
) {
  const now = new Date();

  if (days.length > 0) {
    await models.ConsistencyDay.bulkWrite(
      days.map((day) => ({
        updateOne: {
          filter: { dateKey: day.date },
          update: {
            $set: {
              dateKey: day.date,
              date: startOfDay(day.date),
              monthKey: day.monthKey,
              isActive: day.isActive,
              activityLevel: day.activityLevel,
              intensityScore: day.intensityScore,
              attemptCount: day.attemptCount,
              revisionCount: day.revisionCount,
              revisedTopicsCount: day.revisedTopicsCount,
              studyDurationMinutes: day.studyDurationMinutes,
              qualityScore: day.qualityScore,
              consistencyImpact: day.consistencyImpact,
              retentionImpact: day.retentionImpact,
              accuracyAverage: day.accuracyAverage,
              reviewSuccessRate: day.reviewSuccessRate,
              streakContinued: day.streakContinued,
              topics: day.topics,
              lastSyncedAt: now,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  await models.ConsistencySnapshot.updateOne(
    { snapshotDateKey: formatDateKey(now) },
    {
      $set: {
        snapshotDateKey: formatDateKey(now),
        snapshotDate: startOfDay(now),
        consistencyScore: summary.consistencyScore,
        consistencyState: summary.consistencyState,
        momentumState: summary.momentumState,
        momentumDelta: summary.momentumDelta,
        currentStreak: summary.currentStreak,
        bestStreak: summary.bestStreak,
        comebackStreak: summary.comebackStreak,
        activeThisMonth: summary.activeThisMonth,
        activeDays: summary.activeDays,
        missedDays: summary.missedDays,
        strongestWeekLabel: summary.strongestWeek.label,
        strongestWeekIntensity: summary.strongestWeek.intensityScore,
        generatedAt: now,
      },
    },
    { upsert: true },
  );

  await models.StreakHistory.deleteMany({});
  if (streakHistory.length > 0) {
    await models.StreakHistory.insertMany(
      streakHistory.map((streak) => ({
        streakKey: streak.streakKey,
        startDate: startOfDay(streak.startDate),
        endDate: startOfDay(streak.endDate),
        length: streak.length,
        status: streak.status,
        type: streak.type,
        gapBeforeDays: streak.gapBeforeDays,
        lastSyncedAt: now,
      })),
      { ordered: false },
    );
  }
}

async function buildConsistencyDashboard(models) {
  const attemptMap = await aggregateAttemptDays(models.Attempt);
  const revisionMap = await aggregateRevisionDays(models.RevisionTopic);
  const allDays = buildDailyTimeline(attemptMap, revisionMap);
  const { summary, streakHistory } = buildSummary(allDays);
  const trailingMonthCutoff = new Date();
  trailingMonthCutoff.setMonth(
    trailingMonthCutoff.getMonth() - (TRACKING_MONTHS - 1),
    1,
  );
  trailingMonthCutoff.setHours(0, 0, 0, 0);

  const visibleDays = allDays.filter(
    (day) => startOfDay(day.date).getTime() >= trailingMonthCutoff.getTime(),
  );
  const months = buildMonthBuckets(visibleDays);
  const recentTrend = allDays.slice(-21).map((day) => ({
    date: day.date,
    intensityScore: day.intensityScore,
    consistencyScore: day.consistencyImpact,
    active: day.isActive,
  }));
  const achievements = buildAchievements(summary);

  await persistConsistencyArtifacts(models, allDays, summary, streakHistory);

  return {
    generatedAt: new Date().toISOString(),
    summary,
    months,
    achievements,
    recentTrend,
    streakHistory: streakHistory
      .slice()
      .sort(
        (first, second) =>
          new Date(second.endDate).getTime() -
          new Date(first.endDate).getTime(),
      )
      .slice(0, 12)
      .map((item) => ({
        streakKey: item.streakKey,
        startDate: item.startDate,
        endDate: item.endDate,
        length: item.length,
        status: item.status,
        type: item.type,
      })),
  };
}

module.exports = {
  buildConsistencyDashboard,
  createConsistencyModels,
};
