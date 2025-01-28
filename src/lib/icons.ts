import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

export function getIconByName(name: string): LucideIcon {
  // Cast to unknown first to avoid type checking issues
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const icon = icons[name];
  if (!icon) {
    console.warn(`Icon "${name}" not found, using default`);
    return LucideIcons.HelpCircle;
  }
  return icon;
}
