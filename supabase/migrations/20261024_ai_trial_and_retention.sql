-- Vic 10/24：
-- 1) AI 剪片檔案保存 3 天（成品、原始素材），換人照片做完 24 小時，沒送出的上傳 24 小時
-- 2) 登入會員免費試用：AI 剪片 2 支（只上字幕 1、完整剪片 1，每支 60 秒內、有浮水印），AI 美編 3 件商品（有浮水印）

-- ===== 1. 保存期限 =====
alter table public.ai_video_jobs add column if not exists done_at timestamptz, add column if not exists purged_at timestamptz, add column if not exists trial boolean not null default false;

create or replace function public.ai_video_set_done_at() returns trigger language plpgsql as $$
begin
  if new.status = 'done' and (old.status is distinct from 'done' or new.result is distinct from old.result) then new.done_at := now(); end if;
  return new;
end $$;
drop trigger if exists ai_video_done_at on public.ai_video_jobs;
create trigger ai_video_done_at before update on public.ai_video_jobs for each row execute function public.ai_video_set_done_at();
update public.ai_video_jobs set done_at = now() where status = 'done' and done_at is null;

do $$ begin
  if not exists (select 1 from vault.secrets where name = 'ai_video_purge_key') then
    perform vault.create_secret(encode(gen_random_bytes(24), 'hex'), 'ai_video_purge_key');
  end if;
end $$;

create or replace function public.ai_video_purge_ok(k text) returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from vault.decrypted_secrets where name = 'ai_video_purge_key' and decrypted_secret = k);
$$;

create or replace function public.ai_video_purge_plan() returns jsonb language plpgsql security definer set search_path = public as $$
declare full_ids bigint[]; face_ids bigint[]; paths text[] := '{}'; refd text[];
begin
  select coalesce(array_agg(id), '{}') into full_ids from ai_video_jobs where status = 'done' and purged_at is null and done_at < now() - interval '3 days';
  select coalesce(array_agg(id), '{}') into face_ids from ai_video_jobs where status = 'done' and done_at < now() - interval '24 hours' and swap is not null and swap ? 'photos' and jsonb_array_length(coalesce(swap->'photos','[]')) > 0;
  select paths || coalesce(array_agg(p), '{}') into paths from (
    select f->>'path' p from ai_video_jobs j, jsonb_array_elements(coalesce(j.files,'[]')) f where j.id = any(full_ids)
    union select j.logo from ai_video_jobs j where j.id = any(full_ids) and j.logo is not null and j.logo <> ''
    union select j.result->>'path' from ai_video_jobs j where j.id = any(full_ids) and j.result ? 'path') x where p is not null and p <> '';
  select paths || coalesce(array_agg(p), '{}') into paths from (
    select ph #>> '{}' p from ai_video_jobs j, jsonb_array_elements(coalesce(j.swap->'photos','[]')) ph where j.id = any(face_ids)
    union select j.swap->>'proof' from ai_video_jobs j where j.id = any(face_ids) and j.swap ? 'proof') y where p is not null and p <> '';
  select coalesce(array_agg(p), '{}') into refd from (
    select f->>'path' p from ai_video_jobs j, jsonb_array_elements(coalesce(j.files,'[]')) f
    union select logo from ai_video_jobs union select result->>'path' from ai_video_jobs
    union select ph #>> '{}' from ai_video_jobs j, jsonb_array_elements(coalesce(j.swap->'photos','[]')) ph
    union select swap->>'proof' from ai_video_jobs) r where p is not null;
  select paths || coalesce(array_agg(o.name), '{}') into paths from storage.objects o
    where o.bucket_id = 'ai-videos' and o.created_at < now() - interval '24 hours' and not (o.name = any(refd));
  return jsonb_build_object('full', to_jsonb(full_ids), 'face', to_jsonb(face_ids), 'paths', to_jsonb(paths));
end $$;

create or replace function public.ai_video_purge_mark(p_full bigint[], p_face bigint[]) returns void language plpgsql security definer set search_path = public as $$
begin
  update ai_video_jobs set swap = (swap - 'photos' - 'proof') || jsonb_build_object('photos_deleted_at', now()) where id = any(p_face);
  update ai_video_jobs set purged_at = now(), result = coalesce(result,'{}'::jsonb) || jsonb_build_object('expired', true) where id = any(p_full);
end $$;

revoke all on function public.ai_video_purge_ok(text), public.ai_video_purge_plan(), public.ai_video_purge_mark(bigint[], bigint[]) from public, anon, authenticated;
grant execute on function public.ai_video_purge_ok(text), public.ai_video_purge_plan(), public.ai_video_purge_mark(bigint[], bigint[]) to service_role;

