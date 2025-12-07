"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  FolderClosed,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
} from "lucide-react";

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
import { useGitHubUser } from "@/hooks/useGitHubUser";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading, error, hydrated } = useGitHubUser();

  const data = {
    teams: [
      {
        name: user?.name || "User",
        logo: user?.avatarUrl || "",
        plan: "Personal",
      },
    ],
    navMain: [
      {
        title: "Repositories",
        url: "/repositories",
        icon: FolderClosed,
        isActive: true,
      },
      // { title: "Models", url: "#", icon: Bot },
      // { title: "Documentation", url: "#", icon: BookOpen },
      // { title: "Settings", url: "#", icon: Settings2 },
    ],
  };
  if (hydrated) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>

        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>

        <SidebarFooter>
          {/* ----------------------------- */}
          {/*        USER SECTION           */}
          {/* ----------------------------- */}

          {loading && (
            <div className="p-4 text-xs text-muted-foreground">
              Loading user…
            </div>
          )}

          {error && (
            <div className="p-4 text-xs text-red-500">Failed to load user</div>
          )}

          {user && (
            <NavUser
              user={{
                name: user.name,
                email: user.email,
                avatar: user.avatarUrl,
              }}
            />
          )}
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    );
  }
}
