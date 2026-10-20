import { getTranslations } from "next-intl/server";
import Reveal from "./ui/Reveal";
import { asset } from "@/lib/asset";

export default async function AboutSection() {
  const t = await getTranslations("about");
  const paragraphs = t.raw("paragraphs") as string[];
  const stats = t.raw("stats") as { value: string; label: string }[];

  return (
    <section className="py-16 sm:py-24">
      <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-2">
              {t("subtitle")}
            </span>
            <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/90">
              {t("lead")}
            </p>
            <div className="mt-6 space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            <div className="glass overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset("/images/facility-line.jpg")}
                alt={t("statsTitle")}
                loading="lazy"
                className="h-56 w-full object-cover sm:h-64"
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="glass rounded-2xl p-4 text-center">
                  <div className="text-lg font-bold text-ink sm:text-xl">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="container-x mt-12 grid gap-6 sm:grid-cols-2">
        <Reveal>
          <div className="glass h-full rounded-2xl p-6">
            <h3 className="mb-2 text-lg font-semibold text-ink">
              {t("missionTitle")}
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              {t("missionText")}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="glass h-full rounded-2xl p-6">
            <h3 className="mb-2 text-lg font-semibold text-ink">
              {t("visionTitle")}
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              {t("visionText")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
