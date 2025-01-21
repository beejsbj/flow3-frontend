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

interface NodeData extends Record<string, unknown> {
  label?: string;
  icon?: LucideIcon;
  description?: string;
  category?: string;
  config?: {
    fields?: Record<string, FieldConfig>; // Updated to use FieldConfig
    values?: Record<string, any>;
  };
  ports?: Port[];
}

export interface Node extends RFNode {
  //   config: Object;
  //   states: Object;
  data: NodeData;
}

export interface NodeProps extends RFNodeProps {
  data: Node["data"];
}

// edge
export interface Edge extends RFEdge {}

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
  addNode: (type: string) => void;
  deleteNode: (id: string) => void;
  updateNodeData: (nodeId: string, updater: (data: any) => any) => void;
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
}
