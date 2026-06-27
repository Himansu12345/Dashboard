import type { RawSubjectNode, SubjectNode } from "./types";

export function initSubjectData(
  nodes: RawSubjectNode[],
  prefix = "root",
): SubjectNode[] {
  return nodes.map((node, index) => {
    const uid = `${prefix}-${index}`;
    return {
      ...node,
      uid,
      children: node.children ? initSubjectData(node.children, uid) : undefined,
    };
  });
}

export function buildNodeMap(nodes: SubjectNode[]) {
  const map = new Map<string, SubjectNode>();

  const traverse = (items: SubjectNode[]) => {
    for (const item of items) {
      map.set(item.uid, item);
      if (item.children) traverse(item.children);
    }
  };

  traverse(nodes);
  return map;
}

export function collectParentUids(nodes: SubjectNode[]) {
  const set = new Set<string>();

  const traverse = (items: SubjectNode[]) => {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        set.add(item.uid);
        traverse(item.children);
      }
    }
  };

  traverse(nodes);
  return set;
}

export function collectLeafUids(nodes: SubjectNode[]) {
  const set = new Set<string>();

  const traverse = (items: SubjectNode[]) => {
    for (const item of items) {
      if (!item.children || item.children.length === 0) {
        set.add(item.uid);
      } else {
        traverse(item.children);
      }
    }
  };

  traverse(nodes);
  return set;
}

export function applyPriorityOverrides(
  nodes: SubjectNode[],
  overrides: Record<string, string>,
): SubjectNode[] {
  return nodes.map((node) => ({
    ...node,
    p: node.id && overrides[node.id] ? overrides[node.id] : node.p,
    children: node.children
      ? applyPriorityOverrides(node.children, overrides)
      : undefined,
  }));
}
