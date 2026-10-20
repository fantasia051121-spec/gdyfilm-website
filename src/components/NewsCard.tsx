import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatNewsDate, localized, type NewsPost } from "@/lib/news";
import type { Locale } from "@/i18n/routing";
import { asset } from "@/lib/asset";
import { CalendarDays, ArrowRight } from "lucide-react";

export default async function NewsCard({
  post,
  locale,
  featured = false,
}: {
  post: NewsPost;
  locale: Locale;
  featured?: boolean;
}) {
  const t = await getTranslations("news");
  const title = localized(post.title, locale);
  const excerpt = localized(post.excerpt, locale);
  const isCompany = post.category === "company";
  const catLabel = isCompany ? t("categoryCompany") : t("categoryIndustry");
  const dateStr = formatNewsDate(post.date, locale);
  const href = `/news/${post.slug}`;

  const badge = (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isCompany
          ? "bg-brand/10 text-brand"
          : "bg-brand-2/15 text-brand-3"
      }`}
    >
      {catLabel}
    </span>
  );

  if (featured) {
    return (
      <Link href={href} className="group block">
        <article className="glass glass-hover overflow-hidden rounded-2xl">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative aspect-[16/10] md:aspect-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(post.cover ?? "/images/hero-factory.jpg")}
                alt={title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                {badge}
                <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                  <CalendarDays className="h-4 w-4" />
                  {dateStr}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-ink sm:text-3xl">
                {title}
              </h3>
              <p className="text-muted">{excerpt}</p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                {t("readMore")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block h-full">
      <article className="glass glass-hover flex h-full flex-col overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(post.cover ?? "/images/hero-factory.jpg")}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute left-3 top-3">{badge}</div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <CalendarDays className="h-4 w-4" />
            {dateStr}
          </span>
          <h3 className="text-lg font-semibold text-ink transition group-hover:text-brand">
            {title}
          </h3>
          <p className="line-clamp-3 text-sm text-muted">{excerpt}</p>
          <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand">
            {t("readMore")}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" />
          </span>
        </div>
      </article>
    </Link>
  );
}
