import { WorkspaceState } from "@/types/types";

export type MetadataSlice = Pick<
  WorkspaceState,
  "id" | "name" | "description" | "lastModified"
>;

export const createMetadataSlice = (set: any, get: any): MetadataSlice => ({
  id: "",
  name: "",
  description: "",
  lastModified: new Date(),
});
