// 产品目录（对外公开）——数据来源 content/products.json。
// 严格约定：本文件及其数据不得包含任何价格信息。价格只存在于受密码保护的 content/knowledge.json。
//
// 采用静态 import（构建期内联）而非运行时 fs 读取：
// Vercel serverless 文件系统只读，fs 方案有文件丢失风险（且会静默返回空）。
// 代价是改动后需要重新部署 —— 这与 knowledge.json、site.ts 的既有约定保持一致。
import raw from "../../content/products.json";
import { locales } from "@/i18n/routing";

export type Locale = (typeof locales)[number];

/** 多语言文本：未翻译的语种在 pick() 时回落英文 */
export type I18n = Partial<Record<Locale, string>>;
/** 多语言列表 */
export type I18nList = Partial<Record<Locale, string[]>>;

/** 规格行：value / unit 是数字与国际单位时天然跨语言；若是颜色、粘性等级等
 *  由单词组成的选项值，需额外提供 valueI18n 供各语种展示（缺失时回落 value）。 */
export interface SpecRow {
  id: string;
  label: I18n;
  value: string;
  valueI18n?: I18n;
  unit?: string;
}

export interface ProductModel {
  id: string;
  code?: string;
  enabled?: boolean;
  order?: number;
  name: I18n;
  tagline?: I18n;
  highlights?: I18nList;
  structure?: I18nList;
  specs?: SpecRow[];
  applications?: I18nList;
  image?: string;
}

export interface ProductSeries {
  id: string;
  code?: string;
  order?: number;
  enabled?: boolean;
  name: I18n;
  intro?: I18n;
  /** SEO 导语：系列级关键词文案（PE 提铝型材/五金面板，PET 提电子制程），产品页系列区块展示 */
  seoIntro?: I18n;
  cover?: string;
  models: ProductModel[];
}

export interface ProductsFile {
  version?: number;
  updatedAt?: string;
  series: ProductSeries[];
}

export const productsFile = raw as ProductsFile;
export const productSeries: ProductSeries[] = (raw as ProductsFile).series ?? [];

/** 取多语言文本：目标语种缺失时依次回落 en → zh，绝不返回 undefined */
export function pickI18n(v: I18n | undefined, locale: Locale): string {
  if (!v) return "";
  return (v[locale] || v.en || v.zh || "").trim();
}

export function pickI18nList(v: I18nList | undefined, locale: Locale): string[] {
  if (!v) return [];
  const primary = v[locale];
  if (primary && primary.length) return primary;
  const en = v.en;
  if (en && en.length) return en;
  return v.zh ?? [];
}

// ---------- 已本地化的视图结构：组件层直接用，不必自己调 pick ----------

export interface LocalizedSpecRow {
  id: string;
  label: string;
  value: string;
  unit?: string;
}

export interface LocalizedModel {
  id: string;
  code?: string;
  name: string;
  tagline: string;
  highlights: string[];
  structure: string[];
  specs: LocalizedSpecRow[];
  applications: string[];
  image: string;
}

export interface LocalizedSeries {
  id: string;
  code?: string;
  name: string;
  intro: string;
  seoIntro: string;
  cover: string;
  count: number;
  models: LocalizedModel[];
}

function normalizeLocale(locale: string): Locale {
  return (locales as readonly string[]).includes(locale) ? (locale as Locale) : "en";
}

function localizeModel(m: ProductModel, locale: Locale, seriesCover: string): LocalizedModel {
  return {
    id: m.id,
    code: m.code,
    name: pickI18n(m.name, locale),
    tagline: pickI18n(m.tagline, locale),
    highlights: pickI18nList(m.highlights, locale),
    structure: pickI18nList(m.structure, locale),
    specs: (m.specs ?? []).map((r) => ({
      id: r.id,
      label: pickI18n(r.label, locale),
      value: (r.valueI18n && pickI18n(r.valueI18n, locale)) || r.value,
      unit: r.unit,
    })),
    applications: pickI18nList(m.applications, locale),
    image: m.image || seriesCover,
  };
}

