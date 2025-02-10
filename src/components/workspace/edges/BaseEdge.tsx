import {
  BaseEdge as RFBaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { getIconByName } from "@/lib/icons";
import { EdgeProps } from "@/components/workspace/types";
import useWorkspaceStore from "@/stores/workspace";

function BaseEdge({
  id,
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
  const [edgePath, labelX, labelY, offsetX, offsetY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const deleteEdge = useWorkspaceStore((state) => state.deleteEdge);
  const TrashIcon = getIconByName("Trash");

  return (
    <>
      <RFBaseEdge
        label={label}
        labelX={labelX}
        labelY={labelY}
        path={edgePath}
        markerEnd={markerEnd}
        className="group"
        style={{
          ...style,
        }}
      />
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
