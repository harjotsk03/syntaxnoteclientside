"use client";

import { useEffect, useState } from "react";

interface Repo {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  created_at?: string;
}

interface MyReposResponse {
  user_id: string;
  total_repos: number;
  repos: Repo[];
}

export function useMyRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      const token = localStorage.getItem("jwt");
      if (!token) {
        setError("No JWT found");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/my-repos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.detail || "Failed to fetch repos");
          setLoading(false);
          return;
        }

        const data: MyReposResponse = await res.json();
        setRepos(data.repos);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError("Network error");
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  return { repos, loading, error };
}
