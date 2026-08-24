/* NIDA MIMARLIK — appointment booking calendar
   Weekdays only (Pzt-Cum), 09:00-18:00, hourly slots.
   No backend: submission hands off to the visitor's mail client, same
   pattern as the contact form. This is a REQUEST, not an instant-confirmed
   booking — the UI copy makes that explicit since availability isn't
   tracked centrally. */
(function () {
  'use strict';

  var grid = document.getElementById('rdvGrid');
  if (!grid) return;

  var monthLabelEl = document.getElementById('rdvMonthLabel');
  var prevBtn = document.getElementById('rdvPrev');
  var nextBtn = document.getElementById('rdvNext');
  var slotsSection = document.getElementById('rdvSlots');
  var slotsGrid = document.getElementById('rdvSlotsGrid');
  var summaryText = document.getElementById('rdvSummaryText');
  var form = document.getElementById('appointment-form');
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  var WEEKDAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  var MONTH_LABELS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  var DAY_LABELS_LONG = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  var SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();

  var selectedDate = null; // Date
  var selectedSlot = null; // "HH:MM"

  function mondayFirstIndex(jsDay) {
    return (jsDay + 6) % 7; // Sun(0)->6, Mon(1)->0 ... Sat(6)->5
  }

  function sameDate(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function updateSummary() {
    if (!selectedDate) {
      summaryText.textContent = 'Lütfen takvimden bir tarih ve saat seçin.';
      return;
    }
    var dow = DAY_LABELS_LONG[mondayFirstIndex(selectedDate.getDay())];
    var dateStr = selectedDate.getDate() + ' ' + MONTH_LABELS[selectedDate.getMonth()] + ' ' + selectedDate.getFullYear() + ', ' + dow;
    if (selectedSlot) {
      summaryText.textContent = dateStr + ' — ' + selectedSlot;
    } else {
      summaryText.textContent = dateStr + ' (saat seçilmedi)';
    }
  }

  function renderSlots() {
    if (!selectedDate) {
      slotsSection.hidden = true;
      return;
    }
    slotsSection.hidden = false;
    slotsGrid.innerHTML = '';
    SLOTS.forEach(function (time) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rdv-slot';
      btn.textContent = time;
      if (selectedSlot === time) btn.classList.add('is-selected');
      btn.addEventListener('click', function () {
        selectedSlot = time;
        renderSlots();
        updateSummary();
      });
      slotsGrid.appendChild(btn);
    });
  }

  function renderCalendar() {
    monthLabelEl.textContent = MONTH_LABELS[viewMonth] + ' ' + viewYear;

    var isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    prevBtn.disabled = isCurrentMonth;

    grid.innerHTML = '';

    var firstOfMonth = new Date(viewYear, viewMonth, 1);
    var leadingBlanks = mondayFirstIndex(firstOfMonth.getDay());
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (var i = 0; i < leadingBlanks; i++) {
      var blank = document.createElement('span');
      blank.className = 'rdv-day is-empty';
      grid.appendChild(blank);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(viewYear, viewMonth, d);
      var dow = mondayFirstIndex(date.getDay());
      var isWeekend = dow === 5 || dow === 6;
      var isPast = date < today;
      var disabled = isWeekend || isPast;

      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'rdv-day';
      cell.textContent = String(d);
      if (disabled) cell.classList.add('is-disabled');
      if (sameDate(date, today)) cell.classList.add('is-today');
      if (selectedDate && sameDate(date, selectedDate)) cell.classList.add('is-selected');

      if (!disabled) {
        cell.addEventListener('click', function (clickedDate) {
          return function () {
            selectedDate = clickedDate;
            selectedSlot = null;
            renderCalendar();
            renderSlots();
            updateSummary();
            slotsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          };
        }(date));
      } else {
        cell.disabled = true;
      }

      grid.appendChild(cell);
    }
  }

  prevBtn.addEventListener('click', function () {
    viewMonth -= 1;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    renderCalendar();
  });
  nextBtn.addEventListener('click', function () {
    viewMonth += 1;
    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    renderCalendar();
  });

  renderCalendar();
  updateSummary();

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form-note');
      var name = form.querySelector('#af-name').value.trim();
      var phone = form.querySelector('#af-phone').value.trim();
      var email = form.querySelector('#af-email').value.trim();
      var subject = form.querySelector('#af-subject').value;
      var note_field = form.querySelector('#af-note').value.trim();

      if (!selectedDate || !selectedSlot) {
        note.textContent = 'Lütfen önce takvimden bir tarih ve saat seçin.';
        note.classList.remove('is-ok');
        return;
      }
      if (!name || !phone || !email || !subject) {
        note.textContent = 'Lütfen isim, telefon, e-posta ve randevu konusu alanlarını doldurun.';
        note.classList.remove('is-ok');
        return;
      }

      var dow = DAY_LABELS_LONG[mondayFirstIndex(selectedDate.getDay())];
      var dateStr = selectedDate.getDate() + ' ' + MONTH_LABELS[selectedDate.getMonth()] + ' ' + selectedDate.getFullYear() + ' ' + dow;

      var to = 'nidamimarlik1@gmail.com';
      var mailSubject = 'Randevu Talebi — ' + name + ' — ' + dateStr + ' ' + selectedSlot;
      var body =
        'Talep edilen tarih: ' + dateStr + '\n' +
        'Talep edilen saat: ' + selectedSlot + '\n\n' +
        'İsim: ' + name + '\n' +
        'Telefon: ' + phone + '\n' +
        'E-posta: ' + email + '\n' +
        'Randevu Konusu: ' + subject + '\n' +
        (note_field ? '\nNot:\n' + note_field : '');

      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(mailSubject) + '&body=' + encodeURIComponent(body);

      note.textContent = 'E-posta uygulamanız açılıyor — mesajınızı gönderdiğinizde randevu talebiniz iletilecek. Ekibimiz en kısa sürede size dönüş yapacaktır.';
      note.classList.add('is-ok');
    });
  }
})();
