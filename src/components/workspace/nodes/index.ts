import { PositionLoggerNode } from "./PositionLoggerNode";
import { nodeRegistry } from "./registry";
import {
  Crosshair,
  Clock,
  Square,
  ArrowLeftCircle,
  ArrowRightCircle,
  Folder,
} from "lucide-react";

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
    fields: {
      delay: {
        type: "number",
        label: "Delay (ms)",
        required: true,
      },
    },
    values: {
      delay: 1000, // Default value only defined here
    },
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
  category: "Examples",
  icon: Clock,
  ports: [
    { type: "target", label: "Input 1" },
    { type: "target", label: "Input 2" },
    { type: "source", label: "Output" },
  ],
});

// Example nodes demonstrating different form fields
nodeRegistry.register({
  type: "form-examples",
  label: "Form Fields Example",
  description: "Demonstrates different types of form fields",
  category: "Examples",
  icon: Clock,
  config: {
    fields: {
      textField: {
        type: "string",
        label: "Text Input",
        required: true,
      },
      numberField: {
        type: "number",
        label: "Number Input",
        required: false,
      },
      booleanField: {
        type: "boolean",
        label: "Toggle Switch",
        required: true,
      },
      dropdownField: {
        type: "select",
        label: "Dropdown Menu",
        required: true,
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
          { value: "option3", label: "Option 3" },
        ],
      },
    },
    values: {
      textField: "",
      numberField: 42,
      booleanField: false,
      dropdownField: "option1",
    },
  },
  ports: [
    { type: "target", label: "Input" },
    { type: "source", label: "Output" },
  ],
});

// Register default React Flow node types
nodeRegistry.register({
  type: "default",
  label: "Default Node",
  description: "A default node with input and output ports",
  category: "Examples",
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
  category: "Examples",
  icon: ArrowRightCircle,
  ports: [{ type: "source", label: "Output" }],
});

nodeRegistry.register({
  type: "output",
  label: "Output Node",
  description: "A node with only input ports",
  category: "Examples",
  icon: ArrowLeftCircle,
  ports: [{ type: "target", label: "Input" }],
});

// Now nodeTypes comes from the registry
export const nodeTypes = nodeRegistry.getNodeTypes();
