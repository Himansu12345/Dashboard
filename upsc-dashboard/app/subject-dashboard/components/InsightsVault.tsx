"use client";

import React, { useState, useEffect } from "react";

export interface InsightPoint {
  id: string;
  text: string;
  createdAt: number;
}

export function useInsightsVault(storageKeyPrefix: string) {
  const [insightsMap, setInsightsMap] = useState<
    Record<string, InsightPoint[]>
  >({});
  const storageKey = `${storageKeyPrefix}_mcq_insights_vault`;

  // 🛡️ Auto-Fetch from Cloud (with LocalStorage fallback)
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/mcq-insights?subject=${encodeURIComponent(storageKeyPrefix)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.insightsMap) {
          setInsightsMap(data.insightsMap);
          localStorage.setItem(storageKey, JSON.stringify(data.insightsMap));
        }
      })
      .catch((err) => {
        console.error("Cloud fetch failed, loading local backup", err);
        if (!isMounted) return;
        const stored = localStorage.getItem(storageKey);
        if (stored) setInsightsMap(JSON.parse(stored));
      });
    return () => {
      isMounted = false;
    };
  }, [storageKeyPrefix, storageKey]);

  // 🛡️ Auto-Save to Cloud & Local Backup simultaneously
  const saveToCloud = async (nextMap: Record<string, InsightPoint[]>) => {
    setInsightsMap(nextMap);
    localStorage.setItem(storageKey, JSON.stringify(nextMap));
    try {
      await fetch(
        `/api/mcq-insights?subject=${encodeURIComponent(storageKeyPrefix)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ insightsMap: nextMap }),
        },
      );
    } catch (e) {
      console.error("Failed to sync to cloud", e);
    }
  };

  const addInsight = (nodeUid: string, text: string) => {
    const nodeInsights = insightsMap[nodeUid] || [];
    const nextMap = {
      ...insightsMap,
      [nodeUid]: [
        ...nodeInsights,
        { id: Date.now().toString(), text, createdAt: Date.now() },
      ],
    };
    saveToCloud(nextMap);
  };

  const deleteInsight = (nodeUid: string, insightId: string) => {
    const nodeInsights = insightsMap[nodeUid] || [];
    const nextMap = {
      ...insightsMap,
      [nodeUid]: nodeInsights.filter((i) => i.id !== insightId),
    };
    saveToCloud(nextMap);
  };

  return { insightsMap, addInsight, deleteInsight, storageKey };
}

export function InsightsModal({
  isOpen,
  onClose,
  nodeUid,
  nodeLabel,
  insights,
  onAdd,
  onDelete,
  allInsights,
}: {
  isOpen: boolean;
  onClose: () => void;
  nodeUid: string;
  nodeLabel: string;
  insights: InsightPoint[];
  onAdd: (uid: string, text: string) => void;
  onDelete: (uid: string, id: string) => void;
  allInsights: Record<string, InsightPoint[]>;
}) {
  const [newText, setNewText] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (!newText.trim()) return;
    onAdd(nodeUid, newText.trim());
    setNewText("");
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(allInsights, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MCQ_Insights_Vault_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="chapter-stats-overlay"
      onClick={onClose}
      style={{ zIndex: 99999 }}
    >
      <div className="note-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chapter-stats-head">
          <div>
            <p className="chapter-stats-kicker" style={{ color: "#34d399" }}>
              MCQ Insights & Extra Points
            </p>
            <h3 className="chapter-stats-title">{nodeLabel}</h3>
            <p className="chapter-stats-subtitle">
              Securely stored in cloud vault. Completely isolated from core
              notes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="note-manager-inline-btn"
              onClick={handleExport}
              title="Download Forever Backup"
            >
              Export Vault
            </button>
            <button className="chapter-stats-close" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="note-manager-composer mt-4">
          <textarea
            className="note-manager-textarea"
            rows={3}
            placeholder="Drop a new insight, fact, or MCQ trap here..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <button
              className="note-manager-primary"
              style={{
                background: "linear-gradient(180deg, #10b981 0%, #059669 100%)",
                borderColor: "#34d399",
              }}
              onClick={handleSave}
            >
              Save Insight
            </button>
          </div>
        </div>

        {insights.length > 0 ? (
          <div className="note-manager-list mt-8">
            {insights
              .slice()
              .reverse()
              .map((p) => (
                <div className="note-manager-item" key={p.id}>
                  <div className="note-manager-item-head">
                    <strong style={{ color: "#6ee7b7" }}>
                      Added on {new Date(p.createdAt).toLocaleDateString()}
                    </strong>
                    <button
                      className="note-manager-inline-btn danger"
                      onClick={() => onDelete(nodeUid, p.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="note-manager-copy">{p.text}</p>
                </div>
              ))}
          </div>
        ) : (
          <div className="chapter-stats-empty mt-8">
            No extra insights added for this chapter yet.
          </div>
        )}
      </div>
    </div>
  );
}
