import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";
import { generateNewsArticle } from "@/lib/ai";
import { commitNewsFile, githubConfigured } from "@/lib/github";
import { getNewsSlugs, type NewsCategory } from "@/lib/news";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return Response.json(
      { ok: false, error: "后台未启用：请配置环境变量 ADMIN_PASSWORD。" },
      { status: 500 }
    );
  }
  if (body?.password !== adminPassword) {
    return Response.json({ ok: false, error: "密码错误。" }, { status: 401 });
  }

  const topic: string = (body?.topic || "").toString().trim();
  const category: NewsCategory = body?.category === "industry" ? "industry" : "company";
  if (!topic) {
    return Response.json({ ok: false, error: "请填写文章主题。" }, { status: 400 });
  }

  let article;
  try {
    article = await generateNewsArticle(topic, category);
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || "AI 生成失败。" },
      { status: 502 }
    );
  }

  // slug 冲突检查（避免覆盖已有文章）
  if (getNewsSlugs().includes(article.slug)) {
    return Response.json(
      { ok: false, error: `slug「${article.slug}」已存在，请换个主题或稍后重试。` },
      { status: 409 }
    );
  }

  // 组装 Markdown（FAILSAFE 确保所有字段为字符串，含 date，避免被解析成 Date）
  const frontObj: Record<string, unknown> = {
    slug: article.slug,
    date: new Date().toISOString().slice(0, 10),
    category: article.category,
    cover: article.cover,
  };
  if (article.source) frontObj.source = article.source;
  frontObj.title = article.title;
  frontObj.excerpt = article.excerpt;
  frontObj.body = article.body;

  // 默认 schema 会把 "2026-09-29" 这类值加引号，确保加载时仍是字符串（不会被解析成 Date）。
  const front = yaml.dump(frontObj, { lineWidth: -1 });
  const markdown = `---\n${front}---\n`;

  // 优先提交 GitHub（触发 Vercel 自动重建）；未配置则本地写入（仅 dev 可用）。
  if (githubConfigured()) {
    try {
      const res = await commitNewsFile(article.slug, markdown);
      if (!res.ok) throw new Error(res.error);
      return Response.json({
        ok: true,
        mode: "github",
        slug: article.slug,
        commitUrl: res.commitUrl,
        preview: previewLinks(article.slug),
        note: "已提交到 GitHub，Vercel 将自动重建并上线（通常 1–2 分钟）。",
      });
    } catch (e: any) {
      return Response.json(
        { ok: false, error: `提交失败：${e?.message || e}` },
        { status: 502 }
      );
    }
  }

  // 本地降级：写入 content/news/（开发环境）。生产环境请配置 GitHub。
  try {
    const dir = path.join(process.cwd(), "content", "news");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${article.slug}.md`), markdown, "utf8");
    return Response.json({
      ok: true,
      mode: "local",
      slug: article.slug,
      preview: previewLinks(article.slug),
      note: "GITHUB_TOKEN 未配置，已写入本地 content/news/（仅开发机可见）。上线请配置 GitHub 后重发，或手动 git push。",
    });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: `本地写入失败：${e?.message || e}` },
      { status: 500 }
    );
  }
}

function previewLinks(slug: string): Record<string, string> {
  const locales = ["en", "zh", "vi", "th", "id", "ms", "ar"];
  const out: Record<string, string> = {};
  for (const l of locales) {
    out[l] = `/${l}/news/${slug}`;
  }
  return out;
}
