import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

// Types for our components
type Workspace = {
  id: string;
  name: string;
  description: string;
  lastModified: Date;
};

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
        <Button variant="link">Open workspace →</Button>
      </CardFooter>
    </Card>
  );
}

export default function WorkspacesList() {
  // Example data - replace with real data source
  const workspaces: Workspace[] = [
    {
      id: "1",
      name: "Marketing Campaign",
      description: "Q4 marketing initiatives and planning",
      lastModified: new Date(),
    },
    {
      id: "2",
      name: "2Marketing Campaign",
      description: "Q4 marketing initiatives and planning",
      lastModified: new Date(),
    },
    {
      id: "3",
      name: "3Marketing Campaign",
      description: "Q4 marketing initiatives and planning",
      lastModified: new Date(),
    },
    // Add more example workspaces as needed
  ];

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </ul>
  );
}
