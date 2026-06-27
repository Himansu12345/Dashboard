"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MotionCard } from "@/components/motion/MotionWrappers";
import { getMasteryLabel, getMasteryTone } from "@/features/syllabus/syllabusTreeUtils";
import type { SyllabusNodeData } from "@/types/syllabus";

interface SyllabusNodeDetailPanelProps {
  node: SyllabusNodeData | null;
}

export default function SyllabusNodeDetailPanel({
  node,
}: SyllabusNodeDetailPanelProps) {
  if (!node) {
    return (
      <div className="syllabus-detail-empty">
        Select a syllabus node to inspect mastery, retention, revision health, and weak areas.
      </div>
    );
  }

  const tone = getMasteryTone(node.masteryState);

  return (
    <div className="syllabus-detail-shell">
      <div className="syllabus-detail-header">
        <div>
          <p className="page-kicker">Node Detail</p>
          <h4 className="section-title">{node.label}</h4>
          <p className="section-note">
            {node.topic
              ? `${node.subject} mastery path with retention and revision diagnostics.`
              : "Aggregated subject intelligence across all linked subtopics."}
          </p>
        </div>
        <span className={`hero-chip syllabus-status-chip tone-${tone}`}>
          {getMasteryLabel(node.masteryState)}
        </span>
      </div>

      <div className="syllabus-detail-metrics">
        <div className="syllabus-detail-metric">
          <span>Mastery</span>
          <strong>{node.metrics.masteryScore}%</strong>
        </div>
        <div className="syllabus-detail-metric">
          <span>Accuracy</span>
          <strong>{node.metrics.accuracy}%</strong>
        </div>
        <div className="syllabus-detail-metric">
          <span>Retention</span>
          <strong>{node.metrics.retentionStrength}%</strong>
        </div>
        <div className="syllabus-detail-metric">
          <span>Revision Health</span>
          <strong>{node.metrics.revisionHealth}%</strong>
        </div>
        <div className="syllabus-detail-metric">
          <span>Consistency</span>
          <strong>{node.metrics.consistencyImpact}%</strong>
        </div>
        <div className="syllabus-detail-metric">
          <span>Repeated Mistakes</span>
          <strong>{node.metrics.repeatedMistakes}</strong>
        </div>
      </div>

      <MotionCard className="syllabus-detail-panel" disableReveal>
        <div className="table-header-row">
          <div className="table-heading-group">
            <h4 className="section-title">Progress Trend</h4>
            <p className="section-note">
              Smooth mastery progression based on recent revision and performance snapshots.
            </p>
          </div>
        </div>
        <div className="syllabus-detail-chart">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={node.revisionHistory} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="syllabusNodeFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(0,229,255,0.48)" />
                  <stop offset="100%" stopColor="rgba(0,229,255,0.03)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,205,255,0.12)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#9ac7ef" />
              <YAxis tickLine={false} axisLine={false} stroke="#9ac7ef" />
              <Tooltip
                contentStyle={{
                  background: "rgba(7, 14, 29, 0.96)",
                  border: "1px solid rgba(110, 195, 255, 0.24)",
                  borderRadius: "14px",
                  color: "#eaf7ff",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#75ebff"
                strokeWidth={2.4}
                fill="url(#syllabusNodeFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </MotionCard>

      <div className="syllabus-detail-grid">
        <div className="syllabus-detail-note-card">
          <span className="metric-kicker">Retention Status</span>
          <strong>{node.retentionStatus}</strong>
          <p>{node.metrics.revisionFrequency} revision touches tracked for this node.</p>
        </div>
        <div className="syllabus-detail-note-card">
          <span className="metric-kicker">Weak Subtopics</span>
          {node.weakSubtopics.length > 0 ? (
            <div className="consistency-topic-list">
              {node.weakSubtopics.map((topic) => (
                <span key={topic} className="consistency-topic-chip">
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <p>No immediate weak subtopics are standing out right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
