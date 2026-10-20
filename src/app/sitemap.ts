import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { getProductSeries } from "@/lib/products";
import { getIndustryIds } from "@/lib/industries";
import { getNewsSlugs } from "@/lib/news";

const SITE_URL = "https://gdyfilm.com";

/** 固定栏目页（相对路径） */
const STATIC_PATHS = [
  "",
  "/about",
  "/services",
  "/cases",
  "/quality",
  "/news",
  "/faq",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  const push = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly") => {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
      });
    }
  };

  // 栏目页
  for (const p of STATIC_PATHS) {
    push(p, p === "" ? 1 : 0.8);
  }

  // 全部型号详情页
  const codes = getProductSeries("en")
    .flatMap((s) => s.models)
    .map((m) => m.code)
    .filter((c): c is string => Boolean(c));
  for (const code of codes) {
    push(`/products/${code}`, 0.7);
  }

  // 行业应用详情页
  for (const id of getIndustryIds()) {
    push(`/cases/${id}`, 0.7);
  }

  // 新闻详情页
  for (const slug of getNewsSlugs()) {
    push(`/news/${slug}`, 0.5, "monthly");
  }

  return entries;
}
