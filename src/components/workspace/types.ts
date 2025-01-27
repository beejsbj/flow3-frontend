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
import { LucideIcon } from "lucide-react";

// node

export interface FieldConfig {
  type: "string" | "number" | "boolean" | "select";
  label: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface NodeValidation {
  isValid: boolean;
  errors: string[];
}

export interface NodeData extends Record<string, any> {
  label?: string;
  icon?: LucideIcon;
  description: string;
  category: string;
  ports: Port[];
  state: NodeState;
  config?: {
    fields?: Record<string, FieldConfig>;
    values?: Record<string, any>;
  };
}

export interface NodeState {
  validation: NodeValidation;
}

export interface Node extends RFNode {
  data: NodeData;
  test: string;
  validate: () => void;
  updatePortConnections: (portId: string, edgeId: string) => void;
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

export interface WorkspaceConfig extends Record<string, any> {
  layout: {
    direction: "vertical" | "horizontal";
  };
}

export interface Workspace {
  // Metadata
  id: string;
  name: string;
  description: string;
  lastModified: Date;
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

export interface WorkspaceState extends Workspace {
  // Workspace operations
  updateConfig: (updater: (config: WorkspaceConfig) => WorkspaceConfig) => void;
  loadWorkspace: (workspace: Workspace) => void;

  // React Flow operations
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  // Node operations
  getNode: (id: string) => Node | undefined;
  addNode: (type: string) => void;
  deleteNode: (id: string) => void;
  updateNodeData: (nodeId: string, updater: (data: any) => any) => void;

  // Add validation state
  validation: WorkspaceValidation;
  validate: () => void;
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
}
