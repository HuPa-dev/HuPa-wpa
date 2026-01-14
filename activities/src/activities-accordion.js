document.addEventListener('DOMContentLoaded', () => {
  const headers = document.querySelectorAll('.accordion-header');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');

      document.querySelectorAll('.accordion-content').forEach(c => {
        if (c !== content) c.style.height = 0;
      });

      if (content.style.height && content.style.height !== "0px") {
        content.style.height = 0;
      } else {
        content.style.height = content.scrollHeight + "px";
      }
    });
  });

  // Open from hash
  const hash = window.location.hash.slice(1);
  if (hash) {
    const item = document.getElementById(hash);
    if (item) {
      const content = item.querySelector('.accordion-content');
      if (content) {
        content.style.height = content.scrollHeight + "px";
        document.querySelectorAll('.accordion-content').forEach(c => {
          if (c !== content) c.style.height = 0;
        });
        item.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
});
