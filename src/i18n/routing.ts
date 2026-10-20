import { defineRouting } from "next-intl/routing";

export const locales = ["en", "zh", "vi", "th", "id", "ms", "ar"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  vi: "Tiếng Việt",
  th: "ไทย",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  ar: "العربية",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  // always: 所有语言统一带前缀 (/en /vi /th /id /ms /ar)，URL 一致可预测；
  // 静态导出后根路径 "/" 由 public/index.html 自动跳转到 /en/
  localePrefix: "always",
});
