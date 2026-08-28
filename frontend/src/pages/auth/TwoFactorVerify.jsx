import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthTopBar from '../../components/layout/AuthTopBar';

export default function TwoFactorVerify() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();
  const pendingToken = location.state?.pendingToken;

  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!pendingToken) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const payload = useBackupCode ? { backupCode: code } : { code };
      const { data } = await authApi.verifyTwoFactor(pendingToken, payload);
      await completeLogin(data);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <AuthTopBar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-stone-800">Vérification</h1>
            <p className="text-stone-400 text-sm mt-1">
              {useBackupCode
                ? 'Entrez un de vos codes de secours'
                : "Entrez le code affiché par votre app d'authentification"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                <p className="text-sm text-rose-600 font-medium">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={useBackupCode ? 'Code de secours' : 'Code à 6 chiffres'}
                placeholder={useBackupCode ? 'XXXXXXXXXX' : '123456'}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={useBackupCode ? 10 : 6}
              />
              <Button type="submit" className="w-full" loading={loading}>
                Se connecter
              </Button>
            </form>

            <button
              type="button"
              onClick={() => { setUseBackupCode(!useBackupCode); setCode(''); setErrorMsg(''); }}
              className="text-sm text-stone-500 hover:text-stone-700 underline w-full text-center"
            >
              {useBackupCode ? 'Utiliser le code de mon app' : 'Utiliser un code de secours'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}