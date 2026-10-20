import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllNews } from "@/lib/news";
import type { Locale } from "@/i18n/routing";
import Reveal from "@/components/ui/Reveal";
import NewsCard from "@/components/NewsCard";
import { ArrowRight } from "lucide-react";

export default async function NewsTeaser({
  locale,
}: {
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "news" });
  const posts = getAllNews().slice(0, 3);

  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-ink sm:text-4xl">
                {t("homeTitle")}
              </h2>
              <p className="mt-3 text-muted">{t("homeSubtitle")}</p>
            </div>
            <Link href="/news" className="btn-ghost">
              {t("viewAll")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={Math.min(i * 0.06, 0.2)}>
              <NewsCard post={post} locale={locale} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
