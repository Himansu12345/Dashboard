"use client";

import { useCallback, useMemo, useState } from "react";
import { MotionCard, MotionList, MotionListItem } from "@/components/motion/MotionWrappers";
import SyllabusNodeDetailPanel from "@/features/syllabus/components/SyllabusNodeDetailPanel";
import SyllabusTreeFullscreenModal from "@/features/syllabus/components/SyllabusTreeFullscreenModal";
import SyllabusTreeWorkspace from "@/features/syllabus/components/SyllabusTreeWorkspace";
import { getMasteryLabel, getMasteryTone } from "@/features/syllabus/syllabusTreeUtils";
import type { SyllabusDashboardPayload, SyllabusNodeData, SyllabusTab } from "@/types/syllabus";

interface SyllabusTreeDashboardProps {
  dashboard: SyllabusDashboardPayload | null;
  isLoading: boolean;
  isRefreshing: boolean;
  activeTab: SyllabusTab;
  onTabChange: (tab: SyllabusTab) => void;
}

const TAB_ITEMS: Array<{ id: SyllabusTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "tree", label: "Tree" },
  { id: "insights", label: "Insights" },
];

type TreeScope = "all" | string;

function getDefaultSelectedNode(nodes: SyllabusNodeData[]): SyllabusNodeData | null {
  return (
    nodes.find((node) => node.level === "topic" && node.masteryState === "weak") ||
    nodes.find((node) => node.level === "topic" && node.masteryState === "improving") ||
    nodes.find((node) => node.level === "subject") ||
    nodes[0] ||
    null
  );
}

function getNormalizedTreeScope(nodes: SyllabusNodeData[], requestedScope: TreeScope): TreeScope {
  if (requestedScope === "all") return "all";

  const subjectStillExists = nodes.some(
    (node) => node.level === "subject" && node.subject === requestedScope,
  );
  if (subjectStillExists) return requestedScope;

  const nextDefault = getDefaultSelectedNode(nodes);
  return nextDefault?.subject && nextDefault.subject !== "UPSC" ? nextDefault.subject : "all";
}

function isNodeVisibleInScope(node: SyllabusNodeData, scope: TreeScope): boolean {
  if (scope === "all") return node.level === "root" || node.level === "subject";
  if (node.level === "root") return true;
  return node.subject === scope;
}

function getFallbackNodeForScope(nodes: SyllabusNodeData[], scope: TreeScope): SyllabusNodeData | null {
  if (scope === "all") {
    return (
      nodes.find((node) => node.level === "root") ||
      nodes.find((node) => node.level === "subject") ||
      null
    );
  }

  return (
    nodes.find(
      (node) =>
        node.level === "topic" &&
        node.subject === scope &&
        node.masteryState === "weak",
    ) ||
    nodes.find((node) => node.level === "topic" && node.subject === scope) ||
    nodes.find((node) => node.level === "subject" && node.subject === scope) ||
    nodes.find((node) => node.level === "root") ||
    null
  );
}

