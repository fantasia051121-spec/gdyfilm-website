import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  // 阻止上游网关/CDN 长期缓存（SSG 默认下发 s-maxage=31536000，会把旧构建按
  // URL 路径冻存一年）。改为 no-store，每次回源取最新。
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export const config = {
  // 匹配所有路径，排除 api/_next/静态文件
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
