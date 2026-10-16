import { revalidatePath, revalidateTag } from 'next/cache';
/* 後台存檔後呼叫：讓官網馬上換成新內容（只是重新產生頁面，不需要密碼） */
export async function POST() {
  revalidateTag('site');
  revalidatePath('/');
  return Response.json({ ok: true });
}
