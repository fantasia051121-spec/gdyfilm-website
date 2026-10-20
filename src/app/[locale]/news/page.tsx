import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAllNews } from "@/lib/news";
import type { Locale } from "@/i18n/routing";
import Reveal from "@/components/ui/Reveal";
import NewsCard from "@/components/NewsCard";
import { Newspaper } from "lucide-react";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const all = getAllNews();
  const [featured, ...rest] = all;

  return (
    <div className="pt-16">
      <section className="py-14 sm:py-20">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                <Newspaper className="h-4 w-4" />
                {t("latest")}
              </span>
              <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-3 text-muted">{t("subtitle")}</p>
            </div>
          </Reveal>

          {featured && (
            <Reveal className="mt-10">
              <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand">
                {t("featured")}
              </div>
              <NewsCard
                post={featured}
                locale={locale as Locale}
                featured
              />
            </Reveal>
          )}

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={Math.min(i * 0.06, 0.3)}>
                <NewsCard post={post} locale={locale as Locale} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
