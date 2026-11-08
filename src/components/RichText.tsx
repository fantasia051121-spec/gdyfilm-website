import { Fragment, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { asset } from "@/lib/asset";

/**
 * 极简行内 Markdown 渲染：只处理 **加粗**、[文字](链接) 与 ![图注](图片路径)。
 * 正文段落来自 content/news/*.md，不引入额外依赖，避免为几个标记装一个 parser。
 * 内链写相对路径（如 /products/GDY-031），由 next-intl 的 Link 自动补当前语言前缀。
 */
const PATTERN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|!\[[^\]]*\]\([^)\s]+\))/g;

function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
}

export default function RichText({ text }: { text: string }) {
  const parts = text.split(PATTERN).filter((s) => s !== "");

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const inner = part.slice(2, -2);
          return (
            <strong key={i} className="font-semibold text-ink">
              {inner}
            </strong>
          );
        }

        const image = part.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (image) {
          const [, alt, src] = image;
          return (
            <span key={i} className="my-8 block">
              <img
                src={asset(src)}
                alt={alt}
                loading="lazy"
                className="mx-auto w-full max-w-xl rounded-xl border border-ink/10 bg-white object-cover shadow-sm"
              />
              {alt ? (
                <span className="mt-2 block text-center text-sm text-ink/60">
                  {alt}
                </span>
              ) : null}
            </span>
          );
        }

        const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link) {
          const [, label, href] = link;
          if (isExternal(href)) {
            return (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline decoration-accent/35 underline-offset-2 transition hover:decoration-accent"
              >
                {label}
              </a>
            );
          }
          return (
            <Link
              key={i}
              href={href}
              className="text-accent underline decoration-accent/35 underline-offset-2 transition hover:decoration-accent"
            >
              {label}
            </Link>
          );
        }

        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
