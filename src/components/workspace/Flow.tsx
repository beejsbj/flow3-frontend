import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Panel,
  useReactFlow,
} from "@xyflow/react";
import { Switch } from "@/components/ui/switch";

import { useShallow } from "zustand/react/shallow";

import useWorkspaceStore, { useLayoutOptions } from "@/stores/workspace";
import { nodeTypes } from "./nodes";
import { edgeTypes, defaultEdgeOptions } from "./edges";
import { DevTools } from "@/components/devtools";
import useAutoLayout from "@/hooks/useAutoLayout";

function FlowContent() {
  const validation = useWorkspaceStore((state) => state.validation);

  // Determine background color based on validation state
  const bgColor = validation.isValid ? "#ccc" : "rgba(239, 68, 68, 0.2)"; // red-500 with opacity

  return (
    <>
      <Background color={bgColor} variant={BackgroundVariant.Dots} />
      <MiniMap />
      <Controls />
      <LayoutPanel />
      <DevTools />
    </>
  );
}

// Create a new component that will use the ReactFlow hooks
function FlowWithAutoLayout({ nodes, edges, setNodes, setEdges }) {
  const { fitView } = useReactFlow();

  useAutoLayout({
    getNodes: () => nodes,
    getEdges: () => edges,
    setNodes,
    setEdges,
    fitView,
  });

  return null;
}

export default function Flow() {
  const layoutOptions = useLayoutOptions();
  const selector = (state) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
  });

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
  } = useWorkspaceStore(useShallow(selector));

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodesDraggable={!layoutOptions.auto}
      >
        <FlowContent />
        <FlowWithAutoLayout
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
        />
      </ReactFlow>
      <LayoutPanel />
    </ReactFlowProvider>
  );
}

// layout settings panel
function LayoutPanel() {
  const updateConfig = useWorkspaceStore((state) => state.updateConfig);
  const config = useWorkspaceStore((state) => state.config);

  const handleDirectionChange = (direction) => {
    updateConfig((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        direction,
      },
    }));
  };

  const handleSpacingChange = (index, value) => {
    const newSpacing = [...config.layout.spacing];
    newSpacing[index] = parseInt(value);

    updateConfig((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        spacing: newSpacing,
      },
    }));
  };

  const handleAutoChange = (auto: boolean) => {
    updateConfig((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        auto,
      },
    }));
  };

  return (
    <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Auto Layout</h3>
          <Switch
            checked={config.layout.auto}
            onCheckedChange={handleAutoChange}
          />
        </div>

        <div>
          <h3 className="font-medium mb-2">Layout Direction</h3>
          <div className="grid grid-cols-2 gap-2">
            {["TB", "BT", "LR", "RL"].map((direction) => (
              <button
                key={direction}
                onClick={() => handleDirectionChange(direction)}
                className={`px-3 py-1 rounded ${
                  config.layout.direction === direction
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {direction}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Spacing</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm">Horizontal</label>
              <input
                type="number"
                min="20"
                max="200"
                value={config.layout.spacing[0]}
                onChange={(e) => handleSpacingChange(0, e.target.value)}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm">Vertical</label>
              <input
                type="number"
                min="20"
                max="200"
                value={config.layout.spacing[1]}
                onChange={(e) => handleSpacingChange(1, e.target.value)}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
