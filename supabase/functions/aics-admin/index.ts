// 維拓 AI 客服 — 官網後台 API（Vic 10/25）
// Vic（07vicchen@gmail.com）看全部店家；店家老闆用自己的信箱登入只看自己那家
// 前端：/ai-kefu-admin（官網），用會員登入的 token 呼叫
import { db, embed, generateJSON, linePush, TAG_LIST } from "./core.ts";

const VIC = "07vicchen@gmail.com";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const out = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const tpeMonthStart = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 7) + "-01T00:00:00+08:00";
const WEBHOOK = (slug: string) => `${Deno.env.get("SUPABASE_URL")}/functions/v1/aics-line-webhook?t=${slug}`;
const DRAFT_MODEL = Deno.env.get("AICS_DRAFT_MODEL") ?? "claude-sonnet-5-5";

type Who = { email: string; admin: boolean; own: string[] };

async function who(req: Request): Promise<Who | null> {
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return null;
  const { data } = await db.auth.getUser(jwt);
  const email = data?.user?.email?.toLowerCase();
  if (!email) return null;
  const { data: ts } = await db.from("aics_tenants").select("id").ilike("owner_email", email);
  return { email, admin: email === VIC, own: (ts ?? []).map((t) => t.id) };
}
const can = (w: Who, tenantId: string) => w.admin || w.own.includes(tenantId);
async function tenantOfContact(contactId: string) {
  const { data } = await db.from("aics_contacts").select("*, aics_tenants(*)").eq("id", contactId).maybeSingle();
  return data;
}

async function count(q: any) { const { count } = await q; return count ?? 0; }

async function stats(t: any) {
  const ms = tpeMonthStart();
  const week = new Date(Date.now() - 7 * 86400_000).toISOString();
  const M = () => db.from("aics_messages").select("id", { count: "exact", head: true }).eq("tenant_id", t.id);
  const C = () => db.from("aics_contacts").select("id", { count: "exact", head: true }).eq("tenant_id", t.id);
  const [replies, deals, handoffs, errors, contacts, newContacts, waiting, pending, know] = await Promise.all([
    count(M().eq("role", "assistant").gte("created_at", ms)),
    count(M().eq("role", "assistant").eq("meta->>deal", "true").gte("created_at", ms)),
    count(M().eq("meta->>handoff", "true").gte("created_at", ms)),
    count(M().eq("content", "[系統錯誤]").gte("created_at", week)),
    count(C()),
    count(C().gte("first_seen_at", ms)),
    count(C().eq("needs_human", true)),
    count(db.from("aics_outbox").select("id", { count: "exact", head: true }).eq("tenant_id", t.id).eq("status", "pending")),
    count(db.from("aics_knowledge").select("id", { count: "exact", head: true }).eq("tenant_id", t.id)),
  ]);
  const { data: last } = await db.from("aics_messages").select("created_at").eq("tenant_id", t.id)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: use } = await db.from("aics_ai_usage").select("input_tokens,output_tokens").eq("tenant_id", t.id).gte("created_at", ms);
  const tok = (use ?? []).reduce((s, u) => ({ i: s.i + u.input_tokens, o: s.o + u.output_tokens }), { i: 0, o: 0 });
  return {
    id: t.id, slug: t.slug, name: t.name, plan: t.plan, ai_enabled: t.ai_enabled,
    line_ok: !!(t.line_channel_secret && t.line_access_token), owner_line_ok: !!t.owner_line_user_id, owner_email: t.owner_email,
    quota: t.monthly_ai_quota, replies, deals, handoffs, errors, contacts, new_contacts: newContacts, waiting, pending,
    knowledge: know, last_at: last?.created_at ?? null, tokens: tok, webhook: WEBHOOK(t.slug),
  };
}

function pub(t: any) {
  const { line_channel_secret, line_access_token, ...rest } = t;
  return { ...rest, line_secret_set: !!line_channel_secret, line_token_set: !!line_access_token, webhook: WEBHOOK(t.slug) };
}

