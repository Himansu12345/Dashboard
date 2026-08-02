const express = require("express");
const router = express.Router();
const WeeklyPlan = require("../WeeklyPlan");
const SubjectProgress = require("../SubjectProgress");

const {
  createEvent,
  deleteEvent,
} = require("../../services/googleCalendarService");

const HISTORY_LIMIT_MAX = 1000;
const CLOSED_STATUSES = new Set(["completed", "revised", "failed_abandoned"]);

function toMillis(value) {
  if (!value) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function toCompletionMap(progress) {
  const raw = progress?.completionTimes || {};
  if (raw instanceof Map) return Object.fromEntries(raw);
  return raw && typeof raw === "object" ? raw : {};
}

function parsePlannedDateTime(dateKey, timeValue) {
  if (!dateKey || !timeValue || timeValue === "00:00") return null;
  const parsed = new Date(`${dateKey}T${timeValue}:00+05:30`).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function collectMissionLeafUids(mission) {
  const uids = new Set();
  for (const target of mission?.targets || []) {
    for (const uid of target?.leafUids || []) {
      if (uid) uids.add(uid);
    }
  }
  return Array.from(uids);
}

function getMissionProgressEvents(mission, progressBySubjectKey) {
  if (!mission?.subjectKey) return [];

  const completionMap = toCompletionMap(progressBySubjectKey.get(mission.subjectKey));
  const missionStart = toMillis(mission.createdAt) || toMillis(mission.timeValidation?.actualStart) || 0;
  const mode = mission.mode === "revise" ? "revise" : "complete";

  return collectMissionLeafUids(mission)
    .flatMap((uid) => {
      const record = completionMap[uid];
      if (!record) return [];
      if (typeof record === "number") return mode === "complete" ? [record] : [];

      const events = [];
      if (mode === "revise") {
        if (typeof record.revisedAt === "number") events.push(record.revisedAt);
        if (Array.isArray(record.revisions)) events.push(...record.revisions);
      } else if (typeof record.completedAt === "number") {
        events.push(record.completedAt);
      }
      return events;
    })
    .filter((time) => Number.isFinite(time) && time >= missionStart)
    .sort((first, second) => first - second);
}

function getDurationSnapshot(day, mission, latestProgressAt) {
  const actualStartAt = toMillis(mission.timeValidation?.actualStart);
  const actualEndAt = toMillis(mission.timeValidation?.actualEnd);
  const closedAt = toMillis(mission.progress?.closedAt);
  const plannedStartAt = parsePlannedDateTime(day.dateKey, mission.timeValidation?.plannedStart);
  let plannedEndAt = parsePlannedDateTime(day.dateKey, mission.timeValidation?.plannedEnd);

  if (plannedStartAt && plannedEndAt && plannedEndAt < plannedStartAt) {
    plannedEndAt += 24 * 60 * 60 * 1000;
  }

  const endAt = actualEndAt || closedAt || latestProgressAt || null;
  if (actualStartAt && endAt && endAt >= actualStartAt) {
    return {
      startedAt: actualStartAt,
      endedAt: endAt,
      durationMinutes: Math.round((endAt - actualStartAt) / 60000),
      durationSource: actualEndAt ? "actual" : "estimated",
    };
  }

  if (plannedStartAt && plannedEndAt && plannedEndAt >= plannedStartAt) {
    return {
      startedAt: actualStartAt,
      endedAt: endAt,
      durationMinutes: Math.round((plannedEndAt - plannedStartAt) / 60000),
      durationSource: "planned",
    };
  }

  return {
    startedAt: actualStartAt,
    endedAt: endAt,
    durationMinutes: null,
    durationSource: "unknown",
  };
}

function buildMissionHistoryEntry(plan, day, mission, type, progressBySubjectKey) {
  const progressEvents =
    type === "note" ? getMissionProgressEvents(mission, progressBySubjectKey) : [];
  const latestProgressAt = progressEvents.length
    ? progressEvents[progressEvents.length - 1]
    : null;
  const status = mission.progress?.status || "not_started";
  const completionPercent =
    CLOSED_STATUSES.has(status) && status !== "failed_abandoned"
      ? 100
      : Math.max(0, Math.min(100, Number(mission.progress?.completionPercent || 0)));
  const duration = getDurationSnapshot(day, mission, latestProgressAt);

  const title =
    type === "test"
      ? mission.chapterTitle || mission.chapterSlug || "Mock Test"
      : mission.chapterLabel || "Study Mission";

  return {
    id: `${day.dateKey}-${mission.id}`,
    missionId: mission.id,
    type,
    weekStartDate: plan.weekStartDate,
    dateKey: day.dateKey,
    dayOfWeek: day.dayOfWeek,
    title,
    subject: mission.subject || "",
    chapter: title,
    mode: mission.mode || (type === "test" ? "test" : "complete"),
    status,
    completionPercent,
    completedUnits:
      type === "test"
        ? Number(mission.progress?.completedQuestions || 0)
        : Number(
            mission.mode === "revise"
              ? mission.progress?.revisedTargets || 0
              : mission.progress?.completedTargets || 0,
          ),
    totalUnits:
      type === "test"
        ? Number(mission.totalQuestions || 0)
        : Number(mission.progress?.totalTargets || collectMissionLeafUids(mission).length || 0),
    accuracy: type === "test" ? Number(mission.progress?.accuracy || 0) : null,
    plannedStart: mission.timeValidation?.plannedStart || null,
    plannedEnd: mission.timeValidation?.plannedEnd || null,
    validationState: mission.timeValidation?.validationState || "pending",
    delayReason: mission.timeValidation?.delayReason || "",
    firstProgressAt: progressEvents[0] || duration.startedAt || null,
    latestProgressAt,
    startedAt: duration.startedAt,
    endedAt: duration.endedAt,
    durationMinutes: duration.durationMinutes,
    durationSource: duration.durationSource,
    targetCount: Array.isArray(mission.targets) ? mission.targets.length : 0,
  };
}

// GET PLANNER DAYS FOR A YEAR
router.get("/year/:year", async (req, res) => {
  try {
    const selectedYear = Number(req.params.year);

    if (
      !Number.isInteger(selectedYear) ||
      selectedYear < 1970 ||
      selectedYear > 3000
    ) {
      return res.status(400).json({ error: "Invalid planner year." });
    }

    const yearStart = `${selectedYear}-01-01`;
    const yearEnd = `${selectedYear}-12-31`;
    const plans = await WeeklyPlan.find({
      "days.dateKey": { $gte: yearStart, $lte: yearEnd },
    }).lean();

    const days = plans
      .flatMap((plan) => plan.days || [])
      .filter((day) => day.dateKey >= yearStart && day.dateKey <= yearEnd)
      .sort((first, second) => first.dateKey.localeCompare(second.dateKey));

    return res.json({
      ok: true,
      data: days,
    });
  } catch (err) {
    console.error("GET PLANNER YEAR ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch planner year." });
  }
});

// GET MISSION HISTORY
router.get("/history", async (req, res) => {
  try {
    const limit = Math.min(
      HISTORY_LIMIT_MAX,
      Math.max(1, Number(req.query.limit) || 500),
    );

    const plans = await WeeklyPlan.find({})
      .sort({ weekStartDate: -1 })
      .lean();

    const subjectKeys = new Set();
    for (const plan of plans) {
      for (const day of plan.days || []) {
        for (const mission of day.noteMissions || []) {
          if (mission.subjectKey) subjectKeys.add(mission.subjectKey);
        }
      }
    }

    const progressRows = subjectKeys.size
      ? await SubjectProgress.find({
          subjectKey: { $in: Array.from(subjectKeys) },
        }).lean()
      : [];
    const progressBySubjectKey = new Map(
      progressRows.map((progress) => [progress.subjectKey, progress]),
    );

    const entries = plans
      .flatMap((plan) =>
        (plan.days || []).flatMap((day) => [
          ...(day.noteMissions || []).map((mission) =>
            buildMissionHistoryEntry(
              plan,
              day,
              mission,
              "note",
              progressBySubjectKey,
            ),
          ),
          ...(day.testMissions || []).map((mission) =>
            buildMissionHistoryEntry(
              plan,
              day,
              mission,
              "test",
              progressBySubjectKey,
            ),
          ),
        ]),
      )
      .sort((first, second) => {
        const firstTime =
          first.endedAt ||
          first.latestProgressAt ||
          parsePlannedDateTime(first.dateKey, first.plannedStart) ||
          0;
        const secondTime =
          second.endedAt ||
          second.latestProgressAt ||
          parsePlannedDateTime(second.dateKey, second.plannedStart) ||
          0;
        return secondTime - firstTime;
      })
      .slice(0, limit);

    const completedEntries = entries.filter((entry) =>
      CLOSED_STATUSES.has(entry.status),
    );
    const totalDurationMinutes = completedEntries.reduce(
      (sum, entry) => sum + (entry.durationMinutes || 0),
      0,
    );

    return res.json({
      ok: true,
      data: {
        entries,
        summary: {
          totalMissions: entries.length,
          completedMissions: completedEntries.filter(
            (entry) => entry.status !== "failed_abandoned",
          ).length,
          abandonedMissions: completedEntries.filter(
            (entry) => entry.status === "failed_abandoned",
          ).length,
          averageCompletion:
            entries.length > 0
              ? Math.round(
                  entries.reduce(
                    (sum, entry) => sum + entry.completionPercent,
                    0,
                  ) / entries.length,
                )
              : 0,
          totalDurationMinutes,
        },
      },
    });
  } catch (err) {
    console.error("GET MISSION HISTORY ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch mission history." });
  }
});

