// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Background-video reliability:
//  - Bail to a static poster on slow/metered connections.
//  - Bail to a static poster when the user prefers reduced motion.
//  - Otherwise let the <video autoplay> attribute do its job and only
//    intervene on a genuine load error. Calling play() defensively was
//    racing the browser's own autoplay and causing spurious fallbacks.
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
