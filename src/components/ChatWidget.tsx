"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Wrench,
  Headset,
  Phone,
  Mail,
} from "lucide-react";
import { site } from "@/lib/site";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatWidget({ productOptions = [] }: { productOptions?: string[] }) {
  const t = useTranslations("chat");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWechat, setShowWechat] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [wiz, setWiz] = useState({
    product: "",
    productOther: "",
    thickness: "",
    width: "",
    adhesion: "",
    qty: "",
    country: "",
    application: "",
    contactName: "",
    contactCompany: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [wizError, setWizError] = useState("");
  const [imgOk, setImgOk] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickItems = (t.raw("quickItems") as string[]) ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, showWizard, showHandoff]);

  // 支持通过 ?chat=open 直接展开助手（用于预览 / 分享入口）
  useEffect(() => {
    if (typeof window !== "undefined" && /[?&]chat=open\b/.test(window.location.search)) {
      setOpen(true);
    }
  }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const history: Msg[] = [...messages, { role: "user", content }];
    setMessages(history);
    setInput("");
    setLoading(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    setShowHandoff(false);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          locale,
        }),
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let buf = "";
      const paint = (text: string) =>
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "assistant", content: text };
          return copy;
        });
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          try {
            const obj = JSON.parse(line);
            if (obj?.t === "d") {
              acc += obj.v ?? "";
              paint(acc);
            } else if (obj?.t === "handoff") {
              setShowHandoff(true);
            }
          } catch {
            // 兼容非 NDJSON 的纯文本响应
            acc += line;
            paint(acc);
          }
        }
      }
    } catch {
      setMessages((m) => {
        const copy = m.slice();
        copy[copy.length - 1] = { role: "assistant", content: t("offline") };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  function generateInquiry() {
    // 至少留下一种联系方式，方便销售后续跟进
    if (!wiz.contactEmail.trim() && !wiz.contactPhone.trim()) {
      setWizError(t("wizardContactRequired"));
      return;
    }
    setWizError("");

    const productText =
      wiz.product === "__other__"
        ? wiz.productOther.trim() || t("wizardProductOther")
        : wiz.product || "-";

    const lines = [
      `${t("wizardProduct")}: ${productText}`,
      `${t("wizardApplication")}: ${wiz.application || "-"}`,
      `${t("wizardThickness")}: ${wiz.thickness || "-"}`,
      `${t("wizardWidth")}: ${wiz.width || "-"}`,
      `${t("wizardAdhesion")}: ${wiz.adhesion || "-"}`,
      `${t("wizardQty")}: ${wiz.qty || "-"}`,
      `${t("wizardCountry")}: ${wiz.country || "-"}`,
      `${t("wizardName")}: ${wiz.contactName || "-"}`,
      `${t("wizardCompany")}: ${wiz.contactCompany || "-"}`,
      `${t("wizardEmail")}: ${wiz.contactEmail || "-"}`,
      `${t("wizardPhone")}: ${wiz.contactPhone || "-"}`,
    ];
    setShowWizard(false);
    send("[询盘登记] " + lines.join("  |  "));
  }

  // 对话摘要：只取最近 6 条用户提问并截断，避免 WhatsApp 链接超长
  function conversationSummary(max = 500) {
    const s = messages
      .filter((m) => m.role === "user")
      .slice(-6)
      .map((m) => m.content)
      .join(" | ");
    return s.length > max ? s.slice(-max) : s;
  }

  // 号码从后台配置读取（不再硬编码），后台改了这里自动跟着变
  function whatsappBase() {
    const raw = site.social.whatsapp || "";
    if (raw.startsWith("http")) return raw.split("?")[0].replace(/\/+$/, "");
    const digits = (site.contact.whatsapp || site.contact.phone || "").replace(/\D/g, "");
    return `https://wa.me/${digits}`;
  }

  function openWhatsApp() {
    const text = encodeURIComponent(
      "Hello GDY! I'd like to inquire about PET protective film. " + conversationSummary()
    );
    window.open(`${whatsappBase()}?text=${text}`, "_blank", "noopener");
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3">
        {!open && !hintDismissed && (
          <div className="anim-bubble-in relative mb-1 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-ink shadow-lg ring-1 ring-line">
            <span className="text-brand">{t("hint")}</span>
            <button
              onClick={() => setHintDismissed(true)}
              aria-label={t("hintClose")}
              className="ml-0.5 grid h-5 w-5 place-items-center rounded-full text-muted transition hover:bg-panel-2 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <span className="absolute right-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-white" />
          </div>
        )}
        <div className="relative">
          {!open && (
            <span className="chat-ring pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full" />
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={t("title")}
            className="relative grid h-14 w-14 place-items-center rounded-full text-white shadow-xl transition hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, var(--color-brand-2), var(--color-brand-3))",
            }}
          >
            {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          dir={locale === "ar" ? "rtl" : "ltr"}
          className="fixed bottom-24 right-5 z-50 flex h-[72vh] max-h-[580px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface"
          style={{ boxShadow: "0 24px 60px -20px rgba(11,31,60,0.4)" }}
        >
          {/* header */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-brand-2 to-brand-3 px-4 py-3 text-white">
            <Sparkles className="h-5 w-5" />
            <div className="text-sm font-semibold leading-tight">{t("title")}</div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto text-white/90 transition hover:text-white"
              aria-label="close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-3 py-4"
            style={{ background: "var(--color-bg)" }}
          >
            <div className="flex justify-start">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-line bg-surface px-3 py-2 text-sm text-ink">
                {t("subtitle")}
              </div>
            </div>

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-brand text-white"
                      : "rounded-bl-sm border border-line bg-surface text-ink"
                  }`}
                >
                  {m.content ||
                    (loading && i === messages.length - 1 ? t("thinking") : "")}
                </div>
              </div>
            ))}

            {/* 自动转人工联系卡：AI 答不上来 / 命中转人工关键词时出现 */}
            {showHandoff && (
              <div className="rounded-2xl border border-brand/40 bg-brand/5 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-brand">
                  <Headset className="h-4 w-4" /> {t("handoffTitle")}
                </div>
                <div className="mb-2.5 text-xs text-muted">{t("handoffDesc")}</div>
                <div className="space-y-1.5">
                  <button
                    onClick={openWhatsApp}
                    className="btn-primary w-full text-xs"
                    style={{ padding: "0.5rem 0.75rem" }}
                  >
                    {t("handoffWhatsapp")}
                  </button>
                  <button
                    onClick={() => setShowWechat(true)}
                    className="w-full rounded-full border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink transition hover:border-brand"
                  >
                    {t("handoffWechat")}
                  </button>
                  <div className="flex gap-1.5">
                    <a
                      href={`tel:${(site.contact.phone || "").replace(/\s/g, "")}`}
                      className="flex flex-1 items-center justify-center gap-1 rounded-full border border-line bg-surface px-2 py-2 text-xs font-semibold text-ink transition hover:border-brand"
                    >
                      <Phone className="h-3 w-3" /> {t("handoffPhone")}
                    </a>
                    <a
                      href={`mailto:${site.contact.email}?subject=${encodeURIComponent(
                        "PET protective film inquiry"
                      )}`}
                      className="flex flex-1 items-center justify-center gap-1 rounded-full border border-line bg-surface px-2 py-2 text-xs font-semibold text-ink transition hover:border-brand"
                    >
                      <Mail className="h-3 w-3" /> {t("handoffEmail")}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* quick questions */}
            {messages.length === 0 && (
              <div>
                <div className="mb-1 text-xs text-muted">{t("quick")}</div>
                <div className="flex flex-wrap gap-2">
                  {quickItems.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => send(q)}
                      className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink transition hover:border-brand"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* quote wizard */}
            {showWizard && (
              <div className="rounded-2xl border border-line bg-surface p-3">
                <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-brand">
                  <Wrench className="h-3.5 w-3.5" /> {t("wizard")}
                </div>
                <div className="space-y-2">
                  <select
                    value={wiz.product}
                    onChange={(e) =>
                      setWiz({ ...wiz, product: e.target.value })
                    }
                    className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                  >
                    <option value="">{t("wizardProduct")}</option>
                    {productOptions.map((p, i) => (
                      <option key={i} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="__other__">{t("wizardProductOther")}</option>
                  </select>

                  {wiz.product === "__other__" && (
                    <input
                      placeholder={t("wizardProductOtherPlaceholder")}
                      value={wiz.productOther}
                      onChange={(e) =>
                        setWiz({ ...wiz, productOther: e.target.value })
                      }
                      className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                    />
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder={t("wizardThickness")}
                      value={wiz.thickness}
                      onChange={(e) =>
                        setWiz({ ...wiz, thickness: e.target.value })
                      }
                      className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                    />
                    <input
                      placeholder={t("wizardWidth")}
                      value={wiz.width}
                      onChange={(e) => setWiz({ ...wiz, width: e.target.value })}
                      className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                    />
                    <input
                      placeholder={t("wizardAdhesion")}
                      value={wiz.adhesion}
                      onChange={(e) =>
                        setWiz({ ...wiz, adhesion: e.target.value })
                      }
                      className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                    />
                    <input
                      placeholder={t("wizardQty")}
                      value={wiz.qty}
                      onChange={(e) => setWiz({ ...wiz, qty: e.target.value })}
                      className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                    />
                    <input
                      placeholder={t("wizardApplication")}
                      value={wiz.application}
                      onChange={(e) =>
                        setWiz({ ...wiz, application: e.target.value })
                      }
                      className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                    />
                    <input
                      placeholder={t("wizardCountry")}
                      value={wiz.country}
                      onChange={(e) => setWiz({ ...wiz, country: e.target.value })}
                      className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                    />
                  </div>

                  {/* 联系方式：方便销售后续跟进 */}
                  <div className="rounded-lg bg-brand/5 p-2.5">
                    <div className="mb-1.5 text-xs font-medium text-brand">
                      {t("wizardContactTitle")}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder={`${t("wizardName")} *`}
                        value={wiz.contactName}
                        onChange={(e) =>
                          setWiz({ ...wiz, contactName: e.target.value })
                        }
                        className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                      />
                      <input
                        placeholder={t("wizardCompany")}
                        value={wiz.contactCompany}
                        onChange={(e) =>
                          setWiz({ ...wiz, contactCompany: e.target.value })
                        }
                        className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                      />
                      <input
                        placeholder={`${t("wizardEmail")} *`}
                        value={wiz.contactEmail}
                        onChange={(e) =>
                          setWiz({ ...wiz, contactEmail: e.target.value })
                        }
                        className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                      />
                      <input
                        placeholder={t("wizardPhone")}
                        value={wiz.contactPhone}
                        onChange={(e) =>
                          setWiz({ ...wiz, contactPhone: e.target.value })
                        }
                        className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-muted">
                      {t("wizardContactHint")}
                    </div>
                  </div>

                  {wizError && (
                    <div className="text-xs text-red-500">{wizError}</div>
                  )}

                  <button
                    onClick={generateInquiry}
                    className="btn-primary w-full text-xs"
                    style={{ padding: "0.5rem 0.75rem" }}
                  >
                    {t("wizardGenerate")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* bottom: human handoff + input */}
          <div className="flex-none border-t border-line bg-panel-2 px-3 py-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs text-muted">{t("humanDesc")}</span>
              <button
                onClick={() => setShowWizard((w) => !w)}
                className="flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1 text-xs text-ink transition hover:border-brand"
              >
                <Wrench className="h-3 w-3" /> {t("wizard")}
              </button>
            </div>
            <div className="mb-2 flex gap-2">
              <button
                onClick={openWhatsApp}
                className="btn-primary flex-1 text-xs"
                style={{ padding: "0.5rem 0.5rem" }}
              >
                {t("whatsapp")}
              </button>
              <button
                onClick={() => setShowWechat((w) => !w)}
                className="flex-1 rounded-full border border-line bg-surface px-2 py-2 text-xs font-semibold text-ink transition hover:border-brand"
              >
                {t("wechat")}
              </button>
            </div>
            {showWechat && (
              <div className="mb-2 rounded-xl border border-line bg-surface p-3 text-center">
                <div className="mb-1 text-xs text-muted">{t("wechatScan")}</div>
                {imgOk ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={site.wechat.qr}
                    alt="WeChat QR"
                    onError={() => setImgOk(false)}
                    className="mx-auto h-28 w-28 object-contain"
                  />
                ) : (
                  <div className="text-sm text-ink">
                    {t("wechatIdLabel")}: <b>{site.wechat.id}</b>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder={t("placeholder")}
                rows={1}
                className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              />
              <button
                onClick={() => send(input)}
                disabled={loading}
                className="btn-primary"
                style={{ padding: "0.5rem 0.75rem" }}
                aria-label={t("send")}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
