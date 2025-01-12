import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface SidebarLayoutProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}

export function SidebarLayout({ left, right, children }: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      {left}
      <SidebarInset>{children}</SidebarInset>
      {right}
    </SidebarProvider>
  );
}
