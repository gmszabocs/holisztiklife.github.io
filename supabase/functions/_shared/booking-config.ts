export const TIMEZONE = 'Europe/Budapest';
export const OPENING_HOURS: Record<number, [number, number]> = {
  1: [10, 17], 2: [10, 17], 3: [10, 17], 4: [10, 17], 5: [10, 17],
};
export const SERVICES: Record<string, { title: string; price: string; duration: number }> = {
  biorezonancia: { title: 'Biorezonancia állapotfelmérés', price: '15 000 Ft', duration: 60 },
  stresszkezeles: { title: 'Stresszkezelés, energetikai vizsgálat', price: '18 000 Ft', duration: 60 },
  'eletmod-tanacsadas': { title: 'Életmód tanácsadás', price: '12 000 Ft', duration: 60 },
};
export const SLOT_INTERVAL_MINUTES = 60;
export const BUFFER_MINUTES = 0;
