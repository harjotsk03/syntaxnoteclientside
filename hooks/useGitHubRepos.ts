"use client";
import { useEffect, useState } from "react";

interface Repo {
  pushed_at: any;
  private: any;
  owner: any;
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

interface UseGitHubReposProps {
  username: string | null;
  token: string | null;
}

export function useGitHubRepos({ username, token }: UseGitHubReposProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [initialRepos, setInitialRepos] = useState<Repo[]>([]);

  // --- Debounce ---
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // --- Fetch initial repos ---
  useEffect(() => {
    // Don't fetch if token is missing
    if (!token) {
      console.log("No token provided");
      return;
    }

    async function fetchInitialRepos() {
      setLoading(true);

      try {
        const res = await fetch(
          `https://api.github.com/user/repos?sort=updated&direction=desc&per_page=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setRepos(data);
          setInitialRepos(data);
        } else {
          const errorText = await res.text();
          console.error("Failed to fetch repos:", res.status, errorText);
        }
      } catch (error) {
        console.error("Error fetching repos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialRepos();
  }, [token]);

  // --- Trigger search when debouncedQuery changes ---
  useEffect(() => {
    // If search is empty, show initial repos
    if (!debouncedQuery) {
      setRepos(initialRepos);
      return;
    }

    if (!username || !token) {
      console.log("Missing username or token for search");
      return;
    }

    async function searchRepos() {
      setLoading(true);
      console.log("Searching for:", debouncedQuery);

      try {
        const res = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(
            debouncedQuery
          )}+user:${username}&per_page=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        console.log("Search response status:", res.status);

        if (res.ok) {
          const body = await res.json();
          const items = body.items || [];

          // Sort search results by pushed_at descending
          items.sort(
            (a: Repo, b: Repo) =>
              new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
          );

          setRepos(items);
        } else {
          const errorText = await res.text();
          console.error("Search failed:", res.status, errorText);
        }
      } catch (error) {
        console.error("Error searching repos:", error);
      } finally {
        setLoading(false);
      }
    }

    searchRepos();
  }, [debouncedQuery, username, token, initialRepos]);

  return {
    repos,
    loading,
    search,
    setSearch,
  };
}
