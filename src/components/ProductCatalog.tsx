import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "./ui/Reveal";
import ModelCard from "./ModelCard";
import { getProductSeries } from "@/lib/products";
import { ArrowDown } from "lucide-react";

/**
 * 完整产品目录：系列锚点导航 + 每个系列的型号网格。
 * 锚点用 series.id（而非序号），系列增删改序不会导致跳转错位。
 */
export default async function ProductCatalog({ locale = "en" }: { locale?: string }) {
  const t = await getTranslations("products");
  const series = getProductSeries(locale);
  const labels = {
    specs: t("specs"),
    structure: t("structure"),
    applications: t("applications"),
    requestSample: t("requestSample"),
    viewDetails: t("viewDetails"),
  };

  return (
    <>
      {/* 系列锚点导航 */}
      <nav className="sticky top-16 z-30 -mx-4 mb-8 border-b border-ink/5 bg-white/85 px-4 py-3 backdrop-blur">
        <div className="container-x">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm">
            <ArrowDown className="hidden h-4 w-4 shrink-0 text-brand-2 sm:block" />
            <span className="hidden shrink-0 font-semibold text-muted sm:inline">
              {t("jumpTo")}:
            </span>
            {series.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 whitespace-nowrap rounded-full border border-ink/10 px-3.5 py-1.5 font-medium text-ink/75 transition hover:border-brand-2 hover:text-brand-2"
              >
                {s.name}
                <span className="ms-1.5 text-xs text-muted">{s.count}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {series.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-36 py-10 sm:py-14">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-5">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  {s.code && (
                    <span className="rounded-md bg-brand-2/10 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-brand-2">
                      {s.code}
                    </span>
                  )}
                  <h2 className="text-2xl font-bold text-ink sm:text-3xl">{s.name}</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {s.intro}
                </p>
                {s.seoIntro && (
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70">
                    {s.seoIntro}
                  </p>
                )}
              </div>
              <span className="rounded-full glass px-4 py-2 text-sm font-semibold text-ink/80">
                {s.count} {t("modelsCount")}
              </span>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {s.models.map((m, i) => (
              <ModelCard key={m.id} model={m} index={i} labels={labels} />
            ))}
          </div>

          <div className="mt-6">
            <Link href="/contact" className="btn-ghost">
              {t("seriesInquiry")}
            </Link>
          </div>
        </section>
      ))}
    </>
  );
}
