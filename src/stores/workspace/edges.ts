import { WorkspaceState, type Edge } from "@/types/types";
import { applyEdgeChanges } from "@xyflow/react";
import { addEdge } from "@xyflow/react";

// Edge Slice
export type EdgeSlice = Pick<
  WorkspaceState,
  | "edges"
  | "getEdge"
  | "deleteEdge"
  | "updateEdge"
  | "updateEdgeHover"
  | "toggleEdgeAnimated"
  | "setEdges"
  | "onEdgesChange"
  | "onConnect"
>;

export const createEdgeSlice = (set: any, get: any): EdgeSlice => ({
  edges: [],
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges).map((edge) => ({
        ...edge,
        data: edge.data || {},
      })) as Edge[],
      lastModified: new Date(),
    });
  },

  onConnect: (connection) => {
    const edgeId = `xy-edge__${connection.source}${
      connection.sourceHandle || ""
    }-${connection.target}${connection.targetHandle || ""}`;

    get().setEdges(addEdge(connection, get().edges));
  },
  setEdges: (edges, saveSnapshot = true) => {
    if (!get().isBatchOperation && saveSnapshot) {
      get().takeSnapshot();
    }
    set({ edges, lastModified: new Date() });
  },

  // ----- Edge Actions -----
  getEdge: (edgeId: string) => {
    return get().edges.find((edge: Edge) => edge.id === edgeId);
  },

  deleteEdge: (edgeId: string) => {
    const edge = get().getEdge(edgeId);
    if (!edge) return;

    get().setEdges(get().edges.filter((edge: Edge) => edge.id !== edgeId));
  },

  updateEdge: (edge: Edge) => {
    get().setEdges(get().edges.map((e: Edge) => (e.id === edge.id ? edge : e)));
  },

  updateEdgeHover: (edgeId: string, hover: boolean) => {
    const edge = get().getEdge(edgeId);
    if (!edge) return;
    const updatedEdge = {
      ...edge,
      data: {
        ...edge.data,
        isHovering: hover,
      },
    };
    get().updateEdge(updatedEdge);
  },

  toggleEdgeAnimated: (edgeId: string, isRunning: boolean) => {
    const edge = get().getEdge(edgeId);
    if (!edge) return;
    const updatedEdge = {
      ...edge,
      animated: isRunning,
    };

    console.log("updatedEdge", updatedEdge);
    get().updateEdge(updatedEdge);
  },
});
