/* #todo

- [ ] better styling
- [ ] better port positioning
- [ ] tooltip to show validation errors?
- [ ] execution states
*/

import { Handle, Position, useInternalNode } from "@xyflow/react";
import {
  NodeProps,
  Port,
  LayoutOptions,
  Node,
  NodeData,
} from "@/components/workspace/types";
import { useDeleteNode, useLayoutOptions, useNode } from "@/stores/workspace";
import { memo, useState, useEffect } from "react";
import {
  cn,
  getSourceHandlePosition,
  getTargetHandlePosition,
} from "@/lib/utils";
import { getIconByName } from "@/lib/icons";
import React from "react";
import { NodeActions } from "./NodeActions";

interface BaseNodeProps extends NodeProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  hasActions?: boolean;
}

function calculatePortPositions(
  ports: { inputs?: Port[]; outputs?: Port[] },
  layoutOptions: LayoutOptions
): Array<Port & { position: Position; offset: number }> {
  if (!ports) return [];

  const sourcePorts = ports.outputs || [];
  const targetPorts = ports.inputs || [];

  // Add padding from edges (20% from each end)
  const EDGE_PADDING = 0.3;
  const USABLE_SPACE = 1 - EDGE_PADDING * 2;

  // Calculate spacing for each type
  const sourceSpacing =
    sourcePorts.length > 1 ? USABLE_SPACE / (sourcePorts.length - 1) : 0;
  const targetSpacing =
    targetPorts.length > 1 ? USABLE_SPACE / (targetPorts.length - 1) : 0;

  // Process and return all ports
  return [
    ...targetPorts.map((port, index) => {
      const position =
        targetPorts.length === 1
          ? 0.5 // Center if single port
          : EDGE_PADDING + index * targetSpacing;

      return {
        ...port,
        type: "target" as const,
        position: getTargetHandlePosition(layoutOptions.direction),
        offset: position * 100,
      };
    }),
    ...sourcePorts.map((port, index) => {
      const position =
        sourcePorts.length === 1
          ? 0.5 // Center if single port
          : EDGE_PADDING + index * sourceSpacing;

      return {
        ...port,
        type: "source" as const,
        position: getSourceHandlePosition(layoutOptions.direction),
        offset: position * 100,
      };
    }),
  ];
}

function BaseNode({
  type,
  id,
  data,
  children,
  onClick,
  selected,
  className,
  hasActions = true,
  ...props
}: BaseNodeProps) {
  const { icon, label, ports } = data as NodeData;
  const Icon = icon ? getIconByName(icon) : undefined;
  const [actionsOpen, setActionsOpen] = useState(false);

  const layoutOptions = useLayoutOptions();

  // Calculate port positions passing the entire node
  const portsWithPositions = calculatePortPositions(
    ports || {},
    layoutOptions || { direction: "TB", spacing: [50, 50], auto: false }
  );

  const handleClick = () => {
    setActionsOpen(true);
    // Call the original onClick if provided
    onClick?.();
  };

  const handleMouseEnter = () => {
    setTimeout(() => {
      // setActionsOpen(true);
    }, 2000);
  };

  const handleMouseLeave = () => {
    //  setActionsOpen(false);
  };

  // Dynamic border color and animation based on validation and execution state
  const borderColor = cn(
    "relative border border-solid transition-colors animate-node",
    {
      // Validation states
      "border-red-500":
        data?.state?.validation && !data?.state?.validation?.isValid,
      "border-red-800": selected && !data?.state?.validation?.isValid,
      "border-green-500":
        !data?.state?.validation || data?.state?.validation?.isValid,
      "border-green-800":
        selected &&
        (!data?.state?.validation || data?.state?.validation?.isValid),

      // Add animation classes using local state
      running: data?.state?.execution?.isRunning === true,
      completed: data?.state?.execution?.isCompleted === true,
      failed: data?.state?.execution?.isFailed === true,
    }
  );

  return (
    <RFBaseNode
      onClick={handleClick}
      // onMouseEnter={handleMouseEnter}
      // onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col items-center">
        <div className="relative group">
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

          {/* Node Actions */}
          {hasActions && (
            <NodeActions
              id={id}
              data={data}
              open={actionsOpen}
              onOpenChange={setActionsOpen}
            />
          )}

          {/* Square container for icon with dynamic border color and animation */}
          <div
            className={cn(
              "w-16 h-16 bg-secondary flex items-center justify-center rounded-lg hover:bg-muted transition-colors ",
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
    </RFBaseNode>
  );
}

export const RFBaseNode = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} tabIndex={0} role="button" {...props} />);
RFBaseNode.displayName = "RFBaseNode";

export default memo(BaseNode);
