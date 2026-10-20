import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { asset } from "@/lib/asset";
import { ArrowRight } from "lucide-react";

export default function Hero({ modelCount }: { modelCount?: number }) {
  const t = useTranslations("hero");
  const stats = [
    { value: "20+", label: t("stats.years") },
    { value: "16,000+", label: t("stats.factory") },
    { value: modelCount ? `${modelCount}` : "30+", label: t("stats.models") },
    { value: "40+", label: t("stats.countries") },
  ];

  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-36">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${asset("/images/hero-factory.jpg")})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/65 to-white/90" />
      <div className="absolute inset-0 hero-grid opacity-60" />
      <div className="pointer-events-none absolute -top-24 start-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-brand/30 blur-[120px]" />
      <div className="pointer-events-none absolute end-10 top-10 h-72 w-72 rounded-full bg-brand-2/20 blur-[100px]" />

      <div className="container-x relative">
        <span className="anim-fade-up inline-block rounded-full glass px-4 py-1.5 text-xs font-medium text-ink/80">
          {t("badge")}
        </span>

        <h1
          className="anim-fade-up mt-6 max-w-4xl text-4xl font-bold leading-tight text-ink sm:text-6xl"
          style={{ animationDelay: "0.05s" }}
        >
          {t("title")}{" "}
          <span className="gradient-text">{t("titleHighlight")}</span>
        </h1>

        <div
          className="anim-fade-up mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-brand-2 to-brand-3 sm:w-32"
          style={{ animationDelay: "0.08s" }}
        />

        <p
          className="anim-fade-up mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
          style={{ animationDelay: "0.12s" }}
        >
          {t("subtitle")}
        </p>

        <div
          className="anim-fade-up mt-8 flex flex-wrap gap-4"
          style={{ animationDelay: "0.18s" }}
        >
          <Link href="/contact" className="btn-primary">
            {t("ctaPrimary")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/services" className="btn-ghost">
            {t("ctaSecondary")}
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="text-2xl font-bold text-ink sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
