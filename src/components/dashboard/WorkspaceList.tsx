import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { useWorkspacesStore } from "@/stores/workspaces";
import { useEffect } from "react";
import { Workspace } from "@/types/types";
import Link from "next/link";

interface WorkspaceCardProps {
  workspace: Workspace;
}

function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <CardTitle className="firm-voice">{workspace.name}</CardTitle>
        <CardDescription className="calm-voice">
          {workspace.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <span className="whisper-voice">
          Last modified: {workspace.lastModified.toLocaleDateString()}
        </span>
        <Button asChild variant="link">
          <Link href={`/workspace`}>Open workspace →</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function WorkspacesList() {
  const { workspaces, isLoading, fetchWorkspaces } = useWorkspacesStore();

  useEffect(() => {
    // For now, we'll just pass a dummy user ID
    fetchWorkspaces("dummy-user-id");
  }, [fetchWorkspaces]);

  if (isLoading && workspaces.length === 0) {
    return <div>Loading workspaces...</div>;
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </ul>
  );
}
