import {
  WorkspaceExecution,
  WorkspaceState,
  WorkspaceValidation,
  type Node,
} from "@/components/workspace/types";

export type StateSlice = Pick<
  WorkspaceState,
  | "validation"
  | "validate"
  | "execution"
  | "setExecutionState"
  | "history"
  | "takeSnapshot"
  | "undo"
  | "redo"
  | "canUndo"
  | "canRedo"
  | "isBatchOperation"
  | "startBatch"
  | "endBatch"
>;

export const createStateSlice = (set: any, get: any): StateSlice => ({
  validation: { isValid: true, errors: [] },
  execution: {
    isRunning: false,
    isCompleted: false,
    isFailed: false,
    isCancelled: false,
    error: undefined,
  },
  history: { past: [], future: [] },
  isBatchOperation: false,

  validate: () => {
    const errors: WorkspaceValidation["errors"] = [];
    get().nodes.forEach((node: Node) => {
      if (node.data?.state?.validation?.isValid === false) {
        errors.push({
          node: node,
          nodeId: node.id,
          errors: node.data.state.validation.errors || [],
        });
      }
    });

    set({
      validation: {
        isValid: errors.length === 0,
        errors,
      },
    });
  },

  // ----- Execution Actions -----
  setExecutionState: (execution: WorkspaceExecution) => {
    set({ execution });
  },

  // ----- History Actions -----
  takeSnapshot: () => {
    set((state: WorkspaceState) => ({
      history: {
        past: [
          ...state.history.past.slice(state.history.past.length - 99),
          { nodes: state.nodes, edges: state.edges },
        ],
        future: [],
      },
    }));
  },

  undo: () => {
    const previous = get().history.past[get().history.past.length - 1];
    if (previous) {
      set({
        history: {
          past: get().history.past.slice(0, -1),
          future: [
            ...get().history.future,
            { nodes: get().nodes, edges: get().edges },
          ],
        },
        nodes: previous.nodes,
        edges: previous.edges,
      });
    }
  },

  redo: () => {
    const next = get().history.future[get().history.future.length - 1];
    if (next) {
      set({
        history: {
          future: get().history.future.slice(0, -1),
          past: [
            ...get().history.past,
            { nodes: get().nodes, edges: get().edges },
          ],
        },
        nodes: next.nodes,
        edges: next.edges,
      });
    }
  },

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,

  // ----- Batch Actions -----
  startBatch: () => {
    get().takeSnapshot();
    set({ isBatchOperation: true });
  },

  endBatch: () => {
    set({ isBatchOperation: false });
  },
});
