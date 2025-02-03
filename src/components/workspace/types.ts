import type {
  Node as RFNode,
  NodeProps as RFNodeProps,
  Edge as RFEdge,
  EdgeProps,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
  EdgeTypes,
} from "@xyflow/react";

// node
export interface FieldConfig {
  name: string;
  type: "string" | "number" | "boolean" | "select";
  label: string;
  value?: any;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  dependsOn?: {
    field: string;
    value: any;
  };
}

export interface NodeConfig {
  form?: FieldConfig[];
  conditionalForms?: {
    selector: string; // field name that determines which form to show
    forms: Record<string, FieldConfig[]>; // key is the selector value, value is the form config
  };
}

export interface NodeValidation {
  isValid: boolean;
  errors: string[];
}
export interface NodeExecution {
  isRunning: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isCancelled: boolean;
  error?: string;
}

export interface NodeState {
  validation: NodeValidation;
  execution: NodeExecution;
}

export interface NodeData extends Record<string, any> {
  label?: string;
  icon?: string;
  description?: string;
  category?: string;
  isDeletable?: boolean;
  ports?: {
    inputs?: Port[];
    outputs?: Port[];
  };
  state?: NodeState;
  config?: NodeConfig;
}

export interface Node extends RFNode {
  data: NodeData;
}

export interface NodeProps extends RFNodeProps {
  data: Node["data"];
}

// edge
export interface Edge extends RFEdge {
  sourcePort?: string;
  targetPort?: string;
}

// workspace
export type Direction = "TB" | "LR";

export type LayoutOptions = {
  direction: Direction;
  spacing: [number, number];
  auto: boolean;
};

export interface WorkspaceConfig extends Record<string, any> {
  layout: LayoutOptions;
}

export interface Workspace {
  // Metadata
  id: string;
  name: string;
  description: string;
  lastModified: string | Date;
  config?: WorkspaceConfig;

  // Content
  nodes: Node[];
  edges: Edge[];
}

export interface WorkspaceValidation {
  isValid: boolean;
  errors: {
    nodeId: string;
    errors: string[];
  }[];
}

export interface WorkspaceHistory {
  past: {
    nodes: Node[];
    edges: Edge[];
  }[];
  future: {
    nodes: Node[];
    edges: Edge[];
  }[];
}

export interface WorkspaceState extends Workspace {
  // Workspace operations
  updateConfig: (updater: (config: WorkspaceConfig) => WorkspaceConfig) => void;
  loadWorkspace: (workspace: Workspace) => void;

  // Validation
  validation: WorkspaceValidation;
  validate: () => void;

  // History
  history: WorkspaceHistory;
  takeSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // React Flow operations
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[], saveSnapshot?: boolean) => void;
  setEdges: (edges: Edge[], saveSnapshot?: boolean) => void;

  // Edge operations
  deleteEdge: (edgeId: string) => void;

  // Node operations
  getNode: (id: string) => Node | undefined;
  addNode: (
    type: string,
    position?: { x: number; y: number }
  ) => Node | undefined;
  deleteNode: (id: string) => void;

  connectNodes: (params: {
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }) => void;

  updateNode: (node: Node) => void;

  updateNodePortConnections: (
    nodeId: string,
    portId: string | null,
    edgeId: string
  ) => void;

  updateNodeValues: (nodeId: string, values: Record<string, any>) => void;

  setNodeExecutionState: (nodeId: string, execution: NodeExecution) => void;
}

//store

///

// Re-export common types
export type { EdgeProps, NodeTypes, EdgeTypes };

// Add these new types
export interface Port {
  id?: string;
  type: "source" | "target";
  label?: string;
  edgeId?: string | null;
  portType?: string;
}
