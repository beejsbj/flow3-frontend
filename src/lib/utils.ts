import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Position } from "@xyflow/react";
import { type Direction } from "@/types/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSourceHandlePosition(direction: Direction) {
  switch (direction) {
    case "TB":
      return Position.Bottom;
    case "LR":
      return Position.Right;
  }
}

export function getTargetHandlePosition(direction: Direction) {
  switch (direction) {
    case "TB":
      return Position.Top;
    case "LR":
      return Position.Left;
  }
}

export function getId() {
  return `${Date.now()}`;
}
