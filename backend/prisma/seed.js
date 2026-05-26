const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // ─── USERS ───
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@urbanbeauty.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'UrbanBeauty',
      phone: '+221700000000',
      role: 'ADMIN',
    }
  });

  const customer = await prisma.user.create({
    data: {
      email: 'client@test.com',
      password: hashedPassword,
      firstName: 'Aminata',
      lastName: 'Diallo',
      phone: '+221770000001',
      role: 'CUSTOMER',
      addresses: {
        create: {
          label: 'Domicile',
          fullName: 'Aminata Diallo',
          phone: '+221770000001',
          street: 'Rue 10, Almadies',
          city: 'Dakar',
          country: 'Sénégal',
          isDefault: true,
        }
      }
    }
  });

  // ─── CATEGORIES ───
  const [robes, chaussures, sacs, bijoux, soins] = await Promise.all([
    prisma.category.create({ data: { name: 'Robes', slug: 'robes', imageUrl: 'https://via.placeholder.com/400x300?text=Robes' } }),
    prisma.category.create({ data: { name: 'Chaussures', slug: 'chaussures', imageUrl: 'https://via.placeholder.com/400x300?text=Chaussures' } }),
    prisma.category.create({ data: { name: 'Sacs', slug: 'sacs', imageUrl: 'https://via.placeholder.com/400x300?text=Sacs' } }),
    prisma.category.create({ data: { name: 'Bijoux', slug: 'bijoux', imageUrl: 'https://via.placeholder.com/400x300?text=Bijoux' } }),
    prisma.category.create({ data: { name: 'Soins', slug: 'soins', imageUrl: 'https://via.placeholder.com/400x300?text=Soins' } }),
  ]);

  // ─── PRODUCTS ───
  const robe1 = await prisma.product.create({
    data: {
      name: 'Robe Wax Élégante',
      slug: 'robe-wax-elegante',
      description: 'Belle robe en tissu wax africain, coupe moderne et élégante.',
      price: 25000,
      comparePrice: 35000,
      stock: 20,
      isFeatured: true,
      categoryId: robes.id,
      images: {
        create: [
          { url: 'https://via.placeholder.com/600x800?text=Robe+Wax', publicId: 'robe_wax_1', position: 0, isMain: true },
          { url: 'https://via.placeholder.com/600x800?text=Robe+Wax+2', publicId: 'robe_wax_2', position: 1 },
        ]
      },
      variants: {
        create: [
          { size: 'S', color: 'Rouge', stock: 5 },
          { size: 'M', color: 'Rouge', stock: 8 },
          { size: 'L', color: 'Rouge', stock: 4 },
          { size: 'M', color: 'Bleu', stock: 3 },
        ]
      }
    }
  });

  const robe2 = await prisma.product.create({
    data: {
      name: 'Robe Soirée Dorée',
      slug: 'robe-soiree-doree',
      description: 'Robe longue pour soirée, tissu satiné avec reflets dorés.',
      price: 45000,
      comparePrice: 60000,
      stock: 10,
      categoryId: robes.id,
      images: {
        create: [
          { url: 'https://via.placeholder.com/600x800?text=Robe+Soiree', publicId: 'robe_soiree_1', position: 0, isMain: true },
        ]
      },
      variants: {
        create: [
          { size: 'S', color: 'Or', stock: 3 },
          { size: 'M', color: 'Or', stock: 4 },
          { size: 'L', color: 'Or', stock: 3 },
        ]
      }
    }
  });

  const sac1 = await prisma.product.create({
    data: {
      name: 'Sac Cuir Dakar',
      slug: 'sac-cuir-dakar',
      description: 'Sac à main en cuir véritable, fabriqué artisanalement à Dakar.',
      price: 45000,
      comparePrice: 55000,
      stock: 10,
      isFeatured: true,
      categoryId: sacs.id,
      images: {
        create: [
          { url: 'https://via.placeholder.com/600x800?text=Sac+Cuir', publicId: 'sac_cuir_1', position: 0, isMain: true },
        ]
      },
      variants: {
        create: [
          { size: 'Unique', color: 'Noir', stock: 5 },
          { size: 'Unique', color: 'Marron', stock: 5 },
        ]
      }
    }
  });

  const bijou1 = await prisma.product.create({
    data: {
      name: 'Collier Perles Africaines',
      slug: 'collier-perles-africaines',
      description: 'Collier artisanal en perles colorées, fait main au Sénégal.',
      price: 8000,
      stock: 30,
      categoryId: bijoux.id,
      images: {
        create: [
          { url: 'https://via.placeholder.com/600x800?text=Collier', publicId: 'collier_1', position: 0, isMain: true },
        ]
      },
      variants: {
        create: [
          { size: 'Unique', color: 'Multicolore', stock: 15 },
          { size: 'Unique', color: 'Rouge/Or', stock: 15 },
        ]
      }
    }
  });

  const soin1 = await prisma.product.create({
    data: {
      name: 'Huile de Baobab Pure',
      slug: 'huile-baobab-pure',
      description: 'Huile naturelle extraite du baobab, idéale pour la peau et les cheveux.',
      price: 12000,
      stock: 50,
      categoryId: soins.id,
      images: {
        create: [
          { url: 'https://via.placeholder.com/600x800?text=Huile+Baobab', publicId: 'huile_baobab_1', position: 0, isMain: true },
        ]
      },
      variants: {
        create: [
          { size: '100ml', color: 'Naturel', stock: 25 },
          { size: '250ml', color: 'Naturel', stock: 25 },
        ]
      }
    }
  });

  // ─── COUPON ───
  const coupon = await prisma.coupon.create({
    data: {
      code: 'URBAN10',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 20000,
      maxUses: 100,
      isActive: true,
      expiresAt: new Date('2025-12-31'),
    }
  });

  // ─── WISHLIST ───
  await prisma.wishlist.create({
    data: { userId: customer.id, productId: robe2.id }
  });
  await prisma.wishlist.create({
    data: { userId: customer.id, productId: sac1.id }
  });

  // ─── REVIEWS ───
  await prisma.review.create({
    data: {
      userId: customer.id,
      productId: robe1.id,
      rating: 5,
      comment: 'Magnifique robe, tissu de très bonne qualité ! Je recommande vivement.',
      isVisible: true,
    }
  });

  await prisma.review.create({
    data: {
      userId: customer.id,
      productId: sac1.id,
      rating: 4,
      comment: 'Très beau sac, cuir de qualité. Livraison rapide.',
      isVisible: true,
    }
  });

  // ─── ORDER ───
  const order = await prisma.order.create({
    data: {
      orderNumber: 'UB-2024-001',
      userId: customer.id,
      status: 'DELIVERED',
      paymentMethod: 'MOBILE_MONEY',
      paymentStatus: 'PAID',
      subtotal: 25000,
      shippingCost: 2000,
      discount: 2500,
      total: 24500,
      couponId: coupon.id,
      shippingAddress: {
        fullName: 'Aminata Diallo',
        phone: '+221770000001',
        street: 'Rue 10, Almadies',
        city: 'Dakar',
        country: 'Sénégal',
      },
      items: {
        create: [{
          productId: robe1.id,
          productName: 'Robe Wax Élégante',
          variantLabel: 'M / Rouge',
          price: 25000,
          quantity: 1,
          subtotal: 25000,
        }]
      },
      tracking: {
        create: [
          { status: 'PENDING',   message: 'Commande reçue',           createdAt: new Date('2024-01-10T10:00:00') },
          { status: 'CONFIRMED', message: 'Commande confirmée',        createdAt: new Date('2024-01-10T11:00:00') },
          { status: 'PROCESSING',message: 'En cours de préparation',   createdAt: new Date('2024-01-11T09:00:00') },
          { status: 'SHIPPED',   message: 'Colis expédié via DHL',     createdAt: new Date('2024-01-12T08:00:00') },
          { status: 'DELIVERED', message: 'Colis livré avec succès',   createdAt: new Date('2024-01-13T14:00:00') },
        ]
      },
      payments: {
        create: [{
          method: 'MOBILE_MONEY',
          status: 'PAID',
          amount: 24500,
          transactionId: 'MOMO-TXN-001',
          momoNumber: '+221770000001',
          paidAt: new Date('2024-01-10T10:30:00'),
        }]
      }
    }
  });

  // ─── NOTIFICATIONS ───
  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        type: 'ORDER_CONFIRMED',
        title: 'Commande confirmée !',
        message: 'Votre commande UB-2024-001 a bien été confirmée.',
        isRead: true,
        link: '/orders/UB-2024-001',
      },
      {
        userId: customer.id,
        type: 'ORDER_DELIVERED',
        title: 'Commande livrée !',
        message: 'Votre commande UB-2024-001 a été livrée avec succès.',
        isRead: false,
        link: '/orders/UB-2024-001',
      },
      {
        userId: customer.id,
        type: 'PROMO',
        title: 'Offre spéciale -10% !',
        message: 'Utilisez le code URBAN10 pour 10% de réduction sur votre prochaine commande.',
        isRead: false,
      },
    ]
  });

  console.log('✅ Seed terminé avec succès !');
  console.log('   👤 Admin    → admin@urbanbeauty.com / password123');
  console.log('   👤 Client   → client@test.com / password123');
  console.log('   📦 5 catégories, 5 produits');
  console.log('   🎟️  Coupon  → URBAN10 (-10%)');
  console.log('   🛒 1 commande complète avec tracking et paiement');
  console.log('   🔔 3 notifications');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());