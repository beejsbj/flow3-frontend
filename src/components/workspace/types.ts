import type {
  Node as RFNode,
  NodeProps as RFNodeProps,
  Edge as RFEdge,
  EdgeProps,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
} from "@xyflow/react";
import { LucideIcon } from "lucide-react";

// node

interface NodeData extends Record<string, unknown> {
  label: string;
  icon: LucideIcon;
  description: string;
  category: string;
  config?: {
    schema?: Record<string, any>; // The form schema definition
    values?: Record<string, any>; // The actual config values
  };
  ports: Port[];
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

export interface Workspace {
  // Metadata
  id: string;
  name: string;
  description: string;
  lastModified: Date;
  config?: Record<string, any>;

  // Content
  nodes: Node[];
  edges: Edge[];
}

export interface WorkspaceState extends Workspace {
  // Workspace operations
  updateConfig: (updater: (config: any) => any) => void;

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
export type { EdgeProps, NodeTypes };

// Add these new types
export interface Port {
  id?: string;
  type: "source" | "target";
  label?: string;
}
