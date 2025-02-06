import { useEffect, useRef } from "react";
import { type Edge, type Node } from "@/components/workspace/types";
import { getSourceHandlePosition, getTargetHandlePosition } from "@/lib/utils";
import { layoutAlgorithm } from "@/lib/layout";
import { useLayoutOptions } from "@/stores/workspace";

type StoreSelectors = {
  getNodes: () => Node[];
  getEdges: () => Edge[];
  setNodes: (nodes: Node[], isAutoLayout?: boolean) => void;
  setEdges: (edges: Edge[], isAutoLayout?: boolean) => void;
  fitView: () => void;
};

function compareNodes(xs: Node[], ys: Node[]) {
  if (xs.length !== ys.length) return false;

  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const y = ys[i];

    if (!y) return false;

    // Skip during user interactions unless expansion changed
    if (x.resizing || x.dragging) return true;

    // Check expansion state change
    if (x.data.config?.expanded !== y.data.config?.expanded) {
      return false;
    }

    // Only check measurements if they exist
    if (x.measured && y.measured) {
      if (
        x.measured.width !== y.measured.width ||
        x.measured.height !== y.measured.height
      ) {
        return false;
      }
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
    // Skip if no layout options or auto layout is disabled
    if (!layoutOptions?.auto) {
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
      !prevLayoutOptionsRef.current ||
      !layoutOptions ||
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

      // Ensure we have valid layout options
      const currentLayoutOptions = layoutOptions || {
        direction: "TB",
        spacing: [50, 50],
        auto: true,
      };

      const result = await layoutAlgorithm(
        nextNodes,
        nextEdges,
        currentLayoutOptions
      );

      // Start the animation
      const cleanup = (result as any).animate(
        // Frame update callback
        (currentNodes: Node[]) => {
          setNodes(
            currentNodes.map((node) => ({
              ...node,
              style: { ...node.style, opacity: 1 },
              sourcePosition: getSourceHandlePosition(
                currentLayoutOptions.direction
              ),
              targetPosition: getTargetHandlePosition(
                currentLayoutOptions.direction
              ),
            })),
            false
          );
        },
        // Completion callback
        (finalNodes: Node[], layoutedEdges: Edge[]) => {
          setNodes(
            finalNodes.map((node) => ({
              ...node,
              style: { ...node.style, opacity: 1 },
              sourcePosition: getSourceHandlePosition(
                currentLayoutOptions.direction
              ),
              targetPosition: getTargetHandlePosition(
                currentLayoutOptions.direction
              ),
            })),
            false
          );
          setEdges(layoutedEdges, false);
        },
        // Pass fitView to the animation
        fitView
      );

      return cleanup;
    };

    runLayout();
  }, [layoutOptions, getNodes, getEdges, setNodes, setEdges, fitView]);
}
