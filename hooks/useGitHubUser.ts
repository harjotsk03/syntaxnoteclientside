// hooks/useGitHubUser.ts
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface GitHubUser {
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
}

export function useGitHubUser() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const metadata = authUser.user_metadata;
        const username = metadata?.user_name;

        // Set user data
        setUser({
          name: metadata?.name || "",
          username: username || "",
          email: authUser.email || "",
          avatarUrl: metadata?.avatar_url || "",
          bio: metadata?.bio || "",
          publicRepos: metadata?.public_repos || 0,
          followers: metadata?.followers || 0,
          following: metadata?.following || 0,
        });

        // Fetch repos from GitHub
        const reposRes = await fetch(
          `https://api.github.com/users/${username}/repos?sort=stars&per_page=12`
        );
        const reposData = await reposRes.json();

        const formattedRepos = reposData.map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          description: repo.description || "No description",
          url: repo.html_url,
          stars: repo.stargazers_count,
          language: repo.language || "Unknown",
        }));

        setRepos(formattedRepos);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { user, repos, loading, error };
}
