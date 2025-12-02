// ========================================
// Configuration Supabase Auth
// ========================================

// IMPORTANT: Configurez vos clés Supabase ici
// Voir SETUP_SUPABASE_AUTH.md pour les instructions
const SUPABASE_CONFIG = {
    url: '', // Votre URL Supabase (ex: https://votre-projet.supabase.co)
    anonKey: '' // Votre clé publique anon
};

// Créer le client Supabase seulement si configuré
let supabase = null;

if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    // Vérifier que la librairie Supabase est chargée
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        console.log('✅ Client Supabase Auth initialisé');
    } else {
        console.warn('⚠️ Librairie Supabase non chargée. Vérifiez que le script CDN est bien ajouté dans index.html');
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
