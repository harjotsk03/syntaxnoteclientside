// app/(protected)/repositories/[name]/page.tsx

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { createClient } from "@/utils/supabase/server";

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

export default async function RepoPage({
  params,
}: {
  params: { name: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div className="p-4">Not authenticated</div>;

  const username = user.user_metadata.user_name;
  const repoName = params.name;

  // Fetch specific repo
  const res = await fetch(
    `https://api.github.com/repos/${username}/${repoName}`
  );

  if (!res.ok) return <div className="p-4">Repo not found</div>;

  const repo: Repo = await res.json();

  return (
    <>
      {/* Header */}
      <header className="flex h-16 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/repositories">Repositories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{repoName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Content */}
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-2">{repo.name}</h1>

        {repo.description && (
          <p className="text-muted-foreground mb-4">{repo.description}</p>
        )}

        <div className="flex gap-3 mb-6 text-sm">
          {repo.language && (
            <span className="bg-secondary px-2 py-1 rounded text-muted-foreground">
              {repo.language}
            </span>
          )}

          <span className="text-muted-foreground">
            ⭐ {repo.stargazers_count}
          </span>
        </div>

        <a
          href={repo.html_url}
          target="_blank"
          className="underline text-primary"
        >
          View on GitHub →
        </a>
      </div>
    </>
  );
}
