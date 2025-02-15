import type { EdgeTypes } from "@/types/types";
import BaseEdge from "./BaseEdge";
import { MarkerType } from "@xyflow/react";
const defaultEdgeOptions = {
  type: "base",
  markerEnd: { type: MarkerType.Arrow },
  //   animated: true,
};

export const edgeTypes = {
  base: BaseEdge,
} satisfies EdgeTypes;

export { defaultEdgeOptions };
