const axios = require('axios');
const prisma = require('../config/database');

const ONESIGNAL_APP_ID  = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

// ── Envoyer une notif OneSignal à un user spécifique ──────────────────────
// ✅ On utilise external_id (OneSignal.login(userId) côté frontend)
// au lieu des tags — les deux doivent utiliser le même système
async function sendPushNotification({ userId, title, message, url = '/' }) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    console.warn('⚠️ OneSignal non configuré (APP_ID ou REST_API_KEY manquant)');
    return;
  }
  try {
    const res = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id:   ONESIGNAL_APP_ID,
        name:     title,
        headings: { en: title, fr: title },
        contents: { en: message, fr: message },
        url,
        // ✅ External User ID — correspond à OneSignal.login(String(user.id)) côté frontend
        include_aliases: {
          external_id: [String(userId)],
        },
        target_channel: 'push',
      },
      {
        headers: {
          Authorization:  `Key ${ONESIGNAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Push OneSignal envoyé à userId:', userId, '| recipients:', res.data?.recipients);
  } catch (err) {
    console.error('❌ Erreur OneSignal:', err.response?.data || err.message);
  }
}

// ── Envoyer notif à tous les abonnés (promos, annonces) ───────────────────
async function sendPushToAll({ title, message, url = '/' }) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) return;
  try {
    await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id:            ONESIGNAL_APP_ID,
        included_segments: ['All'],
        headings:          { en: title, fr: title },
        contents:          { en: message, fr: message },
        url,
      },
      {
        headers: {
          Authorization:  `Key ${ONESIGNAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Push OneSignal envoyé à tous');
  } catch (err) {
    console.error('❌ Erreur OneSignal broadcast:', err.response?.data || err.message);
  }
}

// ── Notification complète : DB + Push ─────────────────────────────────────
async function notifyUser({ userId, type, title, message, link = '/', sendPush = true }) {
  // 1. Sauvegarder en base (notifications in-app)
  if (userId) {
    await prisma.notification.create({
      data: { userId, type, title, message, link },
    }).catch((err) => console.error('❌ Erreur notif DB:', err.message));
  }

  // 2. Push OneSignal
  if (sendPush && userId) {
    await sendPushNotification({ userId, title, message, url: link });
  }
}

// ── Notifications commandes ────────────────────────────────────────────────

async function notifyOrderConfirmed(order) {
  const userId = order.userId;
  if (!userId) return;
  await notifyUser({
    userId,
    type:    'ORDER_CONFIRMED',
    title:   '✅ Commande confirmée !',
    message: `Votre commande ${order.orderNumber} a bien été reçue.`,
    link:    `/orders/${order.orderNumber}`,
  });
}

async function notifyOrderStatus(order, status) {
  const userId = order.userId;
  if (!userId) return;

  const config = {
    PROCESSING: {
      title:   '📦 Commande en préparation',
      message: `Votre commande ${order.orderNumber} est en cours de préparation.`,
    },
    SHIPPED: {
      title:   '🚚 Commande expédiée !',
      message: `Votre commande ${order.orderNumber} est en route !`,
    },
    DELIVERED: {
      title:   '🎁 Commande livrée !',
      message: `Votre commande ${order.orderNumber} a été livrée. Merci !`,
    },
    CANCELLED: {
      title:   '❌ Commande annulée',
      message: `Votre commande ${order.orderNumber} a été annulée.`,
    },
    CONFIRMED: {
      title:   '✅ Commande confirmée',
      message: `Votre commande ${order.orderNumber} est confirmée.`,
    },
  };

  const notif = config[status];
  if (!notif) return;

  await notifyUser({
    userId,
    type:    'ORDER_CONFIRMED',
    title:   notif.title,
    message: notif.message,
    link:    `/orders/${order.orderNumber}`,
  });
}

async function notifyPaymentReceived(order) {
  const userId = order.userId;
  if (!userId) return;
  await notifyUser({
    userId,
    type:    'PAYMENT_RECEIVED',
    title:   '💳 Paiement reçu',
    message: `Votre paiement pour la commande ${order.orderNumber} a été validé.`,
    link:    `/orders/${order.orderNumber}`,
  });
}

async function notifyPromo({ title, message, url = '/' }) {
  await sendPushToAll({ title, message, url });
}

module.exports = {
  notifyUser,
  notifyOrderConfirmed,
  notifyOrderStatus,
  notifyPaymentReceived,
  notifyPromo,
  sendPushNotification,
  sendPushToAll,
};