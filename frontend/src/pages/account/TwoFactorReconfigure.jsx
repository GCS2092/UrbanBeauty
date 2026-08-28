import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Flux en 2 étapes pour changer d'appareil 2FA sans jamais laisser le compte
// sans protection : (1) réauthentification + nouveau QR code, (2) confirmation
// avec le code généré par le nouvel appareil.
export default function TwoFactorReconfigure() {
  const navigate = useNavigate();

  const [step, setStep] = useState('auth'); // 'auth' | 'scan' | 'backupCodes'
  const [password, setPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [manualEntryKey, setManualEntryKey] = useState('');
  const [backupCodes, setBackupCodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStart = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const payload = useBackupCode
        ? { password, backupCode: authCode }
        : { password, code: authCode };
      const { data } = await authApi.reconfigureStart(payload);
      setQrCodeDataUrl(data.qrCodeDataUrl);
      setManualEntryKey(data.manualEntryKey);
      setStep('scan');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Vérification impossible.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const { data } = await authApi.reconfigureConfirm(newCode);
      setBackupCodes(data.backupCodes);
      setStep('backupCodes');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'backupCodes') {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold text-stone-800">Nouvel appareil configuré</h1>
        <p className="text-sm text-stone-500">
          Voici vos nouveaux codes de secours. Les anciens ne sont plus valides. Conservez ceux-ci en lieu sûr, ils ne seront plus affichés.
        </p>
        <div className="bg-stone-50 rounded-xl p-4 grid grid-cols-2 gap-2 font-mono text-sm">
          {backupCodes.map((c) => (
            <div key={c}>{c}</div>
          ))}
        </div>
        <Button className="w-full" onClick={() => navigate('/account/profile', { replace: true })}>
          Terminé
        </Button>
      </div>
    );
  }

  if (step === 'scan') {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold text-stone-800">Scannez avec le nouvel appareil</h1>
        <p className="text-sm text-stone-500">
          Ouvrez Google Authenticator sur votre nouveau téléphone et scannez ce QR code.
        </p>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            <p className="text-sm text-rose-600 font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="flex justify-center">
          <img src={qrCodeDataUrl} alt="QR code 2FA" className="w-48 h-48" />
        </div>

        <details className="text-sm text-stone-500">
          <summary className="cursor-pointer text-stone-600 font-medium">
            Impossible de scanner ?
          </summary>
          <p className="mt-2">Entrez cette clé manuellement dans votre app :</p>
          <code className="block mt-2 bg-stone-50 rounded-lg p-2 break-all text-xs">
            {manualEntryKey}
          </code>
        </details>

        <form onSubmit={handleConfirm} className="space-y-4 pt-2">
          <Input
            label="Code du nouvel appareil"
            placeholder="123456"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            maxLength={6}
          />
          <Button type="submit" className="w-full" loading={loading}>
            Confirmer le nouvel appareil
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
      <h1 className="text-xl font-semibold text-stone-800">Changer d'appareil 2FA</h1>
      <p className="text-sm text-stone-500">
        Confirmez votre identité pour générer un nouveau QR code. Votre ancien appareil restera valide jusqu'à confirmation du nouveau.
      </p>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <p className="text-sm text-rose-600 font-medium">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleStart} className="space-y-4">
        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label={useBackupCode ? 'Code de secours' : 'Code actuel de votre app'}
          placeholder={useBackupCode ? 'XXXXXXXXXX' : '123456'}
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
          maxLength={useBackupCode ? 10 : 6}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Continuer
        </Button>
      </form>

      <button
        type="button"
        onClick={() => { setUseBackupCode(!useBackupCode); setAuthCode(''); setErrorMsg(''); }}
        className="text-sm text-stone-500 hover:text-stone-700 underline w-full text-center"
      >
        {useBackupCode ? "Utiliser le code de mon app" : "Je n'ai plus accès à mon app (code de secours)"}
      </button>
    </div>
  );
}