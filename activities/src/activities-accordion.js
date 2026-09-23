// If a hero photo fails to load (e.g. an externally-hosted image going away),
// fall back to the same placeholder treatment used for cards without a photo yet.
window.activityMediaFallback = function (img) {
  const media = img.closest('.activity-media');
  if (!media) return;
  media.classList.add('no-photo');
  const icon = document.createElement('span');
  icon.className = 'placeholder-icon';
  icon.textContent = img.dataset.fallbackIcon || '\uD83D\uDCF7';
  media.appendChild(icon);
  img.remove();
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Activities] init');

  const cards = Array.from(document.querySelectorAll('.activity-card'));

  // Fetch each article fragment once, up front, and wrap it so height can be measured reliably.
  const fetches = cards.map(card => {
    const contentEl = card.querySelector('.activity-content');
    const summaryBtn = card.querySelector('.activity-summary');
    const src = contentEl.dataset.article;

    return fetch(src)
      .then(r => r.text())
      .then(html => {
        contentEl.innerHTML = `<div class="activity-content-inner">${html}</div>`;
      })
      .catch(err => console.warn('[Activities] failed to load', src, err))
      .finally(() => {
        summaryBtn.setAttribute('aria-busy', 'false');
      });
  });

  function setOpen(card, open) {
    const contentEl = card.querySelector('.activity-content');
    const summaryBtn = card.querySelector('.activity-summary');

    card.classList.toggle('open', open);
    summaryBtn.setAttribute('aria-expanded', String(open));

    if (open) {
      contentEl.style.height = contentEl.scrollHeight + 'px';
    } else {
      contentEl.style.height = '0px';
    }
  }

  function toggleCard(card) {
    const isOpen = card.classList.contains('open');
    cards.forEach(c => { if (c !== card) setOpen(c, false); });
    setOpen(card, !isOpen);
  }

  cards.forEach(card => {
    card.querySelectorAll('[data-toggle]').forEach(el => {
      el.addEventListener('click', (e) => {
        // Don't hijack real interactive content inside the card (future video controls, links, etc.)
        if (e.target.closest('a[href], video, audio, button:not(.activity-summary)')) return;
        toggleCard(card);
      });
    });
  });

  // Recalculate the open card's height once its images/gallery photos finish loading,
  // so the expand animation doesn't clip content that was still loading.
  function watchImages(card) {
    const contentEl = card.querySelector('.activity-content');
    const imgs = Array.from(contentEl.querySelectorAll('img'));
    let remaining = imgs.filter(img => !img.complete).length;
    if (remaining === 0) return;
    imgs.forEach(img => {
      if (img.complete) return;
      img.addEventListener('load', () => {
        remaining--;
        if (remaining === 0 && card.classList.contains('open')) {
          contentEl.style.height = contentEl.scrollHeight + 'px';
        }
      }, { once: true });
    });
  }

  // Open a card via URL hash (used by the map popup's "Learn more" links), once its
  // article content has actually loaded so the height calculation is correct.
  function openFromHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const card = document.getElementById(hash);
    if (!card || !card.classList.contains('activity-card')) return;
    if (card.classList.contains('open')) return;

    cards.forEach(c => { if (c !== card) setOpen(c, false); });
    setOpen(card, true);
    requestAnimationFrame(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  Promise.all(fetches).then(() => {
    cards.forEach(watchImages);
    openFromHash();
  });

  // Also handle a hash arriving without a full page load (e.g. same-tab in-app navigation)
  window.addEventListener('hashchange', openFromHash);
});
