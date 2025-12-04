// Module de classement avec accès DB minimal
// Utilise max_score pour le leaderboard
// Integration info artiste Emmanuel Payet (emmanuel.gallery)

class LeaderboardManager {
    constructor() {
        this.cache = null;
        this.cacheTimestamp = null;
        this.cacheDuration = 5 * 60 * 1000; // Cache de 5 minutes
        this.isLoading = false;
        
        // Info artiste
        this.artistInfo = {
            name: "Emmanuel Payet",
            title: "Christian Author, Digital Artist & Spiritual Composer",
            website: "https://emmanuel.gallery/",
            location: "Montpellier, France",
            description: "I share a message of light, love, and unity through books, visual creations, and music.",
            links: {
                ebooks: "https://play.google.com/store/search?q=Ebooks%20Emmanuel%20Payet%20Dreamer&c=books",
                music: "https://audiomack.com/emmanuelpayet888/album/amour-amour",
                game: "https://unispourlapaix.github.io/petitbateau/petitbateauRouge.html",
                unity: "https://unispourlapaix.github.io/unityquest-chronicles-of-love/"
            }
        };
    }

    // Charger le top scores avec cache (minimal DB access)
    async getTopScores(limit = 10, forceRefresh = false) {
        // Vérifier le cache
        const now = Date.now();
        if (!forceRefresh && this.cache && this.cacheTimestamp && (now - this.cacheTimestamp < this.cacheDuration)) {
            console.log('📦 Top scores depuis le cache');
            return { success: true, scores: this.cache, fromCache: true };
        }

        // Éviter les requêtes multiples simultanées
        if (this.isLoading) {
            console.log('⏳ Chargement déjà en cours...');
            return { success: false, error: 'Chargement en cours' };
        }

        this.isLoading = true;

        try {
            if (!supabase) {
                throw new Error('Supabase non configuré');
            }

            console.log('☁️ Chargement top scores depuis DB...');
            
            // Requête optimisée: seulement username et max_score
            const { data, error } = await supabase
                .from('profiles')
                .select('username, max_score')
                .order('max_score', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // Filtrer les scores à 0
            const validScores = data.filter(profile => profile.max_score > 0);

            // Mettre en cache
            this.cache = validScores;
            this.cacheTimestamp = now;

            console.log(`✅ ${validScores.length} scores chargés et mis en cache`);
            
            return { 
                success: true, 
                scores: validScores,
                fromCache: false 
            };

        } catch (error) {
            console.error('❌ Erreur chargement top scores:', error);
            
            // En cas d'erreur, retourner le cache s'il existe
            if (this.cache) {
                console.log('📦 Utilisation du cache après erreur');
                return { success: true, scores: this.cache, fromCache: true, error: error.message };
            }
            
            return { success: false, error: error.message };
        } finally {
            this.isLoading = false;
        }
    }

    // Générer le HTML du leaderboard
    generateLeaderboardHTML(scores) {
        if (!scores || scores.length === 0) {
            return `
                <div class="leaderboard-empty">
                    <p>🎮 Aucun score enregistré pour le moment</p>
                    <p>Soyez le premier à jouer et à figurer au classement !</p>
                </div>
            `;
        }

        const rows = scores.map((player, index) => {
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            
            return `
                <tr class="leaderboard-row ${rankClass}">
                    <td class="rank">${medal}</td>
                    <td class="username">${this.escapeHtml(player.username)}</td>
                    <td class="score">${player.max_score.toLocaleString()}</td>
                </tr>
            `;
        }).join('');

        return `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rang</th>
                        <th>Joueur</th>
                        <th>Meilleur Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    // Générer le HTML info artiste
    generateArtistHTML() {
        return `
            <div class="artist-info">
                <div class="artist-header">
                    <h3>🎨 À propos de l'artiste</h3>
                    <a href="${this.artistInfo.website}" target="_blank" class="artist-name">${this.artistInfo.name}</a>
                </div>
                <p class="artist-title">${this.artistInfo.title}</p>
                <p class="artist-description">${this.artistInfo.description}</p>
                <div class="artist-location">📍 ${this.artistInfo.location}</div>
                <div class="artist-links">
                    <a href="${this.artistInfo.links.ebooks}" target="_blank" class="artist-link">📚 Ebooks</a>
                    <a href="${this.artistInfo.links.music}" target="_blank" class="artist-link">🎵 Musique</a>
                    <a href="${this.artistInfo.links.game}" target="_blank" class="artist-link">🚢 Petit Bateau Rouge</a>
                    <a href="${this.artistInfo.links.unity}" target="_blank" class="artist-link">💝 UnityQuest</a>
                </div>
                <p class="artist-message">✨ Do not participate in the works of evil. #Love #Peace #Unity</p>
            </div>
        `;
    }

    // Afficher le leaderboard dans un élément
    async displayLeaderboard(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container ${containerId} introuvable`);
            return;
        }

