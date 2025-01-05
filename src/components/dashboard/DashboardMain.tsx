import { Button } from "@/components/ui/button";
import WorkspacesList from "@/components/dashboard/WorkspaceList";

interface DashboardHeaderProps {
  userName: string;
}

// Individual Components
function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="border-b">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="booming-voice">Welcome back, {userName}</h1>
          <p className="whisper-voice mt-1">
            Manage your workspaces and projects
          </p>
        </div>
        <Button>New Workspace</Button>
      </div>
    </header>
  );
}

// Main Dashboard Component
function DashboardMain() {
  return (
    <section className="p-6">
      <DashboardHeader userName="John" />
      <WorkspacesList />
    </section>
  );
}

export default DashboardMain;
