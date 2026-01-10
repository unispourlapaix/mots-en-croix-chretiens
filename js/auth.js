// Système d'authentification avec Supabase Auth + Profiles
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.onAuthChangeCallbacks = [];
        this.isInitialized = false;
        this.isCheckingAuth = true; // En cours de vérification
    }

    // Initialiser l'authentification
    async init() {
        // Attendre que supabase soit disponible (max 5 secondes)
        let attempts = 0;
        while ((typeof supabase === 'undefined' || supabase === null) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // Vérifier si supabase est disponible
        if (typeof supabase === 'undefined' || supabase === null) {
            console.info('ℹ️ Auth System: Supabase non configuré, l\'authentification est désactivée');
            console.info('ℹ️ Le chat fonctionnera avec des pseudos anonymes');
            this.isInitialized = true;
            this.isCheckingAuth = false;
            this.initUI(); // Initialiser l'UI quand même
            return;
        }

        console.log('✅ Auth System: Supabase détecté, initialisation...');

        // Vérifier D'ABORD la session actuelle au démarrage
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Erreur récupération session:', error);
                
                // Si l'erreur concerne un refresh token invalide, nettoyer le localStorage
                if (error.message && error.message.includes('Refresh Token')) {
                    console.log('🧹 Nettoyage du refresh token invalide...');
                    await this.clearInvalidSession();
                }
            } else if (session && session.user) {
                console.log('✅ Session restaurée depuis localStorage');
                // IMPORTANT: Attendre que le profil soit chargé AVANT de marquer comme prêt
                await this.loadUserProfile(session.user);
            } else {
                console.log('ℹ️ Aucune session sauvegardée');
            }
            
            // Marquer comme initialisé SEULEMENT après loadUserProfile terminé
            this.isInitialized = true;
            this.isCheckingAuth = false;
            console.log('✅ Auth init terminée, username:', this.currentUser?.username || 'anonyme');
        } catch (err) {
            console.error('❌ Erreur vérification session:', err);
            
            // Si l'erreur est liée au refresh token, nettoyer
            if (err.message && err.message.includes('Refresh Token')) {
                console.log('🧹 Nettoyage du refresh token invalide...');
                await this.clearInvalidSession();
            }
            
            this.isInitialized = true;
            this.isCheckingAuth = false;
        }

        // PUIS écouter les changements d'auth
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔐 Auth event:', event, session ? 'Session active' : 'Pas de session');

            // Gérer les erreurs de token
            if (event === 'TOKEN_REFRESHED') {
                console.log('🔄 Token rafraîchi avec succès');
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 Utilisateur déconnecté');
            }

            if (session && session.user) {
                // Utilisateur connecté
                await this.loadUserProfile(session.user);

                // Fermer le modal d'auth
                this.hideAuthModal();

                // Rouvrir la bulle de chat si elle était minimisée
                const chatBubbleBody = document.getElementById('chatBubbleBody');
                const toggleBtn = document.getElementById('toggleChatBubble');
                if (chatBubbleBody && chatBubbleBody.style.display === 'none') {
                    chatBubbleBody.style.display = '';
                    if (toggleBtn) {
                        toggleBtn.textContent = '−';
                    }
                }
                
                console.log('✅ Connexion réussie - Menu fermé');
            } else {
                // Utilisateur déconnecté
                this.currentUser = null;
                console.log('ℹ️ Utilisateur déconnecté ou pas de session');
            }

            // Appeler les callbacks
            this.onAuthChangeCallbacks.forEach(cb => cb(this.currentUser));
            
            // 🆕 Forcer la synchronisation du username dans tous les systèmes
            if (this.currentUser && this.currentUser.username) {
                console.log('🔄 Synchronisation globale du username:', this.currentUser.username);
                
                // Synchroniser SimpleChatSystem
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.currentUser = this.currentUser.username;
                    console.log('✅ SimpleChatSystem synchronisé:', window.simpleChatSystem.currentUser);
                }
                
                // Synchroniser P2PChatSystem
                if (window.chatSystem) {
                    window.chatSystem.username = this.currentUser.username;
                    console.log('✅ ChatSystem synchronisé:', window.chatSystem.username);
                }
                
                // Synchroniser RoomSystem
                if (window.roomSystem) {
                    window.roomSystem.myUsername = this.currentUser.username;
                    console.log('✅ RoomSystem synchronisé:', window.roomSystem.myUsername);
                }
                
                // Déclencher un événement global pour les autres modules
                window.dispatchEvent(new CustomEvent('usernameUpdated', { 
                    detail: { username: this.currentUser.username } 
                }));
            }
        });

        this.initUI();
    }

    // Charger le profil utilisateur
    async loadUserProfile(user) {
        if (!supabase) {
            console.warn('⚠️ Impossible de charger le profil: Supabase non configuré');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('❌ Erreur chargement profil:', error);
                // Créer un profil basique sans username
                this.currentUser = {
                    id: user.id,
                    email: user.email,
                    username: null,
                    max_score: 0
                };
                return;
            }

            if (data) {
                this.currentUser = {
                    id: user.id,
                    email: user.email,
                    username: data.username,
                    created_at: data.created_at,
                    max_score: data.max_score || 0
                };
                console.log('✅ Profil chargé:', this.currentUser.username);
                
                // 🆕 Synchronisation immédiate après chargement du profil
                this.syncUsernameGlobally(this.currentUser.username);
                
                // Mettre à jour l'UI immédiatement
                this.updateUIWithUser();
            } else {
                // Profil inexistant - créer un profil automatiquement
                console.log('⚠️ Profil non trouvé - Création automatique...');
                
                // Générer un username unique basé sur l'email + ID partiel
                const emailPart = user.email?.split('@')[0]?.substring(0, 10) || 'Joueur';
                const idPart = user.id.substring(0, 6);
                const defaultUsername = `${emailPart}_${idPart}`;
                
                try {
                    // Créer le profil dans la base de données (l'id sera auto-généré)
                    // Si la base ne génère pas l'id automatiquement, on peut le passer explicitement
                    const profileData = {
                        user_id: user.id,
                        username: defaultUsername,
                        email: user.email, // Sauvegarder l'email
                        game_prefix: 'mots-en-croix-chretiens' // Préfixe du jeu
                    };
                    
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert(profileData)
                        .select()
                        .single();
                    
                    if (createError) {
                        console.error('❌ Erreur création profil:', createError);
                        // Utiliser un profil temporaire sans username
                        this.currentUser = {
                            id: user.id,
                            email: user.email,
                            username: defaultUsername,
                            max_score: 0
                        };
                    } else {
                        this.currentUser = {
                            id: user.id,
                            email: user.email,
                            username: newProfile.username,
                            created_at: newProfile.created_at,
                            max_score: newProfile.max_score || 0
                        };
                        console.log('✅ Profil créé automatiquement:', this.currentUser.username);
                    }
                } catch (createErr) {
                    console.error('❌ Erreur création profil:', createErr);
                    this.currentUser = {
                        id: user.id,
                        email: user.email,
                        username: defaultUsername,
                        max_score: 0
                    };
                }
            }
        } catch (err) {
            console.error('❌ Erreur:', err);
            this.currentUser = {
                id: user.id,
                email: user.email,
                username: null,
                max_score: 0
            };
        }
    }

    // S'inscrire avec email et mot de passe
    async signUp(email, password, username) {
        if (!supabase) {
            return {
                success: false,
                error: 'Authentification non configurée. Veuillez configurer Supabase dans js/supabase.js'
            };
        }

        try {
            // Vérifier si le username est déjà pris
            if (username) {
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('username', username)
                    .maybeSingle();

                if (existingProfile) {
                    return {
                        success: false,
                        error: 'Ce nom d\'utilisateur est déjà pris'
                    };
                }
            }

            // Créer le compte
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (error) {
                console.error('❌ Erreur inscription:', error);
                
                // Si l'utilisateur existe déjà, essayer de se connecter
                if (error.message.includes('already registered') || error.message.includes('User already registered')) {
                    return {
                        success: false,
                        error: 'Cet email est déjà utilisé. Veuillez vous connecter.'
                    };
                }
                
                return {
                    success: false,
                    error: error.message
                };
            }

            // Si le compte est créé, créer aussi le profil manuellement
            if (data && data.user) {
                try {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({
                            user_id: data.user.id,
                            username: username,
                            email: email, // Sauvegarder l'email
                            game_prefix: 'mots-en-croix-chretiens' // Préfixe du jeu
                        });
                    
                    if (profileError) {
                        console.warn('⚠️ Erreur création profil (sera créé automatiquement plus tard):', profileError);
                    } else {
                        console.log('✅ Profil créé pour le nouvel utilisateur');
                    }
                } catch (profileErr) {
                    console.warn('⚠️ Erreur création profil:', profileErr);
                }
            }

            // Compte créé avec succès
            return {
                success: true,
                message: 'Compte créé avec succès ! Connexion en cours...'
            };
        } catch (err) {
            console.error('❌ Erreur:', err);
            return {
                success: false,
                error: err.message
            };
        }
    }

    // Se connecter avec email et mot de passe
    async signIn(email, password) {
        console.log('🔐 Tentative de connexion...');
        
        if (!supabase) {
            console.error('❌ Supabase non disponible');
            return {
                success: false,
                error: 'Authentification non configurée. Veuillez configurer Supabase dans js/supabase.js'
            };
        }

        try {
            console.log('🔐 Envoi de la requête de connexion...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('❌ Erreur connexion:', error);
                
                // Messages d'erreur plus clairs
                let errorMessage = error.message;
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = 'Email ou mot de passe incorrect';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Veuillez confirmer votre email';
                }
                
                return {
                    success: false,
                    error: errorMessage
                };
            }

            console.log('✅ Connexion réussie');
            
            // Son de connexion réussie
            if (window.audioSystem) {
                window.audioSystem.playLoginSuccess();
            }
            
            return {
                success: true,
                message: 'Connexion réussie !'
            };
        } catch (err) {
            console.error('❌ Exception lors de la connexion:', err);
            return {
                success: false,
                error: err.message || 'Erreur inconnue'
            };
        }
    }

    // Se déconnecter
    async signOut() {
        if (!supabase) {
            return { success: false, error: 'Authentification non configurée' };
        }

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            
            // Réinitialiser l'UI
            const profileUsername = document.getElementById('profileUsername');
            const connectedUsername = document.getElementById('connectedUsername');
            const chatUsername = document.getElementById('chatUsername');
            
            if (profileUsername) {
                profileUsername.textContent = 'Non connecté';
            }
            
            if (connectedUsername) {
                connectedUsername.textContent = 'Utilisateur';
            }
            
            if (chatUsername) {
                chatUsername.textContent = 'Non connecté';
                chatUsername.style.color = '#666';
            }
            
            // S'assurer que la bulle de chat reste ouverte après déconnexion
            const chatBubble = document.getElementById('chatBubble');
            const toggleBtn = document.getElementById('toggleChatBubble');
            if (chatBubble && chatBubble.classList.contains('minimized')) {
                chatBubble.classList.remove('minimized');
                if (toggleBtn) {
                    toggleBtn.textContent = '−';
                }
            }
            
            console.log('✅ Déconnecté');
            return { success: true };
        } catch (err) {
            console.error('❌ Erreur déconnexion:', err);
            return { success: false, error: err.message };
        }
    }

    // Nettoyer une session invalide (refresh token expiré)
    async clearInvalidSession() {
        try {
            // Nettoyer le localStorage de Supabase
            const storageKey = 'mots-croix-auth';
            localStorage.removeItem(`sb-${storageKey.replace(/-/g, '')}-auth-token`);
            localStorage.removeItem(`sb-dmszyxowetilvsanqsxm-auth-token`); // Fallback avec l'URL exacte
            
            // Forcer une déconnexion silencieuse
            if (supabase && supabase.auth) {
                await supabase.auth.signOut({ scope: 'local' });
            }
            
            this.currentUser = null;
            console.log('✅ Session invalide nettoyée');
        } catch (err) {
            console.error('⚠️ Erreur lors du nettoyage:', err);
        }
    }

    // Réinitialiser le mot de passe
    async resetPassword(email) {
        if (!supabase) {
            return {
                success: false,
                error: 'Authentification non configurée'
            };
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin
            });

            if (error) {
                console.error('❌ Erreur reset password:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                message: 'Un email de réinitialisation a été envoyé !'
            };
        } catch (err) {
            console.error('❌ Erreur:', err);
            return {
                success: false,
                error: err.message
            };
        }
    }

    // Changer le username
    async changeUsername(newUsername) {
        if (!supabase || !this.currentUser) {
            return {
                success: false,
                error: 'Non connecté'
            };
        }

        try {
            // Vérifier si le nouveau username est disponible
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', newUsername)
                .maybeSingle();

            if (existingProfile) {
                return {
                    success: false,
                    error: 'Ce nom d\'utilisateur est déjà pris'
                };
            }

            // Mettre à jour le profil
            const { error } = await supabase
                .from('profiles')
                .update({ username: newUsername })
                .eq('user_id', this.currentUser.id);

            if (error) {
                console.error('❌ Erreur changement username:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            // Mettre à jour localement
            this.currentUser.username = newUsername;
            
            // Appeler les callbacks
            this.onAuthChangeCallbacks.forEach(cb => cb(this.currentUser));

            return {
                success: true,
                message: 'Pseudo modifié avec succès !'
            };
        } catch (err) {
            console.error('❌ Erreur:', err);
            return {
                success: false,
                error: err.message
            };
        }
    }

    // Vérifier si l'utilisateur est connecté
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Obtenir l'utilisateur actuel
    getCurrentUser() {
        return this.currentUser;
    }

    // Rechercher un utilisateur par email
    async findUserByEmail(email) {
        if (!supabase) {
            return { success: false, error: 'Supabase non configuré' };
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .maybeSingle();

            if (error) {
                console.error('❌ Erreur recherche utilisateur:', error);
                return { success: false, error: error.message };
            }

            if (data) {
                return { 
                    success: true, 
                    user: {
                        id: data.id,
                        user_id: data.user_id,
                        username: data.username,
                        email: data.email,
                        game_level: data.game_level,
                        game_score: data.game_score,
                        created_at: data.created_at
                    }
                };
            }

            return { success: false, error: 'Utilisateur non trouvé' };
        } catch (err) {
            console.error('❌ Erreur:', err);
            return { success: false, error: err.message };
        }
    }

    // S'abonner aux changements d'auth
    onAuthChange(callback) {
        this.onAuthChangeCallbacks.push(callback);
    }
    
    // 🆕 Synchroniser le username dans tous les systèmes
    syncUsernameGlobally(username) {
        if (!username) return;
        
        console.log('🔄 Synchronisation globale du username:', username);
        
        // Synchroniser SimpleChatSystem
        if (window.simpleChatSystem) {
            window.simpleChatSystem.currentUser = username;
            console.log('✅ SimpleChatSystem synchronisé');
        }
        
        // Synchroniser P2PChatSystem
        if (window.chatSystem) {
            window.chatSystem.username = username;
            console.log('✅ ChatSystem synchronisé');
        }
        
        // Synchroniser RoomSystem
        if (window.roomSystem) {
            window.roomSystem.myUsername = username;
            console.log('✅ RoomSystem synchronisé');
        }
        
        // Déclencher un événement global
        window.dispatchEvent(new CustomEvent('usernameUpdated', { 
            detail: { username: username } 
        }));
        
        console.log('✅ Username synchronisé partout:', username);
    }

    // Afficher le modal d'authentification
    showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // Cacher le modal d'authentification
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Mettre à jour l'UI avec les infos utilisateur
    updateUIWithUser() {
        if (!this.currentUser) return;
        
        // Masquer le modal d'auth
        this.hideAuthModal();
        
        // Mettre à jour les affichages du pseudo dans l'interface
        const profileUsername = document.getElementById('profileUsername');
        const connectedUsername = document.getElementById('connectedUsername');
        const chatUsername = document.getElementById('chatUsername');
        
        if (profileUsername) {
            profileUsername.textContent = this.currentUser.username || 'Utilisateur';
        }
        
        if (connectedUsername) {
            connectedUsername.textContent = this.currentUser.username || 'Utilisateur';
        }
        
        if (chatUsername) {
            chatUsername.textContent = `Connecté: ${this.currentUser.username || 'Utilisateur'}`;
            chatUsername.style.color = '#4caf50';
        }
        
        // Déclencher les callbacks pour mettre à jour l'UI
        this.onAuthChangeCallbacks.forEach(cb => cb(this.currentUser));
        
        console.log('🔄 UI mise à jour avec utilisateur:', this.currentUser.username);
        
        // Mettre à jour le RoomSystem avec le nouveau username
        if (window.roomSystem) {
            window.roomSystem.updateUsername(this.currentUser.username);
        }
    }

    // Initialiser l'UI
    initUI() {
        const form = document.getElementById('authForm');
        const cancelBtn = document.getElementById('authCancelBtn');
        const messageDiv = document.getElementById('authMessage');
        const toggleLink = document.getElementById('authToggleLink');
        const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        let isSignUpMode = true; // Mode par défaut : inscription
        let isForgotPasswordMode = false; // Mode mot de passe oublié

        // Basculer entre inscription et connexion
        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                isSignUpMode = !isSignUpMode;
                isForgotPasswordMode = false;
                
                const title = document.getElementById('authModalTitle');
                const usernameInput = document.getElementById('authUsername');
                const passwordInput = document.getElementById('authPassword');
                const submitBtn = document.getElementById('authSubmitBtn');
                const toggleText = document.getElementById('authToggleText');
                
                if (isSignUpMode) {
                    // Mode inscription
                    title.textContent = 'Connexion au Nuage';
                    usernameInput.style.display = 'block';
                    usernameInput.required = true;
                    passwordInput.style.display = 'block';
                    passwordInput.required = true;
                    submitBtn.textContent = '🔐 S\'inscrire';
                    toggleText.textContent = 'Déjà un compte ?';
                    toggleLink.textContent = 'Se connecter';
                    if (forgotPasswordLink) forgotPasswordLink.style.display = 'none';
                } else {
                    // Mode connexion
                    title.textContent = 'Connexion au Nuage';
                    usernameInput.style.display = 'none';
                    usernameInput.required = false;
                    passwordInput.style.display = 'block';
                    passwordInput.required = true;
                    submitBtn.textContent = '🔓 Se connecter';
                    toggleText.textContent = 'Pas encore de compte ?';
                    toggleLink.textContent = 'S\'inscrire';
                    if (forgotPasswordLink) forgotPasswordLink.style.display = 'block';
                }
                
                // Réinitialiser le formulaire
                if (form && typeof form.reset === 'function') {
                    form.reset();
                }
                if (messageDiv) {
                    messageDiv.style.display = 'none';
                }
            });
        }

        // Mot de passe oublié
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isForgotPasswordMode = true;
                isSignUpMode = false;
                
                const title = document.getElementById('authModalTitle');
                const usernameInput = document.getElementById('authUsername');
                const passwordInput = document.getElementById('authPassword');
                const submitBtn = document.getElementById('authSubmitBtn');
                const toggleText = document.getElementById('authToggleText');
                
                title.textContent = 'Réinitialiser le mot de passe';
                usernameInput.style.display = 'none';
                usernameInput.required = false;
                passwordInput.style.display = 'none';
                passwordInput.required = false;
                submitBtn.textContent = '📧 Envoyer le lien';
                toggleText.textContent = 'Retour à la';
                toggleLink.textContent = 'connexion';
                if (forgotPasswordLink) forgotPasswordLink.style.display = 'none';
                
                if (form && typeof form.reset === 'function') {
                    form.reset();
                }
                if (messageDiv) {
                    messageDiv.style.display = 'none';
                }
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const username = document.getElementById('authUsername').value.trim();
                const email = document.getElementById('authEmail').value.trim();
                const password = document.getElementById('authPassword').value.trim();
                const submitBtn = document.getElementById('authSubmitBtn');

                if (!email) {
                    this.showMessage('Veuillez entrer votre email', 'error');
                    return;
                }

                if (!isForgotPasswordMode && !password) {
                    this.showMessage('Veuillez entrer votre mot de passe', 'error');
                    return;
                }

                if (isSignUpMode && !isForgotPasswordMode && !username) {
                    this.showMessage('Veuillez entrer un nom d\'utilisateur', 'error');
                    return;
                }

                // Désactiver le bouton
                submitBtn.disabled = true;
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Chargement...';

                // Inscription, connexion ou reset password
                let result;
                if (isForgotPasswordMode) {
                    result = await this.resetPassword(email);
                } else if (isSignUpMode) {
                    result = await this.signUp(email, password, username);
                } else {
                    result = await this.signIn(email, password);
                }

                if (result.success) {
                    this.showMessage(result.message, 'success');
                    form.reset();

                    // Fermer le modal après 1 seconde (sauf pour reset password)
                    if (!isForgotPasswordMode) {
                        setTimeout(() => {
                            this.hideAuthModal();
                        }, 1000);
                    } else {
                        // Pour reset password, fermer après 3 secondes
                        setTimeout(() => {
                            this.hideAuthModal();
                        }, 3000);
                    }
                } else {
                    this.showMessage(result.error, 'error');
                }

                // Réactiver le bouton
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideAuthModal();
            });
        }

        // Gérer les boutons du menu
        this.initMenuUI();
    }

    // Initialiser l'UI du menu
    initMenuUI() {
        const profileUsername = document.getElementById('profileUsername');
        const changeUsernameBtn = document.getElementById('changeUsernameBtn');
        const signOutBtn = document.getElementById('signOutBtn');

        // Mettre à jour l'affichage du profil
        const updateProfileDisplay = () => {
            if (this.currentUser && this.currentUser.username) {
                if (profileUsername) {
                    profileUsername.textContent = `👤 ${this.currentUser.username}`;
                }
                if (changeUsernameBtn) {
                    changeUsernameBtn.style.display = 'block';
                }
                if (signOutBtn) {
                    signOutBtn.style.display = 'block';
                }
            } else {
                if (profileUsername) {
                    profileUsername.textContent = 'Non connecté';
                }
                if (changeUsernameBtn) {
                    changeUsernameBtn.style.display = 'none';
                }
                if (signOutBtn) {
                    signOutBtn.style.display = 'none';
                }
            }
        };

        // Écouter les changements d'auth
        this.onAuthChange(() => {
            updateProfileDisplay();
        });

        // Mettre à jour l'affichage initial
        updateProfileDisplay();

        // Bouton changer username
        if (changeUsernameBtn) {
            changeUsernameBtn.addEventListener('click', async () => {
                const newUsername = await CustomModals.showPrompt('✏️ Changer de pseudo', 'Nouveau pseudo (3-20 caractères):', '', '', '✓ Valider', '❌ Annuler');
                if (!newUsername) return;

                if (newUsername.length < 3 || newUsername.length > 20) {
                    await CustomModals.showAlert('⚠️ Pseudo invalide', 'Le pseudo doit contenir entre 3 et 20 caractères');
                    return;
                }

                if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
                    await CustomModals.showAlert('⚠️ Pseudo invalide', 'Le pseudo ne peut contenir que des lettres, chiffres et underscores');
                    return;
                }

                changeUsernameBtn.disabled = true;
                changeUsernameBtn.textContent = 'Modification...';

                const result = await this.changeUsername(newUsername);

                if (result.success) {
                    await CustomModals.showAlert('✅ Succès', result.message);
                    updateProfileDisplay();
                } else {
                    await CustomModals.showAlert('❌ Erreur', result.error);
                }

                changeUsernameBtn.disabled = false;
                changeUsernameBtn.textContent = '✏️ Modifier le pseudo';
            });
        }

        // Bouton déconnexion
        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                if (!await CustomModals.showConfirm('🚺 Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', '🚺 Se déconnecter', '❌ Rester')) {
                    return;
                }

                signOutBtn.disabled = true;
                signOutBtn.textContent = 'Déconnexion...';

                const result = await this.signOut();

                if (result.success) {
                    updateProfileDisplay();
                    // Fermer le menu
                    const menuModal = document.getElementById('menuModal');
                    if (menuModal) {
                        menuModal.classList.add('hidden');
                    }
                } else {
                    await CustomModals.showAlert('❌ Erreur', result.error);
                }

                signOutBtn.disabled = false;
                signOutBtn.textContent = '🚪 Déconnexion';
            });
        }
    }

    // Afficher un message
    showMessage(message, type) {
        const messageDiv = document.getElementById('authMessage');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';

            if (type === 'success') {
                messageDiv.style.background = 'linear-gradient(135deg, #e8f5e9, #c8e6c9)';
                messageDiv.style.color = '#2e7d32';
                messageDiv.style.border = '2px solid #4caf50';
            } else {
                messageDiv.style.background = 'linear-gradient(135deg, #ffebee, #ffcdd2)';
                messageDiv.style.color = '#c62828';
                messageDiv.style.border = '2px solid #f44336';
            }

            // Cacher après 5 secondes
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
}

// Instance globale
window.authSystem = new AuthSystem();

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authSystem.init();
    });
} else {
    window.authSystem.init();
}
