// UI du Lobby Realtime - Liste des joueurs en ligne
class RealtimeLobbyUI {
    constructor() {
        this.container = null;
        this.isVisible = false;
    }

    // Créer l'interface du lobby
    createUI() {
        // Vérifier si déjà créé
        if (document.getElementById('realtimeLobbyContainer')) {
            return;
        }

        const container = document.createElement('div');
        container.id = 'realtimeLobbyContainer';
        container.innerHTML = `
            <div class="realtime-lobby-panel">
                <div class="lobby-header">
                    <h3>🌐 Lobby Public</h3>
                    <button id="closeLobbyBtn" class="lobby-close-btn">✕</button>
                </div>
                
                <div class="lobby-status">
                    <span id="lobbyStatusIcon">⏳</span>
                    <span id="lobbyStatusText">Connexion...</span>
                </div>

                <div class="lobby-stats">
                    <span id="lobbyPlayerCount">0 joueurs en ligne</span>
                </div>

                <div class="lobby-players-list" id="lobbyPlayersList">
                    <!-- Liste dynamique -->
                </div>

                <div class="lobby-footer">
                    <button id="refreshLobbyBtn" class="lobby-btn">🔄 Actualiser</button>
                    <button id="createRoomLobbyBtn" class="lobby-btn lobby-btn-primary">🏠 Créer une Salle</button>
                </div>
            </div>
        `;

        // Ajouter au DOM
        document.body.appendChild(container);
        this.container = container;

        // Styles
        this.addStyles();

        // Event listeners
        this.setupEventListeners();

        console.log('✅ Interface Lobby Realtime créée');
    }

