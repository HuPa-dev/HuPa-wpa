const loader = document.getElementById('page-loader');


// Max time the loading screen is allowed to stay up, no matter what is still loading.
const LOADER_MAX_WAIT = 2500; // ms

// Only wait for images the visitor will actually see straight away:
// - skip loading="lazy" images (a phone may not fetch these until they're scrolled
//   into view, so waiting on them could keep the loader up forever)
// - skip images that are hidden or below the first screen
// Uses addEventListener so it never overwrites an image's own onerror/onload
// handler (the activity cards use onerror to swap in their placeholder).
function waitForImages(root = document) {
  const viewH = window.innerHeight || document.documentElement.clientHeight;
  const imgs = [...root.querySelectorAll('img')].filter(img => {
    if (img.loading === 'lazy') return false;
    const r = img.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false; // hidden / not laid out
    return r.top < viewH;                               // on the first screen
  });

  return Promise.all(
    imgs.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise(res => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
          })
    )
  );
}

function hideLoader() {
  if (!loader || loader.classList.contains('hidden')) return;
  requestAnimationFrame(() => loader.classList.add('hidden'));
}

async function pageReady() {
  // Safety net: a slow or stalled request can never trap the visitor behind the spinner.
  setTimeout(hideLoader, LOADER_MAX_WAIT);

  // Wait for DOM
  await new Promise(res =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', res, { once: true })
      : res()
  );

  // Wait for the images visible on the first screen
  await waitForImages();

  hideLoader();
}

pageReady();

// Coming back with the browser's back button can restore a page from cache with the loader frozen on.
window.addEventListener('pageshow', e => { if (e.persisted) hideLoader(); });

// Expose the bottom nav's real height as --navlinks-h so every page can
// reserve exactly the right amount of space under its content.
(function () {
  function setNavHeightVar() {
    const nav = document.querySelector('.navlinks');
    if (nav) document.documentElement.style.setProperty('--navlinks-h', nav.offsetHeight + 'px');
  }
  setNavHeightVar();
  window.addEventListener('resize', setNavHeightVar);
  window.addEventListener('load', setNavHeightVar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setNavHeightVar);
})();
