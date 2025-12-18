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
            authSystem.onAuthChange((user) => {
                // Rafraîchir le tab connexion quand l'état d'auth change
                this.updateConnexionTab();
                
                // Fermer le menu après connexion réussie
                if (user && user.username) {
                    setTimeout(() => {
                        const menuModal = document.getElementById('menuModal');
                        if (menuModal) {
                            menuModal.classList.add('hidden');
                        }
                        console.log('✅ Connexion réussie:', user.username);
                    }, 300);
                }
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
        const size = 1080; // Format carré Instagram
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Fond dégradé rose kawaii (thème du jeu)
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#FF1493');
        gradient.addColorStop(0.5, '#FF69B4');
        gradient.addColorStop(1, '#FFB6C1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Mots bibliques pour le nuage de mots
        const biblicalWords = [
            'JESUS', 'AMOUR', 'FOI', 'PAIX', 'GRACE', 'VERITE', 'VIE', 'LUMIERE',
            'CROIX', 'SALUT', 'ESPOIR', 'JOIE', 'PRIERE', 'PARDON', 'SAGESSE',
            'BONTE', 'DIEU', 'CHRIST', 'SAINT', 'ETERNEL', 'GLOIRE', 'LOUANGE'
        ];
        
        // Nuage de mots en arrière-plan
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.textAlign = 'center';
        
        const wordCloud = [
            {word: biblicalWords[0], x: 200, y: 150, size: 48, rotation: -0.15},
            {word: biblicalWords[1], x: 850, y: 200, size: 42, rotation: 0.1},
            {word: biblicalWords[2], x: 300, y: 350, size: 36, rotation: 0.2},
            {word: biblicalWords[3], x: 750, y: 400, size: 40, rotation: -0.1},
            {word: biblicalWords[4], x: 150, y: 550, size: 38, rotation: 0.15},
            {word: biblicalWords[5], x: 900, y: 600, size: 44, rotation: -0.2},
            {word: biblicalWords[6], x: 400, y: 700, size: 35, rotation: 0.1},
            {word: biblicalWords[7], x: 650, y: 750, size: 46, rotation: -0.15},
            {word: biblicalWords[8], x: 200, y: 850, size: 40, rotation: 0.12},
            {word: biblicalWords[9], x: 850, y: 900, size: 42, rotation: -0.1},
            {word: biblicalWords[10], x: 500, y: 950, size: 38, rotation: 0.18},
            {word: biblicalWords[11], x: 120, y: 300, size: 34, rotation: -0.12},
            {word: biblicalWords[12], x: 920, y: 350, size: 36, rotation: 0.14},
            {word: biblicalWords[13], x: 350, y: 500, size: 32, rotation: -0.08},
            {word: biblicalWords[14], x: 700, y: 550, size: 45, rotation: 0.2},
            {word: biblicalWords[15], x: 180, y: 700, size: 33, rotation: -0.16},
            {word: biblicalWords[16], x: 880, y: 750, size: 50, rotation: 0.11},
            {word: biblicalWords[17], x: 450, y: 200, size: 37, rotation: -0.13},
            {word: biblicalWords[18], x: 600, y: 300, size: 39, rotation: 0.09},
            {word: biblicalWords[19], x: 250, y: 1000, size: 41, rotation: -0.17},
            {word: biblicalWords[20], x: 750, y: 1020, size: 43, rotation: 0.15},
            {word: biblicalWords[21], x: 500, y: 100, size: 38, rotation: -0.1}
        ];
        
        wordCloud.forEach(item => {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation);
            ctx.font = `bold ${item.size}px Arial, sans-serif`;
            ctx.fillText(item.word, 0, 0);
            ctx.restore();
        });
        
        ctx.restore();
        
        // Pluie de petits cœurs roses kawaii (emojis)
        const hearts = ['💕', '💖', '💗', '💝', '💓', '💞'];
        const heartPositions = [
            {emoji: hearts[0], x: 120, y: 180, size: 32, rotation: -0.2},
            {emoji: hearts[1], x: 920, y: 220, size: 28, rotation: 0.15},
            {emoji: hearts[2], x: 200, y: 400, size: 30, rotation: 0.1},
            {emoji: hearts[3], x: 850, y: 450, size: 26, rotation: -0.15},
            {emoji: hearts[4], x: 100, y: 650, size: 28, rotation: 0.2},
            {emoji: hearts[5], x: 940, y: 700, size: 32, rotation: -0.1},
            {emoji: hearts[0], x: 180, y: 880, size: 30, rotation: 0.15},
            {emoji: hearts[1], x: 880, y: 920, size: 28, rotation: -0.2},
            {emoji: hearts[2], x: 450, y: 120, size: 26, rotation: 0.1},
            {emoji: hearts[3], x: 650, y: 200, size: 30, rotation: -0.15},
            {emoji: hearts[4], x: 320, y: 980, size: 28, rotation: 0.12},
            {emoji: hearts[5], x: 750, y: 1000, size: 32, rotation: -0.18},
            {emoji: hearts[0], x: 80, y: 300, size: 26, rotation: 0.2},
            {emoji: hearts[1], x: 960, y: 350, size: 30, rotation: -0.12},
            {emoji: hearts[2], x: 400, y: 560, size: 28, rotation: 0.15},
            {emoji: hearts[3], x: 700, y: 820, size: 26, rotation: -0.1}
        ];
        
        ctx.textAlign = 'center';
        heartPositions.forEach(h => {
            ctx.save();
            ctx.translate(h.x, h.y);
            ctx.rotate(h.rotation);
            ctx.font = `${h.size}px Arial`;
            ctx.fillText(h.emoji, 0, 0);
            ctx.restore();
        });
        
        // Fonction pour dessiner l'icône kawaii (étoile avec visage)
        const drawKawaiiIcon = (x, y, iconSize) => {
            const scale = iconSize / 512;
            const centerX = x;
            const centerY = y;
            
            ctx.save();
            
            // Cercle rose de fond
            ctx.fillStyle = '#ff69b4';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetY = 8;
            ctx.beginPath();
            ctx.arc(centerX, centerY, iconSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowColor = 'transparent';
            
            // Croix en X blanche dans le fond
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 24 * scale;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(centerX - iconSize * 0.42, centerY - iconSize * 0.42);
            ctx.lineTo(centerX + iconSize * 0.42, centerY + iconSize * 0.42);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX + iconSize * 0.42, centerY - iconSize * 0.42);
            ctx.lineTo(centerX - iconSize * 0.42, centerY + iconSize * 0.42);
            ctx.stroke();
            
            // Étoile blanche avec ombre
            const starRadius = iconSize * 0.40;
            ctx.translate(centerX, centerY);
            
            ctx.shadowColor = 'rgba(255, 20, 147, 0.4)';
            ctx.shadowBlur = 10 * scale;
            ctx.shadowOffsetY = 3 * scale;
            
            ctx.fillStyle = '#ffffff';
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
            
            // Visage kawaii
            const eyeOffset = starRadius * 0.25;
            const eyeSize = 8 * scale;
            
            // Yeux
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(-eyeOffset, -5 * scale, eyeSize, 0, Math.PI * 2);
            ctx.arc(eyeOffset, -5 * scale, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Sourire
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4 * scale;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(0, 5 * scale, 25 * scale, 0.2, Math.PI - 0.2);
            ctx.stroke();
            
            // Joues roses
            ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
            ctx.beginPath();
            ctx.arc(-starRadius * 0.55, 10 * scale, 15 * scale, 0, Math.PI * 2);
            ctx.arc(starRadius * 0.55, 10 * scale, 15 * scale, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        };
        
        // Dessiner l'icône kawaii en haut
        drawKawaiiIcon(size/2, 180, 240);
        
        // Titre en haut avec ombre
        ctx.fillStyle = 'white';
        ctx.font = 'bold 52px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.fillText('MOTS CROISÉS', size/2, size*0.37);
        ctx.fillText('CHRÉTIENS', size/2, size*0.43);
        ctx.shadowColor = 'transparent';
        
        // Carte centrale blanche avec ombre
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 15;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        ctx.beginPath();
        ctx.roundRect(size*0.1, size*0.48, size*0.8, size*0.36, 30);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        
        // Motifs de mots en gros traits roses sur fond blanc
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 105, 180, 0.08)';
        ctx.lineWidth = 12;
        ctx.font = 'bold 120px Arial, sans-serif';
        ctx.textAlign = 'center';
        
        const patternWords = ['AMOUR', 'FOI', 'PAIX', 'JOIE'];
        const cardTop = size*0.48;
        const cardBottom = size*0.84;
        
        // Disposer les mots en diagonale sur la carte
        ctx.translate(size/2, (cardTop + cardBottom)/2);
        ctx.rotate(-0.15);
        ctx.strokeText(patternWords[0], -150, -80);
        ctx.strokeText(patternWords[1], 200, 0);
        ctx.rotate(0.3);
        ctx.strokeText(patternWords[2], -200, 60);
        ctx.strokeText(patternWords[3], 150, -20);
        ctx.restore();
        
        // Avatar avec cercle rose
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(size/2, size*0.56, 75, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '110px Arial';
        ctx.fillText(avatar, size/2, size*0.595);
        
        // Nom du joueur
        ctx.fillStyle = '#333';
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.fillText(username, size/2, size*0.68);
        
        // Score avec style kawaii
        ctx.fillStyle = '#FF1493';
        ctx.font = 'bold 80px Arial, sans-serif';
        ctx.fillText(`${score}`, size/2, size*0.77);
        
        ctx.fillStyle = '#FF69B4';
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.fillText('POINTS', size/2, size*0.815);
        
        // Barre du bas avec le lien
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(0, size - 100, size, 100);
        
        ctx.fillStyle = '#FF1493';
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.fillText('🎨 emmanuel.gallery', size/2, size - 50);
        
        // Convertir en JPEG et partager
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'mon-score-mots-croises.jpg', { type: 'image/jpeg' });
            
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Mon Score - Mots Croisés Chrétiens',
                        text: `J'ai fait ${score} points ! 🎮`,
                        files: [file]
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        this.downloadScoreImage(canvas, 'jpg');
                    }
                }
            } else {
                this.downloadScoreImage(canvas, 'jpg');
            }
        }, 'image/jpeg', 0.95);
    }
    
    downloadScoreImage(canvas, format = 'png') {
        const link = document.createElement('a');
        const extension = format === 'jpg' ? 'jpg' : 'png';
        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpg' ? 0.95 : undefined;
        
        link.download = `mon-score-mots-croises.${extension}`;
        link.href = canvas.toDataURL(mimeType, quality);
        link.click();
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
        const authFormMenu = document.getElementById('authFormMenu');
        const profileInfo = document.getElementById('profileInfo');
        const chatMultiplayerSection = document.getElementById('chatMultiplayerSection');

        if (!profileInfo) return;

        // Vérifier si l'utilisateur est connecté
        if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated()) {
            const user = authSystem.getCurrentUser();
            if (authForm) authForm.style.display = 'none';
            if (authFormMenu) authFormMenu.style.display = 'none';
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
            if (authForm) authForm.style.display = 'block';
            if (authFormMenu) authFormMenu.style.display = 'block';
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
