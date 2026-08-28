import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthTopBar from '../../components/layout/AuthTopBar';

export default function TwoFactorSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();
  const setupToken = location.state?.setupToken;

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [manualEntryKey, setManualEntryKey] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionData, setSessionData] = useState(null); // stocke la réponse d'enableTwoFactor

  useEffect(() => {
    if (!setupToken) {
      navigate('/login', { replace: true });
      return;
    }
    authApi.setupTwoFactor(setupToken)
      .then(({ data }) => {
        setQrCodeDataUrl(data.qrCodeDataUrl);
        setManualEntryKey(data.manualEntryKey);
      })
      .catch(() => {
        toast.error('Impossible de générer le QR code. Reconnectez-vous.');
        navigate('/login', { replace: true });
      });
  }, [setupToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const { data } = await authApi.enableTwoFactor(setupToken, code);
      setSessionData(data); // contient user, token, backupCodes — un seul appel, on garde tout
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    await completeLogin(sessionData);
  };

  if (sessionData) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <AuthTopBar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
            <h1 className="text-xl font-semibold text-stone-800">Codes de secours</h1>
            <p className="text-sm text-stone-500">
              Conservez ces codes en lieu sûr. Ils ne seront plus affichés et permettent de vous connecter si vous perdez l'accès à votre app d'authentification.
            </p>
            <div className="bg-stone-50 rounded-xl p-4 grid grid-cols-2 gap-2 font-mono text-sm">
              {sessionData.backupCodes.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>
            <Button className="w-full" onClick={handleContinue}>
              J'ai noté mes codes, continuer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <AuthTopBar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-stone-800">Sécurisez votre compte</h1>
            <p className="text-stone-400 text-sm mt-1">Configurez la double authentification</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                <p className="text-sm text-rose-600 font-medium">{errorMsg}</p>
              </div>
            )}

            <p className="text-sm text-stone-500">
              Scannez ce QR code avec Google Authenticator, Authy ou Microsoft Authenticator.
            </p>

            {qrCodeDataUrl ? (
              <div className="flex justify-center">
                <img src={qrCodeDataUrl} alt="QR code 2FA" className="w-48 h-48" />
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
              </div>
            )}

            <details className="text-sm text-stone-500">
              <summary className="cursor-pointer text-stone-600 font-medium">
                Impossible de scanner ?
              </summary>
              <p className="mt-2">
                Entrez cette clé manuellement dans votre app ("Saisir une clé de configuration") :
              </p>
              <code className="block mt-2 bg-stone-50 rounded-lg p-2 break-all text-xs">
                {manualEntryKey}
              </code>
            </details>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <Input
                label="Code à 6 chiffres"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
              <Button type="submit" className="w-full" loading={loading}>
                Activer la double authentification
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}