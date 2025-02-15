import {
  NodeProps,
  NodeTypes,
  Port,
  NodeData,
  Node as NodeType,
} from "@/types/types";
import { ComponentType } from "react";
import BaseNode from "@/components/workspace/nodes/core/BaseNode";
import { PositionLoggerNode } from "@/components/workspace/nodes/types/PositionLoggerNode";
import { StartNode } from "@/components/workspace/nodes/types/StartNode";

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
      portType: port.portType || "default",
    })),
    outputs: ports.outputs?.map((port, index) => ({
      ...port,
      id: `output-${index}`,
      type: "source",
      portType: port.portType || "default",
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
    console.log("definition", definition);
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

// Register the position logger node first
nodeRegistry.register({
  type: "position-logger",
  label: "Position Logger",
  description: "Displays the current position of the node",
  category: "Debug",
  icon: "Crosshair",
  component: PositionLoggerNode,
  ports: {
    inputs: [{ label: "Input", type: "target" }],
    outputs: [{ label: "Output", type: "source" }],
  },
});

// Delay node
nodeRegistry.register({
  type: "delay",
  label: "Delay",
  description: "Adds a time delay to the flow",
  category: "Flow Control",
  icon: "Clock",
  config: {
    form: [
      {
        name: "delayTime",
        type: "number",
        label: "Delay (ms)",
        required: true,
        value: 1000,
      },
    ],
  },
  ports: {
    inputs: [{ label: "Input", type: "target" }],
    outputs: [{ label: "Output", type: "source" }],
  },
});

// Example of registering a node with multiple ports
nodeRegistry.register({
  type: "multi-port-node",
  label: "Multi Port Node",
  description: "A node with multiple ports",
  category: "Examples",
  icon: "Clock",
  ports: {
    inputs: [
      { label: "Input 1", type: "target" },
      { label: "Input 2", type: "target" },
    ],
    outputs: [
      { label: "Output 1", type: "source" },
      { label: "Output 2", type: "source" },
    ],
  },
});

// Example with multiple fields of same type
nodeRegistry.register({
  type: "form-examples",
  label: "Form Fields Example",
  description: "Demonstrates different types of form fields",
  category: "Examples",
  icon: "Clock",
  config: {
    form: [
      {
        name: "firstName",
        type: "string",
        label: "First Name",
        required: true,
        value: "John",
      },
      {
        name: "lastName",
        type: "string",
        label: "Last Name",
        required: false,
        value: "Doe",
      },
      {
        name: "age",
        type: "number",
        label: "Age",
        required: false,
        value: 0,
      },
      {
        name: "isActive",
        type: "boolean",
        label: "Active Status",
        required: true,
        value: false,
      },
      {
        name: "userType",
        type: "select",
        label: "User Type",
        required: true,
        options: [
          { value: "admin", label: "Administrator" },
          { value: "user", label: "Regular User" },
          { value: "guest", label: "Guest" },
        ],
        value: "user",
      },
    ],
  },
  ports: {
    inputs: [{ label: "Input", type: "target" }],
    outputs: [{ label: "Output", type: "source" }],
  },
});

//start node
nodeRegistry.register({
  isAddable: false,
  type: "start",
  label: "Start",
  description: "The start of the flow",
  category: "System",
  icon: "Play",
  component: StartNode,
  config: {
    form: [
      {
        name: "triggerType",
        type: "select",
        label: "Trigger Type",
        required: true,
        options: [
          { value: "cronjob", label: "Cronjob" },
          { value: "webhook", label: "Webhook" },
          { value: "onchain", label: "On-Chain Event" },
        ],
        value: "cronjob",
      },
      // Cronjob fields
      {
        name: "cronExpression",
        type: "string",
        label: "Cron Expression",
        required: true,
        value: "0 * * * *", // Every hour by default
        dependsOn: {
          field: "triggerType",
          value: "cronjob",
        },
      },
      // Webhook fields
      {
        name: "webhookPath",
        type: "string",
        label: "Webhook Path",
        required: true,
        value: "/webhook",
        dependsOn: {
          field: "triggerType",
          value: "webhook",
        },
      },
      {
        name: "webhookSecret",
        type: "string",
        label: "Webhook Secret",
        required: false,
        value: "",
        dependsOn: {
          field: "triggerType",
          value: "webhook",
        },
      },
      // On-chain event fields
      {
        name: "contractAddress",
        type: "string",
        label: "Contract Address",
        required: true,
        value: "",
        dependsOn: {
          field: "triggerType",
          value: "onchain",
        },
      },
      {
        name: "eventName",
        type: "string",
        label: "Event Name",
        required: true,
        value: "",
        dependsOn: {
          field: "triggerType",
          value: "onchain",
        },
      },
      {
        name: "network",
        type: "select",
        label: "Network",
        required: true,
        options: [
          { value: "ethereum", label: "Ethereum" },
          { value: "polygon", label: "Polygon" },
          { value: "arbitrum", label: "Arbitrum" },
          { value: "optimism", label: "Optimism" },
        ],
        value: "ethereum",
        dependsOn: {
          field: "triggerType",
          value: "onchain",
        },
      },
    ],
  },
  ports: {
    outputs: [{ label: "Output", type: "source" }],
  },
});

// If node for conditional flow control
nodeRegistry.register({
  type: "if",
  label: "If",
  description: "Conditionally routes flow based on a condition",
  category: "Flow Control",
  icon: "GitBranch",
  config: {
    form: [
      {
        name: "condition",
        type: "select",
        label: "Condition Type",
        required: true,
        options: [
          { value: "equals", label: "Equals" },
          { value: "notEquals", label: "Not Equals" },
          { value: "greaterThan", label: "Greater Than" },
          { value: "lessThan", label: "Less Than" },
        ],
        value: "equals",
      },
      {
        name: "value",
        type: "string",
        label: "Compare Value",
        required: true,
        value: "",
      },
    ],
  },
  ports: {
    inputs: [
      {
        label: "Input",
        type: "target",
        portType: "default",
      },
    ],
    outputs: [
      {
        label: "True",
        type: "source",
        portType: "true",
      },
      {
        label: "False",
        type: "source",
        portType: "false",
      },
    ],
  },
});
