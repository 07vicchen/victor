-- Vic 10/26：AI 剪片「質感特效」＋客人上傳照片放進特效（已用 Supabase MCP 套用到 cswhroimywfyokxxogis）。只新增欄位和函式，不動舊資料。
-- ai_video_jobs.fx（jsonb，可以是 null；只有完整剪片 mode='cut' 會有）格式，給桌機剪片程式 cutbot／啾咪讀：
-- {"v":1,
--  "auto":true/false,                    -- true＝客人沒挑或按「交給啾咪挑」，剪輯端照內容決定要不要加、加哪些
--  "effects":["grade","chapters",...],   -- 客人勾的特效，id＝effects.py 的 type：covers pip bigword material featcards grade hang chapters logo
--  "photos":[{"path":"<uid>/<stamp>_fx0.jpg","name":"原檔名","use":"covers|pip|material|featcards|auto"}],  -- ai-videos bucket 路徑；use=auto 交給啾咪放
--  "plan":"basic|pro|max|ent|admin|trial", "at":"送出時間"}
-- 照片對到 effects.py：covers→items[].img、pip→src、material→img、featcards→items[].img；logo 特效用工作原本的 logo 欄位（或 edit.sticky 文字）。
-- 入門方案／試用只收 grade、chapters、logo，不收照片；專業以上 9 種全開＋照片最多 12 張（伺服器端 ai_video_fx_clean 會再過濾一次）。
-- 特效照片跟素材一起在完成 3 天後刪除（ai_video_purge_plan）。
alter table public.ai_video_jobs add column if not exists fx jsonb;

create or replace function public.ai_video_fx_clean(p_uid uuid, p_fx jsonb, p_plan text) returns jsonb
language plpgsql stable set search_path = public as $$
declare full_ok boolean := p_plan in ('pro','max','ent','admin');
  allowed text[] := case when p_plan in ('pro','max','ent','admin') then array['covers','pip','bigword','material','featcards','grade','hang','chapters','logo'] else array['grade','chapters','logo'] end;
  effs jsonb := '[]'; phs jsonb := '[]'; e text; ph jsonb; u text; n int := 0;
begin
  if p_fx is null or jsonb_typeof(p_fx) <> 'object' then return null; end if;
  for e in select distinct x from jsonb_array_elements_text(case when jsonb_typeof(p_fx->'effects')='array' then p_fx->'effects' else '[]' end) x loop
    if e = any(allowed) then effs := effs || to_jsonb(e); end if;
  end loop;
  if full_ok and jsonb_typeof(p_fx->'photos') = 'array' then
    for ph in select * from jsonb_array_elements(p_fx->'photos') loop
      exit when n >= 12;
      if jsonb_typeof(ph) = 'object' and coalesce(ph->>'path','') like p_uid::text || '/%' and ph->>'path' !~ '\.\.' then
        u := coalesce(ph->>'use','auto'); if u not in ('covers','pip','material','featcards','auto') then u := 'auto'; end if;
        phs := phs || jsonb_build_object('path', left(ph->>'path',300), 'name', left(coalesce(ph->>'name',''),120), 'use', u); n := n + 1;
      end if;
    end loop;
  end if;
  return jsonb_build_object('v',1,'auto', coalesce((p_fx->>'auto')::boolean, false) or jsonb_array_length(effs) = 0,
    'effects', effs, 'photos', phs, 'plan', p_plan, 'at', now());
end $$;

