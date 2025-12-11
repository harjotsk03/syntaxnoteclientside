import React from "react";
import {
  GitBranch,
  Calendar,
  ExternalLink,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface GitHubRepo {
  id: string;
  repo: string;
  branch: string;
  owner: string;
}

interface RepositoryDisplayProps {
  repos: GitHubRepo[];
  viewMode: "grid" | "list";
}

export default function RepositoryDisplay({
  repos,
  viewMode,
}: RepositoryDisplayProps) {
  const router = useRouter();

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {repos.map((repo) => (
          <div
            onClick={() => {
              router.push(`/repositories/${repo.repo}`);
              localStorage.setItem("activeRepoID", repo.id);
            }}
            key={repo.id}
            className="border rounded-lg bg-muted hover:bg-background group hover:bg hover:cursor-pointer transition-all duration-500 ease-in-out"
          >
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{repo.repo}</h3>
                  {/* <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                    <ExternalLink className="h-3 w-3" />
                    {repo.url}
                  </p> */}
                </div>
                <Button
                  variant={"ghost"}
                  className="flex flex-row items-center gap-1 hover:bg-transparent"
                >
                  <ArrowRight className="group-hover:translate-x-2 transition-all duration-500 ease-in-out" />
                </Button>
                {/* <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button> */}
              </div>
            </div>
            <div className="px-4 pb-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GitBranch className="h-4 w-4" />
                    <span className="truncate">{repo.branch}</span>
                  </div>
                  <span className="text-xs bg-background px-2 py-1 rounded">
                    {repo.owner}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="mt-6 space-y-2">
      {repos.map((repo) => (
        <div
          onClick={() => {
            router.push(`/repositories/${repo.repo}`);
            localStorage.setItem("activeRepoID", repo.id);
          }}
          key={repo.id}
          className="border hover:cursor-pointer rounded-lg bg-white"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base truncate">
                    {repo.repo}
                  </h3>
                  {/* <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                    <ExternalLink className="h-3 w-3" />
                    {repo.url}
                  </p> */}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GitBranch className="h-4 w-4" />
                  <span className="truncate">{repo.branch}</span>
                </div>

                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {repo.owner}
                </span>
                {/* <div className="flex items-center gap-2 min-w-[100px]">
                </div> */}

                {/* <div className="flex items-center gap-2 text-sm text-gray-600 min-w-[100px]">
                  <Calendar className="h-4 w-4" />
                  <span>{repo.lastDeploy}</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
