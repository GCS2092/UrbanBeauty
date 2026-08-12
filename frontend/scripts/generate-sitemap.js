import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://www.sonshop.beauty';
const API_URL = process.env.VITE_API_URL || 'https://api.sonshop.beauty';

const STATIC_ROUTES = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/products', priority: 0.9, changefreq: 'daily' },
  { url: '/contact', priority: 0.5, changefreq: 'monthly' },
  { url: '/about', priority: 0.5, changefreq: 'monthly' },
];

async function generateSitemap() {
  let productUrls = [];

  try {
    const res = await fetch(`${API_URL}/api/products?limit=1000`);
    const json = await res.json();
    const products = json.data || json;
    productUrls = products.map((p) => ({
      url: `/products/${p.slug || p.id}`,
      priority: 0.8,
      changefreq: 'weekly',
      lastmod: p.updatedAt,
    }));
  } catch (err) {
    console.error('Erreur récupération produits pour sitemap:', err.message);
  }

  const allRoutes = [...STATIC_ROUTES, ...productUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.url}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
    ${r.lastmod ? `<lastmod>${new Date(r.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  const outPath = path.resolve('public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml);
  console.log(`Sitemap généré avec ${allRoutes.length} URLs -> ${outPath}`);
}

generateSitemap();