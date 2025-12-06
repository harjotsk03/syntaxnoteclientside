import { createClient } from "@/utils/supabase/server";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  File,
  Folder,
  GitBranch,
  Star,
  GitFork,
  Eye,
  Code2,
  FileText,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function getLanguageColor(lang: string | null): string {
  const colors: Record<string, string> = {
    JavaScript: "bg-yellow-500",
    TypeScript: "bg-blue-500",
    Python: "bg-blue-600",
    Java: "bg-orange-600",
    Go: "bg-cyan-500",
    Rust: "bg-orange-700",
    HTML: "bg-orange-500",
    CSS: "bg-blue-400",
    Ruby: "bg-red-600",
  };
  return colors[lang || ""] || "bg-gray-500";
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();

  if (["ts", "tsx", "js", "jsx"].includes(ext || ""))
    return <Code2 className="w-4 h-4 text-blue-500" />;
  if (["md", "txt"].includes(ext || ""))
    return <FileText className="w-4 h-4 text-gray-500" />;
  if (["json", "yml", "yaml"].includes(ext || ""))
    return <File className="w-4 h-4 text-yellow-500" />;

  return <File className="w-4 h-4 text-muted-foreground" />;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export default async function RepoPage({
  params,
}: {
  params: Promise<{ repo: string }>;
}) {
  const { repo: repoName } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div className="p-4">Not authenticated</div>;

  const username = user.user_metadata.user_name;

  // Fetch repo details and commits
  const [repoRes, contentsRes, commitsRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${username}/${repoName}`, {
      next: { revalidate: 60 },
    }),
    fetch(`https://api.github.com/repos/${username}/${repoName}/contents`, {
      next: { revalidate: 60 },
    }),
    fetch(
      `https://api.github.com/repos/${username}/${repoName}/commits?per_page=5`,
      {
        next: { revalidate: 60 },
      }
    ),
  ]);

  if (repoRes.status !== 200 || contentsRes.status !== 200) {
    return <div className="p-4">Repository not found.</div>;
  }

  const repoData = await repoRes.json();
  const contents: GitHubContent[] = await contentsRes.json();
  const commits = commitsRes.status === 200 ? await commitsRes.json() : [];

  // Sort: directories first, then files
  const sortedContents = contents.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "dir" ? -1 : 1;
  });

  const directories = sortedContents.filter((item) => item.type === "dir");
  const files = sortedContents.filter((item) => item.type === "file");

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
                  Repositories
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{repoName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Repo Stats Cards */}
        {/* <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Stars
              </CardDescription>
              <CardTitle className="text-2xl">
                {repoData.stargazers_count}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <GitFork className="w-4 h-4" />
                Forks
              </CardDescription>
              <CardTitle className="text-2xl">{repoData.forks_count}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Watchers
              </CardDescription>
              <CardTitle className="text-2xl">
                {repoData.watchers_count}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <File className="w-4 h-4" />
                Size
              </CardDescription>
              <CardTitle className="text-2xl">
                {Math.round(repoData.size / 1024)} MB
              </CardTitle>
            </CardHeader>
          </Card>
        </div> */}

        {/* Main Content with Tabs */}
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="commits">Commits</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5" />
                      {repoName}
                    </CardTitle>
                    {repoData.description && (
                      <CardDescription className="mt-2">
                        {repoData.description}
                      </CardDescription>
                    )}
                  </div>
                  <a
                    href={repoData.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                  >
                    View on GitHub →
                  </a>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {repoData.language && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${getLanguageColor(
                          repoData.language
                        )}`}
                      ></span>
                      {repoData.language}
                    </Badge>
                  )}
                  {repoData.license && (
                    <Badge variant="outline">{repoData.license.spdx_id}</Badge>
                  )}
                  <Badge variant="outline">
                    Updated {formatDate(repoData.updated_at)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[500px] w-full rounded-md border">
                  <div className="p-4">
                    {/* Directories */}
                    {directories.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                          Folders
                        </h3>
                        <div className="space-y-1">
                          {directories.map((item) => (
                            <div
                              key={item.sha}
                              className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors group"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="text-sm font-medium truncate group-hover:text-blue-500 transition-colors">
                                  {item.name}
                                </span>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                Folder
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Files */}
                    {files.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                          Files
                        </h3>
                        <div className="space-y-1">
                          {files.map((item) => (
                            <div
                              key={item.sha}
                              className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors group"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {getFileIcon(item.name)}
                                <span className="text-sm font-medium truncate">
                                  {item.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs hidden sm:flex"
                                >
                                  {formatFileSize(item.size)}
                                </Badge>
                                {item.download_url && (
                                  <a
                                    href={item.download_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:underline"
                                  >
                                    View
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commits Tab */}
          <TabsContent value="commits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Commits</CardTitle>
                <CardDescription>
                  Latest 5 commits to this repository
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {commits.map((commit: any) => (
                      <div
                        key={commit.sha}
                        className="border-l-2 border-blue-500 pl-4 py-2"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {commit.commit.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              by {commit.commit.author.name}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 whitespace-nowrap"
                          >
                            <Clock className="w-3 h-3" />
                            {formatDate(commit.commit.author.date)}
                          </Badge>
                        </div>
                        <a
                          href={commit.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline mt-2 inline-block"
                        >
                          {commit.sha.substring(0, 7)}
                        </a>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About this repository</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {repoData.description || "No description provided"}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Created</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(repoData.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-1">Last Updated</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(repoData.updated_at)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Default Branch
                    </h3>
                    <Badge variant="secondary">{repoData.default_branch}</Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-1">Visibility</h3>
                    <Badge
                      variant={repoData.private ? "destructive" : "default"}
                    >
                      {repoData.private ? "Private" : "Public"}
                    </Badge>
                  </div>
                </div>

                {repoData.topics && repoData.topics.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {repoData.topics.map((topic: string) => (
                          <Badge key={topic} variant="outline">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