// GET WEEKLY PLAN
router.get("/:weekStart", async (req, res) => {
  try {
    const { weekStart } = req.params;

    const plan = await WeeklyPlan.findOne({
      weekStartDate: weekStart,
    }).lean();

    if (!plan) {
      return res.json({
        exists: false,
        data: null,
      });
    }

    return res.json({
      exists: true,
      data: plan,
    });
  } catch (err) {
    console.error("GET PLANNER ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch weekly plan." });
  }
});

// SAVE/UPDATE WEEKLY PLAN
router.post("/", async (req, res) => {
  try {
    const {
      weekStartDate,
      status = "Draft",
      committedAt = null,
      revisionsCount = 0,
      executionMatrix = {},
      days = [],
      updatedAt: clientTimestamp, // ✅ Capture exactly what the client sent (if anything)
    } = req.body || {};

    if (!weekStartDate) {
      return res.status(400).json({ error: "weekStartDate is required." });
    }

    // 🛡️ PRO FIX: Timestamp Conflict Resolution Engine
    const existingPlan = await WeeklyPlan.findOne({ weekStartDate }).lean();

    // Only compare if the client actually provided a timestamp
    if (existingPlan && existingPlan.updatedAt && clientTimestamp) {
      if (clientTimestamp < existingPlan.updatedAt) {
        console.warn(
          "⚠️ Sync Rejected: Database has a newer version. Preventing cross-device overwrite.",
        );
        return res.status(409).json({
          error: "Conflict: Newer version exists in database.",
          data: existingPlan,
        });
      }
    }

    // Generate the true server timestamp ONLY at the moment of saving
    // =======================================
    // DELETE REMOVED GOOGLE CALENDAR EVENTS
    // =======================================

    if (existingPlan) {
      // Collect all mission IDs that still exist in the incoming request
      const incomingMissionIds = new Set();

      for (const day of days) {
        for (const mission of day.noteMissions || []) {
          incomingMissionIds.add(mission.id);
        }
      }

      // Find missions that existed previously but are now gone
      // Find missions that existed previously but are now gone
      for (const oldDay of existingPlan.days || []) {
        // 🛡️ PRO FIX: Check BOTH Note Missions and Test Missions
        const allOldMissions = [
          ...(oldDay.noteMissions || []),
          ...(oldDay.testMissions || []),
        ];
        for (const oldMission of allOldMissions) {
          if (!incomingMissionIds.has(oldMission.id)) {
            if (oldMission.googleCalendarEventId) {
              try {
                await deleteEvent(oldMission.googleCalendarEventId);

                console.log(
                  `🗑 Deleted Google Calendar event: ${oldMission.googleCalendarEventId}`,
                );
              } catch (err) {
                console.error(
                  "Failed to delete Google Calendar event:",
                  err.message,
                );
              }
            }
          }
        }
      }
    }

    // Generate the true server timestamp ONLY at the moment of saving
    const serverTimestamp = Date.now();

    // =======================================
    // GOOGLE CALENDAR SYNC
    // =======================================

    // =======================================
    // GOOGLE CALENDAR SYNC
    // =======================================

    for (const day of days) {
      // 🛡️ PRO FIX: Sync BOTH Note Missions and Mock Tests to Google Calendar
      const allMissions = [
        ...(day.noteMissions || []),
        ...(day.testMissions || []),
      ];

      for (const mission of allMissions) {
        if (mission.googleCalendarEventId) continue;

        const start = mission.timeValidation?.plannedStart;
        const end = mission.timeValidation?.plannedEnd;

        if (!start || !end) continue;

        // 🌍 LOCKED TO IST: Forces cloud servers to schedule correctly for Indian UPSC aspirants
        const startDate = new Date(`${day.dateKey}T${start}:00+05:30`);
        const endDate = new Date(`${day.dateKey}T${end}:00+05:30`);

        // 🛡️ PRO FIX: Graceful Degradation. Never let a 3rd Party API break your proprietary database save.
        try {
          const isTest = mission.id && String(mission.id).startsWith("test");
          const eventTitle = isTest
            ? `📝 MOCK TEST: ${mission.subject} • ${mission.chapterTitle || mission.chapterSlug}`
            : `📚 STUDY: ${mission.subject} • ${mission.chapterLabel}`;

          const eventDescription = isTest
            ? `🎯 UPSC Mock Test\n\nSubject: ${mission.subject}\nTopic: ${mission.chapterTitle || mission.chapterSlug}\nQuestions: ${mission.totalQuestions}\nTime Limit: ${mission.timeLimitMinutes} mins\n\n🔥 Generated by UPSC Dashboard`
            : (() => {
                // 🛡️ PRO FIX: Protect against 500 Server Crashes if the client payload drops the array
                const safeTargets = Array.isArray(mission.targets)
                  ? mission.targets
                  : [];

                const totalTopics = safeTargets.length;

                const completedTopics = safeTargets.filter(
                  (t) => t.isCompleted,
                ).length;

                const revisedTopics = safeTargets.filter(
                  (t) => t.isRevised,
                ).length;

                const totalPoints = safeTargets.reduce(
                  (sum, t) => sum + (t.leafUids?.length || 0),
                  0,
                );

                const completedPoints = safeTargets.reduce((sum, t) => {
                  if (t.isCompleted) {
                    return sum + (t.leafUids?.length || 0);
                  }
                  return sum;
                }, 0);

                const remainingPoints = totalPoints - completedPoints;

                const targetList = safeTargets
                  .map((t) => {
                    const status = t.isRevised
                      ? "🔄 Revised"
                      : t.isCompleted
                        ? "✅ Completed"
                        : "⏳ Pending";

                    return [
                      `${t.label}`,
                      `   • Points : ${t.leafUids?.length || 0}`,
                      `   • Status : ${status}`,
                    ].join("\n");
                  })
                  .join("\n\n");

                return `
🎯 UPSC Study Mission

📖 Subject
${mission.subject}

🏛 Chapter
${mission.chapterLabel}

━━━━━━━━━━━━━━━━━━━━━━

📚 Targets

${targetList}

━━━━━━━━━━━━━━━━━━━━━━

📊 Mission Stats

Topics : ${totalTopics}

Points : ${totalPoints}

Completed Topics : ${completedTopics}

Revised Topics : ${revisedTopics}

Completed Points : ${completedPoints}

Remaining Points : ${remainingPoints}

━━━━━━━━━━━━━━━━━━━━━━

🔥 Generated by UPSC Dashboard
`;
              })();

          const event = await createEvent({
            summary: eventTitle,
            description: eventDescription,
            start: {
              dateTime: startDate.toISOString(),
              timeZone: "Asia/Kolkata",
            },
            end: {
              dateTime: endDate.toISOString(),
              timeZone: "Asia/Kolkata",
            },
            reminders: {
              useDefault: false,
              overrides: [
                {
                  method: "popup",
                  minutes: 10,
                },
              ],
            },
          });

          mission.googleCalendarEventId = event.id;
        } catch (calendarErr) {
          console.warn(
            `⚠️ Google Calendar Sync Skipped for Mission ${mission.id}:`,
            calendarErr.message,
          );
          // Fails gracefully. The loop continues and the Weekly Plan will still safely save to MongoDB!
        }
      }
    }

    const plan = await WeeklyPlan.findOneAndUpdate(
      { weekStartDate },
      {
        weekStartDate,
        status,
        committedAt,
        revisionsCount,
        executionMatrix,
        days,
        updatedAt: serverTimestamp, // ✅ Lock in the definitive new server timestamp
      },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    return res.json({
      ok: true,
      data: plan,
    });
  } catch (err) {
    console.error("POST PLANNER ERROR:", err);
    return res.status(500).json({ error: "Failed to save weekly plan." });
  }
});

module.exports = router;
