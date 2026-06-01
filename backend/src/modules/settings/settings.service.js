const prisma = require('../../config/database');

// Les clés gérées et leurs valeurs par défaut
const DEFAULT_SETTINGS = {
  wave_number: '',
  orange_money_number: '',
  free_money_number: '',
  payment_instructions: 'Envoyez le montant exact puis cliquez sur "J\'ai payé".',
  delivery_fee: '2000',
  free_delivery_threshold: '50000',
};

async function getSettings() {
  const rows = await prisma.setting.findMany();
  // Fusionner avec les défauts
  const result = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

async function updateSettings(data) {
  // Upsert chaque clé reçue
  const updates = Object.entries(data).map(([key, value]) =>
    prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  );
  await Promise.all(updates);
  return getSettings();
}

module.exports = { getSettings, updateSettings };