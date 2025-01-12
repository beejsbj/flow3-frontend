import { create } from "zustand";
import { Workspace } from "@/types/types";

// Dummy data
const dummyWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "Marketing Campaign",
    description: "Q4 marketing initiatives and planning",
    lastModified: new Date(),
  },
  {
    id: "2",
    name: "Product Launch",
    description: "New feature launch preparation",
    lastModified: new Date(),
  },
  {
    id: "3",
    name: "Team Resources",
    description: "Team documentation and resources",
    lastModified: new Date(),
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
