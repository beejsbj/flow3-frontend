import { Button } from "@/components/ui/button";
import WorkspacesList from "@/components/dashboard/WorkspaceList";
import { useUser } from "@/stores/user";
import { useWorkspacesStore } from "@/stores/workspaces";

interface DashboardHeaderProps {
  userName: string;
  onNewWorkspace: () => void;
}

function DashboardHeader({ userName, onNewWorkspace }: DashboardHeaderProps) {
  return (
    <header className="border-b">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="booming-voice">Welcome back, {userName}</h1>
          <p className="whisper-voice mt-1">
            Manage your workspaces and projects
          </p>
        </div>
        <Button onClick={onNewWorkspace}>New Workspace</Button>
      </div>
    </header>
  );
}

function DashboardMain() {
  const { name } = useUser();
  const { createWorkspace } = useWorkspacesStore();

  const handleNewWorkspace = () => {
    createWorkspace({
      name: "New Workspace",
      description: "Description",
      lastModified: new Date(),
    });
  };

  return (
    <section className="p-6">
      <DashboardHeader
        userName={name || ""}
        onNewWorkspace={handleNewWorkspace}
      />
      <WorkspacesList />
    </section>
  );
}

export default DashboardMain;
