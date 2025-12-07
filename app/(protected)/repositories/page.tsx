"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Grid2X2,
  Menu,
  List,
  GithubIcon,
  FilesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import RepositoryDisplay from "@/components/RepositoryDisplay";
import { GitHubImportDialog } from "@/components/ImportGitHubRepoModal";
import { useAuthUser } from "@/hooks/useAuthUser";

// Mock data - replace with Supabase data
const mockProjects = [
  // {
  //   id: 1,
  //   name: "studyspotr",
  //   url: "studyspotr.vercel.app",
  //   repo: "harjotsk03/studyspotr",
  //   lastDeploy: "Oct 28",
  //   branch: "main",
  //   status: "ready" as const,
  // },
  // {
  //   id: 2,
  //   name: "roominate",
  //   url: "roominate-green.vercel.app",
  //   repo: "harjotsk03/roominate",
  //   lastDeploy: "Dec 1",
  //   branch: "main",
  //   status: "ready" as const,
  // },
  // {
  //   id: 3,
  //   name: "secreloclientside",
  //   url: "www.secrelo.com",
  //   repo: "harjotsk03/secreloclientside",
  //   lastDeploy: "Nov 3",
  //   branch: "main",
  //   status: "ready" as const,
  // },
  // {
  //   id: 4,
  //   name: "study-spotter",
  //   url: "www.studyspotr.com",
  //   repo: "harjotsk03/studyspotr",
  //   lastDeploy: "Oct 28",
  //   branch: "main",
  //   status: "error" as const,
  // },
  // {
  //   id: 5,
  //   name: "harjot-portfolio-2024",
  //   url: "www.harjotsinghkooner.com",
  //   repo: "harjotsk03/portfolio2025",
  //   lastDeploy: "Nov 15",
  //   branch: "main",
  //   status: "ready" as const,
  // },
  // {
  //   id: 6,
  //   name: "northsyncclientside",
  //   url: "northsyncclientside.vercel.app",
  //   repo: "harjotsk03/northsyncclient...",
  //   lastDeploy: "Sep 12",
  //   branch: "main",
  //   status: "ready" as const,
  // },
];

export default function ProjectsPage() {
  const { userSecure } = useAuthUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState(mockProjects);
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isGitHubDialogOpen, setIsGitHubDialogOpen] = useState(false);

  useEffect(() => {
    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.repo.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  const handleGitHubImport = (repoName: string) => {
    console.log("Importing repo:", repoName);
  };

  return (
    <div className="h-screen bg-background pt-8 px-8">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Repositories..."
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-sm"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-40 mt-1.5 bg-background border-border rounded-lg"
            align="end"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground font-light">
              Sort by
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>Activity</DropdownMenuItem>
              <DropdownMenuItem>Name</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center border rounded-sm overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-10 w-10 rounded-none"
            onClick={() => setViewMode("grid")}
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-10 w-10 rounded-none"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="h-10">
              Add New... <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 mt-1.5 bg-background border-border rounded-lg"
            align="end"
          >
            <DropdownMenuItem onSelect={() => setIsGitHubDialogOpen(true)}>
              <GithubIcon />
              Import GitHub Repository
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FilesIcon />
              Custom Project Files
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h1 className="font-medium text-sm mt-4">Repositories</h1>

      <RepositoryDisplay projects={filteredProjects} viewMode={viewMode} />

      {/* GitHub Import Dialog */}
      <GitHubImportDialog
        username={userSecure?.username || ""}
        token={userSecure?.token || ""}
        isOpen={isGitHubDialogOpen}
        onOpenChange={setIsGitHubDialogOpen}
        onImport={handleGitHubImport}
      />
    </div>
  );
}