    // Ajouter les styles CSS
    addStyles() {
        if (document.getElementById('realtimeLobbyStyles')) return;

        const style = document.createElement('style');
        style.id = 'realtimeLobbyStyles';
        style.textContent = `
            #realtimeLobbyContainer {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9998;
                display: none;
            }

            #realtimeLobbyContainer.visible {
                display: block;
            }

            .realtime-lobby-panel {
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                width: 350px;
                max-height: 600px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .lobby-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .lobby-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }

            .lobby-close-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .lobby-close-btn:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }

            .lobby-status {
                padding: 12px 20px;
                background: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }

            .lobby-status.connected {
                background: #d4edda;
                color: #155724;
            }

            .lobby-status.disconnected {
                background: #f8d7da;
                color: #721c24;
            }

            .lobby-stats {
                padding: 12px 20px;
                background: #fff;
                border-bottom: 1px solid #e9ecef;
                font-size: 13px;
                color: #6c757d;
                font-weight: 500;
            }

            .lobby-players-list {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
                min-height: 200px;
                max-height: 400px;
            }

            .lobby-player-card {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 12px;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.2s;
                cursor: pointer;
            }

            .lobby-player-card:hover {
                background: #e9ecef;
                transform: translateX(4px);
            }

            .lobby-player-avatar {
                font-size: 32px;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                border-radius: 50%;
            }

            .lobby-player-info {
                flex: 1;
            }

            .lobby-player-name {
                font-weight: 600;
                font-size: 14px;
                color: #212529;
                margin-bottom: 4px;
            }

            .lobby-player-status {
                font-size: 12px;
                color: #6c757d;
            }

            .lobby-player-room {
                background: #667eea;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
            }

            .lobby-player-actions {
                display: flex;
                gap: 4px;
            }

            .lobby-player-action-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .lobby-player-action-btn:hover {
                background: #5568d3;
                transform: scale(1.05);
            }

            .lobby-empty {
                text-align: center;
                padding: 40px 20px;
                color: #6c757d;
            }

            .lobby-empty-icon {
                font-size: 48px;
                margin-bottom: 12px;
            }

            .lobby-footer {
                padding: 12px 20px;
                background: #f8f9fa;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 8px;
            }

            .lobby-btn {
                flex: 1;
                padding: 10px 16px;
                border: 1px solid #dee2e6;
                background: white;
                border-radius: 8px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 500;
            }

            .lobby-btn:hover {
                background: #e9ecef;
            }

            .lobby-btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
            }

            .lobby-btn-primary:hover {
                background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            @media (max-width: 768px) {
                #realtimeLobbyContainer {
                    top: 60px;
                    right: 10px;
                    left: 10px;
                }

                .realtime-lobby-panel {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // Configurer les event listeners
    setupEventListeners() {
        // Bouton fermer
        document.getElementById('closeLobbyBtn')?.addEventListener('click', () => {
            this.hide();
        });

        // Bouton actualiser
        document.getElementById('refreshLobbyBtn')?.addEventListener('click', () => {
            this.refresh();
        });

        // Bouton créer salle
        document.getElementById('createRoomLobbyBtn')?.addEventListener('click', async () => {
            await this.createRoom();
        });

        // S'abonner aux changements de présence
        if (window.realtimeLobbySystem) {
            window.realtimeLobbySystem.onPresenceChange((players) => {
                this.updatePlayersList(players);
            });
        }
    }

    // Afficher le lobby
    show() {
        if (!this.container) {
            this.createUI();
        }

        this.container.classList.add('visible');
        this.isVisible = true;
        this.updateStatus();
        this.refresh();
    }

    // Masquer le lobby
    hide() {
        if (this.container) {
            this.container.classList.remove('visible');
            this.isVisible = false;
        }
    }

    // Basculer visibilité
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    // Mettre à jour le statut
    updateStatus() {
        const statusIcon = document.getElementById('lobbyStatusIcon');
        const statusText = document.getElementById('lobbyStatusText');
        const statusDiv = document.querySelector('.lobby-status');

        if (!window.realtimeLobbySystem?.isInitialized) {
            statusIcon.textContent = '⏳';
            statusText.textContent = 'Connexion...';
            statusDiv.className = 'lobby-status';
        } else {
            statusIcon.textContent = '✅';
            statusText.textContent = 'Connecté au lobby';
            statusDiv.className = 'lobby-status connected';
        }
    }

    // Actualiser la liste
    refresh() {
        if (window.realtimeLobbySystem?.isInitialized) {
            const players = window.realtimeLobbySystem.getAvailablePlayers();
            this.updatePlayersList(players);
        }
    }

    // Mettre à jour la liste des joueurs
    updatePlayersList(players) {
        const listContainer = document.getElementById('lobbyPlayersList');
        const countElement = document.getElementById('lobbyPlayerCount');

        if (!listContainer) return;

        // Mettre à jour le compteur
        countElement.textContent = `${players.length} joueur${players.length > 1 ? 's' : ''} en ligne`;

        // Si aucun joueur
        if (players.length === 0) {
            listContainer.innerHTML = `
                <div class="lobby-empty">
                    <div class="lobby-empty-icon">👻</div>
                    <div>Aucun joueur dans le lobby</div>
                    <div style="font-size: 12px; margin-top: 8px;">Créez une salle pour inviter des amis !</div>
                </div>
            `;
            return;
        }

        // Générer les cartes joueurs
        listContainer.innerHTML = players.map(player => `
            <div class="lobby-player-card" data-peer-id="${player.peer_id}">
                <div class="lobby-player-avatar">${player.avatar || '😊'}</div>
                <div class="lobby-player-info">
                    <div class="lobby-player-name">${player.username}</div>
                    <div class="lobby-player-status">
                        ${player.room_code ? `<span class="lobby-player-room">🏠 ${player.room_code.substring(0, 8)}...</span>` : ''}
                        ${player.room_mode === 'auto' ? '🟢 Auto' : '🔵 Manuel'}
                    </div>
                </div>
                <div class="lobby-player-actions">
                    <button class="lobby-player-action-btn" onclick="window.realtimeLobbyUI.connectToPlayer('${player.peer_id}')">
                        🔗 Rejoindre
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Se connecter à un joueur
    async connectToPlayer(peerId) {
        const player = window.realtimeLobbySystem?.getPlayer(peerId);
        
        if (!player) {
            alert('❌ Joueur introuvable');
            return;
        }

        console.log('🔗 Connexion à', player.username, player.peer_id);

        // Utiliser le RoomSystem existant
        if (window.roomSystem) {
            try {
                await window.roomSystem.joinRoom(peerId);
                this.hide();
            } catch (err) {
                alert(`❌ Erreur: ${err.message}`);
            }
        }
    }

    // Inviter un joueur (envoyer invitation P2P)
    async invitePlayer(peerId) {
        const player = window.realtimeLobbySystem?.getPlayer(peerId);
        
        if (!player) {
            alert('❌ Joueur introuvable');
            return;
        }

        console.log('📨 Invitation de:', player.username);

        // Vérifier que P2P est initialisé
        if (!window.simpleChatSystem?.peer) {
            alert('❌ Erreur: P2P non initialisé');
            return;
        }

        try {
            const conn = window.simpleChatSystem.peer.connect(peerId, {
                reliable: true,
                metadata: {
                    type: 'game_invite',
                    from: window.simpleChatSystem.currentUser
                }
            });

            conn.on('open', () => {
                console.log('✅ Connexion établie avec', player.username);

                // Envoyer l'invitation
                conn.send({
                    type: 'game_invite',
                    from: window.simpleChatSystem.currentUser,
                    message: `${window.simpleChatSystem.currentUser} vous invite à jouer !`
                });

                alert(`✅ Invitation envoyée à ${player.username} !`);
            });

            conn.on('error', (err) => {
                console.error('❌ Erreur invitation:', err);
                alert('❌ Impossible d\'envoyer l\'invitation');
            });
        } catch (err) {
            console.error('❌ Erreur:', err);
            alert('❌ Erreur lors de l\'invitation');
        }
    }

    // Créer une salle
    async createRoom() {
        if (window.roomSystem) {
            await window.roomSystem.createMyRoom();
            this.hide();
        }
    }
}

// Instance globale
window.realtimeLobbyUI = new RealtimeLobbyUI();

// DÉSACTIVÉ : Bouton "🌐 Lobby" en double
// Le lobby est maintenant accessible via le tab "🌍 Lobby Public" dans le chat bubble
// Plus besoin de panneau séparé
/*
setTimeout(() => {
    const chatBubble = document.getElementById('chatBubble');
    if (chatBubble && !document.getElementById('openLobbyBtn')) {
        const btn = document.createElement('button');
        btn.id = 'openLobbyBtn';
        btn.className = 'lobby-open-btn';
        btn.innerHTML = '🌐 Lobby';
        btn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: all 0.2s;
        `;
        btn.addEventListener('click', () => {
            window.realtimeLobbyUI.toggle();
        });
        document.body.appendChild(btn);
    }
}, 2000);
*/

console.log('✅ Realtime Lobby UI chargée (bouton désactivé - utiliser tab dans chat bubble)');
