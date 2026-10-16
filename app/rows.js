export async function getRows() {
  try {
    const r = await fetch('https://cswhroimywfyokxxogis.supabase.co/rest/v1/web_settings?select=key,value', {
      headers: { apikey: 'sb_publishable_vNNC0f5QzxX7uUl2hqvKhA_WSXIhwiY', Authorization: 'Bearer sb_publishable_vNNC0f5QzxX7uUl2hqvKhA_WSXIhwiY' },
      next: { revalidate: 300, tags: ['site'] }
    });
    return r.ok ? await r.json() : [];
  } catch (e) { return []; }
}
