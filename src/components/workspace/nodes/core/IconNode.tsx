import React from "react";
import { NodeData } from "../../types";
import { cn } from "@/lib/utils";
import { NodeActionsDropdown } from "../NodeActions";
import StatusIcon from "./StatusIcon";

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
}

//icon Node
export default function IconNode({
  id,
  data,
  children,
  className,
  hasActions,
  actionsOpen,
  setActionsOpen,
  Icon,
}: IconNodeProps) {
  const { label } = data as NodeData;

  // Calculate border color
  const borderColor = cn(
    "relative border border-solid transition-colors animate-node-border",
    {
      "border-warning":
        data?.state?.validation && !data?.state?.validation?.isValid,
      "border-success":
        !data?.state?.validation || data?.state?.validation?.isValid,
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
          "w-25 h-25 bg-secondary flex items-center justify-center rounded-sm hover:bg-muted transition-colors",
          borderColor,
          className
        )}
      >
        {children || (Icon && <Icon className="w-10 h-10" />)}

        <StatusIcon
          data={data}
          size={16}
          className="absolute bottom-1 right-1"
        />
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
