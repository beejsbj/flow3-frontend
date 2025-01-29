/* #todo

- [ ] better styling
- [ ] better port positioning
- [ ] delete node button
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
import { useState, memo } from "react";
import { NodeConfigModal } from "./NodeConfigModal";
import {
  cn,
  getSourceHandlePosition,
  getTargetHandlePosition,
} from "@/lib/utils";
import { getIconByName } from "@/lib/icons";
import React from "react";
import { Button } from "@/components/ui/button";

interface BaseNodeProps extends NodeProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
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
  ...props
}: BaseNodeProps) {
  const { icon, label, ports } = data as NodeData;
  const Icon = icon ? getIconByName(icon) : undefined;

  const [configModalOpen, setConfigModalOpen] = useState(false);
  const node = useNode(id) as Node | undefined;
  const internalNode = useInternalNode(id);
  const layoutOptions = useLayoutOptions();
  const deleteNode = useDeleteNode();

  console.log(type, data);

  // Calculate port positions passing the entire node
  const portsWithPositions = calculatePortPositions(
    data.ports || {},
    layoutOptions || { direction: "TB", spacing: [50, 50], auto: false }
  );

  const handleClick = () => {
    // Only open config modal if node has config form
    if (data.config?.form && data.config.form.length > 0) {
      setConfigModalOpen(true);
    }
    // Still call the original onClick if provided
    onClick?.();
  };

  const handleOpenChange = (open: boolean) => {
    setConfigModalOpen(open);
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

          {/* Delete button - controlled by data.isDeletable */}
          {data?.isDeletable !== false && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 
                        opacity-0 group-hover:opacity-100 transition-opacity z-10
                        rounded-full h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(id);
              }}
            >
              ×
            </Button>
          )}

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
        onOpenChange={handleOpenChange}
      />
    </RFBaseNode>
  );
}

export const RFBaseNode = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} tabIndex={0} role="button" {...props} />);
RFBaseNode.displayName = "RFBaseNode";

export default memo(BaseNode);
