import { getIconByName } from "@/lib/icons";
import {
  useDeleteNode,
  useSetNodeExecutionState,
  useLayoutOptions,
  useToggleNodeExpansion,
  useNode,
} from "@/stores/workspace";
import { useReactFlow } from "@xyflow/react";
import { NodeData } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import React from "react";

interface BaseActionsProps {
  id: string;
  data: NodeData;
}

// Shared utility functions
const useNodeActionHandlers = (id: string, data: NodeData) => {
  const deleteNode = useDeleteNode();
  const setNodeExecutionState = useSetNodeExecutionState();
  const toggleNodeExpansion = useToggleNodeExpansion();
  const { fitView } = useReactFlow();
  const node = useNode(id);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Longer delay to ensure modals are fully unmounted before node deletion
    setTimeout(() => deleteNode(id), 100);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.state?.validation?.isValid) return;

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

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check current state before toggling
    const isExpanding = !node?.data?.config?.expanded;

    toggleNodeExpansion(id);

    // Only zoom if we're expanding and we have a valid node
    if (isExpanding && node) {
      setTimeout(() => {
        fitView({
          nodes: [node],
          duration: 300,
          padding: 0.5,
        });
      }, 400);
    }
  };

  return { handleDelete, handlePlay, handleToggle };
};

// Component for the config node's top-right actions
interface NodeActionsProps extends BaseActionsProps {
  className?: string;
  onClose?: () => void;
}

export function NodeActions({
  id,
  data,
  className,
  onClose,
}: NodeActionsProps) {
  const { handleDelete, handlePlay, handleToggle } = useNodeActionHandlers(
    id,
    data
  );
  const PlayIcon = getIconByName("Play");
  const TrashIcon = getIconByName("Trash");
  const XIcon = getIconByName("X");

  return (
    <div className={`flex gap-1 ${className}`}>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handlePlay}
      >
        <PlayIcon className="h-4 w-4" />
      </Button>
      {data?.isDeletable !== false && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      )}
      {data.config?.expanded && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleToggle}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// Component for the icon node's dropdown menu
interface NodeActionsDropdownProps extends BaseActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigClick?: () => void;
}

export function NodeActionsDropdown({
  id,
  data,
  open,
  onOpenChange,
  onConfigClick,
}: NodeActionsDropdownProps) {
  const { handleDelete, handlePlay, handleToggle } = useNodeActionHandlers(
    id,
    data
  );
  const layoutOptions = useLayoutOptions();
  const PlayIcon = getIconByName("Play");
  const TrashIcon = getIconByName("Trash");
  const SettingsIcon = getIconByName("Settings");

  const actionsPosition = layoutOptions?.direction === "LR" ? "top" : "left";

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger className="absolute inset-0 pointer-events-none" />
      <DropdownMenuContent
        align="end"
        side={actionsPosition}
        className="min-w-0 p-1 flex gap-1"
      >
        {data.config?.form && data.config.form.length > 0 && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
              onConfigClick?.();
              handleToggle(e);
            }}
          >
            <SettingsIcon className="h-4 w-4" />
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handlePlay}>
          <PlayIcon className="h-4 w-4" />
        </DropdownMenuItem>
        {data?.isDeletable !== false && (
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <TrashIcon className="h-4 w-4" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
