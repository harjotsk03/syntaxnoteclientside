"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Lock } from "lucide-react";
import { useGitHubRepos } from "@/hooks/useGitHubRepos";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { formatSmartDate } from "@/utils/formatSmartDate";

interface RepoOwner {
  login: string;
  avatar_url: string;
}

export interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  private: boolean;
  pushed_at: string;
  owner: RepoOwner;
}

interface GitHubImportDialogProps {
  username: string | null;
  token: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (repoName: string) => void;
}

export function GitHubImportDialog({
  username,
  token,
  isOpen,
  onOpenChange,
  onImport,
}: GitHubImportDialogProps) {
  const [selectedRepoName, setSelectedRepoName] = useState<string>("");
  const [selectedRepoObject, setSelectedRepoObject] = useState<Repo | null>(
    null
  );

  const { repos, loading, search, setSearch } = useGitHubRepos({
    username,
    token,
  });

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRepoName && onImport) {
        console.log(selectedRepoObject);
      onImport(selectedRepoName);
      onOpenChange(false);
      setSelectedRepoName("");
      setSelectedRepoObject(null);
      setSearch("");
    }
  };

  // Combine selected repo at the top of the list
  const displayedRepos = selectedRepoObject
    ? [
        selectedRepoObject,
        ...repos.filter((r) => r.id !== selectedRepoObject.id),
      ]
    : repos;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleImport}>
          <DialogHeader>
            <DialogTitle>Import GitHub Repository</DialogTitle>
            <DialogDescription>
              Select a repository from your GitHub account to import.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Search input */}
            <div className="grid gap-3">
              <Label htmlFor="repo-search">Search Repositories</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="repo-search"
                  placeholder="Search your repos..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Repository list */}
            <div className="grid gap-2">
              <Label>Your Repositories</Label>
              <div className="border rounded-md h-80 overflow-y-auto">
                {loading && displayedRepos.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading repositories...
                  </div>
                ) : displayedRepos.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                    No repositories found
                  </div>
                ) : (
                  displayedRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className={`flex items-center justify-between px-4 h-14 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors ${
                        selectedRepoName === repo.name ? "bg-muted" : ""
                      }`}
                      onClick={() => {
                        setSelectedRepoName(repo.name);
                        setSelectedRepoObject(repo);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-5.5 h-5.5 overflow-hidden flex items-center justify-center rounded-full">
                                <Image
                                  src={repo.owner.avatar_url}
                                  alt={repo.owner.login}
                                  width={500}
                                  height={500}
                                  className="object-cover"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{repo.owner.login}</p>
                            </TooltipContent>
                          </Tooltip>

                          <div className="text-sm font-medium truncate flex flex-row gap-2 items-center">
                            <p className="flex flex-row gap-1 items-center">
                              {repo.name} {repo.private && <Lock size={14} />}
                            </p>
                            <p className="text-muted-foreground text-xs">•</p>
                            <p className="text-muted-foreground text-xs">
                              {formatSmartDate(repo.pushed_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedRepoName === repo.name && (
                        <div className="px-2 py-1 rounded-md bg-green-300/30">
                          <p className="text-xs text-green-700 font-regular">
                            Selected
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!selectedRepoName || loading}>
              Import Repository
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
