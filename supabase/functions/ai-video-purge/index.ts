// AI 剪片檔案清理（Vic 10/24）：每小時由 pg_cron 叫一次
// 成品＋原始素材：完成後 3 天刪；換人照片：完成後 24 小時刪；沒送出的上傳：24 小時刪
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const key = req.headers.get("x-purge-key") || "";
  const ok = await sb.rpc("ai_video_purge_ok", { k: key });
  if (ok.error || ok.data !== true) return new Response(JSON.stringify({ ok: false }), { status: 401 });
  const plan = await sb.rpc("ai_video_purge_plan");
  if (plan.error) return new Response(JSON.stringify({ ok: false, err: plan.error.message }), { status: 500 });
  const paths: string[] = Array.from(new Set((plan.data.paths || []).filter(Boolean)));
  let removed = 0; const errs: string[] = [];
  for (let i = 0; i < paths.length; i += 100) {
    const r = await sb.storage.from("ai-videos").remove(paths.slice(i, i + 100));
    if (r.error) errs.push(r.error.message); else removed += (r.data || []).length;
  }
  if (!errs.length) {
    const m = await sb.rpc("ai_video_purge_mark", { p_full: plan.data.full || [], p_face: plan.data.face || [] });
    if (m.error) errs.push(m.error.message);
  }
  return new Response(JSON.stringify({ ok: !errs.length, removed, jobs: (plan.data.full || []).length, faces: (plan.data.face || []).length, errs }), { headers: { "Content-Type": "application/json" } });
});
