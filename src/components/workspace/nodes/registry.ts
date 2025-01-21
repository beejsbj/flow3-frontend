import { Node, NodeProps, NodeTypes } from "@/components/workspace/types";
import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { Port } from "@/components/workspace/types";
// Registry type to store node definitions
export interface NodeDefinition {
  type: string;
  label: string;
  description: string;
  category: string;
  icon: LucideIcon;
  component?: ComponentType<NodeProps>;
  config?: Record<string, any>;
  ports?: Port[];
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

  createNodeFromDefinition(
    type: string,
    position: { x: number; y: number }
  ): Node | undefined {
    const definition = this.get(type);
    if (!definition) return undefined;

    const nodeId = crypto.randomUUID();
    const ports = definition.ports?.map((port) => ({
      ...port,
      id: `${nodeId}-${port.type}-${port.id || crypto.randomUUID()}`,
    }));

    // Initialize config values from schema defaults
    const configValues = definition.config?.schema.reduce((acc, field) => {
      acc[field.name] = field.defaultValue;
      return acc;
    }, {} as Record<string, any>);

    return {
      id: nodeId,
      type: definition.type,
      position,
      data: {
        label: definition.label,
        icon: definition.icon,
        description: definition.description,
        category: definition.category,
        config: definition.config
          ? {
              schema: definition.config.schema,
              values: configValues,
            }
          : undefined,
        ports: ports || [],
      },
    };
  }

  // Register a new node type
  register(nodeDefinition: NodeDefinition) {
    this.nodes.set(nodeDefinition.type, nodeDefinition);
  }

  // Get a node definition by type
  get(type: string): NodeDefinition | undefined {
    return this.nodes.get(type);
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
    return categories.map((categoryName) => ({
      id: categoryName,
      name: categoryName,
      nodes: this.getByCategory(categoryName),
    }));
  }
}

// Create and export a single instance
export const nodeRegistry = new NodeRegistry();
