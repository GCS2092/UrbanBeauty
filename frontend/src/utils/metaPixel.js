const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

function getFbq() {
  return typeof window !== 'undefined' ? window.fbq : undefined;
}

export function initializeMetaPixel() {
  if (!PIXEL_ID || typeof window === 'undefined' || window.fbq) return;

  /* Meta's official browser snippet, loaded only when a Pixel ID is configured. */
  ((f, b, e, v, n, t, s) => {
    if (f.fbq) return;
    n = f.fbq = function fbq(...args) {
      n.callMethod ? n.callMethod(...args) : n.queue.push(args);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', PIXEL_ID);
}

export function trackMetaEvent(eventName, data = {}, eventId) {
  const fbq = getFbq();
  if (!fbq) return;

  fbq('track', eventName, data, eventId ? { eventID: eventId } : undefined);
}

export function trackPageView() {
  trackMetaEvent('PageView');
}
