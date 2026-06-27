import type { Edge, Node } from "reactflow";
import { MarkerType } from "reactflow";
import type { SyllabusNodeData, SyllabusMasteryState } from "@/types/syllabus";

export function getMasteryTone(state: SyllabusMasteryState): string {
  if (state === "mastered") return "mastered";
  if (state === "improving") return "improving";
  if (state === "weak") return "weak";
  return "untouched";
}

export function getMasteryLabel(state: SyllabusMasteryState): string {
  if (state === "mastered") return "Mastered";
  if (state === "improving") return "Improving";
  if (state === "weak") return "Weak";
  return "Untouched";
}

interface GraphNodeData {
  node: SyllabusNodeData;
  isSelected: boolean;
}

interface SyllabusGraphLayout {
  rootX: number;
  subjectX: number;
  topicX: number;
  startY: number;
  subjectGap: number;
  topicGap: number;
}

export function getSyllabusGraphLayout(containerWidth: number): SyllabusGraphLayout {
  if (containerWidth <= 640) {
    return {
      rootX: 16,
      subjectX: 300,
      topicX: 620,
      startY: 24,
      subjectGap: 104,
      topicGap: 88,
    };
  }

  if (containerWidth <= 960) {
    return {
      rootX: 24,
      subjectX: 340,
      topicX: 720,
      startY: 30,
      subjectGap: 118,
      topicGap: 94,
    };
  }

  return {
    rootX: 36,
    subjectX: 380,
    topicX: 820,
    startY: 40,
    subjectGap: 132,
    topicGap: 102,
  };
}

export function buildSyllabusGraph(
  nodes: SyllabusNodeData[],
  selectedNodeId: string | null,
  layout: SyllabusGraphLayout,
): {
  graphNodes: Array<Node<GraphNodeData>>;
  graphEdges: Edge[];
} {
  const rootNode = nodes.find((node) => node.level === "root") || null;
  const subjectNodes = nodes.filter((node) => node.level === "subject");
  const topicsBySubject = new Map<string, SyllabusNodeData[]>();
  for (const node of nodes) {
    if (node.level !== "topic" || !node.parentId) continue;
    const topics = topicsBySubject.get(node.parentId);
    if (topics) topics.push(node);
    else topicsBySubject.set(node.parentId, [node]);
  }

  const graphNodes: Array<Node<GraphNodeData>> = [];
  const graphEdges: Edge[] = [];
  let cursorY = layout.startY;

  subjectNodes.forEach((subjectNode) => {
    const subjectTopics = topicsBySubject.get(subjectNode.id) || [];
    const branchHeight = Math.max(170, Math.max(0, subjectTopics.length - 1) * layout.topicGap + 110);
    const topicStartY = cursorY + 8;
    const subjectY = cursorY + branchHeight / 2 - 40;

    graphNodes.push({
      id: subjectNode.id,
      type: "masteryNode",
      data: { node: subjectNode, isSelected: selectedNodeId === subjectNode.id },
      position: {
        x: layout.subjectX,
        y: subjectY,
      },
      draggable: false,
      selectable: true,
    });

    if (rootNode) {
      graphEdges.push({
        id: `${rootNode.id}-${subjectNode.id}`,
        source: rootNode.id,
        target: subjectNode.id,
        type: "smoothstep",
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: {
          stroke: "rgba(118, 211, 255, 0.38)",
          strokeWidth: 2,
        },
      });
    }

    subjectTopics.forEach((topicNode, topicIndex) => {
      graphNodes.push({
        id: topicNode.id,
        type: "masteryNode",
        data: { node: topicNode, isSelected: selectedNodeId === topicNode.id },
        position: {
          x: layout.topicX,
          y: topicStartY + topicIndex * layout.topicGap,
        },
        draggable: false,
        selectable: true,
      });

      graphEdges.push({
        id: `${subjectNode.id}-${topicNode.id}`,
        source: subjectNode.id,
        target: topicNode.id,
        type: "smoothstep",
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
        style: {
          stroke:
            topicNode.masteryState === "mastered"
              ? "rgba(98, 245, 182, 0.48)"
              : topicNode.masteryState === "improving"
                ? "rgba(255, 214, 107, 0.46)"
                : topicNode.masteryState === "weak"
                  ? "rgba(255, 107, 127, 0.42)"
                  : "rgba(128, 154, 187, 0.24)",
          strokeWidth: 1.7,
        },
      });
    });

    cursorY += branchHeight + layout.subjectGap;
  });

  if (rootNode) {
    const firstSubject = graphNodes.find((node) => node.id !== rootNode.id);
    const lastSubject = [...graphNodes].reverse().find((node) => node.data.node.level === "subject");
    const topY = firstSubject ? firstSubject.position.y : layout.startY;
    const bottomY = lastSubject ? lastSubject.position.y : cursorY;
    graphNodes.unshift({
      id: rootNode.id,
      type: "masteryNode",
      data: { node: rootNode, isSelected: selectedNodeId === rootNode.id },
      position: {
        x: layout.rootX,
        y: topY + (bottomY - topY) / 2,
      },
      draggable: false,
      selectable: true,
    });
  }

  return { graphNodes, graphEdges };
}
