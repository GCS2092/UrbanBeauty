// ============================================================
// SonShop — Templates Emails
// Thème : féminin, rose poudré + doré + blanc cassé
// ============================================================

const C = {
  primary:   '#C8748A',   // rose poudré principal
  gold:      '#C8A96E',   // doré accent
  navy:      '#2C2C3E',   // fond sombre
  white:     '#FFFFFF',
  offWhite:  '#FDF8F5',
  cream:     '#FAF3EE',
  text:      '#2C2C3E',
  textLight: '#7A7585',
  border:    '#EDE4DC',
  bg:        '#F5EDE8',
  success:   '#2D6A4F',
  danger:    '#C0392B',
  warning:   '#856404',
};

// ── Layout commun ────────────────────────────────────────────────────────────
function layout(bodyContent, preheader = '') {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SonShop</title>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;">${preheader}</div>` : ''}
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:${C.navy};padding:28px 40px;border-radius:12px 12px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:24px;font-weight:900;letter-spacing:3px;font-family:Georgia,serif;">
                    <span style="color:${C.primary};">SON</span><span style="color:${C.white};">SHOP</span>
                  </div>
                  <div style="font-size:9px;color:#aaaaaa;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">
                    Mode &amp; Beauté
                  </div>
                </td>
                <td style="text-align:right;">
                  <div style="display:inline-block;background:${C.primary};border-radius:50%;width:10px;height:10px;margin-left:4px;opacity:0.6;"></div>
                  <div style="display:inline-block;background:${C.gold};border-radius:50%;width:10px;height:10px;margin-left:4px;opacity:0.8;"></div>
                  <div style="display:inline-block;background:${C.white};border-radius:50%;width:10px;height:10px;margin-left:4px;opacity:0.4;"></div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BANDE ROSE -->
        <tr><td style="background:linear-gradient(90deg,${C.primary},${C.gold});height:3px;font-size:0;">&nbsp;</td></tr>

        <!-- CORPS -->
        <tr>
          <td style="background:${C.white};padding:40px;border-left:1px solid ${C.border};border-right:1px solid ${C.border};">
            ${bodyContent}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${C.navy};padding:24px 40px;border-radius:0 0 12px 12px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;color:#aaaaaa;">
              Des questions ? Contactez-nous via
              <a href="https://wa.me/221XXXXXXXXX" style="color:${C.primary};text-decoration:none;font-weight:600;">WhatsApp</a>
            </p>
            <p style="margin:0 0 8px;font-size:10px;color:#666666;">
              &copy; ${new Date().getFullYear()} SonShop &middot; Dakar, Sénégal
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:12px auto 0;">
              <tr>
                <td style="padding:0 6px;">
                  <div style="width:24px;height:24px;background:rgba(255,255,255,0.1);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                    <span style="color:${C.primary};font-size:12px;">f</span>
                  </div>
                </td>
                <td style="padding:0 6px;">
                  <div style="width:24px;height:24px;background:rgba(255,255,255,0.1);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                    <span style="color:${C.primary};font-size:12px;">in</span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Composants réutilisables ─────────────────────────────────────────────────

function badge(status) {
  const map = {
    CONFIRMED:  { label: 'Confirmée',        bg: '#e8f5e9', color: C.success },
    PROCESSING: { label: 'En préparation',   bg: '#fff3cd', color: C.warning },
    SHIPPED:    { label: 'Expédiée',         bg: '#e3f2fd', color: '#0d47a1' },
    DELIVERED:  { label: 'Livrée ✓',        bg: '#e8f5e9', color: C.success },
    CANCELLED:  { label: 'Annulée',          bg: '#fce4e4', color: C.danger  },
    PENDING:    { label: 'En attente',       bg: '#fff3cd', color: C.warning },
    DRAFT:      { label: 'Brouillon',        bg: '#f5f5f5', color: '#555'  },
    PAID:       { label: 'Payé',             bg: '#e8f5e9', color: C.success },
    REJECTED:   { label: 'Rejeté',           bg: '#fce4e4', color: C.danger  },
    PARTIAL:    { label: 'Partiel',          bg: '#fff3cd', color: C.warning },
    GENERATED:  { label: 'Générée',          bg: '#e3f2fd', color: '#0d47a1' },
  };
  const s = map[status] || { label: status, bg: '#f5f5f5', color: '#555' };
  return `<span style="display:inline-block;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;background:${s.bg};color:${s.color};">${s.label}</span>`;
}

function cta(text, url) {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
    <tr>
      <td style="background:${C.primary};border-radius:8px;box-shadow:0 2px 8px rgba(200,116,138,0.3);">
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
            <div style="font-size:13px;font-weight:700;color:${C.text};">${Number(item.subtotal || item.price * item.quantity).toLocaleString('fr-FR')} FCFA</div>
            <div style="font-size:11px;color:${C.textLight};">${Number(item.price).toLocaleString('fr-FR')} FCFA / unité</div>
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
            <td style="font-size:18px;font-weight:900;color:${C.gold};text-align:right;">${Number(total || 0).toLocaleString('fr-FR')} FCFA</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function greeting(name) {
  return `<p style="margin:0 0 20px;font-size:14px;color:${C.text};">
    Bonjour <strong>${name || 'chère cliente'}</strong>,
  </p>`;
}

function signature() {
  return `<p style="margin:28px 0 0;font-size:13px;color:${C.textLight};">
    À bientôt,<br/>
    <strong style="color:${C.text};">L'équipe SonShop</strong>
  </p>`;
}

function guestInfoBanner(whatsappNumber) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;margin:20px 0;">
    <tr>
      <td style="padding:14px 18px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${C.warning};">
          ℹ️ Commande passée sans compte
        </p>
        <p style="margin:0;font-size:12px;color:${C.warning};line-height:1.6;">
          Vous n'avez pas de compte SonShop. Pour suivre l'évolution de votre commande,
          contactez-nous directement sur WhatsApp en indiquant votre numéro de commande.
        </p>
        ${whatsappNumber ? `
        <p style="margin:10px 0 0;font-size:12px;color:${C.warning};">
          👉 <a href="https://wa.me/${whatsappNumber}" style="color:${C.warning};font-weight:700;">Suivre ma commande sur WhatsApp</a>
        </p>` : ''}
      </td>
    </tr>
  </table>`;
}

// ── Bloc KPI pour le rapport ─────────────────────────────────────────────────
function kpiCard(emoji, label, value, subValue = '', color = C.primary) {
  return `
  <td style="width:25%;padding:8px;" valign="top">
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:${C.offWhite};border:1px solid ${C.border};border-radius:10px;overflow:hidden;">
      <tr>
        <td style="background:${color};padding:8px 12px;text-align:center;">
          <span style="font-size:20px;">${emoji}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px;text-align:center;">
          <div style="font-size:18px;font-weight:800;color:${C.text};">${value}</div>
          <div style="font-size:10px;color:${C.textLight};text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">${label}</div>
          ${subValue ? `<div style="font-size:10px;color:${color};font-weight:600;margin-top:4px;">${subValue}</div>` : ''}
        </td>
      </tr>
    </table>
  </td>`;
}

function progressBar(label, value, max, color = C.primary) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return `
  <tr>
    <td style="padding:6px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:12px;color:${C.text};width:45%;">${label}</td>
          <td style="width:40%;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e4dc;border-radius:4px;height:8px;">
              <tr><td style="width:${pct}%;background:${color};border-radius:4px;height:8px;"></td><td></td></tr>
            </table>
          </td>
          <td style="font-size:11px;color:${C.textLight};text-align:right;width:15%;padding-left:8px;">${Number(value).toLocaleString('fr-FR')} FCFA</td>
        </tr>
      </table>
    </td>
  </tr>`;
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
  const name = guestName || 'chère cliente';
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
      ['N° commande',  `<strong style="font-size:14px;color:${C.primary};">${orderNumber}</strong>`],
      ['Cliente',      name],
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
      Nous préparons votre commande avec soin. Vous serez notifiée par email à chaque étape de livraison.
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
    CANCELLED:  { emoji: '⏳', label: 'en attente',             msg: 'Votre commande est en attente de confirmation.' },
  };

  const s = config[status] || { emoji: '📋', label: status, msg: '' };

  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:${C.navy};">
      ${s.emoji} Commande ${s.label}
    </h1>

    ${greeting(customerName)}

    ${infoBox([
      ['N° commande', `<strong style="color:${C.primary};">${orderNumber}</strong>`],
      ['Statut',      badge(status)],
    ])}

    <p style="margin:0;font-size:14px;color:${C.text};line-height:1.6;">${s.msg}</p>

    ${trackingNote ? `
    <div style="background:${C.offWhite};border-left:3px solid ${C.primary};padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;">
      <p style="margin:0;font-size:13px;color:${C.textLight};font-style:italic;">${trackingNote}</p>
    </div>` : ''}

    ${divider()}

    ${isGuest ? `
    <p style="margin:0 0 8px;font-size:13px;color:${C.text};">
      Pour suivre votre commande, contactez-nous en précisant le numéro : <strong>${orderNumber}</strong>
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
      ['Montant',     `<strong style="color:${C.primary};">${Number(total || 0).toLocaleString('fr-FR')} FCFA</strong>`],
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
      ['Produit',   productName],
      ['Référence', orderNumber || '—'],
      ['Statut',    badge('PENDING')],
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

// ============================================================
// 6. RAPPORT DE GESTION (EMAIL)
// ============================================================
function buildReportEmail({ period, financial, orders, products, stock, expenses, storeName = 'SonShop' }) {
  const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');
  const pct = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;

  const beneficePositif = financial.beneficeEstime >= 0;
  const beneficeColor   = beneficePositif ? C.success : C.danger;
  const beneficeEmoji   = beneficePositif ? '📈' : '📉';

  // ── Section KPI ────────────────────────────────────────────
  const kpiSection = `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      ${kpiCard('💰', "Chiffre d'affaires", `${fmt(financial.chiffreAffaires)} FCFA`, '', C.primary)}
      ${kpiCard(beneficeEmoji, 'Bénéfice estimé', `${fmt(financial.beneficeEstime)} FCFA`, '', beneficeColor)}
      ${kpiCard('🛍️', 'Commandes', String(orders.total), '', C.navy)}
      ${kpiCard('📄', 'Facturé', `${fmt(financial.totalInvoiced)} FCFA`, '', C.gold)}
    </tr>
  </table>`;

  // ── Section Commandes par statut ───────────────────────────
  const statusLabels = {
    PENDING: 'En attente', CONFIRMED: 'Confirmées', PROCESSING: 'En préparation',
    SHIPPED: 'Expédiées', DELIVERED: 'Livrées', CANCELLED: 'Annulées', DRAFT: 'Brouillons',
  };
  const statusColors = {
    PENDING: C.warning, CONFIRMED: '#0d47a1', PROCESSING: C.gold,
    SHIPPED: '#1565c0', DELIVERED: C.success, CANCELLED: C.danger, DRAFT: '#888',
  };
  const statusRows = Object.entries(orders.byStatus || {}).map(([status, count]) => {
    const pctVal = pct(count, orders.total);
    const color = statusColors[status] || C.primary;
    return `
    <tr>
      <td style="padding:5px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:12px;color:${C.text};width:38%;">${statusLabels[status] || status}</td>
            <td style="width:42%;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:${pctVal}%;background:${color};height:8px;border-radius:4px;"></td>
                  <td style="background:#e8e4dc;height:8px;border-radius:${pctVal > 0 ? '0' : '4px'} 4px 4px ${pctVal > 0 ? '0' : '4px'};"></td>
                </tr>
              </table>
            </td>
            <td style="font-size:12px;color:${C.textLight};text-align:right;padding-left:8px;width:20%;">${count} (${pctVal}%)</td>
          </tr>
        </table>
      </td>
    </tr>`;
  }).join('');

  // ── Top clients ────────────────────────────────────────────
  const topCA = (orders.topClients || [])[0]?.total || 1;
  const topClientsRows = (orders.topClients || []).slice(0, 5).map((c, i) => {
    const pctVal = pct(c.total, topCA);
    return `
    <tr>
      <td style="padding:5px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:28px;text-align:center;">
              <span style="display:inline-block;width:20px;height:20px;background:${i === 0 ? C.gold : C.border};border-radius:50%;font-size:10px;font-weight:700;color:${i === 0 ? '#fff' : C.textLight};text-align:center;line-height:20px;">${i + 1}</span>
            </td>
            <td style="font-size:12px;color:${C.text};padding:0 8px;">${c.name}<span style="color:${C.textLight};font-size:10px;margin-left:4px;">${c.count} cmd</span></td>
            <td style="font-size:11px;color:${C.primary};font-weight:700;text-align:right;white-space:nowrap;">${fmt(c.total)} FCFA</td>
          </tr>
          <tr>
            <td></td>
            <td colspan="2" style="padding-bottom:4px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:${pctVal}%;background:${C.primary};height:3px;border-radius:2px;opacity:0.4;"></td>
                  <td style="background:${C.border};height:3px;"></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }).join('');

  // ── Top produits ───────────────────────────────────────────
  const topRevenue = (products.topProducts || [])[0]?.revenue || 1;
  const topProduitsRows = (products.topProducts || []).slice(0, 5).map((p, i) => `
    <tr>
      <td style="padding:5px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:12px;color:${C.text};width:50%;">${p.name}</td>
            <td style="font-size:11px;color:${C.textLight};text-align:center;width:20%;">${p.quantity} unités</td>
            <td style="font-size:11px;color:${C.primary};font-weight:700;text-align:right;width:30%;white-space:nowrap;">${fmt(p.revenue)} FCFA</td>
          </tr>
          <tr>
            <td colspan="3" style="padding:2px 0 4px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:${pct(p.revenue, topRevenue)}%;background:${C.gold};height:3px;border-radius:2px;"></td>
                  <td style="background:${C.border};height:3px;"></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  // ── Stock ──────────────────────────────────────────────────
  const stockAlertRows = (stock.lowStock || []).slice(0, 5).map(p => `
    <tr>
      <td style="padding:4px 0;font-size:12px;color:${C.danger};">⚠️ ${p.name}</td>
      <td style="padding:4px 0;font-size:11px;color:${C.textLight};text-align:right;">Stock : ${p.stock} / Alerte : ${p.alert}</td>
    </tr>`).join('');

  // ── Dépenses ───────────────────────────────────────────────
  const topDepense = Math.max(...Object.values(expenses.byCategory || {}), 1);
  const depenseRows = Object.entries(expenses.byCategory || {}).map(([cat, amount]) =>
    progressBar(cat, amount, topDepense, C.navy)
  ).join('');

  const body = `
    <!-- En-tête rapport -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <h1 style="margin:0 0 4px;font-size:20px;font-weight:800;color:${C.navy};">Rapport de gestion</h1>
          <p style="margin:0;font-size:13px;color:${C.textLight};">${storeName}</p>
        </td>
        <td style="text-align:right;vertical-align:top;">
          <div style="display:inline-block;background:${C.offWhite};border:1px solid ${C.border};border-radius:8px;padding:8px 14px;">
            <div style="font-size:10px;color:${C.textLight};text-transform:uppercase;letter-spacing:0.5px;">Période</div>
            <div style="font-size:12px;font-weight:700;color:${C.navy};margin-top:2px;">${period.from} → ${period.to}</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- KPI Cards -->
    ${kpiSection}

    <!-- Équilibre financier -->
    <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:10px;padding:16px;margin:0 0 20px;">
      <div style="font-size:11px;font-weight:700;color:${C.navy};text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">📊 Équilibre financier</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${progressBar("Chiffre d'affaires", financial.chiffreAffaires, financial.chiffreAffaires, C.primary)}
        ${progressBar('Coût des ventes (COGS)', financial.cogs, financial.chiffreAffaires, C.navy)}
        ${progressBar('Dépenses', financial.totalExpenses, financial.chiffreAffaires, C.danger)}
      </table>
      <div style="margin-top:12px;padding:10px 14px;background:${beneficePositif ? '#e8f5e9' : '#fce4e4'};border-radius:8px;display:flex;justify-content:space-between;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;font-weight:700;color:${beneficeColor};">${beneficeEmoji} Bénéfice estimé</td>
            <td style="font-size:16px;font-weight:900;color:${beneficeColor};text-align:right;">${fmt(financial.beneficeEstime)} FCFA</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Commandes & Top clients (2 colonnes) -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr valign="top">
        <td width="48%" style="padding-right:8px;">
          <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:10px;padding:16px;">
            <div style="font-size:11px;font-weight:700;color:${C.navy};text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">🛍️ Commandes par statut</div>
            <table width="100%" cellpadding="0" cellspacing="0">${statusRows}</table>
          </div>
        </td>
        <td width="4%"></td>
        <td width="48%" style="padding-left:8px;">
          <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:10px;padding:16px;">
            <div style="font-size:11px;font-weight:700;color:${C.navy};text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">🏆 Top 5 clients</div>
            <table width="100%" cellpadding="0" cellspacing="0">${topClientsRows || '<tr><td style="font-size:12px;color:#aaa;">Aucune donnée</td></tr>'}</table>
          </div>
        </td>
      </tr>
    </table>

    <!-- Top produits -->
    <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:10px;padding:16px;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:${C.navy};text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">💎 Top 5 produits vendus</div>
      <table width="100%" cellpadding="0" cellspacing="0">${topProduitsRows || '<tr><td style="font-size:12px;color:#aaa;">Aucune vente livrée sur la période</td></tr>'}</table>
    </div>

    <!-- Stock & Dépenses (2 colonnes) -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr valign="top">
        <td width="48%" style="padding-right:8px;">
          <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:10px;padding:16px;">
            <div style="font-size:11px;font-weight:700;color:${C.navy};text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">📦 Stock</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-size:12px;color:${C.text};padding:4px 0;">Total produits</td><td style="font-size:12px;font-weight:700;color:${C.navy};text-align:right;">${stock.totalProducts}</td></tr>
              <tr><td style="font-size:12px;color:${C.text};padding:4px 0;">Valeur totale</td><td style="font-size:12px;font-weight:700;color:${C.navy};text-align:right;">${fmt(stock.totalStockValue)} FCFA</td></tr>
              <tr><td style="font-size:12px;color:${C.warning};padding:4px 0;">⚠️ Alertes stock bas</td><td style="font-size:12px;font-weight:700;color:${C.warning};text-align:right;">${stock.lowStock?.length || 0}</td></tr>
              <tr><td style="font-size:12px;color:${C.danger};padding:4px 0;">❌ Épuisés</td><td style="font-size:12px;font-weight:700;color:${C.danger};text-align:right;">${stock.outOfStock?.length || 0}</td></tr>
            </table>
            ${stockAlertRows ? `
            ${divider()}
            <div style="font-size:10px;font-weight:700;color:${C.danger};text-transform:uppercase;margin-bottom:6px;">Alertes</div>
            <table width="100%" cellpadding="0" cellspacing="0">${stockAlertRows}</table>` : ''}
          </div>
        </td>
        <td width="4%"></td>
        <td width="48%" style="padding-left:8px;">
          <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:10px;padding:16px;">
            <div style="font-size:11px;font-weight:700;color:${C.navy};text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">💸 Dépenses — ${fmt(expenses.total)} FCFA</div>
            <table width="100%" cellpadding="0" cellspacing="0">${depenseRows || '<tr><td style="font-size:12px;color:#aaa;">Aucune dépense enregistrée</td></tr>'}</table>
          </div>
        </td>
      </tr>
    </table>

    ${divider()}
    <p style="margin:0;font-size:11px;color:${C.textLight};text-align:center;line-height:1.6;">
      Rapport généré automatiquement le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
    </p>
  `;

  return {
    subject: `📊 Rapport de gestion — ${period.from} au ${period.to} — ${storeName}`,
    html: layout(body, `Rapport de gestion du ${period.from} au ${period.to}`),
  };
}

module.exports = {
  buildOrderConfirmationEmail,
  buildOrderStatusEmail,
  buildInvoiceEmail,
  buildPasswordResetEmail,
  buildPreorderEmail,
  buildReportEmail,
};
