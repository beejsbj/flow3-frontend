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
import { NodeProps, Port, LayoutOptions, NodeData } from "@/types/types";

// Hooks and Utils
import { useLayoutOptions } from "@/stores/workspace";
import {
  cn,
  getSourceHandlePosition,
  getTargetHandlePosition,
} from "@/utils/utils";
import { getIconByName } from "@/utils/icons";
import { isFeatureEnabled } from "@/config/features";

// Components

import { NodeConfigModal } from "../NodeConfigModal";
import IconNode from "./IconNode";
import ConfigNode from "./ConfigNode";
import BaseHandle from "../../handles/BaseHandle";
// Types
export interface BaseNodeProps extends NodeProps {
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  configClassName?: string;
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
  <div ref={ref} tabIndex={0} role="button" {...props} />
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
  onClick,
  ...props
}: BaseNodeProps) {
  // State
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
    onClick?.();
  };

  // Calculate border color and rounded corners based on ports
  const borderStyle = cn(
    "relative border-2 border-solid transition-colors rounded-sm",
    {
      "ring-3 ring-muted-foreground/60": selected,
      "border-warning":
        data?.state?.validation && !data?.state?.validation?.isValid,
      "border-success":
        !data?.state?.validation || data?.state?.validation?.isValid,
      "running animate-node-border":
        data?.state?.execution?.isRunning === true &&
        data?.state?.validation?.isValid,
      "completed animate-node-border":
        data?.state?.execution?.isCompleted === true &&
        data?.state?.validation?.isValid,
      "failed animate-node-border":
        data?.state?.execution?.isFailed === true &&
        data?.state?.validation?.isValid,
      // Add rounded corners based on ports
      "rounded-l-3xl":
        !ports?.inputs?.length && layoutOptions?.direction === "LR",
      "rounded-r-3xl":
        !ports?.outputs?.length && layoutOptions?.direction === "LR",
      "rounded-t-3xl":
        !ports?.inputs?.length && layoutOptions?.direction === "TB",
      "rounded-b-3xl":
        !ports?.outputs?.length && layoutOptions?.direction === "TB",
    }
  );

  return (
    <RFBaseNode onClick={handleClick} selected={selected}>
      <div className="flex flex-col items-center">
        <div className="relative group">
          {/* Ports */}
          {portsWithPositions.map((port) => {
            return <BaseHandle key={port.id} port={port} nodeId={id} />;
          })}

          {/* Render either ConfigNode or IconNode based on expanded state */}
          <div ref={wrapperRef} className={borderStyle}>
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
