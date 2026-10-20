import Reveal from "./ui/Reveal";
import { Link } from "@/i18n/navigation";
import { asset } from "@/lib/asset";
import { ArrowRight } from "lucide-react";

/**
 * 通用卡片。注意：本组件不通过 index 取任何数据 ——
 * 历史版本曾用 `index` 去配 index→图片的映射表，一旦顺序变动图片就会错位。
 * 这里 `delay` 只用于错开入场动画，数据一律由调用方显式传入。
 */
export default function ServiceCard({
  title,
  desc,
  img,
  delay = 0,
  href,
  badge,
  cta,
}: {
  title: string;
  desc?: string;
  img?: string;
  delay?: number;
  href?: string;
  badge?: string;
  cta?: string;
}) {
  const body = (
    <div className="glass glass-hover group flex h-full flex-col overflow-hidden rounded-2xl">
      {img && (
        <div className="relative h-44 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(img ?? "")}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
          {badge && (
            <span className="absolute end-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
        {desc && <p className="text-sm leading-relaxed text-muted">{desc}</p>}
        {cta && (
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-2">
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Reveal delay={delay}>
      {href ? (
        <Link href={href} className="block h-full">
          {body}
        </Link>
      ) : (
        body
      )}
    </Reveal>
  );
}
