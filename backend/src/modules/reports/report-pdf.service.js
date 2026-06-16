const PDFDocument = require('pdfkit');
const { getSettings } = require('../settings/settings.service');

function formatFcfa(amount) {
  return `${Number(amount || 0).toLocaleString('fr-FR')} FCFA`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function sectionTitle(doc, title) {
  doc.moveDown(1);
  doc
    .fillColor('#1a1a2e')
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(title.toUpperCase());
  doc
    .moveTo(50, doc.y + 2)
    .lineTo(545, doc.y + 2)
    .strokeColor('#cccccc')
    .stroke();
  doc.moveDown(0.5);
  doc.fillColor('#000000').font('Helvetica').fontSize(10);
}

function row(doc, label, value, bold = false) {
  const y = doc.y;
  doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10);
  doc.text(label, 50, y, { width: 300 });
  doc.text(value, 350, y, { align: 'right', width: 195 });
  doc.moveDown(0.4);
}

async function buildReportPdf(data) {
  const settings = await getSettings();
  const companyName = settings.company_name || 'Urban Beauty';
  const companyAddress = settings.company_address || '';
  const companyPhone = settings.company_phone || '';

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── En-tête ──────────────────────────────────────────────
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#1a1a2e').text(companyName);
    doc.fontSize(9).font('Helvetica').fillColor('#555555');
    if (companyAddress) doc.text(companyAddress);
    if (companyPhone) doc.text(`Tél : ${companyPhone}`);
    doc.moveDown(0.5);

    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1a1a2e')
      .text('RAPPORT DE GESTION', { align: 'right' });
    doc.fontSize(10).font('Helvetica').fillColor('#555555')
      .text(`Période : ${formatDate(data.period.from)} → ${formatDate(data.period.to)}`, { align: 'right' });
    doc.text(`Généré le : ${formatDate(new Date())}`, { align: 'right' });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#1a1a2e').lineWidth(2).stroke();
    doc.lineWidth(1);

    // ── Résumé financier ─────────────────────────────────────
    sectionTitle(doc, '📊 Résumé financier');
    row(doc, "Chiffre d'affaires (commandes livrées)", formatFcfa(data.financial.chiffreAffaires));
    row(doc, 'Coût des marchandises vendues (COGS)', formatFcfa(data.financial.cogs));
    row(doc, 'Total dépenses', formatFcfa(data.financial.totalExpenses));
    row(doc, 'Bénéfice estimé', formatFcfa(data.financial.beneficeEstime), true);
    row(doc, 'Total facturé', formatFcfa(data.financial.totalInvoiced));

    // ── Commandes ────────────────────────────────────────────
    sectionTitle(doc, '📦 Commandes');
    row(doc, 'Total commandes', String(data.orders.total));
    for (const [status, count] of Object.entries(data.orders.byStatus)) {
      row(doc, `  └ ${status}`, String(count));
    }

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(10).text('Top 10 clients');
    doc.moveDown(0.3);
    for (const client of data.orders.topClients) {
      row(doc, `  ${client.name} (${client.count} cmd)`, formatFcfa(client.total));
    }

    // ── Top produits ─────────────────────────────────────────
    sectionTitle(doc, '🏆 Top produits vendus');
    for (const p of data.products.topProducts) {
      row(doc, `  ${p.name} — ${p.quantity} unités`, formatFcfa(p.revenue));
    }

    // ── Factures ─────────────────────────────────────────────
    sectionTitle(doc, '🧾 Factures');
    row(doc, 'Total factures émises', String(data.invoices.total));
    for (const [status, count] of Object.entries(data.invoices.byStatus)) {
      row(doc, `  └ ${status}`, String(count));
    }
    row(doc, 'Montant total facturé', formatFcfa(data.invoices.totalInvoiced));

    // ── Stock ────────────────────────────────────────────────
    sectionTitle(doc, '📦 Stock');
    row(doc, 'Nombre total de produits', String(data.stock.totalProducts));
    row(doc, 'Valeur totale du stock', formatFcfa(data.stock.totalStockValue));
    row(doc, 'Produits en alerte stock bas', String(data.stock.lowStock.length));
    row(doc, 'Produits épuisés', String(data.stock.outOfStock.length));

    if (data.stock.lowStock.length > 0) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(10).text('Produits en alerte :');
      doc.moveDown(0.3);
      for (const p of data.stock.lowStock) {
        row(doc, `  ⚠️  ${p.name}`, `Stock : ${p.stock} (alerte : ${p.alert})`);
      }
    }

    if (data.stock.outOfStock.length > 0) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(10).text('Produits épuisés :');
      doc.moveDown(0.3);
      for (const p of data.stock.outOfStock) {
        doc.font('Helvetica').fontSize(10).text(`  ❌ ${p.name}`, { indent: 10 });
        doc.moveDown(0.3);
      }
    }

    // ── Dépenses ─────────────────────────────────────────────
    sectionTitle(doc, '💸 Dépenses');
    row(doc, 'Total dépenses', formatFcfa(data.expenses.total), true);
    for (const [cat, amount] of Object.entries(data.expenses.byCategory)) {
      row(doc, `  └ ${cat}`, formatFcfa(amount));
    }

    // ── Pied de page ─────────────────────────────────────────
    doc.fontSize(8).font('Helvetica').fillColor('#aaaaaa');
    doc.text(
      `Document généré automatiquement — ${companyName}`,
      50,
      doc.page.height - 50,
      { align: 'center', width: doc.page.width - 100 },
    );

    doc.end();
  });
}

module.exports = { buildReportPdf };