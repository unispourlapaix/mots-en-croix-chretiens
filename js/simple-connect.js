/**
 * Système de Connexion Ultra-Simplifié
 * Interface intuitive pour jouer avec famille et amis
 */

class SimpleConnect {
    constructor() {
        this.isInitialized = false;
        this.init();
    }
    
    init() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Créer l'interface simplifiée
        this.createSimpleUI();
        
        // Écouter les mises à jour
        window.addEventListener('friendsListUpdated', () => this.updateUI());
        
        this.isInitialized = true;
        console.log('✅ Système de connexion simplifié initialisé');
    }
    
    createSimpleUI() {
        // Ne plus créer le bouton flottant - utiliser celui intégré dans le HTML
        // Le bouton est maintenant dans index.html au-dessus du champ de saisie
        
        // Créer la modal ultra-simple
        this.createQuickConnectModal();
        
        // Mettre à jour le badge
        this.updateBadge();
    }
    
    createQuickConnectModal() {
        const modal = document.createElement('div');
        modal.id = 'quickConnectModal';
        modal.className = 'quick-connect-modal';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="quick-connect-content">
                <button class="quick-close" onclick="window.simpleConnect?.closeQuickConnect()">✕</button>
                
                <h2 style="text-align: center; color: #667eea; margin-bottom: 20px;">
                    🌐 Rejoindre une Salle
                </h2>
                
                <!-- ÉTAPE 1: Créer ou Rejoindre -->
                <div class="quick-section">
                    <div class="quick-step-number">1️⃣</div>
                    <h3>Créer une Salle</h3>
                    <p class="quick-help">Partagez ce code avec vos amis/famille</p>
                    <div class="quick-code-box">
                        <div class="quick-code-text" id="quickRoomCode">Créer une salle...</div>
                        <div class="quick-code-actions">
                            <button class="quick-code-btn" onclick="window.simpleConnect?.copyRoomCode()" title="Copier le code">
                                📋 Copier
                            </button>
                            <button class="quick-code-btn" onclick="window.simpleConnect?.shareRoomCode()" title="Partager le code">
                                📤 Partager
                            </button>
                        </div>
                    </div>
                    <button class="quick-create-btn" onclick="window.simpleConnect?.createRoom()">
                        ➕ Créer une Nouvelle Salle
                    </button>
                </div>
                
                <!-- ÉTAPE 2: Rejoindre avec le Code -->
                <div class="quick-section">
                    <div class="quick-step-number">2️⃣</div>
                    <h3>Rejoindre une Salle</h3>
                    <p class="quick-help">Collez le code de salle qu'on vous a donné</p>
                    <div class="quick-input-group">
                        <input type="text" id="quickRoomCodeInput" placeholder="Collez le code ici..." class="quick-input">
                        <button class="quick-join-btn" onclick="window.simpleConnect?.joinRoomByCode()">
                            ➡️ Rejoindre
                        </button>
                    </div>
                    <div id="quickMessage" class="quick-message"></div>
                </div>
                
                <!-- ÉTAPE 3: Joueurs Connectés -->
                <div class="quick-section">
                    <div class="quick-step-number">3️⃣</div>
                    <h3>Dans cette Salle (<span id="quickPlayersCount">0</span>)</h3>
                    <p class="quick-help">Joueurs connectés dans la même salle</p>
                    <div id="quickPlayersList" class="quick-friends-list">
                        <!-- Liste générée -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.addSimpleStyles();
    }
    
    openQuickConnect() {
        const modal = document.getElementById('quickConnectModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Afficher le code de salle
            this.displayRoomCode();
            
            // Afficher la liste des joueurs
            this.displayPlayersList();
        }
    }
    
    closeQuickConnect() {
        const modal = document.getElementById('quickConnectModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    displayRoomCode() {
        const codeEl = document.getElementById('quickRoomCode');
        const basePeerId = window.simpleChatSystem?.roomCode || window.simpleChatSystem?.peer?.id;
        
        if (codeEl) {
            if (basePeerId) {
                // Ajouter le préfixe cc- pour identifier les codes Christian Crossword
                const roomCode = `cc-${basePeerId}`;
                // Afficher seulement les premiers caractères pour plus de lisibilité
                codeEl.textContent = roomCode.substring(0, 20) + '...';
                codeEl.setAttribute('data-full-code', roomCode);
            } else {
                codeEl.textContent = 'Créer une salle...';
            }
        }
    }
    
    async createRoom() {
        try {
            // Utiliser le simpleChatSystem pour créer une room
            if (!window.simpleChatSystem) {
                this.showMessage('❌ Système non initialisé', 'error');
                return;
            }
            
            // Le peer ID devient le code de salle avec préfixe cc-
            const basePeerId = window.simpleChatSystem.peer?.id || window.simpleChatSystem.roomCode;
            
            if (basePeerId) {
                this.showMessage('✅ Salle créée ! Partagez le code ci-dessus', 'success');
                this.displayRoomCode();
                this.displayPlayersList();
            } else {
                this.showMessage('⏳ Connexion en cours...', 'info');
                // Attendre que le peer soit prêt
                setTimeout(() => this.displayRoomCode(), 1000);
            }
            
        } catch (error) {
            console.error('❌ Erreur création salle:', error);
            this.showMessage('❌ Erreur: ' + error.message, 'error');
        }
    }
    
    async joinRoomByCode() {
        const input = document.getElementById('quickRoomCodeInput');
        const code = input?.value.trim();
        
        if (!code) {
            this.showMessage('Veuillez entrer un code de salle', 'error');
            return;
        }
        
        try {
            if (!window.simpleChatSystem) {
                this.showMessage('❌ Système non initialisé', 'error');
                return;
            }
            
            this.showMessage('⏳ Connexion...', 'info');
            
            // Rejoindre la room avec le code
            await window.simpleChatSystem.joinRoom(code);
            
            this.showMessage('✅ Connecté à la salle !', 'success');
            input.value = '';
            this.displayRoomCode();
            this.displayPlayersList();
            
        } catch (error) {
            console.error('❌ Erreur connexion:', error);
            this.showMessage('❌ ' + error.message, 'error');
        }
    }
    
    copyRoomCode() {
        const codeEl = document.getElementById('quickRoomCode');
        const fullCode = codeEl?.getAttribute('data-full-code');
        
        if (!fullCode) {
            this.showMessage('Créez d\'abord une salle', 'error');
            return;
        }
        
        // Copier dans le presse-papier
        navigator.clipboard.writeText(fullCode).then(() => {
            this.showMessage('✅ Code copié !', 'success');
        }).catch(() => {
            this.showMessage('❌ Erreur de copie', 'error');
        });
    }

    shareRoomCode() {
        const codeEl = document.getElementById('quickRoomCode');
        const fullCode = codeEl?.getAttribute('data-full-code');
        
        if (!fullCode) {
            this.showMessage('Créez d\'abord une salle', 'error');
            return;
        }
        
        const shareText = `🎮 Rejoins-moi sur Mots En Croix Chrétiens !\n\nCode de salle : ${fullCode}\n\nClique ici : ${window.location.origin}`;
        
        // Utiliser l'API Web Share si disponible
        if (navigator.share) {
            navigator.share({
                title: 'Mots En Croix Chrétiens',
                text: shareText,
                url: window.location.href
            }).then(() => {
                this.showMessage('✅ Partagé !', 'success');
            }).catch((error) => {
                if (error.name !== 'AbortError') {
                    this.fallbackShare(shareText);
                }
            });
        } else {
            this.fallbackShare(shareText);
        }
    }
    
    fallbackShare(text) {
        // Fallback : copier et afficher options
        navigator.clipboard.writeText(text).then(() => {
            const options = `
📱 WhatsApp: https://wa.me/?text=${encodeURIComponent(text)}
📧 Email: mailto:?subject=Rejoins-moi sur Mots En Croix&body=${encodeURIComponent(text)}
💬 SMS: sms:?body=${encodeURIComponent(text)}

✅ Le message a été copié dans le presse-papier !
            `.trim();
            
            alert(options);
        });
    }

    displayMyCode() {
        // Méthode désactivée - utiliser displayRoomCode
        this.displayRoomCode();
    }
    
    copyMyCode() {
        // Méthode désactivée - utiliser copyRoomCode
        this.copyRoomCode();
    }
    
    addFriendQuick() {
        // Méthode désactivée - on utilise maintenant un code de salle unique
        console.warn('⚠️ addFriendQuick désactivé - Utiliser joinRoomByCode à la place');
    }
    
    displayPlayersList() {
        const container = document.getElementById('quickPlayersList');
        const countEl = document.getElementById('quickPlayersCount');
        
        if (!container) return;
        
        // Obtenir les connexions actuelles
        const connections = window.simpleChatSystem?.connections;
        const playerCount = (connections?.size || 0) + 1; // +1 pour moi
        
        // Mettre à jour le compteur
        if (countEl) {
            countEl.textContent = playerCount;
        }
        
        // Vider
        container.innerHTML = '';
        
        if (!connections || connections.size === 0) {
            container.innerHTML = `
                <div class="quick-empty">
                    <p style="color: #999; font-size: 14px; text-align: center; padding: 30px;">
                        Vous êtes seul dans cette salle.<br>
                        Partagez le code pour inviter d'autres joueurs !
                    </p>
                </div>
            `;
            return;
        }
        
        // Afficher les joueurs connectés
        connections.forEach((conn, peerId) => {
            const playerCard = document.createElement('div');
            playerCard.className = 'quick-friend-card';
            playerCard.innerHTML = `
                <div class="quick-friend-info">
                    <div class="quick-friend-avatar">👤</div>
                    <div>
                        <div class="quick-friend-name">Joueur</div>
                        <div class="quick-friend-status">🟢 Connecté</div>
                    </div>
                </div>
            `;
            container.appendChild(playerCard);
        });
    }
    
    displayFriendsList() {
        // Méthode désactivée - utiliser displayPlayersList
        this.displayPlayersList();
    }
    
    playWith(friendCode) {
        console.log('🎮 Jouer avec:', friendCode);
        
        // Fermer la modal
        this.closeQuickConnect();
        
        // Connecter avec l'ami (logique existante)
        if (window.simpleChatSystem) {
            window.simpleChatSystem.joinRoom(friendCode);
        }
        
        // Afficher un message
        if (window.roomSystem) {
            window.roomSystem.showMessage('🎮 Connexion en cours...', 'info');
        }
    }
    
    removeFriend(friendCode) {
        if (!confirm('Retirer cet ami de votre liste ?')) return;
        
        const result = window.friendsSystem?.removeFriend(friendCode);
        
        if (result?.success) {
            this.displayFriendsList();
            this.updateBadge();
            
            if (window.realtimeLobbySystem) {
                window.realtimeLobbySystem.syncPresence();
            }
        }
    }
    
    showMessage(text, type) {
        const messageEl = document.getElementById('quickMessage');
        if (!messageEl) return;
        
        messageEl.textContent = text;
        messageEl.className = `quick-message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
    
    updateBadge() {
        // Badge intégré supprimé - plus nécessaire avec l'icône menu
        // Les joueurs sont directement visibles dans la liste compacte
    }
    
    updateUI() {
        this.updateBadge();
        if (document.getElementById('quickConnectModal')?.style.display === 'flex') {
            this.displayFriendsList();
        }
    }
    
    addSimpleStyles() {
        if (document.getElementById('simple-connect-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'simple-connect-styles';
        style.textContent = `- DÉSACTIVÉ, utilise maintenant le bouton intégré */
            .simple-connect-floating-btn {
                display: none !important
                box-shadow: 0 2px 8px rgba(255, 20, 147, 0.4);
            }
            
            /* Modal simplifiée */
            .quick-connect-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                z-index: 10001;
                justify-content: center;
                align-items: center;
                backdrop-filter: blur(8px);
                padding: 20px;
            }
            
            .quick-connect-content {
                background: white;
                border-radius: 24px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                padding: 30px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: quickSlideIn 0.3s ease;
                position: relative;
            }
            
            @keyframes quickSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-30px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .quick-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(0, 0, 0, 0.1);
                border: none;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .quick-close:hover {
                background: rgba(0, 0, 0, 0.2);
                transform: rotate(90deg);
            }
            
            .quick-section {
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                padding: 20px;
                border-radius: 16px;
                margin-bottom: 20px;
                position: relative;
            }
            
            .quick-step-number {
                position: absolute;
                top: -12px;
                left: 15px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
            }
            
            .quick-section h3 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 18px;
            }
            
            .quick-help {
                color: #666;
                font-size: 13px;
                margin: 0 0 15px 0;
            }
            
            .quick-code-box {
                background: white;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                transition: all 0.3s;
                border: 2px solid #667eea;
            }
            
            .quick-code-text {
                font-family: monospace;
                font-size: 16px;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 12px;
                word-break: break-all;
            }
            
            .quick-code-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
            }
            
            .quick-code-btn {
                flex: 1;
                padding: 10px 15px;
                border: none;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .quick-code-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            .quick-code-btn:active {
                transform: translateY(0);
            }
            
            .quick-input-group {
                display: flex;
                gap: 10px;
            }
            
            .quick-input {
                flex: 1;
                padding: 12px;
                border: 2px solid #ddd;
                border-radius: 10px;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .quick-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .quick-add-btn, .quick-join-btn, .quick-create-btn {
                padding: 12px 20px;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .quick-create-btn {
                width: 100%;
                margin-top: 10px;
                background: linear-gradient(135deg, #667eea, #764ba2);
            }
            
            .quick-add-btn:hover, .quick-join-btn:hover, .quick-create-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
            }
            
            .quick-create-btn:hover {
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            .quick-message {
                display: none;
                padding: 10px;
                border-radius: 8px;
                margin-top: 10px;
                font-size: 13px;
            }
            
            .quick-message.success {
                background: #d4edda;
                color: #155724;
            }
            
            .quick-message.error {
                background: #f8d7da;
                color: #721c24;
            }
            
            .quick-friends-list {
                max-height: 250px;
                overflow-y: auto;
            }
            
            .quick-friend-card {
                background: white;
                padding: 12px;
                border-radius: 10px;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s;
            }
            
            .quick-friend-card:hover {
                transform: translateX(5px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .quick-friend-card.online {
                border-left: 4px solid #4CAF50;
            }
            
            .quick-friend-info {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .quick-friend-status {
                font-size: 14px;
            }
            
            .quick-friend-name {
                font-weight: 600;
                color: #333;
            }
            
            .quick-friend-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            .quick-play-btn {
                padding: 6px 12px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .quick-play-btn:hover {
                transform: scale(1.05);
            }
            
            .quick-remove-btn {
                padding: 6px 10px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .quick-remove-btn:hover {
                background: #d32f2f;
            }
            
            @media (max-width: 768px) {
                .quick-connect-content {
                    padding: 20px;
                    margin: 10px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialiser
window.simpleConnect = new SimpleConnect();

console.log('✨ Système de connexion ultra-simplifié chargé');
