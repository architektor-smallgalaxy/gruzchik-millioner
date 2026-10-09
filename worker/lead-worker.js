// Cloudflare Worker: принимает заявку с сайта и отправляет её в Telegram.
// Переменные (Settings → Variables, тип Secret): BOT_TOKEN, CHAT_ID
const ORIGIN = 'https://gruzchik-millioner.ru';
const cors = { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const clip = (v, n = 500) => String(v || '').slice(0, n).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    let d; try { d = await req.json(); } catch { return new Response('Bad JSON', { status: 400, headers: cors }); }
    if (d.website || !d.phone) return new Response('Bad request', { status: 400, headers: cors });
    const text = `<b>Заявка с сайта</b>\nИмя: ${clip(d.name, 80)}\nТелефон: ${clip(d.phone, 40)}\nУслуга: ${clip(d.svc, 60)}\nОткуда: ${clip(d.from)}\nКуда: ${clip(d.to)}\n${clip(d.msg, 2000)}`;
    const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text, parse_mode: 'HTML' }) });
    return new Response(r.ok ? 'ok' : 'telegram error', { status: r.ok ? 200 : 502, headers: cors });
  }
};
