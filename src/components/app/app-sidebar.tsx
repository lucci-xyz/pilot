"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutGrid,
  Wallet,
  User,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { workspaces } from "@/lib/dummy-data/workspaces";
import { currentUser } from "@/lib/dummy-data/users";

const mainNavItems = [
  { title: "Overview", url: "/app", icon: LayoutGrid },
  { title: "Account", url: "/app/account", icon: User },
  { title: "Billing", url: "/app/billing", icon: Wallet },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-sidebar-border bg-white">
      <SidebarHeader className="p-4">
        <Link href="/app" className="flex items-center gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-0">
          <Image
                src="/pilot.png"
                alt="Pilot"
                width={100}
                height={100}
                className="rounded"
              />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="h-9 gap-2.5 rounded-lg px-3 text-[13px] font-normal text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 data-[active=true]:bg-neutral-100 data-[active=true]:text-neutral-900"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" strokeWidth={1.5} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Workspaces
            </span>
            <button className="rounded-md p-1 hover:bg-neutral-100">
              <Plus className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
            </button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaces.map((workspace) => (
                <SidebarMenuItem key={workspace.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes(`/workspaces/${workspace.id}`)}
                    className="h-9 gap-2.5 rounded-lg px-3 text-[13px] font-normal text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 data-[active=true]:bg-neutral-100 data-[active=true]:text-neutral-900"
                  >
                    <Link href={`/app/workspaces/${workspace.id}`}>
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-neutral-100 to-neutral-200 text-[10px] font-medium text-neutral-600">
                        {workspace.name.charAt(0)}
                      </div>
                      <span className="flex-1 truncate">{workspace.name}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-300" strokeWidth={1.5} />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-neutral-100 p-3">
        <Link
          href="/app/account"
          className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-neutral-50"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="text-[10px] font-medium">
              {currentUser.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-neutral-900">
              {currentUser.name}
            </span>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
