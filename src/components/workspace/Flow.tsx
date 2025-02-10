import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  OnNodeDrag,
} from "@xyflow/react";

import { useShallow } from "zustand/react/shallow";
import { useCallback, useEffect } from "react";

import useWorkspaceStore, { useLayoutOptions } from "@/stores/workspace";
import { nodeTypes } from "./nodes";
import { edgeTypes, defaultEdgeOptions } from "./edges";
import useAutoLayout from "@/hooks/useAutoLayout";
import { Node, Edge, WorkspaceState } from "./types";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2 } from "lucide-react";
import { isFeatureEnabled } from "@/config/features";

function FlowContent() {
  const validation = useWorkspaceStore((state) => state.validation);
  const { undo, redo, canUndo, canRedo } = useWorkspaceStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      canUndo: state.canUndo,
      canRedo: state.canRedo,
    }))
  );
  // Determine background color based on validation state
  const bgColor = validation.isValid ? "#ccc" : "rgba(239, 68, 68, 0.2)"; // red-500 with opacity

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (
        canRedo() &&
        event.key === "z" &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey
      ) {
        redo();
      } else if (
        canUndo() &&
        event.key === "z" &&
        (event.ctrlKey || event.metaKey)
      ) {
        undo();
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [undo, redo]);

  return (
    <>
      <Background color={bgColor} variant={BackgroundVariant.Dots} />
      <Controls />
      <div className="absolute z-50 top-4 left-4 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl/⌘+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl/⌘+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

function Flow() {
  const layoutOptions = useLayoutOptions();
  const isAutoLayoutEnabled = isFeatureEnabled("autoLayout");

  const selector = (state: WorkspaceState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    takeSnapshot: state.takeSnapshot,
    updateEdgeHover: state.updateEdgeHover,
  });

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
    takeSnapshot,
    updateEdgeHover,
  } = useWorkspaceStore(useShallow(selector));

  const { fitView } = useReactFlow();

  useAutoLayout({
    getNodes: () => nodes,
    getEdges: () => edges,
    setNodes,
    setEdges,
    fitView,
    enabled: isAutoLayoutEnabled && (layoutOptions?.auto ?? false),
  });

  //onEdgeMouseEnter
  //(event: React.MouseEvent, edge: Edge)
  const onEdgeMouseEnter = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      updateEdgeHover(edge.id, true);
    },
    [updateEdgeHover]
  );

  const onEdgeMouseLeave = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      updateEdgeHover(edge.id, false);
    },
    [updateEdgeHover]
  );

  const onNodeDragStart: OnNodeDrag = useCallback(() => {
    // 👇 make dragging a node undoable
    takeSnapshot();
    // 👉 you can place your event handlers here
  }, [takeSnapshot]);

  return (
    <ReactFlow
      nodeOrigin={[0.5, 0.5]}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStart={onNodeDragStart}
      onEdgeMouseEnter={onEdgeMouseEnter}
      onEdgeMouseLeave={onEdgeMouseLeave}
      fitView
      nodesDraggable={!isAutoLayoutEnabled || !layoutOptions?.auto}
    >
      <FlowContent />
    </ReactFlow>
  );
}

export default function FlowWithProvider() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
