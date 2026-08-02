const PLANNER_VAULT_KEY = "upsc_planner_offline_vault";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function savePlannerSafely(plan: any) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PLANNER_VAULT_KEY, JSON.stringify(plan));
    } catch (storageErr) {
      console.error("Critical: Local storage full. Cannot vault plan.", storageErr);
    }
  }

  try {
    const res = await fetch(`${API_URL}/planner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    });

    if (res.ok && typeof window !== "undefined") {
      window.localStorage.removeItem(PLANNER_VAULT_KEY);
    }
  } catch {
    console.warn("Network offline. Full plan secured in browser vault.");
  }
}

export async function flushPlannerVault() {
  if (typeof window === "undefined") return;

  const vaultedPlan = window.localStorage.getItem(PLANNER_VAULT_KEY);
  if (!vaultedPlan) return;

  try {
    const res = await fetch(`${API_URL}/planner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: vaultedPlan,
    });
    if (res.ok) window.localStorage.removeItem(PLANNER_VAULT_KEY);
  } catch {
    console.warn("Full plan vault flush failed.");
  }
}
