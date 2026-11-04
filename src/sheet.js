/*
  Shared bottom-sheet behaviour for every popup in the app.

  Markup:
    <div class="sheet-overlay" hidden>
      <div class="sheet">
        <div class="sheet-grabber"></div>
        <button class="sheet-close" data-close-sheet>…</button>
        <div class="sheet-scroll"> … </div>
      </div>
    </div>

  API:
    Sheet.open(overlayEl)   - slides the sheet up
    Sheet.close(overlayEl)  - slides it down, then sets [hidden]
    overlayEl fires 'sheet:open' / 'sheet:close' events.

  Closes on: close button, tapping the dimmed backdrop, Escape,
  or swiping down on the grabber / on the content while it's
  scrolled to the top.
*/
(function () {
  const DISMISS_DISTANCE = 110; // px dragged before release closes
  const DISMISS_VELOCITY = 0.6; // px/ms flick speed that closes

  function getSheet(overlay) {
    return overlay.querySelector('.sheet');
  }

  function open(overlay) {
    if (!overlay) return;
    clearTimeout(overlay._sheetTimer);
    const sheet = getSheet(overlay);
    if (sheet) sheet.style.transform = '';
    overlay.hidden = false;
    // force a reflow so the transition runs from the closed position
    void overlay.offsetHeight;
    overlay.classList.add('is-open');
    const scroll = overlay.querySelector('.sheet-scroll');
    if (scroll) scroll.scrollTop = 0;
    overlay.dispatchEvent(new CustomEvent('sheet:open'));
  }

  function close(overlay) {
    if (!overlay || overlay.hidden || !overlay.classList.contains('is-open')) return;
    const sheet = getSheet(overlay);
    overlay.classList.remove('is-open');
    if (sheet) sheet.style.transform = '';
    overlay.dispatchEvent(new CustomEvent('sheet:close'));

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (!overlay.classList.contains('is-open')) overlay.hidden = true;
    };
    if (sheet) {
      sheet.addEventListener('transitionend', function onEnd(e) {
        if (e.target !== sheet) return;
        sheet.removeEventListener('transitionend', onEnd);
        finish();
      });
    }
    overlay._sheetTimer = setTimeout(finish, 480); // fallback
  }

  function wire(overlay) {
    if (overlay._sheetWired) return;
    overlay._sheetWired = true;
    const sheet = getSheet(overlay);
    if (!sheet) return;

    overlay.addEventListener('click', e => {
      if (e.target === overlay) close(overlay);
    });
    overlay.querySelectorAll('[data-close-sheet]').forEach(btn => {
      btn.addEventListener('click', () => close(overlay));
    });

    // --- swipe down to dismiss (touch) + drag the grabber (mouse) ---
    const scroll = sheet.querySelector('.sheet-scroll');
    let startY = 0, lastY = 0, lastT = 0, velocity = 0;
    let tracking = false, dragging = false, justDragged = false;

    sheet.addEventListener('click', ev => {
      if (justDragged) { ev.stopPropagation(); ev.preventDefault(); }
    }, true);

    function canStart(target) {
      if (target.closest('.sheet-grabber')) return true;
      if (target.closest('.activity-gallery, .bokun-embed, input, select, textarea')) return false;
      return !scroll || scroll.scrollTop <= 0;
    }

    function begin(y, target) {
      if (!canStart(target)) return false;
      startY = lastY = y;
      lastT = performance.now();
      velocity = 0;
      tracking = true;
      dragging = false;
      return true;
    }

    // returns true when the move was consumed by the sheet drag
    function move(y) {
      if (!tracking) return false;
      const dy = y - startY;
      if (!dragging) {
        if (dy > 8) {
          dragging = true;
          sheet.classList.add('is-dragging');
        } else if (dy < -8) {
          tracking = false; // scrolling up - hand it to the content
          return false;
        } else {
          return false;
        }
      }
      const now = performance.now();
      velocity = (y - lastY) / Math.max(1, now - lastT);
      lastY = y;
      lastT = now;
      // a touch of resistance makes it feel physical
      sheet.style.transform = `translateY(${Math.max(0, dy - 8) * 0.9}px)`;
      return true;
    }

    function finishDrag(y) {
      if (!tracking) return;
      tracking = false;
      if (!dragging) return;
      dragging = false;
      sheet.classList.remove('is-dragging');
      const dy = y - startY;
      if (dy > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
        close(overlay);
      } else {
        sheet.style.transform = '';
      }
      // swallow a click that may follow a drag release
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 350);
    }

    sheet.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) { tracking = false; return; }
      begin(e.touches[0].clientY, e.target);
    }, { passive: true });

    sheet.addEventListener('touchmove', e => {
      if (!tracking) return;
      if (move(e.touches[0].clientY) && e.cancelable) e.preventDefault();
    }, { passive: false });

    sheet.addEventListener('touchend', e => {
      const t = e.changedTouches[0];
      finishDrag(t ? t.clientY : lastY);
    });
    sheet.addEventListener('touchcancel', () => finishDrag(lastY));

    const grabber = sheet.querySelector('.sheet-grabber');
    if (grabber) {
      grabber.addEventListener('mousedown', e => {
        begin(e.clientY, e.target);
        const mm = ev => move(ev.clientY);
        const mu = ev => {
          window.removeEventListener('mousemove', mm);
          window.removeEventListener('mouseup', mu);
          finishDrag(ev.clientY);
        };
        window.addEventListener('mousemove', mm);
        window.addEventListener('mouseup', mu);
        e.preventDefault();
      });
    }
  }

  function init() {
    document.querySelectorAll('.sheet-overlay').forEach(wire);
  }

  window.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const openOne = [...document.querySelectorAll('.sheet-overlay.is-open')].pop();
    if (openOne) close(openOne);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.Sheet = { open, close, wire };
})();
