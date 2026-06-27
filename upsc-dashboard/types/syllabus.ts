export type SyllabusMasteryState = "untouched" | "weak" | "improving" | "mastered";

export type SyllabusRetentionStatus =
  | "Needs Revision"
  | "Shaky"
  | "Stabilizing"
  | "Strong";

export type SyllabusTab = "overview" | "tree" | "insights";

export interface SyllabusTrendPoint {
  label: string;
  value: number;
}

export interface SyllabusNodeMetrics {
  masteryScore: number;
  accuracy: number;
  retentionStrength: number;
  revisionHealth: number;
  consistencyImpact: number;
  repeatedMistakes: number;
  revisionFrequency: number;
  progressDelta: number;
}

export interface SyllabusNodeData {
  id: string;
  parentId: string | null;
  label: string;
  subject: string;
  topic: string | null;
  level: "root" | "subject" | "topic";
  masteryState: SyllabusMasteryState;
  retentionStatus: SyllabusRetentionStatus;
  attempted: boolean;
  metrics: SyllabusNodeMetrics;
  weakSubtopics: string[];
  revisionHistory: SyllabusTrendPoint[];
  recentlyMasteredAt: string | null;
}

export interface SyllabusInsight {
  id: string;
  title: string;
  description: string;
  tone: "teal" | "mint" | "amber" | "rose";
}

export interface SyllabusSummary {
  totalTopics: number;
  masteredTopics: number;
  improvingTopics: number;
  weakTopics: number;
  untouchedTopics: number;
  strongestSubject: string;
  fastestImprovingTopic: string;
  recentlyMasteredCount: number;
  overallMasteryScore: number;
}

export interface SyllabusDashboardPayload {
  generatedAt: string;
  summary: SyllabusSummary;
  nodes: SyllabusNodeData[];
  insights: SyllabusInsight[];
}

export interface SyllabusTopicNoteTarget {
  subject: string;
  topicKey: string;
  topicLabel: string;
  path: string[];
}

export interface SyllabusTopicNoteDocument extends SyllabusTopicNoteTarget {
  notes: string[];
  createdAt: string | null;
  updatedAt: string | null;
}
