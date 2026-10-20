import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/Reveal";
import CtaSection from "@/components/CtaSection";
import { getIndustry, getIndustryIds } from "@/lib/industries";
import { getProductSeries, type Locale, type LocalizedModel } from "@/lib/products";
import { asset } from "@/lib/asset";
import { locales } from "@/i18n/routing";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Wrench } from "lucide-react";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getIndustryIds().map((industry) => ({ locale, industry })),
  );
}

/** 按 GDY 编号从产品目录中解析出已本地化的型号（用于行业页推荐区） */
function resolveModels(codes: string[], locale: Locale): LocalizedModel[] {
  const all = getProductSeries(locale).flatMap((s) => s.models);
  return codes
    .map((c) => all.find((m) => m.code === c))
    .filter((m): m is LocalizedModel => Boolean(m));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; industry: string }>;
}) {
  const { locale, industry } = await params;
  const ind = getIndustry(industry, locale as Locale);
  if (!ind) return {};
  return { title: ind.metaTitle, description: ind.metaDesc };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ locale: string; industry: string }>;
}) {
  const { locale, industry } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const ind = getIndustry(industry, loc);
  if (!ind) notFound();

  const tc = await getTranslations("casesIndustry");
  const recommended = resolveModels(ind.recommendedCodes, loc);

  return (
    <div className="pt-16">
      <div className="container-x pt-8 sm:pt-12">
        {/* 面包屑 */}
        <Reveal>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link href="/cases" className="transition hover:text-brand-2">
              {tc("breadcrumbCases")}
            </Link>
            <span>/</span>
            <span className="font-semibold text-ink">{ind.name}</span>
          </nav>
        </Reveal>

        {/* 头部 */}
        <Reveal>
          <div className="mt-6 max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {ind.headline}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              {ind.intro}
            </p>
          </div>
        </Reveal>

        {/* 痛点 + 选材指南 */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="glass h-full rounded-2xl p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
                <AlertTriangle className="h-5 w-5 text-brand-2" />
                {tc("painPointsTitle")}
              </h2>
              <ul className="mt-4 space-y-3">
                {ind.painPoints.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-ink/85">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-2" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="glass h-full rounded-2xl p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
                <Wrench className="h-5 w-5 text-brand-2" />
                {tc("materialsTitle")}
              </h2>
              <ul className="mt-4 space-y-3">
                {ind.materialsGuide.map((g) => (
                  <li key={g} className="flex gap-2.5 text-sm leading-relaxed text-ink/85">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-2" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* 推荐型号 */}
        {recommended.length > 0 && (
          <Reveal>
            <div className="mt-10">
              <h2 className="text-xl font-bold text-ink">{tc("recommendedTitle")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recommended.map((m) => (
                  <Link
                    key={m.id}
                    href={`/products/${m.code}`}
                    className="glass glass-hover group overflow-hidden rounded-xl"
                  >
                    <div className="h-32 w-full overflow-hidden bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset(m.image)}
                        alt={`${m.code} ${m.name}`}
                        loading="lazy"
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <span className="font-mono text-xs font-bold tracking-wider text-brand-2">
                        {m.code}
                      </span>
                      <div className="mt-1 text-sm font-semibold leading-snug text-ink transition group-hover:text-brand-2">
                        {m.name}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* 返回 + 询盘 */}
        <Reveal>
          <div className="mt-10 flex flex-wrap gap-3 border-t border-ink/10 pt-8">
            <Link href="/cases" className="btn-ghost">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {tc("backToCases")}
            </Link>
            <Link href="/contact" className="btn-primary">
              {tc("inquiryCta")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </Reveal>
      </div>

      <CtaSection />
    </div>
  );
}
