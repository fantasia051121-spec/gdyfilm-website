import { renderKnowledge, type Locale } from "@/lib/knowledge";
import { locales as ROUTING_LOCALES } from "@/i18n/routing";

// 服务端 AI 系统提示词 + 转人工判定。
// 事实数据来自 content/knowledge.json（后台可编辑）；本文件只保留「行为规则」。
// 模型按用户使用的语言回复；价格只给区间，不编造精确单价。

/** 模型需要转人工时输出的哨兵标记（服务端会剥离，不会显示给客户） */
export const HANDOFF_MARKER = "[[HANDOFF]]";
/** 容忍模型输出的变体：**[HANDOFF]**、小写、内部空格等 */
export const HANDOFF_RE = /\*{0,2}\[\[\s*HANDOFF\s*\]\]\*{0,2}/gi;

/** locale 来自客户端请求，必须白名单校验，防止提示词注入 */
export function normalizeLocale(l?: string): Locale {
  return (ROUTING_LOCALES as readonly string[]).includes(l || "")
    ? (l as Locale)
    : "en";
}

// 关键词兜底：模型没打标记、或 AI 不可用时，也能触发转人工。
const HANDOFF_ZH =
  /(合同|协议|付款方式|账期|发票|开票|报关|退税|投诉|索赔|退货|招标|验厂|正式报价单|报价单|大批量定制|独家|代理权)/i;
const HANDOFF_EN =
  /\b(contract|purchase order|po|payment terms|credit terms|invoice|complain|refund|claim|tender|factory audit|exclusive|distributor|nda|formal quotation|official quote)\b/i;
// 东南亚与阿拉伯语：合同 / 付款 / 发票 / 投诉 / 正式报价
const HANDOFF_SEA =
  /(hợp đồng|thanh toán|hóa đơn|khiếu nại|báo giá chính thức|สัญญา|การชำระเงิน|ใบแจ้งหนี้|ร้องเรียน|ใบเสนอราคา|kontrak|pembayaran|faktur|komplain|klaim|penawaran resmi|invois|aduan|sebut harga|عقد|دفعة|فاتورة|شكوى|عرض سعر)/i;

export function needsHandoff(text: string): boolean {
  const t = text || "";
  return (
    HANDOFF_ZH.test(t) ||
    HANDOFF_EN.test(t.toLowerCase()) ||
    HANDOFF_SEA.test(t)
  );
}

const LANG_LINE: Record<string, string> = {
  en: "Reply in English.",
  zh: "请用中文回复。",
  vi: "Hãy trả lời bằng tiếng Việt.",
  th: "โปรดตอบเป็นภาษาไทย",
  id: "Balas dalam Bahasa Indonesia.",
  ms: "Sila balas dalam Bahasa Melayu.",
  ar: "أجب باللغة العربية.",
};

// 知识库为空 / 读取异常时的兜底事实（与 knowledge.json 内容保持一致，避免 AI 退化成乱答）。
const FALLBACK_FACTS = `# 公司简介
- 深圳市光大远薄膜有限公司（Shenzhen Guangdayuan Film Co., Ltd.），品牌缩写 GDY，2004 年成立，20+ 年专注 PET 保护膜
- 工厂 16,000 ㎡，十万级 + 千级无尘车间，3 条全自动涂布线，年产能 1.2 亿㎡
- 认证：ISO 9001、ISO 14001、SGS 检测、RoHS、REACH、国家高新技术企业
- 出口 40+ 国家，支持 DDP / DDU；与哈尔滨工业大学共建联合实验室；基材采用日本东丽、东洋纺

# 6 大产品线
1. 硅胶 PET 保护膜：无残胶、低粘高洁净、耐温 −40~150°C
2. 亚克力 PET 保护膜：粘着力 5–1500 g/in、透光率 ≥91%
3. PU 胶 PET 保护膜：千级无尘室生产、超洁净贴合、零残胶
4. 防静电 PET 保护膜：表面电阻 10⁸–10¹¹ Ω、防静电持续 ≥12 个月
5. 耐高温 PET 保护膜：耐温 200°C+、喷涂/电镀不脱落
6. 高透 PET 保护膜：透光率 ≥95%、光学级平整度

# 可定制参数
厚度 25–300 μm；幅宽最大 1,600 mm；粘着力 1–1500 g/in；可选防静电 / 抗UV / 耐高温 / 阻燃

# 参考价格
未公布。若客户询问价格，说明取决于规格、数量与贸易条款，并转人工。`;

