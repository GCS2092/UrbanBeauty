const {
  creerPaiementPourCommande,
  traiterNotification,
  verifierPaiementParCommande,
} = require('./payments.service');

async function initier(req, res, next) {
  try {
    const { orderId } = req.body;
    const result = await creerPaiementPourCommande(orderId);
    res.json(result);
  } catch (err) {
    // ⚠️ TEMPORAIRE — log détaillé pour diagnostiquer le 422 CinetPay
    console.error('Erreur CinetPay détaillée:', err.response?.data || err.message);
    next(err);
  }
}

async function notifier(req, res) {
  try {
    await traiterNotification(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error('Erreur webhook CinetPay:', err.response?.data || err.message);
    res.sendStatus(err.statusCode || 500);
  }
}

function notifierHealthCheck(req, res) {
  res.sendStatus(200);
}

async function verifier(req, res, next) {
  try {
    const result = await verifierPaiementParCommande(req.params.orderId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { initier, notifier, notifierHealthCheck, verifier };