/** 按语言返回全部启用的系列 + 型号（系列内按 order 排序） */
export function getProductSeries(locale = "en"): LocalizedSeries[] {
  const loc = normalizeLocale(locale);
  return productSeries
    .filter((s) => s.enabled !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s) => {
      const cover = s.cover || "/images/logo-blue.png";
      const models = s.models
        .filter((m) => m.enabled !== false)
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((m) => localizeModel(m, loc, cover));
      return {
        id: s.id,
        code: s.code,
        name: pickI18n(s.name, loc),
        intro: pickI18n(s.intro, loc),
        seoIntro: pickI18n(s.seoIntro, loc),
        cover,
        count: models.length,
        models,
      };
    });
}

/** 启用的型号总数（首页数据指标用） */
export function getModelCount(): number {
  return getProductSeries().reduce((n, s) => n + s.count, 0);
}

/** 按 id 查找型号，返回 [所属系列, 已本地化的型号] */
export function findModel(id: string, locale = "en"): { series: LocalizedSeries; model: LocalizedModel } | undefined {
  const loc = normalizeLocale(locale);
  for (const s of getProductSeries(loc)) {
    const m = s.models.find((x) => x.id === id);
    if (m) return { series: s, model: m };
  }
  return undefined;
}

// ---------- 后台保存前的结构校验 ----------

const isStr = (x: unknown): x is string => typeof x === "string";
const isStrList = (x: unknown) => x === undefined || (Array.isArray(x) && x.every(isStr));

/**
 * 校验产品目录数据。返回错误描述，合法返回 null。
 * 除了结构校验，还显式拦截价格类字段名 —— products.json 面向公开页面，
 * 就算后台被塞进价格也必须先拦下来（AI 知识库才是价格唯一来源，且受密码保护）。
 */
