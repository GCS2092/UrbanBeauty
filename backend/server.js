const app = require('./src/app');
const cron = require('node-cron');
const {
  expireDraftReservations,
  notifyUpcomingExpirations,
} = require('./src/jobs/reservation-expiration.job');

const PORT = process.env.PORT || 5000;

// Expiration des réservations brouillon WhatsApp — toutes les heures
cron.schedule('0 * * * *', async () => {
  try {
    const result = await expireDraftReservations();
    if (result.expired > 0) {
      console.log(`[cron] ${result.expired} brouillon(s) expiré(s) — stock libéré`);
    }
  } catch (err) {
    console.error('[cron] Erreur expiration réservations:', err.message);
  }
});

// Alerte admin avant expiration — toutes les 6 heures
cron.schedule('0 */6 * * *', async () => {
  try {
    await notifyUpcomingExpirations();
  } catch (err) {
    console.error('[cron] Erreur alertes expiration:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});
