/* #todo

	- [ ] better styling
	- [ ] better port positioning
	- [ ] tooltip to show validation errors?

	//#todo no need for submit button, just update the node values
	/#todo smooth expanding animation

	//#todo better refactoring overall
	*/

// Import statements organized by category
// React and React Flow
import { memo, useState } from "react";
import React from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { Handle, Position } from "@xyflow/react";

// Types
import {
  NodeProps,
  Port,
  LayoutOptions,
  NodeData,
} from "@/components/workspace/types";

// Hooks and Utils
import { useLayoutOptions } from "@/stores/workspace";
import {
  cn,
  getSourceHandlePosition,
  getTargetHandlePosition,
} from "@/lib/utils";
import { getIconByName } from "@/lib/icons";
import { isFeatureEnabled } from "@/config/features";

// Components
import { Label } from "@/components/ui/label";

import { NodeConfigModal } from "../NodeConfigModal";
import IconNode from "./IconNode";
import ConfigNode from "./ConfigNode";
// Types
export interface BaseNodeProps extends NodeProps {
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  configClassName?: string;
  hasActions?: boolean;
  onClick?: () => void;
}

// Utility functions
export function calculatePortPositions(
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

// Accessible components
export const RFBaseNode = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { selected?: boolean }
>(({ selected, ...props }, ref) => (
  <div
    ref={ref}
    tabIndex={0}
    role="button"
    {...props}
    className={cn(
      selected && "border-3 border-solid border-muted-foreground/60 rounded-sm"
    )}
  />
));
RFBaseNode.displayName = "RFBaseNode";

// Main component
function BaseNode({
  type,
  id,
  data,
  children,
  selected,
  className,
  iconClassName,
  configClassName,
  hasActions = true,
  onClick,
  ...props
}: BaseNodeProps) {
  // State
  const [actionsOpen, setActionsOpen] = useState(false);
  const { icon } = data as NodeData;
  const Icon = icon ? getIconByName(icon) : undefined;

  // Hooks
  const layoutOptions = useLayoutOptions();
  const { ports } = data as NodeData;
  const [wrapperRef] = useAutoAnimate();
  // Calculations
  const portsWithPositions = calculatePortPositions(
    ports || {},
    layoutOptions || { direction: "TB", spacing: [50, 50], auto: false }
  );

  // Event handlers
  const handleClick = () => {
    setActionsOpen(true);
    onClick?.();
  };

  return (
    <RFBaseNode onClick={handleClick} selected={selected}>
      <div className="flex flex-col items-center">
        <div className="relative group">
          {/* Ports */}
          {portsWithPositions.map((port) => (
            <Handle
              key={port.id}
              id={port.id}
              type={port.type}
              position={port.position}
              className={cn("w-4 h-4 z-10", {
                "rounded-none w-2": port.type === "target", // Make input handles rectangular
                "rounded-full": port.type === "source", // Keep output handles circular
              })}
              style={{
                [port.position === Position.Left ||
                port.position === Position.Right
                  ? "top"
                  : "left"]: `${port.offset}%`,
              }}
            />
          ))}

          {/* Port Labels */}
          {portsWithPositions.map((port) =>
            port.portType && port.portType !== "default" ? (
              <Label
                key={`${port.id}-label`}
                className="absolute text-xs text-muted-foreground select-none"
                style={{
                  [port.position === Position.Left
                    ? "left"
                    : port.position === Position.Right
                    ? "right"
                    : port.position === Position.Top
                    ? "top"
                    : "bottom"]: "-25px",
                  [port.position === Position.Left ||
                  port.position === Position.Right
                    ? "top"
                    : "left"]: `${port.offset * 2.5}%`,
                  transform: "translate(-220%, -50%)",
                }}
              >
                {port.label}
              </Label>
            ) : null
          )}

          {/* Render either ConfigNode or IconNode based on expanded state */}
          <div ref={wrapperRef}>
            {data.config?.expanded && !isFeatureEnabled("nodeConfigModal") ? (
              <ConfigNode
                id={id}
                data={data}
                className={configClassName}
                Icon={Icon}
              />
            ) : (
              <IconNode
                id={id}
                data={data}
                className={iconClassName}
                hasActions={hasActions}
                actionsOpen={actionsOpen}
                setActionsOpen={setActionsOpen}
                Icon={Icon}
              >
                {children}
              </IconNode>
            )}
          </div>

          {/* Only render modal if feature is enabled */}
          {isFeatureEnabled("nodeConfigModal") && data.config?.expanded && (
            <NodeConfigModal
              nodeId={id}
              data={data}
              open={data.config?.expanded || false}
            />
          )}
        </div>
      </div>
    </RFBaseNode>
  );
}

export default memo(BaseNode);
