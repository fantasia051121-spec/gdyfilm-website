import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { getProductSeries } from "@/lib/products";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL("https://gdyfilm.com"),
    title: t("title"),
    description: t("description"),
    icons: { icon: "/favicon.png" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  // 需求登记的产品下拉：只把「名称 + 编号」这层薄数据传给客户端（不是整个产品目录）
  const productOptions = getProductSeries(locale).flatMap((s) =>
    s.models.map((m) => (m.code ? `${m.name} · ${m.code}` : m.name))
  );

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ChatWidget productOptions={productOptions} />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
