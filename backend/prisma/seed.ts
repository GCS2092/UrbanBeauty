import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // Créer des catégories
  const categoryVisage = await prisma.category.upsert({
    where: { name: 'Soin Visage' },
    update: {},
    create: {
      name: 'Soin Visage',
    },
  });

  const categoryCheveux = await prisma.category.upsert({
    where: { name: 'Soin Cheveux' },
    update: {},
    create: {
      name: 'Soin Cheveux',
    },
  });

  const categoryCorps = await prisma.category.upsert({
    where: { name: 'Soin Corps' },
    update: {},
    create: {
      name: 'Soin Corps',
    },
  });

  const categoryMaquillage = await prisma.category.upsert({
    where: { name: 'Maquillage' },
    update: {},
    create: {
      name: 'Maquillage',
    },
  });

  const categories = [categoryVisage, categoryCheveux, categoryCorps, categoryMaquillage];

  console.log('✅ Catégories créées');

  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Créer un utilisateur CLIENT de test
  const client = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      email: 'client@test.com',
      password: hashedPassword,
      role: 'CLIENT',
      profile: {
        create: {
          firstName: 'Marie',
          lastName: 'Client',
          phone: '+33612345678',
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log('✅ Utilisateur CLIENT créé : client@test.com / password123');

  // Créer un utilisateur COIFFEUSE de test
  const coiffeuse = await prisma.user.upsert({
    where: { email: 'coiffeuse@test.com' },
    update: {},
    create: {
      email: 'coiffeuse@test.com',
      password: hashedPassword,
      role: 'COIFFEUSE',
      profile: {
        create: {
          firstName: 'Sophie',
          lastName: 'Coiffeuse',
          phone: '+33612345679',
          isProvider: true,
          rating: 4.8,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log('✅ Utilisateur COIFFEUSE créé : coiffeuse@test.com / password123');

  // Créer des services pour la coiffeuse
  if (coiffeuse.profile) {
    await prisma.service.createMany({
      data: [
        {
          name: 'Tresses Africaines',
          description: 'Création de tresses africaines traditionnelles avec des techniques modernes.',
          price: 80,
          duration: 180,
          providerId: coiffeuse.profile.id,
          available: true,
        },
        {
          name: 'Pose de Perruque',
          description: 'Pose professionnelle de perruque avec préparation du cuir chevelu.',
          price: 120,
          duration: 120,
          providerId: coiffeuse.profile.id,
          available: true,
        },
        {
          name: 'Locks Entretien',
          description: 'Entretien et retouche de locks avec produits naturels.',
          price: 95,
          duration: 150,
          providerId: coiffeuse.profile.id,
          available: true,
        },
      ],
    });
    console.log('✅ Services créés pour la coiffeuse');
  }

  // Créer un utilisateur VENDEUSE de test
  const vendeuse = await prisma.user.upsert({
    where: { email: 'vendeuse@test.com' },
    update: {},
    create: {
      email: 'vendeuse@test.com',
      password: hashedPassword,
      role: 'VENDEUSE',
      profile: {
        create: {
          firstName: 'Julie',
          lastName: 'Vendeuse',
          phone: '+33612345680',
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log('✅ Utilisateur VENDEUSE créé : vendeuse@test.com / password123');

  // Créer des produits pour la vendeuse
  if (vendeuse.profile) {
    await prisma.product.createMany({
      data: [
        {
          name: 'Masque Hydratant Intensif',
          description: 'Un masque hydratant intensif pour une peau éclatante et nourrie. Formulé avec des ingrédients naturels.',
          price: 29.99,
          categoryId: categories[0].id,
          stock: 15,
          sellerId: vendeuse.id,
        },
        {
          name: 'Sérum Vitamine C',
          description: 'Sérum anti-âge à la vitamine C pour un teint éclatant et une peau ferme.',
          price: 45.00,
          categoryId: categories[0].id,
          stock: 8,
          sellerId: vendeuse.id,
        },
        {
          name: 'Shampooing Réparateur',
          description: 'Shampooing réparateur pour cheveux abîmés avec kératine et huiles naturelles.',
          price: 18.50,
          categoryId: categories[1].id,
          stock: 20,
          sellerId: vendeuse.id,
        },
        {
          name: 'Huile Capillaire Nourrissante',
          description: 'Huile capillaire 100% naturelle pour nourrir et faire briller les cheveux.',
          price: 24.99,
          categoryId: categories[1].id,
          stock: 12,
          sellerId: vendeuse.id,
        },
      ],
    });
    console.log('✅ Produits créés pour la vendeuse');
  }

  // Créer un utilisateur ADMIN de test
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+33612345681',
        },
      },
    },
  });

  console.log('✅ Utilisateur ADMIN créé : admin@test.com / password123');

  console.log('\n🎉 Seed terminé avec succès !');
  console.log('\n📝 Comptes de test créés :');
  console.log('   CLIENT    : client@test.com / password123');
  console.log('   COIFFEUSE : coiffeuse@test.com / password123');
  console.log('   VENDEUSE  : vendeuse@test.com / password123');
  console.log('   ADMIN     : admin@test.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

