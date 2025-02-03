import { useCallback, useEffect, useState } from "react";
import { Edge, Node } from "@/components/workspace/types";
import useWorkspaceStore from "@/stores/workspace";
import { useShallow } from "zustand/react/shallow";

type UseUndoRedoOptions = {
  maxHistorySize: number;
  enableShortcuts: boolean;
};

type UseUndoRedo = (options?: UseUndoRedoOptions) => {
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

type HistoryItem = {
  nodes: Node[];
  edges: Edge[];
};

const defaultOptions: UseUndoRedoOptions = {
  maxHistorySize: 100,
  enableShortcuts: true,
};

export const useUndoRedo: UseUndoRedo = ({
  maxHistorySize = defaultOptions.maxHistorySize,
  enableShortcuts = defaultOptions.enableShortcuts,
} = defaultOptions) => {
  const [past, setPast] = useState<HistoryItem[]>([]);
  const [future, setFuture] = useState<HistoryItem[]>([]);

  // Use workspace store instead of ReactFlow hooks
  const { nodes, edges, setNodes, setEdges } = useWorkspaceStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
    }))
  );

  const takeSnapshot = useCallback(() => {
    setPast((past) => [
      ...past.slice(past.length - maxHistorySize + 1, past.length),
      { nodes, edges },
    ]);
    setFuture([]);
  }, [nodes, edges, maxHistorySize]);

  const undo = useCallback(() => {
    const pastState = past[past.length - 1];

    if (pastState) {
      setPast((past) => past.slice(0, past.length - 1));
      setFuture((future) => [...future, { nodes, edges }]);
      setNodes(pastState.nodes);
      setEdges(pastState.edges);
    }
  }, [setNodes, setEdges, nodes, edges, past]);

  const redo = useCallback(() => {
    const futureState = future[future.length - 1];

    if (futureState) {
      setFuture((future) => future.slice(0, future.length - 1));
      setPast((past) => [...past, { nodes, edges }]);
      setNodes(futureState.nodes);
      setEdges(futureState.edges);
    }
  }, [setNodes, setEdges, nodes, edges, future]);

  useEffect(() => {
    if (!enableShortcuts) {
      return;
    }

    const keyDownHandler = (event: KeyboardEvent) => {
      if (
        event.key === "z" &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey
      ) {
        redo();
      } else if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
        undo();
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [undo, redo, enableShortcuts]);

  return {
    undo,
    redo,
    takeSnapshot,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
};
