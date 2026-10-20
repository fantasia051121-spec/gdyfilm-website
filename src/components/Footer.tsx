import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import SocialLinks from "./SocialLinks";
import { asset } from "@/lib/asset";

export default async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const year = new Date().getFullYear();
  const links = [
    { key: "services", href: "/services" },
    { key: "cases", href: "/cases" },
    { key: "news", href: "/news" },
    { key: "faq", href: "/faq" },
    { key: "about", href: "/about" },
    { key: "contact", href: "/contact" },
  ];

  return (
    <footer className="border-t border-ink/10 bg-ink-2">
      <div className="container-x grid gap-10 py-12 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/images/logo-blue.png")}
              alt="GDY"
              className="h-9 w-9 object-contain"
            />
            <span className="font-semibold text-ink">{site.company.name}</span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            {t("tagline")}
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-ink">
            {t("company")}
          </h4>
          <ul className="space-y-2 text-sm text-muted">
            {links.map((it) => (
              <li key={it.key}>
                <Link
                  href={it.href}
                  className="transition hover:text-brand"
                >
                  {tn(it.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-ink">
            {t("follow")}
          </h4>
          <SocialLinks />
          <div className="mt-4 space-y-1.5 text-sm text-muted">
            <p>{site.contact.address}</p>
            <a
              href={`mailto:${site.contact.email}`}
              className="block transition hover:text-brand"
            >
              {site.contact.email}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="container-x py-5 text-center text-xs text-muted">
          © {year} {site.company.name}. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