export function buildSystemPrompt(locale?: string): string {
  const l = normalizeLocale(locale);
  const kb = renderKnowledge(l).trim();
  const body = kb || FALLBACK_FACTS;

  return `你是深圳市光大远薄膜有限公司（GDY / Shenzhen Guangdayuan Film Co., Ltd.）官方的 AI 业务助手。${LANG_LINE[l] || LANG_LINE.en}

# 行为规则（最高优先级）
1. 只能使用下方「知识库」中的信息回答客户。知识库没有的内容，直接说明不确定并转人工，严禁编造。
2. 价格：只能引用知识库中的「参考区间」，原样使用其币种与单位；不得换算汇率、不得插值或外推、不得报出精确单价。客户索要精确单价或正式报价单时：给出区间，并立即转人工。
3. 若知识库标注价格未公布（not published），不要猜测任何数字，说明价格取决于规格、数量与贸易条款，并转人工。
4. 主动收集这些信息：产品类型、厚度、幅宽、粘着力、数量、目标国家、贸易条款。建议客户先申请免费样品测试。
5. 当客户通过「需求登记」表单提交（消息以 [询盘登记] 或 [Inquiry] 开头）时，将其视为正式询盘登记请求：先复述并确认客户已填的参数（含产品，可能为客户手写的自定义需求），再礼貌询问缺失的关键信息（应用场景 / 行业、数量、目标国家、交期）；整理成一段清晰的结构化询盘摘要（使用客户语言），并**原样转述客户留下的姓名 / 公司 / 邮箱 / 电话等联系方式**，明确说明「最终价格需根据规格由销售正式报价，我们会按您留下的联系方式尽快与您对接」。**不得输出任何价格数字或区间。**
6. 知识库只有中英文。若客户使用其它语言，请先理解知识库的英文内容，再自行翻译为该语言作答。
7. 语气简洁、专业、友好。

# 转人工规则
出现下列任一情况时，在回答末尾**单独一行**输出标记 ${HANDOFF_MARKER}：
- 需要正式报价单 / 合同 / 付款方式 / 账期 / 发票
- 复杂定制、特殊规格、大批量议价
- 投诉、索赔、退货
- 你不确定，或知识库中没有答案
该标记不要加粗、不要加标点、不要写进句子中间。

# 知识库
${body}`;
}

// ---------- AI 写稿（后台一键发文用） ----------

export const NEWS_LOCALES = ["en", "zh", "vi", "th", "id", "ms", "ar"] as const;
export type NewsLocale = (typeof NEWS_LOCALES)[number];

export const NEWS_COVERS = [
  "/images/facility-line.jpg",
  "/images/facility-film.jpg",
  "/images/hero-factory.jpg",
  "/images/app-building.jpg",
  "/images/app-electronics.jpg",
  "/images/app-home.jpg",
  "/images/prod-silicone.jpg",
  "/images/prod-acrylic.jpg",
  "/images/prod-pu.jpg",
  "/images/prod-antistatic.jpg",
  "/images/prod-hightemp.jpg",
  "/images/prod-clear.jpg",
] as const;

export interface GeneratedNews {
  slug: string;
  category: "company" | "industry";
  cover: string;
  source: string;
  title: Record<NewsLocale, string>;
  excerpt: Record<NewsLocale, string>;
  body: Record<NewsLocale, string[]>;
}

