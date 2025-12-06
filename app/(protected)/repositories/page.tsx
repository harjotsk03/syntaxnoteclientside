// app/(protected)/dashboard/page.tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Star, GitBranch } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import RepoCard from "@/components/repo-card";
import { getAuthUser, getRepos } from "@/hooks/useGitHubRepos";
import { redirect } from "next/navigation";
import RepoList from "@/components/repo-list";
import RepoTable from "@/components/repo-table";

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
}

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

interface UserMetadata {
  name: string;
  user_name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-4">Not authenticated</div>;
  }

  const metadata = user.user_metadata as UserMetadata;
  const username: string = metadata?.user_name;

  // Fetch repos from GitHub
  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=stars&per_page=10`
  );
  const reposData: Repo[] = await reposRes.json();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/repositories">
                  <BreadcrumbPage>Repositories</BreadcrumbPage>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {/* <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Repositories</BreadcrumbPage>
              </BreadcrumbItem> */}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* User Profile Card */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
          <div className="flex gap-4 items-start">
            <img
              src={metadata?.avatar_url}
              alt={metadata?.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{metadata?.name}</h1>
              <p className="text-sm text-muted-foreground">@{username}</p>
              {metadata?.bio && <p className="mt-1 text-sm">{metadata.bio}</p>}
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        {/* <RepoList repos={reposData} owner={username} /> */}
        <RepoTable repos={[]} username={username} />
      </div>
    </>
  );
}
