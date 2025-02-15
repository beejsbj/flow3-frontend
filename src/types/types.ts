import type {
  Node as RFNode,
  NodeProps as RFNodeProps,
  Edge as RFEdge,
  EdgeProps as RFEdgeProps,
  Handle as RFHandle,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
  EdgeTypes,
} from "@xyflow/react";

// ============= Base Types =============
export interface Port {
  id?: string;
  type: "source" | "target";
  label?: string;
  isConnected?: boolean;
  portType?: string;
}

export type Direction = "TB" | "LR";

// ============= Node Types =============
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
  expanded?: boolean;
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
  expanded?: boolean;
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

// ============= Edge Types =============

export interface EdgeData extends Record<string, any> {
  isHovering?: boolean;
}

export interface Edge extends RFEdge {
  data: EdgeData;
}

export interface EdgeProps extends RFEdgeProps {
  data: Edge["data"];
}

// ============= Workspace Types =============
export interface LayoutOptions {
  direction: Direction;
  spacing: [number, number];
  auto: boolean;
}

export interface WorkspaceConfig extends Record<string, any> {
  layout: LayoutOptions;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  lastModified: string | Date;
  config?: WorkspaceConfig;
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

export interface WorkspaceExecution {
  isRunning: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isCancelled: boolean;
  error?: string;
}

// ============= Store State & Actions =============
export interface WorkspaceState extends Workspace {
  // State
  validation: WorkspaceValidation;
  execution: WorkspaceExecution;
  history: WorkspaceHistory;
  isBatchOperation: boolean;

  // Workspace Actions
  updateConfig: (updater: (config: WorkspaceConfig) => WorkspaceConfig) => void;
  loadWorkspace: (workspace: Workspace) => void;
  validate: () => void;

  // Execution Actions
  executeWorkspace: () => Promise<void>;
  setExecutionState: (execution: WorkspaceExecution) => void;

  // History Actions
  takeSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Batch Actions
  startBatch: () => void;
  endBatch: () => void;

  // Flow Actions
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[], saveSnapshot?: boolean) => void;
  setEdges: (edges: Edge[], saveSnapshot?: boolean) => void;

  // Edge Actions
  deleteEdge: (edgeId: string) => void;
  updateEdge: (edge: Edge) => void;
  updateEdgeHover: (edgeId: string, hover: boolean) => void;
  getEdge: (edgeId: string) => Edge | undefined;
  toggleEdgeAnimated: (edgeId: string, isRunning: boolean) => void;
  // Node Actions
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
  toggleNodeExpansion: (nodeId: string) => void;
  updateNodeValues: (nodeId: string, values: Record<string, any>) => void;
  setNodeExecutionState: (nodeId: string, execution: NodeExecution) => void;
  resetNodeExecutionStates: () => void;
  addNodeWithConnections: (
    sourceNodeId: string,
    newNodeType: string,
    replaceNode?: boolean
  ) => void;
}

// ============= Re-exports =============
export type { NodeTypes, EdgeTypes };
