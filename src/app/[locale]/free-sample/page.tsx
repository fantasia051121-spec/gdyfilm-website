import { setRequestLocale, getTranslations } from "next-intl/server";
import { site } from "@/lib/site";
import { pageAlternates } from "@/lib/seo";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/ContactForm";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { Check, PackageCheck, Truck, ShieldCheck, MessageCircle } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "freeSample" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: pageAlternates(locale, "/free-sample"),
  };
}

const icons = [PackageCheck, ShieldCheck, Truck, Check];

export default async function FreeSamplePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ model?: string }>;
}) {
  const { locale } = await params;
  const { model } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("freeSample");
  const bullets = t.raw("bullets") as string[];
  const defaultMessage = model
    ? `Free sample request for model ${model}. Application / substrate / monthly volume: `
    : "";

  return (
    <div className="pt-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "GDY", url: `${SITE_URL}/${locale}` },
          { name: t("title"), url: `${SITE_URL}/${locale}/free-sample` },
        ])}
      />
      <section className="py-12 sm:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <div>
              <span className="inline-block rounded-full bg-brand/15 px-4 py-1.5 text-xs font-semibold text-brand-2">
                {t("badge")}
              </span>
              <h1 className="mt-5 text-3xl font-bold leading-tight text-ink sm:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                {t("subtitle")}
              </p>

              <ul className="mt-8 space-y-4">
                {bullets.map((b, i) => {
                  const Icon = icons[i % icons.length];
                  return (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed text-ink/85">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-2" />
                      <span>{b}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 rounded-2xl border border-brand/20 bg-brand/5 p-5">
                <p className="text-sm font-semibold text-ink">{t("trust")}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{t("note")}</p>
              </div>

              <a
                href={site.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-2 transition hover:opacity-80"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp · 9:00–18:00 (GMT+8)
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-lg backdrop-blur sm:p-8">
              <h2 className="mb-5 text-xl font-bold text-ink">{t("formTitle")}</h2>
              <ContactForm
                source="free_sample"
                defaultMessage={defaultMessage}
                hint={t("formHint")}
                submitLabel={t("title")}
              />
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
