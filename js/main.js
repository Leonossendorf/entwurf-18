(() => {
  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const KRINGEL = '<svg viewBox="0 0 46 40" aria-hidden="true"><path d="M30 5C18 1 4 8 4 21c0 11 11 16 21 15 11-1 18-8 17-17C41 9 30 3 19 6"/></svg>';

  const heute = new Date(); heute.setHours(0, 0, 0, 0);
  let ansicht = new Date(heute.getFullYear(), heute.getMonth() + 1, 1);
  let gewaehlt = null;

  const tageEl = document.getElementById('tage');
  const monatEl = document.getElementById('monatsname');
  const zurueck = document.getElementById('vor-zurueck');
  const weiter = document.getElementById('vor-weiter');
  const anzeige = document.getElementById('termin-anzeige');

  function zeichne() {
    const j = ansicht.getFullYear(), m = ansicht.getMonth();
    monatEl.textContent = MONATE[m] + ' ' + j;
    zurueck.disabled = j === heute.getFullYear() && m === heute.getMonth();
    tageEl.innerHTML = '';
    const versatz = (new Date(j, m, 1).getDay() + 6) % 7;
    for (let i = 0; i < versatz; i++) tageEl.appendChild(document.createElement('span'));
    const anzahl = new Date(j, m + 1, 0).getDate();
    for (let d = 1; d <= anzahl; d++) {
      const datum = new Date(j, m, d);
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = d;
      b.setAttribute('aria-label', TAGE[datum.getDay()] + ', ' + d + '. ' + MONATE[m] + ' ' + j);
      if (datum < heute) b.disabled = true;
      if (datum.getDay() === 0 || datum.getDay() === 6) b.classList.add('wochenende');
      if (gewaehlt && +datum === +gewaehlt) { b.classList.add('gewaehlt'); b.insertAdjacentHTML('beforeend', KRINGEL); b.setAttribute('aria-pressed', 'true'); }
      b.addEventListener('click', () => waehle(datum));
      tageEl.appendChild(b);
    }
  }

  function waehle(datum) {
    gewaehlt = datum;
    anzeige.classList.remove('leer');
    anzeige.textContent = KURZ[datum.getDay()] + ', ' + datum.getDate() + '. ' + MONATE[datum.getMonth()] + ' ' + datum.getFullYear();
    zeichne();
  }

  zurueck.addEventListener('click', () => { ansicht = new Date(ansicht.getFullYear(), ansicht.getMonth() - 1, 1); zeichne(); });
  weiter.addEventListener('click', () => { ansicht = new Date(ansicht.getFullYear(), ansicht.getMonth() + 1, 1); zeichne(); });
  zeichne();

  // Chips
  document.querySelectorAll('.chips').forEach(gruppe => {
    const einzeln = gruppe.hasAttribute('data-einzeln');
    gruppe.addEventListener('click', e => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      const an = chip.getAttribute('aria-pressed') !== 'true';
      if (einzeln) gruppe.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', String(an));
    });
  });

  function setze(gruppe, werte) {
    const g = document.querySelector('.chips[data-gruppe="' + gruppe + '"]');
    g.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(werte.includes(c.textContent.trim()))));
  }

  // Anlass-Knoepfe fuellen den Eintrag vor
  document.querySelectorAll('[data-anlass]').forEach(b => b.addEventListener('click', () => {
    setze('anlass', [b.dataset.anlass]);
    setze('was', (b.dataset.was || '').split(','));
    document.getElementById('terminbuch').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  // Eintragen (Entwurf: nichts wird versendet)
  const form = document.getElementById('eintrag');
  const stempel = document.getElementById('stempel');
  const info = document.getElementById('eingetragen-info');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const anlass = [...form.querySelectorAll('[data-gruppe="anlass"] .chip[aria-pressed="true"]')].map(c => c.textContent)[0] || 'Feier';
    const was = [...form.querySelectorAll('[data-gruppe="was"] .chip[aria-pressed="true"]')].map(c => c.textContent);
    const personen = form.personen.value.trim();
    const teile = [anlass];
    if (gewaehlt) teile.push('am ' + anzeige.textContent);
    if (personen) teile.push('mit etwa ' + personen + ' Personen');
    if (was.length) teile.push('(' + was.join(', ') + ')');
    stempel.classList.remove('an'); void stempel.offsetWidth; stempel.classList.add('an');
    info.textContent = 'Ihr Eintrag: ' + teile.join(' ') + '. Im Entwurf wird nichts versendet, auf der fertigen Seite käme die Anfrage direkt bei Haus Räckers an.';
    info.classList.add('an');
  });

})();