create or replace function public.ai_video_submit3(p_files jsonb, p_style text, p_note text, p_logo text, p_mode text, p_module text, p_swap jsonb, p_fx jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare jid bigint; uid uuid := auth.uid(); pl text; t jsonb;
begin
  jid := ai_video_submit2(p_files, p_style, p_note, p_logo, p_mode, p_module, p_swap);
  if p_mode = 'cut' and p_fx is not null then
    if ai_tool_is_admin() then pl := 'admin';
    else t := ai_tool_me()->'video';
      pl := case when t is null then 'basic' when t->>'status' = 'trial' then 'trial' else coalesce(t->>'plan','basic') end;
      if not exists (select 1 from ai_tool_subs s where s.user_id = uid and s.tool = 'video' and s.status = 'active' and (s.period_end is null or s.period_end >= current_date)) then pl := 'trial'; end if;
    end if;
    update ai_video_jobs set fx = ai_video_fx_clean(uid, p_fx, pl) where id = jid;
  end if;
  return jid;
end $$;
revoke all on function public.ai_video_submit3(jsonb,text,text,text,text,text,jsonb,jsonb) from public, anon;
grant execute on function public.ai_video_submit3(jsonb,text,text,text,text,text,jsonb,jsonb) to authenticated;
revoke all on function public.ai_video_fx_clean(uuid,jsonb,text) from public, anon, authenticated;

-- ai_video_admin_list 多帶 fx；ai_video_purge_plan 把 fx 照片算進 3 天清理和「有被用到」清單；ai_tool_limit 專業 50→80 支
create or replace function public.ai_tool_limit(p_tool text, p_plan text) returns integer language sql immutable as $function$
  select case p_tool when 'design' then case p_plan when 'basic' then 30 when 'pro' then 150 else 1000000 end
                     else case p_plan when 'basic' then 15 when 'pro' then 80 when 'max' then 150 else 1000000 end end $function$;

CREATE OR REPLACE FUNCTION public.ai_video_admin_list() RETURNS SETOF jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
begin
  if not ai_tool_is_admin() then raise exception '只有管理員可以看'; end if;
  return query select jsonb_build_object('id',j.id,'email',u.email,'files',j.files,'style',j.style,'note',j.note,'logo',j.logo,'status',j.status,'result',j.result,'created_at',j.created_at,'mode',j.mode,'module',j.module,'swap',j.swap,'lines',j.lines,'renders',j.renders,'edit',j.edit,
      'trial',j.trial,'done_at',j.done_at,'purged_at',j.purged_at,'fx',j.fx,
      'plan',(select s.plan from ai_tool_subs s where s.user_id=j.user_id and s.tool='video'))
    from ai_video_jobs j join auth.users u on u.id=j.user_id order by j.id desc limit 200;
end $function$;

CREATE OR REPLACE FUNCTION public.ai_video_purge_plan() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
declare full_ids bigint[]; face_ids bigint[]; paths text[] := '{}'; refd text[];
begin
  select coalesce(array_agg(id), '{}') into full_ids from ai_video_jobs where status = 'done' and purged_at is null and done_at < now() - interval '3 days';
  select coalesce(array_agg(id), '{}') into face_ids from ai_video_jobs where status = 'done' and done_at < now() - interval '24 hours' and swap is not null and swap ? 'photos' and jsonb_array_length(coalesce(swap->'photos','[]')) > 0;
  select paths || coalesce(array_agg(p), '{}') into paths from (
    select f->>'path' p from ai_video_jobs j, jsonb_array_elements(coalesce(j.files,'[]')) f where j.id = any(full_ids)
    union select j.logo from ai_video_jobs j where j.id = any(full_ids) and j.logo is not null and j.logo <> ''
    union select ph->>'path' from ai_video_jobs j, jsonb_array_elements(coalesce(j.fx->'photos','[]')) ph where j.id = any(full_ids)
    union select j.result->>'path' from ai_video_jobs j where j.id = any(full_ids) and j.result ? 'path') x where p is not null and p <> '';
  select paths || coalesce(array_agg(p), '{}') into paths from (
    select ph #>> '{}' p from ai_video_jobs j, jsonb_array_elements(coalesce(j.swap->'photos','[]')) ph where j.id = any(face_ids)
    union select j.swap->>'proof' from ai_video_jobs j where j.id = any(face_ids) and j.swap ? 'proof') y where p is not null and p <> '';
  select coalesce(array_agg(p), '{}') into refd from (
    select f->>'path' p from ai_video_jobs j, jsonb_array_elements(coalesce(j.files,'[]')) f
    union select logo from ai_video_jobs union select result->>'path' from ai_video_jobs
    union select ph #>> '{}' from ai_video_jobs j, jsonb_array_elements(coalesce(j.swap->'photos','[]')) ph
    union select ph->>'path' from ai_video_jobs j, jsonb_array_elements(coalesce(j.fx->'photos','[]')) ph
    union select swap->>'proof' from ai_video_jobs) r where p is not null;
  select paths || coalesce(array_agg(o.name), '{}') into paths from storage.objects o
    where o.bucket_id = 'ai-videos' and o.created_at < now() - interval '24 hours' and not (o.name = any(refd));
  return jsonb_build_object('full', to_jsonb(full_ids), 'face', to_jsonb(face_ids), 'paths', to_jsonb(paths));
end $function$;
