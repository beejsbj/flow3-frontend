import { getIncomers } from "@xyflow/react";
import {
  type Edge,
  type Node,
  type LayoutOptions,
  type Direction,
} from "@/types/types";
import { type HierarchyPointNode, stratify, tree } from "d3-hierarchy";
import { timer } from "d3-timer";

// the layout direction (T = top, R = right, B = bottom, L = left, TB = top to bottom, ...)

export type LayoutAlgorithm = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
) => Promise<{ nodes: Node[]; edges: Edge[] }>;

type NodeWithPosition = Node & { x: number; y: number };

// D3 Hierarchy doesn't support layouting in different directions, but we can
// swap the coordinates around in different ways to get the same effect.
const getPosition = (x: number, y: number, direction: Direction) => {
  switch (direction) {
    case "TB":
      return { x, y };
    case "LR":
      return { x: y, y: x };
  }
};

// Initialize the tree layout (see https://observablehq.com/@d3/tree for examples)
const layout = tree<NodeWithPosition>()
  // By default, d3 hierarchy spaces nodes that do not share a common parent quite
  // far apart. We think it looks a bit nicer (and more similar to the other layouting
  // algorithms) if we fix that distance to a uniform `1`.
  .separation(() => 1);

// D3 Hierarchy expects a single root node in a flow. Because we can't always
// guarantee that, we create a fake root node here and will make sure any real
// nodes without an incoming edge will get connected to this fake root node.
const rootNode = {
  id: "d3-hierarchy-root",
  x: 0,
  y: 0,
  position: { x: 0, y: 0 },
  data: {},
};

export const ANIMATION_DURATION = 300;

type AnimationTransition = {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  node: Node;
};

export type LayoutResult = {
  nodes: Node[];
  edges: Edge[];
  animate: (
    onFrame: (nodes: Node[]) => void,
    onComplete: (nodes: Node[], edges: Edge[]) => void,
    fitView: (options?: { padding?: number; duration?: number }) => void
  ) => () => void;
};

const d3HierarchyLayout: LayoutAlgorithm = async (
  nodes,
  edges,
  options
): Promise<LayoutResult> => {
  const isHorizontal = options.direction === "LR";

  const initialNodes = [] as NodeWithPosition[];
  let maxNodeWidth = 0;
  let maxNodeHeight = 0;

  for (const node of nodes) {
    const nodeWithPosition = { ...node, ...node.position };

    initialNodes.push(nodeWithPosition);
    maxNodeWidth = Math.max(maxNodeWidth, node.measured?.width ?? 0);
    maxNodeHeight = Math.max(maxNodeHeight, node.measured?.height ?? 0);
  }

  // When the layout is horizontal, we swap the width and height measurements we
  // pass to the layout algorithm so things stay spaced out nicely. By adding the
  // amount of spacing to each size we can fake padding between nodes.
  const nodeSize = isHorizontal
    ? [maxNodeHeight + options.spacing[1], maxNodeWidth + options.spacing[0]]
    : [maxNodeWidth + options.spacing[0], maxNodeHeight + options.spacing[1]];
  layout.nodeSize(nodeSize as [number, number]);

  const getParentId = (node: Node) => {
    if (node.id === rootNode.id) {
      return undefined;
    }

    const incomers = getIncomers(node, nodes, edges);

    // If there are no incoming edges, we say this node is connected to the fake
    // root node to prevent having multiple root nodes in the layout. If there
    // are multiple incoming edges, only the first one will be used!
    return incomers[0]?.id || rootNode.id;
  };

  const hierarchy = stratify<NodeWithPosition>()
    .id((d) => d.id)
    .parentId(getParentId)([rootNode, ...initialNodes]);

  // We create a map of the laid out nodes here to avoid multiple traversals when
  // looking up a node's position later on.
  const root = layout(hierarchy);
  const layoutNodes = new Map<string, HierarchyPointNode<NodeWithPosition>>();
  for (const node of root) {
    layoutNodes.set(node.id!, node);
  }

  const nextNodes = nodes.map((node) => {
    const { x, y } = layoutNodes.get(node.id)!;
    const position = getPosition(x, y, options.direction);
    // Since we're using nodeOrigin={[0.5, 0.5]} in ReactFlow, we don't need to offset
    // the position anymore as the node's origin is already at its center
    return { ...node, position };
  });

  const transitions: AnimationTransition[] = nodes.map((node) => {
    const { x, y } = layoutNodes.get(node.id)!;
    const targetPosition = getPosition(x, y, options.direction);

    return {
      id: node.id,
      from: node.position,
      to: targetPosition,
      node,
    };
  });

  const animate = (
    onFrame: (nodes: Node[]) => void,
    onComplete: (nodes: Node[], edges: Edge[]) => void,
    fitView: (options?: { padding?: number; duration?: number }) => void
  ) => {
    // Start animation timer that runs on each frame
    const t = timer((elapsed: number) => {
      // Calculate animation progress (0 to 1)
      const progress = elapsed / ANIMATION_DURATION;

      // Check if animation is complete
      if (progress >= 1) {
        // Final position
        const finalNodes = transitions.map(({ node, to }) => ({
          ...node,
          position: to,
        }));

        onComplete(finalNodes, edges);
        // Final fitView with normal padding
        fitView({ padding: 0.2, duration: 100 });
        t.stop();
        return;
      }

      // Calculate intermediate positions for current frame
      const currentNodes = transitions.map(({ node, from, to }) => ({
        ...node,
        position: {
          x: from.x + (to.x - from.x) * progress,
          y: from.y + (to.y - from.y) * progress,
        },
      }));

      // Update view with current frame
      onFrame(currentNodes);
      // Keep view zoomed out during animation
      fitView({ padding: 1, duration: 50 });
    });

    // Return cleanup function to stop animation if needed
    return () => t.stop();
  };

  return {
    nodes: nextNodes,
    edges,
    animate,
  };
};

export const layoutAlgorithm = d3HierarchyLayout;
