import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  Settings,
  Users,
  FileText,
  Wallet,
  LayoutTemplate,
} from "lucide-react";
import UserNav from "@/components/user/UserNav";
import {
  useToggleLayoutDirection,
  useLayoutDirection,
} from "@/stores/workspace";

export default function DashboardSidebar() {
  const toggleLayout = useToggleLayoutDirection();
  const direction = useLayoutDirection();

  return (
    <Sidebar side="left">
      <SidebarHeader className="">
        <span className="font-semibold">Flow3</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Home">
              <Home />
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Users">
              <Users />
              <span>Users</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Documents">
              <FileText />
              <span>Documents</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Toggle Layout" onClick={toggleLayout}>
              <LayoutTemplate />
              <span>Layout: {direction}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/*  */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Connect Wallet">
              <Wallet />
              <span>Connect Wallet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}
