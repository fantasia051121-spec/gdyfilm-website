import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/ContactForm";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Globe,
} from "lucide-react";
import { site } from "@/lib/site";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const ti = await getTranslations("contact.info");

  const channels = [
    { label: "Facebook", value: site.contact.phone, href: site.social.facebook, Icon: Facebook },
    { label: "Instagram", value: "zyh3082", href: site.social.instagram, Icon: Instagram },
    { label: "LinkedIn", value: site.contact.email, href: site.social.linkedin, Icon: Linkedin },
    { label: "Made-in-China", value: "guangdayuan.888", href: site.social.madeInChina, Icon: Globe },
    { label: "1688", value: "guangdayuan.1688.com", href: site.social.platform1688, Icon: Globe },
  ];

  return (
    <div className="pt-24">
      <section className="py-12 sm:py-16">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-ink sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-3 text-muted">{t("subtitle")}</p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <ContactForm />

            <div className="glass rounded-2xl p-6 sm:p-8">
              <h3 className="mb-5 text-lg font-semibold text-ink">
                {ti("title")}
              </h3>
              <ul className="space-y-5 text-sm text-muted">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-2" />
                  <div>
                    <span className="block text-ink/80">{ti("address")}</span>
                    <span>{site.contact.address}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-2" />
                  <div>
                    <span className="block text-ink/80">{ti("phone")}</span>
                    <a
                      href={site.social.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition hover:text-brand"
                    >
                      {site.contact.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-2" />
                  <div>
                    <span className="block text-ink/80">{ti("email")}</span>
                    <a
                      href={`mailto:${site.contact.email}`}
                      className="transition hover:text-brand"
                    >
                      {site.contact.email}
                    </a>
                  </div>
                </li>
              </ul>

              <h3 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wider text-brand-2">
                {t("channelsTitle")}
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {channels.map(({ label, value, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-3.5 py-3 transition hover:border-brand/40 hover:bg-ink/5"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-brand-2" />
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-ink/90">
                          {label}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {value}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