// 调用大模型生成一篇 7 语言新闻稿（结构化 JSON）。无 key / 上游错误时抛错。
export async function generateNewsArticle(
  topic: string,
  category: "company" | "industry"
): Promise<GeneratedNews> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error("LLM_API_KEY 未配置，无法生成文章。");
  }
  const baseUrl = (process.env.LLM_BASE_URL || "https://api.deepseek.com/v1").replace(
    /\/$/,
    ""
  );
  const model = process.env.LLM_MODEL || "deepseek-chat";

  const coverList = NEWS_COVERS.map((c) => `- ${c}`).join("\n");
  const system = `你是深圳市光大远薄膜有限公司（GDY）的内容编辑，负责撰写官网「新闻动态」栏目的多语言稿件。

# 公司背景（务必基于真实信息，不要编造未提供的测试数据 / 精确价格）
- GDY：2004 年成立，16,000㎡ 工厂，3 条全自动涂布线，年产能 1.2 亿㎡，出口 40+ 国家
- 认证：ISO 9001 / 14001、SGS、RoHS、REACH、国家高新技术企业；与哈工大联合实验室
- 6 大产品线：硅胶 / 亚克力 / PU / 防静电 / 耐高温 / 高透 PET 保护膜
- 可定制：厚度 25–300μm、幅宽最大 1600mm、粘着力 1–1500 g/in
- 服务行业：电子、汽车、新能源、建材、家电、五金；东南亚标准品 7 天发货

# 任务
围绕主题写一篇专业、简洁、面向 B2B 买家的新闻稿，语气自信、可信。
可用的封面图（必须从下面挑一个真实存在的路径）：
${coverList}

# 输出要求（严格返回 JSON，不要多余文字）
{
  "slug": "英文小写短横线 slug，全局唯一，如 new-coating-line",
  "category": "${category}",
  "cover": "从封面图列表选一个最贴切的路径",
  "source": "如有引用来源填 URL，没有则留空字符串",
  "title": { "en":"","zh":"","vi":"","th":"","id":"","ms":"","ar":"" },
  "excerpt": { "en":"","zh":"","vi":"","th":"","id":"","ms":"","ar":"" },
  "body": { "en":["段落1","段落2","段落3"], "zh":[...], "vi":[...], "th":[...], "id":[...], "ms":[...], "ar":[...] }
}
- 每种语言 3–5 个正文段落，信息一致、本地化自然（越南语带正确声调、阿拉伯语 RTL 正常）。
- 标题 ≤ 90 字符，摘要 ≤ 160 字符，要抓眼球但不夸张。
- slug 只含小写字母、数字和短横线。`;

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `请基于以上背景，写一篇关于「${topic}」的新闻稿。` },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    }),
  });

  if (!upstream.ok) {
    let detail = "";
    try {
      const err = await upstream.json();
      detail = err?.error?.message || "";
    } catch {
      /* ignore */
    }
    throw new Error(
      `DeepSeek 调用失败（${upstream.status}）：${detail || upstream.statusText}`
    );
  }

  const data = await upstream.json();
  const content: string = data?.choices?.[0]?.message?.content || "";
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI 返回内容不是合法 JSON，请重试。");
  }
  return normalizeGeneratedNews(parsed, category);
}

// 校验 + 规整 AI 输出，确保 7 语言齐全、字段合法，避免脏数据写入仓库。
function normalizeGeneratedNews(raw: any, category: "company" | "industry"): GeneratedNews {
  const locales = NEWS_LOCALES;
  const title: any = {};
  const excerpt: any = {};
  const body: any = {};
  for (const l of locales) {
    const lt = raw?.title?.[l];
    const le = raw?.excerpt?.[l];
    const lb = raw?.body?.[l];
    title[l] = typeof lt === "string" && lt.trim() ? lt.trim() : (raw?.title?.en ?? "");
    excerpt[l] = typeof le === "string" && le.trim() ? le.trim() : (raw?.excerpt?.en ?? "");
    body[l] = Array.isArray(lb)
      ? lb.filter((p: any) => typeof p === "string" && p.trim()).map((p: string) => p.trim())
      : [];
    if (body[l].length === 0 && Array.isArray(raw?.body?.en)) {
      body[l] = raw.body.en.filter((p: any) => typeof p === "string");
    }
  }
  let slug =
    typeof raw?.slug === "string" && raw.slug.trim()
      ? raw.slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      : `post-${Date.now()}`;
  const coverOk = (NEWS_COVERS as readonly string[]).includes(raw?.cover);
  const cover = coverOk ? raw.cover : NEWS_COVERS[0];
  return {
    slug,
    category: category === "industry" ? "industry" : "company",
    cover,
    source: typeof raw?.source === "string" ? raw.source : "",
    title,
    excerpt,
    body,
  };
}

