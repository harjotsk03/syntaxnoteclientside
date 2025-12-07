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

export async function getAuthUser() {
  const supabase = await createClient();

  // Get both user and session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user || !session) {
    console.error("No user or session found");
    return null;
  }

  console.log(user);
  console.log(session);

  const metadata = user.user_metadata as UserMetadata;

  const token = session.provider_token;

  console.log("🔍 Checking session.provider_token:", !!token);

  if (token) {
    console.log("✅ Token found in session:", token.substring(0, 10) + "...");
  } else {
    console.error("❌ No token in session.provider_token");
    console.log("Session keys:", Object.keys(session));
  }

  return {
    email: user.email || "",
    user_metadata: metadata,
    username: metadata?.user_name,
    token: token || null,
  };
}

export async function getRepos(
  username: string,
  token: string | null,
  page: number
): Promise<Repo[]> {
  if (!username) {
    console.error("❌ Username is missing");
    return [];
  }

  if (!token) {
    console.error("❌ GitHub token is missing");
    return [];
  }

  console.log(`🔍 Fetching repos for ${username}, page ${page}`);

  try {
    // ✅ Use /user/repos with type=all to get both public AND private repos
    const reposRes = await fetch(
      `https://api.github.com/user/repos?type=all&sort=updated&direction=desc&per_page=10&page=${page}`,
      {
        headers: {
          Authorization: `token ${token}`, // ✅ Changed from "Bearer" to "token"
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!reposRes.ok) {
      const errorText = await reposRes.text();
      console.error("❌ GitHub API error:", errorText);
      console.error("Status:", reposRes.status);
      return [];
    }

    const repos = await reposRes.json();
    console.log(`✅ Successfully fetched ${repos.length} repos`);
    console.log(
      `   Private repos included: ${repos.filter((r: any) => r.private).length}`
    );
    return repos;
  } catch (error) {
    console.error("❌ Fetch error:", error);
    return [];
  }
}
