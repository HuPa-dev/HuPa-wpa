document.addEventListener('DOMContentLoaded', () => {
  console.log('[More] init');

  const popups = Array.from(document.querySelectorAll('.more-popup'));

  function openPopup(id) {
    const popup = document.getElementById(id);
    if (!popup) return;
    popup.hidden = false;
    const scroll = popup.querySelector('.more-popup-scroll');
    if (scroll) scroll.scrollTop = 0;
    if (id === 'tablePopup') loadBokunWidget();
  }

  function closePopup(popup) {
    popup.hidden = true;
  }

  document.querySelectorAll('[data-open-popup]').forEach(trigger => {
    trigger.addEventListener('click', () => openPopup(trigger.dataset.openPopup));
  });

  popups.forEach(popup => {
    popup.querySelectorAll('[data-close-popup]').forEach(btn => {
      btn.addEventListener('click', () => closePopup(popup));
    });
    popup.addEventListener('click', e => {
      if (e.target === popup) closePopup(popup);
    });
  });

  window.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = popups.find(p => !p.hidden);
    if (open) closePopup(open);
  });

  // FAQ accordion - each question toggles independently. Nothing else on the
  // page moves when one opens or closes, so there's no scroll-position surprise.
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      item.classList.toggle('open');
    });
  });

  // The Bokun booking calendar is lazy-loaded the first time the Reserve a
  // Table popup actually opens - it needs a visible container to size itself
  // correctly, and there's no reason to pay for the widget's JS on every page
  // load if nobody ever taps the card.
  let bokunLoaded = false;
  function loadBokunWidget() {
    if (bokunLoaded) return;
    bokunLoaded = true;

    const target = document.getElementById('bokunEmbedTarget');
    if (!target) return;
    target.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'bokunWidget';
    widgetDiv.dataset.src = 'https://widgets.bokun.io/online-sales/ac8da455-c836-4e0f-ab2c-c6ac08d5e3ac/experience-calendar/1113294';
    target.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://widgets.bokun.io/assets/javascripts/apps/build/BokunWidgetsLoader.js?bookingChannelUUID=ac8da455-c836-4e0f-ab2c-c6ac08d5e3ac';
    script.async = true;
    document.body.appendChild(script);
  }
});
