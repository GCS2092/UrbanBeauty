const PDFDocument = require('pdfkit');
const { getSettings } = require('../settings/settings.service');

// ─── Palette SonShop ──────────────────────────────────────────────────────────
const C = {
  navy:      '#1a1a2e',
  gold:      '#c8a96e',
  goldDark:  '#a8894e',
  white:     '#ffffff',
  offWhite:  '#f8f7f5',
  border:    '#e8e4dc',
  textLight: '#6b6b80',
  success:   '#2d6a4f',
  danger:    '#c0392b',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fcfa(amount) {
  return `${Number(amount || 0).toLocaleString('fr-FR')} FCFA`;
}

function dateFr(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getClientInfo(order) {
  if (order.user) {
    return {
      name:  `${order.user.firstName} ${order.user.lastName}`.trim(),
      email: order.user.email || '',
      phone: order.user.phone || '',
    };
  }
  const addr = order.shippingAddress || {};
  return {
    name:  order.guestName || addr.fullName || 'Client',
    email: order.guestEmail || '',
    phone: order.guestPhone || addr.phone || '',
  };
}

function paymentMethodLabel(method) {
  const labels = {
    CASH_ON_DELIVERY: 'Paiement à la livraison',
    MOBILE_MONEY:     'Mobile Money',
  };
  return labels[method] || method || '';
}

function statusLabel(status) {
  const labels = {
    GENERATED:  'Générée',
    SENT:       'Envoyée',
    PAID:       'Payée',
    CANCELLED:  'Annulée',
  };
  return labels[status] || status;
}

// ─── Dessin d'un rectangle arrondi ───────────────────────────────────────────
function roundedRect(doc, x, y, w, h, r, fill) {
  doc.save()
    .roundedRect(x, y, w, h, r)
    .fill(fill)
    .restore();
}

// ─── Générateur principal ─────────────────────────────────────────────────────
async function buildInvoicePdf(invoice) {
  const settings  = await getSettings();
  const company   = settings.company_name    || 'SonShop';
  const address   = settings.company_address || 'Dakar, Sénégal';
  const phone     = settings.company_phone   || settings.whatsapp_number || '';
  const email     = settings.company_email   || '';

  const order  = invoice.order;
  const client = getClientInfo(order);
  const addr   = order.shippingAddress || {};

  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 0, size: 'A4' });
    const chunks = [];

    doc.on('data',  (chunk) => chunks.push(chunk));
    doc.on('end',   ()      => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W  = doc.page.width;   // 595
    const H  = doc.page.height;  // 841
    const M  = 45;               // marge intérieure

    // ── HEADER BAND ──────────────────────────────────────────────────────────
    doc.rect(0, 0, W, 110).fill(C.navy);

    // Nom boutique
    doc.fontSize(26).font('Helvetica-Bold').fillColor(C.gold)
       .text('SON', M, 28, { continued: true })
       .fillColor(C.white)
       .text('SHOP');

    // Tagline
    doc.fontSize(8).font('Helvetica').fillColor('#aaaaaa')
       .text('MODE & STYLE MASCULIN', M, 62, { characterSpacing: 2 });

    // Titre FACTURE à droite
    doc.fontSize(22).font('Helvetica-Bold').fillColor(C.gold)
       .text('FACTURE', 0, 30, { align: 'right', width: W - M });

    doc.fontSize(9).font('Helvetica').fillColor('#cccccc')
       .text(invoice.invoiceNumber, 0, 58, { align: 'right', width: W - M });

    // ── BANDE DORÉE FINE ─────────────────────────────────────────────────────
    doc.rect(0, 110, W, 4).fill(C.gold);

    // ── BLOC INFO (entreprise + client) ──────────────────────────────────────
    const infoTop = 130;

    // Colonne gauche – entreprise
    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.textLight)
       .text('DE', M, infoTop, { characterSpacing: 1 });

    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.navy)
       .text(company, M, infoTop + 14);

    doc.fontSize(9).font('Helvetica').fillColor('#444444');
    if (address) doc.text(address, M, doc.y + 2);
    if (phone)   doc.text(`Tél : ${phone}`, M, doc.y + 2);
    if (email)   doc.text(email, M, doc.y + 2);

    // Colonne droite – client
    const colRight = W / 2 + 10;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.textLight)
       .text('FACTURÉ À', colRight, infoTop, { characterSpacing: 1 });

    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.navy)
       .text(client.name, colRight, infoTop + 14);

    doc.fontSize(9).font('Helvetica').fillColor('#444444');
    if (client.email) doc.text(client.email, colRight, doc.y + 2);
    if (client.phone) doc.text(client.phone, colRight, doc.y + 2);
    if (addr.street) {
      const addrLine = [addr.street, addr.city, addr.country].filter(Boolean).join(', ');
      doc.text(addrLine, colRight, doc.y + 2, { width: W - colRight - M });
    }

    // ── MÉTADONNÉES (encadré gris) ────────────────────────────────────────────
    const metaTop = 255;
    // CORRECTION : hauteur augmentée de 68 → 80 pour éviter le débordement
    roundedRect(doc, M, metaTop, W - M * 2, 80, 6, C.offWhite);
    doc.rect(M, metaTop, W - M * 2, 80).stroke(C.border);

    const metaItems = [
      ['N° COMMANDE',  order.orderNumber],
      ['DATE',         dateFr(invoice.issuedAt)],
      ['STATUT',       statusLabel(invoice.status)],
      ['PAIEMENT',     paymentMethodLabel(order.paymentMethod)],
    ];

    const cellW = (W - M * 2) / metaItems.length;

    // CORRECTION : width + ellipsis pour éviter le chevauchement entre colonnes
    metaItems.forEach(([label, value], i) => {
      const cx   = M + i * cellW + 14;
      const maxW = cellW - 18;

      doc.fontSize(7).font('Helvetica-Bold').fillColor(C.textLight)
         .text(label, cx, metaTop + 12, { characterSpacing: 0.5, width: maxW, ellipsis: true });

      doc.fontSize(9).font('Helvetica-Bold').fillColor(C.navy)
         .text(String(value || ''), cx, metaTop + 30, { width: maxW, ellipsis: true });
    });

    // ── TABLEAU PRODUITS ──────────────────────────────────────────────────────
    // CORRECTION : tTop ajusté en fonction de la nouvelle hauteur du bloc meta
    const tTop = metaTop + 102;
    const cols = { product: M, qty: 310, pu: 380, total: 460 };

    // En-tête tableau
    roundedRect(doc, M, tTop, W - M * 2, 26, 4, C.navy);

    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.white);
    doc.text('PRODUIT',    cols.product + 8, tTop + 9);
    doc.text('QTÉ',        cols.qty,         tTop + 9, { width: 60, align: 'center' });
    doc.text('PRIX UNIT.', cols.pu,          tTop + 9, { width: 70, align: 'right' });
    doc.text('TOTAL',      cols.total,       tTop + 9, { width: 55, align: 'right' });

    // Lignes produits
    let y = tTop + 26;
    const items = order.items || [];

    items.forEach((item, i) => {
      const rowH  = 30;
      const label = item.variantLabel
        ? `${item.productName}  (${item.variantLabel})`
        : item.productName;

      // Fond alterné
      if (i % 2 === 0) {
        doc.rect(M, y, W - M * 2, rowH).fill('#fafaf8');
      }

      doc.fontSize(9).font('Helvetica-Bold').fillColor(C.navy)
         .text(label, cols.product + 8, y + 5, { width: 240 });

      doc.font('Helvetica').fillColor('#444444');
      doc.text(String(item.quantity), cols.qty,   y + 5, { width: 60,  align: 'center' });
      doc.text(fcfa(item.price),      cols.pu,    y + 5, { width: 70,  align: 'right' });
      doc.text(fcfa(item.subtotal),   cols.total, y + 5, { width: 55,  align: 'right' });

      // Séparateur
      doc.rect(M, y + rowH - 1, W - M * 2, 1).fill(C.border);

      y += rowH;
    });

    // ── TOTAUX ────────────────────────────────────────────────────────────────
    y += 12;
    const totalsX = 360;
    const totalsW = W - M - totalsX;

    function totalsRow(label, value, bold = false, color = '#444444') {
      doc.fontSize(9)
         .font(bold ? 'Helvetica-Bold' : 'Helvetica')
         .fillColor(C.textLight)
         .text(label, totalsX, y);
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
         .fillColor(color)
         .text(value, totalsX, y, { width: totalsW, align: 'right' });
      y += 18;
    }

    totalsRow('Sous-total',  fcfa(invoice.subtotal));
    if (invoice.shippingCost > 0)  totalsRow('Livraison',        fcfa(invoice.shippingCost));
    if (invoice.discount     > 0)  totalsRow('Remise',           `-${fcfa(invoice.discount)}`,      false, C.success);
    if (invoice.storeDiscount > 0) totalsRow('Remise boutique',  `-${fcfa(invoice.storeDiscount)}`, false, C.success);
    if (invoice.tax          > 0)  totalsRow('Taxes',            fcfa(invoice.tax));

    // Ligne séparatrice
    doc.rect(totalsX, y, totalsW, 1).fill(C.gold);
    y += 8;

    // TOTAL FINAL
    roundedRect(doc, totalsX - 10, y, totalsW + 10, 38, 6, C.navy);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(C.white)
       .text('TOTAL', totalsX, y + 12);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(C.gold)
       .text(fcfa(invoice.total), totalsX, y + 10, { width: totalsW, align: 'right' });

    // ── NOTE DE BAS (si présente) ─────────────────────────────────────────────
    if (order.notes) {
      const noteTop = y + 58;
      roundedRect(doc, M, noteTop, W - M * 2, 40, 6, '#fffef5');
      doc.rect(M, noteTop, 3, 40).fill(C.gold);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(C.textLight)
         .text('NOTE', M + 12, noteTop + 8);
      doc.fontSize(9).font('Helvetica').fillColor('#444444')
         .text(order.notes, M + 12, noteTop + 20, { width: W - M * 2 - 20 });
    }

    // ── FOOTER ────────────────────────────────────────────────────────────────
    doc.rect(0, H - 52, W, 52).fill(C.navy);
    doc.rect(0, H - 52, W, 3).fill(C.gold);

    doc.fontSize(8).font('Helvetica').fillColor('#888888')
       .text(
         `Document généré automatiquement par ${company}  ·  Les montants sont en FCFA  ·  Dakar, Sénégal`,
         0, H - 32,
         { align: 'center', width: W },
       );

    doc.end();
  });
}

module.exports = { buildInvoicePdf };