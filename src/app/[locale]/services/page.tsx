import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import ProductCatalog from "@/components/ProductCatalog";
import CtaSection from "@/components/CtaSection";
import { getModelCount } from "@/lib/products";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");

  return (
    <div className="pt-16">
      <div className="container-x pb-4 pt-12 sm:pt-16">
        <h1 className="text-3xl font-bold text-ink sm:text-5xl">{t("pageTitle")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
          {t("pageSubtitle")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full glass px-4 py-2 font-semibold text-ink/80">
            {getModelCount()} {t("modelsCount")}
          </span>
          <span className="rounded-full glass px-4 py-2 text-ink/70">{t("note")}</span>
        </div>
      </div>

      <div className="container-x">
        <ProductCatalog locale={locale as Locale} />
      </div>

      <CtaSection />
    </div>
  );
}
