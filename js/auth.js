// Système d'authentification avec Supabase Auth + Profiles
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.onAuthChangeCallbacks = [];
    }

    // Initialiser l'authentification
    async init() {
        // Vérifier si supabase est disponible
        if (typeof supabase === 'undefined' || supabase === null) {
            console.info('ℹ️ Auth System: Supabase non configuré, l\'authentification est désactivée');
            console.info('ℹ️ Le chat fonctionnera avec des pseudos anonymes');
            this.initUI(); // Initialiser l'UI quand même
            return;
        }

        // Écouter les changements d'auth
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔐 Auth event:', event, session);

            if (session && session.user) {
                // Utilisateur connecté
                await this.loadUserProfile(session.user);

                // Fermer le modal d'auth
                this.hideAuthModal();

                // Ouvrir automatiquement le chat après authentification
                if (event === 'SIGNED_IN' && typeof chatSystem !== 'undefined') {
                    setTimeout(() => {
                        chatSystem.open();
                    }, 500);
                }
            } else {
                // Utilisateur déconnecté
                this.currentUser = null;
            }

            // Appeler les callbacks
            this.onAuthChangeCallbacks.forEach(cb => cb(this.currentUser));
        });

        // Vérifier la session actuelle
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
            await this.loadUserProfile(session.user);
        }

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
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('❌ Erreur chargement profil:', error);
                return;
            }

            if (data) {
                this.currentUser = {
                    id: user.id,
                    email: user.email,
                    username: data.username,
                    created_at: data.created_at
                };
                console.log('✅ Profil chargé:', this.currentUser);
            } else {
                // Profil inexistant (ne devrait pas arriver avec username lors signup)
                this.currentUser = {
                    id: user.id,
                    email: user.email,
                    username: null
                };
            }
        } catch (err) {
            console.error('❌ Erreur:', err);
            this.currentUser = {
                id: user.id,
                email: user.email,
                username: null
            };
        }
    }

    // S'inscrire / Se connecter avec magic link
    async signInWithEmail(email, username) {
        // Vérifier si supabase est disponible
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
                    .single();

                if (existingProfile) {
                    return {
                        success: false,
                        error: 'Ce nom d\'utilisateur est déjà pris'
                    };
                }
            }

            // Envoyer le magic link
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: {
                        username: username // Passer le username dans les metadata
                    }
                }
            });

            if (error) {
                console.error('❌ Erreur auth:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            // Créer le profil immédiatement (ou le mettre à jour après vérification)
            // Note: Le profil sera créé via un trigger SQL après confirmation email

            return {
                success: true,
                message: 'Un lien de connexion a été envoyé à votre email !'
            };
        } catch (err) {
            console.error('❌ Erreur:', err);
            return {
                success: false,
                error: err.message
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
            console.log('✅ Déconnecté');
            return { success: true };
        } catch (err) {
            console.error('❌ Erreur déconnexion:', err);
            return { success: false, error: err.message };
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

    // S'abonner aux changements d'auth
    onAuthChange(callback) {
        this.onAuthChangeCallbacks.push(callback);
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

    // Initialiser l'UI
    initUI() {
        const form = document.getElementById('authForm');
        const cancelBtn = document.getElementById('authCancelBtn');
        const messageDiv = document.getElementById('authMessage');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const username = document.getElementById('authUsername').value.trim();
                const email = document.getElementById('authEmail').value.trim();
                const submitBtn = document.getElementById('authSubmitBtn');

                if (!username || !email) {
                    this.showMessage('Veuillez remplir tous les champs', 'error');
                    return;
                }

                // Désactiver le bouton
                submitBtn.disabled = true;
                submitBtn.textContent = 'Envoi...';

                // Envoyer le magic link
                const result = await this.signInWithEmail(email, username);

                if (result.success) {
                    this.showMessage(result.message, 'success');
                    form.reset();

                    // Fermer le modal après 3 secondes
                    setTimeout(() => {
                        this.hideAuthModal();
                    }, 3000);
                } else {
                    this.showMessage(result.error, 'error');
                }

                // Réactiver le bouton
                submitBtn.disabled = false;
                submitBtn.textContent = '📧 Envoyer le lien de connexion';
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideAuthModal();
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
const authSystem = new AuthSystem();

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        authSystem.init();
    });
} else {
    authSystem.init();
}
