import { getTranslations } from "next-intl/server";

const certs = [
  "ISO 9001",
  "ISO 14001",
  "SGS Tested",
  "RoHS",
  "REACH",
  "National High-Tech Enterprise",
];

export default async function TrustStrip() {
  const t = await getTranslations("trust");
  return (
    <section className="border-y border-ink/10 bg-surface/70">
      <div className="container-x flex flex-col items-center gap-5 py-7 md:flex-row md:justify-between">
        <p className="max-w-xl text-center text-sm font-semibold text-ink md:text-left">
          {t("line")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {certs.map((c) => (
            <span
              key={c}
              className="rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-muted"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
