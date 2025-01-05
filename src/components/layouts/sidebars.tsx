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
      <main className="flex min-h-full flex-1">
        <SidebarInset>{children}</SidebarInset>
      </main>
      {right}
    </SidebarProvider>
  );
}
