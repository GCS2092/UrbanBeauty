// backend/src/modules/auth/auth.service.js
// Remplace ENTIÈREMENT le fichier existant

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../../config/database');
const { signToken } = require('../../utils/jwt.utils');
const { getAccessibleStoreIds } = require('../stores/store.service');
const { sendEmail } = require('../../config/email');
const { buildOtpEmail } = require('../../utils/email.utils');

// ─── Durée de validité de l'OTP : 15 minutes ─────────────────────────────────
const OTP_TTL_MINUTES = 15;

// ─── Génère un code numérique à 6 chiffres ───────────────────────────────────
function generateOtpCode() {
  return String(Math.floor(100000 + crypto.randomInt(900000)));
}

// ─── ÉTAPE 1 : Demande d'inscription → envoi OTP ─────────────────────────────
async function requestRegisterOtp({ email }) {
  // Vérifie que l'email n'est pas déjà pris
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('Cet email est déjà utilisé.');
    error.status = 400;
    throw error;
  }

  // Invalide les anciens OTP de type REGISTER pour cet email
  await prisma.otpCode.deleteMany({
    where: { email, type: 'REGISTER' },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { email, code, type: 'REGISTER', expiresAt },
  });

  // Envoi de l'email
  const { subject, html } = buildOtpEmail({
    code,
    type: 'REGISTER',
    expiresInMinutes: OTP_TTL_MINUTES,
  });

  await sendEmail({ to: email, subject, html });

  return { message: 'Code de vérification envoyé par email.' };
}

// ─── ÉTAPE 2 : Vérification du code OTP ──────────────────────────────────────
async function verifyOtp({ email, code, type = 'REGISTER' }) {
  const otp = await prisma.otpCode.findFirst({
    where: {
      email,
      code,
      type,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    const error = new Error('Code invalide ou expiré.');
    error.status = 400;
    throw error;
  }

  // Marque comme utilisé
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  });

  // Génère un token temporaire de 30 minutes pour permettre la définition du mot de passe
  const setupToken = signToken(
    { email, otpVerified: true, type },
    { expiresIn: '30m' }
  );

  return { setupToken, message: 'Code vérifié avec succès.' };
}

// ─── ÉTAPE 3 : Création du compte avec mot de passe ──────────────────────────
async function completeRegistration({ email, password, firstName, lastName, phone, otpVerified }) {
  if (!otpVerified) {
    const error = new Error('Vérification OTP requise.');
    error.status = 403;
    throw error;
  }

  // Double vérif : l'email ne doit pas déjà exister
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('Cet email est déjà utilisé.');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    },
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

// ─── ANCIEN register (conservé pour rétrocompatibilité si besoin) ─────────────
async function register({ email, password, firstName, lastName, phone }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('Cet email est déjà utilisé.');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, firstName, lastName, phone },
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Email ou mot de passe incorrect.');
    error.status = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const error = new Error('Email ou mot de passe incorrect.');
    error.status = 401;
    throw error;
  }

  // Rattacher les commandes invité au compte
  await prisma.order.updateMany({
    where: { guestEmail: email, userId: null },
    data: { userId: user.id },
  });

  const storeIds = await getAccessibleStoreIds(user);
  const activeStoreId = user.role === 'ADMIN' ? null : (storeIds[0] || null);

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    activeStoreId,
  });

  let stores = [];
  if (storeIds.length) {
    stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
      orderBy: [{ isMain: 'desc' }, { name: 'asc' }],
    });
  }

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    stores,
  };
}

module.exports = {
  register,
  login,
  requestRegisterOtp,
  verifyOtp,
  completeRegistration,
};
