document.addEventListener('DOMContentLoaded', () => {
  console.log('[Accordion] init');

  const headers = document.querySelectorAll('.accordion-header');

  function openWhenReady(header, content, tries = 10) {
    if (content.scrollHeight > 0) {
      header.click();
      return;
    }

    if (tries <= 0) {
      console.warn('[Accordion] content never gained height', content);
      return;
    }

    setTimeout(() => {
      openWhenReady(header, content, tries - 1);
    }, 100);
  }

  headers.forEach((header, index) => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');

      console.log('[Accordion] click', item.id);

      document.querySelectorAll('.accordion-content').forEach(c => {
        if (c !== content) c.style.height = 0;
      });

      if (content.style.height && content.style.height !== '0px') {
        content.style.height = 0;
      } else {
        requestAnimationFrame(() => {
          content.style.height = content.scrollHeight + 'px';
        });
      }
    });
  });

  // Open from hash
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  const item = document.getElementById(hash);
  if (!item) return;

  const header = item.querySelector('.accordion-header');
  if (!header) return;

  openWhenReady(header, item.querySelector('.accordion-content'));

  setTimeout(() => {
    item.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
});
