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
import { Home, Settings, Users, FileText, Wallet, Hash } from "lucide-react";
import UserNav from "@/components/user/UserNav";
import useCounterStore from "@/stores/counter";

export default function DashboardSidebar() {
  const { count, increment } = useCounterStore();

  const clickHandler = () => {
    increment();
  };

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
            <SidebarMenuButton tooltip="Counter" onClick={clickHandler}>
              <Hash />
              <span>Count: {count}</span>
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
