const loader = document.getElementById('page-loader');


function waitForImages(root = document) {
  const imgs = [...root.querySelectorAll('img')];

  return Promise.all(
    imgs.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise(res => {
            img.onload = img.onerror = res;
          })
    )
  );
}

async function pageReady() {
  // Wait for DOM
  await new Promise(res =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', res, { once: true })
      : res()
  );

  // Wait for images already in DOM
  await waitForImages();

  // Small frame delay to avoid race conditions
  requestAnimationFrame(() => {
    loader.classList.add('hidden');
  });
}

pageReady();

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
