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

// --- Desktop click-and-drag panning ---
const mapEl = document.querySelector('.map');
const mapImg = mapEl.querySelector('img');
mapImg.setAttribute('draggable', 'false'); // stop native image ghost-drag

let isDragging = false;
let startX, startY, scrollLeft, scrollTop;
let dragMoved = false;
const DRAG_THRESHOLD = 5; // px, to distinguish click from drag

mapEl.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragMoved = false;
  mapEl.classList.add('dragging');
  startX = e.pageX;
  startY = e.pageY;
  scrollLeft = mapEl.scrollLeft;
  scrollTop = mapEl.scrollTop;
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.pageX - startX;
  const dy = e.pageY - startY;

  if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
    dragMoved = true;
  }

  mapEl.scrollLeft = scrollLeft - dx;
  mapEl.scrollTop = scrollTop - dy;
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  mapEl.classList.remove('dragging');
});

// Suppress hotspot click if the mousedown started a real drag
mapEl.addEventListener('click', (e) => {
  if (dragMoved && e.target.classList.contains('hotspot')) {
    e.stopPropagation();
    e.preventDefault();
  }
}, true); // capture phase, runs before the hotspot's own click listener