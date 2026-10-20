// 读取 content/ 下的可编辑内容（服务端）。公司信息由 site.ts 从 company.json 导入。
import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Locale = "en" | "zh" | "vi" | "th" | "id" | "ms" | "ar";
export const LOCALES: Locale[] = ["en", "zh", "vi", "th", "id", "ms", "ar"];

export interface FaqItem {
  q: string;
  a: string;
}
export type FaqMap = Record<Locale, FaqItem[]>;

export function getFaq(locale: Locale): FaqItem[] {
  try {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, "faq.json"), "utf8");
    const data = JSON.parse(raw) as FaqMap;
    if (data[locale]?.length) return data[locale];
    return data.en; // 回退英文
  } catch {
    return [];
  }
}