-- 每小時清一次（呼叫 ai-video-purge 清理程式）
select cron.unschedule('ai-video-purge') where exists (select 1 from cron.job where jobname = 'ai-video-purge');
select cron.schedule('ai-video-purge', '17 * * * *', $c$
  select net.http_post(
    url := 'https://cswhroimywfyokxxogis.supabase.co/functions/v1/ai-video-purge',
    headers := jsonb_build_object('Content-Type','application/json','x-purge-key',(select decrypted_secret from vault.decrypted_secrets where name = 'ai_video_purge_key')),
    body := '{}'::jsonb, timeout_milliseconds := 55000)
$c$);

-- ===== 2. 免費試用 =====
-- 試用用量記在 ai_tool_usage：ym = 'trial'（美編件數）、'trial-subs'、'trial-cut'（剪片支數）
create or replace function public.ai_trial_left(p_uid uuid) returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'design', greatest(0, 3 - coalesce((select used from ai_tool_usage where user_id = p_uid and tool = 'design' and ym = 'trial'), 0)),
    'subs',   greatest(0, 1 - coalesce((select used from ai_tool_usage where user_id = p_uid and tool = 'video'  and ym = 'trial-subs'), 0)),
    'cut',    greatest(0, 1 - coalesce((select used from ai_tool_usage where user_id = p_uid and tool = 'video'  and ym = 'trial-cut'), 0)));
$$;

create or replace function public.ai_tool_me() returns jsonb language plpgsql stable security definer set search_path = public as $function$
declare uid uuid := auth.uid(); adm boolean; v_ym text := to_char(now() at time zone 'Asia/Taipei','YYYY-MM'); res jsonb := '{}'; t text; s record; u int; tl jsonb; st text;
begin
  if uid is null then return jsonb_build_object('login',false); end if;
  adm := ai_tool_is_admin(); tl := ai_trial_left(uid);
  foreach t in array array['design','video'] loop
    select * into s from ai_tool_subs where user_id=uid and tool=t;
    u := coalesce((select g.used from ai_tool_usage g where g.user_id=uid and g.tool=t and g.ym=v_ym),0);
    st := case when s is null then 'none' when s.status='active' and s.period_end is not null and s.period_end < current_date then 'expired' else s.status end;
    if adm then
      res := res || jsonb_build_object(t, jsonb_build_object('plan','max','status','active','limit',1000000,'used',u,'free',true));
    elsif st <> 'active' and ((t = 'design' and (tl->>'design')::int > 0) or (t = 'video' and ((tl->>'subs')::int + (tl->>'cut')::int) > 0)) then
      res := res || jsonb_build_object(t, jsonb_build_object('plan','basic','status','trial','real_status',st,'trial',true,
        'limit', case t when 'design' then 3 else 2 end,
        'used',  case t when 'design' then 3 - (tl->>'design')::int else 2 - (tl->>'subs')::int - (tl->>'cut')::int end,
        'left',  case t when 'design' then jsonb_build_object('design',tl->'design') else jsonb_build_object('subs',tl->'subs','cut',tl->'cut') end,
        'requested_plan', case when s is null then null else s.plan end, 'billing', case when s is null then null else s.billing end));
    elsif s is null then
      res := res || jsonb_build_object(t, jsonb_build_object('plan',null,'status','none','limit',0,'used',u,'trial_used',true));
    else
      res := res || jsonb_build_object(t, jsonb_build_object('plan',s.plan,'status',st,'billing',s.billing,'period_end',s.period_end,'limit',ai_tool_limit(t,s.plan),'used',u,'trial_used',true));
    end if;
  end loop;
  return res || jsonb_build_object('login',true,'admin',adm,'email',(select email from auth.users where id=uid),'ym',v_ym);
end $function$;

-- 美編（/api/aicopy 每做一件商品呼叫一次）：試用中就扣試用件數
create or replace function public.ai_tool_use(p_tool text, p_n integer default 1) returns jsonb language plpgsql security definer set search_path = public as $function$
declare uid uuid := auth.uid(); me jsonb; t jsonb; v_ym text := to_char(now() at time zone 'Asia/Taipei','YYYY-MM'); nu int;
begin
  if uid is null then raise exception '請先登入'; end if;
  if p_n < 1 or p_n > 20 then raise exception '數量不正確'; end if;
  me := ai_tool_me(); t := me->p_tool;
  if t is not null and t->>'status' = 'trial' then
    if p_tool <> 'design' then raise exception '試用請從 AI 剪片頁送出'; end if;
    if (t->'left'->>'design')::int < p_n then raise exception '免費試用用完了，開通方案就能繼續做'; end if;
    insert into ai_tool_usage as g(user_id,tool,ym,used) values(uid,'design','trial',p_n)
    on conflict(user_id,tool,ym) do update set used=g.used+p_n returning g.used into nu;
    return jsonb_build_object('used',nu,'limit',3,'trial',true);
  end if;
  if t is null or t->>'status' <> 'active' then raise exception '方案還沒開通'; end if;
  if (t->>'used')::int + p_n > (t->>'limit')::int then raise exception '這個月的額度用完了，可以加購或升級方案'; end if;
  insert into ai_tool_usage as g(user_id,tool,ym,used) values(uid,p_tool,v_ym,p_n)
  on conflict(user_id,tool,ym) do update set used=g.used+p_n returning g.used into nu;
  return jsonb_build_object('used',nu,'limit',(t->>'limit')::int);
