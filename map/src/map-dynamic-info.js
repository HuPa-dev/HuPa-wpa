console.log("dynamic info loaded");
const popup = document.querySelector('.popup');
const title = popup.querySelector('.popup-title');
const text  = popup.querySelector('.popup-text');
const link  = popup.querySelector('.popup-link');

document.querySelectorAll('.hotspot').forEach(btn => {
  btn.addEventListener('click', () => {
    title.textContent = btn.dataset.title;
    text.innerHTML  = btn.dataset.text;

    if (btn.dataset.link) {
      link.href = btn.dataset.link;
      link.style.display = "inline-block";  // show the link
    } else {
      link.removeAttribute('href');
      link.style.display = "none";          // hide the link
    }

    popup.hidden = false;
  });
});

// Close buttons and background
popup.querySelector('.close').onclick = () => popup.hidden = true;
popup.onclick = e => e.target === popup && (popup.hidden = true);

// Ensure link clicks don't bubble and get blocked by popup
link.addEventListener('click', e => {
  e.stopPropagation();
});
