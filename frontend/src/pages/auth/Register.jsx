// frontend/src/pages/auth/Register.jsx
// Remplace ENTIÈREMENT le fichier existant

import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Home, ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Schémas de validation par étape ──────────────────────────────────────────

const schemaEmail = z.object({
  email: z.string().email('Email invalide'),
});

const schemaCode = z.object({
  code: z.string().length(6, 'Le code doit faire 6 chiffres').regex(/^\d+$/, 'Chiffres uniquement'),
});

const schemaPassword = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName:  z.string().min(2, 'Nom requis'),
  phone:     z.string().optional(),
  password:  z.string().min(6, 'Minimum 6 caractères'),
  confirm:   z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm'],
});

// ── Composant principal ───────────────────────────────────────────────────────

export default function Register() {
  const navigate   = useNavigate();
  const [step, setStep]             = useState(1); // 1 | 2 | 3
  const [email, setEmail]           = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [loading, setLoading]       = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Formulaire étape 1 (email) ──────────────────────────────────────────────
  const form1 = useForm({ resolver: zodResolver(schemaEmail) });

  // ── Formulaire étape 2 (code OTP) ──────────────────────────────────────────
  const form2 = useForm({ resolver: zodResolver(schemaCode) });

  // ── Formulaire étape 3 (infos + mot de passe) ──────────────────────────────
  const form3 = useForm({ resolver: zodResolver(schemaPassword) });

  // ── Étape 1 : demande OTP ──────────────────────────────────────────────────
  const onRequestOtp = async ({ email: emailValue }) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await axios.post(`${API}/auth/register/request-otp`, { email: emailValue });
      setEmail(emailValue);
      setStep(2);
      startResendCooldown();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Erreur lors de l\'envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  // ── Étape 2 : vérification OTP ─────────────────────────────────────────────
  const onVerifyOtp = async ({ code }) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await axios.post(`${API}/auth/register/verify-otp`, { email, code });
      setSetupToken(data.setupToken);
      setStep(3);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  // ── Étape 3 : finalisation ─────────────────────────────────────────────────
  const onComplete = async ({ firstName, lastName, phone, password }) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await axios.post(
        `${API}/auth/register/complete`,
        { firstName, lastName, phone, password },
        { headers: { Authorization: `Bearer ${setupToken}` } }
      );
      navigate('/login?registered=1');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  // ── Renvoi du code avec cooldown 60s ───────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await axios.post(`${API}/auth/register/request-otp`, { email });
      form2.reset();
      startResendCooldown();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Erreur lors du renvoi.');
    } finally {
      setLoading(false);
    }
  };

  // ── Indicateur d'étapes ────────────────────────────────────────────────────
  const steps = [
    { n: 1, label: 'Email' },
    { n: 2, label: 'Vérification' },
    { n: 3, label: 'Compte' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🛍️</span>
            <span className="font-bold text-lg tracking-tight text-stone-800">
              Son<span className="text-rose-400">Shop</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors">
              <Home size={15} /> Accueil
            </Link>
            <Link to="/products" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors">
              <ShoppingBag size={15} /> Boutique
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Titre */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-stone-800">Créer un compte</h1>
            <p className="text-stone-400 text-sm mt-1">Rejoignez la communauté SonShop</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                    ${step > s.n ? 'bg-rose-400 text-white' : step === s.n ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-400'}
                  `}>
                    {step > s.n ? <CheckCircle size={16} /> : s.n}
                  </div>
                  <span className={`text-xs mt-1 ${step >= s.n ? 'text-rose-500 font-medium' : 'text-stone-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mb-4 mx-1 transition-colors ${step > s.n ? 'bg-rose-400' : 'bg-stone-200'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">

            {/* Erreur */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                <p className="text-sm text-rose-600 font-medium">{errorMsg}</p>
              </div>
            )}

            {/* ── ÉTAPE 1 : Email ── */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-stone-500">
                  Entrez votre email pour recevoir un code de vérification.
                </p>
                <Input
                  label="Email"
                  type="email"
                  placeholder="vous@exemple.com"
                  error={form1.formState.errors.email?.message}
                  {...form1.register('email')}
                />
                <Button
                  className="w-full"
                  loading={loading}
                  onClick={form1.handleSubmit(onRequestOtp)}
                >
                  Recevoir le code de vérification
                </Button>
              </div>
            )}

            {/* ── ÉTAPE 2 : Code OTP ── */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-stone-500">
                  Un code à 6 chiffres a été envoyé à <strong className="text-stone-700">{email}</strong>
                </p>
                <Input
                  label="Code de vérification"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest font-mono"
                  error={form2.formState.errors.code?.message}
                  {...form2.register('code')}
                />
                <Button
                  className="w-full"
                  loading={loading}
                  onClick={form2.handleSubmit(onVerifyOtp)}
                >
                  Valider le code
                </Button>

                {/* Renvoi + retour */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setErrorMsg(''); form2.reset(); }}
                    className="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <ArrowLeft size={14} /> Changer d'email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className={`text-sm transition-colors ${resendCooldown > 0 ? 'text-stone-300 cursor-not-allowed' : 'text-rose-400 hover:text-rose-600'}`}
                  >
                    {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code'}
                  </button>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 3 : Infos + mot de passe ── */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-stone-500">
                  Email vérifié ✅ Complétez votre profil pour finaliser la création de votre compte.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Prénom"
                    placeholder="Marie"
                    error={form3.formState.errors.firstName?.message}
                    {...form3.register('firstName')}
                  />
                  <Input
                    label="Nom"
                    placeholder="Dupont"
                    error={form3.formState.errors.lastName?.message}
                    {...form3.register('lastName')}
                  />
                </div>
                <Input
                  label="Téléphone (optionnel)"
                  type="tel"
                  placeholder="+221 77 000 00 00"
                  {...form3.register('phone')}
                />
                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="••••••••"
                  error={form3.formState.errors.password?.message}
                  {...form3.register('password')}
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="••••••••"
                  error={form3.formState.errors.confirm?.message}
                  {...form3.register('confirm')}
                />
                <Button
                  className="w-full"
                  loading={loading}
                  onClick={form3.handleSubmit(onComplete)}
                >
                  Créer mon compte
                </Button>
              </div>
            )}

          </div>

          <p className="text-center text-sm text-stone-400 mt-4">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-rose-500 hover:text-rose-600 font-medium">
              Se connecter
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}