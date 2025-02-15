import { NodeProps } from "@/types/types";
import BaseNode from "../core/BaseNode";

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
