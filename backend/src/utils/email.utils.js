// ============================================================
// SonShop — Templates Emails
// Thème : masculin, bleu nuit + or
// Encodage : UTF-8
// ============================================================

const C = {
  navy:      '#1a1a2e',
  gold:      '#c8a96e',
  white:     '#ffffff',
  offWhite:  '#f8f7f5',
  text:      '#1a1a2e',
  textLight: '#6b6b80',
  border:    '#e8e4dc',
  bg:        '#f0ede8',
  success:   '#2d6a4f',
  danger:    '#c0392b',
  green:     '#e8f5e9',
};

// ─── Layout commun ────────────────────────────────────────────────────────────
function layout(bodyContent, preheader = '') {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SonShop</title>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:${C.navy};padding:28px 40px;border-radius:12px 12px 0 0;">
            <div style="font-size:26px;font-weight:900;letter-spacing:4px;font-family:Georgia,serif;">
              <span style="color:${C.gold};">SON</span><span style="color:${C.white};">SHOP</span>
            </div>
            <div style="font-size:9px;color:#aaaaaa;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">
              Mode &amp; Style
            </div>
          </td>
        </tr>

        <!-- BANDE OR -->
        <tr><td style="background:${C.gold};height:3px;font-size:0;">&nbsp;</td></tr>

        <!-- CORPS -->
        <tr>
          <td style="background:${C.white};padding:40px;border-left:1px solid ${C.border};border-right:1px solid ${C.border};">
            ${bodyContent}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${C.navy};padding:24px 40px;border-radius:0 0 12px 12px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;color:#aaaaaa;">
              Des questions ? Contactez-nous via
              <a href="https://wa.me/221XXXXXXXXX" style="color:${C.gold};text-decoration:none;font-weight:600;">WhatsApp</a>
            </p>
            <p style="margin:0;font-size:10px;color:#666666;">
              &copy; ${new Date().getFullYear()} SonShop &middot; Dakar, Sénégal
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Composants réutilisables ─────────────────────────────────────────────────
function badge(status) {
  const map = {
    CONFIRMED:  { label: 'Confirmée',        bg: '#e8f5e9', color: C.success },
    PROCESSING: { label: 'En préparation',   bg: '#fff3cd', color: '#856404' },
    SHIPPED:    { label: 'Expédiée',         bg: '#e3f2fd', color: '#0d47a1' },
    DELIVERED:  { label: 'Livrée ✓',        bg: '#e8f5e9', color: C.success },
    CANCELLED:  { label: 'Annulée',          bg: '#fce4e4', color: C.danger  },
    PENDING:    { label: 'En attente',       bg: '#fff3cd', color: '#856404' },
    DRAFT:      { label: 'Brouillon',        bg: '#f5f5f5', color: '#555'    },
  };
  const s = map[status] || { label: status, bg: '#f5f5f5', color: '#555' };
  return `<span style="display:inline-block;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;background:${s.bg};color:${s.color};">${s.label}</span>`;
}

function cta(text, url) {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
    <tr>
      <td style="background:${C.gold};border-radius:8px;">
        <a href="${url}" style="display:block;padding:14px 36px;color:${C.white};font-weight:700;font-size:13px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

function whatsappCta(number, text) {
  if (!number) return '';
  return `
  <table cellpadding="0" cellspacing="0" style="margin:12px auto 0;">
    <tr>
      <td style="background:#25D366;border-radius:8px;">
        <a href="https://wa.me/${number}" style="display:block;padding:12px 28px;color:#ffffff;font-weight:700;font-size:13px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">
          💬 Contacter SonShop sur WhatsApp
        </a>
      </td>
    </tr>
  </table>`;
}

function divider() {
  return `<div style="border-top:1px solid ${C.border};margin:24px 0;"></div>`;
}

function infoRow(label, value) {
  return `
  <tr>
    <td style="padding:8px 16px;font-size:12px;color:${C.textLight};width:38%;border-bottom:1px solid ${C.border};">${label}</td>
    <td style="padding:8px 16px;font-size:12px;font-weight:600;color:${C.text};border-bottom:1px solid ${C.border};">${value}</td>
  </tr>`;
}

function infoBox(rows) {
  const filtered = rows.filter(Boolean);
  if (!filtered.length) return '';
  return `
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:${C.offWhite};border-radius:8px;border:1px solid ${C.border};margin:20px 0;overflow:hidden;">
    ${filtered.map(([l, v]) => infoRow(l, v)).join('')}
  </table>`;
}

function productRow(item) {
  const label = item.variantLabel
    ? `${item.productName} <span style="color:${C.textLight};font-size:11px;">(${item.variantLabel})</span>`
    : item.productName;

  return `
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid ${C.border};">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;padding-right:12px;">
            <div style="font-size:13px;font-weight:600;color:${C.text};">${label}</div>
            <div style="font-size:11px;color:${C.textLight};margin-top:3px;">Qté : ${item.quantity}</div>
          </td>
          <td style="vertical-align:top;text-align:right;white-space:nowrap;">
            <div style="font-size:13px;font-weight:700;color:${C.text};">
              ${Number(item.subtotal || item.price * item.quantity).toLocaleString('fr-FR')} FCFA
            </div>
            <div style="font-size:11px;color:${C.textLight};">
              ${Number(item.price).toLocaleString('fr-FR')} FCFA / unité
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function totalsBlock({ subtotal, shippingCost, discount, storeDiscount, tax, total }) {
  function row(label, value, bold = false, color = C.textLight) {
    return `
    <tr>
      <td style="padding:5px 0;font-size:13px;color:${C.textLight};">${label}</td>
      <td style="padding:5px 0;font-size:13px;font-weight:${bold ? '700' : '400'};color:${color};text-align:right;">${value}</td>
    </tr>`;
  }

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:2px solid ${C.navy};padding-top:14px;">
    ${row('Sous-total', `${Number(subtotal || 0).toLocaleString('fr-FR')} FCFA`)}
    ${Number(shippingCost)  > 0 ? row('Livraison', `${Number(shippingCost).toLocaleString('fr-FR')} FCFA`) : row('Livraison', 'À confirmer')}
    ${Number(discount)      > 0 ? row('Remise', `-${Number(discount).toLocaleString('fr-FR')} FCFA`, false, C.success) : ''}
    ${Number(storeDiscount) > 0 ? row('Remise boutique', `-${Number(storeDiscount).toLocaleString('fr-FR')} FCFA`, false, C.success) : ''}
    ${Number(tax)           > 0 ? row('Taxes', `${Number(tax).toLocaleString('fr-FR')} FCFA`) : ''}
    <tr>
      <td colspan="2" style="padding-top:10px;">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:${C.navy};border-radius:8px;padding:14px 20px;">
          <tr>
            <td style="font-size:13px;font-weight:700;color:${C.white};">TOTAL</td>
            <td style="font-size:18px;font-weight:900;color:${C.gold};text-align:right;">
              ${Number(total || 0).toLocaleString('fr-FR')} FCFA
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function greeting(name) {
  return `<p style="margin:0 0 20px;font-size:14px;color:${C.text};">
    Bonjour <strong>${name || 'client'}</strong>,
  </p>`;
}

function signature() {
  return `<p style="margin:28px 0 0;font-size:13px;color:${C.textLight};">
    À bientôt,<br/>
    <strong style="color:${C.text};">L'équipe SonShop</strong>
  </p>`;
}

// ─── Bandeau info commande sans compte ───────────────────────────────────────
function guestInfoBanner(whatsappNumber) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;margin:20px 0;">
    <tr>
      <td style="padding:14px 18px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#856404;">
          ℹ️ Commande passée sans compte
        </p>
        <p style="margin:0;font-size:12px;color:#856404;line-height:1.6;">
          Vous n'avez pas de compte SonShop. Pour suivre l'évolution de votre commande,
          contactez-nous directement sur WhatsApp en indiquant votre numéro de commande.
          Vous recevrez également un email à chaque changement de statut.
        </p>
        ${whatsappNumber ? `
        <p style="margin:10px 0 0;font-size:12px;color:#856404;">
          👉 <a href="https://wa.me/${whatsappNumber}" style="color:#856404;font-weight:700;">
            Suivre ma commande sur WhatsApp
          </a>
        </p>` : ''}
      </td>
    </tr>
  </table>`;
}

// ============================================================
// 1. CONFIRMATION DE COMMANDE
// ============================================================
function buildOrderConfirmationEmail({
  orderNumber, guestName, total, clientUrl,
  items = [], shippingCost = 0, discount = 0, storeDiscount = 0,
  tax = 0, subtotal, paymentMethod, shippingAddress,
  isGuest = false, whatsappNumber = '',
}) {
  const name = guestName || 'client';
  const sub  = subtotal ?? total;

  const addrLine = shippingAddress
    ? [shippingAddress.street, shippingAddress.city, shippingAddress.country].filter(Boolean).join(', ')
    : null;

  const payLabels = {
    CASH_ON_DELIVERY: 'Paiement à la livraison',
    MOBILE_MONEY:     'Mobile Money',
  };

  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:${C.navy};">
      Commande confirmée 🎉
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:${C.textLight};">
      Merci <strong style="color:${C.text};">${name}</strong>, votre commande a bien été reçue et est en cours de traitement.
    </p>

    ${infoBox([
      ['N° commande',  `<strong style="font-size:14px;color:${C.navy};">${orderNumber}</strong>`],
      ['Client',       name],
      addrLine      ? ['Adresse de livraison', addrLine] : null,
      paymentMethod ? ['Mode de paiement', payLabels[paymentMethod] || paymentMethod] : null,
    ])}

    ${items.length > 0 ? `
    <h3 style="font-size:11px;font-weight:700;color:${C.navy};text-transform:uppercase;letter-spacing:1px;margin:24px 0 4px;">
      Détail de votre commande
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${items.map(productRow).join('')}
    </table>` : ''}

    ${totalsBlock({ subtotal: sub, shippingCost, discount, storeDiscount, tax, total })}

    ${divider()}

    <p style="margin:0;font-size:13px;color:${C.text};line-height:1.6;">
      Nous préparons votre commande avec soin. Vous serez notifié par email à chaque étape de livraison.
    </p>

    ${isGuest
      ? guestInfoBanner(whatsappNumber)
      : cta('Suivre ma commande', `${clientUrl}/orders/${orderNumber}`)
    }

    ${signature()}
  `;

  return {
    subject: `✅ Commande ${orderNumber} confirmée — SonShop`,
    html: layout(body, `Votre commande ${orderNumber} est confirmée.`),
  };
}

// ============================================================
// 2. MISE À JOUR STATUT
// ============================================================
function buildOrderStatusEmail({ orderNumber, customerName, status, clientUrl, trackingNote, isGuest = false, whatsappNumber = '' }) {
  const config = {
    CONFIRMED:  { emoji: '✅', label: 'confirmée',              msg: 'Votre commande a été confirmée et va bientôt être préparée.' },
    PROCESSING: { emoji: '📦', label: 'en cours de préparation', msg: 'Notre équipe prépare votre commande avec soin.' },
    SHIPPED:    { emoji: '🚚', label: 'expédiée',               msg: 'Votre commande est en route ! Notre livreur vous contactera sous peu.' },
    DELIVERED:  { emoji: '🎁', label: 'livrée',                 msg: 'Votre commande a été livrée avec succès. Merci pour votre confiance !' },
    CANCELLED:  { emoji: '❌', label: 'annulée',                msg: 'Votre commande a été annulée. Contactez-nous si vous avez des questions.' },
    PENDING:    { emoji: '⏳', label: 'en attente',             msg: 'Votre commande est en attente de confirmation.' },
  };

  const s = config[status] || { emoji: '📋', label: status, msg: '' };

  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:${C.navy};">
      ${s.emoji} Commande ${s.label}
    </h1>

    ${greeting(customerName)}

    ${infoBox([
      ['N° commande', `<strong style="color:${C.navy};">${orderNumber}</strong>`],
      ['Statut',      badge(status)],
    ])}

    <p style="margin:0;font-size:14px;color:${C.text};line-height:1.6;">${s.msg}</p>

    ${trackingNote ? `
    <div style="background:${C.offWhite};border-left:3px solid ${C.gold};padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;">
      <p style="margin:0;font-size:13px;color:${C.textLight};font-style:italic;">${trackingNote}</p>
    </div>` : ''}

    ${divider()}

    ${isGuest ? `
    <p style="margin:0 0 8px;font-size:13px;color:${C.text};">
      Pour suivre l'évolution de votre commande, contactez-nous directement en précisant votre numéro de commande : <strong>${orderNumber}</strong>
    </p>
    ${whatsappCta(whatsappNumber, 'Suivre ma commande sur WhatsApp')}
    ` : (status !== 'CANCELLED'
      ? cta('Voir ma commande', `${clientUrl}/orders/${orderNumber}`)
      : whatsappCta(whatsappNumber, 'Nous contacter sur WhatsApp')
    )}

    ${signature()}
  `;

  return {
    subject: `Commande ${orderNumber} — ${s.label} ${s.emoji} — SonShop`,
    html: layout(body, `Votre commande ${orderNumber} est ${s.label}.`),
  };
}

// ============================================================
// 3. FACTURE PAR EMAIL
// ============================================================
function buildInvoiceEmail({ invoiceNumber, orderNumber, customerName, total, clientUrl }) {
  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:${C.navy};">
      Votre facture est disponible
    </h1>

    ${greeting(customerName)}

    <p style="margin:0 0 20px;font-size:14px;color:${C.text};line-height:1.6;">
      Veuillez trouver en pièce jointe la facture <strong>${invoiceNumber}</strong>
      relative à votre commande <strong>${orderNumber}</strong>.
    </p>

    ${infoBox([
      ['N° facture',  invoiceNumber],
      ['N° commande', orderNumber],
      ['Montant',     `<strong style="color:${C.navy};">${Number(total || 0).toLocaleString('fr-FR')} FCFA</strong>`],
    ])}

    ${cta('Télécharger ma facture', `${clientUrl}/invoices/${invoiceNumber}/pdf`)}
    ${signature()}
  `;

  return {
    subject: `Facture ${invoiceNumber} — SonShop`,
    html: layout(body, `Votre facture ${invoiceNumber} est disponible.`),
  };
}

// ============================================================
// 4. RÉINITIALISATION MOT DE PASSE
// ============================================================
function buildPasswordResetEmail({ name, resetUrl }) {
  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:${C.navy};">
      Réinitialisation du mot de passe
    </h1>

    ${greeting(name)}

    <p style="margin:0 0 20px;font-size:14px;color:${C.text};line-height:1.6;">
      Nous avons reçu une demande de réinitialisation de votre mot de passe.
      Cliquez sur le bouton ci-dessous pour en définir un nouveau.
    </p>

    ${cta('Réinitialiser mon mot de passe', resetUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:${C.textLight};line-height:1.6;">
      Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé
      cette réinitialisation, ignorez simplement cet email.
    </p>

    ${signature()}
  `;

  return {
    subject: 'Réinitialisation de votre mot de passe — SonShop',
    html: layout(body),
  };
}

// ============================================================
// 5. PRÉCOMMANDE (article en rupture)
// ============================================================
function buildPreorderEmail({ name, productName, orderNumber }) {
  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:${C.navy};">
      Précommande enregistrée
    </h1>

    ${greeting(name)}

    <p style="margin:0 0 20px;font-size:14px;color:${C.text};line-height:1.6;">
      Votre demande de précommande pour <strong>${productName}</strong> a bien été prise en compte.
      Nous vous contacterons dès que l'article sera de nouveau disponible.
    </p>

    ${infoBox([
      ['Produit',    productName],
      ['Référence',  orderNumber || '—'],
      ['Statut',     badge('PENDING')],
    ])}

    <p style="margin:20px 0 0;font-size:13px;color:${C.textLight};line-height:1.6;">
      Pour toute question, n'hésitez pas à nous contacter via WhatsApp.
    </p>

    ${signature()}
  `;

  return {
    subject: `Précommande confirmée — ${productName} — SonShop`,
    html: layout(body),
  };
}

module.exports = {
  buildOrderConfirmationEmail,
  buildOrderStatusEmail,
  buildInvoiceEmail,
  buildPasswordResetEmail,
  buildPreorderEmail,
};