// ---------- 用老闆的對話紀錄＋問卷，讓 Claude 擬人設、問答、話術 ----------
const DRAFT_SCHEMA = {
  type: "OBJECT",
  properties: {
    persona: { type: "STRING" },
    examples: { type: "ARRAY", items: { type: "STRING" } },
    business_hours: { type: "STRING" },
    faqs: { type: "ARRAY", items: { type: "OBJECT", properties: { q: { type: "STRING" }, a: { type: "STRING" } }, required: ["q", "a"] } },
    scripts: { type: "ARRAY", items: { type: "OBJECT", properties: { situation: { type: "STRING" }, how: { type: "STRING" } }, required: ["situation", "how"] } },
    unknowns: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["persona", "examples", "business_hours", "faqs", "scripts", "unknowns"],
};

async function makeDraft(t: any, chat: string, ownerName: string, intake: any) {
  const system = `你在幫一家店設定 LINE AI 客服，讓 AI 回客人時像老闆本人。
你會拿到：老闆跟客人的 LINE 對話紀錄（老闆在對話裡的名字是「${ownerName || "（沒提供，請從對話判斷哪一方是店家）"}」）、店家填的問卷。
請整理出：
1. persona：寫給 AI 看的角色說明（第二人稱「你是…」），300～600 字。要寫出：店名、你是誰、怎麼稱呼客人、口頭禪、句子長短、表情符號習慣、語氣（熱情/直接/溫柔…）、怎麼介紹產品、怎麼報價、客人猶豫時怎麼推、怎麼邀約下一步、什麼話絕對不說。全部從對話裡老闆真的講過的方式歸納，不要自己發明一個個性。
2. examples：從對話裡挑 6～10 句老闆真的講過、最有個人味道的原句（拿掉客人姓名、電話、地址）。
3. business_hours：對話或問卷看得出來的營業時間，沒有就空字串。
4. faqs：客人最常問的問題和老闆實際的回答，15～40 題。答案只能用對話和問卷裡有的事實（價格、地點、流程、注意事項），用老闆的口氣改寫成一則 LINE 回覆。同一題前後說法不一致，用最新的，並寫進 unknowns。
5. scripts：銷售話術，5～15 條。situation 寫客人的狀況（嫌貴、要考慮、比較別家、問效果、第一次來…），how 寫老闆實際怎麼回、怎麼推下一步。
6. unknowns：需要老闆確認的事（價格衝突、對話太少看不出來的、可能過期的優惠），每條一句話。
不要把任何客人的個資寫進結果。`;
  const user = `店名：${t.name}
問卷（JSON）：
${intake ? JSON.stringify(intake.answers ?? {}, null, 1).slice(0, 30000) : "（沒有問卷）"}

LINE 對話紀錄：
${chat || "（沒有對話紀錄）"}`;

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("缺少 ANTHROPIC_API_KEY");
  const tool = { name: "answer", description: "交出整理結果", input_schema: JSON.parse(JSON.stringify(DRAFT_SCHEMA).replace(/"(OBJECT|STRING|ARRAY|BOOLEAN)"/g, (_m, x) => `"${x.toLowerCase()}"`)) };
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: DRAFT_MODEL, max_tokens: 12000, temperature: 0.3, system,
      messages: [{ role: "user", content: user }], tools: [tool], tool_choice: { type: "tool", name: "answer" },
    }),
  });
  if (!r.ok) throw new Error(`claude ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  try {
    await db.from("aics_ai_usage").insert({ tenant_id: t.id, model: DRAFT_MODEL, input_tokens: j.usage?.input_tokens ?? 0, output_tokens: j.usage?.output_tokens ?? 0 });
  } catch { /* */ }
  const tu = (j.content ?? []).find((c: any) => c.type === "tool_use");
  if (!tu) throw new Error("AI 沒有交出結果，請再試一次");
  return tu.input;
}

// ---------- 試聊（不經過 LINE，用跟正式一樣的規則） ----------
async function testReply(t: any, text: string, history: { role: string; content: string }[]) {
  const qv = await embed(text, "RETRIEVAL_QUERY");
  const { data: hits } = await db.rpc("aics_match_knowledge", { p_tenant: t.id, p_embedding: qv, p_count: 5 });
  const knowledge = (hits ?? []).filter((h: any) => h.similarity > 0.45)
    .map((h: any, i: number) => `【資料${i + 1}${h.title ? "｜" + h.title : ""}】\n${h.content}`).join("\n\n");
  const hist = (history ?? []).slice(-10).map((m) => `${m.role === "user" ? "客人" : "店家"}：${m.content}`).join("\n");
  const system = `${t.persona}

規則：
- 只能根據「店家資料」回答；資料沒有的事情不要猜，說會幫忙問、晚點回覆。
- 不承諾任何資料上沒有的優惠、折扣或療效。
- 回覆像真人打字：短、口語、可以用 1 個表情符號，不要條列、不要「親愛的顧客」這種客服腔。
- 客人認真問「你是不是機器人／AI」→ 老實說是店裡的 AI 小幫手，需要的話可以幫他轉真人。
- 你同時是這家店的業務：店家資料裡有「銷售話術」就照著用。客人問價格、猶豫、比較時，先回答，再用店家的說法處理疑慮，最後自然地邀約預約或下一步。一次只推一步，客人說不要就停。
- 優惠只能講資料上有的；客人要求額外折扣、議價 → 說幫他問老闆，handoff = true。
- 客人情緒不好、要客訴、要退款、說做完不舒服、或問題你明顯處理不了 → handoff = true。
- deal：客人明確答應了（約好時間、說要買/報名）才是 true。
${t.business_hours ? "營業時間：" + t.business_hours : ""}`;
  const user = `店家資料：\n${knowledge || "（這題沒有找到相關資料）"}\n\n之前的對話：\n${hist || "（第一次聊天）"}\n\n客人現在說：${text}`;
  const o = await generateJSON<any>(system, user, {
    type: "OBJECT",
    properties: {
      reply: { type: "STRING" }, tags: { type: "ARRAY", items: { type: "STRING", enum: TAG_LIST } },
      handoff: { type: "BOOLEAN" }, deal: { type: "BOOLEAN" },
    },
    required: ["reply", "tags", "handoff", "deal"],
  }, t.id);
  return { ...o, sources: (hits ?? []).filter((h: any) => h.similarity > 0.45).map((h: any) => h.title || h.content.slice(0, 20)) };
}

async function addKnowledge(tenantId: string, items: { title?: string; content: string; source?: string }[]) {
  let added = 0; const errors: string[] = [];
  for (const it of items) {
    const content = String(it.content ?? "").trim().slice(0, 2000);
    if (!content) continue;
    try {
      const v = await embed(`${it.title ?? ""}\n${content}`, "RETRIEVAL_DOCUMENT");
      const { error } = await db.from("aics_knowledge").insert({ tenant_id: tenantId, title: it.title?.slice(0, 120) ?? null, content, source: it.source?.slice(0, 40) ?? "後台", embedding: v });
      if (error) throw error;
      added++;
    } catch (e) { errors.push(String(e).slice(0, 120)); }
  }
  return { added, errors };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return out({ error: "只接受 POST" }, 405);
  const w = await who(req);
  if (!w) return out({ error: "請先登入" }, 401);
  const b = await req.json().catch(() => ({}));
  const A = b.action;

  try {
    if (A === "me") {
      const q = db.from("aics_tenants").select("id,slug,name").order("created_at");
      const { data } = w.admin ? await q : await q.in("id", w.own.length ? w.own : ["00000000-0000-0000-0000-000000000000"]);
      return out({ ok: true, email: w.email, admin: w.admin, tenants: data ?? [] });
    }

    if (A === "overview") {
      const q = db.from("aics_tenants").select("*").order("created_at");
      const { data } = w.admin ? await q : await q.in("id", w.own.length ? w.own : ["00000000-0000-0000-0000-000000000000"]);
      return out({ ok: true, rows: await Promise.all((data ?? []).map(stats)) });
    }

    // ===== 只有 Vic =====
    if (["tenant_create", "tenant_save", "draft", "draft_apply", "knowledge_add", "knowledge_del", "intakes"].includes(A) && !w.admin) {
      return out({ error: "只有維拓管理員能做這件事" }, 403);
    }

    if (A === "intakes") {
      const { data } = await db.from("aics_intake").select("id,store_name,contact_name,status,service,submitted_at,created_at")
        .neq("status", "archived").order("created_at", { ascending: false }).limit(100);
      return out({ ok: true, rows: data ?? [] });
    }

    if (A === "tenant_create") {
      const name = String(b.name ?? "").trim().slice(0, 60);
      const slug = String(b.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
      if (!name || slug.length < 3) return out({ error: "店名要填，代號至少 3 個英文或數字" }, 400);
      const { data: t, error } = await db.from("aics_tenants").insert({
        name, slug, persona: `你是「${name}」的小編，說話親切、簡短。`, ai_enabled: false,
        intake_id: b.intake_id || null, owner_email: b.owner_email ? String(b.owner_email).trim().toLowerCase() : null,
      }).select("*").single();
      if (error) return out({ error: error.message.includes("duplicate") ? "這個代號有人用了，換一個" : error.message }, 400);
      // 主動關心規則：照第一家的範本複製一份，先全部關掉，等老闆確認再開
      const { data: tpl } = await db.from("aics_rules").select("*").order("created_at").limit(20);
      const first = (tpl ?? []).filter((r) => r.tenant_id === tpl![0].tenant_id);
      if (first.length) {
        await db.from("aics_rules").insert(first.map(({ id: _i, tenant_id: _t, created_at: _c, ...r }) => ({ ...r, tenant_id: t.id, active: false, auto_send: false })));
      }
      return out({ ok: true, tenant: pub(t) });
    }

    if (A === "tenant_get") {
      if (!can(w, b.id)) return out({ error: "沒有權限" }, 403);
      const { data: t } = await db.from("aics_tenants").select("*").eq("id", b.id).single();
      const { data: rules } = await db.from("aics_rules").select("id,name,kind,trigger_type,trigger_days,trigger_tag,message_hint,auto_send,active").eq("tenant_id", b.id).order("created_at");
      return out({ ok: true, tenant: pub(t), rules: rules ?? [], stats: await stats(t) });
    }

    if (A === "tenant_save") {
      const p: Record<string, unknown> = {};
      for (const k of ["name", "persona", "business_hours", "plan", "note", "owner_line_user_id"]) if (typeof b[k] === "string") p[k] = b[k].slice(0, k === "persona" ? 6000 : 2000);
      if (typeof b.owner_email === "string") p.owner_email = b.owner_email.trim().toLowerCase() || null;
      if (typeof b.ai_enabled === "boolean") p.ai_enabled = b.ai_enabled;
      for (const k of ["max_turns_per_day", "monthly_ai_quota", "monthly_push_quota"]) if (Number.isFinite(+b[k]) && b[k] !== "" && b[k] != null) p[k] = Math.max(0, Math.round(+b[k]));
      if (Array.isArray(b.handoff_keywords)) p.handoff_keywords = b.handoff_keywords.map(String).filter(Boolean).slice(0, 30);
      if (typeof b.line_channel_secret === "string" && b.line_channel_secret.trim()) p.line_channel_secret = b.line_channel_secret.trim();
      if (typeof b.line_access_token === "string" && b.line_access_token.trim()) p.line_access_token = b.line_access_token.trim();
      if (b.intake_id !== undefined) p.intake_id = b.intake_id || null;
      const { error } = await db.from("aics_tenants").update(p).eq("id", b.id);
      if (error) throw error;
      if (Array.isArray(b.rules)) {
        for (const r of b.rules) await db.from("aics_rules").update({ active: !!r.active, auto_send: !!r.auto_send, message_hint: String(r.message_hint ?? "").slice(0, 500) }).eq("id", r.id).eq("tenant_id", b.id);
      }
      return out({ ok: true });
    }

    if (A === "draft") {
      const { data: t } = await db.from("aics_tenants").select("*").eq("id", b.id).single();
      const chat = String(b.chat ?? "").slice(-90000);
      const intakeId = b.intake_id || t.intake_id;
      const { data: intake } = intakeId ? await db.from("aics_intake").select("answers").eq("id", intakeId).maybeSingle() : { data: null };
      if (chat.length < 200 && !intake) return out({ error: "對話紀錄太少，也沒有問卷，AI 沒東西可以學" }, 400);
      await db.from("aics_tenants").update({ draft: { status: "working", started_at: new Date().toISOString(), chars: chat.length } }).eq("id", t.id);
      const job = (async () => {
        try {
          const d = await makeDraft(t, chat, String(b.owner_name ?? "").slice(0, 40), intake);
          await db.from("aics_tenants").update({ draft: { status: "done", at: new Date().toISOString(), ...d } }).eq("id", t.id);
        } catch (e) {
          await db.from("aics_tenants").update({ draft: { status: "error", at: new Date().toISOString(), error: String(e).slice(0, 300) } }).eq("id", t.id);
        }
      })();
      // @ts-ignore Supabase 內建
      EdgeRuntime.waitUntil(job);
      return out({ ok: true, status: "working" });
    }

    if (A === "draft_apply") {
      const id = b.id;
      const persona = String(b.persona ?? "").trim();
      const examples = (b.examples ?? []).map(String).filter(Boolean);
      const full = persona + (examples.length ? `\n\n你平常會這樣講（照這個味道，不要整句照抄）：\n${examples.map((x: string) => "・" + x).join("\n")}` : "");
      const p: Record<string, unknown> = { persona: full.slice(0, 6000) };
      if (b.business_hours) p.business_hours = String(b.business_hours).slice(0, 300);
      await db.from("aics_tenants").update(p).eq("id", id);
      if (b.replace) await db.from("aics_knowledge").delete().eq("tenant_id", id).in("source", ["AI整理-問答", "AI整理-話術"]);
      const items = [
        ...(b.faqs ?? []).filter((f: any) => f.q && f.a).map((f: any) => ({ title: String(f.q), content: `客人問：${f.q}\n店家回：${f.a}`, source: "AI整理-問答" })),
        ...(b.scripts ?? []).filter((s: any) => s.situation && s.how).map((s: any) => ({ title: "銷售話術｜" + s.situation, content: `銷售話術——客人${s.situation}時：${s.how}`, source: "AI整理-話術" })),
      ];
      const r = await addKnowledge(id, items);
      return out({ ok: r.errors.length === 0, ...r });
    }

    if (A === "knowledge_list") {
      if (!can(w, b.id)) return out({ error: "沒有權限" }, 403);
      const { data } = await db.from("aics_knowledge").select("id,title,content,source,created_at").eq("tenant_id", b.id).order("id", { ascending: false }).limit(400);
      return out({ ok: true, rows: data ?? [] });
    }
    if (A === "knowledge_add") return out({ ok: true, ...(await addKnowledge(b.id, b.items ?? [])) });
    if (A === "knowledge_del") {
      const { error } = await db.from("aics_knowledge").delete().eq("id", b.kid).eq("tenant_id", b.id);
      if (error) throw error;
      return out({ ok: true });
    }

    // ===== Vic 和店家老闆都可以 =====
    if (A === "test") {
      if (!can(w, b.id)) return out({ error: "沒有權限" }, 403);
      const { data: t } = await db.from("aics_tenants").select("*").eq("id", b.id).single();
      return out({ ok: true, ...(await testReply(t, String(b.text ?? "").slice(0, 500), b.history ?? [])) });
    }

    if (A === "contacts") {
      if (!can(w, b.id)) return out({ error: "沒有權限" }, 403);
      let q = db.from("aics_contacts").select("id,display_name,tags,interests,stage,needs_human,opted_out,last_message_at,first_seen_at")
        .eq("tenant_id", b.id).order("last_message_at", { ascending: false, nullsFirst: false }).limit(150);
      if (b.filter === "human") q = q.eq("needs_human", true);
      if (b.filter === "booked") q = q.contains("tags", ["booked"]);
      if (b.filter === "hesitating") q = q.eq("stage", "hesitating");
      const { data } = await q;
      return out({ ok: true, rows: data ?? [] });
    }

    if (A === "messages") {
      const c = await tenantOfContact(b.contact_id);
      if (!c || !can(w, c.tenant_id)) return out({ error: "沒有權限" }, 403);
      const { data } = await db.from("aics_messages").select("id,role,content,meta,created_at").eq("contact_id", c.id)
        .order("created_at", { ascending: false }).limit(120);
      const { aics_tenants: _t, ...contact } = c;
      return out({ ok: true, contact, rows: (data ?? []).reverse() });
    }

    if (A === "staff_send" || A === "takeover" || A === "release") {
      const c = await tenantOfContact(b.contact_id);
      if (!c || !can(w, c.tenant_id)) return out({ error: "沒有權限" }, 403);
      if (A === "release") { await db.from("aics_contacts").update({ needs_human: false }).eq("id", c.id); return out({ ok: true }); }
      await db.from("aics_contacts").update({ needs_human: true }).eq("id", c.id);
      if (A === "staff_send") {
        const text = String(b.text ?? "").trim().slice(0, 1000);
        if (!text) return out({ error: "訊息是空的" }, 400);
        const t = c.aics_tenants;
        if (!t.line_access_token) return out({ error: "這家店的 LINE 還沒接好" }, 400);
        await linePush(t.line_access_token, c.line_user_id, text);
        await db.from("aics_messages").insert({ tenant_id: t.id, contact_id: c.id, role: "staff", content: text, meta: { by: w.email } });
      }
      return out({ ok: true });
    }

    if (A === "outbox") {
      if (!can(w, b.id)) return out({ error: "沒有權限" }, 403);
      const { data } = await db.from("aics_outbox").select("id,kind,message,status,error,created_at,sent_at,aics_contacts(display_name)")
        .eq("tenant_id", b.id).order("created_at", { ascending: false }).limit(60);
      return out({ ok: true, rows: data ?? [] });
    }
    if (A === "outbox_act") {
      if (!can(w, b.id)) return out({ error: "沒有權限" }, 403);
      const ids = (b.ids ?? []).map(Number).filter(Boolean);
      const { data: mine } = await db.from("aics_outbox").select("id").eq("tenant_id", b.id).in("id", ids);
      const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/aics-followup`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-key": Deno.env.get("AICS_ADMIN_KEY") ?? "" },
        body: JSON.stringify({ action: b.act === "approve" ? "approve" : "skip", ids: (mine ?? []).map((x) => x.id) }),
      });
      return out(await r.json().catch(() => ({ ok: r.ok })));
    }

    return out({ error: "未知動作" }, 400);
  } catch (e) {
    console.error(e);
    return out({ error: "系統忙碌：" + String((e as any)?.message ?? e).slice(0, 200) }, 500);
  }
});
