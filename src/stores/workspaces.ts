import { create } from "zustand";
import { Workspace } from "@/components/workspace/types";
import { nodeRegistry } from "@/components/workspace/nodes/registry";

// Dummy data
const dummyWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "Marketing Campaign",
    description: "Q4 marketing initiatives and planning",
    lastModified: new Date(),
    config: {
      layout: {
        direction: "horizontal",
      },
    },
    nodes: [
      {
        id: "1",
        type: "input",
        data: { label: "Input" },
        position: { x: 250, y: 25 },
      },

      {
        id: "2",
        data: { label: "Default" },
        position: { x: 100, y: 125 },
      },
      {
        id: "3",
        type: "output",
        data: { label: "Output" },
        position: { x: 250, y: 250 },
      },
    ], // Add empty initial state
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
    ],
  },
  {
    id: "2",
    name: "Product Launch",
    description: "New feature launch preparation",
    lastModified: new Date(),
    config: {
      layout: {
        direction: "horizontal",
      },
    },
    nodes: [
      nodeRegistry.createNodeFromDefinition("position-logger", {
        x: 100,
        y: 100,
      }),
      nodeRegistry.createNodeFromDefinition("multi-port-node", {
        x: 0,
        y: 200,
      }),
    ], // Add empty initial state
    edges: [],
  },
  {
    id: "3",
    name: "Team Resources",
    description: "Team documentation and resources",
    lastModified: new Date(),
    config: {
      layout: {
        direction: "horizontal",
      },
    },
    nodes: [
      nodeRegistry.createNodeFromDefinition("position-logger", {
        x: 100,
        y: 100,
      }),
      nodeRegistry.createNodeFromDefinition("delay", {
        x: 0,
        y: 200,
      }),
    ], // Add empty initial state
    edges: [],
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
      const newWorkspace = {
        ...workspaceData,
        id: Math.random().toString(36).substr(2, 9), // Generate random ID
        lastModified: new Date(),
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
