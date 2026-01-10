/**
 * Interface utilisateur pour le système d'amis
 * Gestion de l'ajout/suppression d'amis et affichage du code personnel
 */

class FriendsUI {
    constructor() {
        this.isModalOpen = false;
        this.init();
        
        // Écouter les mises à jour de la liste d'amis
        window.addEventListener('friendsListUpdated', () => {
            this.refreshFriendsList();
        });
        
        console.log('🎨 Interface amis initialisée');
    }
    
    init() {
        // Ajouter le bouton d'ouverture du gestionnaire d'amis dans le chat
        this.addFriendsButton();
        
        // Créer la modal de gestion des amis
        this.createFriendsModal();
    }
    
    // Ajouter le bouton dans l'interface
    addFriendsButton() {
        // Désactivé - Remplacé par simple-connect.js (bouton flottant simplifié)
        return;
    }
    
    /* Code original conservé pour référence - DÉSACTIVÉ
    _addFriendsButtonOriginal() {
        // Attendre que le DOM soit prêt
        const checkAndAdd = () => {
            const chatHeader = document.querySelector('#chat-tabs') || 
                              document.querySelector('.chat-header') ||
                              document.querySelector('#lobby-container');
            
            if (chatHeader && !document.getElementById('friends-button')) {
                const button = document.createElement('button');
                button.id = 'friends-button';
                button.className = 'friends-btn';
                button.innerHTML = '👥 Amis <span id="friends-count" class="friends-count">0</span>';
                button.title = 'Gérer mes amis';
                button.onclick = () => this.openFriendsModal();
                
                // Insérer au début du header
                chatHeader.insertBefore(button, chatHeader.firstChild);
                
                // Mettre à jour le compteur
                this.updateFriendsCount();
                
                console.log('✅ Bouton amis ajouté');
            } else if (!chatHeader) {
                setTimeout(checkAndAdd, 500);
            }
        };
        
        checkAndAdd();
    }
    */
    
    // Créer la modal de gestion des amis
    createFriendsModal() {
        const modal = document.createElement('div');
        modal.id = 'friends-modal';
        modal.className = 'friends-modal';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="friends-modal-content">
                <div class="friends-modal-header">
                    <h2>👥 Mes Amis</h2>
                    <button class="friends-close" onclick="window.friendsUI?.closeFriendsModal()">✕</button>
                </div>
                
                <div class="friends-modal-body">
                    <!-- Mon code d'ami -->
                    <div class="my-friend-code-section">
                        <h3>🔑 Mon Code d'Ami</h3>
                        <p class="info-text">Partagez ce code avec vos amis pour qu'ils puissent vous ajouter :</p>
                        <div class="code-display">
                            <input type="text" id="my-friend-code-input" readonly>
                            <button class="copy-code-btn" onclick="window.friendsUI?.copyMyCode()">📋 Copier</button>
                        </div>
                        <p class="info-subtext">🔒 Seuls vos amis ajoutés peuvent vous voir en ligne</p>
                    </div>
                    
                    <!-- Ajouter un ami -->
                    <div class="add-friend-section">
                        <h3>➕ Ajouter un Ami</h3>
                        <div class="add-friend-form">
                            <input type="text" id="friend-code-input" placeholder="Entrez le code d'ami...">
                            <button class="add-friend-btn" onclick="window.friendsUI?.addFriendFromInput()">Ajouter</button>
                        </div>
                        <div id="add-friend-message" class="message-box"></div>
                    </div>
                    
                    <!-- Liste des amis -->
                    <div class="friends-list-section">
                        <h3>📋 Liste d'Amis (<span id="friends-list-count">0</span>)</h3>
                        <div id="friends-list-container" class="friends-list">
                            <!-- Liste dynamique -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Ajouter les styles
        this.addStyles();
    }
    
    // Ouvrir la modal
    openFriendsModal() {
        const modal = document.getElementById('friends-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.isModalOpen = true;
            
            // Remplir mon code d'ami
            this.displayMyCode();
            
            // Rafraîchir la liste
            this.refreshFriendsList();
        }
    }
    
    // Fermer la modal
    closeFriendsModal() {
        const modal = document.getElementById('friends-modal');
        if (modal) {
            modal.style.display = 'none';
            this.isModalOpen = false;
        }
    }
    
    // Afficher mon code d'ami
    displayMyCode() {
        const input = document.getElementById('my-friend-code-input');
        if (input && window.friendsSystem?.myFriendCode) {
            input.value = window.friendsSystem.myFriendCode;
        }
    }
    
