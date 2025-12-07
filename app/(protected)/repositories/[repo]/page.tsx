// app/(protected)/repositories/[repo]/page.tsx
import { createClient } from "@/utils/supabase/server";
import RepoPageClient from "./RepoPageClient";
import { getFromCache, setInCache } from "@/lib/cache";

// Define the type for repo stats
type RepoStats = {
  totalFiles: number;
  directories: number;
  linesOfCode: number;
  contributors: number;
  weeklyCommits: number;
  commitPercentageChange: number;
};

async function countFilesRecursively(
  username: string,
  repo: string,
  path: string = "",
  headers: HeadersInit
): Promise<{ files: number; dirs: number }> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${username}/${repo}/contents/${path}`,
      { headers }
    );

    if (!res.ok) {
      console.error(`Failed to fetch contents for ${path}:`, res.status);
      return { files: 0, dirs: 0 };
    }

    const items = await res.json();

    if (!Array.isArray(items)) return { files: 0, dirs: 0 };

    let fileCount = 0;
    let dirCount = 0;

    for (const item of items) {
      if (item.type === "file") {
        fileCount++;
      } else if (item.type === "dir") {
        dirCount++;
      }
    }

    return { files: fileCount, dirs: dirCount };
  } catch (error) {
    console.error("Error counting files:", error);
    return { files: 0, dirs: 0 };
  }
}

async function getRepoStats(
  username: string,
  repo: string,
  token: string
): Promise<RepoStats> {
  const cacheKey = `repo-stats:${username}:${repo}`;

  // Check cache first with proper typing
  const cached = getFromCache<RepoStats>(cacheKey);
  if (cached) {
    console.log("✅ Cache HIT for", cacheKey);
    return cached;
  }

  console.log("❌ Cache MISS for", cacheKey);

  // ✅ Include Authorization header with token
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `token ${token}`, // ✅ Use "token" prefix for OAuth tokens
  };

  try {
    const [contributorsRes, languagesRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${username}/${repo}/contributors`, {
        headers,
      }),
      fetch(`https://api.github.com/repos/${username}/${repo}/languages`, {
        headers,
      }),
      fetch(
        `https://api.github.com/repos/${username}/${repo}/commits?per_page=100`,
        { headers }
      ),
    ]);

    const contributors = await contributorsRes?.json();
    const languages = await languagesRes?.json();
    const commits = await commitsRes?.json();

    const { files, dirs } = await countFilesRecursively(
      username,
      repo,
      "",
      headers
    );

    const linesOfCode = Object.values(languages || {}).reduce(
      (sum: number, lines: any) => sum + lines,
      0
    );

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyCommits = Array.isArray(commits)
      ? commits.filter(
          (commit: any) => new Date(commit.commit.author.date) > oneWeekAgo
        ).length
      : 0;

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const previousWeekCommits = Array.isArray(commits)
      ? commits.filter((commit: any) => {
          const commitDate = new Date(commit.commit.author.date);
          return commitDate > twoWeeksAgo && commitDate <= oneWeekAgo;
        }).length
      : 0;

    const commitPercentageChange =
      previousWeekCommits > 0
        ? Math.round(
            ((weeklyCommits - previousWeekCommits) / previousWeekCommits) * 100
          )
        : 0;

    const stats: RepoStats = {
      totalFiles: files,
      directories: dirs,
      linesOfCode: Math.round((linesOfCode / 1000) * 10) / 10,
      contributors: Array.isArray(contributors) ? contributors.length : 0,
      weeklyCommits,
      commitPercentageChange,
    };

    // Store in cache
    setInCache(cacheKey, stats);

    return stats;
  } catch (error) {
    console.error("Error fetching repo stats:", error);
    // Return default stats on error
    return {
      totalFiles: 0,
      directories: 0,
      linesOfCode: 0,
      contributors: 0,
      weeklyCommits: 0,
      commitPercentageChange: 0,
    };
  }
}

