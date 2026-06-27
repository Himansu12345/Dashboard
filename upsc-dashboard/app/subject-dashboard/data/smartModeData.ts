import type { RawSubjectNode } from "../types";

type SmartModeOptions = {
  subjectName: string;
};

function buildSmartLabel(
  label: string,
  depth: number,
  hasChildren: boolean,
  subjectName: string,
): string {
  const normalizedLabel = label.trim();
  const focusTitle =
    depth === 0
      ? "Smart Goal"
      : depth === 1
        ? "Smart Lens"
        : hasChildren
          ? "Smart Map"
          : "Smart Recall";

  const actionLine =
    depth === 0
      ? `1. Lock the big ${subjectName} theme before drilling into subtopics.`
      : depth === 1
        ? "1. Connect the core concept with its likely PYQ angle."
        : hasChildren
          ? "1. Scan the branch quickly and identify the governing pattern."
          : `1. Core fact: ${normalizedLabel}`;

  const revisionLine = hasChildren
    ? "2. Revise in sequence so linked concepts stay connected."
    : "2. Recall one keyword, one trap, and one example in under 10 seconds.";

  const trapLine = hasChildren
    ? "3. Mark exceptions, contrasts, and high-confusion areas before practice."
    : "3. Convert this into a quick self-test before moving ahead.";

  return `${normalizedLabel}\n\n${focusTitle}:\n${actionLine}\n${revisionLine}\n${trapLine}`;
}

function transformNode(
  node: RawSubjectNode,
  depth: number,
  subjectName: string,
): RawSubjectNode {
  const children = node.children?.map((child) =>
    transformNode(child, depth + 1, subjectName),
  );

  return {
    ...node,
    label: buildSmartLabel(node.label, depth, Boolean(children?.length), subjectName),
    children,
  };
}

export function buildSmartModeData(
  nodes: RawSubjectNode[],
  options: SmartModeOptions,
): RawSubjectNode[] {
  return nodes.map((node) => transformNode(node, 0, options.subjectName));
}
