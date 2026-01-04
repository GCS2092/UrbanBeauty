const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndFixManicuristes() {
  try {
    console.log('🔍 Vérification des manicuristes...\n');

    // 1. Vérifier si MANICURISTE existe dans l'enum Role
    const roleCheck = await prisma.$queryRawUnsafe(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role')
      AND enumlabel = 'MANICURISTE';
    `);
    
    if (roleCheck.length === 0) {
      console.log('❌ MANICURISTE n\'existe pas dans l\'enum Role');
      console.log('⚠️  Vous devez d\'abord exécuter: node scripts/add-manicuriste-role.js');
      return;
    }
    console.log('✅ MANICURISTE existe dans l\'enum Role\n');

    // 2. Trouver tous les utilisateurs avec le rôle MANICURISTE
    const manicuristes = await prisma.user.findMany({
      where: {
        role: 'MANICURISTE',
        isActive: true,
      },
      include: {
        profile: true,
      },
    });

    console.log(`📊 Nombre de manicuristes trouvés: ${manicuristes.length}\n`);

    if (manicuristes.length === 0) {
      console.log('⚠️  Aucun utilisateur avec le rôle MANICURISTE trouvé');
      console.log('💡 Créez un utilisateur avec le rôle MANICURISTE via le dashboard admin\n');
      return;
    }

    // 3. Vérifier et corriger les profils
    let fixed = 0;
    for (const user of manicuristes) {
      console.log(`👤 Utilisateur: ${user.email} (${user.id})`);
      
      if (!user.profile) {
        console.log('  ⚠️  Pas de profil - création nécessaire');
        // Vous pouvez créer un profil ici si nécessaire
        continue;
      }

      const profile = user.profile;
      console.log(`  📋 Profil ID: ${profile.id}`);
      console.log(`  📝 Nom: ${profile.firstName} ${profile.lastName}`);
      console.log(`  🏢 isProvider: ${profile.isProvider}`);

      if (!profile.isProvider) {
        console.log('  🔧 Correction: isProvider = false -> true');
        await prisma.profile.update({
          where: { id: profile.id },
          data: { isProvider: true },
        });
        fixed++;
        console.log('  ✅ Corrigé!\n');
      } else {
        console.log('  ✅ isProvider est déjà à true\n');
      }
    }

    // 4. Vérifier que findAllProviders retourne bien les manicuristes
    const providers = await prisma.profile.findMany({
      where: {
        user: {
          role: {
            in: ['COIFFEUSE', 'MANICURISTE'],
          },
          isActive: true,
        },
        isProvider: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`\n📊 Résultat de findAllProviders:`);
    console.log(`   Total prestataires: ${providers.length}`);
    
    const manicuristesInList = providers.filter(p => p.user.role === 'MANICURISTE');
    const coiffeusesInList = providers.filter(p => p.user.role === 'COIFFEUSE');
    
    console.log(`   - Manicuristes: ${manicuristesInList.length}`);
    console.log(`   - Coiffeuses: ${coiffeusesInList.length}\n`);

    if (manicuristesInList.length > 0) {
      console.log('✅ Les manicuristes sont bien inclus dans la liste des prestataires!\n');
      manicuristesInList.forEach(p => {
        console.log(`   💅 ${p.firstName} ${p.lastName} (${p.user.email})`);
      });
    } else {
      console.log('⚠️  Aucun manicuriste dans la liste des prestataires');
      console.log('   Vérifiez que les profils ont isProvider = true\n');
    }

    if (fixed > 0) {
      console.log(`\n✅ ${fixed} profil(s) corrigé(s)`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixManicuristes()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });

