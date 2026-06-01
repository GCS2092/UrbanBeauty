import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Copy, CheckCircle2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Button from '../ui/Button';
import { formatPrice } from '../../utils/formatPrice';

// ✅ Génère le message WhatsApp avec le résumé de commande
function buildWhatsAppMessage({ total, items, orderData }) {
  const now = new Date();
  const date = now.toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const time = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  });

  const itemsList = items
    .map(item => `  • ${item.productName} x${item.quantity} — ${Number(item.price * item.quantity).toLocaleString('fr-FR')} FCFA`)
    .join('\n');

  const address = orderData?.shippingAddress;

  return encodeURIComponent(
    `🛍️ *Nouvelle commande — Urban Beauty*\n` +
    `📅 Date : ${date} à ${time}\n\n` +
    `👤 *Client :* ${address?.fullName || 'N/A'}\n` +
    `📞 *Téléphone :* ${address?.phone || 'N/A'}\n` +
    `📍 *Adresse :* ${address?.street || ''}, ${address?.city || ''}\n\n` +
    `🛒 *Articles commandés :*\n${itemsList}\n\n` +
    `💰 *Total à payer : ${Number(total).toLocaleString('fr-FR')} FCFA*\n\n` +
    `💳 *Mode de paiement :* Mobile Money\n\n` +
    `⚠️ Je viens d'effectuer mon paiement Mobile Money. Merci de confirmer la réception.`
  );
}

export default function PaymentModal({ isOpen, onClose, onConfirm, total, settings, isPending, orderData }) {
  const [copied, setCopied] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const waveNumber = settings?.wave_number || '';
  const orangeNumber = settings?.orange_money_number || '';
  const freeNumber = settings?.free_money_number || '';
  const instructions = settings?.payment_instructions || "Envoyez le montant exact puis cliquez sur J'ai payé.";
  const whatsappNumber = (settings?.whatsapp_number || '').replace(/[\s+]/g, '');

  const handleCopy = (number, label) => {
    navigator.clipboard.writeText(number);
    setCopied(label);
    toast.success(`Numéro ${label} copié !`);
    setTimeout(() => setCopied(null), 2000);
  };

  // ✅ Confirme la commande puis redirige vers WhatsApp
  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm();

    if (whatsappNumber && orderData) {
      const message = buildWhatsAppMessage({
        total,
        items: orderData.items || [],
        orderData,
      });
      const url = `https://wa.me/${whatsappNumber}?text=${message}`;
      setTimeout(() => {
        window.open(url, '_blank');
      }, 800);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Smartphone size={18} className="text-rose-500" />
                  </div>
                  <h2 className="font-bold text-stone-800 text-lg">Paiement Mobile Money</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-stone-400" />
                </button>
              </div>

              {/* Montant */}
              <div className="bg-rose-50 rounded-xl p-4 text-center">
                <p className="text-sm text-stone-500 mb-1">Montant à envoyer</p>
                <p className="text-3xl font-bold text-rose-600">{formatPrice(total)}</p>
              </div>

              {/* Numéros */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-stone-700">Envoyez au numéro de votre choix :</p>

                {waveNumber && (
                  <NumberRow
                    label="Wave"
                    number={waveNumber}
                    color="bg-blue-50 text-blue-700 border-blue-200"
                    onCopy={() => handleCopy(waveNumber, 'Wave')}
                    copied={copied === 'Wave'}
                  />
                )}
                {orangeNumber && (
                  <NumberRow
                    label="Orange Money"
                    number={orangeNumber}
                    color="bg-orange-50 text-orange-700 border-orange-200"
                    onCopy={() => handleCopy(orangeNumber, 'Orange Money')}
                    copied={copied === 'Orange Money'}
                  />
                )}
                {freeNumber && (
                  <NumberRow
                    label="Free Money"
                    number={freeNumber}
                    color="bg-green-50 text-green-700 border-green-200"
                    onCopy={() => handleCopy(freeNumber, 'Free Money')}
                    copied={copied === 'Free Money'}
                  />
                )}

                {!waveNumber && !orangeNumber && !freeNumber && (
                  <p className="text-sm text-stone-400 text-center py-2">
                    Aucun numéro configuré pour le moment.
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 leading-relaxed">{instructions}</p>
              </div>

              {/* ✅ Info WhatsApp */}
              {whatsappNumber && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                  <MessageCircle size={15} className="text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-700 leading-relaxed">
                    Après avoir cliqué sur <strong>J'ai payé</strong>, vous serez redirigé vers WhatsApp pour envoyer automatiquement le résumé de votre commande à notre équipe.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={handleConfirm} loading={isPending}>
                  J'ai payé ✓
                </Button>
              </div>

              <p className="text-xs text-center text-stone-400">
                Votre commande sera confirmée après vérification du paiement par notre équipe.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NumberRow({ label, number, color, onCopy, copied }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${color}`}>
      <div>
        <p className="text-xs font-medium opacity-70">{label}</p>
        <p className="font-bold text-lg tracking-wide">{number}</p>
      </div>
      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 hover:bg-white transition-colors text-xs font-medium"
      >
        {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
        {copied ? 'Copié !' : 'Copier'}
      </button>
    </div>
  );
}