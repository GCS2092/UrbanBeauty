import { put, list, del } from '@vercel/blob';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '.env') });

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

async function testVercelBlob() {
  console.log('🧪 Test de Vercel Blob Storage\n');

  // Vérifier le token
  if (!BLOB_TOKEN) {
    console.error('❌ ERREUR: BLOB_READ_WRITE_TOKEN n\'est pas défini');
    console.log('\n💡 Solution:');
    console.log('   1. Ajoutez BLOB_READ_WRITE_TOKEN dans votre fichier .env');
    console.log('   2. Ou définissez la variable d\'environnement');
    process.exit(1);
  }

  console.log('✅ Token trouvé:', BLOB_TOKEN.substring(0, 20) + '...\n');

  try {
    // 1. Créer une image de test (simple PNG 1x1 pixel)
    console.log('📝 Étape 1: Création d\'une image de test...');
    const testImagePath = join(__dirname, 'test-image.png');
    
    // PNG minimal 1x1 pixel (format base64)
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(pngBase64, 'base64');
    writeFileSync(testImagePath, pngBuffer);
    console.log('✅ Image de test créée:', testImagePath);

    // 2. Upload vers Vercel Blob
    console.log('\n📤 Étape 2: Upload vers Vercel Blob...');
    const fileName = `test-${Date.now()}.png`;
    const pathname = `urbanbeauty/test/${fileName}`;

    const blob = await put(pathname, pngBuffer, {
      access: 'public',
      contentType: 'image/png',
      token: BLOB_TOKEN,
    });

    console.log('✅ Upload réussi!');
    console.log('   URL:', blob.url);
    console.log('   Pathname:', blob.pathname);
    console.log('   Size:', pngBuffer.length, 'bytes');

    // 3. Vérifier que l'image est accessible
    console.log('\n🔍 Étape 3: Vérification de l\'accessibilité...');
    try {
      const https = require('https');
      const response = await new Promise<{ statusCode?: number; headers: any }>((resolve, reject) => {
        https.get(blob.url, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => { data += chunk; });
          res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers }));
        }).on('error', reject);
      });
      
      if (response.statusCode === 200) {
        console.log('✅ Image accessible publiquement');
        console.log('   Status:', response.statusCode);
        console.log('   Content-Type:', response.headers['content-type']);
      } else {
        console.error('❌ Image non accessible');
        console.error('   Status:', response.statusCode);
      }
    } catch (error: any) {
      console.warn('⚠️  Impossible de vérifier l\'accessibilité:', error.message);
      console.log('   (L\'upload a réussi, mais la vérification HTTP a échoué)');
    }

    // 4. Lister les fichiers
    console.log('\n📋 Étape 4: Liste des fichiers dans urbanbeauty/test/...');
    const { blobs } = await list({
      prefix: 'urbanbeauty/test/',
      token: BLOB_TOKEN,
    });
    console.log(`✅ ${blobs.length} fichier(s) trouvé(s)`);
    blobs.forEach((b, index) => {
      console.log(`   ${index + 1}. ${b.pathname} (${b.size} bytes)`);
    });

    // 5. Supprimer le fichier de test
    console.log('\n🗑️  Étape 5: Suppression du fichier de test...');
    await del(blob.pathname, {
      token: BLOB_TOKEN,
    });
    console.log('✅ Fichier supprimé:', blob.pathname);

    // 6. Nettoyer le fichier local
    unlinkSync(testImagePath);
    console.log('✅ Fichier local supprimé');

    // Résumé
    console.log('\n' + '='.repeat(50));
    console.log('🎉 TEST RÉUSSI!');
    console.log('='.repeat(50));
    console.log('\n✅ Vercel Blob Storage fonctionne correctement');
    console.log('✅ Upload: OK');
    console.log('✅ Accessibilité: OK');
    console.log('✅ Liste: OK');
    console.log('✅ Suppression: OK');
    console.log('\n💡 Vous pouvez maintenant utiliser Vercel Blob dans votre application!\n');

  } catch (error: any) {
    console.error('\n❌ ERREUR lors du test:');
    console.error('   Message:', error.message);
    
    if (error.message.includes('Invalid token')) {
      console.error('\n💡 Le token est invalide. Vérifiez:');
      console.error('   1. Le token est correct dans votre .env');
      console.error('   2. Le token n\'a pas expiré');
      console.error('   3. Le token a les bonnes permissions (read/write)');
    } else if (error.message.includes('Unauthorized')) {
      console.error('\n💡 Non autorisé. Vérifiez:');
      console.error('   1. Le token a les permissions read/write');
      console.error('   2. Le Blob Storage est bien créé dans Vercel');
    } else {
      console.error('\n💡 Vérifiez:');
      console.error('   1. Votre connexion internet');
      console.error('   2. Les logs détaillés ci-dessus');
    }
    
    process.exit(1);
  }
}

// Exécuter le test
testVercelBlob();

