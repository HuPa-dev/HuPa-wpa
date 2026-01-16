document.addEventListener('DOMContentLoaded', () => {
  console.log('[Accordion] DOM loaded');

  const headers = document.querySelectorAll('.accordion-header');
  console.log('[Accordion] Headers found:', headers.length);

  headers.forEach((header, index) => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');

      console.log('[Accordion] CLICK', {
        index,
        header,
        itemId: item.id || '(no id)',
        content
      });

      document.querySelectorAll('.accordion-content').forEach(c => {
        if (c !== content) {
          c.style.height = 0;
          console.log('[Accordion] Closed other content', c);
        }
      });

      if (content.style.height && content.style.height !== '0px') {
        console.log('[Accordion] Closing current');
        content.style.height = 0;
      } else {
        console.log('[Accordion] Opening current', {
          scrollHeight: content.scrollHeight
        });
        requestAnimationFrame(() => {
          content.style.height = content.scrollHeight + 'px';
        });
      }
    });
  });

  // Open from hash
  const hash = window.location.hash.slice(1);
  console.log('[Accordion] Hash detected:', hash || '(none)');

  if (!hash) return;

  const item = document.getElementById(hash);
  console.log('[Accordion] Item from hash:', item);

  if (!item) return;

  const header = item.querySelector('.accordion-header');
  console.log('[Accordion] Header from item:', header);

  if (!header) return;

  console.log('[Accordion] Triggering click via hash');
  loadContent().then(() => {
    header.click();
  });


  setTimeout(() => {
    console.log('[Accordion] Scrolling into view');
    item.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
});
