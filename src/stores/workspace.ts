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
  type WorkspaceExecution,
} from "@/components/workspace/types";
import { subscribeWithSelector } from "zustand/middleware";
import { nodeRegistry } from "@/services/registry";
import { useWorkspacesStore } from "@/stores/workspaces";
import { executeWorkspace, pollExecutionStatus } from "@/services/execution";

// ============= Types =============
declare global {
  interface Window {
    _saveTimeout?: ReturnType<typeof setTimeout>;
  }
}

// ============= Helper Functions =============
const validateNode = (node: NodeType): NodeType => {
  const errors: string[] = [];

  const isFieldApplicable = (field: FieldConfig) => {
    if (!field.dependsOn) return true;
    const dependentField = node.data.config?.form?.find(
      (f) => f.name === field.dependsOn?.field
    );
    return dependentField?.value === field.dependsOn.value;
  };

  // Validate form fields
  if (node.data.config?.form) {
    node.data.config.form.forEach((field) => {
      if (isFieldApplicable(field) && field.required) {
        const value = field.value;
        if (value === undefined || value === "" || value === null) {
          errors.push(`${field.label} is required`);
        }
      }
    });
  }

  // Validate ports
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

// ============= Store Definition =============
const useWorkspaceStore = create(
  subscribeWithSelector<WorkspaceState>((set, get) => ({
    // ========== Initial State ==========
    // Metadata
    id: "",
    name: "",
    description: "",
    lastModified: new Date(),

    // Configuration
    config: {
      layout: {
        direction: "LR",
        spacing: [100, 100],
        auto: true,
      },
    },

    // Content
    nodes: [],
    edges: [],

    // State
    validation: { isValid: true, errors: [] },
    execution: {
      isRunning: false,
      isCompleted: false,
      isFailed: false,
      isCancelled: false,
      error: undefined,
    },
    history: { past: [], future: [] },
    isBatchOperation: false,

    // ========== Actions ==========
    // ----- Workspace Actions -----
    loadWorkspace: (workspace: Workspace) => {
      set({
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        config: workspace.config || {
          layout: { direction: "LR", spacing: [100, 100], auto: true },
        },
        nodes: workspace.nodes,
        edges: workspace.edges,
        lastModified: new Date(workspace.lastModified),
      });
    },

    updateConfig: (updater: (config: WorkspaceConfig) => WorkspaceConfig) => {
      set({
        config: updater(get().config!),
        lastModified: new Date(),
      });
    },

    validate: () => {
      const errors: WorkspaceValidation["errors"] = [];
      get().nodes.forEach((node) => {
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

    // ----- Execution Actions -----
    setExecutionState: (execution: WorkspaceExecution) => {
      set({ execution });
    },

    execute: async () => {
      const state = get();
      get().resetNodeExecutionStates();
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
      }
    },

    // ----- History Actions -----
    takeSnapshot: () => {
      set((state) => ({
        history: {
          past: [
            ...state.history.past.slice(state.history.past.length - 99),
            { nodes: state.nodes, edges: state.edges },
          ],
          future: [],
        },
      }));
    },

    undo: () => {
      const previous = get().history.past[get().history.past.length - 1];
      if (previous) {
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
      const next = get().history.future[get().history.future.length - 1];
      if (next) {
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

    // ----- Batch Actions -----
    startBatch: () => {
      get().takeSnapshot();
      set({ isBatchOperation: true });
    },

    endBatch: () => {
      set({ isBatchOperation: false });
    },

    // ----- Flow Actions -----
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
      if (!get().isBatchOperation && saveSnapshot) {
        get().takeSnapshot();
      }
      set({ nodes, lastModified: new Date() });
    },

    setEdges: (edges, saveSnapshot = true) => {
      if (!get().isBatchOperation && saveSnapshot) {
        get().takeSnapshot();
      }
      set({ edges, lastModified: new Date() });
    },

    // ----- Edge Actions -----
    deleteEdge: (edgeId: string) => {
      get().setEdges(get().edges.filter((edge) => edge.id !== edgeId));
    },

    // ----- Node Actions -----
    getNode: (id: string) => get().nodes.find((node) => node.id === id),

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

    replaceNodeWithConnections: (
      oldNodeId: string,
      newNodeType: string,
      createPlaceholders = true
    ) => {
      // Find existing node to get its position
      const oldNode = get().getNode(oldNodeId);
      if (!oldNode) return;

      // Find parent edge
      const parentEdge = get().edges.find((edge) => edge.target === oldNodeId);
      if (!parentEdge) return;

      // Start batch operation
      get().startBatch();

      // Add new node at same position
      const newNode = get().addNode(newNodeType, {
        x: oldNode.position.x,
        y: oldNode.position.y,
      });
      if (!newNode) {
        get().endBatch();
        return;
      }

      // Connect to parent
      get().connectNodes({
        source: parentEdge.source,
        target: newNode.id,
        sourceHandle: parentEdge.sourceHandle || undefined,
        targetHandle: "input-0",
      });

      // Create placeholders if needed
      if (createPlaceholders) {
        const nodeDefinition = nodeRegistry.get(newNodeType);
        const outputPorts = nodeDefinition?.ports?.outputs || [];
        const numOutputs = outputPorts.length;

        outputPorts.forEach((port, index) => {
          const offsetX =
            numOutputs > 1 ? (index - (numOutputs - 1) / 2) * 200 : 0;
          const placeholder = get().addNode("placeholder", {
            x: newNode.position.x + offsetX,
            y: newNode.position.y + 100,
          });

          if (placeholder) {
            get().connectNodes({
              source: newNode.id,
              target: placeholder.id,
              sourceHandle: `output-${index}`,
              targetHandle: "input-0",
            });
          }
        });
      }

      get().deleteNode(oldNodeId);
      get().endBatch();
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
    toggleNodeExpansion: (nodeId: string) => {
      const node = get().getNode(nodeId);
      if (!node) return;

      // Update the node with new expansion state
      const updatedNode = {
        ...node,
        measured: undefined, // Reset measured state to trigger re-measurement
        data: {
          ...node.data,
          config: {
            ...node.data.config,
            expanded: !node.data.config?.expanded,
          },
        },
      };

      // Update the node
      get().updateNode(updatedNode);
    },

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
  }))
);

// ============= Auto-save Subscription =============
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

// ============= Exports =============
export default useWorkspaceStore;

// Convenience hooks
export const useWorkspaceMetadata = () =>
  useWorkspaceStore((state) => ({
    name: state.name || "",
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

export const useToggleNodeExpansion = () =>
  useWorkspaceStore((state) => state.toggleNodeExpansion);

export const useSetNodeExecutionState = () =>
  useWorkspaceStore((state) => state.setNodeExecutionState);

export const useUpdateNodePortConnections = () =>
  useWorkspaceStore((state) => state.updateNodePortConnections);

export const useUpdateNodeValues = () =>
  useWorkspaceStore((state) => state.updateNodeValues);
