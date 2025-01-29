import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Panel,
  useReactFlow,
} from "@xyflow/react";
import { Switch } from "@/components/ui/switch";

import { useShallow } from "zustand/react/shallow";

import useWorkspaceStore, { useLayoutOptions } from "@/stores/workspace";
import { nodeTypes } from "./nodes";
import { edgeTypes, defaultEdgeOptions } from "./edges";
import { DevTools } from "@/components/devtools";
import useAutoLayout from "@/hooks/useAutoLayout";
import { Node, Edge, WorkspaceState } from "./types";

function FlowContent() {
  const validation = useWorkspaceStore((state) => state.validation);

  // Determine background color based on validation state
  const bgColor = validation.isValid ? "#ccc" : "rgba(239, 68, 68, 0.2)"; // red-500 with opacity

  return (
    <>
      <Background color={bgColor} variant={BackgroundVariant.Dots} />
      <MiniMap />
      <Controls />
      {/* <DevTools /> */}
    </>
  );
}

// Create a new component that will use the ReactFlow hooks
function FlowWithAutoLayout({
  nodes,
  edges,
  setNodes,
  setEdges,
}: {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}) {
  const { fitView } = useReactFlow();

  useAutoLayout({
    getNodes: () => nodes,
    getEdges: () => edges,
    setNodes,
    setEdges,
    fitView,
  });

  return null;
}

export default function Flow() {
  const layoutOptions = useLayoutOptions();
  const selector = (state: WorkspaceState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
  });

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
  } = useWorkspaceStore(useShallow(selector));

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodesDraggable={layoutOptions?.auto === false}
      >
        <FlowContent />
        <FlowWithAutoLayout
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
        />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
