#!/usr/bin/env node
/**
 * 文章发布器 —— 校验 + 提交到 GitHub，触发 Vercel 自动部署。
 *
 * 用法：
 *   node scripts/publish-article.mjs content/news/xxx.md            # 校验并发布
 *   node scripts/publish-article.mjs content/news/xxx.md --check    # 只校验，不提交
 *
 * 依赖环境变量（写在 /workspace/.env.local 或 shell env）：
 *   GITHUB_TOKEN   fine-grained PAT，需该仓库 Contents: Read and write
 *   GITHUB_REPO    owner/repo，如 fantasia01121-spec/gdyfilm-website
 *   GITHUB_BRANCH  默认 main
 *
 * 退出码：0 成功 / 1 校验失败或提交失败
 */

import fs from "node:fs";
import path from "node:path";

const LOCALES = ["en", "zh", "vi", "th", "id", "ms", "ar"];
const MIN_PARAS = 5; // 每个语种至少段落数

// ---------- 读取凭据 ----------
// 优先级：shell 环境变量 > ./.env.local > /workspace/.env.local > ~/.gdy/env
// （定时任务若在全新沙箱执行，源码 clone 下来不含 .env.local，靠 ~/.gdy/env 兜底）
function loadEnvFile(p) {
  if (!fs.existsSync(p)) return false;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
  return true;
}

function loadEnv() {
  const candidates = [
    path.join(process.cwd(), ".env.local"),
    "/workspace/.env.local",
    path.join(process.env.HOME || "/root", ".gdy", "env"),
    "/root/.gdy/env",
  ];
  for (const p of candidates) loadEnvFile(p);
}
loadEnv();

// ---------- 极简 YAML frontmatter 解析（只覆盖本项目用到的结构） ----------
function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) throw new Error("缺少 frontmatter（文件必须以 --- 开头）");
  const end = raw.indexOf("\n---", 3);
  if (end === -1) throw new Error("frontmatter 未闭合（缺少结尾 ---）");
  const yaml = raw.slice(3, end).replace(/^\n/, "");
  const bodyMd = raw.slice(end + 4);

  const data = { title: {}, excerpt: {}, body: {} };
  let section = null;      // title | excerpt | body
  let lang = null;         // en / zh / ...
  let inArray = false;

  const unq = (s) => {
    let v = s.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  };

  for (const line of yaml.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    // 顶级键
    const top = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (top) {
      const [, key, rest] = top;
      if (key === "title" || key === "excerpt" || key === "body") {
        section = key;
        lang = null;
        inArray = false;
        continue;
      }
      data[key] = unq(rest);
      section = null;
      continue;
    }

    // 二级：语言键
    const lvl2 = line.match(/^  ([a-z]{2}):\s*(.*)$/);
    if (lvl2 && section) {
      const [, lc, rest] = lvl2;
      lang = lc;
      if (section === "body") {
        data.body[lc] = [];
        inArray = !rest.trim() || rest.trim() === "[]";
      } else {
        data[section][lc] = rest.trim() === "[]" ? "" : unq(rest);
      }
      continue;
    }

    // 三级：body 段落
    const lvl3 = line.match(/^    -\s*(.*)$/);
    if (lvl3 && section === "body" && lang) {
      const t = unq(lvl3[1]);
      if (t) data.body[lang].push(t);
      continue;
    }
  }
  return { data, bodyMd };
}

