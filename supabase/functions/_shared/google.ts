import { google } from 'npm:googleapis@140.0.1';

export function calendarClient() {
  const email = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const key = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('A Google Naptár kapcsolat nincs beállítva.');
  const auth = new google.auth.JWT(email, undefined, key, ['https://www.googleapis.com/auth/calendar']);
  return google.calendar({ version: 'v3', auth });
}
export function calendarId() {
  const id = Deno.env.get('GOOGLE_CALENDAR_ID');
  if (!id) throw new Error('A foglalási naptár nincs beállítva.');
  return id;
}
export const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('SITE_ORIGIN') || 'https://holistiklife.com',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
