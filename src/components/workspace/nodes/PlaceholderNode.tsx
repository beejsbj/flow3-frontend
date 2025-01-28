import { BaseNode } from "./BaseNode";
import { NodeProps } from "@/components/workspace/types";
import useWorkspaceStore from "@/stores/workspace";
import { NodesSheetList } from "../NodesSheetList";
import { useState } from "react";
import { useEdges } from "@xyflow/react";
export function PlaceholderNode(props: NodeProps) {
  const { id, positionAbsoluteX, positionAbsoluteY } = props;
  const [sheetOpen, setSheetOpen] = useState(false);
  const { addNode, connectNodes, deleteNode, edges } = useWorkspaceStore();
  const internalEdges = useEdges();

  const handleNodeSelection = (nodeType: string) => {
    // Find the edge that connects to this placeholder node
    const parentEdge = edges.find((edge) => edge.target === id);
    if (!parentEdge) return;

    //  console.log(parentEdge);
    // Get the parent node ID from the edge
    const parentId = parentEdge.source;

    // Create new placeholder node first
    const newPlaceholder = addNode("placeholder", {
      x: positionAbsoluteX,
      y: positionAbsoluteY + 50,
    });
    if (!newPlaceholder) return;

    // Then create the new selected node
    const newNode = addNode(nodeType, {
      x: positionAbsoluteX,
      y: positionAbsoluteY,
    });
    if (!newNode) return;

    // Connect the parent node to the new node
    connectNodes({
      source: parentId,
      target: newNode.id,
      sourceHandle: parentEdge.sourceHandle,
      targetHandle: "_target-0_",
    });

    console.log(newNode, newPlaceholder);

    // Connect the new node to the new placeholder
    connectNodes({
      source: newNode.id,
      target: newPlaceholder.id,
      sourceHandle: "_source-0_",
      targetHandle: "_target-0_",
    });

    // Delete the current placeholder node last
    deleteNode(id);

    console.log(edges, internalEdges);
  };

  return (
    <>
      <BaseNode
        {...props}
        onClick={() => setSheetOpen(true)}
        className="border-2 border-dashed border-muted-foreground"
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