// ---------- 校验 ----------
async function validate(file) {
  const errors = [];
  const warnings = [];
  const raw = fs.readFileSync(file, "utf8");
  const { data, bodyMd } = parseFrontmatter(raw);

  if (!data.slug) errors.push("缺少 slug");
  if (!/^[a-z0-9-]+$/.test(data.slug || "")) errors.push(`slug 只能用小写字母、数字、连字符：${data.slug}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date || "")) errors.push(`date 格式应为 YYYY-MM-DD：${data.date}`);
  // 日期不得晚于今天（提前发布不能写未来日期，Google 视为异常 datePublished）
  // ⚠️ 不用系统时钟（沙箱时钟可能不准），以 GitHub 服务器响应时间为准，按北京时间取日期
  if (/^\d{4}-\d{2}-\d{2}$/.test(data.date || "")) {
    let realNow;
    try {
      const res = await fetch("https://api.github.com/zen", { method: "GET" });
      realNow = new Date(res.headers.get("date"));
      if (isNaN(realNow.getTime())) throw new Error("no date header");
    } catch {
      realNow = new Date(); // 网络失败时退回系统时间
    }
    const bj = new Date(realNow.getTime() + 8 * 3600 * 1000);
    const tzToday = bj.toISOString().slice(0, 10);
    if (data.date > tzToday) errors.push(`date 不能晚于今天（${tzToday}），当前值 ${data.date}。提前发布的文章 date 必须写发布当天`);
  }
  if (!["company", "industry"].includes(data.category)) errors.push(`category 必须是 company 或 industry：${data.category}`);

  for (const lc of LOCALES) {
    const t = data.title[lc];
    const e = data.excerpt[lc];
    const b = data.body[lc] || [];
    if (!t) errors.push(`title.${lc} 缺失`);
    if (!e) errors.push(`excerpt.${lc} 缺失`);
    if (b.length < MIN_PARAS) errors.push(`body.${lc} 只有 ${b.length} 段，至少 ${MIN_PARAS} 段`);
    if (lc === "en" && t && t.length > 75) warnings.push(`title.en ${t.length} 字符，建议 ≤ 70（搜索结果会截断）`);
    if (lc === "en" && e && (e.length < 100 || e.length > 190)) warnings.push(`excerpt.en ${e.length} 字符，建议 110~175`);
  }

  // 与已有文章重复检查（排除当前文件自身）
  const dir = path.join(process.cwd(), "content", "news");
  const self = path.basename(file);
  if (fs.existsSync(dir)) {
    const others = fs.readdirSync(dir)
      .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== self)
      .map((f) => f.replace(/\.md$/, ""));
    if (others.includes(data.slug)) {
      errors.push(`slug 已被其他文章占用：${data.slug}（换一个 slug）`);
    }
    // 封面撞图检查：与其他文章用同一张 cover 会在新闻列表里看起来像重复文章
    if (data.cover) {
      for (const f of fs.readdirSync(dir)) {
        if (!f.endsWith(".md") || f.startsWith("_") || f === self) continue;
        const m = fs.readFileSync(path.join(dir, f), "utf8").match(/^cover:\s*(\S+)/m);
        if (m && m[1] === data.cover) {
          warnings.push(`封面图与 ${f.replace(/\.md$/, "")} 重复（${data.cover}），列表页会像重复文章，建议换一张`);
        }
      }
    }

    // 日期节奏检查：新闻列表按 date 倒序排列，同一天堆多篇会看起来像批量灌水
    if (/^\d{4}-\d{2}-\d{2}$/.test(data.date || "")) {
      const dates = [];
      for (const f of fs.readdirSync(dir)) {
        if (!f.endsWith(".md") || f.startsWith("_") || f === self) continue;
        const m = fs.readFileSync(path.join(dir, f), "utf8").match(/^date:\s*"?(\d{4}-\d{2}-\d{2})"?/m);
        if (m) dates.push({ d: m[1], f: f.replace(/\.md$/, "") });
      }
      const sameDay = dates.filter((x) => x.d === data.date);
      if (sameDay.length > 0) {
        warnings.push(`date ${data.date} 已有 ${sameDay.length} 篇（${sameDay.map((x) => x.f).join("、")}），列表首屏会堆成同一天，建议错开`);
      }
      // 不允许跳跃：最多比已有最新文章晚 1 天。防止时钟不准或照抄排期导致日期往后跳
      if (dates.length) {
        const maxD = dates.map((x) => x.d).sort().pop();
        const next = new Date(`${maxD}T00:00:00Z`);
        next.setUTCDate(next.getUTCDate() + 1);
        const limit = next.toISOString().slice(0, 10);
        if (data.date > limit) {
          // 只警告不拒发：停机几天后补发，日期自然会跳；而真正的未来日期已被上面的规则拦死
          warnings.push(`date ${data.date} 比已有最新文章（${maxD}）跳了多天。若是停机补发属正常，否则请确认没照抄排期`);
        }
      }
    }
  }

  // 内链检查（统计全部语种正文）
  const links = LOCALES.reduce(
    (n, lc) => n + ((data.body[lc] || []).join(" ").match(/\]\(\/[a-z]/g) || []).length,
    0
  );
  if (links < 2) warnings.push(`正文内链 ${links} 条，建议 ≥ 2 条（指向产品页 / 样品页）`);

  return { data, errors, warnings };
}

// ---------- GitHub 提交 ----------
async function publish(file, data) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token) throw new Error("缺少 GITHUB_TOKEN（在 .env.local 里配置）");
  if (!repo) throw new Error("缺少 GITHUB_REPO，格式 owner/repo");

  const target = `content/news/${data.slug}.md`;
  const api = `https://api.github.com/repos/${repo}/contents/${encodeURI(target)}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  // 已存在则取 sha（覆盖）
  let sha;
  const getRes = await fetch(`${api}?ref=${branch}`, { headers });
  if (getRes.ok) {
    sha = (await getRes.json()).sha;
  } else if (getRes.status !== 404) {
    throw new Error(`读取现有文件失败 ${getRes.status}: ${await getRes.text()}`);
  }

  const content = Buffer.from(fs.readFileSync(file, "utf8")).toString("base64");
  const msg = `content: ${data.title.en || data.slug}`;

  const putRes = await fetch(api, {
    method: "PUT",
    headers,
    body: JSON.stringify({ message: msg, content, branch, ...(sha ? { sha } : {}) }),
  });

  if (!putRes.ok) throw new Error(`提交失败 ${putRes.status}: ${await putRes.text()}`);
  const json = await putRes.json();
  return {
    url: json.content?.html_url,
    commit: json.commit?.sha?.slice(0, 7),
    created: !sha,
  };
}

// ---------- 主流程 ----------
const file = process.argv[2];
const checkOnly = process.argv.includes("--check");
if (!file) {
  console.error("用法: node scripts/publish-article.mjs <md文件路径> [--check]");
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`文件不存在: ${file}`);
  process.exit(1);
}

const { data, errors, warnings } = await validate(file);

console.log(`\n📄 ${file}`);
console.log(`   slug: ${data.slug}  date: ${data.date}  category: ${data.category}`);
console.log(`   段落数: ${LOCALES.map((l) => `${l}=${(data.body[l] || []).length}`).join(" ")}`);

if (warnings.length) {
  console.log("\n⚠️  提示：");
  warnings.forEach((w) => console.log("   - " + w));
}

if (errors.length) {
  console.log("\n❌ 校验未通过：");
  errors.forEach((e) => console.log("   - " + e));
  process.exit(1);
}

console.log("\n✅ 校验通过");

if (checkOnly) {
  console.log("（--check 模式，未提交）");
  process.exit(0);
}

try {
  const r = await publish(file, data);
  console.log(`\n🚀 已提交 ${r.created ? "新增" : "更新"} → commit ${r.commit}`);
  console.log(`   Vercel 将在 1~2 分钟内自动部署`);
  console.log(`   https://www.gdyfilm.com/en/news/${data.slug}`);
} catch (e) {
  console.error("\n❌ 发布失败：" + e.message);
  process.exit(1);
}
