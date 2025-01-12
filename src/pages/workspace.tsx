"use client";

import { SidebarLayout } from "@/components/layouts/sidebars";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import Flow from "@/components/workspace/Flow";
import { NodesSheetList } from "@/components/workspace/NodesSheetList";

export default function WorkspacePage() {
  return (
    <SidebarLayout left={<DashboardSidebar />} right={<NodesSheetList />}>
      <Flow />
    </SidebarLayout>
  );
}
