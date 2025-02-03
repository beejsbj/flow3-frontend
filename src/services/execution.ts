import {
  Workspace,
  Node,
  NodeExecution,
  WorkspaceExecution,
} from "@/components/workspace/types";
import useWorkspaceStore from "@/stores/workspace";

import { toast } from "sonner";

// Mock backend execution state
interface ExecutionState {
  workspaceId: string;
  runningNodes: string[];
  completedNodes: string[];
  failedNodes: string[];
}

const mockExecutionStates = new Map<string, ExecutionState>();
let pollIntervals = new Map<string, NodeJS.Timeout>();

// Helper to find the next nodes to execute
const findNextNodes = (currentNode: Node, nodes: Node[], edges: any[]) => {
  return edges
    .filter((edge) => edge.source === currentNode.id)
    .map((edge) => nodes.find((node) => node.id === edge.target))
    .filter((node): node is Node => node !== undefined);
};

// Helper to find the start node
const findStartNode = (nodes: Node[]) => {
  return nodes.find((node) => node.type === "start");
};

// Helper to update workspace execution state
function updateWorkspaceExecutionState(status: ExecutionState) {
  const workspaceExecution: WorkspaceExecution = {
    isRunning: status.runningNodes.length > 0,
    isCompleted:
      status.runningNodes.length === 0 && status.completedNodes.length > 0,
    isFailed: status.failedNodes.length > 0,
    isCancelled: false,
  };
  useWorkspaceStore.getState().setExecutionState(workspaceExecution);
}

export async function executeWorkspace(workspace: Workspace): Promise<void> {
  // Initialize execution state
  toast.info("Starting workspace execution");
  const executionState: ExecutionState = {
    workspaceId: workspace.id,
    runningNodes: [],
    completedNodes: [],
    failedNodes: [],
  };
  mockExecutionStates.set(workspace.id, executionState);

  // Set initial workspace execution state
  updateWorkspaceExecutionState(executionState);

  // Start polling for status updates
  startPolling(workspace.id);

  // Start mock execution process
  const startNode = findStartNode(workspace.nodes);
  if (!startNode) throw new Error("No start node found");

  let currentNodes = [startNode];
  let nextNodes: Node[] = [];

  try {
    // Mock execution loop
    while (currentNodes.length > 0) {
      // Update running nodes
      executionState.runningNodes = currentNodes.map((node) => node.id);
      updateWorkspaceExecutionState(executionState);

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mark current nodes as completed
      executionState.completedNodes.push(
        ...currentNodes.map((node) => node.id)
      );
      executionState.runningNodes = executionState.runningNodes.filter(
        (id) => !executionState.completedNodes.includes(id)
      );
      updateWorkspaceExecutionState(executionState);

      // Find next nodes to execute
      nextNodes = currentNodes.flatMap((node) =>
        findNextNodes(node, workspace.nodes, workspace.edges)
      );

      // Remove duplicates and already completed nodes
      nextNodes = nextNodes.filter(
        (node, index, self) =>
          self.findIndex((n) => n.id === node.id) === index &&
          !executionState.completedNodes.includes(node.id)
      );

      currentNodes = nextNodes;
    }

    toast.success("Workspace execution completed successfully");
  } catch (error) {
    executionState.failedNodes.push(...currentNodes.map((node) => node.id));
    updateWorkspaceExecutionState(executionState);
    toast.error("Workspace execution failed");
    throw error;
  } finally {
    // Stop polling when execution is complete
    stopPolling(workspace.id);
  }
}

function startPolling(workspaceId: string) {
  // Clear any existing interval
  stopPolling(workspaceId);

  // Start new polling interval
  const interval = setInterval(async () => {
    try {
      const status = await pollExecutionStatus(workspaceId);

      // Get all node IDs from all status arrays
      const allNodeIds = new Set([
        ...status.runningNodes,
        ...status.completedNodes,
        ...status.failedNodes,
      ]);

      // Update state for each node
      allNodeIds.forEach((nodeId) => {
        const executionState: NodeExecution = {
          isRunning: status.runningNodes.includes(nodeId),
          isCompleted: status.completedNodes.includes(nodeId),
          isFailed: status.failedNodes.includes(nodeId),
          isCancelled: false,
        };
        useWorkspaceStore
          .getState()
          .setNodeExecutionState(nodeId, executionState);
      });

      // Update workspace execution state
      updateWorkspaceExecutionState(status);

      // Stop polling if execution is complete
      if (status.runningNodes.length === 0) {
        stopPolling(workspaceId);
      }
    } catch (error) {
      console.error("Failed to poll execution status:", error);
      stopPolling(workspaceId);
    }
  }, 1000);

  pollIntervals.set(workspaceId, interval);
}

function stopPolling(workspaceId: string) {
  const interval = pollIntervals.get(workspaceId);
  if (interval) {
    clearInterval(interval);
    pollIntervals.delete(workspaceId);
  }
}

export async function pollExecutionStatus(
  workspaceId: string
): Promise<ExecutionState> {
  const state = mockExecutionStates.get(workspaceId);
  if (!state) {
    throw new Error("No execution state found for workspace");
  }
  return state;
}

export async function cancelExecution(workspaceId: string): Promise<void> {
  const state = mockExecutionStates.get(workspaceId);
  if (state) {
    toast.info("Workspace execution cancelled");
    // Mark any running nodes as cancelled
    state.runningNodes.forEach((nodeId) => {
      useWorkspaceStore.getState().setNodeExecutionState(nodeId, {
        isRunning: false,
        isCompleted: false,
        isFailed: false,
        isCancelled: true,
      });
    });

    // Update workspace execution state
    useWorkspaceStore.getState().setExecutionState({
      isRunning: false,
      isCompleted: false,
      isFailed: false,
      isCancelled: true,
    });
  }

  stopPolling(workspaceId);
  mockExecutionStates.delete(workspaceId);
}
