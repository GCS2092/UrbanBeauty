# Commandes Shell Render - Voir les Erreurs

## 📋 Commandes pour voir les logs depuis le shell Render

### 1. Voir les logs en temps réel (tail)

```bash
# Voir les derniers logs (100 dernières lignes)
tail -n 100 /var/log/render.log

# Suivre les logs en temps réel (comme `tail -f`)
tail -f /var/log/render.log

# Voir les logs avec plus de contexte
tail -n 200 /var/log/render.log | less
```

### 2. Chercher des erreurs spécifiques

```bash
# Chercher toutes les erreurs
grep -i "error" /var/log/render.log

# Chercher les erreurs récentes (dernières 100 lignes)
tail -n 100 /var/log/render.log | grep -i "error"

# Chercher les erreurs Prisma
grep -i "prisma" /var/log/render.log | tail -20

# Chercher les erreurs de base de données
grep -i "database\|connection" /var/log/render.log | tail -20

# Chercher les erreurs TypeScript
grep -i "typescript\|ts" /var/log/render.log | tail -20
```

### 3. Voir les logs de l'application Node.js

```bash
# Les logs de votre application NestJS sont généralement dans stdout/stderr
# Vérifier les processus Node.js
ps aux | grep node

# Voir les logs du processus Node.js
pm2 logs

# Ou si vous utilisez npm/node directement
# Les logs sont généralement redirigés vers stdout/stderr de Render
```

### 4. Commandes utiles pour le débogage

```bash
# Voir les variables d'environnement (sans afficher les valeurs sensibles)
env | grep -E "DATABASE|CORS|JWT|PORT" | sed 's/=.*/=***/'

# Vérifier si le serveur écoute sur le bon port
netstat -tuln | grep 3000

# Voir l'utilisation de la mémoire
free -h

# Voir l'utilisation du disque
df -h

# Voir les processus en cours
ps aux
```

### 5. Vérifier les fichiers de logs spécifiques

```bash
# Voir les logs de build (si disponibles)
ls -la /var/log/
cat /var/log/build.log 2>/dev/null || echo "No build log found"

# Voir les logs système
journalctl -u render -n 50 2>/dev/null || echo "Systemd not available"
```

### 6. Tester la connexion à la base de données

```bash
# Depuis le shell Render, vous pouvez tester la connexion
cd ~/project/src/backend

# Vérifier que Prisma peut se connecter
npx prisma db pull --dry-run

# Ou tester avec Node.js directement
node -e "console.log(process.env.DATABASE_URL ? 'DATABASE_URL configured' : 'DATABASE_URL missing')"
```

### 7. Voir les logs de démarrage de l'application

```bash
# Si l'application utilise npm start:prod
# Les logs sont généralement dans stdout/stderr
# Vous pouvez les voir en temps réel avec :

# Redémarrer l'application et voir les logs
cd ~/project/src/backend
npm run start:prod 2>&1 | tee /tmp/app.log

# Puis dans un autre terminal (si possible) ou après :
tail -f /tmp/app.log
```

### 8. Commandes pour analyser les erreurs

```bash
# Compter le nombre d'erreurs
grep -i "error" /var/log/render.log | wc -l

# Voir les 10 dernières erreurs avec contexte (5 lignes avant/après)
grep -i "error" /var/log/render.log -A 5 -B 5 | tail -50

# Voir les erreurs uniques
grep -i "error" /var/log/render.log | sort | uniq

# Exporter les erreurs dans un fichier
grep -i "error" /var/log/render.log > /tmp/errors.txt
cat /tmp/errors.txt
```

### 9. Vérifier les fichiers de configuration

```bash
# Voir la structure du projet
cd ~/project
ls -la

# Vérifier le package.json
cat src/backend/package.json | grep -A 5 "scripts"

# Vérifier que dist/main.js existe
ls -la src/backend/dist/src/main.js

# Vérifier les variables d'environnement
cd src/backend
cat .env 2>/dev/null || echo "No .env file (using Render env vars)"
```

### 10. Commandes de diagnostic rapide

```bash
# Script de diagnostic complet
echo "=== Node Version ==="
node --version

echo "=== NPM Version ==="
npm --version

echo "=== Current Directory ==="
pwd

echo "=== Files in backend ==="
ls -la src/backend/

echo "=== Build output ==="
ls -la src/backend/dist/ 2>/dev/null || echo "No dist folder"

echo "=== Environment Variables ==="
env | grep -E "DATABASE|CORS|JWT|PORT|NODE" | head -10

echo "=== Recent Errors ==="
tail -n 50 /var/log/render.log | grep -i "error" | tail -10
```

---

## 🚨 Commandes d'urgence

### Si l'application ne démarre pas

```bash
# Vérifier le dernier démarrage
cd ~/project/src/backend
npm run start:prod 2>&1 | head -50

# Vérifier les erreurs de build
cd ~/project/src/backend
npm run build 2>&1 | tail -50

# Vérifier Prisma
cd ~/project/src/backend
npx prisma generate
npx prisma db push --accept-data-loss 2>&1 | tail -20
```

### Si erreur de base de données

```bash
# Tester la connexion
cd ~/project/src/backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1\`
  .then(() => console.log('✅ Database connected'))
  .catch(e => console.error('❌ Database error:', e.message))
  .finally(() => prisma.\$disconnect());
"
```

---

## 📝 Note importante

**Les logs Render sont principalement visibles via :**
1. **Dashboard Render** → Onglet "Logs" (recommandé)
2. **Shell Render** → Commandes ci-dessus (pour diagnostic avancé)

Le shell Render est surtout utile pour :
- Diagnostic approfondi
- Tests de connexion
- Vérification de fichiers
- Tests de commandes

Pour voir les logs en temps réel, le **Dashboard Render** reste la meilleure option.

---

## 🔗 Liens utiles

- **Dashboard Render** : https://dashboard.render.com
- **Documentation Render Shell** : https://render.com/docs/shell

