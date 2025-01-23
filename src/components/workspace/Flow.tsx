import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from "@xyflow/react";

import { useShallow } from "zustand/react/shallow";

import useWorkspaceStore from "@/stores/workspace";

import { nodeTypes } from "./nodes";
import { edgeTypes, defaultEdgeOptions } from "./edges";
import { DevTools } from "@/components/devtools";

function FlowContent() {
  const validation = useWorkspaceStore((state) => state.validation);

  // Determine background color based on validation state
  const bgColor = validation.isValid ? "#ccc" : "rgba(239, 68, 68, 0.2)"; // red-500 with opacity

  return (
    <>
      <Background color={bgColor} variant={BackgroundVariant.Dots} />
      <MiniMap />
      <Controls />
      <DevTools />
    </>
  );
}

export default function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useWorkspaceStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        onConnect: state.onConnect,
      }))
    );

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
      >
        <FlowContent />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
