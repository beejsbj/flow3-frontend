"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import { SidebarLayout } from "@/components/layouts/sidebars";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import Flow from "@/components/workspace/Flow";
import { NodesSheetList } from "@/components/workspace/NodesSheetList";
import { useWorkspacesStore } from "@/stores/workspaces";
import useWorkspaceStore from "@/stores/workspace";

export default function WorkspacePage() {
  const router = useRouter();
  const { id } = router.query;

  const { workspaces, fetchWorkspaces } = useWorkspacesStore();
  const loadWorkspace = useWorkspaceStore((state) => state.loadWorkspace);

  useEffect(() => {
    fetchWorkspaces("dummy-user-id");
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (workspaces.length > 0 && id) {
      const workspace = workspaces.find((w) => w.id === id);
      if (workspace) {
        loadWorkspace(workspace);
      }
    }
  }, [workspaces, id, loadWorkspace]);

  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarLayout left={<DashboardSidebar />} right={<NodesSheetList />}>
      <Flow />
    </SidebarLayout>
  );
}
