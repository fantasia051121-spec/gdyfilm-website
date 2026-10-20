// 统一拼接 basePath：所有指向 /public 静态资源的路径，在交给 <img>/backgroundImage
// 渲染前都必须经过本函数。否则在 basePath="/gdy" 下会被解析成 /images/... 而 404，
// 正确路径应为 /gdy/images/...。
//
// 取值与 next.config.ts 的 basePath 必须保持一致；正式去 /gdy 时两者同时置空即可。
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 给 /public 静态资源路径补上 basePath 前缀（已带前缀或绝对 URL 则原样返回）。 */
export function asset(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith("//")) return path;
  if (BASE_PATH && path.startsWith(BASE_PATH)) return path;
  return `${BASE_PATH}${path.startsWith("/") ? "" : "/"}${path}`;
}
