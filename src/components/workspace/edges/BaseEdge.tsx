import {
  BaseEdge as RFBaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { getIconByName } from "@/utils/icons";
import { EdgeProps } from "@/types/types";
import useWorkspaceStore, { useNode } from "@/stores/workspace";
import { cn } from "@/utils/utils";
import { useCallback, useRef } from "react";

// Add CSS custom property type
type CSSProperties = React.CSSProperties & {
  "--edge-length"?: string | number;
};

function BaseEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  label,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const deleteEdge = useWorkspaceStore((state) => state.deleteEdge);
  const CompletedRef = useRef<SVGPathElement>(null);

  const getLength = () => {
    if (!CompletedRef.current) return 0;
    return CompletedRef.current.getTotalLength();
  };

  // Use separate selectors for each node's state to ensure updates
  const sourceNodeState = useNode(source)?.data?.state?.execution;
  const targetNodeState = useNode(target)?.data?.state?.execution;

  const TrashIcon = getIconByName("Trash");

  const edgeAnimated = cn("animate-edge", {
    running: sourceNodeState?.isRunning || targetNodeState?.isRunning,
    failed: sourceNodeState?.isFailed,
  });

  return (
    <>
      <RFBaseEdge
        label={label}
        labelX={labelX}
        labelY={labelY}
        path={edgePath}
        markerEnd={markerEnd}
        className={edgeAnimated}
        style={{
          ...style,
        }}
      ></RFBaseEdge>

      <svg
        className={`${sourceNodeState?.isCompleted ? "" : "hidden"}`}
        style={
          {
            "--edge-length": getLength(),
          } as CSSProperties
        }
      >
        <path
          ref={CompletedRef}
          d={edgePath}
          strokeLinecap="round"
          className="animate-edge completed"
        />
      </svg>
      <EdgeLabelRenderer>
        <div
          className={`edge-buttons nodrag nopan pointer-events-auto absolute opacity-0 transition-opacity ${
            data?.isHovering ? "opacity-100" : ""
          }`}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <Button
            onClick={() => deleteEdge(id)}
            size="icon"
            variant="secondary"
            className="h-6 w-6"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default BaseEdge;
