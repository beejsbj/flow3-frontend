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

// Components
import { NodeActions, NodeActionsDropdown } from "./NodeActions";
import { Label } from "@/components/ui/label";
import { NodeConfigForm } from "./NodeConfigForm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
interface BaseNodeProps extends NodeProps {
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  configClassName?: string;
  hasActions?: boolean;
  onClick?: () => void;
}

// Types for the nodes
interface IconNodeProps {
  id: string;
  data: NodeData;
  children?: React.ReactNode;
  className?: string;
  hasActions?: boolean;
  actionsOpen: boolean;
  setActionsOpen: (open: boolean) => void;
  Icon?: React.ElementType;
  selected?: boolean;
}

interface ConfigNodeProps {
  id: string;
  data: NodeData;
  className?: string;
  Icon?: React.ElementType;
  selected?: boolean;
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

const classes = {
  running: {
    parent: "relative",

    span: "bg-conic from-transparent to-primary animate-[rotate_2s_linear_infinite]",
  },
  completed: {
    parent: "border-2 border-solid border-success",
    span: "bg-success",
  },
  failed: {
    parent: "relative",
    span: "bg-destructive animate-ping scale-0.8",
  },

  invalid: {
    parent: "border border-solid border-warning",
    span: "hidden",
  },

  valid: {
    parent: "border border-solid border-success",
    span: "hidden",
  },

  selected: {
    parent: "border-2 border-solid border-muted-foreground",
    span: "hidden",
  },
};

// Accessible components
export const RFBaseNode = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} tabIndex={0} role="button" {...props} />);
RFBaseNode.displayName = "RFBaseNode";

//icon Node
function IconNode({
  id,
  data,
  children,
  className,
  hasActions,
  actionsOpen,
  setActionsOpen,
  Icon,
  selected,
}: IconNodeProps) {
  const { label } = data as NodeData;

  // Calculate border color
  const borderColor = cn(
    "relative border border-solid transition-colors animate-node",
    {
      "border-warning":
        data?.state?.validation && !data?.state?.validation?.isValid,
      "border-warning/80": selected && !data?.state?.validation?.isValid,
      "border-success":
        !data?.state?.validation || data?.state?.validation?.isValid,
      "border-success/80":
        selected &&
        (!data?.state?.validation || data?.state?.validation?.isValid),
      running: data?.state?.execution?.isRunning === true,
      completed: data?.state?.execution?.isCompleted === true,
      failed: data?.state?.execution?.isFailed === true,
    }
  );

  return (
    <>
      {/* Actions */}
      {hasActions && (
        <NodeActionsDropdown
          id={id}
          data={data}
          open={actionsOpen}
          onOpenChange={setActionsOpen}
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

      {/* Label */}
      {label && (
        <div className="absolute bottom--10 left-1/2 -translate-x-1/2 text-xs text-foreground">
          {label}
        </div>
      )}
    </>
  );
}

function ConfigNode({ id, data, className, Icon, selected }: ConfigNodeProps) {
  const { label } = data as NodeData;
  // Calculate status info
  const getStatusInfo = () => {
    if (data?.state?.execution?.isRunning) {
      return {
        icon: getIconByName("loader2"),
        color: "text-primary",
        bgColor: "bg-primary",
        tooltip: "Running",
      };
    }
    if (data?.state?.execution?.isFailed) {
      return {
        icon: getIconByName("xCircle"),
        color: "text-destructive",
        bgColor: "bg-destructive",
        tooltip: "Failed",
      };
    }
    if (data?.state?.execution?.isCompleted) {
      return {
        icon: getIconByName("CheckCircle"),
        color: "text-success",
        bgColor: "bg-success",
        tooltip: "Completed",
      };
    }
    if (data?.state?.validation?.isValid === false) {
      return {
        icon: getIconByName("alertCircle"),
        color: "text-warning",
        bgColor: "bg-warning",
        tooltip: "Invalid Configuration",
      };
    }
    return {
      icon: getIconByName("circle"),
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      tooltip: "Ready",
    };
  };

  const status = getStatusInfo();

  const StatusIcon = status.icon;

  // Calculate border color
  const borderColor = cn("relative border border-solid transition-colors", {
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
    <div
      className={cn(
        "w-[300px] bg-secondary p-4 rounded-lg hover:bg-muted transition-colors",
        borderColor,
        className
      )}
    >
      {/* Updated Header with Status Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-6 h-6" />}
          {label && <div className="text-sm font-medium">{label}</div>}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className={cn("ml-2", status.color)}>
                  <StatusIcon
                    className={cn("w-4 h-4", {
                      "animate-spin": data?.state?.execution?.isRunning,
                    })}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className={cn(status.bgColor)}>
                <p>{status.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <NodeActions id={id} data={data} />
      </div>

      {/* Form */}
      <div className="bg-background rounded p-2">
        <NodeConfigForm
          data={data}
          onSubmit={(values) => {
            console.log("Form values:", values);
          }}
        />
      </div>
    </div>
  );
}

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

          {/* Render either ConfigNode or IconNode based on expanded state */}
          <div className="">
            {data.config?.expanded ? (
              <ConfigNode
                id={id}
                data={data}
                className={configClassName}
                Icon={Icon}
                selected={selected}
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
                selected={selected}
              >
                {children}
              </IconNode>
            )}
          </div>
        </div>
      </div>
    </RFBaseNode>
  );
}

export default memo(BaseNode);
