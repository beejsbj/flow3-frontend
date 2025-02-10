import { nodeRegistry } from "@/services/registry";
import { PlaceholderNode } from "./types/PlaceholderNode";
import { PositionLoggerNode } from "./types/PositionLoggerNode";
import { StartNode } from "./types/StartNode";

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
  isAddable: false,
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

// Now nodeTypes comes from the registry
export const nodeTypes = nodeRegistry.getNodeTypes();
