document.addEventListener('DOMContentLoaded', () => {
  console.log('[Activities] init');

  const cards = Array.from(document.querySelectorAll('.activity-card'));
  const popup = document.getElementById('activityPopup');
  const popupPanel = popup.querySelector('.activity-popup-panel');
  const popupScroll = popup.querySelector('.activity-popup-scroll');
  const popupMedia = popup.querySelector('.activity-popup-media');
  const popupTitle = popup.querySelector('.activity-popup-title');
  const popupChips = popup.querySelector('.activity-popup-chips');
  const popupBody = popup.querySelector('.activity-popup-body');
  const popupClose = popup.querySelector('.activity-popup-close');

  // If a hero photo fails to load (e.g. an externally-hosted image going away),
  // fall back to the same placeholder treatment used for cards without a photo yet.
  window.activityMediaFallback = function (img) {
    const media = img.closest('.activity-media');
    if (!media) return;
    media.classList.add('no-photo');
    const icon = document.createElement('span');
    icon.className = 'placeholder-icon';
    icon.textContent = img.dataset.fallbackIcon || '📷';
    media.appendChild(icon);
    img.remove();
  };

  // Fetch every article fragment once, up front, and cache it in each card's hidden
  // .activity-content element - the popup just copies from there when opened.
  const fetches = cards.map(card => {
    const contentEl = card.querySelector('.activity-content');
    const src = contentEl.dataset.article;
    return fetch(src)
      .then(r => r.text())
      .then(html => { contentEl.innerHTML = html; })
      .catch(err => console.warn('[Activities] failed to load', src, err));
  });

  function openPopup(card) {
    const accent = card.style.getPropertyValue('--accent');
    popupPanel.style.setProperty('--accent', accent);
    popupMedia.innerHTML = card.querySelector('.activity-media').innerHTML;
    popupTitle.textContent = card.querySelector('h2').textContent;
    popupChips.innerHTML = card.querySelector('.activity-chips').innerHTML;
    popupBody.innerHTML = card.querySelector('.activity-content').innerHTML;

    popup.hidden = false;
    popupScroll.scrollTop = 0;

    // Keep the URL in sync so the "Learn more" links from the map keep working both ways.
    if (window.location.hash.slice(1) !== card.id) {
      history.replaceState(null, '', '#' + card.id);
    }
  }

  function closePopup() {
    popup.hidden = true;
  }

  cards.forEach(card => {
    card.querySelectorAll('[data-toggle]').forEach(el => {
      el.addEventListener('click', (e) => {
        // Don't hijack real interactive content inside the card (future video controls, links, etc.)
        if (e.target.closest('a[href], video, audio')) return;
        openPopup(card);
      });
    });
  });

  popupClose.addEventListener('click', closePopup);
  popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !popup.hidden) closePopup();
  });

  // Open a card's popup via URL hash (used by the map popup's "Learn more" links), once
  // its article content has actually loaded.
  function openFromHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const card = document.getElementById(hash);
    if (!card || !card.classList.contains('activity-card')) return;
    openPopup(card);
  }

  Promise.all(fetches).then(openFromHash);
  window.addEventListener('hashchange', openFromHash);
});
