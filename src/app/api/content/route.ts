import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { commitFile, githubConfigured } from "@/lib/github";
import { LOCALES } from "@/lib/content";
import { validateKnowledge } from "@/lib/knowledge";
import { validateProducts } from "@/lib/products";

const CONTENT_DIR = path.join(process.cwd(), "content");
const MESSAGES_DIR = path.join(process.cwd(), "src", "messages");

const CONTENT_FILES: Record<string, string> = {
  company: "company.json",
  faq: "faq.json",
  knowledge: "knowledge.json",
  products: "products.json",
};

/** 含敏感信息（价格表）的类型：GET 也需要后台密码 */
const PROTECTED_GET = new Set(["knowledge"]);

function readJson(p: string) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function writeJson(p: string, obj: unknown) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

/** 密码校验：未配置 ADMIN_PASSWORD 时一律失败（fail-closed） */
function checkPw(pw: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !pw) return false;
  return pw.length === expected.length && pw === expected;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";

  if (Object.hasOwn(CONTENT_FILES, type)) {
    // 价格表等敏感内容：必须带后台密码才能读取
    if (PROTECTED_GET.has(type) && !checkPw(req.headers.get("x-admin-password"))) {
      return NextResponse.json({ error: "需要后台密码" }, { status: 401 });
    }
    const p = path.join(CONTENT_DIR, CONTENT_FILES[type]);
    if (!fs.existsSync(p)) return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    return NextResponse.json({ data: readJson(p) });
  }

  if (type === "messages") {
    const namespace = searchParams.get("namespace");
    if (!namespace) return NextResponse.json({ error: "缺少 namespace" }, { status: 400 });
    const out: Record<string, unknown> = {};
    for (const loc of LOCALES) {
      const p = path.join(MESSAGES_DIR, `${loc}.json`);
      const d = readJson(p);
      out[loc] = d[namespace];
    }
    return NextResponse.json({ namespace, data: out });
  }

  return NextResponse.json({ error: "未知 type" }, { status: 400 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "请求体无效" }, { status: 400 });

  const password = body.password as string;
  if (!checkPw(password)) {
    return NextResponse.json(
      { error: !process.env.ADMIN_PASSWORD ? "后台未启用：未配置 ADMIN_PASSWORD。" : "密码错误" },
      { status: 401 }
    );
  }

  const type = body.type as string;

  try {
    // 1) content/*.json（company / faq / knowledge）
    if (Object.hasOwn(CONTENT_FILES, type)) {
      const file = CONTENT_FILES[type];

      // 知识库结构校验：脏数据会直接把 AI 提示词搞崩，必须拦在写入之前
      if (type === "knowledge") {
        const err = validateKnowledge(body.data);
        if (err) return NextResponse.json({ error: "知识库数据校验失败：" + err }, { status: 400 });
      }

      // 产品目录：除了结构校验，还会拦截任何价格类字段 ——
      // products.json 会随页面渲染发到浏览器，价格绝不能出现在这里。
      if (type === "products") {
        const err = validateProducts(body.data);
        if (err) return NextResponse.json({ error: "产品目录数据校验失败：" + err }, { status: 400 });
      }

      const content = JSON.stringify(body.data, null, 2) + "\n";

      // 先提交 GitHub：Vercel 等生产环境的文件系统是只读的，
      // 若先写本地会抛 EROFS，导致既没保存也没提交。
      if (githubConfigured()) {
        const res = await commitFile(`content/${file}`, content, `${type}: update via admin`);
        try {
          writeJson(path.join(CONTENT_DIR, file), body.data); // 本地同步（仅开发环境有意义）
        } catch {
          /* 生产环境只读，忽略 */
        }
        return NextResponse.json({
          ok: true,
          mode: "github",
          commitUrl: res.commitUrl,
          note: "已提交 GitHub，Vercel 将自动重建上线（约 1–2 分钟）。",
        });
      }

      try {
        writeJson(path.join(CONTENT_DIR, file), body.data);
      } catch {
        return NextResponse.json(
          {
            error:
              "本地文件写入失败：生产环境文件系统只读。请配置 GITHUB_TOKEN 与 GITHUB_REPO 后重试。",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({
        ok: true,
        mode: "local",
        note: "已写入本地（未配置 GitHub，仅开发机可见）。",
      });
    }

    // 2) messages 命名空间（services / cases / advantages / hero ...）
    if (type === "messages") {
      const ns = body.namespace as string;
      const data = body.data as Record<string, unknown>;
      if (!ns || !data) return NextResponse.json({ error: "缺少 namespace 或 data" }, { status: 400 });

      const committed: string[] = [];
      for (const loc of LOCALES) {
        const p = path.join(MESSAGES_DIR, `${loc}.json`);
        const d = readJson(p);
        d[ns] = data[loc] ?? d[ns];
        writeJson(p, d);
        committed.push(`${loc}.json`);
      }
      const res = await commitFile(
        `src/messages/${LOCALES[0]}.json`,
        JSON.stringify(readJson(path.join(MESSAGES_DIR, `${LOCALES[0]}.json`)), null, 2) + "\n",
        `content: update ${ns} via admin`
      );
      if (res.mode === "disabled") {
        return NextResponse.json({
          ok: true,
          mode: "local",
          note: `已写入本地 ${committed.join(", ")}（未配置 GitHub，仅开发机可见）。`,
        });
      }
      return NextResponse.json({
        ok: true,
        mode: "github",
        commitUrl: res.commitUrl,
        note: "已提交 GitHub，Vercel 将自动重建上线。",
      });
    }

    return NextResponse.json({ error: "未知 type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "保存失败：" + (err?.message || err) },
      { status: 500 }
    );
  }
}
