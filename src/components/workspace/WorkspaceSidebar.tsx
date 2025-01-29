import * as React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import UserNavSidebar from "@/components/user/UserNav";
import useWorkspaceStore, { useLayoutOptions } from "@/stores/workspace";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";

// layout settings panel
function LayoutPanel() {
  const { options, updateLayout } = useLayoutOptions();

  const handleDirectionChange = (direction: "TB" | "BT" | "LR" | "RL") => {
    updateLayout({ direction });
  };

  const handleSpacingChange = (index: number, value: string) => {
    const newSpacing: [number, number] = [
      ...(options?.spacing ?? [50, 50]),
    ] as [number, number];
    newSpacing[index] = parseInt(value);
    updateLayout({ spacing: newSpacing });
  };

  return (
    <section className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Auto Layout</h3>
        <Switch
          checked={options?.auto ?? false}
          onCheckedChange={(auto) => updateLayout({ auto })}
        />
      </div>

      <div>
        <h3 className="font-medium mb-2">Layout Direction</h3>
        <ToggleGroup
          type="single"
          value={options?.direction}
          onValueChange={(value) =>
            value && handleDirectionChange(value as "TB" | "BT" | "LR" | "RL")
          }
          className="grid grid-cols-2 gap-2"
        >
          {["TB", "BT", "LR", "RL"].map((direction) => (
            <ToggleGroupItem
              key={direction}
              value={direction}
              aria-label={`Direction ${direction}`}
            >
              {direction}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div>
        <h3 className="font-medium mb-2">Spacing</h3>
        <div className="space-y-2">
          <div>
            <label
              htmlFor="horizontal-spacing"
              className="text-sm mb-1.5 block"
            >
              Horizontal
            </label>
            <Input
              id="horizontal-spacing"
              type="number"
              min="20"
              max="200"
              value={options?.spacing[0] ?? 50}
              onChange={(e) => handleSpacingChange(0, e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="vertical-spacing" className="text-sm mb-1.5 block">
              Vertical
            </label>
            <Input
              id="vertical-spacing"
              type="number"
              min="20"
              max="200"
              value={options?.spacing[1] ?? 50}
              onChange={(e) => handleSpacingChange(1, e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function WorkspaceSidebar() {
  const workspace = useWorkspaceStore((state) => ({
    name: state.name,
    description: state.description,
  }));

  return (
    <Sidebar side="left">
      <SidebarHeader>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="hover:opacity-80">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-semibold">Flow3</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {/* Workspace Info */}
          <SidebarMenuItem>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{workspace.name}</h2>
              <p className="text-sm text-gray-600">{workspace.description}</p>
            </div>
          </SidebarMenuItem>

          {/* Layout Controls */}
          <SidebarMenuItem>
            <LayoutPanel />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <UserNavSidebar />
      </SidebarFooter>
    </Sidebar>
  );
}
