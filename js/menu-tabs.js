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

        // Écouter les changements d'authentification
        if (typeof authSystem !== 'undefined') {
            authSystem.onAuthChange(() => {
                // Rafraîchir le tab connexion quand l'état d'auth change
                this.updateConnexionTab();
            });
        }

        // Initialiser le système d'avatars
        this.initAvatarSelector();
    }

    initAvatarSelector() {
        // Mettre à jour les avatars verrouillés/déverrouillés
        this.updateAvatarLocks();
        
        // Gérer la sélection d'avatar
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('avatar-option')) {
                const unlockScore = parseInt(e.target.dataset.unlock) || 0;
                const userScore = (authSystem && authSystem.isAuthenticated()) ? (authSystem.getCurrentUser().max_score || 0) : 0;
                
                // Vérifier si l'avatar est déverrouillé
                if (unlockScore > userScore) {
                    alert(`🔒 Cet avatar est verrouillé ! Atteignez ${unlockScore} points pour le débloquer.`);
                    return;
                }
                
                const avatar = e.target.dataset.avatar;
                const currentAvatar = document.getElementById('currentAvatar');
                const avatarSelector = document.getElementById('avatarSelector');
                
                if (currentAvatar) {
                    currentAvatar.textContent = avatar;
                    // Sauvegarder l'avatar dans le profil utilisateur
                    if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated()) {
                        const user = authSystem.getCurrentUser();
                        // Mettre à jour l'avatar dans le système de chat
                        if (typeof window.simpleChatSystem !== 'undefined' && user) {
                            window.simpleChatSystem.setUserAvatar(user.username, avatar);
                        }
                    }
                }
                
                if (avatarSelector) {
                    avatarSelector.style.display = 'none';
                }
            }
        });

        // Fermer le sélecteur si on clique ailleurs
        document.addEventListener('click', (e) => {
            const avatarSelector = document.getElementById('avatarSelector');
            const currentAvatar = document.getElementById('currentAvatar');
            
            if (avatarSelector && currentAvatar && 
                !avatarSelector.contains(e.target) && 
                !currentAvatar.contains(e.target) &&
                avatarSelector.style.display !== 'none') {
                avatarSelector.style.display = 'none';
            }
        });
        
        // Bouton de partage score
        const shareScoreBtn = document.getElementById('shareScoreBtn');
        if (shareScoreBtn) {
            shareScoreBtn.addEventListener('click', () => this.shareScore());
        }
    }
    
    updateAvatarLocks() {
        const userScore = (authSystem && authSystem.isAuthenticated()) ? (authSystem.getCurrentUser().max_score || 0) : 0;
        const avatarOptions = document.querySelectorAll('.avatar-option');
        
        avatarOptions.forEach(option => {
            const unlockScore = parseInt(option.dataset.unlock) || 0;
            
            if (unlockScore > userScore) {
                // Avatar verrouillé
                option.style.opacity = '0.4';
                option.style.filter = 'grayscale(100%)';
                option.style.position = 'relative';
                option.title = `Débloqué à ${unlockScore} pts`;
                
                // Ajouter un cadenas si pas déjà présent
                if (!option.querySelector('.lock-icon')) {
                    const lock = document.createElement('div');
                    lock.className = 'lock-icon';
                    lock.innerHTML = '🔒';
                    lock.style.cssText = 'position: absolute; top: 2px; right: 2px; font-size: 12px;';
                    option.appendChild(lock);
                }
            } else {
                // Avatar déverrouillé
                option.style.opacity = '1';
                option.style.filter = 'none';
                option.title = `Déverrouillé (${unlockScore} pts)`;
                
                // Retirer le cadenas si présent
                const lock = option.querySelector('.lock-icon');
                if (lock) lock.remove();
            }
        });
    }
    
    async shareScore() {
        if (!authSystem || !authSystem.isAuthenticated()) {
            alert('Connectez-vous pour partager votre score !');
            return;
        }
        
        const user = authSystem.getCurrentUser();
        const score = user.max_score || 0;
        const username = user.username || 'Joueur';
        const avatar = window.simpleChatSystem?.getUserAvatar(username) || '😊';
        
        // Créer un canvas CARRÉ pour l'image
        const canvas = document.createElement('canvas');
        const size = 1080; // Format Instagram parfait
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Fond dégradé rose kawaii
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#FFD3E1');
        gradient.addColorStop(0.5, '#FFC0DB');
        gradient.addColorStop(1, '#FFB3D9');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Fonction pour dessiner des cœurs géométriques
        const drawGeometricHeart = (x, y, size, color, rotation = 0) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillStyle = color;
            ctx.beginPath();
            // Partie supérieure (deux demi-cercles)
            ctx.arc(-size/4, -size/4, size/4, 0, Math.PI, true);
            ctx.arc(size/4, -size/4, size/4, 0, Math.PI, true);
            // Partie inférieure (triangle)
            ctx.lineTo(0, size/2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };
        
        // Dessiner des cœurs géométriques en arrière-plan
        const heartPositions = [
            {x: 100, y: 100, size: 60, color: 'rgba(255, 105, 180, 0.15)', rotation: 0.3},
            {x: 950, y: 150, size: 80, color: 'rgba(255, 20, 147, 0.12)', rotation: -0.2},
            {x: 150, y: 900, size: 70, color: 'rgba(255, 182, 193, 0.2)', rotation: 0.5},
            {x: 900, y: 950, size: 90, color: 'rgba(255, 105, 180, 0.1)', rotation: -0.4},
            {x: size/2, y: 100, size: 50, color: 'rgba(255, 20, 147, 0.08)', rotation: 0},
            {x: 200, y: 500, size: 45, color: 'rgba(255, 182, 193, 0.15)', rotation: 0.8},
            {x: 880, y: 520, size: 55, color: 'rgba(255, 105, 180, 0.12)', rotation: -0.6}
        ];
        
        heartPositions.forEach(h => {
            drawGeometricHeart(h.x, h.y, h.size, h.color, h.rotation);
        });
        
        // Logo étoile kawaii en haut
        const drawKawaiiLogo = (x, y, logoSize) => {
            ctx.save();
            ctx.translate(x, y);
            
            // Cercle rose du logo
            ctx.fillStyle = '#ff69b4';
            ctx.beginPath();
            ctx.arc(0, 0, logoSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Croix en X blanche
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = logoSize * 0.05;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(-logoSize * 0.42, -logoSize * 0.42);
            ctx.lineTo(logoSize * 0.42, logoSize * 0.42);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(logoSize * 0.42, -logoSize * 0.42);
            ctx.lineTo(-logoSize * 0.42, logoSize * 0.42);
            ctx.stroke();
            
            // Étoile blanche
            const starRadius = logoSize * 0.40;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(255, 20, 147, 0.4)';
            ctx.shadowBlur = 8;
            
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * starRadius;
                const y = Math.sin(angle) * starRadius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                
                const innerAngle = angle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * (starRadius * 0.38);
                const innerY = Math.sin(innerAngle) * (starRadius * 0.38);
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            
            ctx.shadowColor = 'transparent';
            ctx.restore();
        };
        
        // Dessiner le logo en haut
        drawKawaiiLogo(size/2, 140, 180);
        
        // Titre avec ombre
        ctx.shadowColor = 'rgba(255, 105, 180, 0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = '#ff1493';
        ctx.font = 'bold 58px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Mots Croisés', size/2, 310);
        ctx.fillText('Chrétiens', size/2, 380);
        ctx.shadowColor = 'transparent';
        
        // Carte blanche centrale avec ombre pour le contenu principal
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 10;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.roundRect(size*0.12, 440, size*0.76, 420, 40);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        
        // Avatar (très grand)
        ctx.font = '140px Arial';
        ctx.fillText(avatar, size/2, 590);
        
        // Nom du joueur
        ctx.fillStyle = '#333';
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.fillText(username, size/2, 680);
        
        // Ligne décorative
        ctx.strokeStyle = '#FFB3D9';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(size*0.3, 720);
        ctx.lineTo(size*0.7, 720);
        ctx.stroke();
        
        // Score avec fond rose
        const scoreText = `${score} points`;
        ctx.font = 'bold 76px Arial, sans-serif';
        const scoreWidth = ctx.measureText(scoreText).width;
        
        ctx.fillStyle = '#ff1493';
        ctx.beginPath();
        ctx.roundRect((size - scoreWidth)/2 - 30, 740, scoreWidth + 60, 95, 15);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText(scoreText, size/2, 810);
        
        // Étoiles décoratives autour du score
        ctx.font = '32px Arial';
        ctx.fillText('✨', size/2 - scoreWidth/2 - 60, 795);
        ctx.fillText('✨', size/2 + scoreWidth/2 + 60, 795);
        
        // Message avec emoji
        ctx.fillStyle = '#666';
        ctx.font = '30px Arial, sans-serif';
        ctx.fillText('🎮 Rejoins-moi pour jouer ensemble ! 🙏', size/2, 940);
        
        // URL en bas avec fond semi-transparent
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(0, size - 80, size, 80);
        
        ctx.fillStyle = '#ff69b4';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('unispourlapaix.github.io/mots-en-croix-chretiens', size/2, size - 42);
        
        // Convertir en blob et partager
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'mon-score-mots-croises.png', { type: 'image/png' });
            
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Mon Score - Mots Croisés Chrétiens',
                        text: `J'ai fait ${score} points aux Mots Croisés Chrétiens ! Rejoignez-moi !`,
                        files: [file]
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        this.downloadScoreImage(canvas);
                    }
                }
            } else {
                // Fallback: télécharger l'image
                this.downloadScoreImage(canvas);
            }
        });
    }
    
    downloadScoreImage(canvas) {
        const link = document.createElement('a');
        link.download = 'mon-score-mots-croises.png';
        link.href = canvas.toDataURL();
        link.click();
        alert('📥 Image téléchargée ! Vous pouvez maintenant la partager sur vos réseaux sociaux.');
    }

    switchTab(tabName) {
        // Son de changement d'onglet
        if (window.audioSystem) {
            window.audioSystem.playTabSwitch();
        }
        
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
            const currentAvatar = document.getElementById('currentAvatar');

            if (usernameEl) usernameEl.textContent = user.username || 'Utilisateur';
            if (emailEl) emailEl.textContent = user.email || '';
            if (maxScoreEl) maxScoreEl.textContent = user.max_score || 0;
            
            // Charger l'avatar personnalisé
            if (currentAvatar && typeof window.simpleChatSystem !== 'undefined') {
                const userAvatar = window.simpleChatSystem.getUserAvatar(user.username);
                if (userAvatar) {
                    currentAvatar.textContent = userAvatar;
                }
            }
            
            // Mettre à jour les avatars verrouillés/déverrouillés selon le score
            this.updateAvatarLocks();
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
