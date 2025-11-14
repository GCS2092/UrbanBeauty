# 🔧 Troubleshooting - Problème 404 sur les routes API

## Problème
Les routes `/api/products` et `/api/services` retournent 404.

## Causes possibles

### 1. Backend non redéployé sur Render
Le backend sur Render n'a peut-être pas encore été redéployé avec le nouveau préfixe `/api`.

**Solution :**
1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service backend
3. Cliquez sur "Manual Deploy" → "Deploy latest commit"
4. Attendez que le déploiement se termine (2-5 minutes)

### 2. Build échoué sur Render
Le build peut avoir échoué silencieusement.

**Solution :**
1. Vérifiez les logs de déploiement sur Render
2. Cherchez les erreurs de compilation TypeScript
3. Vérifiez que toutes les dépendances sont installées

### 3. Routes non configurées correctement
Vérifiez que le backend a bien le préfixe `/api`.

**Vérification :**
- Le fichier `backend/src/main.ts` doit contenir : `app.setGlobalPrefix('api')`
- Les contrôleurs doivent être enregistrés dans `app.module.ts`

## Vérification rapide

### Test 1 : Vérifier que le backend répond
```bash
curl https://urbanbeauty.onrender.com/api/health
```
Devrait retourner : `{"status":"ok","database":"connected"}`

### Test 2 : Vérifier les routes produits
```bash
curl https://urbanbeauty.onrender.com/api/products
```
Devrait retourner un tableau de produits (ou un tableau vide `[]`)

### Test 3 : Vérifier les routes services
```bash
curl https://urbanbeauty.onrender.com/api/services
```
Devrait retourner un tableau de services (ou un tableau vide `[]`)

## Solution temporaire (si le backend n'a pas encore le préfixe `/api`)

Si le backend sur Render n'a pas encore été redéployé, vous pouvez temporairement retirer le préfixe `/api` du frontend :

**Dans `frontend/src/services/products.service.ts` :**
```typescript
getAll: async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products'); // Sans /api
  return response.data;
},
```

**Dans `frontend/src/services/services.service.ts` :**
```typescript
getAll: async (): Promise<Service[]> => {
  const response = await api.get<Service[]>('/services'); // Sans /api
  return response.data;
},
```

**Dans `frontend/src/services/auth.service.ts` :**
```typescript
register: async (data: RegisterDto): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data); // Sans /api
  // ...
},
```

## Solution définitive

1. **Vérifier que le backend est bien redéployé sur Render**
2. **Vérifier les logs Render** pour voir si le build a réussi
3. **Tester les routes directement** avec curl ou Postman
4. **Vérifier la variable d'environnement** `NEXT_PUBLIC_API_URL` sur Vercel

## Commandes utiles

### Vérifier le statut du backend
```bash
# Test de santé
curl https://urbanbeauty.onrender.com/api/health

# Test de la base de données
curl https://urbanbeauty.onrender.com/api/test-db

# Test des produits
curl https://urbanbeauty.onrender.com/api/products

# Test des services
curl https://urbanbeauty.onrender.com/api/services
```

### Vérifier les logs Render
1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service backend
3. Cliquez sur "Logs"
4. Vérifiez les erreurs de build ou de démarrage

## Prochaines étapes

1. ✅ Vérifier que le backend est redéployé sur Render
2. ✅ Vérifier les logs Render pour les erreurs
3. ✅ Tester les routes directement
4. ✅ Si nécessaire, retirer temporairement le préfixe `/api` du frontend

