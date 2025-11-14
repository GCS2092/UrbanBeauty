import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Fonction utilitaire pour générer un slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
}

// Fonction pour générer un numéro unique
function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function generateBookingNumber(): string {
  return `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

async function main() {
  console.log('🌱 Début du seed...');

  // Créer des catégories
  const categoryVisage = await prisma.category.upsert({
    where: { name: 'Soin Visage' },
    update: {},
    create: {
      name: 'Soin Visage',
      slug: generateSlug('Soin Visage'),
      description: 'Produits de soin pour le visage',
      isActive: true,
    },
  });

  const categoryCheveux = await prisma.category.upsert({
    where: { name: 'Soin Cheveux' },
    update: {},
    create: {
      name: 'Soin Cheveux',
      slug: generateSlug('Soin Cheveux'),
      description: 'Produits de soin pour les cheveux',
      isActive: true,
    },
  });

  const categoryCorps = await prisma.category.upsert({
    where: { name: 'Soin Corps' },
    update: {},
    create: {
      name: 'Soin Corps',
      slug: generateSlug('Soin Corps'),
      description: 'Produits de soin pour le corps',
      isActive: true,
    },
  });

  const categoryMaquillage = await prisma.category.upsert({
    where: { name: 'Maquillage' },
    update: {},
    create: {
      name: 'Maquillage',
      slug: generateSlug('Maquillage'),
      description: 'Produits de maquillage',
      isActive: true,
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
          slug: generateSlug('Tresses Africaines'),
          description: 'Création de tresses africaines traditionnelles avec des techniques modernes.',
          price: 80,
          duration: 180,
          category: 'Tresses',
          providerId: coiffeuse.profile.id,
          available: true,
          maxBookingsPerDay: 3,
          advanceBookingDays: 7,
          isFeatured: true,
        },
        {
          name: 'Pose de Perruque',
          slug: generateSlug('Pose de Perruque'),
          description: 'Pose professionnelle de perruque avec préparation du cuir chevelu.',
          price: 120,
          duration: 120,
          category: 'Pose',
          providerId: coiffeuse.profile.id,
          available: true,
          maxBookingsPerDay: 4,
          advanceBookingDays: 5,
        },
        {
          name: 'Locks Entretien',
          slug: generateSlug('Locks Entretien'),
          description: 'Entretien et retouche de locks avec produits naturels.',
          price: 95,
          duration: 150,
          category: 'Entretien',
          providerId: coiffeuse.profile.id,
          available: true,
          maxBookingsPerDay: 5,
          advanceBookingDays: 3,
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
          slug: generateSlug('Masque Hydratant Intensif'),
          description: 'Un masque hydratant intensif pour une peau éclatante et nourrie. Formulé avec des ingrédients naturels.',
          price: 29.99,
          originalPrice: 39.99,
          isOnSale: true,
          discountPercentage: 25,
          brand: 'UrbanBeauty',
          volume: '50ml',
          ingredients: 'Aloe Vera, Acide Hyaluronique, Vitamine E',
          skinType: 'Tous types',
          categoryId: categories[0].id,
          stock: 15,
          lowStockThreshold: 5,
          sellerId: vendeuse.id,
          isActive: true,
          isFeatured: true,
        },
        {
          name: 'Sérum Vitamine C',
          slug: generateSlug('Sérum Vitamine C'),
          description: 'Sérum anti-âge à la vitamine C pour un teint éclatant et une peau ferme.',
          price: 45.00,
          brand: 'UrbanBeauty',
          volume: '30ml',
          ingredients: 'Vitamine C, Acide Ascorbique, Acide Hyaluronique',
          skinType: 'Peau normale à grasse',
          categoryId: categories[0].id,
          stock: 8,
          lowStockThreshold: 3,
          sellerId: vendeuse.id,
          isActive: true,
          isFeatured: true,
        },
        {
          name: 'Shampooing Réparateur',
          slug: generateSlug('Shampooing Réparateur'),
          description: 'Shampooing réparateur pour cheveux abîmés avec kératine et huiles naturelles.',
          price: 18.50,
          brand: 'UrbanBeauty',
          volume: '250ml',
          ingredients: 'Kératine, Huile d\'Argan, Beurre de Karité',
          categoryId: categories[1].id,
          stock: 20,
          lowStockThreshold: 5,
          sellerId: vendeuse.id,
          isActive: true,
        },
        {
          name: 'Huile Capillaire Nourrissante',
          slug: generateSlug('Huile Capillaire Nourrissante'),
          description: 'Huile capillaire 100% naturelle pour nourrir et faire briller les cheveux.',
          price: 24.99,
          originalPrice: 29.99,
          isOnSale: true,
          discountPercentage: 17,
          brand: 'UrbanBeauty',
          volume: '100ml',
          ingredients: 'Huile de Coco, Huile d\'Argan, Jojoba',
          categoryId: categories[1].id,
          stock: 12,
          lowStockThreshold: 4,
          sellerId: vendeuse.id,
          isActive: true,
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

