import { SidebarLayout } from "@/components/layouts/sidebars";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMain from "@/components/dashboard/DashboardMain";

export default function DashboardPage() {
  return (
    <SidebarLayout left={<DashboardSidebar />}>
      {/* Main content area */}
      <div className="">
        <DashboardMain />
      </div>
    </SidebarLayout>
  );
}
