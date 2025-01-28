import { Workspace } from "@/components/workspace/types";

//#todo Replace these endpoints with actual backend API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""; // e.g. "https://api.yourbackend.com"

export async function fetchWorkspaces(): Promise<Workspace[]> {
  //#todo Replace "/api/workspaces" with `${API_BASE_URL}/workspaces` or your actual endpoint
  const response = await fetch("/api/workspaces");
  if (!response.ok) {
    throw new Error("Failed to fetch workspaces");
  }
  const data = await response.json();
  return data.workspaces;
}

export async function createWorkspace(
  workspace: Omit<Workspace, "id">
): Promise<Workspace> {
  //#todo Replace "/api/workspaces" with `${API_BASE_URL}/workspaces` or your actual endpoint
  const response = await fetch("/api/workspaces", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workspace),
  });

  if (!response.ok) {
    throw new Error("Failed to create workspace");
  }

  return response.json();
}

export async function updateWorkspace(
  workspace: Workspace
): Promise<Workspace> {
  //#todo Replace with `${API_BASE_URL}/workspaces/${workspace.id}` or your actual endpoint
  const response = await fetch(`/api/workspaces/${workspace.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workspace),
  });

  if (!response.ok) {
    throw new Error("Failed to update workspace");
  }

  return response.json();
}

export async function deleteWorkspace(id: string): Promise<void> {
  //#todo Replace with `${API_BASE_URL}/workspaces/${id}` or your actual endpoint
  const response = await fetch(`/api/workspaces/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete workspace");
  }
}
