const { collectReportData } = require('./report.service');
const { buildReportPdf } = require('./report-pdf.service');
const { sendEmail } = require('../../config/email');
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
    console.error('❌ Erreur rapport PDF :', err);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport.' });
  }
}

// POST /api/reports/send-email
// body: { storeId, from, to, email? }
async function sendReportByEmail(req, res) {
  try {
    const { storeId, from, to, email } = req.body;
    if (!storeId || !from || !to) {
      return res.status(400).json({ error: 'storeId, from et to sont requis.' });
    }

    const settings = await getSettings();
    const recipient = email || process.env.ADMIN_EMAIL || settings.company_email;
    if (!recipient) {
      return res.status(400).json({ error: 'Aucun email destinataire trouvé.' });
    }

    const data = await collectReportData(storeId, from, to);
    const pdfBuffer = await buildReportPdf(data);

    await sendEmail({
      to: recipient,
      subject: `📊 Rapport de gestion — ${from} au ${to}`,
      html: `
        <h2>Rapport de gestion</h2>
        <p>Veuillez trouver en pièce jointe le rapport de gestion pour la période du <strong>${from}</strong> au <strong>${to}</strong>.</p>
        <p>— Urban Beauty</p>
      `,
      attachments: [{
        filename: `rapport-${from}-${to}.pdf`,
        content: pdfBuffer.toString('base64'),
      }],
    });

    res.json({ success: true, message: `Rapport envoyé à ${recipient}` });
  } catch (err) {
    console.error('❌ Erreur envoi rapport :', err);
    res.status(500).json({ error: "Erreur lors de l'envoi du rapport." });
  }
}

module.exports = { downloadReport, sendReportByEmail };