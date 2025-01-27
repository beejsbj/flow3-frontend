import { LucideIcon } from "lucide-react";
import { Node as NodeType, NodeData, Port } from "../types";
import { nodeRegistry } from "./registry";

export class Node implements NodeType {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
  test: string;

  constructor(type: string, position: { x: number; y: number }) {
    if (!nodeRegistry.has(type)) {
      throw new Error(`Node type "${type}" not found in registry`);
    }
    this.type = type;
    this.position = position;
    this.test = "test";
    this.id = this.generateId();
    this.data = this.createNodeData();
    this.validate = this.validate;
    this.updatePortConnections = this.updatePortConnections;
    this.updateValues = this.updateValues;

    this.validate();
  }

  private generateId(): string {
    return `${this.type}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  private createPorts(ports?: Port[]): Port[] {
    if (!ports) return [];
    return ports.map((port, index) => ({
      ...port,
      id: `_${port.type}-${index}_`,
    }));
  }

  private createNodeData(): NodeData {
    const definition = nodeRegistry.get(this.type);

    const ports = this.createPorts(definition!.ports);
    return {
      label: definition!.label,
      icon: definition!.icon as LucideIcon,
      description: definition!.description,
      category: definition!.category,
      config: definition!.config,
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

    //check ports connections
    this.data.ports.forEach((port) => {
      if (!port.edgeId) {
        errors.push(`Please connect ${port.label}`);
      }
    });

    this.data.state.validation = {
      isValid: errors.length === 0,
      errors,
    };
  }

  updatePortConnections(portId: string | null, edgeId: string): void {
    if (!portId) return;
    this.data.ports.forEach((port) => {
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
