console.log("dynamic info loaded");

const popup  = document.querySelector('.popup');
const title  = popup.querySelector('.popup-title');
const text   = popup.querySelector('.popup-text');
const link   = popup.querySelector('.popup-link');
const mapEl  = document.querySelector('.map');
const svgEl  = mapEl.querySelector('svg');

const popupPanel = popup.querySelector('.popup-panel');
const popupNum   = popup.querySelector('.popup-num');
const popupMedia = popup.querySelector('.popup-media');

// Photo banner: each pin's photo lives in its data-photo attribute in map/index.html.
// Empty data-photo (or a photo that fails to load) shows a coloured placeholder with data-photo-icon.
function setPopupMedia(hotspot) {
  const src = hotspot.dataset.photo;
  const icon = hotspot.dataset.photoIcon || '📷';
  const placeholder = () => {
    popupMedia.innerHTML = '';
    popupMedia.classList.add('no-photo');
    const span = document.createElement('span');
    span.className = 'placeholder-icon';
    span.textContent = icon;
    popupMedia.appendChild(span);
  };
  popupMedia.classList.remove('no-photo');
  if (!src) { placeholder(); return; }
  const img = new Image();
  img.alt = '';
  img.decoding = 'async';
  img.onerror = placeholder;
  img.src = src;
  popupMedia.innerHTML = '';
  popupMedia.appendChild(img);
}
let selectedSpot = null;

function legendRowFor(id) {
  return document.querySelector(`.legend-row[data-target="${CSS.escape(id)}"]`);
}

function openPopupFor(hotspot) {
  title.textContent = hotspot.dataset.title;
  text.innerHTML = hotspot.dataset.text;

  // Number + colour come from the matching legend row so they always agree with the map
  const row = legendRowFor(hotspot.id);
  const color = row ? row.style.getPropertyValue('--pin-color') : '';
  popupPanel.style.setProperty('--accent', color || '#e27d43');
  popupNum.textContent = row ? row.querySelector('.legend-num').textContent : '';
  setPopupMedia(hotspot);

  if (hotspot.dataset.link) {
    link.href = hotspot.dataset.link;
    link.style.display = '';
  } else {
    link.removeAttribute('href');
    link.style.display = 'none';
  }

  if (selectedSpot) selectedSpot.classList.remove('selected');
  selectedSpot = hotspot;
  hotspot.classList.add('selected');

  Sheet.open(popup);

  // Once the sheet has laid out, slide the map so the pin sits in the visible strip above it
  requestAnimationFrame(() => requestAnimationFrame(() => {
    // use layout height, not getBoundingClientRect - the sheet is still mid slide-in here
    const sheetTop = popup.getBoundingClientRect().bottom - popupPanel.offsetHeight;
    const mapTop = mapEl.getBoundingClientRect().top;
    const visible = Math.max(80, sheetTop - mapTop);
    panToHotspot(hotspot, { thenPulse: false, centerY: visible / 2 });
  }));
}

popup.addEventListener('sheet:close', () => {
  if (selectedSpot) selectedSpot.classList.remove('selected');
  selectedSpot = null;
});

// --- Hotspots: the pin groups themselves (placed directly in Illustrator) are the interactive elements now ---
const hotspots = Array.from(document.querySelectorAll('.hotspot'));

hotspots.forEach(spot => {
  // Give every pin a pulse ring, cloned from its own circle so cx/cy/r/color always match exactly
  const baseCircle = spot.querySelector('circle');
  if (baseCircle) {
    const ring = baseCircle.cloneNode(false);
    ring.classList.add('pulse-ring');
    ring.removeAttribute('fill');
    spot.appendChild(ring);

    // Pins are tiny on a phone - add an invisible circle ~2x the size as the real tap target
    const hit = baseCircle.cloneNode(false);
    hit.classList.add('hit-area');
    hit.removeAttribute('fill');
    hit.removeAttribute('stroke');
    hit.setAttribute('r', String(parseFloat(baseCircle.getAttribute('r') || '10') * 2));
    spot.appendChild(hit);
  }

  spot.addEventListener('click', () => openPopupFor(spot));
  spot.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPopupFor(spot);
    }
  });
});

function pulse(hotspot) {
  hotspot.classList.remove('pulsing');
  void hotspot.getBoundingClientRect(); // force reflow so a repeat tap can retrigger the animation
  hotspot.classList.add('pulsing');
}

// Smoothly pan the (possibly legend-shrunk) map viewport so `hotspot` ends up centered, then pulse it.
function panToHotspot(hotspot, { thenPulse = true, centerY = null } = {}) {
  const target = hotspot.querySelector('circle:not(.hit-area):not(.pulse-ring)') || hotspot;
  const pinRect = target.getBoundingClientRect();
  const mapRect = mapEl.getBoundingClientRect();

  const pinX = (pinRect.left + pinRect.width / 2) - mapRect.left + mapEl.scrollLeft;
  const pinY = (pinRect.top + pinRect.height / 2) - mapRect.top + mapEl.scrollTop;

  mapEl.scrollTo({
    left: pinX - mapEl.clientWidth / 2,
    top: pinY - (centerY ?? mapEl.clientHeight / 2),
    behavior: 'smooth'
  });

  if (!thenPulse) return;

  // Fire the pulse once scrolling has settled - debounced on 'scroll' rather than relying on
  // the not-universally-supported 'scrollend' event.
  let settleTimer;
  function onScroll() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(finish, 120);
  }
  function finish() {
    mapEl.removeEventListener('scroll', onScroll);
    pulse(hotspot);
  }
  mapEl.addEventListener('scroll', onScroll);
  settleTimer = setTimeout(finish, 120);
}


// Ensure link clicks don't bubble and get blocked by popup
link.addEventListener('click', e => {
  e.stopPropagation();
});

// --- Desktop click-and-drag panning ---
svgEl.setAttribute('draggable', 'false'); // stop native ghost-drag

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
  if (dragMoved && e.target.closest('.hotspot')) {
    e.stopPropagation();
    e.preventDefault();
  }
}, true); // capture phase, runs before the hotspot's own click listener

// --- Legend sheet ---
const legendSheet  = document.getElementById('legendSheet');
const legendHandle = document.getElementById('legendHandle');

legendHandle.addEventListener('click', () => {
  const expanded = legendSheet.classList.toggle('expanded');
  legendHandle.setAttribute('aria-expanded', String(expanded));
});


function closeLegendThen(cb) {
  if (!legendSheet.classList.contains('expanded')) { cb(); return; }
  legendSheet.classList.remove('expanded');
  legendHandle.setAttribute('aria-expanded', 'false');

  let done = false;
  function finish() {
    if (done) return;
    done = true;
    legendSheet.removeEventListener('transitionend', onEnd);
    cb();
  }
  function onEnd(e) {
    if (e.target === legendSheet && e.propertyName === 'height') finish();
  }
  legendSheet.addEventListener('transitionend', onEnd);
  setTimeout(finish, 400); // fallback in case transitionend doesn't fire
}

document.querySelectorAll('.legend-row').forEach(row => {
  row.addEventListener('click', () => {
    const targetHotspot = document.getElementById(row.dataset.target);
    if (!targetHotspot) return;
    closeLegendThen(() => panToHotspot(targetHotspot));
  });
});
