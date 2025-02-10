import { Button } from "@/components/ui/button";
import WorkspacesList from "@/components/dashboard/WorkspaceList";
import { useUser } from "@/stores/user";
import { useWorkspacesStore } from "@/stores/workspaces";

function DashboardHeader() {
  const { name } = useUser();
  const { createWorkspace } = useWorkspacesStore();
  return (
    <header className="border-b">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="booming-voice">Welcome back, {name}</h1>
          <p className="whisper-voice mt-1">
            Manage your workspaces and projects
          </p>
        </div>
        <Button onClick={createWorkspace}>New Workspace</Button>
      </div>
    </header>
  );
}

function DashboardMain() {
  return (
    <section className="p-6">
      <DashboardHeader />
      <WorkspacesList />
    </section>
  );
}

export default DashboardMain;
