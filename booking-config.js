/*
 * Publikus beállítás. Élesítéskor csak a SUPABASE_FUNCTIONS_URL értékét kell kitölteni.
 * Példa: https://abcdef.supabase.co/functions/v1
 */
window.HOLISTIK_BOOKING_CONFIG = {
  SUPABASE_FUNCTIONS_URL: '',
  /* Az éles Supabase-cím megadása után állítsd false értékre. */
  PREVIEW_MODE: true,
  timezone: 'Europe/Budapest',
  services: {
    biorezonancia: { title: 'Biorezonancia állapotfelmérés', price: '15 000 Ft', duration: 60 },
    stresszkezeles: { title: 'Stresszkezelés, energetikai vizsgálat', price: '18 000 Ft', duration: 60 },
    'eletmod-tanacsadas': { title: 'Életmód tanácsadás', price: '12 000 Ft', duration: 60 }
  }
};
