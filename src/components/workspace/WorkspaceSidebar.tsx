import * as React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Home, ArrowLeft, Play } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import UserNavSidebar from "@/components/user/UserNav";
import useWorkspaceStore from "@/stores/workspace";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { useShallow } from "zustand/react/shallow";
import { WorkspaceState } from "@/types/types";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { isFeatureEnabled } from "@/config/features";

// layout settings panel
function LayoutPanel() {
  const selector = (state: WorkspaceState) => ({
    config: state.config,
    updateConfig: state.updateConfig,
  });

  const { config, updateConfig } = useWorkspaceStore(useShallow(selector));

  const handleDirectionChange = (direction: "TB" | "LR") => {
    updateConfig((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        direction,
      },
    }));
  };

  const handleSpacingChange = (index: number, value: string) => {
    if (!config) return;
    const newSpacing: [number, number] = [...config.layout.spacing] as [
      number,
      number
    ];
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
    <section className="space-y-6">
      <div className="flex items-center gap-6">
        <h3 className="font-medium ">Auto Layout</h3>
        <Switch
          checked={config?.layout.auto ?? false}
          onCheckedChange={handleAutoChange}
        />
      </div>

      <Collapsible open={config?.layout.auto ?? false}>
        <CollapsibleContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Layout Direction</h3>
            <ToggleGroup
              type="single"
              value={config?.layout.direction}
              onValueChange={(value) =>
                value && handleDirectionChange(value as "TB" | "LR")
              }
              className="grid grid-cols-2 gap-2"
            >
              {["TB", "LR"].map((direction) => (
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
                  value={config?.layout.spacing[0] ?? 50}
                  onChange={(e) => handleSpacingChange(0, e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="vertical-spacing"
                  className="text-sm mb-1.5 block"
                >
                  Vertical
                </label>
                <Input
                  id="vertical-spacing"
                  type="number"
                  min="20"
                  max="200"
                  value={config?.layout.spacing[1] ?? 50}
                  onChange={(e) => handleSpacingChange(1, e.target.value)}
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}

export default function WorkspaceSidebar() {
  const { name, description } = useWorkspaceStore(
    useShallow((state) => ({
      name: state.name,
      description: state.description,
    }))
  );
  const execute = useWorkspaceStore((state) => state.executeWorkspace);

  const handleRun = () => {
    execute();
  };

  const isAutoLayoutEnabled = isFeatureEnabled("autoLayout");

  return (
    <Sidebar side="left">
      <SidebarHeader>
        <div className="flex items-center justify-between w-full">
          <SidebarMenuButton className="!p-0 hover:!bg-transparent" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft size={20} />
              <span className="font-semibold">Flow3</span>
            </Link>
          </SidebarMenuButton>
          <Button size="sm" onClick={handleRun} className="gap-2">
            <Play size={16} />
            Run
          </Button>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="">
            <p className="font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {isAutoLayoutEnabled && (
          <SidebarGroup>
            <SidebarGroupLabel>Layout Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <LayoutPanel />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <UserNavSidebar />
      </SidebarFooter>
    </Sidebar>
  );
}
