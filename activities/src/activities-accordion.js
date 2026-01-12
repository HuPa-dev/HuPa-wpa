const headers = document.querySelectorAll('.accordion-header');

headers.forEach(header => {
  header.addEventListener('click', () => {
    const item = header.parentElement;
    const content = item.querySelector('.accordion-content');

    // Close all other accordion contents
    document.querySelectorAll('.accordion-content').forEach(c => {
      if (c !== content) {
        c.style.height = 0;
      }
    });

    // Toggle current one
    if (content.style.height && content.style.height !== "0px") {
      content.style.height = 0; // close
    } else {
      content.style.height = content.scrollHeight + "px"; // open
    }
  });
});

function openAccordionFromHash() {
  const hash = window.location.hash.slice(1); // remove #
  if (!hash) return;

  const item = document.getElementById(hash);
  if (!item) return;

  const content = item.querySelector('.accordion-content');
  content.style.height = content.scrollHeight + "px";

  // Close other accordion items
  document.querySelectorAll('.accordion-content').forEach(c => {
    if (c !== content) c.style.height = 0;
  });

  // Optionally scroll into view
  item.scrollIntoView({ behavior: 'smooth' });
}

window.addEventListener('load', openAccordionFromHash);