        const {
            limit = 10,
            showArtist = true,
            showStats = true,
            forceRefresh = false
        } = options;

        // Afficher un loader
        container.innerHTML = `
            <div class="leaderboard-loading">
                <div class="loader"></div>
                <p>Chargement du classement...</p>
            </div>
        `;

        // Charger les scores
        const result = await this.getTopScores(limit, forceRefresh);

        if (!result.success && !result.scores) {
            container.innerHTML = `
                <div class="leaderboard-error">
                    <p>❌ Impossible de charger le classement</p>
                    <p class="error-detail">${result.error || 'Erreur inconnue'}</p>
                </div>
            `;
            return;
        }

        const scores = result.scores;
        
        let html = '';

        // Stats
        if (showStats && scores.length > 0) {
            const topScore = scores[0].max_score;
            const totalPlayers = scores.length;
            const avgScore = Math.round(scores.reduce((sum, p) => sum + p.max_score, 0) / totalPlayers);
            
            html += `
                <div class="leaderboard-stats">
                    <div class="stat-card">
                        <span class="stat-label">🏆 Meilleur Score</span>
                        <span class="stat-value">${topScore.toLocaleString()}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">👥 Joueurs</span>
                        <span class="stat-value">${totalPlayers}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">📊 Score Moyen</span>
                        <span class="stat-value">${avgScore.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }

        // Tableau des scores
        html += this.generateLeaderboardHTML(scores);

        // Info artiste
        if (showArtist) {
            html += this.generateArtistHTML();
        }

        // Cache info
        if (result.fromCache) {
            const cacheAge = Math.floor((Date.now() - this.cacheTimestamp) / 1000);
            html += `<p class="cache-info">📦 Mis en cache il y a ${cacheAge}s</p>`;
        }

        container.innerHTML = html;
    }

    // Invalider le cache (après sauvegarde d'un nouveau score)
    invalidateCache() {
        console.log('🗑️ Cache du leaderboard invalidé');
        this.cache = null;
        this.cacheTimestamp = null;
    }

    // Helper: échapper HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Obtenir le rang d'un joueur
    async getPlayerRank(username) {
        const result = await this.getTopScores(100); // Charger top 100
        if (!result.success) return null;

        const index = result.scores.findIndex(p => p.username === username);
        return index === -1 ? null : index + 1;
    }

    // Stats globales (sans charger tous les scores)
    async getGlobalStats() {
        try {
            if (!supabase) {
                throw new Error('Supabase non configuré');
            }

            // Requête optimisée avec agrégation
            const { data, error } = await supabase
                .rpc('get_leaderboard_stats'); // Fonction Postgres custom

            if (error) {
                // Fallback: calculer depuis le cache
                if (this.cache && this.cache.length > 0) {
                    return {
                        success: true,
                        totalPlayers: this.cache.length,
                        topScore: this.cache[0].max_score,
                        avgScore: Math.round(this.cache.reduce((sum, p) => sum + p.max_score, 0) / this.cache.length)
                    };
                }
                throw error;
            }

            return { success: true, ...data };
        } catch (error) {
            console.error('❌ Erreur stats globales:', error);
            return { success: false, error: error.message };
        }
    }
}

// Instance globale
const leaderboardManager = new LeaderboardManager();

// Export pour usage dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeaderboardManager;
}
