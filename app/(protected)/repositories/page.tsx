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
import { supabase } from "@/lib/supabaseClient";
import { useGitHubRepos } from "@/hooks/useGitHubRepos";
import { useMyRepos } from "@/hooks/useMyRepos";

interface GitHubRepo {
  id: number;
  name: string;
  url: string;
  repo: string;
  lastDeploy: string;
  branch: string;
  full_name: string;
}

export default function ProjectsPage() {
  const { user } = useAuthUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<GitHubRepo[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<GitHubRepo[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isGitHubDialogOpen, setIsGitHubDialogOpen] = useState(false);
  const { repos, loading, error } = useMyRepos();

  console.log(repos);

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

      <RepositoryDisplay repos={repos} viewMode={viewMode} />
    </div>
  );
}
