"use client";

import * as React from "react";
import { FolderClosed } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthUser } from "@/hooks/useAuthUser";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuthUser();

  const team = {
    name: user?.metadata?.name || user?.username || "User",
    logo: user?.metadata?.avatar_url || "",
    plan: "Personal",
  };

  const navMain = [
    {
      title: "Repositories",
      url: "/repositories",
      icon: FolderClosed,
      isActive: true,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[team]} loading={loading && !user} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        {loading && !user ? (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="size-8 rounded-lg bg-background animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-background rounded animate-pulse" />
              <div className="h-3 w-32 bg-background rounded animate-pulse" />
            </div>
          </div>
        ) : user ? (
          <NavUser
            user={{
              name: team.name,
              email: user.email,
              avatar: team.logo,
            }}
          />
        ) : null}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}