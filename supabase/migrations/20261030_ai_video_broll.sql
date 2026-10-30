-- 沒講話的素材（畫面素材）怎麼接進成品（Vic 10/30：放三支只出一支）
-- [{src, segs:[[s,e],...], after:{src,t,line}|{start:true}|null, why, by:"ai"}]
-- 桌機 cutbot.py 的 broll_round 在客人確認字幕時寫入；官網預覽和桌機剪片都照這個接，兩邊一致。
alter table ai_video_jobs add column if not exists broll jsonb;