    // Copier mon code
    copyMyCode() {
        const input = document.getElementById('my-friend-code-input');
        if (input) {
            input.select();
            document.execCommand('copy');
            
            // Feedback visuel
            const btn = document.querySelector('.copy-code-btn');
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '✅ Copié !';
                btn.style.background = '#4CAF50';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 2000);
            }
        }
    }
    
    // Ajouter un ami depuis l'input
    addFriendFromInput() {
        const input = document.getElementById('friend-code-input');
        const messageBox = document.getElementById('add-friend-message');
        
        if (!input || !messageBox) return;
        
        const friendCode = input.value.trim();
        
        if (!friendCode) {
            this.showMessage(messageBox, '⚠️ Veuillez entrer un code d\'ami', 'error');
            return;
        }
        
        const result = window.friendsSystem?.addFriend(friendCode);
        
        if (result?.success) {
            this.showMessage(messageBox, '✅ ' + result.message, 'success');
            input.value = '';
            this.refreshFriendsList();
            this.updateFriendsCount();
            
            // Forcer une mise à jour du lobby
            if (window.realtimeLobbySystem) {
                window.realtimeLobbySystem.syncPresence();
            }
        } else {
            this.showMessage(messageBox, '❌ ' + result?.message, 'error');
        }
    }
    
    // Supprimer un ami
    removeFriend(friendCode) {
        if (!confirm('Voulez-vous vraiment retirer cet ami ?')) return;
        
        const result = window.friendsSystem?.removeFriend(friendCode);
        
        if (result?.success) {
            this.refreshFriendsList();
            this.updateFriendsCount();
            
            // Forcer une mise à jour du lobby
            if (window.realtimeLobbySystem) {
                window.realtimeLobbySystem.syncPresence();
            }
        }
    }
    
    // Rafraîchir la liste d'amis
    refreshFriendsList() {
        const container = document.getElementById('friends-list-container');
        const countSpan = document.getElementById('friends-list-count');
        
        if (!container || !window.friendsSystem) return;
        
        const friends = window.friendsSystem.getFriendsList();
        
        // Mettre à jour le compteur
        if (countSpan) {
            countSpan.textContent = friends.length;
        }
        
        // Vider le container
        container.innerHTML = '';
        
        if (friends.length === 0) {
            container.innerHTML = '<p class="no-friends">Aucun ami ajouté. Ajoutez des amis pour jouer ensemble !</p>';
            return;
        }
        
        // Afficher chaque ami
        friends.forEach(friendCode => {
            const friendData = window.friendsSystem.getFriendData(friendCode);
            const friendItem = document.createElement('div');
            friendItem.className = 'friend-item';
            
            const isOnline = window.realtimeLobbySystem?.onlinePlayers.has(friendCode);
            const status = isOnline ? '🟢' : '⚫';
            const statusText = isOnline ? 'En ligne' : 'Hors ligne';
            
            friendItem.innerHTML = `
                <div class="friend-info">
                    <span class="friend-status" title="${statusText}">${status}</span>
                    <span class="friend-name">${friendData?.username || 'Ami'}</span>
                    <span class="friend-code">${friendCode.substring(0, 8)}...</span>
                </div>
                <button class="remove-friend-btn" onclick="window.friendsUI?.removeFriend('${friendCode}')">🗑️</button>
            `;
            
            container.appendChild(friendItem);
        });
    }
    
    // Mettre à jour le compteur d'amis
    updateFriendsCount() {
        const badge = document.getElementById('friends-count');
        if (badge && window.friendsSystem) {
            const count = window.friendsSystem.getFriendsCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        }
    }
    
    // Afficher un message temporaire
    showMessage(element, message, type) {
        element.textContent = message;
        element.className = `message-box ${type}`;
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 4000);
    }
    
    // Ajouter les styles CSS
    addStyles() {
        if (document.getElementById('friends-ui-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'friends-ui-styles';
        style.textContent = `
            .friends-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 10px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            
            .friends-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            }
            
            .friends-count {
                background: rgba(255,255,255,0.3);
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
            }
            
            .friends-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 10000;
                justify-content: center;
                align-items: center;
                backdrop-filter: blur(5px);
            }
            
            .friends-modal-content {
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                border-radius: 20px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.3s ease;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .friends-modal-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 20px 20px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .friends-modal-header h2 {
                margin: 0;
                font-size: 24px;
            }
            
            .friends-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                font-size: 24px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .friends-close:hover {
                background: rgba(255,255,255,0.3);
                transform: rotate(90deg);
            }
            
            .friends-modal-body {
                padding: 20px;
            }
            
            .my-friend-code-section,
            .add-friend-section,
            .friends-list-section {
                background: white;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            
            .my-friend-code-section h3,
            .add-friend-section h3,
            .friends-list-section h3 {
                margin-top: 0;
                color: #667eea;
                font-size: 18px;
            }
            
            .info-text {
                color: #666;
                font-size: 14px;
                margin-bottom: 10px;
            }
            
            .info-subtext {
                color: #999;
                font-size: 12px;
                margin-top: 10px;
                font-style: italic;
            }
            
            .code-display {
                display: flex;
                gap: 10px;
            }
            
            #my-friend-code-input {
                flex: 1;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                font-family: monospace;
                font-size: 14px;
                background: #f9f9f9;
            }
            
            .copy-code-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
            }
            
            .copy-code-btn:hover {
                background: #5568d3;
                transform: scale(1.05);
            }
            
            .add-friend-form {
                display: flex;
                gap: 10px;
            }
            
            #friend-code-input {
                flex: 1;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                font-size: 14px;
            }
            
            .add-friend-btn {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
            }
            
            .add-friend-btn:hover {
                background: #45a049;
                transform: scale(1.05);
            }
            
            .message-box {
                display: none;
                padding: 12px;
                border-radius: 10px;
                margin-top: 10px;
                font-size: 14px;
            }
            
            .message-box.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .message-box.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .friends-list {
                max-height: 300px;
                overflow-y: auto;
            }
            
            .friend-item {
                background: #f9f9f9;
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s;
            }
            
            .friend-item:hover {
                background: #f0f0f0;
                transform: translateX(5px);
            }
            
            .friend-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .friend-status {
                font-size: 16px;
            }
            
            .friend-name {
                font-weight: 600;
                color: #333;
            }
            
            .friend-code {
                font-family: monospace;
                color: #999;
                font-size: 12px;
            }
            
            .remove-friend-btn {
                background: #f44336;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .remove-friend-btn:hover {
                background: #da190b;
                transform: scale(1.1);
            }
            
            .no-friends {
                text-align: center;
                color: #999;
                padding: 40px 20px;
                font-style: italic;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialiser l'UI quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.friendsUI = new FriendsUI();
    });
} else {
    window.friendsUI = new FriendsUI();
}

console.log('🎨 Interface de gestion d\'amis chargée');
