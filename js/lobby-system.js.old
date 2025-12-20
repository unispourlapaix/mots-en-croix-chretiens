// Système de Lobby Public + Salles Privées
class LobbySystem {
    constructor() {
        this.lobbyPlayers = new Map(); // peerId -> {username, status, timestamp}
        this.myStatus = 'available'; // available, in-game, busy
        this.updateInterval = null;
        this.currentView = 'lobby'; // 'lobby' ou 'room'
        
        this.init();
    }
    
    init() {
        console.log('🌍 Lobby System initialisé');
        
        // Écouter les événements d'authentification
        if (typeof authSystem !== 'undefined') {
            authSystem.onAuthChange((user) => {
                if (user) {
                    this.joinLobby(user.username);
                } else {
                    this.leaveLobby();
                }
            });
        }
        
        // Setup UI
        this.setupUI();
        
        // Mise à jour périodique
        this.updateInterval = setInterval(() => this.updateLobby(), 5000);
    }
    
    setupUI() {
        // Tabs
        const lobbyTabBtn = document.getElementById('lobbyTabBtn');
        const roomTabBtn = document.getElementById('roomTabBtn');
        
        if (lobbyTabBtn) {
            lobbyTabBtn.addEventListener('click', () => this.switchView('lobby'));
        }
        
        if (roomTabBtn) {
            roomTabBtn.addEventListener('click', () => this.switchView('room'));
        }
    }
    
    switchView(view) {
        this.currentView = view;
        
        const lobbyTabBtn = document.getElementById('lobbyTabBtn');
        const roomTabBtn = document.getElementById('roomTabBtn');
        const createRoomBtn = document.getElementById('createRoomBtn');
        const joinRoomGroup = document.querySelector('.join-room-group');
        
        if (view === 'lobby') {
            lobbyTabBtn?.classList.add('active');
            lobbyTabBtn.style.background = 'white';
            lobbyTabBtn.style.color = '#667eea';
            
            roomTabBtn?.classList.remove('active');
            roomTabBtn.style.background = 'transparent';
            roomTabBtn.style.color = '#999';
            
            // Cacher les boutons de salle privée
            if (createRoomBtn) createRoomBtn.style.display = 'none';
            if (joinRoomGroup) joinRoomGroup.style.display = 'none';
            
            this.renderLobby();
        } else {
            roomTabBtn?.classList.add('active');
            roomTabBtn.style.background = 'white';
            roomTabBtn.style.color = '#667eea';
            
            lobbyTabBtn?.classList.remove('active');
            lobbyTabBtn.style.background = 'transparent';
            lobbyTabBtn.style.color = '#999';
            
            // Afficher les boutons de salle privée
            if (createRoomBtn) createRoomBtn.style.display = 'block';
            if (joinRoomGroup) joinRoomGroup.style.display = 'flex';
            
            this.renderRoom();
        }
    }
    
