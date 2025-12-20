// Gestion des tabs Lobby Public / Ma Salle dans le sidebar
class LobbyTabsManager {
    constructor() {
        this.currentView = 'lobby'; // 'lobby' ou 'room'
        this.updateInterval = null;
        this.init();
    }
    
    init() {
        console.log('📑 Lobby Tabs Manager initialisé');
        this.setupEventListeners();
        this.setupPresenceListeners();
        this.setupConnectButton();
        
        // Affichage initial statique
        // Mise à jour uniquement au changement de tab ou d'événements
        this.renderLobbyView();
    }
    
    setupConnectButton() {
        const connectBtn = document.getElementById('connectLobbyBtn');
        if (connectBtn) {
            connectBtn.addEventListener('click', async () => {
                console.log('🔌 Tentative de connexion manuelle au lobby...');
                connectBtn.textContent = '⏳ Connexion...';
                connectBtn.disabled = true;
                
                // Initialiser simpleChatSystem si pas fait
                if (!window.simpleChatSystem?.peer?.id) {
                    console.log('🎯 Initialisation P2P...');
                    window.simpleChatSystem?.initP2P();
                    
                    // Attendre que le peer soit prêt
                    let attempts = 0;
                    while (!window.simpleChatSystem?.peer?.id && attempts < 50) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        attempts++;
                    }
                }
                
                // Initialiser le lobby Realtime
                if (!window.realtimeLobbySystem?.isInitialized) {
                    await window.realtimeLobbySystem.init();
                }
                
                // Cacher le bouton
                connectBtn.classList.add('hidden');
                this.renderLobbyView();
            });
        }
    }
    
    setupPresenceListeners() {
        // Écouter les changements de présence du système Realtime
        window.addEventListener('presence_updated', () => {
            if (this.currentView === 'lobby') {
                this.renderLobbyView();
            }
        });
        
        // Écouter les changements de présence du système P2P
        window.addEventListener('room_presence_updated', () => {
            if (this.currentView === 'room') {
                this.renderRoomView();
            }
        });
        
        console.log('🔔 Écouteurs de présence activés');
    }
    
    setupEventListeners() {
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
        const privateRoomActions = document.getElementById('privateRoomActions');
        
        if (view === 'lobby') {
            lobbyTabBtn?.classList.add('active');
            lobbyTabBtn.style.background = 'white';
            lobbyTabBtn.style.color = '#667eea';
            
            roomTabBtn?.classList.remove('active');
            roomTabBtn.style.background = 'transparent';
            roomTabBtn.style.color = '#999';
            
            // Cacher actions salles privées dans lobby public
            if (privateRoomActions) {
                privateRoomActions.style.display = 'none';
            }
            
            this.renderLobbyView();
        } else {
            roomTabBtn?.classList.add('active');
            roomTabBtn.style.background = 'white';
            roomTabBtn.style.color = '#667eea';
            
            lobbyTabBtn?.classList.remove('active');
            lobbyTabBtn.style.background = 'transparent';
            lobbyTabBtn.style.color = '#999';
            
            // Afficher actions salles privées dans "Ma Salle"
            if (privateRoomActions) {
                privateRoomActions.style.display = 'block';
            }
            
            this.renderRoomView();
        }
    }
    
    renderLobbyView() {
        const list = document.getElementById('connectedPlayersList');
        const connectBtn = document.getElementById('connectLobbyBtn');
        if (!list) return;
        
        // Vérifier si le système est initialisé
        const isConnected = window.realtimeLobbySystem?.isInitialized;
        
        // Afficher/cacher le bouton de connexion
        if (connectBtn) {
            if (!isConnected) {
                connectBtn.classList.remove('hidden');
            } else {
                connectBtn.classList.add('hidden');
            }
        }
        
        // Si pas connecté, afficher message
        if (!isConnected) {
            list.innerHTML = `
                <div class="lobby-header" style="padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 10px; text-align: center;">
                    <div style="font-size: 20px; margin-bottom: 5px;">🌍</div>
                    <div style="font-size: 13px; font-weight: 600;">Lobby Public</div>
                    <div style="font-size: 11px; opacity: 0.9;">Non connecté</div>
                </div>
                <div class="empty-room-message">
                    <p>⚡ Connexion requise</p>
                    <p style="font-size: 0.9rem; color: #999;">Cliquez sur "Se connecter" pour rejoindre le lobby</p>
                </div>
            `;
            return;
        }
        
        // Récupérer les joueurs depuis le système Realtime (sans bots)
        const allPlayers = window.realtimeLobbySystem?.getAllPlayers() || [];
        // Filtrer les bots locaux (double sécurité)
        const players = allPlayers.filter(p => !p.peer_id?.startsWith('bot-'));
        const myPeerId = window.simpleChatSystem?.peer?.id;
        
        if (players.length === 0) {
            list.innerHTML = `
                <div class="lobby-header" style="padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 10px; text-align: center;">
                    <div style="font-size: 20px; margin-bottom: 5px;">🌍</div>
                    <div style="font-size: 13px; font-weight: 600;">Lobby Public</div>
                    <div style="font-size: 11px; opacity: 0.9;">Joueurs en ligne</div>
                </div>
                <div class="empty-room-message">
                    <p>🌟 Lobby vide</p>
                    <p style="font-size: 0.9rem; color: #999;">Connectez-vous pour être visible !</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="lobby-header" style="padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 10px; text-align: center;">
                <div style="font-size: 20px; margin-bottom: 5px;">🌍</div>
                <div style="font-size: 13px; font-weight: 600;">Lobby Public (${players.length})</div>
                <div style="font-size: 11px; opacity: 0.9;">Cliquez pour inviter</div>
            </div>
        `;
        
        players.forEach(player => {
            const isSelf = player.peer_id === myPeerId;
            
            // Déterminer le statut et les badges
            let statusEmoji = '🔵'; // Par défaut
            let statusLabel = 'Disponible';
            let statusColor = '#28a745';
            let badges = [];
            
            if (player.status === 'in_room') {
                statusEmoji = '🏠';
                statusLabel = 'En salle';
                statusColor = '#ffc107';
                if (player.room_code) {
                    badges.push(`🔑 ${player.room_code}`);
                }
            } else if (player.status === 'in_game') {
                statusEmoji = '🎮';
                statusLabel = 'En partie';
                statusColor = '#dc3545';
            } else if (player.status === 'available') {
                statusEmoji = player.room_mode === 'auto' ? '🟢' : '🔵';
                statusLabel = player.room_mode === 'auto' ? 'Dispo auto' : 'Disponible';
                statusColor = player.room_mode === 'auto' ? '#28a745' : '#17a2b8';
            }
            
            const badgesHtml = badges.length > 0 ? 
                `<span style="font-size: 10px; background: rgba(102, 126, 234, 0.1); color: #667eea; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">${badges.join(' ')}</span>` : '';
            
            html += `
                <div class="player-item ${isSelf ? 'self' : ''}" data-peer-id="${player.peer_id}" 
                     style="padding: 12px; margin-bottom: 8px; background: ${isSelf ? 'linear-gradient(135deg, #fff5f9 0%, #ffe5f5 100%)' : 'white'}; 
                            border-radius: 10px; cursor: ${isSelf ? 'default' : 'pointer'}; border: 2px solid ${isSelf ? '#ff69b4' : '#e9ecef'}; 
                            transition: all 0.3s;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="font-size: 24px;">${statusEmoji}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #333; font-size: 14px;">
                                ${player.username}${isSelf ? ' (Vous)' : ''}
                            </div>
                            <div style="font-size: 11px; color: ${statusColor}; font-weight: 600;">
                                ${statusLabel}${badgesHtml}
                            </div>
                        </div>
                        ${!isSelf && player.status === 'available' ? `
                            <button class="invite-btn" onclick="window.realtimeLobbyUI.invitePlayer('${player.peer_id}')" 
                                    style="padding: 6px 12px; background: #667eea; color: white; border: none; 
                                           border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                                📨 Inviter
                            </button>
                        ` : !isSelf ? `
                            <span style="padding: 6px 12px; background: #e9ecef; color: #999; 
                                         border-radius: 6px; font-size: 12px; font-weight: 600;">
                                Occupé
                            </span>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        list.innerHTML = html;
    }
    
    renderRoomView() {
        const list = document.getElementById('connectedPlayersList');
        if (!list) return;
        
        // Récupérer les joueurs de la salle privée depuis presence-system (sans bots)
        const allRoomPlayers = window.presenceSystem ? 
            Array.from(window.presenceSystem.onlinePlayers.values()) : [];
        // Filtrer les bots locaux (bot-unisona, etc.)
        const roomPlayers = allRoomPlayers.filter(p => !p.peerId?.startsWith('bot-'));
        
        if (roomPlayers.length === 0) {
            list.innerHTML = `
                <div class="lobby-header" style="padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 10px; text-align: center;">
                    <div style="font-size: 20px; margin-bottom: 5px;">🔒</div>
                    <div style="font-size: 13px; font-weight: 600;">Ma Salle Privée</div>
                    <div style="font-size: 11px; opacity: 0.9;">Vous seul</div>
                </div>
                <div class="empty-room-message">
                    <p>🏠 Salle privée vide</p>
                    <p style="font-size: 0.9rem; color: #999;">Invitez des joueurs !</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="lobby-header" style="padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 10px; text-align: center;">
                <div style="font-size: 20px; margin-bottom: 5px;">🔒</div>
                <div style="font-size: 13px; font-weight: 600;">Ma Salle Privée (${roomPlayers.length})</div>
                <div style="font-size: 11px; opacity: 0.9;">P2P Direct</div>
            </div>
        `;
        
        roomPlayers.forEach(player => {
            html += `
                <div class="player-item" style="padding: 12px; margin-bottom: 8px; background: white; border-radius: 10px; border: 2px solid #e9ecef;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="font-size: 24px;">${player.isHost ? '👑' : '👤'}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #333; font-size: 14px;">
                                ${player.username}${player.isHost ? ' (Hôte)' : ''}
                            </div>
                            <div style="font-size: 11px; color: #999;">
                                ${player.level ? `Niveau ${player.level}` : 'Connecté'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        list.innerHTML = html;
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.lobbyTabsManager = new LobbyTabsManager();
    console.log('✅ Lobby Tabs Manager prêt');
});
