import { NodeProps } from "@/components/workspace/types";
import BaseNode from "../core/BaseNode";
import { useLayoutOptions } from "@/stores/workspace";
import React from "react";

export function StartNode(props: NodeProps) {
  const layoutOptions = useLayoutOptions();

  // if LR then the top left and top right border would be rounded
  // if TB then the top left and top right border would be rounded

  return (
    <BaseNode
      {...props}
      iconClassName={`bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors`}
    />
  );
}
