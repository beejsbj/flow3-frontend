import { WorkspaceState, WorkspaceConfig } from "@/components/workspace/types";

export type ConfigSlice = Pick<WorkspaceState, "config" | "updateConfig">;

export const createConfigSlice = (set: any, get: any): ConfigSlice => ({
  config: {
    layout: {
      direction: "LR",
      spacing: [100, 100],
      auto: true,
    },
  },
  updateConfig: (updater: (config: WorkspaceConfig) => WorkspaceConfig) => {
    set({ config: updater(get().config!) });
  },
});
