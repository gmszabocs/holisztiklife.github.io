(() => {
  const config = window.HOLISTIK_BOOKING_CONFIG;
  const dialog = document.getElementById('booking-modal');
  const form = document.getElementById('booking-form');
  const status = document.getElementById('booking-status');
  const slots = document.getElementById('booking-slots');
  const date = document.getElementById('booking-date');
  const submit = document.getElementById('booking-submit');
  let currentService = null;
  let selectedSlot = null;

  const localDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: config.timezone }).format(new Date());
  date.min = localDate();
  date.value = localDate();

  const showStatus = (message, isError = false) => {
    status.textContent = message;
    status.hidden = !message;
    status.classList.toggle('is-error', isError);
  };
  const endpoint = (name) => `${config.SUPABASE_FUNCTIONS_URL}/${name}`;

  function renderSlots(slotList) {
    if (!slotList.length) { showStatus('Erre a napra nincs szabad időpont. Válassz másik dátumot.'); return; }
    showStatus('');
    slotList.forEach(slot => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'booking-slot'; button.textContent = slot.label;
      button.addEventListener('click', () => {
        slots.querySelectorAll('.booking-slot').forEach(item => item.classList.remove('is-selected'));
        button.classList.add('is-selected'); selectedSlot = slot.start;
        document.getElementById('booking-start').value = slot.start; submit.disabled = false;
      });
      slots.appendChild(button);
    });
  }

  function previewSlots() {
    const weekday = new Date(`${date.value}T12:00:00`).getDay();
    if (weekday === 0 || weekday === 6) return [];
    return Array.from({ length: 7 }, (_, index) => {
      const hour = 10 + index;
      return { start: `${date.value}T${String(hour).padStart(2, '0')}:00:00.000Z`, label: `${String(hour).padStart(2, '0')}:00` };
    });
  }

  async function loadSlots() {
    selectedSlot = null;
    document.getElementById('booking-start').value = '';
    submit.disabled = true;
    slots.innerHTML = '';
    if (!config.SUPABASE_FUNCTIONS_URL && config.PREVIEW_MODE) {
      showStatus('Válassz egy neked megfelelő időpontot.');
      renderSlots(previewSlots());
      return;
    }
    if (!config.SUPABASE_FUNCTIONS_URL) {
      showStatus('A foglaló beállítása még folyamatban van. Kérjük, próbáld később.', true);
      return;
    }
    showStatus('Szabad időpontok keresése…');
    try {
      const response = await fetch(`${endpoint('availability')}?service=${encodeURIComponent(currentService.id)}&date=${date.value}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Az időpontok nem tölthetők be.');
      renderSlots(data.slots);
    } catch (error) { showStatus(error.message || 'Hiba történt. Próbáld újra később.', true); }
  }

  window.openBookingModal = trigger => {
    const service = config.services[trigger.dataset.serviceId];
    if (!service) { alert('Ehhez a szolgáltatáshoz a foglalás még nem elérhető.'); return; }
    currentService = { ...service, id: trigger.dataset.serviceId };
    const serviceDialog = trigger.closest('dialog');
    if (serviceDialog?.open) serviceDialog.close();
    document.getElementById('booking-service').textContent = service.title;
    document.getElementById('booking-price').textContent = `Ár: ${service.price} · Időtartam: ${service.duration} perc`;
    document.getElementById('booking-service-image').src = trigger.dataset.image;
    document.getElementById('booking-service-image').alt = service.title;
    form.hidden = false; slots.hidden = false; date.closest('.booking-date-row').hidden = false;
    form.reset();
    document.getElementById('booking-service-input').value = service.id;
    date.min = localDate(); date.value = localDate();
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('booking-open');
    loadSlots();
  };

  date.addEventListener('change', loadSlots);
  dialog.addEventListener('close', () => document.body.classList.remove('booking-open'));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!selectedSlot || !form.reportValidity()) return;
    if (!config.SUPABASE_FUNCTIONS_URL) {
      showStatus('Ez a foglaló még tesztelési nézetben van; az élesítés után itt lehet véglegesíteni a foglalást.', true);
      return;
    }
    submit.disabled = true; showStatus('Foglalás rögzítése…');
    const payload = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch(endpoint('book'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'A foglalást nem sikerült rögzíteni.');
      form.hidden = true; slots.hidden = true; date.closest('.booking-date-row').hidden = true;
      showStatus('Köszönjük! A foglalásodat rögzítettük. Hamarosan visszaigazoló e-mailt kapsz.');
    } catch (error) { showStatus(error.message || 'Hiba történt. Ellenőrizd az adatokat, majd próbáld újra.', true); submit.disabled = false; }
  });
})();
