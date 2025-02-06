// src/components/workspace/NodeConfigModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateNodeValues } from "@/stores/workspace";
import { NodeData } from "@/components/workspace/types";
import { NodeConfigForm } from "./NodeConfigForm";

interface NodeConfigModalProps {
  nodeId: string;
  data: NodeData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NodeConfigModal({
  nodeId,
  data,
  open,
  onOpenChange,
}: NodeConfigModalProps) {
  const updateNodeValues = useUpdateNodeValues();

  // Early return if no config
  if (!data.config) {
    return null;
  }

  function onSubmit(values: any) {
    updateNodeValues(nodeId, values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {data.label}</DialogTitle>
        </DialogHeader>
        <NodeConfigForm data={data} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
