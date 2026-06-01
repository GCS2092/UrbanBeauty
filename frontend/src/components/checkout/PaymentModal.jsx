import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Button from '../ui/Button';
import { formatPrice } from '../../utils/formatPrice';

export default function PaymentModal({ isOpen, onClose, onConfirm, total, settings, isPending }) {
  const [copied, setCopied] = useState(false);

  const waveNumber = settings?.wave_number || '';
  const orangeNumber = settings?.orange_money_number || '';
  const freeNumber = settings?.free_money_number || '';
  const instructions = settings?.payment_instructions || "Envoyez le montant exact puis cliquez sur J'ai payé.";

  const handleCopy = (number) => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    toast.success('Numéro copié !');
    setTimeout(() => setCopied(false), 2000);
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">

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
                <p className="text-sm font-medium text-stone-700">Envoyez au numéro suivant :</p>

                {waveNumber && (
                  <NumberRow
                    label="Wave"
                    number={waveNumber}
                    color="bg-blue-50 text-blue-700 border-blue-200"
                    onCopy={() => handleCopy(waveNumber)}
                    copied={copied}
                  />
                )}
                {orangeNumber && (
                  <NumberRow
                    label="Orange Money"
                    number={orangeNumber}
                    color="bg-orange-50 text-orange-700 border-orange-200"
                    onCopy={() => handleCopy(orangeNumber)}
                    copied={copied}
                  />
                )}
                {freeNumber && (
                  <NumberRow
                    label="Free Money"
                    number={freeNumber}
                    color="bg-green-50 text-green-700 border-green-200"
                    onCopy={() => handleCopy(freeNumber)}
                    copied={copied}
                  />
                )}
              </div>

              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 leading-relaxed">{instructions}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={onConfirm} loading={isPending}>
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
        Copier
      </button>
    </div>
  );
}