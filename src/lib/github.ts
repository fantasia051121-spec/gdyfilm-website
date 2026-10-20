// 用 GitHub PAT 把生成的文章 .md 提交到 content/news/，触发 Vercel 自动重建上线。
// 仅在配置了 GITHUB_TOKEN + GITHUB_REPO 时启用；否则由调用方走本地写入降级。

const API = "https://api.github.com";

export interface CommitResult {
  ok: boolean;
  mode: "github" | "disabled";
  commitUrl?: string;
  error?: string;
}

export function githubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

async function getDefaultBranch(repo: string, token: string): Promise<string> {
  const res = await fetch(`${API}/repos/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "gdy-site",
    },
  });
  if (!res.ok) {
    throw new Error(`无法访问仓库 ${repo}（${res.status}），请检查 GITHUB_REPO 与令牌权限。`);
  }
  const data = await res.json();
  return process.env.GITHUB_BRANCH || data.default_branch || "main";
}

export async function commitNewsFile(
  slug: string,
  markdown: string
): Promise<CommitResult> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    return { ok: false, mode: "disabled", error: "GITHUB_TOKEN / GITHUB_REPO 未配置。" };
  }

  const path = `content/news/${slug}.md`;
  const branch = await getDefaultBranch(repo, token);
  const content = Buffer.from(markdown, "utf8").toString("base64");

  // 若文件已存在则取其 sha（更新）；不存在则新建。
  let sha: string | undefined;
  const head = await fetch(`${API}/repos/${repo}/contents/${path}?ref=${branch}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "gdy-site",
    },
  });
  if (head.ok) {
    sha = (await head.json()).sha;
  } else if (head.status !== 404) {
    throw new Error(`检查文件是否存在时出错（${head.status}）。`);
  }

  const res = await fetch(`${API}/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "gdy-site",
    },
    body: JSON.stringify({
      message: `news: add ${slug}`,
      content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`提交到 GitHub 失败（${res.status}）：${err?.message || res.statusText}`);
  }
  const data = await res.json();
  return {
    ok: true,
    mode: "github",
    commitUrl: data?.commit?.html_url,
  };
}

// 通用：把任意仓库内文件提交到 GitHub（用于公司信息、FAQ、messages 等）。
export async function commitFile(
  repoPath: string,
  content: string,
  message: string
): Promise<CommitResult> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    return { ok: false, mode: "disabled", error: "GITHUB_TOKEN / GITHUB_REPO 未配置。" };
  }

  const branch = await getDefaultBranch(repo, token);
  const body = Buffer.from(content, "utf8").toString("base64");

  let sha: string | undefined;
  const head = await fetch(`${API}/repos/${repo}/contents/${repoPath}?ref=${branch}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "gdy-site",
    },
  });
  if (head.ok) {
    sha = (await head.json()).sha;
  } else if (head.status !== 404) {
    throw new Error(`检查文件是否存在时出错（${head.status}）。`);
  }

  const res = await fetch(`${API}/repos/${repo}/contents/${repoPath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "gdy-site",
    },
    body: JSON.stringify({ message, content: body, branch, ...(sha ? { sha } : {}) }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`提交到 GitHub 失败（${res.status}）：${err?.message || res.statusText}`);
  }
  const data = await res.json();
  return { ok: true, mode: "github", commitUrl: data?.commit?.html_url };
}
