export interface RepoData {
  name: string;
  description: string;
  stargazers_count: number;
  language: string;
}

export interface Commit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  html_url: string;
}

export interface RepoContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
  size: number;
}
