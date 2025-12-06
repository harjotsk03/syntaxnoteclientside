"use client"
// components/repo-list.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Star, GitBranch } from "lucide-react";
import { useRouter } from "next/navigation";

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

interface RepoListProps {
  repos: Repo[];
  owner: string;
}

export default function RepoList({ repos, owner }: RepoListProps) {

    const router = useRouter();

  if (repos.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No repositories found.</p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repos.map((repo) => (
        <Card
          key={repo.id}
         onClick={() => {router.push(`/repositories/${encodeURIComponent(repo.name)}`);}}
          className="hover:shadow-lg transition-shadow cursor-pointer"
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-sm truncate">{repo.name}</CardTitle>
              <GitBranch className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {repo.description && (
              <CardDescription className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {repo.description}
              </CardDescription>
            )}
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              {repo.language && (
                <span className="bg-secondary px-2 py-1 rounded">
                  {repo.language}
                </span>
              )}
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>{repo.stargazers_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
