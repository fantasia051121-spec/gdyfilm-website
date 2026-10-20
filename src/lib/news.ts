// 新闻 / 博客内容数据层（非文案 UI 字符串 —— UI 文案在 src/messages/*.json 的 "news" 命名空间）。
// 内容以 Markdown 文件形式存放在 content/news/*.md，每篇一个文件，frontmatter 内含 7 语言字段。
// 新增/修改文章 = 直接增删 Markdown 文件，无需改动代码。参见 content/news/_TEMPLATE.md。

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Locale } from "@/i18n/routing";

export type NewsCategory = "company" | "industry";

export interface NewsSource {
  label: string;
  url: string;
}

export interface NewsPost {
  slug: string;
  date: string; // YYYY-MM-DD
  category: NewsCategory;
  cover?: string;
  title: Partial<Record<Locale, string>>;
  excerpt: Partial<Record<Locale, string>>;
  body: Partial<Record<Locale, string[]>>;
  source?: NewsSource;
}

const NEWS_DIR = path.join(process.cwd(), "content", "news");

function loadNews(): NewsPost[] {
  if (!fs.existsSync(NEWS_DIR)) return [];
  const files = fs
    .readdirSync(NEWS_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(NEWS_DIR, f), "utf8");
    const { data } = matter(raw);
    return {
      slug: String(data.slug ?? f.replace(/\.md$/, "")),
      date: String(data.date ?? "1970-01-01"),
      category: data.category === "industry" ? "industry" : "company",
      cover: data.cover ? String(data.cover) : undefined,
      title: (data.title ?? {}) as Partial<Record<Locale, string>>,
      excerpt: (data.excerpt ?? {}) as Partial<Record<Locale, string>>,
      body: (data.body ?? {}) as Partial<Record<Locale, string[]>>,
      source: data.source ? (data.source as NewsSource) : undefined,
    } satisfies NewsPost;
  });
}

// 模块加载时读取一次（构建期与运行期均在 Node 服务端执行）。
const newsPosts = loadNews();

export function getAllNews(): NewsPost[] {
  return [...newsPosts].sort((a, b) => b.date.localeCompare(a.date));
}

export function getNewsBySlug(slug: string): NewsPost | undefined {
  return newsPosts.find((p) => p.slug === slug);
}

export function getNewsSlugs(): string[] {
  return newsPosts.map((p) => p.slug);
}

// 取本地化字段；缺失时回退英文（en），再回退到任意已有语言，避免空白。
export function localized<T>(
  field: Partial<Record<Locale, T>> | undefined,
  locale: Locale
): T {
  if (!field) throw new Error("localized: field is required");
  if (field[locale] !== undefined) return field[locale] as T;
  if (field.en !== undefined) return field.en as T;
  const any = Object.values(field)[0];
  return any as T;
}

// 按语言格式化发布日期。
export function formatNewsDate(
  date: string,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  return new Intl.DateTimeFormat(locale, opts).format(new Date(date));
}
