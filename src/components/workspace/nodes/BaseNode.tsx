import { Handle, Position } from "@xyflow/react";
import {
  NodeProps,
  Port,
  NodeData,
  NodeValidation,
} from "@/components/workspace/types";
import {
  useLayoutDirection,
  useUpdateNodeData,
  useUpdateNodeValidation,
} from "@/stores/workspace";
import { useState } from "react";
import { NodeConfigModal } from "./NodeConfigModal";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface BaseNodeProps extends NodeProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

function calculatePortPositions(
  ports: Port[] | undefined,
  direction: "horizontal" | "vertical"
) {
  if (!ports || ports.length === 0) return [];
  const sourcePorts = ports.filter((p) => p.type === "source");
  const targetPorts = ports.filter((p) => p.type === "target");

  // Add padding from edges (20% from each end)
  const EDGE_PADDING = 0.2;
  const USABLE_SPACE = 1 - EDGE_PADDING * 2;

  // Calculate spacing for each type
  const sourceSpacing =
    sourcePorts.length > 1 ? USABLE_SPACE / (sourcePorts.length - 1) : 0;
  const targetSpacing =
    targetPorts.length > 1 ? USABLE_SPACE / (targetPorts.length - 1) : 0;

  // Add position data to each port
  return ports.map((port) => {
    const isSource = port.type === "source";
    const portList = isSource ? sourcePorts : targetPorts;
    const index = portList.indexOf(port);
    const spacing = isSource ? sourceSpacing : targetSpacing;

    // Calculate relative position (0 to 1)
    const position =
      portList.length === 1
        ? 0.5 // Center if single port
        : EDGE_PADDING + index * spacing;

    return {
      ...port,
      position:
        direction === "horizontal"
          ? isSource
            ? Position.Right
            : Position.Left
          : isSource
          ? Position.Bottom
          : Position.Top,
      offset: position * 100,
    };
  });
}

function validateNode(
  nodeId: string,
  data: NodeData,
  updateNodeValidation: (nodeId: string, validation: NodeValidation) => void
) {
  if (!data.config?.fields) return;

  const errors: string[] = [];

  Object.entries(data.config.fields).forEach(([fieldName, field]) => {
    if (field.required) {
      const value = data.config?.values?.[fieldName];
      if (value === undefined || value === "" || value === null) {
        errors.push(`${field.label} is required`);
      }
    }
  });

  const validation = {
    isValid: errors.length === 0,
    errors,
  };

  // Only update if validation state actually changed
  if (JSON.stringify(data.state.validation) !== JSON.stringify(validation)) {
    updateNodeValidation(nodeId, validation);
  }
}

export function BaseNode({
  type,
  id,
  data,
  children,
  onClick,
  selected,
}: BaseNodeProps) {
  const { icon: Icon, label, ports } = data;
  const direction = useLayoutDirection();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const updateNodeData = useUpdateNodeData();
  const updateNodeValidation = useUpdateNodeValidation();

  // Calculate port positions
  const portsWithPositions = calculatePortPositions(
    ports,
    direction ?? "horizontal"
  );

  // Validate when config values change
  useEffect(() => {
    validateNode(id, data, updateNodeValidation);
  }, [data.config?.values, id, updateNodeValidation]);

  const handleClick = () => {
    // Only open config modal if node has config schema
    if (data.config?.fields) {
      setConfigModalOpen(true);
    }
    // Still call the original onClick if provided
    onClick?.();
  };

  // Dynamic border color based on validation
  const borderColor = cn("border border-solid transition-colors", {
    "border-red-500": data.state.validation && !data.state.validation.isValid,
    "border-primary": selected,
    "border-border":
      !selected && (!data.state.validation || data.state.validation.isValid),
  });

  return (
    <>
      <div className="flex flex-col items-center" onClick={handleClick}>
        <div className="relative">
          {/* Render all ports */}
          {portsWithPositions.map((port) => (
            <Handle
              key={port.id}
              id={port.id}
              type={port.type}
              position={port.position}
              style={{
                [port.position === Position.Left ||
                port.position === Position.Right
                  ? "top"
                  : "left"]: `${port.offset}%`,
              }}
            />
          ))}

          {/* Square container for icon with dynamic border color */}
          <div
            className={`w-16 h-16 bg-secondary flex items-center justify-center rounded-lg ${borderColor}`}
          >
            {children ? children : Icon && <Icon />}
          </div>
        </div>

        {/* Label below the node */}
        {label && <div className="mt-2 text-xs text-foreground">{label}</div>}
      </div>

      <NodeConfigModal
        nodeId={id}
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
      />
    </>
  );
}
