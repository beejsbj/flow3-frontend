import BaseNode from "./BaseNode";
import { NodeProps } from "@/components/workspace/types";
import useWorkspaceStore from "@/stores/workspace";
import { NodesSheetList } from "./NodesSheetList";
import { useState } from "react";

export function PlaceholderNode(props: NodeProps) {
  const { id } = props;
  const [sheetOpen, setSheetOpen] = useState(false);
  const { replaceNodeWithConnections } = useWorkspaceStore();

  const handleNodeSelection = (nodeType: string) => {
    replaceNodeWithConnections(id, nodeType, true);
  };

  return (
    <>
      <BaseNode
        {...props}
        hasActions={false}
        onClick={() => setSheetOpen(true)}
        className="border-2 border-muted-foreground rounded-full w-12 h-12 bg-muted"
      />

      <NodesSheetList
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onNodeSelect={handleNodeSelection}
        showTrigger={false}
      />
    </>
  );
}
