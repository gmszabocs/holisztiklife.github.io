import { calendarClient, calendarId, cors, json } from '../_shared/google.ts';
import { SERVICES, BUFFER_MINUTES } from '../_shared/booking-config.ts';

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]!));
async function sendConfirmation(to: string, name: string, service: string, start: Date) {
  const key = Deno.env.get('RESEND_API_KEY'); const from = Deno.env.get('EMAIL_FROM');
  if (!key || !from) return;
  const when = new Intl.DateTimeFormat('hu-HU', { timeZone: 'Europe/Budapest', dateStyle: 'full', timeStyle: 'short' }).format(start);
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#261d17"><h1 style="color:#6955a3">Köszönjük a foglalást!</h1><p>Kedves ${escape(name)}!</p><p>Rögzítettük az időpontodat:</p><p><strong>${escape(service)}</strong><br>${when}</p><p>Ha kérdésed van vagy módosítanál, válaszolj erre az e-mailre vagy keress telefonon.</p><p>Üdvözlettel,<br>Holistiklife</p></div>`;
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [to], subject: `Foglalás visszaigazolása – ${service}`, html }) });
  if (!response.ok) console.error('Resend hiba', await response.text());
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Nem támogatott kérés.' }, 405);
  try {
    const input = await request.json(); const service = SERVICES[input.service]; const name = String(input.name || '').trim(); const email = String(input.email || '').trim(); const phone = String(input.phone || '').trim(); const start = new Date(input.start);
    if (input.website || !service || name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || phone.length < 6 || Number.isNaN(start.getTime())) return json({ error: 'Kérjük, tölts ki minden kötelező mezőt.' }, 400);
    const end = new Date(start.getTime() + (service.duration + BUFFER_MINUTES) * 60000); if (start <= new Date()) return json({ error: 'Ez az időpont már nem foglalható.' }, 409);
    const calendar = calendarClient(); const id = calendarId();
    const freebusy = await calendar.freebusy.query({ requestBody: { timeMin: start.toISOString(), timeMax: end.toISOString(), items: [{ id }] } });
    if ((freebusy.data.calendars?.[id]?.busy || []).length) return json({ error: 'Ezt az időpontot időközben lefoglalták. Válassz másikat.' }, 409);
    const event = await calendar.events.insert({ calendarId: id, sendUpdates: 'all', requestBody: { summary: `Foglalás – ${service.title}`, description: `Vendég: ${name}\nE-mail: ${email}\nTelefon: ${phone}${input.note ? `\nMegjegyzés: ${String(input.note).slice(0, 1000)}` : ''}`, start: { dateTime: start.toISOString(), timeZone: 'Europe/Budapest' }, end: { dateTime: new Date(start.getTime() + service.duration * 60000).toISOString(), timeZone: 'Europe/Budapest' }, attendees: [{ email, displayName: name }], extendedProperties: { private: { source: 'holistiklife-booking' } } } });
    await sendConfirmation(email, name, service.title, start);
    return json({ ok: true, eventId: event.data.id });
  } catch (error) { console.error(error); return json({ error: 'A foglalást most nem sikerült rögzíteni. Kérjük, próbáld később.' }, 500); }
});
