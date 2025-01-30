import { useEffect, useRef } from "react";
import { type Edge, type Node } from "@/components/workspace/types";
import { getSourceHandlePosition, getTargetHandlePosition } from "@/lib/utils";
import { layoutAlgorithm } from "@/lib/layout";
import { useLayoutOptions } from "@/stores/workspace";

type StoreSelectors = {
  getNodes: () => Node[];
  getEdges: () => Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  fitView: () => void;
};

function compareNodes(xs: Node[], ys: Node[]) {
  if (xs.length !== ys.length) return false;

  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const y = ys[i];

    if (!y) return false;
    if (x.resizing || x.dragging) return true;
    if (!x.measured || !y.measured) return false;
    if (
      x.measured.width !== y.measured.width ||
      x.measured.height !== y.measured.height
    ) {
      return false;
    }
  }
  return true;
}

function compareEdges(xs: Edge[], ys: Edge[]) {
  if (xs.length !== ys.length) return false;

  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const y = ys[i];

    if (x.source !== y.source || x.target !== y.target) return false;
    if (x?.sourceHandle !== y?.sourceHandle) return false;
    if (x?.targetHandle !== y?.targetHandle) return false;
  }

  return true;
}

export default function useAutoLayout({
  getNodes,
  getEdges,
  setNodes,
  setEdges,
  fitView,
}: StoreSelectors) {
  const layoutOptions = useLayoutOptions();
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const prevLayoutOptionsRef = useRef(layoutOptions);

  useEffect(() => {
    if (!layoutOptions.auto) {
      return;
    }

    const nodes = getNodes();
    const edges = getEdges();

    const areNodesMeasured = nodes.every((node) => node.measured);
    if (!areNodesMeasured) {
      return;
    }

    // Check if layout options have changed
    const layoutChanged =
      prevLayoutOptionsRef.current.direction !== layoutOptions.direction ||
      prevLayoutOptionsRef.current.spacing[0] !== layoutOptions.spacing[0] ||
      prevLayoutOptionsRef.current.spacing[1] !== layoutOptions.spacing[1];

    const nodesChanged = !compareNodes(nodes, nodesRef.current);
    const edgesChanged = !compareEdges(edges, edgesRef.current);

    // Trigger layout if either layout options changed OR nodes/edges changed
    if (!layoutChanged && !nodesChanged && !edgesChanged) {
      return;
    }

    nodesRef.current = nodes;
    edgesRef.current = edges;
    prevLayoutOptionsRef.current = layoutOptions;

    if (nodes.length === 0) {
      return;
    }

    const runLayout = async () => {
      const nextNodes = nodes.map((node) => ({ ...node }));
      const nextEdges = edges.map((edge) => ({ ...edge }));

      const result = await layoutAlgorithm(nextNodes, nextEdges, layoutOptions);

      // Start the animation
      const cleanup = result.animate(
        // Frame update callback
        (currentNodes) => {
          setNodes(
            currentNodes.map((node) => ({
              ...node,
              style: { ...node.style, opacity: 1 },
              sourcePosition: getSourceHandlePosition(layoutOptions.direction),
              targetPosition: getTargetHandlePosition(layoutOptions.direction),
            }))
          );
        },
        // Completion callback
        (finalNodes, layoutedEdges) => {
          setNodes(
            finalNodes.map((node) => ({
              ...node,
              style: { ...node.style, opacity: 1 },
              sourcePosition: getSourceHandlePosition(layoutOptions.direction),
              targetPosition: getTargetHandlePosition(layoutOptions.direction),
            }))
          );
          setEdges(layoutedEdges);
        },
        // Pass fitView to the animation
        fitView
      );

      return cleanup;
    };

    runLayout();
  }, [layoutOptions, getNodes, getEdges, setNodes, setEdges, fitView]);
}
