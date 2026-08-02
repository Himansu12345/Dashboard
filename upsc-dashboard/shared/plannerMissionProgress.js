function normalizeProgressRecord(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return {
      completedAt: value,
      revisedAt: undefined,
      revisions: [],
    };
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      completedAt:
        typeof value.completedAt === "number" && Number.isFinite(value.completedAt)
          ? value.completedAt
          : undefined,
      revisedAt:
        typeof value.revisedAt === "number" && Number.isFinite(value.revisedAt)
          ? value.revisedAt
          : undefined,
      revisions: Array.isArray(value.revisions)
        ? value.revisions.filter((entry) => typeof entry === "number" && Number.isFinite(entry))
        : [],
    };
  }

  return {
    completedAt: undefined,
    revisedAt: undefined,
    revisions: [],
  };
}

function getNoteMissionMode(mission) {
  return mission && mission.mode === "revise" ? "revise" : "complete";
}

function getMissionRevisionStart(mission) {
  if (
    mission &&
    typeof mission.createdAt === "number" &&
    Number.isFinite(mission.createdAt)
  ) {
    return mission.createdAt;
  }

  const actualStart = mission && mission.timeValidation && mission.timeValidation.actualStart
    ? new Date(mission.timeValidation.actualStart).getTime()
    : NaN;
  return Number.isFinite(actualStart) ? actualStart : Date.now();
}

function isLeafRevised(uid, completionTimes, sinceTimestamp) {
  const record = normalizeProgressRecord(completionTimes && completionTimes[uid]);
  return (
    record.revisions.some((entry) => entry >= sinceTimestamp) ||
    (typeof record.revisedAt === "number" && record.revisedAt >= sinceTimestamp)
  );
}

function getUniqueLeafUids(target) {
  return Array.isArray(target && target.leafUids)
    ? Array.from(
        new Set(
          target.leafUids.filter((uid) => typeof uid === "string" && uid.trim()),
        ),
      )
    : [];
}

function calculateNoteMissionProgress(mission, subjectProgress, options) {
  if (!mission || (mission.progress && mission.progress.status === "failed_abandoned")) {
    return mission;
  }

  const hydrateTarget = options && typeof options.hydrateTarget === "function"
    ? options.hydrateTarget
    : null;
  const checkedUids = new Set(
    Array.isArray(subjectProgress && subjectProgress.checkedUids)
      ? subjectProgress.checkedUids
      : [],
  );
  const completionTimes =
    subjectProgress && subjectProgress.completionTimes &&
    typeof subjectProgress.completionTimes === "object"
      ? subjectProgress.completionTimes
      : {};
  const mode = getNoteMissionMode(mission);
  const revisionStart = mode === "revise" ? getMissionRevisionStart(mission) : 0;
  const storedStatus = (mission.progress && mission.progress.status) || "not_started";
  const isStoredClosed = storedStatus === "completed" || storedStatus === "revised";

  const normalizedTargets = (Array.isArray(mission.targets) ? mission.targets : []).map(
    (target) => {
      const hydratedTarget =
        getUniqueLeafUids(target).length > 0 || !hydrateTarget
          ? target
          : hydrateTarget(target, mission);
      const leafUids = getUniqueLeafUids(hydratedTarget);
      const completedLeafCount = leafUids.filter((uid) => checkedUids.has(uid)).length;
      const revisedLeafCount = leafUids.filter(
        (uid) => checkedUids.has(uid) && isLeafRevised(uid, completionTimes, revisionStart),
      ).length;
      const totalLeafCount = leafUids.length;

      return {
        ...hydratedTarget,
        leafUids,
        totalLeafCount,
        completedLeafCount,
        revisedLeafCount,
        completionPercent:
          totalLeafCount > 0
            ? Math.round((completedLeafCount / totalLeafCount) * 100)
            : 0,
        isCompleted: totalLeafCount > 0 && completedLeafCount >= totalLeafCount,
        isRevised: totalLeafCount > 0 && revisedLeafCount >= totalLeafCount,
      };
    },
  );

  const totals = normalizedTargets.reduce(
    (result, target) => {
      const totalLeafCount = target.totalLeafCount || 0;
      result.totalTargets += totalLeafCount;
      result.completedTargets += target.completedLeafCount || 0;
      result.revisedTargets += target.revisedLeafCount || 0;
      return result;
    },
    {
      totalTargets: 0,
      completedTargets: 0,
      revisedTargets: 0,
    },
  );

  const trackedTargets =
    mode === "revise" ? totals.revisedTargets : totals.completedTargets;

  let status = "not_started";
  if (
    mode === "revise" &&
    totals.totalTargets > 0 &&
    totals.revisedTargets >= totals.totalTargets
  ) {
    status = "revised";
  } else if (
    mode === "complete" &&
    totals.totalTargets > 0 &&
    totals.completedTargets >= totals.totalTargets
  ) {
    status = "completed";
  } else if (trackedTargets > 0) {
    status = "in_progress";
  }

  if (isStoredClosed) {
    const lockedTotalTargets =
      (mission.progress && mission.progress.totalTargets) || totals.totalTargets;
    const lockedTargets = normalizedTargets.map((target) => ({
      ...target,
      isCompleted: true,
      isRevised: mode === "revise" ? true : target.isRevised,
      completedLeafCount:
        target.completedLeafCount || target.totalLeafCount || target.leafUids.length || 0,
      revisedLeafCount:
        mode === "revise"
          ? target.revisedLeafCount || target.totalLeafCount || target.leafUids.length || 0
          : target.revisedLeafCount || 0,
      completionPercent: 100,
    }));

    return {
      ...mission,
      mode,
      targets: lockedTargets,
      progress: {
        ...(mission.progress || {}),
        status: storedStatus,
        completionPercent: 100,
        totalTargets: lockedTotalTargets,
        completedTargets:
          mode === "revise"
            ? Math.max(
                (mission.progress && mission.progress.completedTargets) || 0,
                totals.completedTargets,
              )
            : lockedTotalTargets,
        revisedTargets:
          mode === "revise"
            ? lockedTotalTargets
            : Math.max(
                (mission.progress && mission.progress.revisedTargets) || 0,
                totals.revisedTargets,
              ),
        closedAt: (mission.progress && mission.progress.closedAt) || Date.now(),
        targets: lockedTargets,
      },
    };
  }

  return {
    ...mission,
    mode,
    targets: normalizedTargets,
    progress: {
      ...((mission && mission.progress) || {}),
      status,
      completionPercent:
        totals.totalTargets > 0
          ? Math.round((trackedTargets / totals.totalTargets) * 100)
          : 0,
      totalTargets: totals.totalTargets,
      completedTargets: totals.completedTargets,
      revisedTargets: totals.revisedTargets,
      targets: normalizedTargets,
    },
  };
}

module.exports = {
  calculateNoteMissionProgress,
  getMissionRevisionStart,
  getNoteMissionMode,
  isLeafRevised,
  normalizeProgressRecord,
};
