import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/Reveal";
import CtaSection from "@/components/CtaSection";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  ClipboardCheck,
  Factory,
  FlaskConical,
  Microscope,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quality" });
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default async function QualityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("quality");

  const certs = t.raw("certs") as { name: string; desc: string; note: string }[];
  const equipment = t.raw("equipment") as { name: string; desc: string }[];
  const steps = t.raw("steps") as { title: string; desc: string }[];
  const rdPoints = t.raw("rdPoints") as string[];

  return (
    <div className="pt-16">
      <div className="container-x pt-8 sm:pt-12">
        {/* 头部 */}
        <Reveal>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              {t("subtitle")}
            </p>
          </div>
        </Reveal>

        {/* 认证与资质 */}
        <Reveal>
          <div className="mt-12">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
              <Award className="h-6 w-6 text-brand-2" />
              {t("certsTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {t("certsIntro")}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certs.map((c) => (
                <div key={c.name} className="glass rounded-2xl p-6">
                  {/* 证书图片占位槽：后续在后台/代码中替换为真实证书图 */}
                  <div className="flex h-36 items-center justify-center rounded-xl border-2 border-dashed border-ink/15 bg-ink/[0.03] text-xs text-muted">
                    {c.note}
                  </div>
                  <div className="mt-4 flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-2" />
                    <div>
                      <div className="font-semibold text-ink">{c.name}</div>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {c.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 生产与检测设备 */}
        <Reveal>
          <div className="mt-12">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
              <Factory className="h-6 w-6 text-brand-2" />
              {t("equipTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {t("equipIntro")}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {equipment.map((e) => (
                <div key={e.name} className="glass glass-hover rounded-2xl p-5">
                  <div className="flex items-center gap-2 font-semibold text-ink">
                    <Microscope className="h-4 w-4 text-brand-2" />
                    {e.name}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {e.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 质检流程 */}
        <Reveal>
          <div className="mt-12">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
              <ClipboardCheck className="h-6 w-6 text-brand-2" />
              {t("processTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {t("processIntro")}
            </p>
            <ol className="mt-6 space-y-4">
              {steps.map((s, i) => (
                <li key={s.title} className="glass flex gap-4 rounded-2xl p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-2 font-mono text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-ink">{s.title}</div>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {s.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* 研发能力 */}
        <Reveal>
          <div className="mt-12">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
              <FlaskConical className="h-6 w-6 text-brand-2" />
              {t("rdTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {t("rdIntro")}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {rdPoints.map((p) => (
                <li
                  key={p}
                  className="glass flex gap-2.5 rounded-xl p-4 text-sm leading-relaxed text-ink/85"
                >
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-2" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div className="mt-12 rounded-2xl bg-ink/85 p-8 text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75">
              {t("ctaDesc")}
            </p>
            <Link href="/contact" className="btn-primary mt-6 inline-flex">
              {t("ctaButton")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </Reveal>
      </div>

      <CtaSection />
    </div>
  );
}
