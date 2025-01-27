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
    if (!this.data.config?.fields) {
      return;
    }

    const errors: string[] = [];

    Object.entries(this.data.config.fields).forEach(([fieldName, field]) => {
      if (field.required) {
        const value = this.data.config?.values?.[fieldName];
        if (value === undefined || value === "" || value === null) {
          errors.push(`${field.label} is required`);
        }
      }
    });

    // update node validation
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
  }
}
