# 🔑 Guide "Mot de passe oublié"

## Fonctionnalité

Le système de réinitialisation de mot de passe utilise **Supabase Auth** pour envoyer un email sécurisé avec un lien de reset.

## 🎯 Flux utilisateur

### 1. Accéder au formulaire
- Cliquer sur "👤 Connexion" dans le menu
- Cliquer sur "Se connecter" (passer en mode connexion)
- Le lien "🔑 Mot de passe oublié ?" apparaît en bleu

### 2. Demander la réinitialisation
- Cliquer sur "🔑 Mot de passe oublié ?"
- Le formulaire change : titre "Réinitialiser le mot de passe"
- Entrer l'email associé au compte
- Cliquer sur "📧 Envoyer le lien"

### 3. Recevoir l'email
- Supabase envoie un email automatique
- Contient un lien magique sécurisé
- Valide pendant 1 heure

### 4. Créer nouveau mot de passe
- Cliquer sur le lien dans l'email
- Supabase redirige vers l'application
- Interface de changement de mot de passe s'affiche
- Entrer le nouveau mot de passe
- Confirmer

### 5. Connexion
- Le nouveau mot de passe est actif immédiatement
- Se connecter avec le nouvel identifiant

## 💻 Code technique

### Frontend (`js/auth.js`)

```javascript
async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
    });
    
    if (error) {
        return { success: false, error: error.message };
    }
    
    return {
        success: true,
        message: 'Un email de réinitialisation a été envoyé !'
    };
}
```

### Interface HTML (`index.html`)

```html
<p id="forgotPasswordLink" style="display: none;">
    <a href="#" id="forgotPasswordBtn">
        🔑 Mot de passe oublié ?
    </a>
</p>
```

### Styles CSS (`css/styles.css`)

```css
#forgotPasswordBtn {
    color: #667eea !important;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
}

#forgotPasswordBtn:hover {
    color: #5568d3 !important;
    text-decoration: underline;
    transform: translateY(-1px);
}
```

## ⚙️ Configuration Supabase

### Email Template

Dans le dashboard Supabase → Authentication → Email Templates → Reset Password :

```html
<h2>Réinitialisation de mot de passe</h2>
<p>Bonjour,</p>
<p>Vous avez demandé à réinitialiser votre mot de passe.</p>
<p>Cliquez sur le lien ci-dessous :</p>
<p><a href="{{ .ConfirmationURL }}">Changer mon mot de passe</a></p>
<p>Ce lien expire dans 1 heure.</p>
<p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
```

### Redirect URL

Configuré dans `supabase.auth.resetPasswordForEmail()` :

```javascript
redirectTo: window.location.origin  // Ex: https://votreapp.com
```

## 🔐 Sécurité

✅ **Token unique** : Chaque lien est un token unique à usage unique  
✅ **Expiration** : Le lien expire après 1 heure  
✅ **HTTPS requis** : Les emails de reset nécessitent HTTPS en production  
✅ **Rate limiting** : Supabase limite les tentatives (protection anti-spam)  
✅ **Email vérifié** : Seuls les emails enregistrés reçoivent le lien  

## 🐛 Dépannage

### L'email n'arrive pas

1. **Vérifier les spams/courrier indésirable**
2. **Vérifier que l'email existe** : Essayer de se connecter normalement pour confirmer
3. **Attendre 5 minutes** : Parfois les emails prennent du temps
4. **Vérifier la configuration SMTP** dans Supabase dashboard

### Le lien ne fonctionne pas

1. **Vérifier l'expiration** : Le lien est valide 1h seulement
2. **Redemander un nouveau lien** : Les anciens liens sont invalidés
3. **Vérifier la Redirect URL** dans les paramètres Supabase

### Erreur "Invalid credentials"

- L'utilisateur a peut-être fait une faute de frappe dans l'email
- Suggérer de créer un nouveau compte si le problème persiste

## 📧 Personnalisation des emails

Pour personnaliser les emails Supabase :

1. Aller dans **Supabase Dashboard**
2. **Authentication** → **Email Templates**
3. Éditer le template "Reset Password"
4. Variables disponibles :
   - `{{ .ConfirmationURL }}` : Lien de reset
   - `{{ .Token }}` : Token brut
   - `{{ .Email }}` : Email de l'utilisateur

## 🎨 Branding

Pour que les emails correspondent au branding du jeu :

```html
<div style="font-family: 'Poppins', sans-serif; padding: 20px; background: #fff5f9;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px;">
        <h2 style="color: #ff69b4;">🔑 Réinitialisation de mot de passe</h2>
        <p style="color: #666;">Bonjour,</p>
        <!-- ... reste du template ... -->
    </div>
</div>
```

## ✅ Tests

### Test manuel
1. S'inscrire avec un vrai email
2. Se déconnecter
3. Cliquer sur "Mot de passe oublié"
4. Entrer l'email
5. Vérifier la réception de l'email
6. Cliquer sur le lien
7. Créer nouveau mot de passe
8. Se reconnecter

### Test automatisé (Cypress/Playwright)
```javascript
cy.visit('/');
cy.get('#authToggleLink').click(); // Mode connexion
cy.get('#forgotPasswordBtn').click();
cy.get('#authEmail').type('test@example.com');
cy.get('#authSubmitBtn').click();
cy.contains('Un email de réinitialisation a été envoyé').should('be.visible');
```

## 💡 Améliorations futures

- [ ] Ajouter captcha pour éviter le spam
- [ ] Notifications push en plus des emails
- [ ] Historique des changements de mot de passe
- [ ] 2FA (authentification à deux facteurs)
- [ ] Login social (Google, Facebook, Apple)

---

**Créé avec ❤️ pour la sécurité des utilisateurs**
