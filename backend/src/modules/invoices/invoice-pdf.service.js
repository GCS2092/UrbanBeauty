const PDFDocument = require('pdfkit');
const { getSettings } = require('../settings/settings.service');

function formatFcfa(amount) {
  return `${Number(amount || 0).toLocaleString('fr-FR')} FCFA`;
}

function formatDateFr(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getClientInfo(order) {
  if (order.user) {
    return {
      name: `${order.user.firstName} ${order.user.lastName}`.trim(),
      email: order.user.email,
      phone: order.user.phone || '',
    };
  }
  const addr = order.shippingAddress || {};
  return {
    name: order.guestName || addr.fullName || 'Client',
    email: order.guestEmail || '',
    phone: order.guestPhone || addr.phone || '',
  };
}

async function buildInvoicePdf(invoice) {
  const settings = await getSettings();
  const companyName = settings.company_name || 'Urban Beauty';
  const companyAddress = settings.company_address || '';
  const companyPhone = settings.company_phone || settings.whatsapp_number || '';
  const companyEmail = settings.company_email || '';

  const order = invoice.order;
  const client = getClientInfo(order);
  const addr = order.shippingAddress || {};

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).font('Helvetica-Bold').text(companyName, { align: 'left' });
    doc.fontSize(9).font('Helvetica').fillColor('#555');
    if (companyAddress) doc.text(companyAddress);
    if (companyPhone) doc.text(`Tél : ${companyPhone}`);
    if (companyEmail) doc.text(companyEmail);

    doc.moveDown(1.5);
    doc.fillColor('#000').fontSize(16).font('Helvetica-Bold').text('FACTURE', { align: 'right' });
    doc.fontSize(10).font('Helvetica').text(invoice.invoiceNumber, { align: 'right' });
    doc.text(`Date : ${formatDateFr(invoice.issuedAt)}`, { align: 'right' });
    doc.text(`Commande : ${order.orderNumber}`, { align: 'right' });
    doc.text(`Statut : ${invoice.status}`, { align: 'right' });

    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('Facturé à');
    doc.font('Helvetica').fontSize(10);
    doc.text(client.name);
    if (client.email) doc.text(client.email);
    if (client.phone) doc.text(client.phone);
    if (addr.street) {
      doc.text([addr.street, addr.city, addr.country].filter(Boolean).join(', '));
    }

    doc.moveDown(1.2);
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 280;
    const col3 = 360;
    const col4 = 450;

    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('Produit', col1, tableTop);
    doc.text('Qté', col2, tableTop);
    doc.text('P.U.', col3, tableTop);
    doc.text('Total', col4, tableTop);
    doc.moveTo(col1, tableTop + 14).lineTo(520, tableTop + 14).stroke('#ccc');

    let y = tableTop + 22;
    doc.font('Helvetica').fontSize(9);

    for (const item of order.items) {
      const label = item.variantLabel
        ? `${item.productName} (${item.variantLabel})`
        : item.productName;
      doc.text(label, col1, y, { width: 220 });
      doc.text(String(item.quantity), col2, y);
      doc.text(formatFcfa(item.price), col3, y);
      doc.text(formatFcfa(item.subtotal), col4, y);
      y += 22;
    }

    doc.moveDown(2);
    const totalsX = 350;
    let ty = Math.max(y + 10, doc.y);

    const lines = [
      ['Sous-total', formatFcfa(invoice.subtotal)],
      ['Livraison', formatFcfa(invoice.shippingCost)],
      ['Remise', invoice.discount > 0 ? `-${formatFcfa(invoice.discount)}` : formatFcfa(0)],
    ];
    if (invoice.tax > 0) lines.push(['Taxes', formatFcfa(invoice.tax)]);

    doc.font('Helvetica').fontSize(10);
    for (const [label, value] of lines) {
      doc.text(label, totalsX, ty);
      doc.text(value, 450, ty, { align: 'right', width: 70 });
      ty += 16;
    }

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('TOTAL', totalsX, ty + 4);
    doc.text(formatFcfa(invoice.total), 450, ty + 4, { align: 'right', width: 70 });

    doc.fontSize(8).font('Helvetica').fillColor('#888');
    doc.text(
      'Document généré automatiquement par Urban Beauty. Les montants sont en FCFA.',
      50,
      doc.page.height - 60,
      { align: 'center', width: doc.page.width - 100 },
    );

    doc.end();
  });
}

module.exports = { buildInvoicePdf };
