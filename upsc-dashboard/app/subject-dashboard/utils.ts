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

// ============================================================================
// NEW: Strict Derivation Helpers for UI (Requires 100% of children to be checked)
// ============================================================================

/**
 * Extracts all leaf (childless) UIDs specifically under a given parent node.
 */
export function getLeafUidsForNode(node: SubjectNode): string[] {
  if (!node.children || node.children.length === 0) {
    return [node.uid];
  }
  return node.children.flatMap((child) => getLeafUidsForNode(child));
}

/**
 * Returns true ONLY if 100% of the leaf nodes under this parent are in the checked set.
 */
export function isNodeStrictlyCompleted(
  node: SubjectNode,
  checkedUids: Set<string> | string[]
): boolean {
  const leafUids = getLeafUidsForNode(node);
  if (leafUids.length === 0) return false;

  const checkedSet = checkedUids instanceof Set ? checkedUids : new Set(checkedUids);
  
  // Every single child leaf must be marked as checked
  return leafUids.every((uid) => checkedSet.has(uid));
}

/**
 * Returns true ONLY if 100% of the leaf nodes under this parent have revision data.
 */
export function isNodeStrictlyRevised(
  node: SubjectNode,
  // Using 'any' here as a fallback; type this to your specific CompletionTime record if possible
  completionTimes: Record<string, any> 
): boolean {
  const leafUids = getLeafUidsForNode(node);
  if (leafUids.length === 0) return false;

  return leafUids.every((uid) => {
    const record = completionTimes[uid];
    if (!record) return false;

    // Checks if the leaf has either a valid revisions array or a revisedAt timestamp
    const hasRevisions = Array.isArray(record.revisions) && record.revisions.length > 0;
    const hasRevisedAt = record.revisedAt !== undefined && record.revisedAt !== null;

    return hasRevisions || hasRevisedAt;
  });
}