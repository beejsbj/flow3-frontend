import { NodeProps } from "@/components/workspace/types";
import { BaseNode } from "./BaseNode";

export function PositionLoggerNode(props: NodeProps) {
  const { positionAbsoluteX, positionAbsoluteY } = props;
  const x = `${Math.round(positionAbsoluteX)}px`;
  const y = `${Math.round(positionAbsoluteY)}px`;

  return (
    <BaseNode {...props}>
      <p className="text-xs text-foreground">
        {x} {y}
      </p>
    </BaseNode>
  );
}
