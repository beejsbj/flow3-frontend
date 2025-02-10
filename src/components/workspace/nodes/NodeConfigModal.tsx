// src/components/workspace/NodeConfigModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NodeData } from "@/components/workspace/types";
import { NodeConfigForm } from "./NodeConfigForm";
import { NodeActions } from "./NodeActions";
import { useToggleNodeExpansion } from "@/stores/workspace";

interface NodeConfigModalProps {
  nodeId: string;
  data: NodeData;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NodeConfigModal({
  nodeId,
  data,
  open,
}: NodeConfigModalProps) {
  const toggleNodeExpansion = useToggleNodeExpansion();

  // Early return if no config
  if (!data.config) {
    return null;
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      toggleNodeExpansion(nodeId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Configure {data.label}</DialogTitle>
          <NodeActions id={nodeId} data={data} hideClose={true} />
        </DialogHeader>
        <NodeConfigForm data={data} nodeId={nodeId} />
      </DialogContent>
    </Dialog>
  );
}
