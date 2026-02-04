#!/bin/bash

echo "🔍 Recherche des requêtes Supabase à corriger..."
echo ""

echo "❌ Fichiers contenant 'notificationsunread-count':"
grep -rn "notificationsunread-count" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . 2>/dev/null || echo "  Aucun fichier trouvé"
echo ""

echo "❌ Fichiers contenant 'favoritescount':"
grep -rn "favoritescount" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . 2>/dev/null || echo "  Aucun fichier trouvé"
echo ""

echo "⚠️  Fichiers faisant des requêtes sur 'profiles':"
grep -rn "from('profiles')" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . 2>/dev/null | head -20
echo ""

echo "⚠️  Fichiers faisant des requêtes sur 'bookings':"
grep -rn "from('bookings')" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . 2>/dev/null | head -10
echo ""

echo "💡 Conseil: Vérifiez aussi ces patterns courants:"
echo "  - useQuery hooks"
echo "  - useEffect avec fetch"
echo "  - API routes"
echo "  - Actions serveur (si Next.js 13+)"