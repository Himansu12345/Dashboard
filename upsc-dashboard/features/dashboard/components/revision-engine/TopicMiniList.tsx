import type { RevisionTopic } from "@/types/revision";

interface TopicMiniListProps {
  items: RevisionTopic[];
  mode: "fading" | "strengthened";
}

export default function TopicMiniList({ items, mode }: TopicMiniListProps) {
  if (items.length === 0) {
    return (
      <p className="revision-mini-empty">
        {mode === "fading"
          ? "No fragile topics are standing out right now."
          : "No recent strengthened topics yet."}
      </p>
    );
  }

  return (
    <div className="revision-mini-list">
      {items.map((topic) => (
        <div key={topic.id} className="revision-mini-item">
          <div className="revision-mini-item-copy">
            <span>{topic.subject}</span>
            <small>{topic.topic}</small>
          </div>
          <strong>
            {mode === "fading" ? `${topic.retentionScore}%` : `Stage ${topic.revisionStrength + 1}`}
          </strong>
        </div>
      ))}
    </div>
  );
}
