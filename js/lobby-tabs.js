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
        
        // Mise à jour périodique de l'affichage
        this.updateInterval = setInterval(() => this.updateCurrentView(), 3000);
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
        
        if (view === 'lobby') {
            lobbyTabBtn?.classList.add('active');
            lobbyTabBtn.style.background = 'white';
            lobbyTabBtn.style.color = '#667eea';
            
            roomTabBtn?.classList.remove('active');
            roomTabBtn.style.background = 'transparent';
            roomTabBtn.style.color = '#999';
            
            this.renderLobbyView();
        } else {
            roomTabBtn?.classList.add('active');
            roomTabBtn.style.background = 'white';
            roomTabBtn.style.color = '#667eea';
            
            lobbyTabBtn?.classList.remove('active');
            lobbyTabBtn.style.background = 'transparent';
            lobbyTabBtn.style.color = '#999';
            
            this.renderRoomView();
        }
    }
    
    updateCurrentView() {
        if (this.currentView === 'lobby') {
            this.renderLobbyView();
        } else {
            this.renderRoomView();
        }
    }
    
    renderLobbyView() {
        const list = document.getElementById('connectedPlayersList');
        if (!list) return;
        
        // Récupérer les joueurs depuis le système Realtime
        const players = window.realtimeLobbySystem?.getAllPlayers() || [];
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
            const statusEmoji = player.room_mode === 'auto' ? '🟢' : '🔵';
            const statusLabel = player.room_mode === 'auto' ? 'Disponible' : 'Manuel';
            
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
                            <div style="font-size: 11px; color: #999;">
                                ${statusLabel}${player.room_code ? ' • 🏠 En salle' : ''}
                            </div>
                        </div>
                        ${!isSelf ? `
                            <button class="invite-btn" onclick="window.realtimeLobbyUI.invitePlayer('${player.peer_id}')" 
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
    
    renderRoomView() {
        const list = document.getElementById('connectedPlayersList');
        if (!list) return;
        
        // Récupérer les joueurs de la salle privée depuis presence-system
        const roomPlayers = window.presenceSystem ? 
            Array.from(window.presenceSystem.onlinePlayers.values()) : [];
        
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
