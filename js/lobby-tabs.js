// Gestion du lobby simplifié (plus de tabs)
class LobbyTabsManager {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('📑 Lobby Manager simplifié initialisé');
        this.setupPresenceListeners();
        
        // Affichage initial
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
            this.renderLobbyView();
        });
        
        // Forcer le rafraîchissement toutes les 3s pour garantir visibilité
        setInterval(() => {
            const list = document.getElementById('connectedPlayersList');
            // Vérifier si le lobby a été écrasé
            if (list && (!list.innerHTML || list.innerHTML.includes('Contenu généré'))) {
                console.log('🔄 Restauration affichage lobby...');
                this.renderLobbyView();
            }
        }, 3000);
        
        console.log('🔔 Écouteurs de présence activés');
    }
    
    renderLobbyView() {
        const list = document.getElementById('connectedPlayersList');
        const connectBtn = document.getElementById('connectLobbyBtn');
        if (!list) return;
        
        // Vérifier si le système est initialisé
        const isConnected = window.realtimeLobbySystem?.isInitialized;
        
        // Si pas connecté, tenter l'initialisation automatique
        if (!isConnected && window.realtimeLobbySystem && !this._autoInitAttempted) {
            console.log('🔄 Tentative auto-init du lobby...');
            this._autoInitAttempted = true;
            window.realtimeLobbySystem.init().then(() => {
                console.log('✅ Auto-init lobby réussi');
                this.renderLobbyView(); // Re-render après init
            }).catch(err => {
                console.error('❌ Auto-init lobby échoué:', err);
            });
        }
        
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
                <div class="empty-room-message" style="text-align: center; padding: 20px; color: #999;">
                    <p style="font-size: 24px; margin-bottom: 10px;">🌟</p>
                    <p style="font-weight: 600;">Aucun joueur en ligne</p>
                    <p style="font-size: 0.9rem;">Soyez le premier connecté !</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
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
            
            const clickHandler = !isSelf && player.status === 'available' ? `onclick="window.realtimeLobbyUI.invitePlayer('${player.peer_id}')"` : '';
            const hoverStyle = !isSelf && player.status === 'available' ? 'box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transform: translateY(-2px);' : '';
            
            html += `
                <div class="player-item ${isSelf ? 'self' : ''}" data-peer-id="${player.peer_id}" 
                     ${clickHandler}
                     style="padding: 12px; margin-bottom: 8px; background: ${isSelf ? 'linear-gradient(135deg, #fff5f9 0%, #ffe5f5 100%)' : 'white'}; 
                            border-radius: 10px; cursor: ${isSelf ? 'default' : player.status === 'available' ? 'pointer' : 'not-allowed'}; 
                            border: 2px solid ${isSelf ? '#ff69b4' : player.status === 'available' ? '#667eea' : '#e9ecef'}; 
                            transition: all 0.3s;"
                     onmouseover="this.style.cssText = this.style.cssText + '${hoverStyle}'" 
                     onmouseout="this.style.cssText = this.style.cssText.replace('${hoverStyle}', '')">
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
                            <div style="font-size: 20px; opacity: 0.7;">👆</div>
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
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.lobbyTabsManager = new LobbyTabsManager();
    console.log('✅ Lobby Manager simplifié prêt');
});
