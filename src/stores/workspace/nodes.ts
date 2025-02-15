import { type Node } from "@/types/types";
import {
  type NodeExecution,
  type FieldConfig,
  type WorkspaceState,
} from "@/types/types";
import { nodeRegistry } from "@/services/registry";
import { applyNodeChanges } from "@xyflow/react";
// Helper Functions
export const validateNode = (node: Node): Node => {
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
    node.data.config.form.forEach((field: FieldConfig) => {
      if (isFieldApplicable(field) && field.required) {
        const value = field.value;
        if (value === undefined || value === "" || value === null) {
          errors.push(`${field.label} is required`);
        }
      }
    });
  }

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

// Node Slice
export type NodeSlice = Pick<
  WorkspaceState,
  | "nodes"
  | "onNodesChange"
  | "getNode"
  | "addNode"
  | "deleteNode"
  | "connectNodes"
  | "updateNode"
  | "toggleNodeExpansion"
  | "updateNodeValues"
  | "setNodeExecutionState"
  | "resetNodeExecutionStates"
  | "addNodeWithConnections"
  | "setNodes"
>;

export const createNodeSlice = (set: any, get: any): NodeSlice => ({
  // State
  nodes: [],

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node[],
      lastModified: new Date(),
    });
  },

  // Actions
  getNode: (id: string) => get().nodes.find((node: Node) => node.id === id),

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
      (edge: any) => edge.source !== id && edge.target !== id
    );
    get().setNodes(get().nodes.filter((node: Node) => node.id !== id));
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

    get().onConnect(connection);
  },

  addNodeWithConnections: (
    sourceNodeId: string,
    newNodeType: string,
    replaceNode: boolean = false
  ) => {
    const sourceNode = get().getNode(sourceNodeId);
    if (!sourceNode) return;

    get().startBatch();

    const direction = get().config?.layout?.direction;
    const xSpacing = get().config?.layout?.spacing[0];
    const ySpacing = get().config?.layout?.spacing[1];

    if (!direction || !xSpacing || !ySpacing) return;

    const position = replaceNode
      ? sourceNode.position
      : {
          x:
            sourceNode.position.x +
            (direction === "LR"
              ? xSpacing + (sourceNode?.measured?.width ?? 100)
              : 0),
          y:
            sourceNode.position.y +
            (direction === "TB"
              ? ySpacing + (sourceNode?.measured?.height ?? 100)
              : 0),
        };

    const newNode = get().addNode(newNodeType, position);
    if (!newNode) {
      get().endBatch();
      return;
    }

    get().connectNodes({
      source: sourceNodeId,
      target: newNode.id,
      sourceHandle: "output-0",
      targetHandle: "input-0",
    });

    if (replaceNode) {
      const parentEdge = get().edges.find(
        (edge: any) => edge.target === sourceNodeId
      );
      if (parentEdge) {
        get().connectNodes({
          source: parentEdge.source,
          target: newNode.id,
          sourceHandle: parentEdge.sourceHandle || undefined,
          targetHandle: "input-0",
        });
      }
      get().deleteNode(sourceNodeId);
    }

    get().endBatch();
  },

  updateNode: (node: Node) => {
    const validatedNode = validateNode(node);

    get().setNodes(
      get().nodes.map((n: Node) =>
        n.id === validatedNode.id ? validatedNode : n
      ),
      false
    );
  },

  toggleNodeExpansion: (nodeId: string) => {
    const node = get().getNode(nodeId);
    if (!node) return;

    const updatedNode = {
      ...node,
      measured: undefined,
      data: {
        ...node.data,
        config: {
          ...node.data.config,
          expanded: !node.data.config?.expanded,
        },
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
          form: node.data.config.form.map((field: FieldConfig) => ({
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
    get().nodes.forEach((node: Node) => {
      get().setNodeExecutionState(node.id, {
        isRunning: false,
        isCompleted: false,
        isFailed: false,
        isCancelled: false,
      });
    });
  },

  setNodes: (nodes: Node[], saveSnapshot = true) => {
    if (!get().isBatchOperation && saveSnapshot) {
      get().takeSnapshot();
    }
    set({ nodes, lastModified: new Date() });

    get().validate();
  },
});
