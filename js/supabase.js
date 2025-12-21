// ========================================
// Configuration Supabase Auth
// ========================================

// IMPORTANT: Configurez vos clés Supabase ici
// Voir SETUP_SUPABASE_AUTH.md pour les instructions
const SUPABASE_CONFIG = {
    url: 'https://dmszyxowetilvsanqsxm.supabase.co', // Votre URL Supabase
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc3p5eG93ZXRpbHZzYW5xc3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzM0NDUsImV4cCI6MjA3NTM0OTQ0NX0.EukDYFVt0sCrDb0_V4ZPMv5B4gkD43V8Cw7CEuvl0C8' // Votre clé publique anon
};

// Créer le client Supabase seulement si configuré
let supabase = null;

// Fonction pour gérer les erreurs de refresh token
function setupGlobalErrorHandler() {
    // Intercepter les erreurs non gérées liées au refresh token
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const errorMessage = args.join(' ');
        if (errorMessage.includes('Refresh Token') || errorMessage.includes('Invalid Refresh Token')) {
            console.log('🧹 Détection d\'erreur de refresh token, nettoyage...');
            // Nettoyer le localStorage
            try {
                const storageKey = 'mots-croix-auth';
                localStorage.removeItem(`sb-${storageKey.replace(/-/g, '')}-auth-token`);
                localStorage.removeItem(`sb-dmszyxowetilvsanqsxm-auth-token`);
                
                // Si AuthSystem est disponible, nettoyer la session
                if (window.authSystem && typeof window.authSystem.clearInvalidSession === 'function') {
                    window.authSystem.clearInvalidSession();
                }
            } catch (e) {
                console.warn('⚠️ Erreur lors du nettoyage automatique:', e);
            }
        }
        // Appeler la fonction console.error originale
        originalConsoleError.apply(console, args);
    };
}

if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    console.log('🔵 Configuration Supabase détectée, initialisation...');
    
    // Attendre que la librairie Supabase soit chargée
    let initAttempts = 0;
    const maxAttempts = 50; // 5 secondes max
    
    const initSupabase = () => {
        initAttempts++;
        
        if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
            supabase = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey,
                {
                    auth: {
                        persistSession: true, // Persister la session dans localStorage
                        autoRefreshToken: true, // Rafraîchir automatiquement le token
                        detectSessionInUrl: true, // Détecter les tokens dans l'URL (pour email verification)
                        storageKey: 'mots-croix-auth', // Clé unique pour éviter les conflits
                        storage: window.localStorage // Utiliser localStorage explicitement
                    }
                }
            );
            
            // 🆕 Exposer globalement pour accès depuis autres modules
            window.supabaseClient = supabase;
            
            console.log('✅ Client Supabase Auth initialisé avec persistSession');
            console.log('🔵 Supabase client exposé globalement (window.supabaseClient)');
            console.log('🔵 Test accès client:', typeof window.supabaseClient);
            
            // Ajouter un gestionnaire global pour les erreurs de refresh token
            setupGlobalErrorHandler();
        } else {
            if (initAttempts < maxAttempts) {
                console.log(`⏳ Tentative ${initAttempts}/${maxAttempts} - Attente librairie Supabase...`);
                setTimeout(initSupabase, 100); // Réessayer après 100ms
            } else {
                console.error('❌ Timeout: Librairie Supabase non chargée après 5 secondes');
                console.log('📊 window.supabase:', typeof window.supabase);
            }
        }
    };
    
    // Démarrer l'initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupabase);
    } else {
        initSupabase();
    }
} else {
    console.info('ℹ️ Supabase Auth non configuré (optionnel). Pour activer l\'authentification, configurez SUPABASE_CONFIG dans js/supabase.js');
    console.info('ℹ️ Voir SETUP_SUPABASE_AUTH.md pour les instructions');
}

// ========================================
// Configuration Supabase pour le leaderboard
// ========================================

class SupabaseScoreManager {
    constructor() {
        // Configuration Supabase
        this.supabaseUrl = 'https://dmszyxowetilvsanqsxm.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc3p5eG93ZXRpbHZzYW5xc3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzM0NDUsImV4cCI6MjA3NTM0OTQ0NX0.EukDYFVt0sCrDb0_V4ZPMv5B4gkD43V8Cw7CEuvl0C8';
        this.tableName = 'mots_croix_scores'; // Table dédiée pour ce jeu
        this.gamePrefix = 'mots-en-croix-chretiens'; // Nom du jeu
    }

    async saveScore(name, email, score) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    game_prefix: this.gamePrefix,
                    player_name: name,
                    player_email: email,
                    score: score,
                    created_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde du score');
            }

            return { success: true };
        } catch (error) {
            console.error('Erreur Supabase:', error);
            return { success: false, error: error.message };
        }
    }

    // Sauvegarder la progression complète du joueur (avec user_id d'authentification)
    async saveProgress(userId, username, currentLevel, currentScore, maxScore, raceScore) {
        if (!supabase) {
            return { success: false, error: 'Supabase non configuré' };
        }

        try {
            // Récupérer d'abord le max_score actuel du cloud
            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('max_score')
                .eq('user_id', userId)
                .single();

            // Utiliser le meilleur entre local et cloud
            const cloudMaxScore = profile?.max_score || 0;
            const finalMaxScore = Math.max(maxScore, cloudMaxScore, currentScore);

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    username: username,
                    game_level: currentLevel,
                    game_score: currentScore,    // Score de la partie en cours
                    max_score: finalMaxScore,    // Meilleur score (toujours le max)
                    race_score: raceScore,       // Score de course
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;

            console.log('✅ Progression sauvegardée:', { 
                username, 
                currentLevel, 
                currentScore, 
                maxScore: finalMaxScore,
                raceScore 
            });
            return { success: true, maxScore: finalMaxScore };
        } catch (error) {
            console.error('❌ Erreur sauvegarde progression:', error);
            return { success: false, error: error.message };
        }
    }

    // Charger la progression du joueur
    async loadProgress(userId) {
        if (!supabase) {
            return { success: false, error: 'Supabase non configuré' };
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('game_level, game_score, max_score, race_score')
                .eq('user_id', userId)
                .single();

            if (error) throw error;

            return { 
                success: true, 
                level: data?.game_level || 1, 
                score: data?.game_score || 0,
                maxScore: data?.max_score || 0,
                raceScore: data?.race_score || 0
            };
        } catch (error) {
            console.error('❌ Erreur chargement progression:', error);
            return { success: false, error: error.message };
        }
    }

    async getTopScores(limit = 10) {
        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/${this.tableName}?game_prefix=eq.${this.gamePrefix}&order=score.desc&limit=${limit}`,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des scores');
            }

            const data = await response.json();
            return { success: true, scores: data };
        } catch (error) {
            console.error('Erreur Supabase:', error);
            return { success: false, error: error.message };
        }
    }

    isConfigured() {
        return this.supabaseUrl && this.supabaseKey &&
               this.supabaseUrl.includes('supabase.co');
    }
}

// Instance globale
const supabaseScoreManager = new SupabaseScoreManager();
