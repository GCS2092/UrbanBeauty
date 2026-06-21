const { collectReportData } = require('./report.service');
const { buildReportPdf } = require('./report-pdf.service');
const { sendEmail } = require('../../config/email');
const { buildReportEmail } = require('../../utils/email.utils');
const { getSettings } = require('../settings/settings.service');

// GET /api/reports/download?storeId=xxx&from=2024-01-01&to=2024-01-31
async function downloadReport(req, res) {
  try {
    const { storeId, from, to } = req.query;
    if (!storeId || !from || !to) {
      return res.status(400).json({ error: 'storeId, from et to sont requis.' });
    }

    const data = await collectReportData(storeId, from, to);
    const pdfBuffer = await buildReportPdf(data);

    const filename = `rapport-${storeId}-${from}-${to}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('❌ Erreur downloadReport:', err);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport.' });
  }
}

// POST /api/reports/send?storeId=xxx&from=2024-01-01&to=2024-01-31
// Corps : { email: "destinataire@example.com" } (optionnel, sinon ADMIN_EMAIL)
async function sendReport(req, res) {
  try {
    const { storeId, from, to } = req.query;
    if (!storeId || !from || !to) {
      return res.status(400).json({ error: 'storeId, from et to sont requis.' });
    }

    const settings = await getSettings();
    const storeName = settings.company_name || 'UrbanBeauty';

    const recipient = req.body?.email || process.env.ADMIN_EMAIL;
    if (!recipient) {
      return res.status(400).json({ error: 'Aucun email destinataire fourni.' });
    }

    // Collecte des données
    const data = await collectReportData(storeId, from, to);

    // Génération du PDF en pièce jointe
    const pdfBuffer = await buildReportPdf(data);
    const pdfBase64 = pdfBuffer.toString('base64');
    const filename  = `rapport-${storeId}-${from}-${to}.pdf`;

    // Génération de l'email HTML enrichi
    const emailData = buildReportEmail({
      period:    data.period,
      financial: data.financial,
      orders:    data.orders,
      products:  data.products,
      stock:     data.stock,
      expenses:  data.expenses,
      storeName,
    });

    await sendEmail({
      to:          recipient,
      subject:     emailData.subject,
      html:        emailData.html,
      attachments: [{
        filename: filename,
        content:  pdfBase64,
      }],
    });

    console.log(`✅ Rapport envoyé à ${recipient} (${from} → ${to})`);
    res.json({ message: `Rapport envoyé à ${recipient}` });
  } catch (err) {
    console.error('❌ Erreur sendReport:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du rapport.' });
  }
}

module.exports = { downloadReport, sendReport };