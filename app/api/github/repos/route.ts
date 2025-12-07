import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const page = searchParams.get("page") || "1";
  const per_page = searchParams.get("per_page") || "10";

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  // GitHub API paginated request
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=stars&page=${page}&per_page=${per_page}`
  );

  const data = await res.json();
  return NextResponse.json(data);
}
