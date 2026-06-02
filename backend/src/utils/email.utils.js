function buildOrderConfirmationEmail({ orderNumber, guestName, total, clientUrl }) {
  return {
    subject: `Confirmation de commande ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c8a96e;">🌸 UrbanBeauty</h2>
        <p>Bonjour <strong>${guestName || 'client'}</strong>,</p>
        <p>Votre commande <strong>${orderNumber}</strong> a bien été prise en compte.</p>
        <p>Montant total : <strong>${total.toLocaleString('fr-FR')} FCFA</strong></p>
        <a href="${clientUrl}/suivi/${orderNumber}" 
           style="background:#c8a96e;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
          Suivre ma commande
        </a>
        <p style="margin-top:20px;">Merci pour votre confiance.</p>
        <p><em>L'équipe UrbanBeauty</em></p>
      </div>
    `,
  };
}

function buildOrderStatusEmail({ orderNumber, customerName, status, clientUrl }) {
  const statusLabels = {
    CONFIRMED: 'confirmée',
    PROCESSING: 'en cours de préparation',
    SHIPPED: 'expédiée',
    DELIVERED: 'livrée',
    CANCELLED: 'annulée',
  };

  return {
    subject: `Commande ${orderNumber} - ${statusLabels[status] || status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c8a96e;">🌸 UrbanBeauty</h2>
        <p>Bonjour <strong>${customerName || 'client'}</strong>,</p>
        <p>Votre commande <strong>${orderNumber}</strong> est maintenant <strong>${statusLabels[status] || status}</strong>.</p>
        <a href="${clientUrl}/suivi/${orderNumber}"
           style="background:#c8a96e;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
          Voir ma commande
        </a>
        <p style="margin-top:20px;">Merci pour votre confiance.</p>
        <p><em>L'équipe UrbanBeauty</em></p>
      </div>
    `,
  };
}

module.exports = {
  buildOrderConfirmationEmail,
  buildOrderStatusEmail,
};
