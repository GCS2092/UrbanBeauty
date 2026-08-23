const STORAGE_KEY = 'urbanbeauty-attribution';
const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function readCookie(name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function buildFbc(fbclid) {
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : null;
}

export function captureAttribution(search = window.location.search) {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(search);
  const next = Object.fromEntries(
    ATTRIBUTION_KEYS
      .map((key) => [key, params.get(key)])
      .filter(([, value]) => value)
  );
  const fbclid = params.get('fbclid');
  const hasCampaignData = Object.keys(next).length > 0 || fbclid;

  if (!hasCampaignData) return getAttribution();

  const attribution = {
    ...next,
    fbclid: fbclid || undefined,
    fbp: readCookie('_fbp') || undefined,
    fbc: readCookie('_fbc') || buildFbc(fbclid) || undefined,
    landing_page: window.location.href,
    captured_at: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  return attribution;
}

export function getAttribution() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved) return null;
    return {
      ...saved,
      fbp: readCookie('_fbp') || saved.fbp,
      fbc: readCookie('_fbc') || saved.fbc,
    };
  } catch {
    return null;
  }
}
