"use client";

import SyllabusTreeGraph from "@/features/syllabus/components/SyllabusTreeGraph";
import { getMasteryLabel } from "@/features/syllabus/syllabusTreeUtils";
import type { SyllabusNodeData } from "@/types/syllabus";

type TreeScope = "all" | string;

interface SyllabusTreeWorkspaceProps {
  rootNode: SyllabusNodeData | null;
  subjectNodes: SyllabusNodeData[];
  topicNodes: SyllabusNodeData[];
  visibleTreeNodes: SyllabusNodeData[];
  selectedNode: SyllabusNodeData | null;
  treeScope: TreeScope;
  activeScopeSubject: SyllabusNodeData | null;
  isFullscreen?: boolean;
  onTreeScopeChange: (scope: TreeScope) => void;
  onSelectedNodeChange: (node: SyllabusNodeData | null) => void;
  onOpenFullscreen?: () => void;
}

export default function SyllabusTreeWorkspace({
  rootNode,
  subjectNodes,
  topicNodes,
  visibleTreeNodes,
  selectedNode,
  treeScope,
  activeScopeSubject,
  isFullscreen = false,
  onTreeScopeChange,
  onSelectedNodeChange,
  onOpenFullscreen,
}: SyllabusTreeWorkspaceProps) {
  return (
    <>
      <div className="table-header-row syllabus-tree-header">
        <div className="table-heading-group syllabus-tree-heading">
          <h4 className="section-title">Mastery Tree</h4>
          <p className="section-note">
            The graph uses focused branch navigation so visibility stays comfortable instead of forcing the whole syllabus into one cramped canvas.
          </p>
        </div>
        <div className="syllabus-tree-header-actions">
          <div className="syllabus-tree-summary">
            <span className="hero-chip muted">
              {treeScope === "all"
                ? `${subjectNodes.length} subject branches`
                : `${visibleTreeNodes.filter((node) => node.level === "topic").length} topic nodes`}
            </span>
            <span className="hero-chip">
              {treeScope === "all"
                ? "Overview map"
                : `${activeScopeSubject?.metrics.masteryScore || 0}% ${treeScope} mastery`}
            </span>
          </div>
          {onOpenFullscreen ? (
            <button
              type="button"
              className="syllabus-fullscreen-btn ripple-btn"
              onClick={onOpenFullscreen}
            >
              Full Screen
            </button>
          ) : null}
        </div>
      </div>

      <div className="syllabus-tree-scope-bar">
        <button
          type="button"
          className={`syllabus-scope-pill ripple-btn ${treeScope === "all" ? "is-active" : ""}`}
          onClick={() => {
            onTreeScopeChange("all");
            onSelectedNodeChange(rootNode || subjectNodes[0] || null);
          }}
        >
          All Subjects
        </button>
        {subjectNodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={`syllabus-scope-pill ripple-btn ${treeScope === node.subject ? "is-active" : ""}`}
            onClick={() => {
              onTreeScopeChange(node.subject);
              onSelectedNodeChange(
                topicNodes.find(
                  (topicNode) =>
                    topicNode.subject === node.subject &&
                    topicNode.masteryState === "weak",
                ) ||
                  topicNodes.find((topicNode) => topicNode.subject === node.subject) ||
                  node,
              );
            }}
          >
            <span>{node.subject}</span>
            <small>{node.metrics.masteryScore}%</small>
          </button>
        ))}
      </div>

      <div className="syllabus-tree-mode-note">
        {treeScope === "all"
          ? "Overview mode shows only the root and subject branches so the entire syllabus stays visible at a glance."
          : `${treeScope} focus mode expands only one branch, giving every topic enough space to stay readable and touch-friendly.`}
      </div>

      {treeScope !== "all" && activeScopeSubject ? (
        <div className="syllabus-focus-banner">
          <div>
            <p className="metric-kicker">Focused Branch</p>
            <strong>{activeScopeSubject.label}</strong>
            <p className="section-note">
              {getMasteryLabel(activeScopeSubject.masteryState)} with{" "}
              {activeScopeSubject.metrics.retentionStrength}% retention strength and{" "}
              {activeScopeSubject.weakSubtopics.length} weak subtopics highlighted.
            </p>
          </div>
        </div>
      ) : null}

      <SyllabusTreeGraph
        nodes={visibleTreeNodes}
        selectedNodeId={selectedNode?.id || null}
        onSelectNode={onSelectedNodeChange}
        isFullscreen={isFullscreen}
      />
    </>
  );
}
