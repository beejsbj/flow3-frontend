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
import { edgeTypes } from "./edges";

function FlowContent() {
  //   const innerNodes = useNodes();
  //   const innerEdges = useEdges();

  //   console.log("Inner nodes:", innerNodes);
  //   console.log("Inner edges:", innerEdges);

  return (
    <>
      <Background color="#ccc" variant={BackgroundVariant.Dots} />
      <MiniMap />
      <Controls />
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
