// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Background-video reliability:
//  - Bail to a static poster on slow/metered connections (Network Info API).
//  - Bail to a static poster when the user prefers reduced motion.
//  - Otherwise nudge play() after metadata loads, since some browsers
//    (iOS Safari especially) refuse the initial autoplay until the
//    element is visible and ready.
(function () {
  const video = document.getElementById('bg-video');
  if (!video) return;

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  const slowNet =
    conn &&
    (conn.saveData ||
      ['slow-2g', '2g', '3g'].includes(conn.effectiveType));

  if (reduceMotion || slowNet) {
    swapToPoster();
    return;
  }

  const tryPlay = () => {
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // Autoplay blocked — fall back to the poster image rather than
        // showing a frozen first frame.
        swapToPoster();
      });
    }
  };

  if (video.readyState >= 2) {
    tryPlay();
  } else {
    video.addEventListener('loadeddata', tryPlay, { once: true });
  }

  // If the file 404s or fails to decode, swap to the poster.
  video.addEventListener('error', swapToPoster, { once: true });

  function swapToPoster() {
    const poster = video.getAttribute('poster');
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.remove();
    if (!poster) return;
    const img = document.createElement('img');
    img.src = poster;
    img.alt = '';
    img.className = 'bg-fallback';
    img.setAttribute('aria-hidden', 'true');
    document.body.prepend(img);
  }
})();