// 无 API key / 上游故障时的本地降级应答（基于关键词），保证 UI 始终可用、不报错。
export function localReply(userText: string, locale?: string): string {
  const l = normalizeLocale(locale);
  const zh = l === "zh";
  const t = (userText || "").toLowerCase();

  if (/(price|quote|cost|报价|价格|多少钱|how much|rate)/.test(t)) {
    return zh
      ? "关于报价：我们的 PET 保护膜支持全参数定制（厚度 25–300μm、幅宽最大 1600mm、粘着力 1–1500 g/in）。参考价格区间取决于规格、数量与贸易条款，精确单价需正式报价单确认。\n\n为快速报价，请告诉我：产品类型、厚度、幅宽、粘着力、数量与目标国家。也可直接通过 WhatsApp / 微信联系我们的销售团队获取正式报价。"
      : "On pricing: our PET protective films are fully customizable (thickness 25–300 µm, width up to 1,600 mm, adhesion 1–1,500 g/in). Reference price ranges depend on specification, quantity and trade terms; an exact unit price requires a formal quotation.\n\nFor a fast quote, please tell me: product type, thickness, width, adhesion, quantity and destination country. You can also reach our sales team directly via WhatsApp or WeChat for a formal quotation.";
  }
  if (/(moq|起订|minimum order|最小订单)/.test(t)) {
    return zh
      ? "起订量（MOQ）：常规规格 500 m² 起；全定制参数（粘着力、幅宽、印刷）通常 2,000–5,000 m²，取决于涂布幅宽。欢迎告知您的产品类型与预估用量，我们可先寄免费样品测试。"
      : "Minimum order quantity (MOQ): standard specifications start from 500 m²; fully customized parameters (adhesion, width, printing) typically require 2,000–5,000 m² depending on coating width. Tell us your product type and estimated volume — we can start with free samples for testing.";
  }
  if (/(sample|样品|免费样|免费样品)/.test(t)) {
    return zh
      ? "我们提供免费样品：您提供目标规格（类型、厚度、幅宽、粘着力等），确认后寄出样品，测试通过再批量生产。常规产品免样品费，快递费由客户承担。请通过 WhatsApp / 微信留下收货信息安排寄样。"
      : "We offer a free sample program for standard products: send us your target specification (type, thickness, width, adhesion), and we will ship samples for you to test residue, adhesion and clarity before ordering. Samples are free; courier cost is covered by the customer. Please leave your shipping details via WhatsApp or WeChat.";
  }
  if (/(industr|行业|application|应用|电子|汽车|新能源|建材|家电)/.test(t)) {
    return zh
      ? "我们服务的六大行业：电子 / 消费电子、汽车、新能源（太阳能板 / 锂电池 / EV）、建材（铝型材 / 不锈钢 / 玻璃 / 石材）、家电、五金。六大产品线的核心特性可参考网站「产品」页面，更具体的选型建议请联系我们的工程师。"
      : "We serve six major industries: electronics / consumer electronics, automotive, new energy (solar panels / lithium batteries / EV), building materials (aluminium profiles / stainless steel / glass / stone), home appliances, and hardware. Core features of our six product lines are described on the Products page — for detailed selection advice, please contact our engineers.";
  }
  if (/(cert|认证|iso|rohs|reach|sgs)/.test(t)) {
    return zh
      ? "我们已通过 ISO 9001、ISO 14001 体系认证，产品通过 SGS 检测，符合 RoHS、REACH，并获评国家高新技术企业。可提供相关证书文件，请通过 WhatsApp / 微信索取。"
      : "We are ISO 9001 and ISO 14001 certified, with SGS testing, RoHS and REACH compliance, and recognized as a National High-Tech Enterprise. Certificate copies are available on request via WhatsApp or WeChat.";
  }
  return zh
    ? "您好，我是 GDY 的 AI 业务助手。我可以为您介绍公司简介、PET 保护膜产品线（硅胶 / 亚克力 / PU / 防静电 / 耐高温 / 高透）、服务能力、行业应用与参考价格区间。\n\n当前为离线模式（未配置 AI 密钥），仅能基础应答。如需正式报价、复杂定制或样品，请通过 WhatsApp / 微信联系我们的销售团队。"
    : "Hello, I am GDY's AI Business Assistant. I can tell you about our company, our PET protective film product lines (silicone / acrylic / PU / anti-static / high-temperature / high-clarity), our capabilities, industry applications and reference price ranges.\n\nI am currently in offline mode (no AI key configured), so answers are limited. For a formal quotation, complex customization or samples, please contact our sales team via WhatsApp or WeChat.";
}
