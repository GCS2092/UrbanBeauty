const axios = require('axios');
const prisma = require('../config/database');

const ONESIGNAL_APP_ID  = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
const CLIENT_URL        = process.env.CLIENT_URL || 'https://urban-beauty.vercel.app';

// ── Envoyer une notif OneSignal à un user spécifique ──────────────────────
async function sendPushNotification({ userId, title, message, url = '/' }) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    console.warn('⚠️ OneSignal non configuré (APP_ID ou REST_API_KEY manquant)');
    return;
  }

  const fullUrl = url.startsWith('http') ? url : `${CLIENT_URL}${url}`;

  try {
    const res = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id:   ONESIGNAL_APP_ID,
        name:     title,
        headings: { en: title, fr: title },
        contents: { en: message, fr: message },
        url:      fullUrl,
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
    console.log('✅ Push OneSignal envoyé à userId:', userId, '| response:', JSON.stringify(res.data));
  } catch (err) {
    console.error('❌ Erreur OneSignal:', err.response?.data || err.message);
  }
}

// ── Envoyer notif à tous les abonnés (promos, annonces) ───────────────────
async function sendPushToAll({ title, message, url = '/' }) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) return;

  const fullUrl = url.startsWith('http') ? url : `${CLIENT_URL}${url}`;

  try {
    await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id:            ONESIGNAL_APP_ID,
        included_segments: ['All'],
        headings:          { en: title, fr: title },
        contents:          { en: message, fr: message },
        url:               fullUrl,
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
  if (userId) {
    await prisma.notification.create({
      data: { userId, type, title, message, link },
    }).catch((err) => console.error('❌ Erreur notif DB:', err.message));
  }

  if (sendPush && userId) {
    await sendPushNotification({ userId, title, message, url: link });
  }
}

// ── Notifier tous les admins/staff ────────────────────────────────────────
async function notifyAdmins({ type, title, message, link = '/admin' }) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'STAFF'] } },
      select: { id: true },
    });

    await Promise.all(
      admins.map(admin =>
        notifyUser({
          userId: admin.id,
          type,
          title,
          message,
          link,
          sendPush: true,
        })
      )
    );
    console.log(`✅ Notif admin envoyée à ${admins.length} admin(s)/staff`);
  } catch (err) {
    console.error('❌ Erreur notifyAdmins:', err.message);
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
  notifyAdmins,
  notifyOrderConfirmed,
  notifyOrderStatus,
  notifyPaymentReceived,
  notifyPromo,
  sendPushNotification,
  sendPushToAll,
};