// Module de gestion du bandeau info défilant
class InfoBannerManager {
    constructor() {
        this.messages = [
            { icon: '🎨', text: 'Créé avec ❤️ par Emmanuel Payet', link: 'https://emmanuel.gallery/' },
            { icon: '📚', text: 'Découvrez mes ebooks chrétiens sur Google Play', link: 'https://play.google.com/store/search?q=Ebooks%20Emmanuel%20Payet%20Dreamer&c=books' },
            { icon: '🎵', text: 'Écoutez mon gospel gratuit sur AudioMack', link: 'https://audiomack.com/emmanuelpayet888/album/amour-amour' },
            { icon: '🚢', text: 'Jouez au Petit Bateau Rouge', link: 'https://unispourlapaix.github.io/petitbateau/petitbateauRouge.html' },
            { icon: '💝', text: 'UnityQuest: Chronicles of Love', link: 'https://unispourlapaix.github.io/unityquest-chronicles-of-love/' },
            { icon: '✝️', text: 'La foi unit les cœurs au-delà des différences' },
            { icon: '🕊️', text: 'Paix, Amour, Unité - Ne participez pas aux œuvres du mal' },
            { icon: '📖', text: 'Chaque mot est une bénédiction pour l\'âme' },
            { icon: '🌟', text: 'Que la grâce de Dieu illumine votre chemin' },
            { icon: '🏆', text: 'Consultez le classement des meilleurs joueurs', link: 'public/leaderboard.html' }
        ];
        
        this.currentMessages = [];
        this.updateInterval = null;
        this.initialized = false;
    }

    // Initialiser le bandeau
    init() {
        if (this.initialized) return;
        
        this.messagesContainer = document.getElementById('infoMessages');
        this.levelEl = document.getElementById('infoBannerLevel');
        this.scoreEl = document.getElementById('infoBannerScore');
        this.maxScoreEl = document.getElementById('infoBannerMaxScore');
        this.clicksEl = document.getElementById('infoBannerClicks');
        this.progressBar = document.getElementById('infoProgressBar');

        if (!this.messagesContainer) {
            console.warn('⚠️ Bandeau info non trouvé');
            return;
        }

        // Générer les messages défilants (dupliquer pour loop infini)
        this.generateMessages();
        
        // Mise à jour automatique des stats toutes les secondes
        this.updateInterval = setInterval(() => {
            this.updateStats();
        }, 1000);

        this.initialized = true;
        console.log('✅ Bandeau info initialisé');
    }

    // Générer les messages HTML (dupliquer pour effet de boucle)
    generateMessages() {
        const messagesHTML = this.messages.map(msg => {
            if (msg.link) {
                return `
                    <div class="info-message">
                        <span class="info-message-icon">${msg.icon}</span>
                        <a href="${msg.link}" target="_blank">${msg.text}</a>
                    </div>
                `;
            } else {
                return `
                    <div class="info-message">
                        <span class="info-message-icon">${msg.icon}</span>
                        <span>${msg.text}</span>
                    </div>
                `;
            }
        }).join('');

        // Dupliquer pour créer un défilement infini
        this.messagesContainer.innerHTML = messagesHTML + messagesHTML;
    }

    // Mettre à jour les stats (score, niveau, etc.)
    updateStats(game) {
        if (!this.initialized) return;

        // Si game est fourni, utiliser ses valeurs
        if (game) {
            if (this.levelEl) this.levelEl.textContent = game.currentLevel || 1;
            if (this.scoreEl) this.scoreEl.textContent = game.score || 0;
            if (this.maxScoreEl) this.maxScoreEl.textContent = game.maxScore || 0;
            if (this.clicksEl) this.clicksEl.textContent = game.clickCount || 0;
            
            // Barre de progression: pourcentage de mots complétés
            if (this.progressBar && game.words && game.words.length > 0) {
                const progress = (game.completedWords?.size || 0) / game.words.length * 100;
                this.progressBar.style.width = progress + '%';
            }
        } else {
            // Sinon, chercher dans le DOM (fallback)
            const levelText = document.getElementById('currentLevel')?.textContent;
            const scoreText = document.getElementById('score')?.textContent;
            const clicksText = document.getElementById('clickCount')?.textContent;
            
            if (levelText && this.levelEl) this.levelEl.textContent = levelText;
            if (scoreText && this.scoreEl) this.scoreEl.textContent = scoreText;
            if (clicksText && this.clicksEl) this.clicksEl.textContent = clicksText;
        }
    }

    // Ajouter un message temporaire (ex: notification)
    addTemporaryMessage(icon, text, duration = 5000, important = false) {
        if (!this.initialized) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'info-message' + (important ? ' important' : '');
        messageEl.innerHTML = `
            <span class="info-message-icon">${icon}</span>
            <span>${text}</span>
        `;

        // Insérer au début
        this.messagesContainer.insertBefore(messageEl, this.messagesContainer.firstChild);

        // Supprimer après la durée
        setTimeout(() => {
            messageEl.remove();
        }, duration);
    }

    // Mettre à jour un message existant
    updateMessage(index, newText, newIcon) {
        if (index >= 0 && index < this.messages.length) {
            if (newText) this.messages[index].text = newText;
            if (newIcon) this.messages[index].icon = newIcon;
            this.generateMessages();
        }
    }

    // Ajouter un message permanent
    addMessage(icon, text, link = null) {
        this.messages.push({ icon, text, link });
        this.generateMessages();
    }

    // Supprimer un message
    removeMessage(index) {
        if (index >= 0 && index < this.messages.length) {
            this.messages.splice(index, 1);
            this.generateMessages();
        }
    }

    // Pause/Resume du défilement
    toggleScroll(pause) {
        if (!this.messagesContainer) return;
        
        if (pause) {
            this.messagesContainer.classList.add('paused');
        } else {
            this.messagesContainer.classList.remove('paused');
        }
    }

    // Changer le thème du bandeau
    setTheme(theme) {
        const banner = document.getElementById('infoBanner');
        if (!banner) return;

        // Supprimer les thèmes existants
        banner.classList.remove('rainbow');
        
        // Appliquer le nouveau thème
        if (theme === 'rainbow') {
            banner.classList.add('rainbow');
        }
    }

    // Nettoyer
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.initialized = false;
    }

    // Afficher un message d'achievement
    showAchievement(title, description) {
        this.addTemporaryMessage('🎖️', `${title}: ${description}`, 8000, true);
    }

    // Afficher des stats globales
    showGlobalStats(totalPlayers, topScore) {
        this.addTemporaryMessage('🌍', `${totalPlayers} joueurs • Record: ${topScore} pts`, 10000);
    }

    // Afficher le rang du joueur
    showPlayerRank(rank, totalPlayers) {
        this.addTemporaryMessage('🏅', `Vous êtes #${rank} sur ${totalPlayers} joueurs !`, 10000, true);
    }
}

// Instance globale
const infoBannerManager = new InfoBannerManager();

// Auto-init au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        infoBannerManager.init();
    });
} else {
    infoBannerManager.init();
}

// Export pour usage dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InfoBannerManager;
}
