import {
  NodeProps,
  NodeTypes,
  Port,
  NodeData,
  Node as NodeType,
} from "@/components/workspace/types";
import { ComponentType } from "react";
import BaseNode from "@/components/workspace/nodes/BaseNode";

// Registry type to store node definitions
export interface NodeDefinition {
  isAddable?: boolean;
  type: string;
  label: string;
  description: string;
  category: string;
  icon: string;
  component?: ComponentType<NodeProps>;
  config?: Record<string, any>;
  ports?: {
    inputs?: Port[];
    outputs?: Port[];
  };
}

// Add this interface
export interface CategoryData {
  id: string;
  name: string;
  nodes: NodeDefinition[];
}

// Helper functions for node creation
const generateId = (type: string): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const createPorts = (ports?: {
  inputs?: Port[];
  outputs?: Port[];
}): {
  inputs?: Port[];
  outputs?: Port[];
} => {
  if (!ports) return {};

  return {
    inputs: ports.inputs?.map((port, index) => ({
      ...port,
      id: `input-${index}`,
      type: "target",
    })),
    outputs: ports.outputs?.map((port, index) => ({
      ...port,
      id: `output-${index}`,
      type: "source",
    })),
  };
};

const createNodeData = (definition: NodeDefinition): NodeData => {
  const ports = createPorts(definition.ports);
  return {
    label: definition.label,
    icon: definition.icon,
    description: definition.description,
    category: definition.category,
    config: definition.config,
    ports,
    state: {
      validation: { isValid: true, errors: [] },
      execution: {
        isRunning: false,
        isCompleted: false,
        isFailed: false,
        isCancelled: false,
        error: undefined,
      },
    },
    isDeletable: definition.isAddable !== false,
  };
};

// Node registry to store all available nodes
export class NodeRegistry {
  private nodes: Map<string, NodeDefinition> = new Map();

  // Register a new node type
  register(nodeDefinition: NodeDefinition) {
    this.nodes.set(nodeDefinition.type, nodeDefinition);
  }

  // Get a node definition by type
  get(type: string): NodeDefinition | undefined {
    return this.nodes.get(type);
  }

  // does type exist
  has(type: string): boolean {
    return this.nodes.has(type);
  }

  // Get all registered nodes
  getAll(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  // Get nodes by category
  getByCategory(category: string): NodeDefinition[] {
    return this.getAll().filter((node) => node.category === category);
  }

  // Get categories
  getCategories(): string[] {
    return Array.from(new Set(this.getAll().map((node) => node.category)));
  }

  // Get nodeTypes object for React Flow
  getNodeTypes(): NodeTypes {
    const nodeTypes: NodeTypes = {};
    this.nodes.forEach((definition) => {
      nodeTypes[definition.type] = definition.component
        ? definition.component
        : BaseNode;
    });
    return nodeTypes;
  }

  // Add this new method
  getCategoriesWithNodes(): CategoryData[] {
    const categories = this.getCategories();
    return categories
      .map((categoryName) => ({
        id: categoryName,
        name: categoryName,
        nodes: this.getByCategory(categoryName).filter(
          (node) => node.isAddable !== false
        ),
      }))
      .filter((category) => category.nodes.length > 0);
  }

  // Node factory method
  createNode(
    type: string,
    position: { x: number; y: number } = { x: 0, y: 0 }
  ): NodeType {
    const definition = this.get(type);
    if (!definition) {
      throw new Error(`Node type "${type}" not found in registry`);
    }

    return {
      id: generateId(type),
      type,
      position,
      data: createNodeData(definition),
    };
  }
}

// Create and export a single instance
export const nodeRegistry = new NodeRegistry();
