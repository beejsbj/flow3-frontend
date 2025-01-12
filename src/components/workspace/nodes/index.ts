import { PositionLoggerNode } from "./PositionLoggerNode";
import { nodeRegistry } from "./registry";
import type { Node } from "@xyflow/react";
import { Crosshair } from "lucide-react";

export const initialNodes: Node[] = [
  {
    id: "a",
    position: { x: 0, y: 0 },
    data: { label: "wire" },
  },
  {
    id: "b",
    type: "position-logger",
    position: { x: -100, y: 100 },
    data: { label: "drag me!" },
  },
  {
    id: "c",
    position: { x: 100, y: 100 },
    data: { label: "your ideas" },
  },
  {
    id: "d",
    position: { x: 0, y: 200 },
    data: { label: "with React Flow" },
  },
];

// Register the position logger node
nodeRegistry.register({
  type: "position-logger",
  label: "Position Logger",
  description: "Displays the current position of the node",
  category: "Debug",
  icon: Crosshair,
  component: PositionLoggerNode,
});

// Now nodeTypes comes from the registry
export const nodeTypes = nodeRegistry.getNodeTypes();
