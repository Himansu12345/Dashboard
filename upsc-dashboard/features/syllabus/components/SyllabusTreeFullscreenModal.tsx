"use client";

import FullscreenChartModal from "@/components/charts/FullscreenChartModal";
import SyllabusNodeDetailPanel from "@/features/syllabus/components/SyllabusNodeDetailPanel";
import SyllabusTreeWorkspace from "@/features/syllabus/components/SyllabusTreeWorkspace";
import type { SyllabusNodeData } from "@/types/syllabus";

type TreeScope = "all" | string;

interface SyllabusTreeFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  rootNode: SyllabusNodeData | null;
  subjectNodes: SyllabusNodeData[];
  topicNodes: SyllabusNodeData[];
  visibleTreeNodes: SyllabusNodeData[];
  selectedNode: SyllabusNodeData | null;
  treeScope: TreeScope;
  activeScopeSubject: SyllabusNodeData | null;
  onTreeScopeChange: (scope: TreeScope) => void;
  onSelectedNodeChange: (node: SyllabusNodeData | null) => void;
}

export default function SyllabusTreeFullscreenModal({
  isOpen,
  onClose,
  rootNode,
  subjectNodes,
  topicNodes,
  visibleTreeNodes,
  selectedNode,
  treeScope,
  activeScopeSubject,
  onTreeScopeChange,
  onSelectedNodeChange,
}: SyllabusTreeFullscreenModalProps) {
  return (
    <FullscreenChartModal
      isOpen={isOpen}
      title="UPSC Syllabus Progress Tree"
      subtitle="Fullscreen tree workspace for a clearer mastery map and a more comfortable branch view."
      onClose={onClose}
    >
      <div className="syllabus-tree-fullscreen-layout">
        <section className="syllabus-tree-fullscreen-main">
          <SyllabusTreeWorkspace
            rootNode={rootNode}
            subjectNodes={subjectNodes}
            topicNodes={topicNodes}
            visibleTreeNodes={visibleTreeNodes}
            selectedNode={selectedNode}
            treeScope={treeScope}
            activeScopeSubject={activeScopeSubject}
            isFullscreen
            onTreeScopeChange={onTreeScopeChange}
            onSelectedNodeChange={onSelectedNodeChange}
          />
        </section>

        <aside className="syllabus-tree-fullscreen-side">
          <SyllabusNodeDetailPanel node={selectedNode} />
        </aside>
      </div>
    </FullscreenChartModal>
  );
}
