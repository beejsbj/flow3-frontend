import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import {
  type WorkspaceState,
  type Node as NodeType,
  type Workspace,
  type WorkspaceConfig,
  type WorkspaceValidation,
  type NodeExecution,
  type FieldConfig,
  WorkspaceExecution,
} from "@/components/workspace/types";
import { subscribeWithSelector } from "zustand/middleware";
import { nodeRegistry } from "@/services/registry";
import { useWorkspacesStore } from "@/stores/workspaces";
import { executeWorkspace, pollExecutionStatus } from "@/services/execution";

// Declare the global _saveTimeout
declare global {
  interface Window {
    _saveTimeout?: ReturnType<typeof setTimeout>;
  }
}

// Pure function to validate a node
const validateNode = (node: NodeType): NodeType => {
  const errors: string[] = [];

  if (node.data.config?.form) {
    // Helper function to check if a field's dependencies are satisfied
    const isFieldApplicable = (field: FieldConfig) => {
      if (!field.dependsOn) return true;
      const dependentField = node.data.config?.form?.find(
        (f) => f.name === field.dependsOn?.field
      );
      return dependentField?.value === field.dependsOn.value;
    };

    node.data.config.form.forEach((field) => {
      // Only validate fields whose dependencies are satisfied
      if (isFieldApplicable(field)) {
        if (field.required) {
          const value = field.value;
          if (value === undefined || value === "" || value === null) {
            errors.push(`${field.label} is required`);
          }
        }
      }
    });
  }

  const allPorts = [
    ...(node.data.ports?.inputs || []),
    ...(node.data.ports?.outputs || []),
  ];

  allPorts.forEach((port) => {
    if (!port.edgeId) {
      errors.push(`Please connect ${port.label}`);
    }
  });

  return {
    ...node,
    data: {
      ...node.data,
      state: {
        validation: {
          isValid: errors.length === 0,
          errors,
        },
        execution: node.data.state?.execution || {
          isRunning: false,
          isCompleted: false,
          isFailed: false,
          isCancelled: false,
        },
      },
    },
  };
};

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

    execution: {
      isRunning: false,
      isCompleted: false,
      isFailed: false,
      isCancelled: false,
      error: undefined,
    },

    history: {
      past: [],
      future: [],
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

    // Execution methods
    setExecutionState: (executionState: WorkspaceExecution) => {
      set({ execution: executionState });
    },

    // History operations
    takeSnapshot: () => {
      console.log("takeSnapshot");
      set((state) => ({
        history: {
          past: [
            ...state.history.past.slice(state.history.past.length - 99), // Keep last 100 items
            { nodes: state.nodes, edges: state.edges },
          ],
          future: [],
        },
      }));
    },

    undo: () => {
      console.log("undo");
      const previous = get().history.past[get().history.past.length - 1];

      if (previous) {
        // Save current state to future
        set({
          history: {
            past: get().history.past.slice(0, -1),
            future: [
              ...get().history.future,
              { nodes: get().nodes, edges: get().edges },
            ],
          },
          nodes: previous.nodes,
          edges: previous.edges,
        });
      }
    },

    redo: () => {
      console.log("redo");
      const next = get().history.future[get().history.future.length - 1];

      if (next) {
        // Save current state to past
        set({
          history: {
            future: get().history.future.slice(0, -1),
            past: [
              ...get().history.past,
              { nodes: get().nodes, edges: get().edges },
            ],
          },
          nodes: next.nodes,
          edges: next.edges,
        });
      }
    },

    canUndo: () => get().history.past.length > 0,
    canRedo: () => get().history.future.length > 0,

    // Add a new method to load workspace data
    loadWorkspace: (workspace: Workspace) => {
      set({
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        config: workspace.config || {
          layout: {
            direction: "LR",
            spacing: [100, 100],
            auto: true,
          },
        },
        nodes: workspace.nodes,
        edges: workspace.edges,
        lastModified: new Date(workspace.lastModified),
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

      // Update port connections using the store method
      get().nodes.forEach((node) => {
        if (!node) return;
        if (connection.sourceHandle) {
          get().updateNodePortConnections(
            node.id,
            connection.sourceHandle,
            edgeId
          );
        }
        if (connection.targetHandle) {
          get().updateNodePortConnections(
            node.id,
            connection.targetHandle,
            edgeId
          );
        }
      });

      get().setEdges(addEdge(connection, get().edges));
    },

    setNodes: (nodes, saveSnapshot = true) => {
      if (saveSnapshot) {
        get().takeSnapshot();
      }
      set({ nodes, lastModified: new Date() });
    },

    setEdges: (edges, saveSnapshot = true) => {
      if (saveSnapshot) {
        get().takeSnapshot();
      }
      set({ edges, lastModified: new Date() });
    },

    //edge operations
    deleteEdge: (edgeId: string) => {
      get().setEdges(get().edges.filter((edge) => edge.id !== edgeId));
    },

    // Node operations
    getNode: (id: string) => {
      return get().nodes.find((node) => node.id === id);
    },

    addNode: (type: string, position = { x: 0, y: 0 }) => {
      try {
        const newNode = nodeRegistry.createNode(type, position);

        get().setNodes([...get().nodes, newNode]);
        return newNode;
      } catch (error) {
        console.error("Failed to create node:", error);
      }
    },

    deleteNode: (id: string) => {
      const edges = get().edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      );
      get().setNodes(get().nodes.filter((node) => node.id !== id));

      set({ edges });
    },

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

    // Core node update method - single source of truth
    updateNode: (node: NodeType) => {
      // Always validate the node before updating
      const validatedNode = validateNode(node);

      get().setNodes(
        get().nodes.map((n) => (n.id === validatedNode.id ? validatedNode : n)),
        false
      );

      // Validate workspace after node update
      get().validate();
    },

    // Node operations that use updateNode
    updateNodePortConnections: (
      nodeId: string,
      portId: string | null,
      edgeId: string
    ) => {
      const node = get().getNode(nodeId);
      if (!node || !portId) return;

      const newPorts = {
        inputs: node.data.ports?.inputs?.map((port) =>
          port.id === portId ? { ...port, edgeId } : port
        ),
        outputs: node.data.ports?.outputs?.map((port) =>
          port.id === portId ? { ...port, edgeId } : port
        ),
      };

      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          ports: newPorts,
        },
      };

      get().updateNode(updatedNode);
    },

    updateNodeValues: (nodeId: string, values: Record<string, any>) => {
      const node = get().getNode(nodeId);
      if (!node || !node.data.config?.form) return;

      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          config: {
            ...node.data.config,
            form: node.data.config.form.map((field) => ({
              ...field,
              value: values[field.name] ?? field.value,
            })),
          },
        },
      };

      get().updateNode(updatedNode);
    },

    setNodeExecutionState: (nodeId: string, executionState: NodeExecution) => {
      const node = get().getNode(nodeId);
      if (!node) return;

      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          state: {
            validation: node.data.state?.validation || {
              isValid: true,
              errors: [],
            },
            execution: executionState,
          },
        },
      };

      get().updateNode(updatedNode);
    },

    resetNodeExecutionStates: () => {
      get().nodes.forEach((node) => {
        get().setNodeExecutionState(node.id, {
          isRunning: false,
          isCompleted: false,
          isFailed: false,
          isCancelled: false,
        });
      });
    },
    // Execution methods
    execute: async () => {
      const state = get();
      get().resetNodeExecutionStates();
      get().setExecutionState({
        isRunning: false,
        isCompleted: false,
        isFailed: false,
        isCancelled: false,
      });
      try {
        await executeWorkspace({
          id: state.id,
          name: state.name,
          description: state.description,
          nodes: state.nodes,
          edges: state.edges,
          lastModified: state.lastModified,
          config: state.config,
        });
      } catch (error) {
        console.error("Failed to execute workspace:", error);
        get().setExecutionState({
          isRunning: false,
          isCompleted: false,
          isFailed: true,
          isCancelled: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  }))
);

