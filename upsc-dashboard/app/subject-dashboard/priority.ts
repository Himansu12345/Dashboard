export const PRIORITY_LABELS = {
  high: "High",
  mid: "Mid",
  low: "Low",
} as const;

const LEGACY_PRIORITY_MAP: Record<string, keyof typeof PRIORITY_LABELS> = {
  pm3: "high",
  pm2: "high",
  pm: "mid",
  ps: "mid",
  pu: "low",
  psel: "low",
};

export function normalizePriority(priority?: string | null) {
  if (!priority) return null;
  if (priority in PRIORITY_LABELS) {
    return priority as keyof typeof PRIORITY_LABELS;
  }
  return LEGACY_PRIORITY_MAP[priority] ?? null;
}
