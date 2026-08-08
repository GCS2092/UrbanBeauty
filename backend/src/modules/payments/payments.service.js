const prisma = require('../../config/database');
const { initierPaiement, verifierStatut } = require('./cinetpay.service');

async function creerPaiementPourCommande(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    const err = new Error('Commande introuvable');
    err.statusCode = 404;
    throw err;
  }

  const merchantTransactionId = `CMD${order.id}${Date.now()}`.slice(0, 30);

  const customer = {
    firstName:
      order.user?.firstName ||
      order.guestName?.split(' ')[0] ||
      'Client',
    lastName:
      order.user?.lastName ||
      order.guestName?.split(' ')[1] ||
      'Boutique',
    email: order.user?.email || order.guestEmail,
    phone: order.user?.phone || order.guestPhone,
  };

  // Même URL pour succès/échec : c'est la vérification active côté client qui
  // détermine le vrai statut affiché, pas l'URL de redirection CinetPay elle-même.
  const returnUrl = `${process.env.FRONTEND_URL}/orders/${order.orderNumber}?payment=return`;

  const result = await initierPaiement({
    merchantTransactionId,
    amount: order.total,
    designation: `Commande ${order.orderNumber}`,
    customer,
    notifyUrl: `${process.env.API_BASE_URL}/api/payments/cinetpay/notify`,
    successUrl: returnUrl,
    failedUrl: returnUrl,
  });

  // orders.service.js crée déjà un Payment PENDING à la création de la commande.
  // On le met à jour au lieu d'en créer un deuxième (évite les doublons).
  const existingPayment = await prisma.payment.findFirst({
    where: {
      orderId: order.id,
      status: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        transactionId: merchantTransactionId,
        notifyToken: result.notify_token,
      },
    });
  } else {
    // Filet de sécurité si aucun Payment PENDING n'existe déjà (cas rare)
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'MOBILE_MONEY',
        amount: order.total,
        transactionId: merchantTransactionId,
        notifyToken: result.notify_token,
      },
    });
  }

  return {
    paymentUrl: result.payment_url,
  };
}

async function traiterNotification({
  notify_token,
  merchant_transaction_id,
}) {
  if (!merchant_transaction_id) {
    const err = new Error('merchant_transaction_id manquant');
    err.statusCode = 400;
    throw err;
  }

  const payment = await prisma.payment.findFirst({
    where: {
      transactionId: merchant_transaction_id,
    },
  });

  if (!payment) {
    const err = new Error('Paiement introuvable');
    err.statusCode = 404;
    throw err;
  }

  if (payment.notifyToken !== notify_token) {
    const err = new Error('notify_token invalide');
    err.statusCode = 403;
    throw err;
  }

  // Idempotence : déjà traité, on ne refait rien
  if (payment.status === 'PAID' || payment.status === 'REJECTED') {
    return {
      alreadyProcessed: true,
    };
  }

  // Ne jamais faire confiance au payload : on re-vérifie via l'API
  const verif = await verifierStatut(merchant_transaction_id);
  const statutReel = verif.details?.status || verif.status;

  if (statutReel === 'SUCCESS') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    });
  } else if (statutReel === 'FAILED') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REJECTED',
      },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'REJECTED',
        status: 'CONFIRMED',
      },
    });
  }

  return {
    status: statutReel,
  };
}

// Vérification active du statut, appelée par le frontend au retour du client
// depuis CinetPay (comble le délai éventuel avant que le webhook n'arrive).
async function verifierPaiementParCommande(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    const err = new Error('Commande introuvable');
    err.statusCode = 404;
    throw err;
  }

  const payment = await prisma.payment.findFirst({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
  });

  if (!payment || !payment.transactionId) {
    const err = new Error(
      'Aucun paiement CinetPay initié pour cette commande'
    );
    err.statusCode = 404;
    throw err;
  }

  // Déjà tranché (webhook déjà passé) → pas besoin de rappeler CinetPay
  if (payment.status === 'PAID' || payment.status === 'REJECTED') {
    return {
      status: payment.status,
    };
  }

  const verif = await verifierStatut(payment.transactionId);
  const statutReel = verif.details?.status || verif.status;

  if (statutReel === 'SUCCESS') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    });

    return {
      status: 'PAID',
    };
  }

  if (statutReel === 'FAILED') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REJECTED',
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'REJECTED',
        status: 'CONFIRMED',
      },
    });

    return {
      status: 'REJECTED',
    };
  }

  return {
    status: 'PENDING',
  }; // toujours en cours de traitement
}

module.exports = {
  creerPaiementPourCommande,
  traiterNotification,
  verifierPaiementParCommande,
};