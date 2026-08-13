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

document.getElementById('contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!event.currentTarget.checkValidity()) {
    event.currentTarget.reportValidity();
    return;
  }
  window.alert('こちらは表示確認用ページです。メールは送信されません。');
});

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

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && cancelModal?.classList.contains('is-open')) closeCancelModal();
});
