"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-neutral-100 bg-white/80 px-4 backdrop-blur-sm lg:px-6">
      <SidebarTrigger className="lg:hidden">
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </SidebarTrigger>

      {title && (
        <h1 className="text-[15px] font-medium text-neutral-900">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-900">
          <Search className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-neutral-500 hover:text-neutral-900">
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>
      </div>
    </header>
  );
}
