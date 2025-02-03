/* #todo

- [ ] better styling
- [ ] better port positioning
- [ ] tooltip to show validation errors?
- [ ] execution states
*/

// Import statements organized by category
// React and React Flow
import { memo, useState, useEffect } from "react";
import React from "react";
import { Handle, Position, useInternalNode } from "@xyflow/react";

// Types
import {
  NodeProps,
  Port,
  LayoutOptions,
  Node,
  NodeData,
} from "@/components/workspace/types";

// Hooks and Utils
import { useDeleteNode, useLayoutOptions, useNode } from "@/stores/workspace";
import {
  cn,
  getSourceHandlePosition,
  getTargetHandlePosition,
} from "@/lib/utils";
import { getIconByName } from "@/lib/icons";

// Components
import { NodeActions } from "./NodeActions";
import { Label } from "@/components/ui/label";
import { NodeConfigModal } from "./NodeConfigModal";

// Types
interface BaseNodeProps extends NodeProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  hasActions?: boolean;
}

// Utility functions
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

// Styled components
export const RFBaseNode = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} tabIndex={0} role="button" {...props} />);
RFBaseNode.displayName = "RFBaseNode";

// Main component
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
  // State
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  // Hooks
  const layoutOptions = useLayoutOptions();
  const { icon, label, ports } = data as NodeData;
  const Icon = icon ? getIconByName(icon) : undefined;

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

  // Styles
  const borderColor = cn(
    "relative border border-solid transition-colors animate-node",
    {
      "border-red-500":
        data?.state?.validation && !data?.state?.validation?.isValid,
      "border-red-800": selected && !data?.state?.validation?.isValid,
      "border-green-500":
        !data?.state?.validation || data?.state?.validation?.isValid,
      "border-green-800":
        selected &&
        (!data?.state?.validation || data?.state?.validation?.isValid),
      running: data?.state?.execution?.isRunning === true,
      completed: data?.state?.execution?.isCompleted === true,
      failed: data?.state?.execution?.isFailed === true,
    }
  );

  return (
    <>
      <RFBaseNode onClick={handleClick}>
        <div className="flex flex-col items-center">
          <div className="relative group">
            {/* Ports */}
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

            {/* Actions */}
            {hasActions && (
              <NodeActions
                id={id}
                data={data}
                open={actionsOpen}
                onOpenChange={setActionsOpen}
                onConfigOpen={() => setConfigModalOpen(true)}
              />
            )}

            {/* Node Icon */}
            <div
              className={cn(
                "w-16 h-16 bg-secondary flex items-center justify-center rounded-lg hover:bg-muted transition-colors",
                borderColor,
                className
              )}
            >
              {children || (Icon && <Icon />)}
            </div>
          </div>

          {/* Label */}
          {label && <div className="mt-2 text-xs text-foreground">{label}</div>}
        </div>
      </RFBaseNode>

      {/* Config Modal */}
      {data && (
        <NodeConfigModal
          nodeId={id}
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
        />
      )}
    </>
  );
}

export default memo(BaseNode);
