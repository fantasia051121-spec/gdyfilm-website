// 公司知识库（产品简介 + 价格表）——仅供服务端使用。
// 首行 server-only：一旦被客户端组件误引用，构建直接报错，从机制上杜绝价格泄漏到浏览器包。
import "server-only";

import raw from "../../content/knowledge.json";
import { locales } from "@/i18n/routing";

export type Locale = (typeof locales)[number];

/** 中英双语文本 */
export type Bi = { en?: string; zh?: string };
/** 中英双语列表 */
export type BiList = { en?: string[]; zh?: string[] };

export const PRICE_UNITS = ["m2", "roll", "kg", "piece"] as const;
export type PriceUnit = (typeof PRICE_UNITS)[number];
export const CURRENCIES = ["USD", "CNY", "EUR"] as const;

/** 单位在提示词里的展示形式 */
const UNIT_LABEL: Record<string, string> = {
  m2: "m²",
  roll: "roll",
  kg: "kg",
  piece: "piece",
};

export interface PriceRow {
  id: string;
  enabled?: boolean;
  spec?: Bi;
  unit?: PriceUnit | string;
  currency?: string;
  min?: number;
  max?: number;
  moq?: number;
  moqUnit?: string;
  note?: Bi;
}

export interface Product {
  id: string;
  enabled?: boolean;
  name?: Bi;
  summary?: Bi;
  specs?: BiList;
  applications?: BiList;
  pricing?: PriceRow[];
}

export interface Knowledge {
  version?: number;
  updatedAt?: string;
  company?: BiList;
  products?: Product[];
  policies?: { en?: Record<string, string>; zh?: Record<string, string> };
  customCapabilities?: BiList;
}

export const knowledge = raw as Knowledge;

/** 取双语文本：中文界面取中文，其余一律取英文（EN→小语种的翻译质量优于 ZH→小语种） */
function pick(bi: Bi | undefined, locale: Locale): string {
  if (!bi) return "";
  const zh = (bi.zh || "").trim();
  const en = (bi.en || "").trim();
  if (locale === "zh") return zh || en;
  return en || zh;
}

function pickList(bl: BiList | undefined, locale: Locale): string[] {
  if (!bl) return [];
  const en = (bl.en || []).filter((s) => typeof s === "string" && s.trim());
  const zh = (bl.zh || []).filter((s) => typeof s === "string" && s.trim());
  if (locale === "zh") return zh.length ? zh : en;
  return en.length ? en : zh;
}

/**
 * 把知识库渲染成给大模型的提示词文本。
 * 价格只输出「区间」：CURRENCY min–max / unit，天然满足"不报精确单价"。
 */
export function renderKnowledge(locale: Locale): string {
  const k = knowledge;
  const out: string[] = [];

  const company = pickList(k.company, locale);
  if (company.length) {
    out.push("# Company facts");
    out.push(company.map((x) => `- ${x}`).join("\n"));
  }

  const products = (k.products || []).filter((p) => p.enabled !== false);
  if (products.length) {
    out.push("\n# Products and reference price ranges");
    for (const p of products) {
      const name = pick(p.name, locale) || p.id;
      out.push(`\n## ${name}`);
      const summary = pick(p.summary, locale);
      if (summary) out.push(`- Summary: ${summary}`);
      const specs = pickList(p.specs, locale);
      if (specs.length) out.push(`- Specs: ${specs.join("; ")}`);
      const apps = pickList(p.applications, locale);
      if (apps.length) out.push(`- Applications: ${apps.join(", ")}`);

      const rows = (p.pricing || []).filter((r) => r.enabled !== false);
      if (rows.length) {
        out.push("- Reference price ranges:");
        for (const r of rows) {
          const cur = r.currency || "USD";
          const unit = UNIT_LABEL[r.unit || "m2"] || r.unit || "m²";
          const range = `${cur} ${r.min}–${r.max} / ${unit}`;
          const moq = typeof r.moq === "number" ? `; MOQ ${r.moq} ${UNIT_LABEL[r.moqUnit || ""] || r.moqUnit || unit}` : "";
          const note = pick(r.note, locale);
          out.push(`  - ${pick(r.spec, locale) || "standard"}: ${range}${moq}${note ? ` (${note})` : ""}`);
        }
      } else {
        out.push("- Reference price ranges: not published. If asked about price, say the exact price depends on specification, quantity and trade terms, and hand off to a human sales representative.");
      }
    }
  }

  const pol = locale === "zh" ? k.policies?.zh : k.policies?.en;
  const polFallback = locale === "zh" ? k.policies?.en : k.policies?.zh;
  const policyEntries = Object.entries(pol || polFallback || {}).filter(([, v]) => (v || "").trim());
  if (policyEntries.length) {
    out.push("\n# Commercial policies");
    for (const [key, value] of policyEntries) out.push(`- ${key}: ${value}`);
  }

  const caps = pickList(k.customCapabilities, locale);
  if (caps.length) {
    out.push("\n# Customization capability");
    out.push(caps.map((x) => `- ${x}`).join("\n"));
  }

  return out.filter(Boolean).join("\n");
}

