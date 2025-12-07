"use server";

import { getRepos } from "@/hooks/useGitHubRepos";

export async function fetchReposAction(
  username: string,
  token: string,
  page: number
) {
  return await getRepos(username, token, page);
}
