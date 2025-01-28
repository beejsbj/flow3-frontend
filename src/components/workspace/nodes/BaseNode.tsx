import { Handle, Position, useInternalNode } from "@xyflow/react";
import { NodeProps, Port, LayoutOptions } from "@/components/workspace/types";
import { useLayoutOptions, useNode } from "@/stores/workspace";
import { useState } from "react";
import { NodeConfigModal } from "./NodeConfigModal";
import {
  cn,
  getSourceHandlePosition,
  getTargetHandlePosition,
} from "@/lib/utils";
import React from "react";

interface BaseNodeProps extends NodeProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

function calculatePortPositions(ports: Port[], layoutOptions: LayoutOptions) {
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

    // Use the node's source/target position based on layout direction
    const handlePosition = isSource
      ? getSourceHandlePosition(layoutOptions.direction)
      : getTargetHandlePosition(layoutOptions.direction);

    return {
      ...port,
      position: handlePosition,
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
  className,
  ...props
}: BaseNodeProps) {
  const { icon: Icon, label, ports } = data;

  const [configModalOpen, setConfigModalOpen] = useState(false);
  const node = useNode(id);
  const internalNode = useInternalNode(id);
  const layoutOptions = useLayoutOptions();

  // Calculate port positions passing the entire node
  const portsWithPositions = calculatePortPositions(ports, layoutOptions);

  const handleClick = () => {
    // Only open config modal if node has config form
    if (data.config?.form && data.config.form.length > 0) {
      setConfigModalOpen(true);
    }
    // Still call the original onClick if provided
    onClick?.();
  };

  // Dynamic border color based on validation

  const borderColor = cn("border border-solid transition-colors", {
    "border-red-500":
      data?.state?.validation && !data?.state?.validation?.isValid,
    "border-red-800": selected && !data?.state?.validation?.isValid,

    "border-green-500":
      !data?.state?.validation || data?.state?.validation?.isValid,
    "border-green-800":
      selected &&
      (!data?.state?.validation || data?.state?.validation?.isValid),
  });

  return (
    <RFBaseNode onClick={handleClick}>
      <div className="flex flex-col items-center">
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
            className={cn(
              "w-16 h-16 bg-secondary flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors",

              borderColor,
              className
            )}
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
    </RFBaseNode>
  );
}

export const RFBaseNode = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} tabIndex={0} role="button" {...props} />);
RFBaseNode.displayName = "RFBaseNode";
