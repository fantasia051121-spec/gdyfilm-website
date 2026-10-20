import { getTranslations } from "next-intl/server";
import ServiceCard from "./ServiceCard";
import Reveal from "./ui/Reveal";
import { BadgeCheck } from "lucide-react";

export default async function AdvantagesSection() {
  const t = await getTranslations("advantages");
  const items = t.raw("items") as { title: string; desc: string }[];
  const certs = t.raw("certs") as string[];

  return (
    <section className="border-y border-ink/5 bg-ink-2 py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-muted">{t("subtitle")}</p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <ServiceCard key={i} title={it.title} desc={it.desc} delay={i * 0.05} />
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-14 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-2">
              {t("certsTitle")}
            </h3>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {certs.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm font-medium text-ink/85"
                >
                  <BadgeCheck className="h-4 w-4 text-brand-2" />
                  {c}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
