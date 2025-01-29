import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

// Convert string to PascalCase
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function getIconByName(name: string): LucideIcon {
  // Convert the name to PascalCase to match Lucide component names
  const pascalCaseName = toPascalCase(name);

  // Cast to unknown first to avoid type checking issues
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const icon = icons[pascalCaseName];

  if (!icon) {
    console.warn(`Icon "${name}" (${pascalCaseName}) not found, using default`);
    return LucideIcons.HelpCircle;
  }

  return icon;
}
