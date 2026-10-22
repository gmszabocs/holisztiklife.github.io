import { calendarClient, calendarId, cors, json } from '../_shared/google.ts';
import { OPENING_HOURS, SERVICES, SLOT_INTERVAL_MINUTES, BUFFER_MINUTES, TIMEZONE } from '../_shared/booking-config.ts';

const pad = (value: number) => String(value).padStart(2, '0');
export function zonedTime(date: string, hour: number, minute = 0) {
  const guess = new Date(`${date}T${pad(hour)}:${pad(minute)}:00.000Z`);
  const values = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(guess).reduce((out, item) => ({ ...out, [item.type]: item.value }), {} as Record<string, string>);
  const offset = Date.UTC(+values.year, +values.month - 1, +values.day, +values.hour, +values.minute) - guess.getTime();
  return new Date(guess.getTime() - offset);
}
export function localWeekday(date: string) { return new Date(`${date}T12:00:00Z`).getUTCDay(); }

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  try {
    const url = new URL(request.url); const service = SERVICES[url.searchParams.get('service') || '']; const date = url.searchParams.get('date') || '';
    if (!service || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Érvénytelen szolgáltatás vagy dátum.' }, 400);
    if (date < new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date())) return json({ error: 'Múltbeli dátum nem foglalható.' }, 400);
    const hours = OPENING_HOURS[localWeekday(date)]; if (!hours) return json({ slots: [] });
    const rangeStart = zonedTime(date, hours[0]); const rangeEnd = zonedTime(date, hours[1]);
    const calendar = calendarClient(); const id = calendarId();
    const response = await calendar.freebusy.query({ requestBody: { timeMin: rangeStart.toISOString(), timeMax: rangeEnd.toISOString(), items: [{ id }] } });
    const busy = response.data.calendars?.[id]?.busy || [];
    const slots = [];
    for (let minutes = hours[0] * 60; minutes + service.duration + BUFFER_MINUTES <= hours[1] * 60; minutes += SLOT_INTERVAL_MINUTES) {
      const start = zonedTime(date, Math.floor(minutes / 60), minutes % 60); const end = new Date(start.getTime() + (service.duration + BUFFER_MINUTES) * 60000);
      const free = !busy.some(item => start < new Date(item.end!) && end > new Date(item.start!));
      if (free) slots.push({ start: start.toISOString(), label: new Intl.DateTimeFormat('hu-HU', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' }).format(start) });
    }
    return json({ slots });
  } catch (error) { console.error(error); return json({ error: 'A szabad időpontok most nem elérhetők.' }, 500); }
});
