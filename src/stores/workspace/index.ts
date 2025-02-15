import { create } from "zustand";
import {
  type WorkspaceState,
  type Workspace,
  type WorkspaceConfig,
} from "@/components/workspace/types";
import { subscribeWithSelector } from "zustand/middleware";
import { executeWorkspace } from "@/services/execution";
import { useCallback } from "react";
import { createNodeSlice } from "./nodes";
import { createEdgeSlice } from "./edges";
import { createStateSlice } from "./state";
import { createMetadataSlice } from "./metadata";
import { createConfigSlice } from "./config";
import { toast } from "sonner";

// ============= Store Definition =============
const useWorkspaceStore = create(
  subscribeWithSelector<WorkspaceState>((set, get) => {
    // Create slices
    const nodeSlice = createNodeSlice(set, get);
    const edgeSlice = createEdgeSlice(set, get);
    const stateSlice = createStateSlice(set, get);
    const metadataSlice = createMetadataSlice(set, get);
    const configSlice = createConfigSlice(set, get);

    return {
      // ========== Initial State ==========
      // Metadata
      ...metadataSlice,

      // Configuration
      ...configSlice,

      // Content
      ...nodeSlice,
      ...edgeSlice,
      ...stateSlice,
      // ----- Workspace Actions -----
      loadWorkspace: (workspace: Workspace) => {
        set({
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          config: workspace.config || {
            layout: { direction: "LR", spacing: [100, 100], auto: true },
          },
          nodes: workspace.nodes,
          edges: workspace.edges,
          lastModified: new Date(workspace.lastModified),
        });
      },

      executeWorkspace: async () => {
        const state = get();

        state.validate();
        console.log(state.validation);

        if (state.validation.isValid === false) {
          console.log(state.validation);
          // use validation.errors
          //have a button that fitvewis to navigate to the node

          toast.error(
            "Please fix the errors in the workspace before executing.",
            {
              description: state.validation.errors
                .map((error) => error.errors)
                .join("\n"),
            }
          );
          return;
        }
        get().resetNodeExecutionStates();
        try {
          await executeWorkspace({
            id: state.id,
            name: state.name,
            description: state.description,
            nodes: state.nodes,
            edges: state.edges,
            lastModified: state.lastModified,
            config: state.config,
          });
        } catch (error) {
          console.error("Failed to execute workspace:", error);
        }
      },
    };
  })
);

// ============= Exports =============
export default useWorkspaceStore;

// Convenience hooks
export const useWorkspaceMetadata = () =>
  useWorkspaceStore((state) => ({
    name: state.name || "",
    description: state.description || "",
  }));

export const useWorkspaceValidation = () =>
  useWorkspaceStore((state) => state.validation);

export const useLayoutOptions = () =>
  useWorkspaceStore((state) => state.config?.layout);

export const useUpdateLayout = () =>
  useWorkspaceStore(
    (state) => (layoutConfig: Partial<WorkspaceConfig["layout"]>) =>
      state.updateConfig((config) => ({
        ...config,
        layout: {
          ...config.layout,
          ...layoutConfig,
        },
      }))
  );

// Node operations
export const useAddNode = () => useWorkspaceStore((state) => state.addNode);

export const useDeleteNode = () =>
  useWorkspaceStore((state) => state.deleteNode);

export const useNode = (nodeId: string) =>
  useWorkspaceStore(
    useCallback((state) => state.nodes.find((n) => n.id === nodeId), [nodeId])
  );

export const useConnectNodes = () =>
  useWorkspaceStore((state) => state.connectNodes);

export const useUpdateNode = () =>
  useWorkspaceStore((state) => state.updateNode);

export const useToggleNodeExpansion = () =>
  useWorkspaceStore((state) => state.toggleNodeExpansion);

export const useSetNodeExecutionState = () =>
  useWorkspaceStore((state) => state.setNodeExecutionState);

export const useUpdateNodeValues = () =>
  useWorkspaceStore((state) => state.updateNodeValues);
