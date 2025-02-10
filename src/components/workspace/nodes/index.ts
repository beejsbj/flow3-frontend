import { nodeRegistry } from "@/services/registry";

// Now nodeTypes comes from the registry
export const nodeTypes = nodeRegistry.getNodeTypes();
