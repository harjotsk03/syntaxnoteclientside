import React from "react";
import { GitBranch, Calendar, ExternalLink, MoreVertical } from "lucide-react";

interface Project {
  id: number;
  name: string;
  url: string;
  repo: string;
  lastDeploy: string;
  branch: string;
  status: "ready" | "error";
}

interface RepositoryDisplayProps {
  projects: Project[];
  viewMode: "grid" | "list";
}

export default function RepositoryDisplay({
  projects,
  viewMode,
}: RepositoryDisplayProps) {
  const StatusBadge = ({ status }: { status: "ready" | "error" }) => (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${
          status === "ready" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-xs text-gray-500 capitalize">{status}</span>
    </div>
  );

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border rounded-lg bg-white hover:shadow-md transition-shadow"
          >
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                    <ExternalLink className="h-3 w-3" />
                    {project.url}
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="px-4 pb-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GitBranch className="h-4 w-4" />
                  <span>{project.repo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{project.lastDeploy}</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {project.branch}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t">
              <StatusBadge status={project.status} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="mt-6 space-y-2">
      {projects.map((project) => (
        <div
          key={project.id}
          className="border rounded-lg bg-white hover:shadow-sm transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                    <ExternalLink className="h-3 w-3" />
                    {project.url}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 min-w-[200px]">
                  <GitBranch className="h-4 w-4" />
                  <span className="truncate">{project.repo}</span>
                </div>

                <div className="flex items-center gap-2 min-w-[100px]">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {project.branch}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 min-w-[100px]">
                  <Calendar className="h-4 w-4" />
                  <span>{project.lastDeploy}</span>
                </div>

                <div className="min-w-[80px]">
                  <StatusBadge status={project.status} />
                </div>
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-md transition-colors ml-4">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
