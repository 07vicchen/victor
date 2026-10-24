// 維拓 AI 客服 — 共用工具（10/25 起：對話用 Claude，向量搜尋仍用 Gemini embedding）
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

export const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const GEMINI_KEY = () => {
  const k = Deno.env.get("GEMINI_API_KEY");
  if (!k) throw new Error("缺少 GEMINI_API_KEY");
  return k;
};
const GEMINI = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_CHAT = "gemini-2.5-flash";
export const CHAT_MODEL = Deno.env.get("AICS_CLAUDE_MODEL") ?? "claude-haiku-5-5";

export async function embed(text: string, task: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT") {
  const r = await fetch(`${GEMINI}/gemini-embedding-001:embedContent?key=${GEMINI_KEY()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      taskType: task,
      outputDimensionality: 768,
    }),
  });
  if (!r.ok) throw new Error(`embed ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const v: number[] = j.embedding.values;
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / n);
}

// Gemini 格式的 schema（"OBJECT"/"STRING"）轉成 Claude 用的 JSON Schema
function toJsonSchema(s: any): any {
  if (!s || typeof s !== "object") return s;
  const o: any = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === "type" && typeof v === "string") o.type = v.toLowerCase();
    else if (k === "properties") o.properties = Object.fromEntries(Object.entries(v as any).map(([pk, pv]) => [pk, toJsonSchema(pv)]));
    else if (k === "items") o.items = toJsonSchema(v);
    else o[k] = v;
  }
  return o;
}

async function claudeJSON<T>(system: string, user: string, schema: unknown, tenantId?: string): Promise<T> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("缺少 ANTHROPIC_API_KEY");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: CHAT_MODEL,
      max_tokens: 1200,
      temperature: 0.6,
      system,
      messages: [{ role: "user", content: user }],
      tools: [{ name: "answer", description: "把結果用這個格式交出來", input_schema: toJsonSchema(schema) }],
      tool_choice: { type: "tool", name: "answer" },
    }),
  });
  if (!r.ok) throw new Error(`claude ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const tu = (j.content ?? []).find((c: any) => c.type === "tool_use");
  if (!tu) throw new Error("claude 沒有回傳格式化結果");
  // 記用量（之後後台看每家店花多少）
  try {
    await db.from("aics_ai_usage").insert({
      tenant_id: tenantId ?? null, model: CHAT_MODEL, input_tokens: j.usage?.input_tokens ?? 0, output_tokens: j.usage?.output_tokens ?? 0,
    });
  } catch { /* 表沒建也不影響回覆 */ }
  return tu.input as T;
}

async function geminiJSON<T>(system: string, user: string, schema: unknown): Promise<T> {
  const r = await fetch(`${GEMINI}/${GEMINI_CHAT}:generateContent?key=${GEMINI_KEY()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.6, responseMimeType: "application/json", responseSchema: schema },
    }),
  });
  if (!r.ok) throw new Error(`gemini ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const text = j.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "{}";
  return JSON.parse(text) as T;
}

// 先用 Claude；Claude 掛了才退回 Gemini，客人不會沒人回
export async function generateJSON<T>(system: string, user: string, schema: unknown, tenantId?: string): Promise<T> {
  try {
    return await claudeJSON<T>(system, user, schema, tenantId);
  } catch (e) {
    console.error("Claude 失敗，改用 Gemini：", String(e));
    return await geminiJSON<T>(system, user, schema);
  }
}

// ---------- LINE ----------
export async function verifyLineSignature(secret: string, body: string, sig: string | null) {
  if (!sig) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return b64 === sig;
}

async function line(token: string, path: string, payload?: unknown, method = "POST") {
  const r = await fetch(`https://api.line.me/v2/bot/${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!r.ok) throw new Error(`LINE ${path} ${r.status}: ${await r.text()}`);
  return r.status === 200 && method === "GET" ? r.json() : null;
}
export const lineReply = (token: string, replyToken: string, text: string) =>
  line(token, "message/reply", { replyToken, messages: [{ type: "text", text }] });
export const linePush = (token: string, to: string, text: string) =>
  line(token, "message/push", { to, messages: [{ type: "text", text }] });
export const lineProfile = (token: string, userId: string) =>
  line(token, `profile/${userId}`, undefined, "GET") as Promise<{ displayName?: string } | null>;

export function requireAdmin(req: Request) {
  const k = Deno.env.get("AICS_ADMIN_KEY");
  return !!k && req.headers.get("x-admin-key") === k;
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

// 會被貼的標籤（AI 依對話判斷）
export const TAG_LIST = [
  "asked_price", "asked_franchise", "asked_trainee", "asked_booking", "asked_location",
  "hesitating", "booked", "complaint", "price_sensitive", "skin_concern",
];
