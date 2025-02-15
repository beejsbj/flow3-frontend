import { Handle, Position } from "@xyflow/react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Port } from "@/types/types";
import React from "react";
import useWorkspaceStore, { useNode } from "@/stores/workspace";
import { NodesSheetList } from "@/components/workspace/nodes/NodesSheetList";
import { useState } from "react";

interface BaseHandleProps {
  port: Port & { position: Position; offset: number };
  nodeId: string;
}

function PlusHandle({ nodeId }: { nodeId: string }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { addNodeWithConnections } = useWorkspaceStore();

  const handleNodeSelection = (nodeType: string) => {
    addNodeWithConnections(nodeId, nodeType);
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSheetOpen(true);
  };

  return (
    <>
      <svg
        className="source plus-handle absolute top-1/2 left-1/2 -translate-y-1/2 h-4 w-12 origin-left scale-150 transition-transform duration-300 delay-100 ease-in-out group-[.connectingfrom]:scale-0"
        viewBox="0 0 70 24"
      >
        <line
          className="source"
          x1="0"
          y1="12"
          x2="47"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
        />
        <g
          className="source plus-handle-button cursor-pointer hover:bg-primary"
          transform="translate(46, 0)"
          onClick={handlePlusClick}
        >
          <rect
            className="source"
            x="2"
            y="2"
            width="20"
            height="20"
            stroke="currentColor"
            strokeWidth="2"
            rx="4"
            fill="var(--background)"
          />
          <path
            className="source"
            fill="currentColor"
            d="m16.40655,10.89837l-3.30491,0l0,-3.30491c0,-0.40555 -0.32889,-0.73443 -0.73443,-0.73443l-0.73443,0c-0.40554,0 -0.73442,0.32888 -0.73442,0.73443l0,3.30491l-3.30491,0c-0.40555,0 -0.73443,0.32888 -0.73443,0.73442l0,0.73443c0,0.40554 0.32888,0.73443 0.73443,0.73443l3.30491,0l0,3.30491c0,0.40554 0.32888,0.73442 0.73442,0.73442l0.73443,0c0.40554,0 0.73443,-0.32888 0.73443,-0.73442l0,-3.30491l3.30491,0c0.40554,0 0.73442,-0.32889 0.73442,-0.73443l0,-0.73443c0,-0.40554 -0.32888,-0.73442 -0.73442,-0.73442z"
          />
        </g>
      </svg>

      <NodesSheetList
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onNodeSelect={handleNodeSelection}
        showTrigger={false}
      />
    </>
  );
}

export default function BaseHandle({ port, nodeId }: BaseHandleProps) {
  const edges = useWorkspaceStore((state) => state.edges);

  const sourceEdge = edges.find(
    (edge) => edge.target === nodeId && edge.targetHandle === port.id
  );
  const sourceNode = useNode(sourceEdge?.source || "");

  const isSourceNodeCompleted =
    sourceNode?.data?.state?.execution?.isCompleted === true;
  const isSourceNodeFailed =
    sourceNode?.data?.state?.execution?.isFailed === true;

  const node = useNode(nodeId);
  const isNodeCompleted = node?.data?.state?.execution?.isCompleted === true;
  const isNodeFailed = node?.data?.state?.execution?.isFailed === true;

  const isConnected = edges.some(
    (edge) =>
      (port.type === "source" &&
        edge.source === nodeId &&
        edge.sourceHandle === port.id) ||
      (port.type === "target" &&
        edge.target === nodeId &&
        edge.targetHandle === port.id)
  );

  const classes = cn("w-4 h-4 z-10 flex items-center justify-center group ", {
    "rounded-none w-3 delay-500": port.type === "target", // Make input handles rectangular
    "rounded-full": port.type === "source", // Keep output handles circular
    "bg-success":
      (isNodeCompleted && port.type === "source") ||
      (isSourceNodeCompleted && port.type === "target"),
    "bg-destructive":
      (isNodeFailed && port.type === "source") ||
      (isSourceNodeFailed && port.type === "target"),
  });

  return (
    <>
      <Handle
        id={port.id}
        type={port.type}
        position={port.position}
        className={classes}
        style={{
          [port.position === Position.Left || port.position === Position.Right
            ? "top"
            : "left"]: `${port.offset}%`,
        }}
      >
        {port.type === "source" && !isConnected && (
          <PlusHandle nodeId={nodeId} />
        )}
      </Handle>

      {/* Port Label */}
      {port.portType && port.portType !== "default" && (
        <Label
          key={`${port.id}-label`}
          className="absolute text-xs text-muted-foreground select-none"
          style={{
            [port.position === Position.Left
              ? "left"
              : port.position === Position.Right
              ? "right"
              : port.position === Position.Top
              ? "top"
              : "bottom"]: "-25px",
            [port.position === Position.Left || port.position === Position.Right
              ? "top"
              : "left"]: `${port.offset * 2.5}%`,
            transform: "translate(-220%, -50%)",
          }}
        >
          {port.label}
        </Label>
      )}
    </>
  );
}
