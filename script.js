'use strict';

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
