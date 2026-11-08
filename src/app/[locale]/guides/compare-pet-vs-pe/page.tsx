import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/JsonLd";
import CtaSection from "@/components/CtaSection";
import { compareContent, guideFor } from "@/data/guides";
import { faqJsonLd, pageAlternates, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = locale === "zh" ? compareContent.zh : compareContent.en;
  return {
    title: c.title,
    description: c.subtitle + " " + c.intro,
    alternates: pageAlternates(locale, "/guides/compare-pet-vs-pe"),
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = guideFor(locale).compare;
  const path = `/${locale}/guides/compare-pet-vs-pe`;

  return (
    <div className="pt-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "GDY", url: `${SITE_URL}/${locale}` },
          { name: c.title, url: `${SITE_URL}${path}` },
        ])}
      />
      <JsonLd data={faqJsonLd(c.faq)} />

      <section className="py-12 sm:py-16">
        <div className="container-x max-w-5xl">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-2">
              GDY Selection Guide
            </span>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {c.title}
            </h1>
            <p className="mt-4 text-lg text-ink/85">{c.subtitle}</p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{c.intro}</p>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-10 overflow-x-auto rounded-2xl border border-ink/10 bg-white/70 shadow-sm">
              <table className="w-full min-w-[720px] border-collapse text-start text-sm">
                <thead>
                  <tr className="border-b border-ink/10 bg-brand/5">
                    {c.headers.map((h, i) => (
                      <th key={h} className={`px-5 py-4 font-semibold ${i === 1 ? "text-brand-2" : "text-ink"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.rows.map((r, i) => (
                    <tr key={i} className="border-b border-ink/5 last:border-0">
                      <td className="px-5 py-4 font-semibold text-ink">{r.dimension}</td>
                      <td className="px-5 py-4 text-ink/85">{r.pet}</td>
                      <td className="px-5 py-4 text-ink/85">{r.pe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-8 rounded-2xl border border-brand/20 bg-brand/5 p-6">
              <h2 className="text-lg font-bold text-ink">{c.verdictTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/85">{c.verdict}</p>
              <Link href="/free-sample" className="btn-primary mt-5 inline-flex">
                {c.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12">
              <h2 className="text-xl font-bold text-ink">
                {locale === "zh" ? "采购最常问的 3 个问题" : "3 questions buyers ask most"}
              </h2>
              <div className="mt-5 space-y-4">
                {c.faq.map((f, i) => (
                  <details key={i} className="rounded-2xl border border-ink/10 bg-white/70 p-5">
                    <summary className="cursor-pointer font-semibold text-ink">{f.q}</summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
                  </details>
                ))}
              </div>
              <Link
                href="/guides/glossary"
                className="mt-6 inline-block text-sm font-semibold text-brand-2 hover:opacity-80"
              >
                {locale === "zh" ? "继续看：保护膜 30 个术语 →" : "Next: 30 protective film terms →"}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}
