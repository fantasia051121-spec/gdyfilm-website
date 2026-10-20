import Reveal from "./ui/Reveal";
import { industryImages } from "@/lib/site";
import { asset } from "@/lib/asset";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export default function CaseCard({
  title,
  desc,
  sector,
  index,
  href,
}: {
  title: string;
  desc: string;
  sector: string;
  index: number;
  href?: string;
}) {
  const img = industryImages[index];
  const more = (
    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-2">
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
    </span>
  );

  const body = !img ? (
    <div className="glass glass-hover group flex h-full flex-col rounded-2xl p-6">
      <span className="mb-3 inline-block w-fit rounded-full bg-ink/10 px-3 py-1 text-xs font-medium text-ink/70">
        {sector}
      </span>
      <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{desc}</p>
      {href && more}
    </div>
  ) : (
    <div className="glass glass-hover group overflow-hidden rounded-2xl">
      <div className="relative h-44 w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(img)}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
        <span className="absolute bottom-3 start-4 rounded-full glass px-3 py-1 text-xs font-medium text-white/90">
          {sector}
        </span>
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-muted">{desc}</p>
        {href && more}
      </div>
    </div>
  );

  return (
    <Reveal delay={index * 0.05}>
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