export function validateProducts(data: unknown): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "数据结构无效：应为 JSON 对象。";

  const BANNED = ["price", "cost", "moq", "yuan", "rmb", "usd", "cny", "eur", "单价", "价格", "报价", "quotation"];
  const seen = new Set<string>();
  const walkKeys = (node: unknown, path: string): string | null => {
    if (Array.isArray(node)) {
      for (const [i, x] of node.entries()) {
        const e = walkKeys(x, `${path}[${i}]`);
        if (e) return e;
      }
      return null;
    }
    if (!node || typeof node !== "object") return null;
    for (const [k, v] of Object.entries(node)) {
      const lower = k.toLowerCase();
      seen.add(lower);
      if (BANNED.some((b) => lower.includes(b))) {
        return `不允许在 ${path} 中出现价格类字段 "${k}"：产品目录是公开数据，价格只能维护在 AI 知识库中。`;
      }
      const e = walkKeys(v, `${path}.${k}`);
      if (e) return e;
    }
    return null;
  };
  const bannedErr = walkKeys(data, "");
  if (bannedErr) return bannedErr;

  const d = data as { series?: unknown };
  if (d.series !== undefined) {
    if (!Array.isArray(d.series)) return "series 应为数组。";
    const seriesIds = new Set<string>();
    const modelIds = new Set<string>();
    for (const [i, s] of d.series.entries()) {
      if (!s || typeof s !== "object") return `series[${i}] 应为对象。`;
      const ser = s as Partial<ProductSeries>;
      if (!isStr(ser.id)) return `series[${i}].id 不能为空且应为字符串。`;
      if (seriesIds.has(ser.id)) return `series[].id 重复：${ser.id}`;
      seriesIds.add(ser.id);

      if (ser.cover !== undefined && !isStr(ser.cover)) return `series[${i}].cover 应为字符串。`;
      if (ser.cover !== undefined && isStr(ser.cover) && !ser.cover.startsWith("/")) {
        return `series[${i}].cover 应以 / 开头（public 目录下的绝对路径）。`;
      }

      for (const [f, label] of [["name", "系列名"]] as const) {
        const v = (ser as Record<string, unknown>)[f];
        if (v === undefined) continue;
        if (!v || typeof v !== "object" || Array.isArray(v)) return `series[${i}].${f}（${label}）应为对象。`;
        for (const [loc, text] of Object.entries(v as Record<string, unknown>)) {
          if (!(locales as readonly string[]).includes(loc)) return `series[${i}].${f} 含未知语种 "${loc}"。`;
          if (!isStr(text)) return `series[${i}].${f}.${loc} 应为字符串。`;
        }
      }

      if (ser.models !== undefined) {
        if (!Array.isArray(ser.models)) return `series[${i}].models 应为数组。`;
        for (const [j, m] of ser.models.entries()) {
          if (!m || typeof m !== "object") return `series[${i}].models[${j}] 应为对象。`;
          const mod = m as Partial<ProductModel>;
          const at = `series[${i}].models[${j}]`;
          if (!isStr(mod.id)) return `${at}.id 不能为空且应为字符串。`;
          if (modelIds.has(mod.id)) return `型号 id 重复：${mod.id}`;
          modelIds.add(mod.id);

          if (mod.image !== undefined && isStr(mod.image) && !mod.image.startsWith("/")) {
            return `${at}.image 应以 / 开头（public 目录下的绝对路径）。`;
          }
          for (const f of ["name", "tagline"] as const) {
            const v = mod[f];
            if (v === undefined) continue;
            if (!v || typeof v !== "object" || Array.isArray(v)) return `${at}.${f} 应为对象。`;
            for (const [loc, text] of Object.entries(v as Record<string, unknown>)) {
              if (!(locales as readonly string[]).includes(loc)) return `${at}.${f} 含未知语种 "${loc}"。`;
              if (!isStr(text)) return `${at}.${f}.${loc} 应为字符串。`;
            }
          }
          for (const f of ["highlights", "structure", "applications"] as const) {
            const v = mod[f];
            if (v === undefined) continue;
            if (!v || typeof v !== "object" || Array.isArray(v)) return `${at}.${f} 应为对象。`;
            for (const [loc, list] of Object.entries(v as Record<string, unknown>)) {
              if (!(locales as readonly string[]).includes(loc)) return `${at}.${f} 含未知语种 "${loc}"。`;
              if (!isStrList(list)) return `${at}.${f}.${loc} 应为字符串数组。`;
            }
          }
          if (mod.specs !== undefined) {
            if (!Array.isArray(mod.specs)) return `${at}.specs 应为数组。`;
            const specIds = new Set<string>();
            for (const [k, r] of mod.specs.entries()) {
              if (!r || typeof r !== "object") return `${at}.specs[${k}] 应为对象。`;
              const row = r as Partial<SpecRow>;
              if (!isStr(row.id)) return `${at}.specs[${k}].id 不能为空且应为字符串。`;
              if (specIds.has(row.id)) return `${at}.specs[].id 重复：${row.id}`;
              specIds.add(row.id);
              if (!isStr(row.value) || !row.value.trim()) return `${at}.specs[${k}].value 不能为空。`;
              if (row.unit !== undefined && !isStr(row.unit)) return `${at}.specs[${k}].unit 应为字符串。`;
              if (row.valueI18n !== undefined) {
                if (!row.valueI18n || typeof row.valueI18n !== "object" || Array.isArray(row.valueI18n)) {
                  return `${at}.specs[${k}].valueI18n 应为对象。`;
                }
                for (const [loc, text] of Object.entries(row.valueI18n as Record<string, unknown>)) {
                  if (!(locales as readonly string[]).includes(loc)) return `${at}.specs[${k}].valueI18n 含未知语种 "${loc}"。`;
                  if (!isStr(text)) return `${at}.specs[${k}].valueI18n.${loc} 应为字符串。`;
                }
              }
              if (row.label !== undefined) {
                if (!row.label || typeof row.label !== "object" || Array.isArray(row.label)) {
                  return `${at}.specs[${k}].label 应为对象。`;
                }
                for (const [loc, text] of Object.entries(row.label as Record<string, unknown>)) {
                  if (!(locales as readonly string[]).includes(loc)) return `${at}.specs[${k}].label 含未知语种 "${loc}"。`;
                  if (!isStr(text)) return `${at}.specs[${k}].label.${loc} 应为字符串。`;
                }
              }
            }
          }
        }
      }
    }
  }
  return null;
}
