// hooks/useGitHubRepos.ts
import { createClient } from "@/utils/supabase/server";

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

interface UserMetadata {
  name: string;
  user_name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
}

interface UserData {
  email: string;
  user_metadata: UserMetadata;
}

// Get user from Supabase
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const metadata = user.user_metadata as UserMetadata;

  return {
    email: user.email || "",
    user_metadata: metadata,
    username: metadata?.user_name,
  };
}

// Fetch repos from GitHub (non-async, takes username)
export async function getRepos(username: string): Promise<Repo[]> {
  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=stars&per_page=12`
  );
  return await reposRes.json();
}
