const prisma = require('../../config/database');

const SITE_URL = 'https://www.sonshop.beauty';
const CURRENCY = 'XOF';

function escapeCdata(str = '') {
  // Empêche une chaîne contenant "]]>" de casser le CDATA
  return String(str).replace(/]]>/g, ']]]]><![CDATA[>');
}

function buildItemXml(product) {
  const mainImage =
    product.images.find((img) => img.isMain) || product.images[0];

  if (!mainImage) return ''; // Pinterest exige une image, on ignore les produits sans photo

  const availability = product.stock > 0 ? 'in stock' : 'out of stock';
  const price = `${Number(product.price).toFixed(2)} ${CURRENCY}`;
  const link = `${SITE_URL}/products/${product.slug}`;

  return `
  <item>
    <g:id>${product.id}</g:id>
    <title><![CDATA[${escapeCdata(product.name)}]]></title>
    <description><![CDATA[${escapeCdata(product.description)}]]></description>
    <link>${link}</link>
    <g:image_link>${mainImage.url}</g:image_link>
    <g:price>${price}</g:price>
    <g:availability>${availability}</g:availability>
    <g:condition>new</g:condition>
    <g:brand><![CDATA[SonShop]]></g:brand>
    ${product.category ? `<g:product_type><![CDATA[${escapeCdata(product.category.name)}]]></g:product_type>` : ''}
  </item>`;
}

async function generatePinterestFeed() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      status: 'PUBLISHED',
    },
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' },
  });

  const items = products.map(buildItemXml).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>SonShop - Catalogue produits</title>
  <link>${SITE_URL}</link>
  <description>Catalogue produits SonShop pour Pinterest Catalogs</description>
  ${items}
</channel>
</rss>`;
}

module.exports = { generatePinterestFeed };