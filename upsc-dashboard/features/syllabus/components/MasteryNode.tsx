"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import { motion as m } from "framer-motion";
import { getMasteryLabel, getMasteryTone } from "@/features/syllabus/syllabusTreeUtils";
import type { SyllabusNodeData } from "@/types/syllabus";

interface MasteryNodeData {
  node: SyllabusNodeData;
  isSelected: boolean;
}

export default function MasteryNode({
  data,
}: NodeProps<MasteryNodeData>) {
  const tone = getMasteryTone(data.node.masteryState);
  const masteryLabel = getMasteryLabel(data.node.masteryState);

  return (
    <m.div
      className={`syllabus-node-card tone-${tone} ${
        data.node.level === "root" ? "is-root" : ""
      } ${data.node.level === "subject" ? "is-subject" : "is-topic"} ${
        data.isSelected ? "is-selected" : ""
      }`}
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ duration: 0.18 }}
    >
      {data.node.level !== "root" ? (
        <Handle
          type="target"
          position={Position.Left}
          className="syllabus-node-handle"
        />
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        className="syllabus-node-handle"
      />

      <div className="syllabus-node-head">
        <span className="syllabus-node-kicker">
          {data.node.level === "subject" ? "Subject" : data.node.level === "topic" ? data.node.subject : "UPSC"}
        </span>
        <span className={`syllabus-node-state tone-${tone}`}>{masteryLabel}</span>
      </div>

      <strong className="syllabus-node-title">{data.node.label}</strong>

      <div className="syllabus-node-metrics">
        <span>{data.node.metrics.masteryScore}% mastery</span>
        <span>{data.node.metrics.accuracy}% accuracy</span>
      </div>

      <div className="syllabus-node-footer">
        <span className="syllabus-node-foot-chip">
          {data.node.metrics.retentionStrength}% retention
        </span>
        <span className="syllabus-node-foot-chip is-muted">
          {data.node.metrics.revisionFrequency} touches
        </span>
      </div>
    </m.div>
  );
}
