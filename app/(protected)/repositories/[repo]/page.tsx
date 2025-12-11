"use client";

import { use, useEffect, useState } from "react";
import axios from "axios";

export default function RepoPage({
  params,
}: {
  params: Promise<{ repo: string }>;
}) {
  const { repo } = use(params);

  const [repoData, setRepoData] = useState<any>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchRepoDetails = async () => {
      const id = localStorage.getItem("activeRepoID");
      const token = localStorage.getItem("jwt");

      if (!id || !token) return;

      try {
        const { data } = await axios.get(
          `http://127.0.0.1:8000/repo-metadata/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!isCancelled) {
          console.log(data);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to fetch repo details:", err);
        }
      }
    };

    fetchRepoDetails();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div>
      <h1>Repo: {repo}</h1>
    </div>
  );
}
