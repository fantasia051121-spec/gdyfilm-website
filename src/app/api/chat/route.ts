import { NextRequest } from "next/server";
import {
  buildSystemPrompt,
  localReply,
  needsHandoff,
  normalizeLocale,
  HANDOFF_MARKER,
  HANDOFF_RE,
} from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

type Frame = { t: "d"; v: string } | { t: "handoff" } | { t: "end" };

/** 标记长度 - 1：末尾最多悬挂这么多字符，避免把半个标记吐给客户端造成闪烁 */
const MARKER = HANDOFF_MARKER;
const MARKER_LC = MARKER.toLowerCase();

/** 找出 str 末尾最长的、恰好是标记前缀的片段长度（可能是还没吐完的半个标记） */
function markerPrefixSuffixLength(str: string): number {
  const max = Math.min(MARKER.length - 1, str.length);
  for (let len = max; len > 0; len--) {
    if (MARKER_LC.startsWith(str.slice(str.length - len).toLowerCase())) return len;
  }
  return 0;
}

export async function POST(req: NextRequest) {
  let messages: { role: string; content: string }[] = [];
  let rawLocale: string | undefined;
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
    rawLocale = typeof body?.locale === "string" ? body.locale : undefined;
  } catch {
    messages = [];
  }

  const locale = normalizeLocale(rawLocale);
  const encoder = new TextEncoder();
  const frame = (o: Frame) => encoder.encode(JSON.stringify(o) + "\n");
  const ndjsonHeaders = {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
  };

  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content || "";

  // 一次性返回（降级路径）：先是正文帧，再是控制帧，客户端逻辑统一。
  const respondOnce = (text: string, handoff: boolean) =>
    new Response(
      new ReadableStream({
        start(c) {
          c.enqueue(frame({ t: "d", v: text }));
          c.enqueue(frame(handoff ? { t: "handoff" } : { t: "end" }));
          c.close();
        },
      }),
      { headers: ndjsonHeaders }
    );

  // 降级：未配置 API key
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return respondOnce(localReply(lastUser, locale), needsHandoff(lastUser));
  }

  const baseUrl = (process.env.LLM_BASE_URL || "https://api.deepseek.com/v1").replace(
    /\/$/,
    ""
  );
  const model = process.env.LLM_MODEL || "deepseek-chat";

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: buildSystemPrompt(locale) }, ...messages],
        stream: true,
        temperature: 0.3,
      }),
    });
  } catch {
    return respondOnce(localReply(lastUser, locale), needsHandoff(lastUser));
  }

  // 上游失败也降级，避免白屏。
  if (!upstream.ok || !upstream.body) {
    const prefix =
      locale === "zh"
        ? "（AI 服务暂时不可用，已切换为基础应答）\n\n"
        : "(The AI service is temporarily unavailable — switched to basic answers.)\n\n";
    return respondOnce(prefix + localReply(lastUser, locale), needsHandoff(lastUser));
  }

  const reader = upstream.body.getReader();
  // 关键词兜底：模型即便忘了打标记，命中这些词也会转人工。
  let handoff = needsHandoff(lastUser);
  let tail = "";

  const stream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      let buffer = "";

      const push = (chunk: string) => {
        const joined = tail + chunk;
        HANDOFF_RE.lastIndex = 0;
        const cleaned = joined.replace(HANDOFF_RE, "");
        if (cleaned !== joined) handoff = true;

        // 末尾若疑似半个标记，先悬挂住，等下一个分片再决定
        const hold = markerPrefixSuffixLength(cleaned);
        const emit = cleaned.slice(0, cleaned.length - hold);
        tail = cleaned.slice(cleaned.length - hold);
        if (emit) controller.enqueue(frame({ t: "d", v: emit }));
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const delta: string =
                JSON.parse(data)?.choices?.[0]?.delta?.content || "";
              if (delta) push(delta);
            } catch {
              // 忽略不完整分片
            }
          }
        }
      } catch {
        // 流式中断不影响已输出内容
      } finally {
        // 流结束：残留的 tail 若是没吐完的标记，视为转人工且不显示
        if (tail) {
          const isPartial =
            tail.length < MARKER.length &&
            MARKER_LC.startsWith(tail.toLowerCase());
          if (isPartial) handoff = true;
          else controller.enqueue(frame({ t: "d", v: tail }));
        }
        controller.enqueue(frame(handoff ? { t: "handoff" } : { t: "end" }));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: ndjsonHeaders });
}
