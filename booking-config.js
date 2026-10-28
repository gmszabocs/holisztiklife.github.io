/*
 * Publikus cím és publishable alkalmazáskulcs. Titkos kulcs nem kerülhet ide.
 * A naptárkapcsolat és a saját domainről történő e-mail-küldés ellenőrizve.
 */
window.HOLISTIK_BOOKING_CONFIG = {
  SUPABASE_FUNCTIONS_URL: 'https://jewljckanfpwldekhrdh.supabase.co/functions/v1',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_0KkhAatC6IpkytdfcJD1Mw_Rgchj0VG',
  /* Éles foglalás: valódi naptáresemény és ügyfél-visszaigazolás. */
  PREVIEW_MODE: false,
  timezone: 'Europe/Budapest',
  services: {
    biorezonancia: { title: 'Biorezonancia állapotfelmérés', price: '15 000 Ft', duration: 60 },
    stresszkezeles: { title: 'Stresszkezelés, energetikai vizsgálat', price: '18 000 Ft', duration: 60 },
    'eletmod-tanacsadas': { title: 'Életmód tanácsadás', price: '12 000 Ft', duration: 60 }
  }
};

