import { Handle, Position } from "@xyflow/react";
import { NodeProps, Port } from "@/components/workspace/types";
import { useLayoutDirection } from "@/stores/workspace";
import { useState } from "react";
import { NodeConfigModal } from "./NodeConfigModal";

interface BaseNodeProps extends NodeProps {
  onClick?: () => void;
  children?: React.ReactNode;
  ports?: Port[];
}

function calculatePortPositions(
  ports: Port[],
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

  // Calculate port positions
  const portsWithPositions = calculatePortPositions(ports, direction);

  const handleClick = () => {
    // Only open config modal if node has config schema
    if (data.config?.schema) {
      setConfigModalOpen(true);
    }
    // Still call the original onClick if provided
    onClick?.();
  };

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
            className={`w-16 h-16 bg-secondary flex items-center justify-center rounded-lg border border-solid transition-colors ${
              selected ? "border-primary" : "border-border"
            }`}
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
