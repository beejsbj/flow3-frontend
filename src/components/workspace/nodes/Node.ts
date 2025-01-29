import { Node as NodeType, NodeData, Port } from "../types";
import { nodeRegistry } from "./registry";
import "@/components/workspace/nodes";

export class Node implements NodeType {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;

  constructor(
    type: string,
    position: { x: number; y: number } = { x: 0, y: 0 }
  ) {
    if (!nodeRegistry.has(type)) {
      throw new Error(`Node type "${type}" not found in registry`);
    }
    this.type = type;
    this.position = position;
    this.id = this.generateId();
    this.data = this.createNodeData();

    // Bind methods to this instance
    this.validate = this.validate.bind(this);
    this.updatePortConnections = this.updatePortConnections.bind(this);
    this.updateValues = this.updateValues.bind(this);

    this.validate();
  }

  // Static factory methods
  static create(type: string, position?: { x: number; y: number }) {
    return new Node(type, position);
  }

  static createFromStorage(data: {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: NodeData;
  }): Node {
    const node = new Node(data.type, data.position);
    node.id = data.id;
    node.data = data.data;
    return node;
  }

  // Serialization method
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      data: this.data,
    };
  }

  private generateId(): string {
    return `${this.type}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  private createPorts(ports?: { inputs?: Port[]; outputs?: Port[] }): {
    inputs?: Port[];
    outputs?: Port[];
  } {
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
  }

  private createNodeData(): NodeData {
    const definition = nodeRegistry.get(this.type);
    if (!definition) {
      throw new Error(`Node type "${this.type}" not found in registry`);
    }

    const ports = this.createPorts(definition.ports);
    return {
      label: definition.label,
      icon: definition.icon, // Now it's a string, no need for casting
      description: definition.description,
      category: definition.category,
      config: definition.config,
      ports,
      state: {
        validation: { isValid: true, errors: [] },
      },
    };
  }

  validate(): void {
    if (!this.data.config?.form) {
      return;
    }

    const errors: string[] = [];

    this.data.config.form.forEach((field) => {
      if (field.required) {
        const value = field.value;
        if (value === undefined || value === "" || value === null) {
          errors.push(`${field.label} is required`);
        }
      }
    });

    // Update port validation to handle new structure
    const allPorts = [
      ...(this.data.ports?.inputs || []),
      ...(this.data.ports?.outputs || []),
    ];

    allPorts.forEach((port) => {
      if (!port.edgeId) {
        errors.push(`Please connect ${port.label}`);
      }
    });

    if (this.data.state) {
      this.data.state.validation = {
        isValid: errors.length === 0,
        errors,
      };
    }
  }

  updatePortConnections(portId: string | null, edgeId: string): void {
    if (!portId) return;

    // Check inputs
    this.data.ports?.inputs?.forEach((port) => {
      if (port.id === portId) {
        port.edgeId = edgeId;
      }
    });

    // Check outputs
    this.data.ports?.outputs?.forEach((port) => {
      if (port.id === portId) {
        port.edgeId = edgeId;
      }
    });

    this.validate();
  }

  updateValues(values: Record<string, any>): void {
    if (!this.data.config?.form) {
      return;
    }

    this.data.config.form = this.data.config.form.map((field) => ({
      ...field,
      value: values[field.name] ?? field.value,
    }));

    // Validate after updating values
    this.validate();
  }
}
