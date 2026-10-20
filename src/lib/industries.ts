// 行业应用数据层 —— 数据来源 content/industries.json（对标竞品：按客户行业建独立应用页）。
// 采用静态 import（构建期内联），与 products.ts 保持同一约定。
import raw from "../../content/industries.json";
import { locales } from "@/i18n/routing";
import type { Locale } from "@/lib/products";
import { pickI18n, pickI18nList, type I18n, type I18nList } from "@/lib/products";

export interface Industry {
  id: string;
  order?: number;
  name: I18n;
  headline: I18n;
  intro: I18n;
  painPoints: I18nList;
  materialsGuide: I18nList;
  recommendedCodes: string[];
  metaTitle: I18n;
  metaDesc: I18n;
}

export interface LocalizedIndustry {
  id: string;
  name: string;
  headline: string;
  intro: string;
  painPoints: string[];
  materialsGuide: string[];
  recommendedCodes: string[];
  metaTitle: string;
  metaDesc: string;
}

interface IndustriesFile {
  version?: number;
  industries: Industry[];
}

const data = raw as IndustriesFile;

function normalizeLocale(locale: string): Locale {
  return (locales as readonly string[]).includes(locale) ? (locale as Locale) : "en";
}

/** 全部行业（按 order 排序） */
export function getIndustries(locale = "en"): LocalizedIndustry[] {
  const loc = normalizeLocale(locale);
  return (data.industries ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((i) => ({
      id: i.id,
      name: pickI18n(i.name, loc),
      headline: pickI18n(i.headline, loc),
      intro: pickI18n(i.intro, loc),
      painPoints: pickI18nList(i.painPoints, loc),
      materialsGuide: pickI18nList(i.materialsGuide, loc),
      recommendedCodes: i.recommendedCodes ?? [],
      metaTitle: pickI18n(i.metaTitle, loc),
      metaDesc: pickI18n(i.metaDesc, loc),
    }));
}

/** 按 id 取单个行业（详情页用） */
export function getIndustry(id: string, locale = "en"): LocalizedIndustry | undefined {
  return getIndustries(locale).find((i) => i.id === id);
}

/** 全部行业 id（generateStaticParams 用） */
export function getIndustryIds(): string[] {
  return (data.industries ?? []).map((i) => i.id);
}
