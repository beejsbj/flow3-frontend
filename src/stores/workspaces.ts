import { create } from "zustand";
import { Workspace } from "@/components/workspace/types";
import { Node as NodeClass } from "@/components/workspace/nodes/Node";
import * as workspaceService from "@/services/workspaces";
// Import node registrations
// import "@/components/workspace/nodes";

// Create nodes with proper data structure
const createStartNode = () => NodeClass.create("start");
const createPlaceholderNode = () => NodeClass.create("placeholder");

// Helper function to process workspace nodes
const processWorkspaceNodes = (workspace: any) => ({
  ...workspace,
  nodes: workspace.nodes.map((nodeData: any) =>
    NodeClass.createFromStorage(nodeData)
  ),
});

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
      const processedWorkspaces = workspaces.map(processWorkspaceNodes);
      set({ workspaces: processedWorkspaces, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createWorkspace: async () => {
    set({ isLoading: true, error: null });
    try {
      const startNode = createStartNode();
      const placeholderNode = createPlaceholderNode();

      const edge = {
        id: `${startNode.id}-${placeholderNode.id}`,
        source: startNode.id,
        target: placeholderNode.id,
        sourceHandle: "output-0",
        targetHandle: "input-0",
        type: "base",
      };

      const workspaceData = {
        name: "New Workspace",
        description: "Description",
        lastModified: new Date().toISOString(),
        nodes: [startNode, placeholderNode],
        edges: [edge],
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
      const processedWorkspace = processWorkspaceNodes(newWorkspace);

      set((state) => ({
        workspaces: [...state.workspaces, processedWorkspace],
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
      const processedWorkspace = processWorkspaceNodes(updatedWorkspace);

      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === processedWorkspace.id ? processedWorkspace : w
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
