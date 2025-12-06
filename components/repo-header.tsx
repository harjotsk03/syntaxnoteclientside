import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, Star, GitFork, Eye, ExternalLink, Github } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";

interface RepoHeaderProps {
  repo: {
    name: string;
    description: string;
    language: string;
    stargazers_count: number;
    forks: number;
    watchers: number;
    updated_at: string;
    default_branch: string;
    visibility: "public" | "private";
    topics: string[];
    html_url: string;
  };
}

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  Python: "bg-blue-600",
  Go: "bg-cyan-500",
  Rust: "bg-orange-600",
}

export function RepoHeader({ repo }: RepoHeaderProps) {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-0 px-4 pb-4">
      <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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
                  Repositories
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{repo.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
      <div className="">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Github className="w-6 h-6 text-muted-foreground" />
              <h1 className="text-2xl font-semibold tracking-tight">
                {repo.name}
              </h1>
              <Badge
                variant={
                  repo.visibility === "public" ? "secondary" : "destructive"
                }
              >
                {repo.visibility}
              </Badge>
            </div>

            <p className="text-muted-foreground max-w-2xl">
              {(repo.description && repo.description) ||
                "No description for this repository."}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-3 h-3 rounded-full ${
                    languageColors[repo.language] || "bg-gray-500"
                  }`}
                />
                <span>{repo.language}</span>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Star className="w-4 h-4" />
                <span>{repo.stargazers_count}</span>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <GitFork className="w-4 h-4" />
                <span>{repo.forks}</span>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{repo.watchers}</span>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <GitBranch className="w-4 h-4" />
                <span>{repo.default_branch}</span>
              </div>

              <span className="text-muted-foreground">
                Updated {repo.updated_at}
              </span>
            </div>

            {repo.topics?.length ? (
              <div className="flex flex-wrap gap-2">
                {repo.topics.map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <Button variant="secondary" size="sm" asChild>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2 hover:cursor-pointer"
            >
              View on GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
