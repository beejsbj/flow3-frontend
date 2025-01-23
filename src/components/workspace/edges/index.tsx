import { MarkerType } from "@xyflow/react";
import type { EdgeTypes } from "@/components/workspace/types";
import BaseEdge from "./BaseEdge";

const defaultEdgeOptions = {
  type: "base",
  markerEnd: { type: MarkerType.Arrow },
};

export const edgeTypes = {
  base: BaseEdge,
} satisfies EdgeTypes;

export { defaultEdgeOptions };
