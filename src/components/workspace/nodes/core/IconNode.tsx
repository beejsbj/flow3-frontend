import React, { useState } from "react";
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

  Icon?: React.ElementType;
}

//icon Node
export default function IconNode({
  id,
  data,
  children,
  className,

  Icon,
}: IconNodeProps) {
  const { label } = data as NodeData;

  const [actionsOpen, setActionsOpen] = useState(false);

  const handleClick = () => {
    setActionsOpen(true);
  };

  return (
    <>
      {/* Actions */}
      <NodeActionsDropdown
        id={id}
        data={data}
        open={actionsOpen}
        onOpenChange={setActionsOpen}
      />

      {/* Node Icon */}
      <div
        onClick={handleClick}
        className={cn(
          "w-25 h-25 bg-secondary flex items-center justify-center rounded-[inherit] hover:bg-muted transition-colors",
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
