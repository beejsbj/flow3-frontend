import React from "react";
import { NodeData } from "../../../../types/types";
import { cn } from "@/lib/utils";
import { NodeActions } from "../NodeActions";
import { NodeConfigForm } from "../NodeConfigForm";
import StatusIcon from "./StatusIcon";

interface ConfigNodeProps {
  id: string;
  data: NodeData;
  className?: string;
  Icon?: React.ElementType;
}

export default function ConfigNode({
  id,
  data,
  className,
  Icon,
}: ConfigNodeProps) {
  const { label } = data as NodeData;

  return (
    <div
      className={cn(
        "w-[300px] bg-secondary p-4 rounded-[inherit] hover:bg-muted transition-colors",
        className
      )}
    >
      {/* Updated Header with Status Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-6 h-6" />}
          {label && <div className="text-sm font-medium">{label}</div>}
          <StatusIcon data={data} size={16} />
        </div>
        <NodeActions id={id} data={data} />
      </div>

      {/* Form */}
      <div className="bg-background rounded p-2">
        <NodeConfigForm data={data} nodeId={id} />
      </div>
    </div>
  );
}
