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
  const [hydrated, setHydrated] = useState(false); // ⭐ NEW

  useEffect(() => {
    // Load cached user
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("github_user");
      if (cached) {
        setUser(JSON.parse(cached));
        setLoading(false);
      }
    }

    setHydrated(true); // ⭐ mark hydration complete
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user) return; // Skip if cached

      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const authUser = data.user;

        if (!authUser) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const metadata = authUser.user_metadata;
        const username = metadata?.user_name;

        const newUser = {
          name: metadata?.name || "",
          username: username || "",
          email: authUser.email || "",
          avatarUrl: metadata?.avatar_url || "",
          bio: metadata?.bio || "",
          publicRepos: metadata?.public_repos || 0,
          followers: metadata?.followers || 0,
          following: metadata?.following || 0,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("github_user", JSON.stringify(newUser));
        }

        setUser(newUser);
        setLoading(false);
      } catch (err) {
        setError("Failed to load");
        setLoading(false);
      }
    };

    if (hydrated && !user) fetchData();
  }, [hydrated, user]);

  return { user, repos, loading, error, hydrated };
}
