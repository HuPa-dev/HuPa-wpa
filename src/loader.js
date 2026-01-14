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
