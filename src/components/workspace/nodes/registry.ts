import {
  Node,
  NodeProps,
  NodeTypes,
  NodeData,
} from "@/components/workspace/types";
import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { Port } from "@/components/workspace/types";
import useWorkspaceStore from "@/stores/workspace";
import { Square, ArrowLeftCircle, ArrowRightCircle } from "lucide-react";

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

  private createPorts(nodeId: string, definition: NodeDefinition): Port[] {
    if (!definition.ports) return [];
    return definition.ports.map((port) => ({
      ...port,
      id: `${nodeId}-${port.type}-${port.id || crypto.randomUUID()}`,
    }));
  }

  private createNodeData(nodeId: string, definition: NodeDefinition): NodeData {
    const ports = this.createPorts(nodeId, definition);

    const data: NodeData = {
      label: definition.label,
      icon: definition.icon,
      description: definition.description,
      category: definition.category,
      config: definition.config,
      ports,
      state: {
        validation: { isValid: true, errors: [] },
      },
    };

    return data;
  }

  createNodeFromDefinition(
    type: string,
    position: { x: number; y: number }
  ): Node | undefined {
    const definition = this.get(type);
    if (!definition) return undefined;

    const nodeId = crypto.randomUUID();

    return {
      id: nodeId,
      type: definition.type,
      position,
      data: this.createNodeData(nodeId, definition),
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

// Register default React Flow node types
nodeRegistry.register({
  type: "default",
  label: "Default Node",
  description: "A default node with input and output ports",
  category: "default",
  icon: Square,
  ports: [
    { type: "target", label: "Input" },
    { type: "source", label: "Output" },
  ],
});

nodeRegistry.register({
  type: "input",
  label: "Input Node",
  description: "A node with only output ports",
  category: "default",
  icon: ArrowRightCircle,
  ports: [{ type: "source", label: "Output" }],
});

nodeRegistry.register({
  type: "output",
  label: "Output Node",
  description: "A node with only input ports",
  category: "default",
  icon: ArrowLeftCircle,
  ports: [{ type: "target", label: "Input" }],
});
