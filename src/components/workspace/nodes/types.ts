import type { Node, NodeProps, Edge, EdgeProps } from "@xyflow/react";

// Re-export common types
export type { Node, NodeProps, Edge, EdgeProps };

// Add any custom type extensions or new types here
export interface WorkflowNode extends Node {
  // Add any custom node properties
}
