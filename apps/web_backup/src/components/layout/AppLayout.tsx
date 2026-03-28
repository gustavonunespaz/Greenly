import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Search, Bell } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-white/[0.06] px-4 backdrop-blur-sm bg-background/80 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              {title && (
                <h1 className="text-base font-semibold text-foreground tracking-tight">
                  {title}
                </h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors">
                <Search className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors relative">
                <Bell className="h-4 w-4" strokeWidth={1.5} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