export default async function RepoPage(props: {
  params: Promise<{ repo: string }>;
}) {
  const { repo: encodedRepo } = await props.params;

  // ✅ Decode the repo name from URL
  const repo = decodeURIComponent(encodedRepo);

  console.log("📦 Repo from URL:", encodedRepo);
  console.log("📦 Decoded repo name:", repo);

  const supabase = await createClient();

  // ✅ Get both user and session to access the token
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user || !session) {
    return <div className="p-4">Not authenticated</div>;
  }

  const token = session.provider_token;

  if (!token) {
    return (
      <div className="p-4">
        <p className="text-red-500 font-semibold">❌ GitHub token not found</p>
        <p className="text-sm mt-2">
          Please sign out and sign back in to grant repository access.
        </p>
        <a
          href="/auth/signout"
          className="inline-block mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out
        </a>
      </div>
    );
  }

  const username = user.user_metadata.user_name;

  console.log(`🔗 Fetching: https://api.github.com/repos/${username}/${repo}`);

  // ✅ Include Authorization header with token
  // GitHub OAuth tokens use "token" prefix, not "Bearer"
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `token ${token}`, // ✅ Changed from "Bearer" to "token"
    "X-GitHub-Api-Version": "2022-11-28",
  };

  console.log("🔑 Using token:", token.substring(0, 10) + "...");

  try {
    // ✅ Test the token first by fetching user repos
    console.log("🧪 Testing token by fetching user repos...");
    const testRes = await fetch(
      `https://api.github.com/user/repos?per_page=1`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    console.log("🧪 Token test result:", testRes.ok, testRes.status);

    if (!testRes.ok) {
      const errorText = await testRes.text();
      console.error("🧪 Token test failed:", errorText);
    }

    const [repoRes, contentsRes, commitsRes, repoStats] = await Promise.all([
      fetch(`https://api.github.com/repos/${username}/${repo}`, {
        headers,
        cache: "no-store", // Don't cache authenticated requests
      }),
      fetch(`https://api.github.com/repos/${username}/${repo}/contents`, {
        headers,
        cache: "no-store",
      }),
      fetch(
        `https://api.github.com/repos/${username}/${repo}/commits?per_page=5`,
        { headers, cache: "no-store" }
      ),
      getRepoStats(username, repo, token),
    ]);

    // Check if repo fetch was successful
    if (!repoRes.ok) {
      const errorText = await repoRes.text();
      const errorData = JSON.parse(errorText);
      console.error("Failed to fetch repo:", errorText);
      console.error(
        "Request URL:",
        `https://api.github.com/repos/${username}/${repo}`
      );
      console.error(
        "Response headers:",
        Object.fromEntries(repoRes.headers.entries())
      );

      return (
        <div className="p-4 space-y-4">
          <div>
            <p className="text-red-500 font-semibold">
              Failed to load repository: {repo}
            </p>
            <p className="text-sm mt-2">
              Status: {repoRes.status} - {repoRes.statusText}
            </p>
          </div>

          <div className="bg-zinc-900 p-4 rounded-lg">
            <p className="text-sm font-mono">
              URL: /repos/{username}/{repo}
            </p>
            <p className="text-sm font-mono mt-2">
              Token: {token.substring(0, 15)}...
            </p>
          </div>

          {repoRes.status === 404 && (
            <div>
              <p className="text-sm font-semibold">Possible reasons:</p>
              <ul className="text-sm list-disc ml-6 mt-2 space-y-1">
                <li>Repository doesn't exist</li>
                <li>Repository name is incorrect</li>
                <li>Token doesn't have access to this repository</li>
                <li>Repository is private and 'repo' scope wasn't granted</li>
              </ul>

              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Try these steps:</p>
                <ol className="text-sm list-decimal ml-6 space-y-1">
                  <li>
                    Verify the repo exists at:{" "}
                    <a
                      href={`https://github.com/${username}/${repo}`}
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      github.com/{username}/{repo}
                    </a>
                  </li>
                  <li>
                    Check token scopes at:{" "}
                    <a
                      href="https://github.com/settings/connections/applications"
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      GitHub Apps
                    </a>
                  </li>
                  <li>Sign out and sign back in to re-grant permissions</li>
                </ol>
              </div>
            </div>
          )}

          <a
            href="/repositories"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ← Back to Repositories
          </a>
        </div>
      );
    }

    const repoData = await repoRes.json();
    const contents = contentsRes.ok ? await contentsRes.json() : [];
    const commits = commitsRes.ok ? await commitsRes.json() : [];

    return (
      <RepoPageClient
        repo={repoData}
        contents={contents}
        commits={commits}
        stats={repoStats}
      />
    );
  } catch (error) {
    console.error("Error loading repository page:", error);
    return (
      <div className="p-4">
        <p className="text-red-500 font-semibold">
          An error occurred while loading the repository
        </p>
        <p className="text-sm mt-2 text-muted-foreground">
          Check the console for more details.
        </p>
      </div>
    );
  }
}
