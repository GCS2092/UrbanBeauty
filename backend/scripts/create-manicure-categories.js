const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function createManicureCategories() {
  try {
    console.log('Création des catégories pour la manicure...');

    const categories = [
      {
        name: 'Manucure Classique',
        description: 'Manucure traditionnelle avec vernis classique',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=90&fit=crop&auto=format',
        order: 1,
      },
      {
        name: 'Pose d\'Ongles',
        description: 'Pose d\'ongles en gel, résine ou capsules',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=90&fit=crop&auto=format',
        order: 2,
      },
      {
        name: 'French Manucure',
        description: 'Manucure française élégante et intemporelle',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=90&fit=crop&auto=format',
        order: 3,
      },
      {
        name: 'Nail Art',
        description: 'Décoration et design créatif sur les ongles',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=90&fit=crop&auto=format',
        order: 4,
      },
      {
        name: 'Soin des Ongles',
        description: 'Soin complet et réparation des ongles',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=90&fit=crop&auto=format',
        order: 5,
      },
      {
        name: 'Pédicure',
        description: 'Soin complet des pieds et des ongles de pieds',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=90&fit=crop&auto=format',
        order: 6,
      },
    ];

    for (const categoryData of categories) {
      const category = await prisma.category.upsert({
        where: { name: categoryData.name },
        update: {
          description: categoryData.description,
          image: categoryData.image,
          order: categoryData.order,
          isActive: true,
        },
        create: {
          name: categoryData.name,
          slug: generateSlug(categoryData.name),
          description: categoryData.description,
          image: categoryData.image,
          order: categoryData.order,
          isActive: true,
        },
      });

      console.log(`✅ Catégorie "${category.name}" créée/mise à jour (ID: ${category.id})`);
    }

    console.log('\n✅ Toutes les catégories de manicure ont été créées avec succès!');
    
    // Afficher toutes les catégories
    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    
    console.log(`\n📋 Total de catégories actives: ${allCategories.length}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createManicureCategories()
  .then(() => {
    console.log('\nScript terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nErreur fatale:', error);
    process.exit(1);
  });