export default function SyllabusTreeDashboard({
  dashboard,
  isLoading,
  isRefreshing,
  activeTab,
  onTabChange,
}: SyllabusTreeDashboardProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [treeScope, setTreeScope] = useState<TreeScope>("all");
  const [isTreeFullscreenOpen, setIsTreeFullscreenOpen] = useState(false);

  const nodes = useMemo(() => dashboard?.nodes || [], [dashboard?.nodes]);
  const normalizedTreeScope = useMemo(
    () => getNormalizedTreeScope(nodes, treeScope),
    [nodes, treeScope],
  );
  const subjectNodes = useMemo(
    () => nodes.filter((node) => node.level === "subject"),
    [nodes],
  );
  const rootNode = useMemo(
    () => nodes.find((node) => node.level === "root") || null,
    [nodes],
  );
  const topicNodes = useMemo(
    () => nodes.filter((node) => node.level === "topic"),
    [nodes],
  );
  const activeScopeSubject = useMemo(
    () => subjectNodes.find((node) => node.subject === normalizedTreeScope) || null,
    [normalizedTreeScope, subjectNodes],
  );
  const visibleTreeNodes = useMemo(
    () => nodes.filter((node) => isNodeVisibleInScope(node, normalizedTreeScope)),
    [nodes, normalizedTreeScope],
  );
  const selectedNode = useMemo(() => {
    const matchedNode = nodes.find((node) => node.id === selectedNodeId) || null;
    if (matchedNode && isNodeVisibleInScope(matchedNode, normalizedTreeScope)) {
      return matchedNode;
    }
    return getFallbackNodeForScope(nodes, normalizedTreeScope);
  }, [nodes, normalizedTreeScope, selectedNodeId]);

  const handleSelectedNodeChange = useCallback((node: SyllabusNodeData | null) => {
    setSelectedNodeId(node?.id || null);
  }, []);

  const handleTreeScopeChange = useCallback((scope: TreeScope) => {
    setTreeScope(scope);
  }, []);

  if (isLoading || !dashboard) {
    return (
      <section className="syllabus-os-shell">
        <div className="syllabus-empty-state glass-panel">
          Preparing your premium syllabus mastery map...
        </div>
      </section>
    );
  }

  return (
    <section className="syllabus-os-shell">
      <div className="syllabus-os-header">
        <div>
          <p className="page-kicker">Visible Mastery</p>
          <h3 className="syllabus-os-title">UPSC Syllabus Progress Tree</h3>
          <p className="syllabus-os-note">
            A premium visual mastery map that turns invisible preparation into visible progress.
          </p>
        </div>
        <div className="page-hero-status">
          <span className="hero-chip">{dashboard.summary.masteredTopics} topics mastered</span>
          <span className="hero-chip muted">
            {dashboard.summary.overallMasteryScore}% overall mastery
          </span>
          {isRefreshing ? <span className="hero-chip is-live">Refreshing progress tree</span> : null}
        </div>
      </div>

      <div className="syllabus-tab-row" role="tablist" aria-label="Syllabus sections">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`syllabus-tab ripple-btn ${activeTab === tab.id ? "is-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <>
          <MotionList className="syllabus-summary-grid">
            <MotionListItem>
              <MotionCard className="syllabus-summary-card tone-mastered">
                <p className="metric-kicker">Overall Mastery</p>
                <h4 className="metric-value">{dashboard.summary.overallMasteryScore}%</h4>
                <p className="metric-label">Visible syllabus transformation across all tracked topics.</p>
              </MotionCard>
            </MotionListItem>
            <MotionListItem>
              <MotionCard className="syllabus-summary-card tone-improving">
                <p className="metric-kicker">Mastered Topics</p>
                <h4 className="metric-value">{dashboard.summary.masteredTopics}</h4>
                <p className="metric-label">{dashboard.summary.recentlyMasteredCount} recently mastered this month.</p>
              </MotionCard>
            </MotionListItem>
            <MotionListItem>
              <MotionCard className="syllabus-summary-card tone-weak">
                <p className="metric-kicker">Weak Areas</p>
                <h4 className="metric-value">{dashboard.summary.weakTopics}</h4>
                <p className="metric-label">Priority nodes that still need reinforcement.</p>
              </MotionCard>
            </MotionListItem>
            <MotionListItem>
              <MotionCard className="syllabus-summary-card tone-untouched">
                <p className="metric-kicker">Untouched Topics</p>
                <h4 className="metric-value">{dashboard.summary.untouchedTopics}</h4>
                <p className="metric-label">Syllabus branches still waiting to light up.</p>
              </MotionCard>
            </MotionListItem>
          </MotionList>

          <div className="syllabus-overview-grid">
            <MotionCard className="syllabus-panel">
              <div className="table-header-row">
                <div className="table-heading-group">
                  <h4 className="section-title">Subject Highlights</h4>
                  <p className="section-note">
                    Compare major branches and see where your preparation momentum is concentrating.
                  </p>
                </div>
              </div>
              <div className="syllabus-subject-highlight-grid">
                {subjectNodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    className={`syllabus-subject-highlight tone-${getMasteryTone(node.masteryState)}`}
                    onClick={() => {
                      setTreeScope(node.subject);
                      setSelectedNodeId(node.id);
                      onTabChange("tree");
                    }}
                  >
                    <span className="metric-kicker">{node.subject}</span>
                    <strong>{node.metrics.masteryScore}% mastery</strong>
                    <p>
                      {getMasteryLabel(node.masteryState)} with {node.metrics.retentionStrength}% retention strength.
                    </p>
                  </button>
                ))}
              </div>
            </MotionCard>

            <MotionCard className="syllabus-panel">
              <div className="table-header-row">
                <div className="table-heading-group">
                  <h4 className="section-title">Preparation Signals</h4>
                  <p className="section-note">
                    Motivational reinforcement and visible movement inside the tree.
                  </p>
                </div>
              </div>
              <div className="syllabus-insight-grid">
                {dashboard.insights.map((insight) => (
                  <article
                    key={insight.id}
                    className={`syllabus-insight-card tone-${insight.tone}`}
                  >
                    <strong>{insight.title}</strong>
                    <p>{insight.description}</p>
                  </article>
                ))}
              </div>
            </MotionCard>
          </div>
        </>
      ) : null}

      {activeTab === "tree" ? (
        <div className="syllabus-tree-layout">
          <MotionCard className="syllabus-panel syllabus-tree-panel">
            <SyllabusTreeWorkspace
              rootNode={rootNode}
              subjectNodes={subjectNodes}
              topicNodes={topicNodes}
              visibleTreeNodes={visibleTreeNodes}
              selectedNode={selectedNode}
              treeScope={normalizedTreeScope}
              activeScopeSubject={activeScopeSubject}
              onTreeScopeChange={handleTreeScopeChange}
              onSelectedNodeChange={handleSelectedNodeChange}
              onOpenFullscreen={() => setIsTreeFullscreenOpen(true)}
            />
          </MotionCard>

          <MotionCard className="syllabus-panel syllabus-detail-panel-shell">
            <SyllabusNodeDetailPanel node={selectedNode} />
          </MotionCard>
        </div>
      ) : null}

      <SyllabusTreeFullscreenModal
        isOpen={isTreeFullscreenOpen}
        onClose={() => setIsTreeFullscreenOpen(false)}
        rootNode={rootNode}
        subjectNodes={subjectNodes}
        topicNodes={topicNodes}
        visibleTreeNodes={visibleTreeNodes}
        selectedNode={selectedNode}
        treeScope={normalizedTreeScope}
        activeScopeSubject={activeScopeSubject}
        onTreeScopeChange={handleTreeScopeChange}
        onSelectedNodeChange={handleSelectedNodeChange}
      />

      {activeTab === "insights" ? (
        <div className="syllabus-overview-grid">
          <MotionCard className="syllabus-panel">
            <div className="table-header-row">
              <div className="table-heading-group">
                <h4 className="section-title">Motivation Layer</h4>
                <p className="section-note">
                  Strongest subject, fastest improving topic, and recently mastered momentum.
                </p>
              </div>
            </div>
            <div className="syllabus-insight-grid">
              <article className="syllabus-insight-card tone-mint">
                <strong>Strongest Subject</strong>
                <p>{dashboard.summary.strongestSubject}</p>
              </article>
              <article className="syllabus-insight-card tone-teal">
                <strong>Fastest Improving Topic</strong>
                <p>{dashboard.summary.fastestImprovingTopic}</p>
              </article>
              <article className="syllabus-insight-card tone-amber">
                <strong>Recently Mastered</strong>
                <p>{dashboard.summary.recentlyMasteredCount} topics mastered this month.</p>
              </article>
            </div>
          </MotionCard>

          <MotionCard className="syllabus-panel">
            <div className="table-header-row">
              <div className="table-heading-group">
                <h4 className="section-title">Tree Milestones</h4>
                <p className="section-note">
                  Calm visual reinforcement for long-range preparation and syllabus closure.
                </p>
              </div>
            </div>
            <div className="syllabus-milestone-list">
              {dashboard.insights.map((insight) => (
                <div key={insight.id} className={`syllabus-milestone-item tone-${insight.tone}`}>
                  <strong>{insight.title}</strong>
                  <p>{insight.description}</p>
                </div>
              ))}
            </div>
          </MotionCard>
        </div>
      ) : null}
    </section>
  );
}
