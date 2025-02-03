import { getIconByName } from "@/lib/icons";
import {
  useDeleteNode,
  useNode,
  useSetNodeExecutionState,
  useLayoutOptions,
} from "@/stores/workspace";

import { NodeData, Node } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import React from "react";

interface NodeActionsProps {
  id: string;
  data: NodeData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigOpen: () => void;
}

export function NodeActions({
  id,
  data,
  open,
  onOpenChange,
  onConfigOpen,
}: NodeActionsProps) {
  const deleteNode = useDeleteNode();
  const node = useNode(id) as Node;
  const setNodeExecutionState = useSetNodeExecutionState();
  const layoutOptions = useLayoutOptions();
  const SettingsIcon = getIconByName("Settings");
  const TrashIcon = getIconByName("Trash");
  const PlayIcon = getIconByName("Play");

  //if lr then top, if tb then left
  const actionsPosition = layoutOptions?.direction === "LR" ? "top" : "left";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenChange(false);
    // Longer delay to ensure modals are fully unmounted before node deletion
    setTimeout(() => deleteNode(id), 100);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!node || !node.data.state?.validation?.isValid) return;

    // Set initial running state
    setNodeExecutionState(id, {
      isRunning: true,
      isCompleted: false,
      isFailed: false,
      isCancelled: false,
    });

    // Simulate execution with timeout
    setTimeout(() => {
      setNodeExecutionState(id, {
        isRunning: false,
        isCompleted: false,
        isFailed: true,
        isCancelled: false,
      });
    }, 3000);
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger className="absolute inset-0 pointer-events-none" />
      <DropdownMenuContent
        align="end"
        side={actionsPosition}
        className="min-w-0 p-1 flex gap-1"
      >
        {/* Config option - only show if node has config form */}
        {data.config?.form && data.config.form.length > 0 && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onConfigOpen();
            }}
          >
            <SettingsIcon className="h-4 w-4" />
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handlePlay}>
          <PlayIcon className="h-4 w-4" />
        </DropdownMenuItem>

        {/* Delete option - only show if node is deletable */}
        {data?.isDeletable !== false && (
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <TrashIcon className="h-4 w-4" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
