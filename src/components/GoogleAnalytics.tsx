"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GA_MEASUREMENT_ID, pageview, trackLead } from "@/lib/gtag";

/**
 * GA4 数据采集：加载 gtag.js + 客户端路由切换上报 pageview。
 * 另加一层全局点击委托，自动统计站任意位置的 WhatsApp / 邮箱 / 电话点击。
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // 首次加载由 gtag.js 自身的 send_page_view 上报，这里跳过，避免重复计数
    const isFirst = !window.__gaFirstFired;
    window.__gaFirstFired = true;
    const url = pathname + (window.location.search || "");
    if (isFirst) {
      window.__gaFirstFired = true;
      return;
    }
    const timer = window.setTimeout(() => pageview(url), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // 全局监听：外部沟通渠道的点击 = 询盘意向
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("a,button");
      if (!el) return;
      const href = el.getAttribute("href") || "";
      let method = "";
      if (/wa\.me|whatsapp/i.test(href)) method = "whatsapp";
      else if (href.startsWith("mailto:")) method = "email";
      else if (href.startsWith("tel:")) method = "phone";
      if (!method) return;
      trackLead(method, { page_path: window.location.pathname });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });`}
      </Script>
    </>
  );
}
