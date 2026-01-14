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
      if (!hash) return;

      const item = document.getElementById(hash);
      if (!item) return;

      const content = item.querySelector('.accordion-content');
      if (!content) return;

      document.querySelectorAll('.accordion-content').forEach(c => {
        c.style.height = c === content ? c.scrollHeight + 'px' : '';
      });

      item.classList.add('active');

      setTimeout(() => {
        item.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
  

});
