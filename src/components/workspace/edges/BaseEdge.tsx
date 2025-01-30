import { BaseEdge as RFBaseEdge, getSmoothStepPath } from "@xyflow/react";

import { EdgeProps } from "@/components/workspace/types";

function BaseEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <RFBaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
      }}
    />
  );
}

export default BaseEdge;
