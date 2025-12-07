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
import { getAuthUser, getRepos } from "@/hooks/useGitHubRepos";
import RepoTable from "@/components/repo-table";

export default async function RepositoriesPage() {
  const authUser = await getAuthUser();

  if (!authUser) {
    return <div className="p-4">Not authenticated</div>;
  }

  const { username, token, user_metadata: metadata, email } = authUser;

  // Fetch initial repos on server
  const initialRepos = await getRepos(username, token, 1);

  return (
    <div className="fade-up">
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
              <p className="text-xs text-muted-foreground mt-1">{email}</p>
            </div>
          </div>
        </div>

        <RepoTable
          username={username}
          token={token || ""}
          initialRepos={initialRepos}
        />
      </div>
    </div>
  );
}
