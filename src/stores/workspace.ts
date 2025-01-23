import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { nodeRegistry } from "@/components/workspace/nodes/registry";
import {
  type WorkspaceState,
  type Node,
  type Workspace,
  type WorkspaceConfig,
  type NodeValidation,
  type WorkspaceValidation,
} from "@/components/workspace/types";
import { subscribeWithSelector } from "zustand/middleware";

const useWorkspaceStore = create(
  subscribeWithSelector<WorkspaceState>((set, get) => ({
    // Metadata
    id: "", // Will be set when loading a workspace
    name: "",
    description: "",
    config: {
      layout: {
        direction: "vertical",
      },
    },
    lastModified: new Date(),

    // Content state - initialize as empty arrays instead of static data
    nodes: [],
    edges: [],

    // Add validation state
    validation: {
      isValid: true,
      errors: [],
    },

    // Add validate method
    validate: () => {
      const nodes = get().nodes;
      const errors: WorkspaceValidation["errors"] = [];

      nodes.forEach((node) => {
        if (!node.data.state.validation.isValid) {
          errors.push({
            nodeId: node.id,
            errors: node.data.state.validation.errors,
          });
        }
      });

      set({
        validation: {
          isValid: errors.length === 0,
          errors,
        },
      });
    },

    // Add a new method to load workspace data
    loadWorkspace: (workspace: Workspace) => {
      set({
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        config: workspace.config,
        nodes: workspace.nodes,
        edges: workspace.edges,
        lastModified: workspace.lastModified,
      });
    },

    // Operations

    // Workspace operations
    updateConfig: (updater: (config: WorkspaceConfig) => WorkspaceConfig) => {
      set({
        config: updater(get().config!),
        lastModified: new Date(),
      });
    },

    // React Flow operations
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes) as Node[],
        lastModified: new Date(),
      });
    },

    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
        lastModified: new Date(),
      });
    },

    onConnect: (connection) => {
      // Create edge with port information
      const edge = {
        ...connection,
        sourcePort: connection.sourceHandle,
        targetPort: connection.targetHandle,
      };

      set({
        edges: addEdge(edge, get().edges),
        lastModified: new Date(),
      });
    },

    setNodes: (nodes) => {
      set({ nodes, lastModified: new Date() });
    },

    setEdges: (edges) => {
      set({ edges, lastModified: new Date() });
    },

    // Node operations

    getNode: (id: string) => {
      return get().nodes.find((node) => node.id === id);
    },

    addNode: (type) => {
      const position = { x: 0, y: 0 };
      const newNode = nodeRegistry.createNodeFromDefinition(type, position);
      if (!newNode) return;

      set({
        nodes: [...get().nodes, newNode],
        lastModified: new Date(),
      });
    },

    deleteNode: (id: string) => {
      set({
        nodes: get().nodes.filter((node) => node.id !== id),
        lastModified: new Date(),
      });
    },

    updateNodeData: (nodeId: string, updater: (data: any) => any) => {
      set({
        nodes: get().nodes.map((node) =>
          node.id === nodeId ? { ...node, data: updater(node.data) } : node
        ),
        lastModified: new Date(),
      });
    },
  }))
);

export default useWorkspaceStore;

// Convenience exports for common selectors
// export const useNodes = () => useWorkspaceStore((state) => state.nodes);
// export const useEdges = () => useWorkspaceStore((state) => state.edges);

// Workspace operations

export const useLayoutDirection = () =>
  useWorkspaceStore((state) => state.config?.layout.direction);

export const useToggleLayoutDirection = () => {
  const updateConfig = useWorkspaceStore((state) => state.updateConfig);
  return () =>
    updateConfig((config) => ({
      ...config,
      layout: {
        ...config.layout,
        direction:
          config.layout.direction === "horizontal" ? "vertical" : "horizontal",
      },
    }));
};

// Node operations
export const useAddNode = () => useWorkspaceStore((state) => state.addNode);

export const useNode = (nodeId: string) =>
  useWorkspaceStore((state) => state.getNode(nodeId));

export const useUpdateNodeData = () =>
  useWorkspaceStore((state) => state.updateNodeData);

export const useUpdateNodeValues = () => {
  const updateNodeData = useUpdateNodeData();
  return (nodeId: string, newValues: any) =>
    updateNodeData(nodeId, (data) => ({
      ...data,
      config: {
        ...data.config,
        values: newValues,
      },
    }));
};

// Specific helper for validation updates
export const useUpdateNodeValidation = () => {
  const updateNodeData = useUpdateNodeData();
  return (nodeId: string, validation: NodeValidation) => {
    updateNodeData(nodeId, (data) => ({
      ...data,
      validation,
    }));
  };
};

// Add convenience hook for workspace validation
export const useWorkspaceValidation = () =>
  useWorkspaceStore((state) => state.validation);
