import BaseNode from "./BaseNode";
import { NodeProps } from "@/components/workspace/types";
import useWorkspaceStore, {
  useAddNode,
  useConnectNodes,
  useDeleteNode,
} from "@/stores/workspace";
import { NodesSheetList } from "./NodesSheetList";
import { useState } from "react";
import { nodeRegistry } from "@/services/registry";

export function PlaceholderNode(props: NodeProps) {
  const { id, positionAbsoluteX, positionAbsoluteY } = props;
  const [sheetOpen, setSheetOpen] = useState(false);
  const { edges } = useWorkspaceStore();

  const addNode = useAddNode();
  const connectNodes = useConnectNodes();
  const deleteNode = useDeleteNode();

  const handleNodeSelection = (nodeType: string) => {
    // Find the edge that connects to this placeholder node
    const parentEdge = edges.find((edge) => edge.target === id);
    if (!parentEdge) return;

    const parentId = parentEdge.source;

    // Get the node definition to check number of output ports
    const nodeDefinition = nodeRegistry.get(nodeType);
    if (!nodeDefinition) return;

    const outputPorts = nodeDefinition.ports?.outputs || [];
    const numOutputs = outputPorts.length;

    // Create the new selected node
    const newNode = addNode(nodeType, {
      x: positionAbsoluteX,
      y: positionAbsoluteY,
    });
    if (!newNode) return;

    // Connect the parent node to the new node
    connectNodes({
      source: parentId,
      target: newNode.id,
      sourceHandle: parentEdge.sourceHandle || undefined,
      targetHandle: "input-0",
    });

    // Create a placeholder node for each output port
    outputPorts.forEach((port, index) => {
      // Calculate position for each placeholder
      // Spread them out horizontally if there are multiple outputs
      const offsetX = numOutputs > 1 ? (index - (numOutputs - 1) / 2) * 200 : 0;

      const newPlaceholder = addNode("placeholder", {
        x: positionAbsoluteX + offsetX,
        y: positionAbsoluteY + 100,
      });
      if (!newPlaceholder) return;

      // Connect the new node to each placeholder
      connectNodes({
        source: newNode.id,
        target: newPlaceholder.id,
        sourceHandle: `output-${index}`,
        targetHandle: "input-0",
      });
    });

    // Delete the current placeholder node last
    deleteNode(id);
  };

  return (
    <>
      <BaseNode
        {...props}
        hasActions={false}
        onClick={() => setSheetOpen(true)}
        className="border-2 border-dashed border-muted-foreground rounded-full w-12 h-12"
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
