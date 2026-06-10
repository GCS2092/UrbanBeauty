const prisma = require('../../config/database');

const DEFAULT_SETTINGS = {
  wave_number: '',
  orange_money_number: '',
  free_money_number: '',
  payment_instructions: 'Envoyez le montant exact puis cliquez sur "J\'ai payé".',
  delivery_fee: '2000',
  free_delivery_threshold: '50000',
  whatsapp_number: '',
  company_name: 'Urban Beauty',
  company_address: '',
  company_phone: '',
  reservation_expiry_hours: '24',
  default_country_code: '+221',
};

async function getSettings() {
  const rows = await prisma.setting.findMany();
  const result = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

async function updateSettings(data) {
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
