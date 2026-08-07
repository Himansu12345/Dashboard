import { memo } from "react";
import type {
  ChapterAttemptSummary,
  SubjectCompletionTimes,
  SubjectNode,
  SubjectNodeStatusMap,
} from "../types";
import { TreeNode } from "./TreeNode";

type TreeViewProps = {
  data: SubjectNode[];
  isSmartModeEnabled: boolean;
  checkedUids: Set<string>;
  completionTimes: SubjectCompletionTimes;
  nodeStatuses: SubjectNodeStatusMap;
  effectiveCollapsed: Set<string>;
  indeterminateUids: Set<string>;
  starredUids: Set<string>;
  notes: Record<string, string>;
  visibleUids: Set<string>;
  chapterUids: Set<string>;
  chapterAttemptSummaries: Record<string, ChapterAttemptSummary>;
  nodeRenderVersions: Map<string, number>;
  treeRenderVersion: number;
  onCheck: (uid: string, checked: boolean) => void;
  onLogRevision: (uid: string) => void;
  onOpenChapterStats: (uid: string) => void;
  onToggleCollapse: (uid: string) => void;
  onToggleNote: (uid: string) => void;
  onToggleStar: (uid: string) => void;

  // 🛡️ PRO FIX: Allow TreeView to pass Vault props down to TreeNode
  insightsMap?: Record<string, any[]>;
  onOpenInsight?: (uid: string, label: string) => void;
};

// ⚡ PRO POWER FIX: Memoize the entire tree wrapper to completely block modal render poisoning
export const TreeView = memo(function TreeView(props: TreeViewProps) {
  return (
    <section className="tree-shell">
      <div className="tree-shell-head">
        <div>
          <p className="tree-shell-kicker">Knowledge Tree</p>
          <h2 className="tree-shell-title">
            {props.isSmartModeEnabled ? "Smart Notes" : "Structured Notes"}
          </h2>
        </div>

        <p className="tree-shell-note">
          {props.isSmartModeEnabled
            ? "Smart mode reframes the same tree into faster recall-oriented notes."
            : "Expand topics to review articles, subtopics, notes, and revision status."}
        </p>
      </div>

      <div className="tree">
        <ul className="tnodes root">
          {props.data.map((node) => (
            <TreeNode key={node.uid} node={node} {...props} />
          ))}
        </ul>
      </div>
    </section>
  );
});
