import { nodeRegistry } from "./registry";
import { PlaceholderNode } from "./PlaceholderNode";
import { PositionLoggerNode } from "./PositionLoggerNode";

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

nodeRegistry.register({
  type: "placeholder",
  label: "Add Node",
  description: "Click to add a new node",
  category: "System",
  icon: "Plus",
  component: PlaceholderNode,
  ports: {
    inputs: [{ label: "Input", type: "target" }],
    outputs: [{ label: "Output", type: "source" }],
  },
});

//start node
nodeRegistry.register({
  type: "start",
  label: "Start",
  description: "The start of the flow",
  category: "System",
  icon: "Play",
  ports: {
    outputs: [{ label: "Output", type: "source" }],
  },
});

// Now nodeTypes comes from the registry
export const nodeTypes = nodeRegistry.getNodeTypes();
