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
  const res = await fetch(
    `https://api.github.com/repos/${username}/${repo}/contents/${path}`,
    { headers }
  );
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
}

async function getRepoStats(
  username: string,
  repo: string
): Promise<RepoStats> {
  const cacheKey = `repo-stats:${username}:${repo}`;

  // Check cache first with proper typing
  const cached = getFromCache<RepoStats>(cacheKey);
  if (cached) {
    console.log("✅ Cache HIT for", cacheKey);
    return cached;
  }

  console.log("❌ Cache MISS for", cacheKey);

  const headers = {
    Accept: "application/vnd.github+json",
  };

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

  const contributors = await contributorsRes.json();
  const languages = await languagesRes.json();
  const commits = await commitsRes.json();

  const { files, dirs } = await countFilesRecursively(
    username,
    repo,
    "",
    headers
  );

  const linesOfCode = Object.values(languages).reduce(
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
}

export default async function RepoPage(props: {
  params: Promise<{ repo: string }>;
}) {
  const { repo } = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Not authenticated</div>;

  const username = user.user_metadata.user_name;

  const headers = {
    Accept: "application/vnd.github+json",
  };

  const [repoRes, contentsRes, commitsRes, repoStats] = await Promise.all([
    fetch(`https://api.github.com/repos/${username}/${repo}`, {
      headers,
    }),
    fetch(`https://api.github.com/repos/${username}/${repo}/contents`, {
      headers,
    }),
    fetch(
      `https://api.github.com/repos/${username}/${repo}/commits?per_page=5`,
      { headers }
    ),
    getRepoStats(username, repo),
  ]);

  const repoData = await repoRes.json();
  const contents = await contentsRes.json();
  const commits = await commitsRes.json();

  return (
    <RepoPageClient
      repo={repoData}
      contents={contents}
      commits={commits}
      stats={repoStats}
    />
  );
}