end $function$;

-- 剪片送出：試用中照模式扣（只上字幕／完整剪片各 1 支），工作標記 trial
create or replace function public.ai_video_submit2(p_files jsonb, p_style text, p_note text, p_logo text, p_mode text, p_module text, p_swap jsonb)
returns bigint language plpgsql security definer set search_path = public as $function$
declare uid uuid := auth.uid(); jid bigint; pl text; sw jsonb := null; t jsonb; is_trial boolean := false; k text;
begin
  if uid is null then raise exception '請先登入'; end if;
  if p_mode not in ('cut','subs') then raise exception '模式不對'; end if;
  t := ai_tool_me()->'video';
  is_trial := t is not null and t->>'status' = 'trial';
  if p_swap is not null and jsonb_typeof(p_swap)='object' and jsonb_array_length(coalesce(p_swap->'photos','[]'))>0 then
    if is_trial then raise exception '免費試用不含 AI 換人'; end if;
    if not ai_tool_is_admin() then
      select plan into pl from ai_tool_subs where user_id=uid and tool='video' and status='active';
      if pl is null or pl not in ('pro','max','ent') then raise exception 'AI 換人要專業方案以上才能用'; end if;
    end if;
    if coalesce((p_swap->>'consent')::boolean,false) is not true then raise exception '要先勾選同意聲明'; end if;
    sw := jsonb_build_object('photos',p_swap->'photos','proof',p_swap->'proof','consent',true,'consent_at',now(),'who',left(coalesce(p_swap->>'who',''),40));
  end if;
  if is_trial then
    k := case p_mode when 'subs' then 'subs' else 'cut' end;
    if (t->'left'->>k)::int < 1 then raise exception '%', case k when 'subs' then '「只上字幕」的免費試用用過了' else '「完整剪片」的免費試用用過了' end; end if;
    if jsonb_array_length(p_files) > 1 then raise exception '免費試用一次放 1 支影片'; end if;
    insert into ai_tool_usage as g(user_id,tool,ym,used) values(uid,'video','trial-'||k,1)
    on conflict(user_id,tool,ym) do update set used=g.used+1;
  else
    perform ai_tool_use('video', 1);
  end if;
  insert into ai_video_jobs(user_id,files,style,note,logo,mode,module,swap,status,trial)
    values(uid,p_files,left(p_style,40),left(p_note,2000),left(p_logo,300),p_mode,left(p_module,40),sw,'stt',is_trial) returning id into jid;
  return jid;
end $function$;

-- 試用出片只算 1 次（不能改字幕再出）
create or replace function public.ai_render_cap() returns integer language plpgsql stable security definer set search_path = public as $function$
declare pl text; st text;
begin if ai_tool_is_admin() then return 1000; end if;
  select plan, status into pl, st from ai_tool_subs where user_id=auth.uid() and tool='video';
  if pl is null or st <> 'active' then return 1; end if;
  return case pl when 'basic' then 2 when 'pro' then 4 else 1000 end; end $function$;

-- 管理員清單帶出 trial、done_at
create or replace function public.ai_video_admin_list() returns setof jsonb language plpgsql stable security definer set search_path = public as $function$
begin
  if not ai_tool_is_admin() then raise exception '只有管理員可以看'; end if;
  return query select jsonb_build_object('id',j.id,'email',u.email,'files',j.files,'style',j.style,'note',j.note,'logo',j.logo,'status',j.status,'result',j.result,'created_at',j.created_at,'mode',j.mode,'module',j.module,'swap',j.swap,'lines',j.lines,'renders',j.renders,'edit',j.edit,
      'trial',j.trial,'done_at',j.done_at,'purged_at',j.purged_at,
      'plan',(select s.plan from ai_tool_subs s where s.user_id=j.user_id and s.tool='video'))
    from ai_video_jobs j join auth.users u on u.id=j.user_id order by j.id desc limit 200;
end $function$;

-- ===== 3. Vic 10/24 17:18：刪掉 Vic 自己帳號的測試剪片（檔案由清理程式在下一輪刪掉）=====
delete from public.ai_video_jobs where user_id = (select id from auth.users where email = '07vicchen@gmail.com');
