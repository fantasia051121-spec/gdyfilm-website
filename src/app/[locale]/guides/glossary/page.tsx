import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/JsonLd";
import CtaSection from "@/components/CtaSection";
import { glossaryContent, guideFor } from "@/data/guides";
import { pageAlternates, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const g = locale === "zh" ? glossaryContent.zh : glossaryContent.en;
  return {
    title: g.title,
    description: g.subtitle + " " + g.intro,
    alternates: pageAlternates(locale, "/guides/glossary"),
  };
}

export default async function GlossaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const g = guideFor(locale).glossary;
  const path = `/${locale}/guides/glossary`;

  return (
    <div className="pt-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "GDY", url: `${SITE_URL}/${locale}` },
          { name: g.title, url: `${SITE_URL}${path}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: g.title,
          description: g.intro,
          hasDefinedTerm: g.groups.flatMap((grp) =>
            grp.terms.map((x) => ({
              "@type": "DefinedTerm",
              name: x.term,
              description: x.definition,
            }))
          ),
        }}
      />

      <section className="py-12 sm:py-16">
        <div className="container-x max-w-5xl">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-2">
              GDY Knowledge Hub
            </span>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {g.title}
            </h1>
            <p className="mt-4 text-lg text-ink/85">{g.subtitle}</p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{g.intro}</p>
          </Reveal>

          <div className="mt-10 space-y-10">
            {g.groups.map((grp, gi) => (
              <Reveal key={grp.group} delay={Math.min(gi * 0.05, 0.2)}>
                <section>
                  <h2 className="text-xl font-bold text-ink">{grp.group}</h2>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    {grp.terms.map((x) => (
                      <div key={x.term} className="rounded-2xl border border-ink/10 bg-white/70 p-5">
                        <dt className="text-sm font-semibold text-brand-2">{x.term}</dt>
                        <dd className="mt-2 text-sm leading-relaxed text-muted">{x.definition}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </Reveal>
            ))}
          </div>

          <Link
            href="/guides/compare-pet-vs-pe"
            className="mt-12 inline-block text-sm font-semibold text-brand-2 hover:opacity-80"
          >
            {locale === "zh" ? "← 返回 PET vs PE 选型对比" : "← Back to PET vs PE comparison"}
          </Link>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}
