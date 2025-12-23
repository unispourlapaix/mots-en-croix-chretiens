# Correction de l'erreur "Invalid Refresh Token"

## Problème
L'erreur `AuthApiError: Invalid Refresh Token: Refresh Token Not Found` se produit lorsque Supabase tente de rafraîchir automatiquement un token d'authentification qui est invalide ou expiré dans le localStorage.

## Solution Implémentée

### 1. Gestion au démarrage ([auth.js](js/auth.js))
- Détection des erreurs de refresh token lors de `getSession()`
- Nettoyage automatique du localStorage si le token est invalide
- L'utilisateur peut se reconnecter proprement sans erreur persistante

### 2. Nouvelle méthode `clearInvalidSession()`
Nettoie le localStorage des tokens invalides :
```javascript
async clearInvalidSession() {
    // Supprime les clés localStorage Supabase
    localStorage.removeItem(`sb-${storageKey.replace(/-/g, '')}-auth-token`);
    localStorage.removeItem(`sb-dmszyxowetilvsanqsxm-auth-token`);
    
    // Déconnexion silencieuse
    await supabase.auth.signOut({ scope: 'local' });
}
```

### 3. Gestionnaire global ([supabase.js](js/supabase.js))
- Intercepte les erreurs console liées au refresh token
- Nettoie automatiquement le localStorage
- Évite que l'erreur se propage dans toute l'application

### 4. Surveillance des événements auth
- Écoute de l'événement `TOKEN_REFRESHED`
- Logging amélioré pour le débogage

## Comportement Attendu

### Avant
1. ❌ Erreur "Invalid Refresh Token" dans la console
2. ❌ Impossible de se connecter sans vider manuellement le cache
3. ❌ Expérience utilisateur dégradée

### Après
1. ✅ Détection automatique du token invalide
2. ✅ Nettoyage transparent du localStorage
3. ✅ L'utilisateur peut se reconnecter immédiatement
4. ✅ Logs clairs pour le débogage

## Cas d'Usage

### Scénario 1 : Token expiré au chargement
1. L'utilisateur ouvre l'application avec un vieux token
2. `getSession()` détecte l'erreur
3. `clearInvalidSession()` nettoie le localStorage
4. L'application démarre en mode non authentifié
5. L'utilisateur peut se connecter normalement

### Scénario 2 : Token expire pendant l'utilisation
1. Le refresh automatique échoue
2. Le gestionnaire global intercepte l'erreur
3. Nettoyage automatique du localStorage
4. L'utilisateur est déconnecté proprement
5. Notification possible pour se reconnecter

## Test

Pour tester la correction :
1. Ouvrir les DevTools (F12)
2. Aller dans Application > Storage > Local Storage
3. Trouver les clés commençant par `sb-`
4. Modifier leur valeur pour simuler un token corrompu
5. Recharger la page
6. Vérifier que l'erreur est gérée proprement

## Configuration

La clé de stockage est configurée dans [supabase.js](js/supabase.js) :
```javascript
storageKey: 'mots-croix-auth'
```

Les tokens sont stockés sous :
- `sb-motscroixauth-auth-token` (format normalisé)
- `sb-dmszyxowetilvsanqsxm-auth-token` (fallback avec URL)

## Dépendances

- Supabase JS v2.39.3+
- `autoRefreshToken: true` activé
- `persistSession: true` activé

## Maintenance

Si le problème persiste :
1. Vérifier les logs console pour `🧹 Nettoyage du refresh token invalide...`
2. Vérifier que `clearInvalidSession()` est bien appelée
3. Vider manuellement le localStorage si nécessaire
4. Vérifier la configuration Supabase côté serveur

## Références

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Session Management](https://supabase.com/docs/guides/auth/sessions)
- Fichiers modifiés :
  - [js/auth.js](js/auth.js) - Lignes 33-60 et méthode `clearInvalidSession()`
  - [js/supabase.js](js/supabase.js) - Fonction `setupGlobalErrorHandler()`
