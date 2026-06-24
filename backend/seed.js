const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const storeId = 'cmqrptt1l00002d6wehel83rb';

async function main() {
  // 1. Créer une catégorie d'abord
  const category = await prisma.category.create({
    data: {
      name: 'Électronique',
      slug: 'electronique',
    }
  });

  console.log('Catégorie créée :', category.name);

  // 2. Créer les produits en les reliant à la catégorie
  const products = [
    {
      name: 'iPhone 15',
      slug: 'iphone-15',
      price: 650000,
      stock: 10,
      isFeatured: true,
      isActive: true,
      storeId,
      categoryId: category.id,   // 👈 ajout
      images: { create: [{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', publicId: '', isMain: true, position: 0 }] }
    },
    {
      name: 'Samsung Galaxy S24',
      slug: 'samsung-galaxy-s24',
      price: 580000,
      stock: 8,
      isFeatured: true,
      isActive: true,
      storeId,
      categoryId: category.id,   // 👈 ajout
      images: { create: [{ url: 'https://images.unsplash.com/photo-1707412911484-7b0440f2830a?w=600', publicId: '', isMain: true, position: 0 }] }
    },
    {
      name: 'AirPods Pro',
      slug: 'airpods-pro',
      price: 150000,
      stock: 20,
      isFeatured: true,
      isActive: true,
      storeId,
      categoryId: category.id,   // 👈 ajout
      images: { create: [{ url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600', publicId: '', isMain: true, position: 0 }] }
    },
    {
      name: 'MacBook Air M2',
      slug: 'macbook-air-m2',
      price: 1200000,
      stock: 5,
      isFeatured: true,
      isActive: true,
      storeId,
      categoryId: category.id,   // 👈 ajout
      images: { create: [{ url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600', publicId: '', isMain: true, position: 0 }] }
    },
    {
      name: 'Cable USB-C 2m',
      slug: 'cable-usb-c-2m',
      price: 8000,
      stock: 50,
      isFeatured: false,
      isActive: true,
      storeId,
      categoryId: category.id,   // 👈 ajout
      images: { create: [{ url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600', publicId: '', isMain: true, position: 0 }] }
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
    console.log('Créé :', p.name);
  }

  console.log('Tous les produits créés !');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); });