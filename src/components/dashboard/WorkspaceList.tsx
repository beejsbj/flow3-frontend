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
import { useAutoAnimate } from "@formkit/auto-animate/react";

interface WorkspaceCardProps {
  workspace: Workspace;
}

function formatDate(date: string | Date): string {
  if (typeof date === "string") {
    return new Date(date).toLocaleDateString();
  }
  return date.toLocaleDateString();
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
          Last modified: {formatDate(workspace.lastModified)}
        </span>
        <Button asChild variant="link">
          <Link href={`/workspace/${workspace.id}`}>Open workspace →</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function WorkspacesList() {
  const { workspaces, isLoading, fetchWorkspaces } = useWorkspacesStore();

  const [listRef] = useAutoAnimate();

  useEffect(() => {
    // For now, we'll just pass a dummy user ID
    fetchWorkspaces("dummy-user-id");
  }, [fetchWorkspaces]);

  if (isLoading && workspaces.length === 0) {
    return <div>Loading workspaces...</div>;
  }

  return (
    <ul
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      ref={listRef}
    >
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </ul>
  );
}
