import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Reveal from "@/components/ui/Reveal";
import { getFaq, type Locale } from "@/lib/content";
import CtaSection from "@/components/CtaSection";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const items = getFaq(locale as Locale);

  return (
    <div className="pt-16">
      <section className="py-12 sm:py-16">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1>
              <p className="mt-3 text-muted">{t("subtitle")}</p>
            </div>
          </Reveal>

          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {items.map((it, i) => (
              <Reveal key={i} delay={Math.min(i * 0.05, 0.3)}>
                <details className="group rounded-2xl border border-ink/10 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:border-brand/30">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-ink">
                    <span>{it.q}</span>
                    <span className="text-brand-2 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted">{it.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CtaSection />
    </div>
  );
}
