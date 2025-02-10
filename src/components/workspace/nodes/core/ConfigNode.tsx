import React from "react";
import { NodeData } from "../../types";
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

  // Calculate border color
  const borderColor = cn("relative border border-solid transition-colors", {
    "border-warning":
      data?.state?.validation && !data?.state?.validation?.isValid,
    "border-success":
      !data?.state?.validation || data?.state?.validation?.isValid,
  });

  return (
    <div
      className={cn(
        "w-[300px] bg-secondary p-4 rounded-sm hover:bg-muted transition-colors",
        borderColor,
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
