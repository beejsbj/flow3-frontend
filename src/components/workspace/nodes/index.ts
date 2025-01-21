import { PositionLoggerNode } from "./PositionLoggerNode";
import { nodeRegistry } from "./registry";
import type { Node } from "@/components/workspace/types";
import { Crosshair, Clock } from "lucide-react";

// Register the position logger node first
nodeRegistry.register({
  type: "position-logger",
  label: "Position Logger",
  description: "Displays the current position of the node",
  category: "Debug",
  icon: Crosshair,
  component: PositionLoggerNode,
});

// Delay node
nodeRegistry.register({
  type: "delay",
  label: "Delay",
  description: "Adds a time delay to the flow",
  category: "Flow Control",
  icon: Clock,
  config: {
    schema: [
      {
        name: "delay",
        type: "number",
        label: "Delay (ms)",
        defaultValue: 1000,
        required: true,
      },
    ],
  },
  ports: [
    { type: "target", label: "Input" },
    { type: "source", label: "Output" },
  ],
});

// Example of registering a node with multiple ports
nodeRegistry.register({
  type: "multi-port-node",
  label: "Multi Port Node",
  description: "A node with multiple ports",
  category: "Flow Control",
  icon: Clock,
  ports: [
    { type: "target", label: "Input 1" },
    { type: "target", label: "Input 2" },
    { type: "source", label: "Output" },
  ],
});

// Create initial nodes using the registry
export const initialNodes: Node[] = [
  nodeRegistry.createNodeFromDefinition("position-logger", { x: 100, y: 100 }),
  nodeRegistry.createNodeFromDefinition("multi-port-node", { x: 0, y: 200 }),
].filter((node): node is Node => node !== undefined);

// Now nodeTypes comes from the registry
export const nodeTypes = nodeRegistry.getNodeTypes();
