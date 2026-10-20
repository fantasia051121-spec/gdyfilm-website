import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getAllNews,
  formatNewsDate,
  getNewsBySlug,
  getNewsSlugs,
  localized,
} from "@/lib/news";
import type { Locale } from "@/i18n/routing";
import Reveal from "@/components/ui/Reveal";
import NewsCard from "@/components/NewsCard";
import SocialLinks from "@/components/SocialLinks";
import { asset } from "@/lib/asset";
import { ArrowLeft, CalendarDays, ExternalLink } from "lucide-react";

export const dynamicParams = false;

export function generateStaticParams() {
  const locales = ["en", "zh", "vi", "th", "id", "ms", "ar"] as const;
  return locales.flatMap((locale) =>
    getNewsSlugs().map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getNewsBySlug(slug);
  if (!post) return {};
  const loc = locale as Locale;
  return {
    title: localized(post.title, loc),
    description: localized(post.excerpt, loc),
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const post = getNewsBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations("news");
  const title = localized(post.title, loc);
  const excerpt = localized(post.excerpt, loc);
  const body = localized(post.body, loc);
  const isCompany = post.category === "company";
  const catLabel = isCompany ? t("categoryCompany") : t("categoryIndustry");
  const dateStr = formatNewsDate(post.date, loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const related = getAllNews()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="pt-16">
      <article className="py-12 sm:py-16">
        <div className="container-x max-w-3xl">
          <Reveal>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:gap-3"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("back")}
            </Link>
          </Reveal>

          <Reveal className="mt-5">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  isCompany
                    ? "bg-brand/10 text-brand"
                    : "bg-brand-2/15 text-brand-3"
                }`}
              >
                {catLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                <CalendarDays className="h-4 w-4" />
                {t("publishedOn")} {dateStr}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-lg text-muted">{excerpt}</p>
          </Reveal>
        </div>

        <Reveal className="container-x max-w-4xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(post.cover ?? "/images/hero-factory.jpg")}
            alt={title}
            className="mt-6 w-full rounded-2xl object-cover shadow-lg"
          />
        </Reveal>

        <div className="container-x max-w-3xl">
          <div className="mt-8 space-y-5 text-[1.05rem] leading-relaxed text-ink/90">
            {body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {post.source && (
            <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm text-muted">
              <span>{t("source")}:</span>
              <a
                href={post.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
              >
                {post.source.label}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {/* 关注我们 / 社媒 */}
          <div className="mt-10 rounded-2xl glass p-6">
            <h2 className="text-lg font-semibold text-ink">
              {t("shareTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted">{t("shareDesc")}</p>
            <div className="mt-4">
              <SocialLinks />
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-ink/10 py-14">
          <div className="container-x">
            <h2 className="mb-8 text-2xl font-bold text-ink">
              {t("relatedTitle")}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <NewsCard key={p.slug} post={p} locale={loc} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
