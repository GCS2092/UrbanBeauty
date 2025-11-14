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

  // Mettre à jour les catégories avec de belles images de femmes noires avec coiffures afro
  await prisma.category.update({
    where: { id: categoryVisage.id },
    data: {
      image: 'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
    },
  });

  await prisma.category.update({
    where: { id: categoryCheveux.id },
    data: {
      image: 'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
    },
  });

  await prisma.category.update({
    where: { id: categoryCorps.id },
    data: {
      image: 'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
    },
  });

  await prisma.category.update({
    where: { id: categoryMaquillage.id },
    data: {
      image: 'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
    },
  });

  console.log('✅ Catégories créées avec images');

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

  // Créer des services pour la coiffeuse avec images
  if (coiffeuse.profile) {
    // Images de services de coiffure - Femmes noires avec coiffures afro, tresses, locks
    const serviceImages = {
      tresses: [
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
      ],
      perruque: [
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
      ],
      locks: [
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
      ],
    };

    const tresses = await prisma.service.create({
      data: {
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
        images: {
          create: serviceImages.tresses.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Tresses Africaines',
            title: 'Tresses Africaines - Service de coiffure',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const perruque = await prisma.service.create({
      data: {
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
        images: {
          create: serviceImages.perruque.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Pose de Perruque',
            title: 'Pose de Perruque - Service de coiffure',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const locks = await prisma.service.create({
      data: {
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
        images: {
          create: serviceImages.locks.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Locks Entretien',
            title: 'Locks Entretien - Service de coiffure',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    // Ajouter plus de services pour rendre la plateforme plus belle
    const boxBraids = await prisma.service.create({
      data: {
        name: 'Box Braids',
        slug: generateSlug('Box Braids'),
        description: 'Pose de box braids modernes et élégantes, parfaites pour tous les types d\'événements.',
        price: 150,
        duration: 240,
        category: 'Tresses',
        providerId: coiffeuse.profile.id,
        available: true,
        maxBookingsPerDay: 2,
        advanceBookingDays: 10,
        isFeatured: true,
        images: {
          create: serviceImages.tresses.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Box Braids',
            title: 'Box Braids - Service de coiffure',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const crochetBraids = await prisma.service.create({
      data: {
        name: 'Crochet Braids',
        slug: generateSlug('Crochet Braids'),
        description: 'Pose de crochet braids rapide et protectrice. Idéale pour protéger vos cheveux naturels.',
        price: 110,
        duration: 180,
        category: 'Tresses',
        providerId: coiffeuse.profile.id,
        available: true,
        maxBookingsPerDay: 3,
        advanceBookingDays: 7,
        images: {
          create: serviceImages.tresses.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Crochet Braids',
            title: 'Crochet Braids - Service de coiffure',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const coiffureEvenement = await prisma.service.create({
      data: {
        name: 'Coiffure Événement',
        slug: generateSlug('Coiffure Événement'),
        description: 'Coiffure sur mesure pour vos événements spéciaux : mariage, anniversaire, soirée.',
        price: 85,
        duration: 120,
        category: 'Coiffure',
        providerId: coiffeuse.profile.id,
        available: true,
        maxBookingsPerDay: 4,
        advanceBookingDays: 14,
        isFeatured: true,
        images: {
          create: serviceImages.perruque.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Coiffure Événement',
            title: 'Coiffure Événement - Service de coiffure',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    console.log('✅ Services créés avec images pour la coiffeuse (6 services au total)');
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

  // Créer des produits pour la vendeuse avec images
  if (vendeuse.profile) {
    // Images de produits cosmétiques depuis Unsplash - Haute qualité et pertinentes
    // URLs optimisées pour produits beauté/cosmétiques
    const productImages = {
      masque: [
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
      ],
      serum: [
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
      ],
      shampooing: [
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
      ],
      huile: [
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
      ],
      creme: [
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
      ],
      maquillage: [
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
      ],
      corps: [
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1594736797933-d0c2b3c0b1a1?w=1200&q=90&fit=crop&auto=format',
      ],
    };

    // Créer les produits
    const masque = await prisma.product.create({
      data: {
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
        images: {
          create: productImages.masque.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Masque Hydratant Intensif',
            title: 'Masque Hydratant Intensif - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const serum = await prisma.product.create({
      data: {
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
        images: {
          create: productImages.serum.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Sérum Vitamine C',
            title: 'Sérum Vitamine C - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const shampooing = await prisma.product.create({
      data: {
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
        images: {
          create: productImages.shampooing.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Shampooing Réparateur',
            title: 'Shampooing Réparateur - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const huile = await prisma.product.create({
      data: {
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
        images: {
          create: productImages.huile.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Huile Capillaire Nourrissante',
            title: 'Huile Capillaire Nourrissante - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    // Ajouter plus de produits pour rendre la plateforme plus belle
    const creme = await prisma.product.create({
      data: {
        name: 'Crème Visage Anti-Âge',
        slug: generateSlug('Crème Visage Anti-Âge'),
        description: 'Crème anti-âge enrichie en collagène et peptides pour réduire les rides et raffermir la peau.',
        price: 55.00,
        originalPrice: 65.00,
        isOnSale: true,
        discountPercentage: 15,
        brand: 'UrbanBeauty',
        volume: '50ml',
        ingredients: 'Collagène, Peptides, Rétinol, Acide Hyaluronique',
        skinType: 'Peau mature',
        categoryId: categories[0].id,
        stock: 10,
        lowStockThreshold: 3,
        sellerId: vendeuse.id,
        isActive: true,
        isFeatured: true,
        images: {
          create: productImages.creme.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Crème Visage Anti-Âge',
            title: 'Crème Visage Anti-Âge - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const fondTeint = await prisma.product.create({
      data: {
        name: 'Fond de Teint Matifiant',
        slug: generateSlug('Fond de Teint Matifiant'),
        description: 'Fond de teint longue tenue à fini mat, couvrant et résistant à l\'eau. Disponible en 12 nuances.',
        price: 32.99,
        brand: 'UrbanBeauty',
        volume: '30ml',
        ingredients: 'Pigments minéraux, Acide salicylique, Vitamine E',
        skinType: 'Tous types',
        categoryId: categories[3].id,
        stock: 25,
        lowStockThreshold: 8,
        sellerId: vendeuse.id,
        isActive: true,
        isFeatured: true,
        images: {
          create: productImages.maquillage.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Fond de Teint Matifiant',
            title: 'Fond de Teint Matifiant - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const rougeALevres = await prisma.product.create({
      data: {
        name: 'Rouge à Lèvres Liquide',
        slug: generateSlug('Rouge à Lèvres Liquide'),
        description: 'Rouge à lèvres liquide longue tenue, mat et confortable. Disponible en 8 teintes tendance.',
        price: 24.99,
        brand: 'UrbanBeauty',
        volume: '6ml',
        ingredients: 'Cire de carnauba, Huiles végétales, Pigments',
        skinType: 'Tous types',
        categoryId: categories[3].id,
        stock: 30,
        lowStockThreshold: 10,
        sellerId: vendeuse.id,
        isActive: true,
        images: {
          create: productImages.maquillage.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Rouge à Lèvres Liquide',
            title: 'Rouge à Lèvres Liquide - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const laitCorps = await prisma.product.create({
      data: {
        name: 'Lait Corps Hydratant',
        slug: generateSlug('Lait Corps Hydratant'),
        description: 'Lait hydratant pour le corps à l\'aloe vera et beurre de karité. Texture légère et non grasse.',
        price: 19.99,
        brand: 'UrbanBeauty',
        volume: '400ml',
        ingredients: 'Aloe Vera, Beurre de Karité, Huile d\'Amande',
        skinType: 'Tous types',
        categoryId: categories[2].id,
        stock: 18,
        lowStockThreshold: 6,
        sellerId: vendeuse.id,
        isActive: true,
        images: {
          create: productImages.corps.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Lait Corps Hydratant',
            title: 'Lait Corps Hydratant - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const baumeLevres = await prisma.product.create({
      data: {
        name: 'Baume à Lèvres Réparateur',
        slug: generateSlug('Baume à Lèvres Réparateur'),
        description: 'Baume à lèvres ultra-nourrissant avec miel et beurre de cacao. Apaise et répare les lèvres gercées.',
        price: 8.99,
        brand: 'UrbanBeauty',
        volume: '10ml',
        ingredients: 'Miel, Beurre de Cacao, Cire d\'Abeille, Vitamine E',
        skinType: 'Tous types',
        categoryId: categories[0].id,
        stock: 40,
        lowStockThreshold: 15,
        sellerId: vendeuse.id,
        isActive: true,
        images: {
          create: productImages.creme.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Baume à Lèvres Réparateur',
            title: 'Baume à Lèvres Réparateur - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const masqueCheveux = await prisma.product.create({
      data: {
        name: 'Masque Capillaire Réparateur',
        slug: generateSlug('Masque Capillaire Réparateur'),
        description: 'Masque capillaire intensif pour cheveux abîmés. Formulé avec kératine et huiles naturelles.',
        price: 28.99,
        originalPrice: 34.99,
        isOnSale: true,
        discountPercentage: 17,
        brand: 'UrbanBeauty',
        volume: '200ml',
        ingredients: 'Kératine, Huile d\'Argan, Beurre de Karité, Avocat',
        categoryId: categories[1].id,
        stock: 14,
        lowStockThreshold: 5,
        sellerId: vendeuse.id,
        isActive: true,
        isFeatured: true,
        images: {
          create: productImages.shampooing.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Masque Capillaire Réparateur',
            title: 'Masque Capillaire Réparateur - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    // Ajouter encore plus de produits pour une plateforme complète
    const nettoyant = await prisma.product.create({
      data: {
        name: 'Nettoyant Visage Purifiant',
        slug: generateSlug('Nettoyant Visage Purifiant'),
        description: 'Nettoyant visage doux et purifiant pour éliminer les impuretés sans dessécher la peau.',
        price: 22.99,
        brand: 'UrbanBeauty',
        volume: '200ml',
        ingredients: 'Acide salicylique, Extrait de thé vert, Niacinamide',
        skinType: 'Peau grasse à mixte',
        categoryId: categories[0].id,
        stock: 22,
        lowStockThreshold: 8,
        sellerId: vendeuse.id,
        isActive: true,
        images: {
          create: productImages.masque.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Nettoyant Visage Purifiant',
            title: 'Nettoyant Visage Purifiant - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const tonique = await prisma.product.create({
      data: {
        name: 'Tonique Équilibrant',
        slug: generateSlug('Tonique Équilibrant'),
        description: 'Tonique rafraîchissant pour équilibrer le pH de la peau et resserrer les pores.',
        price: 18.50,
        brand: 'UrbanBeauty',
        volume: '150ml',
        ingredients: 'Hamamélis, Acide glycolique, Aloe Vera',
        skinType: 'Tous types',
        categoryId: categories[0].id,
        stock: 16,
        lowStockThreshold: 6,
        sellerId: vendeuse.id,
        isActive: true,
        images: {
          create: productImages.serum.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Tonique Équilibrant',
            title: 'Tonique Équilibrant - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const mascara = await prisma.product.create({
      data: {
        name: 'Mascara Volume Intense',
        slug: generateSlug('Mascara Volume Intense'),
        description: 'Mascara longue tenue pour des cils volumineux et recourbés toute la journée.',
        price: 19.99,
        brand: 'UrbanBeauty',
        volume: '8ml',
        ingredients: 'Cire de carnauba, Fibres de soie, Vitamine E',
        skinType: 'Tous types',
        categoryId: categories[3].id,
        stock: 35,
        lowStockThreshold: 12,
        sellerId: vendeuse.id,
        isActive: true,
        isFeatured: true,
        images: {
          create: productImages.maquillage.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Mascara Volume Intense',
            title: 'Mascara Volume Intense - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const palette = await prisma.product.create({
      data: {
        name: 'Palette Fards à Paupières',
        slug: generateSlug('Palette Fards à Paupières'),
        description: 'Palette de 12 nuances mat et satinées pour créer des looks variés.',
        price: 42.99,
        originalPrice: 49.99,
        isOnSale: true,
        discountPercentage: 14,
        brand: 'UrbanBeauty',
        volume: '12 x 1.5g',
        ingredients: 'Talc, Mica, Oxydes de fer',
        skinType: 'Tous types',
        categoryId: categories[3].id,
        stock: 12,
        lowStockThreshold: 4,
        sellerId: vendeuse.id,
        isActive: true,
        isFeatured: true,
        images: {
          create: productImages.maquillage.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Palette Fards à Paupières',
            title: 'Palette Fards à Paupières - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const gommage = await prisma.product.create({
      data: {
        name: 'Gommage Corps Exfoliant',
        slug: generateSlug('Gommage Corps Exfoliant'),
        description: 'Gommage doux pour le corps aux grains de sucre et huiles nourrissantes.',
        price: 26.99,
        brand: 'UrbanBeauty',
        volume: '300ml',
        ingredients: 'Sucre de canne, Huile de coco, Beurre de karité',
        skinType: 'Tous types',
        categoryId: categories[2].id,
        stock: 14,
        lowStockThreshold: 5,
        sellerId: vendeuse.id,
        isActive: true,
        images: {
          create: productImages.corps.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Gommage Corps Exfoliant',
            title: 'Gommage Corps Exfoliant - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    const soinYeux = await prisma.product.create({
      data: {
        name: 'Soin Contour des Yeux',
        slug: generateSlug('Soin Contour des Yeux'),
        description: 'Soin anti-cernes et anti-poches pour un regard frais et éclatant.',
        price: 35.99,
        brand: 'UrbanBeauty',
        volume: '15ml',
        ingredients: 'Caféine, Acide hyaluronique, Vitamine K',
        skinType: 'Tous types',
        categoryId: categories[0].id,
        stock: 20,
        lowStockThreshold: 7,
        sellerId: vendeuse.id,
        isActive: true,
        images: {
          create: productImages.creme.map((url, index) => ({
            url,
            type: 'URL',
            alt: 'Soin Contour des Yeux',
            title: 'Soin Contour des Yeux - UrbanBeauty',
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
    });

    console.log('✅ Produits créés avec images pour la vendeuse (16 produits au total)');
  }

  // Créer l'admin slovengama@gmail.com
  const adminSloven = await prisma.user.upsert({
    where: { email: 'slovengama@gmail.com' },
    update: {},
    create: {
      email: 'slovengama@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Sloven',
          lastName: 'Gama',
          phone: '+33612345682',
        },
      },
    },
  });

  console.log('✅ Utilisateur ADMIN créé : slovengama@gmail.com / password123');

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
  console.log('   ADMIN     : slovengama@gmail.com / password123 ⭐');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