// Remove or comment out the auto-save subscription
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

// Add convenience hook for workspace validation
export const useWorkspaceMetadata = () =>
  useWorkspaceStore((state) => ({
    name: state.name || "", // Provide default values
    description: state.description || "",
  }));

export const useWorkspaceValidation = () =>
  useWorkspaceStore((state) => state.validation);

export const useLayoutOptions = () =>
  useWorkspaceStore((state) => state.config?.layout);

export const useUpdateLayout = () =>
  useWorkspaceStore(
    (state) => (layoutConfig: Partial<WorkspaceConfig["layout"]>) =>
      state.updateConfig((config) => ({
        ...config,
        layout: {
          ...config.layout,
          ...layoutConfig,
        },
      }))
  );

// Node operations
export const useAddNode = () => useWorkspaceStore((state) => state.addNode);

export const useDeleteNode = () =>
  useWorkspaceStore((state) => state.deleteNode);

export const useNode = (nodeId: string) =>
  useWorkspaceStore((state) => state.getNode(nodeId));

export const useConnectNodes = () =>
  useWorkspaceStore((state) => state.connectNodes);

export const useUpdateNode = () =>
  useWorkspaceStore((state) => state.updateNode);

export const useSetNodeExecutionState = () =>
  useWorkspaceStore((state) => state.setNodeExecutionState);

export const useUpdateNodePortConnections = () =>
  useWorkspaceStore((state) => state.updateNodePortConnections);

export const useUpdateNodeValues = () =>
  useWorkspaceStore((state) => state.updateNodeValues);
