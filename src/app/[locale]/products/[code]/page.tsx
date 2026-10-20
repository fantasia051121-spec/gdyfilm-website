import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/Reveal";
import SpecTable from "@/components/SpecTable";
import CtaSection from "@/components/CtaSection";
import {
  getProductSeries,
  pickI18n,
  type Locale,
  type LocalizedModel,
  type LocalizedSeries,
} from "@/lib/products";
import { asset } from "@/lib/asset";
import { locales } from "@/i18n/routing";
import { ArrowLeft, ArrowRight, Check, Layers, Tag } from "lucide-react";

export const dynamicParams = false;

/** 全部型号 × 全部语言：架构一次到位，任何型号都有独立可索引页面 */
export function generateStaticParams() {
  const codes: string[] = [];
  for (const s of getProductSeries("en")) {
    for (const m of s.models) {
      if (m.code) codes.push(m.code);
    }
  }
  return locales.flatMap((locale) => codes.map((code) => ({ locale, code })));
}

function findByCode(
  code: string,
  locale: Locale,
): { series: LocalizedSeries; model: LocalizedModel } | undefined {
  for (const s of getProductSeries(locale)) {
    const m = s.models.find((x) => x.code === code);
    if (m) return { series: s, model: m };
  }
  return undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  const found = findByCode(decodeURIComponent(code), locale as Locale);
  if (!found) return {};
  const { series, model } = found;
  const tagline = model.tagline || model.highlights[0] || "";
  const apps = model.applications.slice(0, 3).join(", ");
  return {
    title: `${model.code} ${model.name} | ${series.name} — Guangdayuan`,
    description: `${model.code} ${model.name}. ${tagline}${apps ? ` ${apps}.` : ""}`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const found = findByCode(decodeURIComponent(code), loc);
  if (!found) notFound();

  const { series, model } = found;
  const t = await getTranslations("products");
  const td = await getTranslations("productDetail");

  // 同系列相关型号（排除自身，最多 4 个，内链互链利于 SEO）
  const related = series.models.filter((m) => m.code !== model.code).slice(0, 4);

  return (
    <div className="pt-16">
      <div className="container-x pt-8 sm:pt-12">
        {/* 面包屑 */}
        <Reveal>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link href="/services" className="transition hover:text-brand-2">
              {td("breadcrumbProducts")}
            </Link>
            <span>/</span>
            <Link
              href={`/services#${series.id}`}
              className="transition hover:text-brand-2"
            >
              {series.name}
            </Link>
            <span>/</span>
            <span className="font-mono font-semibold text-ink">{model.code}</span>
          </nav>
        </Reveal>

        {/* 主区：图 + 核心信息 */}
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="glass overflow-hidden rounded-2xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(model.image)}
                alt={`${model.code} ${model.name}`}
                className="h-72 w-full object-contain sm:h-96"
              />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div>
              <span className="inline-block rounded-md bg-ink/85 px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-white">
                {model.code}
              </span>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-ink sm:text-4xl">
                {model.name}
              </h1>
              {model.tagline && (
                <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
                  {model.tagline}
                </p>
              )}

              {model.highlights.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {model.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-ink/85">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-2" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/contact?model=${encodeURIComponent(model.code || "")}`}
                  className="btn-primary"
                >
                  {td("inquiryNow")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <Link href={`/services#${series.id}`} className="btn-ghost">
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                  {td("backToSeries")}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 规格 + 结构 + 应用 */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {model.specs.length > 0 && (
            <Reveal>
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-ink">{t("specs")}</h2>
                <SpecTable rows={model.specs} />
              </div>
            </Reveal>
          )}
          <div className="space-y-8">
            {model.structure.length > 0 && (
              <Reveal delay={0.05}>
                <div className="glass rounded-2xl p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
                    <Layers className="h-5 w-5 text-brand-2" />
                    {t("structure")}
                  </h2>
                  <ol className="mt-4 space-y-2">
                    {model.structure.map((s, i) => (
                      <li key={s} className="flex gap-2.5 text-sm text-ink/85">
                        <span className="font-mono font-semibold text-brand-2">{i + 1}.</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            )}
            {model.applications.length > 0 && (
              <Reveal delay={0.1}>
                <div className="glass rounded-2xl p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
                    <Tag className="h-5 w-5 text-brand-2" />
                    {t("applications")}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {model.applications.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-ink/5 px-3 py-1.5 text-sm text-ink/80"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>

        {/* 相关型号 */}
        {related.length > 0 && (
          <Reveal>
            <div className="mt-12 border-t border-ink/10 pt-8">
              <h2 className="text-xl font-bold text-ink">{td("relatedModels")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((m) => (
                  <Link
                    key={m.id}
                    href={`/products/${m.code}`}
                    className="glass glass-hover group rounded-xl p-4"
                  >
                    <span className="font-mono text-xs font-bold tracking-wider text-brand-2">
                      {m.code}
                    </span>
                    <div className="mt-1.5 text-sm font-semibold leading-snug text-ink transition group-hover:text-brand-2">
                      {m.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>

      <CtaSection />
    </div>
  );
}
