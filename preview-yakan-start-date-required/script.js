'use strict';

const earliestStartDates = document.querySelectorAll('.earliest-start-date');

if (earliestStartDates.length) {
  const tokyoDateTime = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    hourCycle: 'h23',
  });
  const displayDate = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
  });

  const updateEarliestStartDate = () => {
    const parts = Object.fromEntries(
      tokyoDateTime.formatToParts(new Date())
        .filter(({ type }) => type !== 'literal')
        .map(({ type, value }) => [type, Number(value)])
    );
    const daysToAdd = parts.hour >= 18 ? 1 : 0;
    const startDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + daysToAdd));
    const dateTime = startDate.toISOString().slice(0, 10);
    const label = `最短開通可能日：${displayDate.format(startDate)}`;

    earliestStartDates.forEach((element) => {
      element.dateTime = dateTime;
      element.textContent = label;
    });
  };

  updateEarliestStartDate();
  window.setInterval(updateEarliestStartDate, 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateEarliestStartDate();
  });
}

document.querySelectorAll('details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('details[open]').forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const stickyCta = document.querySelector('.night-sticky');

if (stickyCta) {
  let ticking = false;

  const updateStickyCta = () => {
    const hasStartedScrolling = window.scrollY > 8;
    stickyCta.classList.toggle('is-visible', hasStartedScrolling);
    stickyCta.setAttribute('aria-hidden', String(!hasStartedScrolling));
    ticking = false;
  };

  const requestStickyCtaUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateStickyCta);
  };

  updateStickyCta();
  window.addEventListener('scroll', requestStickyCtaUpdate, { passive: true });
  window.addEventListener('resize', requestStickyCtaUpdate);
}

const cancelModal = document.getElementById('cancel-guide');
const modalOpenButtons = document.querySelectorAll('.modal-open');
const contactForm = document.getElementById('contact-form');
const startDateInput = document.querySelector('.contact-form input[name="start_date"]');
let lastModalOpenButton = null;

const closeCancelModal = () => {
  if (!cancelModal) return;
  cancelModal.classList.remove('is-open');
  cancelModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-active');
  lastModalOpenButton?.focus();
};

modalOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!cancelModal) return;
    lastModalOpenButton = button;
    cancelModal.classList.add('is-open');
    cancelModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-active');
    cancelModal.querySelector('.cancel-modal-close')?.focus();
  });
});

cancelModal?.querySelectorAll('[data-modal-close]').forEach((button) => {
  button.addEventListener('click', closeCancelModal);
});

const formatStartDateInput = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
};

const validateStartDate = (value) => {
  if (!value) return '利用開始希望日を入力してください。';
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(value)) return '利用開始希望日はYYYY/MM/DD形式で入力してください。';

  const [yearText, monthText, dayText] = value.split('/');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsedDate = new Date(year, month - 1, day);
  if (Number.isNaN(parsedDate.getTime())) return '有効な日付を入力してください。';
  if (
    parsedDate.getFullYear() !== year
    || parsedDate.getMonth() !== month - 1
    || parsedDate.getDate() !== day
  ) {
    return '有効な日付を入力してください。';
  }

  return '';
};

const updateStartDateValidity = () => {
  if (!startDateInput) return true;
  const message = validateStartDate(startDateInput.value);
  startDateInput.setCustomValidity(message);
  return !message;
};

if (startDateInput) {
  startDateInput.addEventListener('input', (event) => {
    const nextValue = formatStartDateInput(event.target.value);
    event.target.value = nextValue;
    updateStartDateValidity();
  });
  startDateInput.addEventListener('blur', updateStartDateValidity);
}

if (contactForm && startDateInput) {
  contactForm.addEventListener('submit', (event) => {
    if (!updateStartDateValidity()) {
      event.preventDefault();
      event.stopPropagation();
      startDateInput.reportValidity();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && cancelModal?.classList.contains('is-open')) closeCancelModal();
});
