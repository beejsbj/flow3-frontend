import React from "react";
import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from "react";

import {
  useNodes,
  Panel,
  useStore,
  useStoreApi,
  type OnNodesChange,
  type NodeChange,
  type XYPosition,
  ViewportPortal,
  useReactFlow,
} from "@xyflow/react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ViewportLogger() {
  const viewport = useStore(
    (s) =>
      `x: ${s.transform[0].toFixed(2)}, y: ${s.transform[1].toFixed(
        2
      )}, zoom: ${s.transform[2].toFixed(2)}`
  );

  return <div>{viewport}</div>;
}

type ChangeLoggerProps = {
  color?: string;
  limit?: number;
};

type ChangeInfoProps = {
  change: NodeChange;
};

function ChangeInfo({ change }: ChangeInfoProps) {
  const id = "id" in change ? change.id : "-";
  const { type } = change;

  return (
    <div className="mb-3">
      <div>node id: {id}</div>
      <div>
        {type === "add" ? JSON.stringify(change.item, null, 2) : null}
        {type === "dimensions"
          ? `dimensions: ${change.dimensions?.width} × ${change.dimensions?.height}`
          : null}
        {type === "position"
          ? `position: ${change.position?.x.toFixed(
              1
            )}, ${change.position?.y.toFixed(1)}`
          : null}
        {type === "remove" ? "remove" : null}
        {type === "select" ? (change.selected ? "select" : "unselect") : null}
      </div>
    </div>
  );
}

export function ChangeLogger({ limit = 20 }: ChangeLoggerProps) {
  const [changes, setChanges] = useState<NodeChange[]>([]);
  const store = useStoreApi();

  // Memoize the callback for handling node changes
  const handleNodeChanges: OnNodesChange = useCallback(
    (newChanges: NodeChange[]) => {
      setChanges((prevChanges) =>
        [...newChanges, ...prevChanges].slice(0, limit)
      );
    },
    [limit]
  );

  useEffect(() => {
    store.setState({ onNodesChange: handleNodeChanges });

    return () => store.setState({ onNodesChange: undefined });
  }, [handleNodeChanges, store]);

  const NoChanges = () => <div>No Changes Triggered</div>;

  return (
    <>
      {changes.length === 0 ? (
        <NoChanges />
      ) : (
        changes.map((change, index) => (
          <ChangeInfo key={index} change={change} />
        ))
      )}
    </>
  );
}

export function NodeInspector() {
  const { getInternalNode } = useReactFlow();
  const nodes = useNodes();

  return (
    <ViewportPortal>
      <div className="text-secondary-foreground">
        {nodes.map((node) => {
          const internalNode = getInternalNode(node.id);
          if (!internalNode) {
            return null;
          }

          const absPosition = internalNode?.internals.positionAbsolute;

          return (
            <NodeInfo key={node.id} node={node} absPosition={absPosition} />
          );
        })}
      </div>
    </ViewportPortal>
  );
}

type NodeInfoProps = {
  node: any;
  absPosition: XYPosition;
};

function NodeInfo({ node, absPosition }: NodeInfoProps) {
  if (!node.measured?.width || !node.measured?.height) return null;

  const absoluteTransform = `translate(${absPosition.x}px, ${
    absPosition.y + node.measured.height
  }px)`;

  // Helper function to extract icon name from complex icon objects
  const simplifyIcon = (icon: any): string => {
    if (!icon) return "none";
    if (icon.$$typeof && typeof icon.$$typeof === "symbol") {
      return icon.render?.name || icon.className || "ReactComponent";
    }
    return String(icon);
  };

  // Recursive function to format nested objects and arrays
  const formatValue = (
    value: any,
    depth = 0,
    key?: string
  ): React.ReactNode => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value !== "object") return String(value);

    // Special handling for icon property
    if (key === "icon") {
      return simplifyIcon(value);
    }

    if (Array.isArray(value)) {
      const items = value.map((v, i) => (
        <div key={i} style={{ marginLeft: `${depth}em` }}>
          {formatValue(v, depth + 1)}
        </div>
      ));
      return <div>[{items}]</div>;
    }

    const entries = Object.entries(value).map(([k, v], i) => (
      <div key={i} style={{ marginLeft: `${depth}em` }}>
        <span className="font-semibold text-blue-600">{k}:</span>{" "}
        {formatValue(v, depth + 1, k)}
      </div>
    ));

    return (
      <div>
        {`{`}
        {entries}
        {`}`}
      </div>
    );
  };

  // Format all node properties for display
  const nodeProperties = Object.entries(node).map(([key, value]) => (
    <div key={key} className="mb-0.5">
      <span className="font-semibold text-blue-600">{key}:</span>{" "}
      {formatValue(value, 1, key)}
    </div>
  ));

  return (
    <code
      style={{
        position: "absolute",
        transform: absoluteTransform,
      }}
      className="absolute text-[8px] max-w-[25em] bg-white/95 p-1.5 rounded border shadow-sm"
    >
      {nodeProperties}
    </code>
  );
}

type Tool = {
  active: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
  label: string;
  value: string;
};

type DevToolsToggleProps = {
  tools: Tool[];
};

function DevToolsToggle({ tools }: DevToolsToggleProps) {
  return (
    <Panel position="top-left" className="bg-card p-1 border rounded shadow-xs">
      <ToggleGroup type="multiple">
        {tools.map(({ active, setActive, label, value }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            onClick={() => setActive((prev) => !prev)}
            aria-pressed={active}
            className="bg-card text-card-foreground transition-colors duration-300 hover:bg-secondary hover:text-secondary-foreground"
          >
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Panel>
  );
}

export function DevTools() {
  const [nodeInspectorActive, setNodeInspectorActive] = useState(false);
  const [changeLoggerActive, setChangeLoggerActive] = useState(false);
  const [viewportLoggerActive, setViewportLoggerActive] = useState(false);

  const tools = [
    {
      active: nodeInspectorActive,
      setActive: setNodeInspectorActive,
      label: "Node Inspector",
      value: "node-inspector",
    },
    {
      active: changeLoggerActive,
      setActive: setChangeLoggerActive,
      label: "Change Logger",
      value: "change-logger",
    },
    {
      active: viewportLoggerActive,
      setActive: setViewportLoggerActive,
      label: "Viewport Logger",
      value: "viewport-logger",
    },
  ];

  return (
    <>
      <DevToolsToggle tools={tools} />

      {changeLoggerActive && (
        <Panel
          className="text-xs p-5 bg-white rounded shadow-md overflow-y-auto max-h-[50%] mt-20"
          position="bottom-right"
        >
          <ChangeLogger />
        </Panel>
      )}

      {nodeInspectorActive && <NodeInspector />}

      {viewportLoggerActive && (
        <Panel position="bottom-left" className="text-secondary-foreground">
          <ViewportLogger />
        </Panel>
      )}
    </>
  );
}

DevTools.displayName = "DevTools";
