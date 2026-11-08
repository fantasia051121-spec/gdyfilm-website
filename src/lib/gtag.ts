// Google Analytics 4 事件封装（轻量，无第三方依赖）
//
// measurementId 优先级：环境变量 NEXT_PUBLIC_GA_ID > 本文件内置常量。
// 环境变量需要在 Vercel → Settings → Environment Variables 里配置，改动后须重新部署。

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID || "G-HSBX6TENYT";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __gaFirstFired?: boolean;
  }
}

/** 页面浏览（客户端路由切换时手动上报） */
export function pageview(url: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/**
 * 上报自定义事件
 * @param name  事件名（GA4 推荐的小写下划线命名）
 * @param params 附带参数，如 { page_path, method }
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params || {});
}

/** 询盘转化事件：表单提交 / WhatsApp / 电话 / 邮件，统一走这里便于在 GA4 里看来源分渠道。 */
export function trackLead(method: string, extra?: Record<string, unknown>) {
  trackEvent("generate_lead", { method, ...(extra || {}) });
}
