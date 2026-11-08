import { NextRequest, NextResponse } from "next/server";
import { commitFile, githubConfigured } from "@/lib/github";

/**
 * 询盘接收接口
 *
 * 既有的 Vercel 环境变量 GITHUB_TOKEN / GITHUB_REPO 已可用，所以这里走 GitHub：
 *   1. 优先在仓库里开一个 issue（带 lead 标签）——GitHub 会自动发邮件通知你；
 *   2. 若 issue 权限不足（令牌无 issues 写权限），降级为把询盘写成 content/leads/*.md 提交。
 *
 * 只要其中一条成功即视为收到询盘。
 */

const API = "https://api.github.com";

interface Lead {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  message?: string;
  product?: string;
  source?: string;
  page?: string;
  referrer?: string;
  lang?: string;
  ua?: string;
}

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "gdy-site",
  };
}

function escapeMd(s: string) {
  return s.replace(/\r?\n/g, "  \n");
}

function buildBody(l: Lead, ip: string) {
  const rows: [string, string][] = [
    ["姓名 / Name", l.name || "-"],
    ["邮箱 / Email", l.email || "-"],
    ["公司 / Company", l.company || "-"],
    ["电话 / Phone", l.phone || "-"],
    ["意向产品 / Product", l.product || "-"],
    ["来源表单 / Source", l.source || "-"],
    ["留言 / Message", l.message || "-"],
    ["语言 / Lang", l.lang || "-"],
    ["来源页面 / Page", l.page || "-"],
    ["来源渠道 / Referrer", l.referrer || "-"],
    ["IP", ip || "-"],
    ["UA", (l.ua || "-").slice(0, 200)],
    ["提交时间 / Time", new Date().toISOString()],
  ];
  const title = `[询盘] ${l.name || "匿名"} · ${(l.email || "no-email").slice(0, 40)}`;
  const body = rows
    .map(([k, v]) => `- **${k}**: ${escapeMd(String(v))}`)
    .join("\n");
  return { title, body };
}

async function createIssue(token: string, repo: string, title: string, body: string) {
  const res = await fetch(`${API}/repos/${repo}/issues`, {
    method: "POST",
    headers: ghHeaders(token),
    body: JSON.stringify({ title, body, labels: ["lead", "inquiry"] }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`issue ${res.status}: ${err?.message || res.statusText}`);
  }
  const data = await res.json();
  return data?.html_url as string | undefined;
}

async function writeFileFallback(title: string, body: string) {
  const ts = new Date();
  const stamp = ts.toISOString().replace(/[:.]/g, "-");
  const path = `content/leads/${stamp}.md`;
  // 注：commit message 里的 [skip vercel] 避免询盘写入触发 Vercel 重新部署
  const res = await commitFile(path, `# ${title}\n\n${body}\n`, `lead: ${stamp} [skip vercel]`);
  if (!res.ok) throw new Error(res.error || "写入文件失败");
  return path;
}

export async function POST(req: NextRequest) {
  let lead: Lead;
  try {
    lead = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const hasEmail =
    !!lead.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
  const hasPhone = !!lead.phone && /\d{5,}/.test(lead.phone);
  // 至少要留下一种能联系到的渠道
  if (!hasEmail && !hasPhone) {
    return NextResponse.json({ error: "请填写邮箱或电话" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";

  const { title, body } = buildBody(lead, ip);
  const token = process.env.GITHUB_TOKEN || "";
  const repo = process.env.GITHUB_REPO || "";

  // 兜底：即使 GitHub 完全不可用，也把询盘写进服务端日志（Vercel → Logs 可查）
  console.log("[lead]", JSON.stringify({ ...lead, ip }));

  let mode = "issue";
  let url: string | undefined;
  try {
    url = await createIssue(token, repo, title, body);
  } catch (e) {
    // issue 失败 → 降级写文件
    try {
      await writeFileFallback(title, body);
      mode = "file";
    } catch (e2) {
      console.error("[lead] 全部落库方式失败：", e, e2);
      if (!githubConfigured()) {
        // 本地/未配置环境的兜底：仍返回成功，日志里能看到
        return NextResponse.json({ ok: true, mode: "log" });
      }
      return NextResponse.json({ error: "提交失败，请改用 WhatsApp 或邮箱联系我们。" }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true, mode, url });
}
