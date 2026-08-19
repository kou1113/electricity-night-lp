'use strict';

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
const isDateTypeStartDate = startDateInput ? startDateInput.type === 'date' : false;

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

const validateStartDate = (value) => {
  if (!value) return '利用開始希望日を入力してください。';
  if (isDateTypeStartDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '利用開始希望日はYYYY-MM-DD形式で入力してください。';
    const parsedDate = new Date(`${value}T00:00`);
    if (Number.isNaN(parsedDate.getTime())) return '有効な日付を入力してください。';
    return '';
  }

  const formatStartDateInput = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
    return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
  };

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
    if (!isDateTypeStartDate) {
      const formatStartDateInput = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 8);
        if (digits.length <= 4) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
        return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
      };

      event.target.value = formatStartDateInput(event.target.value);
    }
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
