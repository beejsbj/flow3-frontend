import { create } from "zustand";
import { Workspace } from "@/types/types";
import { nodeRegistry } from "@/services/registry";
import * as workspaceService from "@/services/workspaces";

interface WorkspacesState {
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  fetchWorkspaces: (userId: string) => Promise<void>;
  createWorkspace: () => Promise<void>;
  updateWorkspace: (workspace: Workspace) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

export const useWorkspacesStore = create<WorkspacesState>((set) => ({
  workspaces: [],
  isLoading: false,
  error: null,

  fetchWorkspaces: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const workspaces = await workspaceService.fetchWorkspaces();
      set({ workspaces, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createWorkspace: async () => {
    set({ isLoading: true, error: null });
    try {
      const startNode = nodeRegistry.createNode("start");

      const workspaceData = {
        name: "New Workspace",
        description: "Description",
        lastModified: new Date().toISOString(),
        nodes: [startNode],
        edges: [],
        config: {
          layout: {
            direction: "LR" as const,
            spacing: [100, 100] as [number, number],
            auto: true,
          },
        },
      };

      const newWorkspace = await workspaceService.createWorkspace(
        workspaceData
      );
      set((state) => ({
        workspaces: [...state.workspaces, newWorkspace],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateWorkspace: async (workspace) => {
    set({ isLoading: true, error: null });
    try {
      const updatedWorkspace = await workspaceService.updateWorkspace(
        workspace
      );
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === updatedWorkspace.id ? updatedWorkspace : w
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteWorkspace: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await workspaceService.deleteWorkspace(id);
      set((state) => ({
        workspaces: state.workspaces.filter((w) => w.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
