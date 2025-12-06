// components/repo-card.tsx
"use client";

import { Star, GitBranch } from "lucide-react";
import Link from "next/link";

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

interface RepoCardProps {
  repo: Repo;
  owner: string;
}

export default function RepoCard({ repo, owner }: RepoCardProps) {
  return (
    <Link
      href={`/repositories/${encodeURIComponent(repo.name)}`}
      className="bg-muted/50 rounded-lg p-4 hover:bg-muted transition-colors border border-border hover:border-primary cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm truncate flex-1 group-hover:text-primary transition-colors">
          {repo.name}
        </h3>
        <GitBranch className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
      </div>
      {repo.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {repo.description}
        </p>
      )}
      <div className="flex items-center justify-between text-xs">
        {repo.language && (
          <span className="bg-secondary px-2 py-1 rounded text-muted-foreground">
            {repo.language}
          </span>
        )}
        <div className="flex items-center gap-1 text-muted-foreground">
          <Star className="w-3 h-3" />
          <span>{repo.stargazers_count}</span>
        </div>
      </div>
    </Link>
  );
}
