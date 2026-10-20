import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// 站点已升级为带服务端的 Next.js（支持 /api/chat 大模型代理）。
// 部署目标：Vercel（密钥放环境变量，前端永不接触 API key）。
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 正式上线已绑定独立域名（gdyfilm.com），不再需要 basePath 前缀。
  // 说明：开发阶段曾用 basePath="/gdy" 绕过公网网关的路径级长缓存；
  // 自有域名下不存在该问题，故置空，前台路径为干净的 /zh、/en 等。

  // content/ 下的文件有一部分是在运行时用 fs 读取的（FAQ、后台接口）。
  // 默认 file tracing 不会把它们打进 serverless 包，会导致线上读不到（且 getFaq 会静默返回空）。
  // 这里显式兜住，保证知识库与 FAQ 在 Vercel 上可用。
  outputFileTracingIncludes: {
    "/api/chat": ["./content/**"],
    "/api/content": ["./content/**"],
    "/[locale]/faq": ["./content/**"],
  },
};

export default withNextIntl(nextConfig);
