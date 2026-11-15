// Module de gestion du bandeau info défilant
class InfoBannerManager {
    constructor() {
        this.messages = [
            { icon: '►', text: 'CONNEXION: EMMANUEL PAYET', link: 'https://emmanuel.gallery/' },
            { icon: '►', text: 'EBOOKS: GOOGLE PLAY STORE', link: 'https://play.google.com/store/search?q=Ebooks%20Emmanuel%20Payet%20Dreamer&c=books' },
            { icon: '►', text: 'AUDIO: GOSPEL FREE AUDIOMACK', link: 'https://audiomack.com/emmanuelpayet888/album/amour-amour' },
            { icon: '►', text: 'GAME: LE PETIT BATEAU ROUGE', link: 'https://unispourlapaix.github.io/petitbateau/petitbateauRouge.html' },
            { icon: '►', text: 'ADVENTURE: UNITYQUEST CHRONICLES', link: 'https://unispourlapaix.github.io/unityquest-chronicles-of-love/' },
            { icon: '►', text: 'INFO: JEU DE MOTS CROISES CHRETIENS' },
            { icon: '►', text: 'STATUS: PARTIE EN COURS' },
            { icon: '►', text: 'TECH: HTML5 + CSS3 + JAVASCRIPT' },
            { icon: '►', text: 'SCORES SUR CET APPAREIL', link: 'public/leaderboard.html' }
        ];
        
        this.currentMessageIndex = 0;
        this.updateInterval = null;
        this.messageInterval = null;
        this.mobileToggleInterval = null;
        this.showingStats = true; // Pour mobile: true = stats, false = messages
        this.initialized = false;
    }

    // Initialiser le bandeau
    init() {
        if (this.initialized) return;
        
        this.banner = document.getElementById('infoBanner');
        this.messagesContainer = document.getElementById('infoMessages');
        this.levelEl = document.getElementById('infoBannerLevel');
        this.scoreEl = document.getElementById('infoBannerScore');
        this.maxScoreEl = document.getElementById('infoBannerMaxScore');
        this.clicksEl = document.getElementById('infoBannerClicks');
        this.progressBar = document.getElementById('infoProgressBar');

        if (!this.messagesContainer || !this.banner) {
            console.warn('⚠️ Bandeau info non trouvé');
            return;
        }

        // Afficher le premier message
        this.showCurrentMessage();
        
        // Changer de message toutes les 5 secondes
        this.messageInterval = setInterval(() => {
            this.nextMessage();
        }, 5000);
        
        // Mobile: alterner stats/messages toutes les 5 secondes
        if (window.innerWidth <= 768) {
            this.mobileToggleInterval = setInterval(() => {
                this.toggleMobileView();
            }, 5000);
        }

        // Gérer le redimensionnement
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768 && !this.mobileToggleInterval) {
                this.mobileToggleInterval = setInterval(() => {
                    this.toggleMobileView();
                }, 5000);
            } else if (window.innerWidth > 768 && this.mobileToggleInterval) {
                clearInterval(this.mobileToggleInterval);
                this.mobileToggleInterval = null;
                this.banner.classList.remove('mobile-show-messages');
            }
        });
        
        // Mise à jour automatique des stats toutes les secondes
        this.updateInterval = setInterval(() => {
            this.updateStats();
        }, 1000);

        this.initialized = true;
        console.log('✅ Bandeau info initialisé');
    }

    // Alterner affichage mobile entre stats et messages
    toggleMobileView() {
        this.showingStats = !this.showingStats;
        if (this.showingStats) {
            this.banner.classList.remove('mobile-show-messages');
        } else {
            this.banner.classList.add('mobile-show-messages');
        }
    }

    // Afficher le message courant
    showCurrentMessage() {
        const msg = this.messages[this.currentMessageIndex];
        if (msg.link) {
            this.messagesContainer.innerHTML = `
                <div class="info-message" style="position: static; opacity: 1; visibility: visible; animation: none;">
                    <span class="info-message-icon">${msg.icon}</span>
                    <a href="${msg.link}" target="_blank">${msg.text}</a>
                </div>
            `;
        } else {
            this.messagesContainer.innerHTML = `
                <div class="info-message" style="position: static; opacity: 1; visibility: visible; animation: none;">
                    <span class="info-message-icon">${msg.icon}</span>
                    <span>${msg.text}</span>
                </div>
            `;
        }
    }

    // Passer au message suivant
    nextMessage() {
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
        this.showCurrentMessage();
    }

    // Générer les messages HTML (déprécié, utilise showCurrentMessage maintenant)
    generateMessages() {
        // Méthode gardée pour compatibilité, mais non utilisée
        this.showCurrentMessage();
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
        banner.classList.remove('inverted');
        
        // Appliquer le nouveau thème
        if (theme === 'inverted') {
            banner.classList.add('inverted');
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
