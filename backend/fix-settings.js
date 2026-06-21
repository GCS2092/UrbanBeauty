const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  await p.setting.upsert({
    where: { key: 'company_name' },
    update: { value: 'SonShop' },
    create: { key: 'company_name', value: 'SonShop' },
  });
  console.log('company_name mis à jour : SonShop');
  await p.$disconnect();
}

main().catch(console.error);