/**
 * 后台保存前的结构校验——脏数据会直接把 AI 提示词搞崩，必须拦在写入之前。
 * 返回错误描述，合法则返回 null。
 */
export function validateKnowledge(data: unknown): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "数据结构无效：应为 JSON 对象。";
  }
  const d = data as Partial<Knowledge>;

  const checkBi = (v: unknown, label: string, required: boolean): string | null => {
    if (v === undefined || v === null) return required ? `${label} 不能为空。` : null;
    if (typeof v !== "object" || Array.isArray(v)) return `${label} 应为对象。`;
    const b = v as Bi;
    if (b.en !== undefined && typeof b.en !== "string") return `${label}.en 应为字符串。`;
    if (b.zh !== undefined && typeof b.zh !== "string") return `${label}.zh 应为字符串。`;
    return null;
  };
  const checkBiList = (v: unknown, label: string): string | null => {
    if (v === undefined || v === null) return null;
    if (typeof v !== "object" || Array.isArray(v)) return `${label} 应为对象。`;
    const b = v as BiList;
    for (const key of ["en", "zh"] as const) {
      const arr = b[key];
      if (arr === undefined) continue;
      if (!Array.isArray(arr)) return `${label}.${key} 应为数组。`;
      if (arr.some((x) => typeof x !== "string")) return `${label}.${key} 应全部为字符串。`;
    }
    return null;
  };

  let err = checkBiList(d.company, "company");
  if (err) return err;
  err = checkBiList(d.customCapabilities, "customCapabilities");
  if (err) return err;

  if (d.policies !== undefined) {
    if (typeof d.policies !== "object" || Array.isArray(d.policies)) return "policies 应为对象。";
    for (const key of ["en", "zh"] as const) {
      const p = d.policies?.[key];
      if (p === undefined) continue;
      if (typeof p !== "object" || Array.isArray(p)) return `policies.${key} 应为对象。`;
      for (const [k2, v2] of Object.entries(p)) {
        if (v2 !== undefined && typeof v2 !== "string") return `policies.${key}.${k2} 应为字符串。`;
      }
    }
  }

  if (d.products !== undefined) {
    if (!Array.isArray(d.products)) return "products 应为数组。";
    const ids = new Set<string>();
    for (const [i, p] of d.products.entries()) {
      if (!p || typeof p !== "object") return `products[${i}] 应为对象。`;
      if (!p.id || typeof p.id !== "string") return `products[${i}].id 不能为空且应为字符串。`;
      if (ids.has(p.id)) return `products[].id 重复：${p.id}`;
      ids.add(p.id);

      const e1 = checkBi(p.name, `products[${i}].name`, false);
      if (e1) return e1;
      const e2 = checkBi(p.summary, `products[${i}].summary`, false);
      if (e2) return e2;
      const e3 = checkBiList(p.specs, `products[${i}].specs`);
      if (e3) return e3;
      const e4 = checkBiList(p.applications, `products[${i}].applications`);
      if (e4) return e4;

      if (p.pricing !== undefined) {
        if (!Array.isArray(p.pricing)) return `products[${i}].pricing 应为数组。`;
        const rowIds = new Set<string>();
        for (const [j, r] of p.pricing.entries()) {
          if (!r || typeof r !== "object") return `products[${i}].pricing[${j}] 应为对象。`;
          if (rowIds.has(r.id)) return `products[${i}].pricing[].id 重复：${r.id}`;
          rowIds.add(r.id);
          const e5 = checkBi(r.spec, `products[${i}].pricing[${j}].spec`, false);
          if (e5) return e5;
          const e6 = checkBi(r.note, `products[${i}].pricing[${j}].note`, false);
          if (e6) return e6;

          if (r.unit !== undefined && !(PRICE_UNITS as readonly string[]).includes(r.unit)) {
            return `products[${i}].pricing[${j}].unit 只能是 ${PRICE_UNITS.join(" / ")}。`;
          }
          if (r.currency !== undefined && !(CURRENCIES as readonly string[]).includes(r.currency)) {
            return `products[${i}].pricing[${j}].currency 只能是 ${CURRENCIES.join(" / ")}。`;
          }
          if (r.min !== undefined && typeof r.min !== "number") return `products[${i}].pricing[${j}].min 应为数字。`;
          if (r.max !== undefined && typeof r.max !== "number") return `products[${i}].pricing[${j}].max 应为数字。`;
          if (typeof r.min === "number" && typeof r.max === "number" && r.min > r.max) {
            return `products[${i}].pricing[${j}] 的最低价不能高于最高价。`;
          }
          if (r.moq !== undefined && typeof r.moq !== "number") return `products[${i}].pricing[${j}].moq 应为数字。`;
        }
      }
    }
  }

  return null;
}
