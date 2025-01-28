import { create } from "zustand";
import { Workspace, Node } from "@/components/workspace/types";
import { Node as NodeClass } from "@/components/workspace/nodes/Node";
// Dummy data

const createInitialNodesAndEdges = (workspaceId: string) => {
  const startNode = new NodeClass("start", { x: 0, y: 0 });
  const placeholderNode = new NodeClass("placeholder", { x: 0, y: 100 });
  const edge = {
    id: `${startNode.id}-${placeholderNode.id}`,
    source: startNode.id,
    target: placeholderNode.id,
    sourceHandle: "_source-0_",
    targetHandle: "_target-0_",
    type: "base",
  };

  return { nodes: [startNode, placeholderNode], edges: [edge] };
};

const dummyWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "Marketing Campaign",
    description: "Q4 marketing initiatives and planning",
    lastModified: new Date(),
    config: {
      layout: {
        direction: "LR",
        spacing: [100, 100],
        auto: true,
      },
    },
    ...createInitialNodesAndEdges("1"),
  },
  {
    id: "2",
    name: "Product Launch",
    description: "New feature launch preparation",
    lastModified: new Date(),
    config: {
      layout: {
        direction: "LR",
        spacing: [50, 50],
        auto: true,
      },
    },
    ...createInitialNodesAndEdges("2"),
  },
];

interface WorkspacesState {
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  fetchWorkspaces: (userId: string) => void;
  createWorkspace: (workspace: Omit<Workspace, "id">) => void;
  updateWorkspace: (workspace: Workspace) => void;
}

export const useWorkspacesStore = create<WorkspacesState>((set) => ({
  workspaces: [],
  isLoading: false,
  error: null,

  fetchWorkspaces: (userId: string) => {
    console.log("fetchWorkspaces", userId);
    set({ isLoading: true });
    // Simulate API delay
    setTimeout(() => {
      set({ workspaces: dummyWorkspaces, isLoading: false });
    }, 500);
  },

  createWorkspace: (workspaceData) => {
    set({ isLoading: true });
    // Simulate API delay
    setTimeout(() => {
      // Create start node
      const startNode = new NodeClass("start", { x: 0, y: 0 });

      // Create placeholder node
      const placeholderNode = new NodeClass("placeholder", { x: 0, y: 100 });

      // Create connecting edge
      const edge = {
        id: `${startNode.id}-${placeholderNode.id}`,
        source: startNode.id,
        target: placeholderNode.id,
        sourceHandle: "_source-0_",
        targetHandle: "_target-0_",
        type: "base",
      };

      const newWorkspace = {
        ...workspaceData,
        id: Math.random().toString(36).substr(2, 9),
        lastModified: new Date(),
        nodes: [startNode, placeholderNode],
        edges: [edge],
      };

      set((state) => ({
        workspaces: [...state.workspaces, newWorkspace],
        isLoading: false,
      }));
    }, 500);
  },

  updateWorkspace: (workspace) => {
    set({ isLoading: true });
    // Simulate API delay
    setTimeout(() => {
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === workspace.id ? { ...workspace, lastModified: new Date() } : w
        ),
        isLoading: false,
      }));
    }, 500);
  },
}));
