import { NodeProps } from "@/components/workspace/types";
import BaseNode from "./BaseNode";

export function StartNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      className="bg-green-100 dark:bg-green-900/20 rounded-full w-12 h-12 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
    />
  );
}
