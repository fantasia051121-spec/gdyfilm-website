// 全站 SEO / GEO 基建：站点常量、hreflang、结构化数据
import { locales, type Locale } from "@/i18n/routing";

export const SITE_URL = "https://www.gdyfilm.com";

/** 生成某路径的全部语言版本（用于 sitemap 的 hreflang） */
export function languageAlternates(path: string): Record<string, string> {
  const clean = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  const out: Record<string, string> = {};
  for (const l of locales) out[l] = `${SITE_URL}/${l}${clean}`;
  out["x-default"] = `${SITE_URL}/en${clean}`;
  return out;
}

/** 页面 metadata 的 canonical + hreflang */
export function pageAlternates(locale: string, path: string) {
  const clean = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${SITE_URL}/${l}${clean}`;
  languages["x-default"] = `${SITE_URL}/en${clean}`;
  return {
    canonical: `${SITE_URL}/${locale}${clean}`,
    languages,
  };
}

/** 组织结构化数据（公司实体 + 认证声明，AI 搜索引用依据） */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Shenzhen Guangdayuan Film Co., Ltd.",
    alternateName: ["GDY", "光大远", "Guangdayuan Film"],
    url: SITE_URL,
    foundingDate: "2004",
    description:
      "20-year PET/PE protective film manufacturer in Shenzhen, China. 16,000 m² plant, 3 automatic coating lines, 120 million m² annual capacity, exported to 40+ countries.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Shenzhen",
      addressRegion: "Guangdong",
      addressCountry: "CN",
    },
    knowsAbout: [
      "PET protective film",
      "PE protective film",
      "optical functional film",
      "industrial tape",
      "surface protection",
    ],
    hasCredential: [
      "ISO 9001",
      "ISO 14001",
      "SGS tested",
      "RoHS compliant",
      "REACH compliant",
      "National High-Tech Enterprise",
    ],
  };
}

/** 网站 + 站内搜索结构化数据 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "GDY Film | Protective Film Manufacturer",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: [...locales],
  };
}

/** 面包屑 */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** 产品结构化数据（不含虚构价格/评分，规格如实写入） */
export function productJsonLd(args: {
  locale: string;
  code: string;
  name: string;
  description: string;
  image: string;
  seriesName: string;
  specs: { label: string; value: string }[];
  applications: string[];
}) {
  const url = `${SITE_URL}/${args.locale}/products/${args.code}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: args.name,
    sku: args.code,
    mpn: args.code,
    description: args.description,
    url,
    image: `${SITE_URL}${args.image}`,
    brand: { "@type": "Brand", name: "GDY" },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    category: args.seriesName,
    additionalProperty: args.specs.map((s) => ({
      "@type": "PropertyValue",
      name: s.label,
      value: s.value,
    })),
    ...(args.applications.length
      ? { applicationCategory: args.applications.join(", ") }
      : {}),
    inLanguage: args.locale as Locale,
  };
}

/** FAQ 结构化数据 */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/** 文章结构化数据 */
export function articleJsonLd(args: {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}) {
  const url = `${SITE_URL}/${args.locale}/news/${args.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: args.title,
    description: args.excerpt,
    datePublished: args.date,
    inLanguage: args.locale,
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: url,
  };
}