    async joinLobby(username) {
        if (!window.simpleChatSystem?.peer?.id) {
            console.log('⏳ En attente de PeerJS pour rejoindre le lobby...');
            
            // Initialiser P2P si nécessaire
            if (!window.simpleChatSystem?.peer) {
                window.simpleChatSystem?.initP2P();
            }
            
            // Attendre que peer soit prêt
            let attempts = 0;
            while (!window.simpleChatSystem?.peer?.id && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        }
        
        const myPeerId = window.simpleChatSystem?.peer?.id;
        if (!myPeerId) {
            console.error('❌ Impossible de rejoindre le lobby sans peer ID');
            return;
        }
        
        // S'ajouter au lobby
        this.lobbyPlayers.set(myPeerId, {
            peerId: myPeerId,
            username: username,
            status: 'available',
            timestamp: Date.now(),
            isSelf: true
        });
        
        // Enregistrer dans localStorage pour sync
        this.saveLobbyToStorage();
        
        // Broadcast via BroadcastChannel
        this.broadcastLobbyUpdate();
        
        console.log('✅ Rejoint le lobby:', username);
        
        // Mettre à jour l'affichage
        this.renderLobby();
    }
    
    leaveLobby() {
        const myPeerId = window.simpleChatSystem?.peer?.id;
        if (myPeerId) {
            this.lobbyPlayers.delete(myPeerId);
            this.saveLobbyToStorage();
            this.broadcastLobbyUpdate();
        }
    }
    
    updateStatus(status) {
        const myPeerId = window.simpleChatSystem?.peer?.id;
        if (!myPeerId) return;
        
        const player = this.lobbyPlayers.get(myPeerId);
        if (player) {
            player.status = status;
            player.timestamp = Date.now();
            this.saveLobbyToStorage();
            this.broadcastLobbyUpdate();
            this.renderLobby();
        }
    }
    
    updateLobby() {
        // Sync depuis localStorage
        this.syncFromStorage();
        
        // Nettoyer les joueurs inactifs (> 30 secondes)
        const now = Date.now();
        for (const [peerId, player] of this.lobbyPlayers) {
            if (!player.isSelf && now - player.timestamp > 30000) {
                this.lobbyPlayers.delete(peerId);
            }
        }
        
        this.renderLobby();
    }
    
    saveLobbyToStorage() {
        const lobbyData = Array.from(this.lobbyPlayers.values());
        localStorage.setItem('lobby_players', JSON.stringify(lobbyData));
    }
    
    syncFromStorage() {
        try {
            const data = localStorage.getItem('lobby_players');
            if (!data) return;
            
            const players = JSON.parse(data);
            const myPeerId = window.simpleChatSystem?.peer?.id;
            
            for (const player of players) {
                // Ne pas écraser notre propre entrée
                if (player.peerId === myPeerId) continue;
                
                // Ajouter/mettre à jour
                if (!this.lobbyPlayers.has(player.peerId)) {
                    this.lobbyPlayers.set(player.peerId, {
                        ...player,
                        isSelf: false
                    });
                }
            }
        } catch (err) {
            console.error('Erreur sync lobby:', err);
        }
    }
    
    broadcastLobbyUpdate() {
        try {
            const bc = new BroadcastChannel('crossword_lobby');
            bc.postMessage({
                type: 'lobby_update',
                players: Array.from(this.lobbyPlayers.values())
            });
            bc.close();
        } catch (err) {
            console.warn('BroadcastChannel non supporté');
        }
    }
    
    renderLobby() {
        if (this.currentView !== 'lobby') return;
        
        const list = document.getElementById('connectedPlayersList');
        if (!list) return;
        
        const players = Array.from(this.lobbyPlayers.values());
        const myPeerId = window.simpleChatSystem?.peer?.id;
        
        if (players.length === 0) {
            list.innerHTML = `
                <div class="lobby-header" style="padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 10px; text-align: center;">
                    <div style="font-size: 20px; margin-bottom: 5px;">👥</div>
                    <div style="font-size: 13px; font-weight: 600;">Lobby Public</div>
                    <div style="font-size: 11px; opacity: 0.9;">Cliquez pour inviter</div>
                </div>
                <div class="empty-room-message">
                    <p>🌟 Lobby vide</p>
                    <p style="font-size: 0.9rem; color: #999;">Connectez-vous pour être visible !</p>
                </div>
            `;
            return;
        }
        
        const statusEmoji = {
            'available': '🟢',
            'in-game': '🎮',
            'busy': '🔴'
        };
        
        const statusLabel = {
            'available': 'Disponible',
            'in-game': 'En partie',
            'busy': 'Occupé'
        };
        
        let html = `
            <div class="lobby-header" style="padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 10px; text-align: center;">
                <div style="font-size: 20px; margin-bottom: 5px;">👥</div>
                <div style="font-size: 13px; font-weight: 600;">Lobby Public (${players.length})</div>
                <div style="font-size: 11px; opacity: 0.9;">Cliquez pour inviter</div>
            </div>
        `;
        
        players.forEach(player => {
            const isSelf = player.peerId === myPeerId;
            const emoji = statusEmoji[player.status] || '⚪';
            const label = statusLabel[player.status] || 'Hors ligne';
            
            html += `
                <div class="player-item ${isSelf ? 'self' : ''}" data-peer-id="${player.peerId}" 
                     style="padding: 12px; margin-bottom: 8px; background: ${isSelf ? 'linear-gradient(135deg, #fff5f9 0%, #ffe5f5 100%)' : 'white'}; 
                            border-radius: 10px; cursor: ${isSelf ? 'default' : 'pointer'}; border: 2px solid ${isSelf ? '#ff69b4' : '#e9ecef'}; 
                            transition: all 0.3s;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="font-size: 24px;">${emoji}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #333; font-size: 14px;">
                                ${player.username}${isSelf ? ' (Vous)' : ''}
                            </div>
                            <div style="font-size: 11px; color: #999;">
                                ${label}
                            </div>
                        </div>
                        ${!isSelf ? `
                            <button class="invite-btn" onclick="window.lobbySystem.invitePlayer('${player.peerId}')" 
                                    style="padding: 6px 12px; background: #667eea; color: white; border: none; 
                                           border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                                📨 Inviter
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        list.innerHTML = html;
    }
    
    renderRoom() {
        if (this.currentView !== 'room') return;
        
        const list = document.getElementById('connectedPlayersList');
        if (!list) return;
        
        // Afficher les joueurs de la salle privée (via presence-system)
        if (window.presenceSystem) {
            const roomPlayers = Array.from(window.presenceSystem.onlinePlayers.values());
            
            if (roomPlayers.length === 0) {
                list.innerHTML = `
                    <div class="empty-room-message">
                        <p>🔒 Salle privée vide</p>
                        <p style="font-size: 0.9rem; color: #999;">Créez ou rejoignez une salle !</p>
                    </div>
                `;
                return;
            }
            
            let html = '<div style="padding: 10px 0;">';
            
            roomPlayers.forEach(player => {
                html += `
                    <div class="player-item" style="padding: 12px; margin-bottom: 8px; background: white; border-radius: 10px; border: 2px solid #e9ecef;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="font-size: 24px;">${player.isHost ? '👑' : '👤'}</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: #333; font-size: 14px;">
                                    ${player.username}${player.isHost ? ' (Hôte)' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            list.innerHTML = html;
        }
    }
    
    async invitePlayer(peerId) {
        const player = this.lobbyPlayers.get(peerId);
        if (!player) {
            console.error('Joueur introuvable');
            return;
        }
        
        console.log('📨 Invitation de:', player.username);
        
        // Créer une connexion P2P directe
        if (!window.simpleChatSystem?.peer) {
            alert('Erreur: P2P non initialisé');
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
                console.error('Erreur invitation:', err);
                alert('❌ Impossible d\'envoyer l\'invitation');
            });
        } catch (err) {
            console.error('Erreur:', err);
            alert('❌ Erreur lors de l\'invitation');
        }
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.lobbySystem = new LobbySystem();
});
