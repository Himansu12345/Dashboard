"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import MasteryNode from "@/features/syllabus/components/MasteryNode";
import {
  buildSyllabusGraph,
  getMasteryTone,
  getSyllabusGraphLayout,
} from "@/features/syllabus/syllabusTreeUtils";
import type { SyllabusNodeData } from "@/types/syllabus";

interface SyllabusTreeGraphProps {
  nodes: SyllabusNodeData[];
  selectedNodeId: string | null;
  onSelectNode: (node: SyllabusNodeData) => void;
  isFullscreen?: boolean;
}

const nodeTypes = {
  masteryNode: MasteryNode,
};

function SyllabusTreeGraphInner({
  nodes,
  selectedNodeId,
  onSelectNode,
  isFullscreen = false,
}: SyllabusTreeGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(1120);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const updateWidth = () => {
      setContainerWidth(Math.max(320, Math.round(element.clientWidth)));
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const layout = useMemo(
    () => getSyllabusGraphLayout(containerWidth),
    [containerWidth],
  );
  const { graphNodes, graphEdges } = useMemo(
    () => buildSyllabusGraph(nodes, selectedNodeId, layout),
    [layout, nodes, selectedNodeId],
  );

  return (
    <div
      ref={containerRef}
      className={`syllabus-tree-canvas ${isFullscreen ? "is-fullscreen" : ""}`}
    >
      <ReactFlow
        nodes={graphNodes}
        edges={graphEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: isFullscreen
            ? containerWidth <= 680
              ? 0.18
              : 0.14
            : containerWidth <= 680
              ? 0.26
              : 0.2,
          maxZoom: isFullscreen ? 1.22 : 1.1,
        }}
        minZoom={
          isFullscreen
            ? containerWidth <= 680
              ? 0.26
              : 0.42
            : containerWidth <= 680
              ? 0.22
              : 0.35
        }
        maxZoom={isFullscreen ? 1.9 : 1.6}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        panOnDrag
        zoomOnPinch
        zoomOnScroll={false}
        preventScrolling={false}
        onNodeClick={(_event, node) => onSelectNode(node.data.node)}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(148,205,255,0.08)" gap={20} size={1} />
        <Controls className="syllabus-tree-controls" showInteractive={false} />
        <MiniMap
          nodeColor={(node) => getMiniMapColor(node.data?.node)}
          nodeStrokeWidth={2}
          pannable
          zoomable
          className="syllabus-tree-minimap"
        />
        <Panel position="top-left" className="syllabus-tree-panel-note">
          Drag to pan. Pinch or use controls to zoom. Tap nodes for mastery diagnostics.
        </Panel>
      </ReactFlow>
    </div>
  );
}

function getMiniMapColor(node: SyllabusNodeData | undefined): string {
  if (!node) return "rgba(128,154,187,0.4)";
  const tone = getMasteryTone(node.masteryState);
  if (tone === "mastered") return "#63d7a3";
  if (tone === "improving") return "#f5d36b";
  if (tone === "weak") return "#ff6b7f";
  return "#7087a1";
}

export default function SyllabusTreeGraph(props: SyllabusTreeGraphProps) {
  return (
    <ReactFlowProvider>
      <SyllabusTreeGraphInner {...props} />
    </ReactFlowProvider>
  );
}
