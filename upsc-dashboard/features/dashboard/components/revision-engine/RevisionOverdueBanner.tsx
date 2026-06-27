import type { RevisionTopic } from "@/types/revision";

interface RevisionOverdueBannerProps {
  overdueTopics: RevisionTopic[];
}

export default function RevisionOverdueBanner({
  overdueTopics,
}: RevisionOverdueBannerProps) {
  if (overdueTopics.length === 0) return null;

  return (
    <div className="revision-overdue-banner">
      <p className="revision-panel-kicker">Overdue Topics</p>
      <div className="revision-overdue-list">
        {overdueTopics.map((topic) => (
          <span key={topic.id} className="revision-overdue-chip">
            {topic.subject} - {topic.topic} ({topic.overdueDays}d)
          </span>
        ))}
      </div>
    </div>
  );
}
