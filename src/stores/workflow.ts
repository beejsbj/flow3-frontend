import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { nodeRegistry } from "@/components/workspace/nodes/registry";

import { initialNodes } from "@/components/workspace/nodes";
import { initialEdges } from "@/components/workspace/edges";

import {
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";

type WorkflowState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (type: string) => void;
};

const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  addNode: (type) => {
    const position = { x: 0, y: 0 };
    const newNode = nodeRegistry.createNodeFromDefinition(type, position);
    if (!newNode) return;

    set({ nodes: [...get().nodes, newNode] });
  },
}));

export default useWorkflowStore;

// Convenience exports for common selectors
// export const useNodes = () => useWorkflowStore((state) => state.nodes);
// export const useEdges = () => useWorkflowStore((state) => state.edges);
export const useAddNode = () => useWorkflowStore((state) => state.addNode);
