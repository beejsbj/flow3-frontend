import { NodeProps, NodeTypes, Port } from "@/components/workspace/types";
import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { Square, ArrowLeftCircle, ArrowRightCircle } from "lucide-react";

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
}

// Create and export a single instance
export const nodeRegistry = new NodeRegistry();
