import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import {
  type WorkspaceState,
  type Node as NodeType,
  type Workspace,
  type WorkspaceConfig,
  type WorkspaceValidation,
} from "@/components/workspace/types";
import { subscribeWithSelector } from "zustand/middleware";
import { Node } from "@/components/workspace/nodes/Node";
import { useWorkspacesStore } from "@/stores/workspaces";

// Declare the global _saveTimeout
declare global {
  interface Window {
    _saveTimeout?: ReturnType<typeof setTimeout>;
  }
}

const useWorkspaceStore = create(
  subscribeWithSelector<WorkspaceState>((set, get) => ({
    // Metadata
    id: "", // Will be set when loading a workspace
    name: "",
    description: "",
    config: {
      layout: {
        direction: "LR",
        spacing: [100, 100],
        auto: true,
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
        if (node.data?.state?.validation?.isValid === false) {
          errors.push({
            nodeId: node.id,
            errors: node.data.state.validation.errors || [],
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
        nodes: applyNodeChanges(changes, get().nodes) as NodeType[],
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
      const edgeId = `xy-edge__${connection.source}${
        connection.sourceHandle || ""
      }-${connection.target}${connection.targetHandle || ""}`;

      // Update port connections
      get().nodes.forEach((node) => {
        if (!node) return;
        if (connection.sourceHandle && node.updatePortConnections) {
          node.updatePortConnections(connection.sourceHandle, edgeId);
        }
        if (connection.targetHandle && node.updatePortConnections) {
          node.updatePortConnections(connection.targetHandle, edgeId);
        }
      });

      set({
        edges: addEdge(connection, get().edges),
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

    addNode: (type, position = { x: 0, y: 0 }) => {
      try {
        const newNode = new Node(type, position);

        set({
          nodes: [...get().nodes, newNode],
          lastModified: new Date(),
        });

        return newNode;
      } catch (error) {
        console.error("Failed to create node:", error);
      }
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

    // Add this to your workspace store
    connectNodes: (params: {
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }) => {
      const connection = {
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || null,
        targetHandle: params.targetHandle || null,
      };

      // Use the existing onConnect handler
      get().onConnect(connection);
    },
  }))
);

// Add auto-save subscription
useWorkspaceStore.subscribe(
  (state) => ({
    nodes: state.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    })),
    edges: state.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })),
    config: state.config,
    name: state.name,
    description: state.description,
  }),
  async (newState, prevState) => {
    // Skip if no ID (workspace not loaded)
    if (!useWorkspaceStore.getState().id) return;

    // Stringify with a replacer function to handle dates and remove irrelevant properties
    const replacer = (key: string, value: any) => {
      // Skip internal React Flow properties that might change but don't affect the actual state
      if (key.startsWith("__") || key === "selected" || key === "dragging") {
        return undefined;
      }
      return value;
    };

    const prevStateStr = JSON.stringify(prevState, replacer);
    const newStateStr = JSON.stringify(newState, replacer);

    // Skip if no actual changes
    if (prevStateStr === newStateStr) return;

    // Debounce the save operation with a longer timeout
    if (window._saveTimeout) clearTimeout(window._saveTimeout);
    window._saveTimeout = setTimeout(async () => {
      try {
        const currentState = useWorkspaceStore.getState();
        if (!currentState.id) return;

        const workspaceData = {
          id: currentState.id,
          name: currentState.name,
          description: currentState.description,
          config: currentState.config,
          nodes: currentState.nodes,
          edges: currentState.edges,
          lastModified: new Date(),
        };

        await useWorkspacesStore.getState().updateWorkspace(workspaceData);
      } catch (error) {
        console.error("Failed to auto-save workspace:", error);
      }
    }, 5000); // 5 seconds debounce
  }
);

export default useWorkspaceStore;

// Convenience exports for common selectors
// export const useNodes = () => useWorkspaceStore((state) => state.nodes);
// export const useEdges = () => useWorkspaceStore((state) => state.edges);

// Workspace operations

export const useLayoutDirection = () =>
  useWorkspaceStore((state) => state.config?.layout.direction);

// Node operations
export const useAddNode = () => useWorkspaceStore((state) => state.addNode);

export const useNode = (nodeId: string) =>
  useWorkspaceStore((state) => state.getNode(nodeId));

// Add convenience hook for workspace validation
export const useWorkspaceValidation = () =>
  useWorkspaceStore((state) => state.validation);

export const useLayoutOptions = () =>
  useWorkspaceStore((state) => state.config?.layout);

export const useLayout = () =>
  useWorkspaceStore((state) => ({
    options: state.config?.layout,
    updateLayout: (updates: Partial<WorkspaceConfig["layout"]>) =>
      state.updateConfig((config) => ({
        ...config,
        layout: {
          ...config.layout,
          ...updates,
        },
      })),
  }));

export const useConnectNodes = () =>
  useWorkspaceStore((state) => state.connectNodes);

export const useWorkspaceMetadata = () =>
  useWorkspaceStore((state) => ({
    name: state.name,
    description: state.description,
  }));
