// Système de navigation par onglets dans le menu
class MenuTabSystem {
    constructor() {
        this.currentTab = 'settings';
        this.init();
    }

    init() {
        // Écouter les clics sur les onglets
        const tabs = document.querySelectorAll('.menu-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // Vérifier l'authentification pour l'onglet chat
                if (tabName === 'chat') {
                    if (typeof authSystem !== 'undefined' && !authSystem.isAuthenticated()) {
                        // Fermer le menu et afficher l'auth modal
                        const menuModal = document.getElementById('menuModal');
                        if (menuModal) {
                            menuModal.classList.add('hidden');
                        }
                        authSystem.showAuthModal();
                        return;
                    }
                }

                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Mettre à jour l'onglet actif
        const tabs = document.querySelectorAll('.menu-tab');
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Mettre à jour le contenu actif
        const contents = document.querySelectorAll('.menu-tab-content');
        contents.forEach(content => {
            if (content.id === `${tabName}TabContent`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Mettre à jour le titre
        const title = document.getElementById('menuTitle');
        if (title) {
            if (tabName === 'settings') {
                title.textContent = '⚙️ Menu';
            } else if (tabName === 'leaderboard') {
                title.textContent = '🏆 Score';
                this.loadLeaderboard();
            } else if (tabName === 'connexion') {
                title.textContent = '👤 Connexion';
                this.updateConnexionTab();
            } else if (tabName === 'chat') {
                title.textContent = '💬 Chat Communautaire';
            }
        }

        this.currentTab = tabName;
    }

    // Ouvrir directement un onglet spécifique
    openTab(tabName) {
        // Ouvrir le menu modal
        const modal = document.getElementById('menuModal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Minimiser la bulle de chat
            const chatBubble = document.getElementById('chatBubble');
            const toggleBtn = document.getElementById('toggleChatBubble');
            if (chatBubble && !chatBubble.classList.contains('minimized')) {
                chatBubble.classList.add('minimized');
                if (toggleBtn) toggleBtn.textContent = '+';
            }
        }

        // Switcher vers l'onglet demandé
        this.switchTab(tabName);
    }

    // Charger le leaderboard
    async loadLeaderboard() {
        const container = document.getElementById('leaderboardContainer');
        if (!container) return;

        container.innerHTML = '<p style="text-align: center; color: #666;">Chargement...</p>';

        try {
            // Utiliser l'API de leaderboard existante
            if (typeof leaderboardManager !== 'undefined') {
                const result = await leaderboardManager.getTopScores(10);
                const scores = result.scores || [];
                
                if (scores.length === 0) {
                    container.innerHTML = '<p style="text-align: center; color: #999; font-size: 14px;">Aucun score enregistré</p>';
                    return;
                }

                let html = '<div style="overflow-y: auto; max-height: 400px;">';
                html += '<table style="width: 100%; border-collapse: collapse;">';
                
                scores.forEach((score, index) => {
                    const rank = index + 1;
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
                    html += `
                        <tr style="border-bottom: 1px solid #ffe0f0;">
                            <td style="padding: 12px 8px; text-align: center; width: 40px; font-weight: bold; color: ${rank <= 3 ? '#ff1493' : '#666'};">
                                ${medal}
                            </td>
                            <td style="padding: 12px 8px; color: #333;">
                                ${score.username || 'Anonyme'}
                            </td>
                            <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #ff1493;">
                                ${score.max_score}
                            </td>
                        </tr>
                    `;
                });
                
                html += '</table></div>';
                container.innerHTML = html;
            }
        } catch (error) {
            console.error('Erreur chargement leaderboard:', error);
            container.innerHTML = '<p style="text-align: center; color: #f66; font-size: 14px;">Erreur de chargement</p>';
        }
    }

    // Mettre à jour l'onglet connexion
    updateConnexionTab() {
        const authForm = document.getElementById('authForm');
        const profileInfo = document.getElementById('profileInfo');
        const chatMultiplayerSection = document.getElementById('chatMultiplayerSection');

        if (!authForm || !profileInfo) return;

        // Vérifier si l'utilisateur est connecté
        if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated()) {
            const user = authSystem.getCurrentUser();
            authForm.style.display = 'none';
            profileInfo.style.display = 'block';
            if (chatMultiplayerSection) chatMultiplayerSection.style.display = 'block';

            // Mettre à jour les infos du profil
            const usernameEl = document.getElementById('connectedUsername');
            const emailEl = document.getElementById('connectedEmail');
            const maxScoreEl = document.getElementById('userMaxScore');

            if (usernameEl) usernameEl.textContent = user.username || 'Utilisateur';
            if (emailEl) emailEl.textContent = user.email || '';
            if (maxScoreEl) maxScoreEl.textContent = user.max_score || 0;
        } else {
            authForm.style.display = 'block';
            profileInfo.style.display = 'none';
            if (chatMultiplayerSection) chatMultiplayerSection.style.display = 'none';
        }
    }
}

// Instance globale
const menuTabSystem = new MenuTabSystem();

// Export pour utilisation externe
if (typeof window !== 'undefined') {
    window.menuTabSystem = menuTabSystem;
}
