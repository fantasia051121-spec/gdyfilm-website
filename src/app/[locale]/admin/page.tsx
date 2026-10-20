"use client";

import { useEffect, useState } from "react";

type Tab = "news" | "company" | "content" | "faq" | "products" | "knowledge";
type Status = { kind: "idle" | "loading" | "ok" | "error"; msg: string; link?: string };

const LOCALES = [
  { k: "en", label: "English" },
  { k: "zh", label: "中文" },
  { k: "vi", label: "Tiếng Việt" },
  { k: "th", label: "ไทย" },
  { k: "id", label: "Indonesia" },
  { k: "ms", label: "Melayu" },
  { k: "ar", label: "العربية" },
];

const NS_OPTIONS = [
  { k: "cases", label: "案例 / Cases（6 大行业）" },
  { k: "advantages", label: "优势 / Advantages（卖点 + 认证）" },
  { k: "hero", label: "首页首屏 / Hero 文案" },
  { k: "products", label: "产品目录 UI 文案（7 语言）" },
  { k: "quality", label: "品质技术 / Quality 页（7 语言）" },
  { k: "productDetail", label: "产品详情页 UI 文案（7 语言）" },
  { k: "casesIndustry", label: "行业详情页 UI 文案（7 语言）" },
];

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function StatusBanner({ s }: { s: Status }) {
  if (s.kind === "idle") return null;
  const cls =
    s.kind === "error"
      ? "bg-rose-50 text-rose-700"
      : s.kind === "ok"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-600";
  return (
    <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${cls}`}>
      {s.msg}
      {s.link && (
        <a href={s.link} target="_blank" rel="noreferrer" className="ml-2 underline">
          查看提交 ↗
        </a>
      )}
    </div>
  );
}

/* ---------------- 新闻（保留原 AI 发文） ---------------- */
function NewsEditor({ pw }: { pw: string }) {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<"company" | "industry">("company");
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });
  const [result, setResult] = useState<any>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return setStatus({ kind: "error", msg: "请填写文章主题。" });
    if (!pw) return setStatus({ kind: "error", msg: "请先在顶部输入后台密码。" });
    setStatus({ kind: "loading", msg: "AI 正在撰写 7 语言稿件并提交，请稍候（约 20–40 秒）…" });
    setResult(null);
    try {
      const res = await fetch("/api/news/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, category, password: pw }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return setStatus({ kind: "error", msg: data?.error || "生成失败。" });
      setStatus({ kind: "ok", msg: data.note || "发布成功！" });
      setResult(data);
      setTopic("");
    } catch (err: any) {
      setStatus({ kind: "error", msg: "请求失败：" + (err?.message || err) });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">文章主题 *</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="例如：GDY 新增大宽幅涂布产线，满足新能源客户定制需求"
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">分类</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as "company" | "industry")}
          className={inputCls}
        >
          <option value="company">公司动态</option>
          <option value="industry">行业资讯</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={status.kind === "loading"}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        {status.kind === "loading" ? "生成中…" : "生成并发布"}
      </button>
      <StatusBanner s={status} />
      {result?.slug && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="font-medium text-slate-700">
            已生成：<span className="font-mono text-blue-600">{result.slug}</span>
            {result.mode === "github" && (
              <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">已提交</span>
            )}
            {result.mode === "local" && (
              <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">本地草稿</span>
            )}
          </div>
          {result.commitUrl && (
            <a href={result.commitUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-600 underline">
              查看提交记录 ↗
            </a>
          )}
          {result.preview && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(result.preview as Record<string, string>).map(([loc, link]) => (
                <a
                  key={loc}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-xs text-slate-600 hover:border-blue-300 hover:text-blue-600"
                >
                  {LOCALES.find((l) => l.k === loc)?.label || loc}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

/* ---------------- 公司信息（结构化表单） ---------------- */
function CompanyEditor({ pw }: { pw: string }) {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });

  useEffect(() => {
    if (!pw) return;
    fetch("/api/content?type=company")
      .then((r) => r.json())
      .then((d) => setData(d.data))
      .catch(() => setStatus({ kind: "error", msg: "加载失败" }));
  }, [pw]);

  function set(path: string[], value: string) {
    setData((d: any) => {
      const n = { ...d };
      let o = n;
      for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
      o[path[path.length - 1]] = value;
      return n;
    });
  }

  async function save() {
    if (!pw) return setStatus({ kind: "error", msg: "请先在顶部输入后台密码。" });
    setStatus({ kind: "loading", msg: "保存中…" });
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "company", data, password: pw }),
      });
      const r = await res.json();
      setStatus(r.ok ? { kind: "ok", msg: r.note || "已保存", link: r.commitUrl } : { kind: "error", msg: r.error });
    } catch (e: any) {
      setStatus({ kind: "error", msg: "请求失败：" + (e?.message || e) });
    }
  }

  if (!data) return <p className="text-sm text-slate-500">{pw ? "加载中…" : "请先输入密码"}</p>;

  const Field = ({ label, path, ph }: { label: string; path: string[]; ph?: string }) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <input
        className={inputCls}
        value={path.reduce((o, k) => o?.[k], data) ?? ""}
        placeholder={ph}
        onChange={(e) => set(path, e.target.value)}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">公司</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="公司名（英）" path={["company", "name"]} />
          <Field label="公司名（中）" path={["company", "nameZh"]} />
          <Field label="简称" path={["company", "shortName"]} />
          <Field label="建厂年份" path={["company", "established"]} />
          <div className="sm:col-span-2">
            <Field label="公司标语 / 定位" path={["company", "tagline"]} />
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">联系</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="邮箱" path={["contact", "email"]} />
          <Field label="电话 / WhatsApp" path={["contact", "phone"]} />
          <Field label="WhatsApp 链接" path={["contact", "whatsapp"]} />
          <Field label="官网" path={["contact", "website"]} />
          <div className="sm:col-span-2">
            <Field label="地址" path={["contact", "address"]} />
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">社媒链接</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Facebook" path={["social", "facebook"]} />
          <Field label="Instagram" path={["social", "instagram"]} />
          <Field label="LinkedIn" path={["social", "linkedin"]} />
          <Field label="YouTube" path={["social", "youtube"]} />
          <Field label="TikTok" path={["social", "tiktok"]} />
          <Field label="Made-in-China" path={["social", "madeInChina"]} />
          <Field label="1688" path={["social", "platform1688"]} />
          <Field label="微信 ID" path={["wechat", "id"]} />
        </div>
      </div>
      <button
        onClick={save}
        disabled={status.kind === "loading"}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        {status.kind === "loading" ? "保存中…" : "保存公司信息"}
      </button>
      <StatusBanner s={status} />
    </div>
  );
}

/* ---------------- 内容（messages 命名空间，JSON 编辑） ---------------- */
function ContentEditor({ pw }: { pw: string }) {
  const [ns, setNs] = useState("services");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });

  useEffect(() => {
    if (!pw) return;
    setText("");
    setStatus({ kind: "idle", msg: "" });
    fetch(`/api/content?type=messages&namespace=${ns}`)
      .then((r) => r.json())
      .then((d) => setText(JSON.stringify(d.data, null, 2)))
      .catch(() => setStatus({ kind: "error", msg: "加载失败" }));
  }, [ns, pw]);

  async function save() {
    if (!pw) return setStatus({ kind: "error", msg: "请先在顶部输入后台密码。" });
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return setStatus({ kind: "error", msg: "JSON 格式错误，请检查。" });
    }
    setStatus({ kind: "loading", msg: "保存中…" });
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "messages", namespace: ns, data: parsed, password: pw }),
      });
      const r = await res.json();
      setStatus(r.ok ? { kind: "ok", msg: r.note || "已保存", link: r.commitUrl } : { kind: "error", msg: r.error });
    } catch (e: any) {
      setStatus({ kind: "error", msg: "请求失败：" + (e?.message || e) });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {NS_OPTIONS.map((o) => (
          <button
            key={o.k}
            onClick={() => setNs(o.k)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              ns === o.k ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        按语言（en/zh/vi/th/id/ms/ar）编辑对应内容。保存即覆盖整段命名空间，请保持 JSON 结构（尤其数组顺序）。
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={18}
        spellCheck={false}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 outline-none focus:border-blue-400"
      />
      <button
        onClick={save}
        disabled={status.kind === "loading"}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        {status.kind === "loading" ? "保存中…" : "保存内容"}
      </button>
      <StatusBanner s={status} />
    </div>
  );
}

/* ---------------- 常见问题 FAQ（结构化列表） ---------------- */
function FaqEditor({ pw }: { pw: string }) {
  const [data, setData] = useState<any>(null);
  const [loc, setLoc] = useState("en");
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });

  useEffect(() => {
    if (!pw) return;
    fetch("/api/content?type=faq")
      .then((r) => r.json())
      .then((d) => setData(d.data))
      .catch(() => setStatus({ kind: "error", msg: "加载失败" }));
  }, [pw]);

  function update(idx: number, key: "q" | "a", value: string) {
    setData((d: any) => {
      const n = { ...d };
      n[loc][idx][key] = value;
      return n;
    });
  }
  function add() {
    setData((d: any) => {
      const n = { ...d };
      n[loc] = [...(n[loc] || []), { q: "", a: "" }];
      return n;
    });
  }
  function remove(idx: number) {
    setData((d: any) => {
      const n = { ...d };
      n[loc] = n[loc].filter((_: any, i: number) => i !== idx);
      return n;
    });
  }

  async function save() {
    if (!pw) return setStatus({ kind: "error", msg: "请先在顶部输入后台密码。" });
    setStatus({ kind: "loading", msg: "保存中…" });
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "faq", data, password: pw }),
      });
      const r = await res.json();
      setStatus(r.ok ? { kind: "ok", msg: r.note || "已保存", link: r.commitUrl } : { kind: "error", msg: r.error });
    } catch (e: any) {
      setStatus({ kind: "error", msg: "请求失败：" + (e?.message || e) });
    }
  }

  if (!data) return <p className="text-sm text-slate-500">{pw ? "加载中…" : "请先输入密码"}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {LOCALES.map((l) => (
          <button
            key={l.k}
            onClick={() => setLoc(l.k)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              loc === l.k ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {(data[loc] || []).map((it: any, i: number) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">#{i + 1}</span>
              <button onClick={() => remove(i)} className="text-xs text-rose-500 hover:underline">
                删除
              </button>
            </div>
            <input
              className={inputCls + " mb-2"}
              placeholder="问题 / Question"
              value={it.q}
              onChange={(e) => update(i, "q", e.target.value)}
            />
            <textarea
              className={inputCls}
              rows={2}
              placeholder="答案 / Answer"
              value={it.a}
              onChange={(e) => update(i, "a", e.target.value)}
            />
          </div>
        ))}
      </div>
      <button onClick={add} className="w-full rounded-xl border border-dashed border-slate-300 py-2 text-sm text-slate-500 transition hover:border-blue-400 hover:text-blue-600">
        + 添加一条
      </button>
      <button
        onClick={save}
        disabled={status.kind === "loading"}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        {status.kind === "loading" ? "保存中…" : "保存 FAQ"}
      </button>
      <StatusBanner s={status} />
    </div>
  );
}

/* ---------------- 知识库（产品 + 价格表，供 AI 回答使用） ---------------- */
const KB_LOCALES = [
  { k: "en", label: "English" },
  { k: "zh", label: "中文" },
];
const KB_UNITS = ["m2", "roll", "kg", "piece"];
const KB_CURRENCIES = ["USD", "CNY", "EUR"];

function KnowledgeEditor({ pw }: { pw: string }) {
  const [data, setData] = useState<any>(null);
  const [loc, setLoc] = useState("en");
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });

  useEffect(() => {
    if (!pw) return;
    fetch("/api/content?type=knowledge", { headers: { "x-admin-password": pw } })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d?.error || `HTTP ${r.status}`);
        setData(d.data);
      })
      .catch((e: any) => setStatus({ kind: "error", msg: "加载失败：" + (e?.message || e) }));
  }, [pw]);

  function mutate(fn: (d: any) => void) {
    setData((d: any) => {
      const n = JSON.parse(JSON.stringify(d || {}));
      fn(n);
      return n;
    });
  }
  const getBi = (obj: any, key: string) => obj?.[key]?.[loc] ?? "";
  const setBi = (obj: any, key: string, v: string) => {
    obj[key] = obj[key] || {};
    obj[key][loc] = v;
  };
  const getList = (obj: any, key: string) => ((obj?.[key]?.[loc] || []) as string[]).join("\n");
  const setList = (obj: any, key: string, v: string) => {
    obj[key] = obj[key] || {};
    obj[key][loc] = v.split("\n");
  };

  async function save() {
    if (!pw) return setStatus({ kind: "error", msg: "请先在顶部输入后台密码。" });
    setStatus({ kind: "loading", msg: "保存中…" });
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "knowledge", data, password: pw }),
      });
      const r = await res.json();
      setStatus(
        r.ok
          ? { kind: "ok", msg: r.note || "已保存", link: r.commitUrl }
          : { kind: "error", msg: r.error }
      );
    } catch (e: any) {
      setStatus({ kind: "error", msg: "请求失败：" + (e?.message || e) });
    }
  }

  if (!data) return <p className="text-sm text-slate-500">{pw ? "加载中…" : "请先输入密码"}</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {KB_LOCALES.map((l) => (
          <button
            key={l.k}
            onClick={() => setLoc(l.k)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              loc === l.k ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {l.label}
          </button>
        ))}
        <span className="text-xs text-slate-400">
          只维护中英双语，其它语言由 AI 自行翻译作答
        </span>
      </div>

      {/* 公司简介要点 */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">公司简介要点</h3>
        <textarea
          rows={5}
          className={inputCls}
          placeholder="一行一条，如：GDY，2004 年成立，20+ 年专注 PET 保护膜"
          value={getList(data, "company")}
          onChange={(e) => mutate((n) => setList(n, "company", e.target.value))}
        />
      </section>

      {/* 产品 + 价格表 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">产品与价格表</h3>
          <button
            onClick={() =>
              mutate((n) => {
                n.products = n.products || [];
                n.products.push({
                  id: `p-${Date.now()}`,
                  enabled: true,
                  name: {},
                  summary: {},
                  specs: {},
                  applications: {},
                  pricing: [],
                });
              })
            }
            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
          >
            + 添加产品
          </button>
        </div>

        {(data.products || []).map((p: any, pi: number) => (
          <div key={p.id ?? pi} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={p.enabled !== false}
                  onChange={(e) => mutate((n) => void (n.products[pi].enabled = e.target.checked))}
                />
                启用
              </label>
              <span className="text-xs text-slate-400">id: {p.id}</span>
              <button
                onClick={() => mutate((n) => void n.products.splice(pi, 1))}
                className="ml-auto text-xs text-rose-500 hover:underline"
              >
                删除产品
              </button>
            </div>

            <input
              className={inputCls}
              placeholder="产品名称"
              value={getBi(p, "name")}
              onChange={(e) => mutate((n) => setBi(n.products[pi], "name", e.target.value))}
            />
            <textarea
              rows={2}
              className={inputCls}
              placeholder="一句话简介"
              value={getBi(p, "summary")}
              onChange={(e) => mutate((n) => setBi(n.products[pi], "summary", e.target.value))}
            />
            <textarea
              rows={3}
              className={inputCls}
              placeholder="规格参数（一行一条）"
              value={getList(p, "specs")}
              onChange={(e) => mutate((n) => setList(n.products[pi], "specs", e.target.value))}
            />
            <textarea
              rows={2}
              className={inputCls}
              placeholder="应用场景（一行一条）"
              value={getList(p, "applications")}
              onChange={(e) => mutate((n) => setList(n.products[pi], "applications", e.target.value))}
            />

            {/* 价格区间 */}
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  价格区间（AI 只按这里回答，只给区间不给精确单价）
                </span>
                <button
                  onClick={() =>
                    mutate((n) => {
                      const pr = n.products[pi];
                      pr.pricing = pr.pricing || [];
                      pr.pricing.push({
                        id: `${pr.id}-${Date.now()}`,
                        enabled: true,
                        spec: {},
                        unit: "m2",
                        currency: "USD",
                        min: 0,
                        max: 0,
                      });
                    })
                  }
                  className="text-xs text-blue-600 hover:underline"
                >
                  + 添加价格行
                </button>
              </div>

              {(p.pricing || []).length === 0 && (
                <p className="text-xs text-slate-400">
                  未填价格时 AI 不会报价，只会说明价格取决于规格 / 数量 / 贸易条款，并转人工。
                </p>
              )}

              {(p.pricing || []).map((r: any, ri: number) => (
                <div key={r.id ?? ri} className="mb-2 rounded-lg border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        checked={r.enabled !== false}
                        onChange={(e) =>
                          mutate((n) => void (n.products[pi].pricing[ri].enabled = e.target.checked))
                        }
                      />
                      启用
                    </label>
                    <button
                      onClick={() => mutate((n) => void n.products[pi].pricing.splice(ri, 1))}
                      className="ml-auto text-xs text-rose-500 hover:underline"
                    >
                      删除
                    </button>
                  </div>
                  <input
                    className={inputCls + " mb-2"}
                    placeholder="规格描述，如 50μm，幅宽 1000mm"
                    value={getBi(r, "spec")}
                    onChange={(e) =>
                      mutate((n) => setBi(n.products[pi].pricing[ri], "spec", e.target.value))
                    }
                  />
                  <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <select
                      className={inputCls}
                      value={r.unit || "m2"}
                      onChange={(e) =>
                        mutate((n) => void (n.products[pi].pricing[ri].unit = e.target.value))
                      }
                    >
                      {KB_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <select
                      className={inputCls}
                      value={r.currency || "USD"}
                      onChange={(e) =>
                        mutate((n) => void (n.products[pi].pricing[ri].currency = e.target.value))
                      }
                    >
                      {KB_CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      className={inputCls}
                      placeholder="最低价"
                      value={r.min ?? 0}
                      onChange={(e) =>
                        mutate((n) => void (n.products[pi].pricing[ri].min = Number(e.target.value)))
                      }
                    />
                    <input
                      type="number"
                      step="0.01"
                      className={inputCls}
                      placeholder="最高价"
                      value={r.max ?? 0}
                      onChange={(e) =>
                        mutate((n) => void (n.products[pi].pricing[ri].max = Number(e.target.value)))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="起订量（可留空）"
                      value={r.moq ?? ""}
                      onChange={(e) =>
                        mutate((n) => {
                          const v = e.target.value;
                          n.products[pi].pricing[ri].moq = v === "" ? undefined : Number(v);
                        })
                      }
                    />
                    <input
                      className={inputCls}
                      placeholder="备注，如 FOB 深圳；≥10,000 m² 档位"
                      value={getBi(r, "note")}
                      onChange={(e) =>
                        mutate((n) => setBi(n.products[pi].pricing[ri], "note", e.target.value))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 商务政策 */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">商务政策</h3>
        <div className="space-y-2">
          {Object.keys(data.policies?.en || {}).map((k2) => (
            <div key={k2}>
              <label className="mb-1 block text-xs font-medium text-slate-600">{k2}</label>
              <textarea
                rows={2}
                className={inputCls}
                value={data.policies?.[loc]?.[k2] ?? ""}
                onChange={(e) =>
                  mutate((n) => {
                    n.policies = n.policies || {};
                    n.policies[loc] = n.policies[loc] || {};
                    n.policies[loc][k2] = e.target.value;
                  })
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* 定制能力 */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">定制能力</h3>
        <textarea
          rows={4}
          className={inputCls}
          placeholder="一行一条"
          value={getList(data, "customCapabilities")}
          onChange={(e) => mutate((n) => setList(n, "customCapabilities", e.target.value))}
        />
      </section>

      <button
        onClick={save}
        disabled={status.kind === "loading"}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        {status.kind === "loading" ? "保存中…" : "保存并发布"}
      </button>
      <StatusBanner s={status} />
    </div>
  );
}

/* ---------------- 外壳 ---------------- */
/**
 * 产品目录编辑器（content/products.json）。
 * 刻意做成结构化表单而不是 JSON textarea：5 系列 × 39 型号的嵌套结构，
 * 用文本编辑一旦顺序错位就会导致整站产品串号。
 * 注意：这里维护的是对外展示数据，**不含价格** —— 价格只在「知识库 / 价格表」标签页维护。
 */
function ProductCatalogEditor({ pw }: { pw: string }) {
  const [data, setData] = useState<any>(null);
  const [loc, setLoc] = useState("en");
  const [open, setOpen] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });

  useEffect(() => {
    if (!pw) return;
    fetch("/api/content?type=products")
      .then((r) => r.json())
      .then((d) => {
        setData(d.data);
        if (d.data?.series?.[0]?.id) setOpen(d.data.series[0].id);
      })
      .catch(() => setStatus({ kind: "error", msg: "加载失败" }));
  }, [pw]);

  const upd = (fn: (n: any) => void) =>
    setData((prev: any) => {
      const n = JSON.parse(JSON.stringify(prev));
      fn(n);
      return n;
    });

  const setEnabled = (si: number, mi: number | null, v: boolean) =>
    upd((n) => {
      if (mi === null) n.series[si].enabled = v;
      else n.series[si].models[mi].enabled = v;
    });

  const rmSeries = (si: number) =>
    upd((n) => {
      n.series = n.series.filter((_: any, i: number) => i !== si);
    });

  const rmModel = (si: number, mi: number) =>
    upd((n) => {
      n.series[si].models = n.series[si].models.filter((_: any, i: number) => i !== mi);
    });

  async function save() {
    if (!pw) return setStatus({ kind: "error", msg: "请先在顶部输入后台密码。" });
    setStatus({ kind: "loading", msg: "保存中…" });
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "products", data, password: pw }),
      });
      const r = await res.json();
      setStatus(
        r.ok
          ? { kind: "ok", msg: r.note || "已保存", link: r.commitUrl }
          : { kind: "error", msg: r.error }
      );
    } catch (e: any) {
      setStatus({ kind: "error", msg: "请求失败：" + (e?.message || e) });
    }
  }

  if (!data) return <p className="text-sm text-slate-500">{pw ? "加载中…" : "请先输入密码"}</p>;

  const total = data.series.reduce((a: number, s: any) => a + (s.models?.length || 0), 0);

  return (
    <div className="space-y-4">
      <StatusBanner s={status} />

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
        本页维护<strong>对外展示</strong>的产品资料。价格请到「知识库 / 价格表」标签页维护 ——
        产品目录的数据会随页面发送到浏览器，保存时服务端会拦截任何价格类字段。
      </div>

      <div className="flex flex-wrap gap-2">
        {LOCALES.map((l) => {
          // 统计当前语种缺失翻译的型号数，未翻完的按钮置灰，直观提示会回落英文
          const missing = data.series.reduce(
            (a: number, s: any) =>
              a + (s.models || []).filter((m: any) => !m?.name?.[l.k]).length,
            0
          );
          return (
            <button
              key={l.k}
              onClick={() => setLoc(l.k)}
              title={missing ? `${missing} 个型号缺${l.label}翻译（将回落英文）` : ""}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                loc === l.k
                  ? "bg-blue-600 text-white"
                  : missing
                  ? "bg-slate-100 text-slate-400 line-through"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {l.label}
            </button>
          );
        })}
      </div>

      <div className="text-xs text-slate-500">
        共 {data.series.length} 个系列 / {total} 个型号 · 当前编辑语种：
        <strong className="mx-1">{LOCALES.find((l) => l.k === loc)?.label}</strong>
        （灰掉的语种表示尚未翻译）
      </div>

      <div className="space-y-3">
        {data.series.map((s: any, si: number) => {
          const isOpen = open === s.id;
          return (
            <div key={s.id || si} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {isOpen ? "▾" : "▸"} {s.name?.[loc] || s.name?.en || `系列 ${si + 1}`}
                </button>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {s.models?.length || 0} 型号
                </span>
                <label className="ms-auto flex items-center gap-1 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={s.enabled !== false}
                    onChange={(e) => setEnabled(si, null, e.target.checked)}
                  />
                  启用
                </label>
                <button
                  onClick={() => rmSeries(si)}
                  className="text-xs text-rose-500 hover:underline"
                >
                  删除系列
                </button>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">系列名（{loc}）</label>
                      <input
                        className={inputCls}
                        value={s.name?.[loc] ?? ""}
                        onChange={(e) =>
                          upd((n) => {
                            n.series[si].name = { ...(n.series[si].name || {}), [loc]: e.target.value };
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">封面图路径</label>
                      <input
                        className={inputCls}
                        placeholder="/images/products/xxx.jpg"
                        value={s.cover ?? ""}
                        onChange={(e) =>
                          upd((n) => {
                            n.series[si].cover = e.target.value;
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">系列简介（{loc}）</label>
                    <textarea
                      className={inputCls + " h-16"}
                      value={s.intro?.[loc] ?? ""}
                      onChange={(e) =>
                        upd((n) => {
                          n.series[si].intro = { ...(n.series[si].intro || {}), [loc]: e.target.value };
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    {(s.models || []).map((m: any, mi: number) => (
                      <details key={m.id || mi} className="rounded-lg bg-slate-50 p-2">
                        <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-blue-600">
                            {m.code || "—"}
                          </span>
                          <span className="font-medium text-slate-700">
                            {m.name?.[loc] || m.name?.en || `型号 ${mi + 1}`}
                          </span>
                          {!m.name?.[loc] && loc !== "en" && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                              缺{loc}翻译
                            </span>
                          )}
                          <label
                            className="ms-auto flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={m.enabled !== false}
                              onChange={(e) => setEnabled(si, mi, e.target.checked)}
                            />
                            启用
                          </label>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              rmModel(si, mi);
                            }}
                            className="text-rose-500 hover:underline"
                          >
                            删除
                          </button>
                        </summary>

                        <div className="mt-2 space-y-2">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs text-slate-500">
                                GDY 编号
                              </label>
                              <input
                                className={inputCls}
                                value={m.code ?? ""}
                                onChange={(e) =>
                                  upd((n) => {
                                    n.series[si].models[mi].code = e.target.value;
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-slate-500">图片路径</label>
                              <input
                                className={inputCls}
                                value={m.image ?? ""}
                                placeholder="留空则用系列封面"
                                onChange={(e) =>
                                  upd((n) => {
                                    n.series[si].models[mi].image = e.target.value;
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-slate-500">
                              型号名（{loc}）
                            </label>
                            <input
                              className={inputCls}
                              value={m.name?.[loc] ?? ""}
                              onChange={(e) =>
                                upd((n) => {
                                  n.series[si].models[mi].name = {
                                    ...(m.name || {}),
                                    [loc]: e.target.value,
                                  };
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-slate-500">
                              一句话卖点（{loc}）
                            </label>
                            <textarea
                              className={inputCls + " h-14"}
                              value={m.tagline?.[loc] ?? ""}
                              onChange={(e) =>
                                upd((n) => {
                                  n.series[si].models[mi].tagline = {
                                    ...(m.tagline || {}),
                                    [loc]: e.target.value,
                                  };
                                })
                              }
                            />
                          </div>

                          {(["highlights", "applications"] as const).map((f) => (
                            <div key={f}>
                              <label className="mb-1 block text-xs text-slate-500">
                                {f === "highlights" ? "核心卖点" : "应用场景"}（{loc}）· 每行一条
                              </label>
                              <textarea
                                className={inputCls + " h-20"}
                                value={(m[f]?.[loc] ?? []).join("\n")}
                                onChange={(e) =>
                                  upd((n) => {
                                    n.series[si].models[mi][f] = {
                                      ...(m[f] || {}),
                                      [loc]: e.target.value.split("\n"),
                                    };
                                  })
                                }
                              />
                            </div>
                          ))}

                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <label className="text-xs text-slate-500">
                                技术参数 · 标签按语种翻译，取值不翻译
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  upd((n) => {
                                    const arr = n.series[si].models[mi].specs || [];
                                    arr.push({
                                      id: `s${arr.length + 1}`,
                                      label: {},
                                      value: "",
                                    });
                                    n.series[si].models[mi].specs = arr;
                                  })
                                }
                                className="text-xs text-blue-600 hover:underline"
                              >
                                + 加一行
                              </button>
                            </div>
                            {(m.specs || []).map((r: any, ri: number) => (
                              <div key={r.id || ri} className="mb-1.5 flex gap-1.5">
                                <input
                                  className={inputCls + " w-40"}
                                  placeholder={`标签(${loc})`}
                                  value={r.label?.[loc] ?? ""}
                                  onChange={(e) =>
                                    upd((n) => {
                                      n.series[si].models[mi].specs[ri].label = {
                                        ...(r.label || {}),
                                        [loc]: e.target.value,
                                      };
                                    })
                                  }
                                />
                                <input
                                  className={inputCls}
                                  placeholder="取值"
                                  value={r.value ?? ""}
                                  onChange={(e) =>
                                    upd((n) => {
                                      n.series[si].models[mi].specs[ri].value = e.target.value;
                                    })
                                  }
                                />
                                <input
                                  className={inputCls + " w-20"}
                                  placeholder="单位"
                                  value={r.unit ?? ""}
                                  onChange={(e) =>
                                    upd((n) => {
                                      n.series[si].models[mi].specs[ri].unit = e.target.value;
                                    })
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    upd((n) => {
                                      n.series[si].models[mi].specs = m.specs.filter(
                                        (_: any, i: number) => i !== ri
                                      );
                                    })
                                  }
                                  className="px-1 text-xs text-rose-500 hover:underline"
                                >
                                  删
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={save}
        disabled={status.kind === "loading"}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {status.kind === "loading" ? "保存中…" : "保存产品目录"}
      </button>
    </div>
  );
}

const TABS: { k: Tab; label: string }[] = [
  { k: "news", label: "新闻 / News" },
  { k: "company", label: "公司信息" },
  { k: "content", label: "首页文案" },
  { k: "faq", label: "常见问题" },
  { k: "products", label: "产品目录（商城）" },
  { k: "knowledge", label: "知识库 / 价格表" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("news");
  const [pw, setPw] = useState("");

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-sky-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h1 className="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-2xl font-bold text-transparent">
            GDY 内容后台 · CMS
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            无需改代码：公司信息、产品、案例、首页文案、新闻、常见问题均可在此直接更新并发布上线。
          </p>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              后台密码 <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="ADMIN_PASSWORD"
              className={inputCls}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {TABS.map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.k ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {tab === "news" && <NewsEditor pw={pw} />}
            {tab === "company" && <CompanyEditor pw={pw} />}
            {tab === "content" && <ContentEditor pw={pw} />}
            {tab === "faq" && <FaqEditor pw={pw} />}
            {tab === "products" && <ProductCatalogEditor pw={pw} />}
            {tab === "knowledge" && <KnowledgeEditor pw={pw} />}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          部署需在 Vercel 环境变量配置：ADMIN_PASSWORD、GITHUB_TOKEN、GITHUB_REPO。未配置 GitHub 时改动仅保存在开发机。
        </p>
      </div>
    </main>
  );
}
