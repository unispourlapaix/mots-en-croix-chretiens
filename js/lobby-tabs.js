// Gestion du lobby simplifié (plus de tabs)
class LobbyTabsManager {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('📑 Lobby Manager simplifié initialisé');
        this.setupPresenceListeners();
        this.setupStatusButton();
        
        // Affichage initial
        this.renderLobbyView();
    }
    
    setupStatusButton() {
        const btn = document.getElementById('toggleStatusBtn');
        if (!btn) return;
        
        btn.addEventListener('click', async () => {
            // Basculer entre disponible et occupé
            const currentStatus = window.realtimeLobbySystem?.myPresence?.status || 'available';
            const newStatus = currentStatus === 'available' ? 'busy' : 'available';
            
            // Mettre à jour le bouton immédiatement
            if (newStatus === 'busy') {
                btn.style.background = '#6c757d';
                btn.innerHTML = '⭕ Occupé';
            } else {
                btn.style.background = '#28a745';
                btn.innerHTML = '🟢 Disponible';
            }
            
            // Mettre à jour dans Supabase
            if (window.realtimeLobbySystem?.isInitialized) {
                await window.realtimeLobbySystem.updateMyPresence({ status: newStatus });
                console.log('✅ Statut mis à jour:', newStatus);
            }
        });
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
        const filteredPlayers = allPlayers.filter(p => !p.peer_id?.startsWith('bot-'));
        // Limiter à 8 joueurs max
        const players = filteredPlayers.slice(0, 8);
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
            } else if (player.status === 'busy') {
                statusEmoji = '⭕';
                statusLabel = 'Occupé';
                statusColor = '#6c757d';
            }
            
            const badgesHtml = badges.length > 0 ? 
                `<span style="font-size: 10px; background: rgba(102, 126, 234, 0.1); color: #667eea; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">${badges.join(' ')}</span>` : '';
            
            // Vérifier si on est déjà connecté avec ce joueur
            const isConnected = !isSelf && window.simpleChatSystem?.connections?.has(player.peer_id);
            
            // Vérifier si le joueur est bloqué
            const isBlocked = !isSelf && window.simpleChatSystem?.isPlayerBlocked(player.peer_id);
            
            // Tous les joueurs sont rejoignables sauf soi-même, ceux déjà connectés et ceux bloqués
            const canJoin = !isSelf && !isConnected && !isBlocked;
            const displayLabel = isBlocked ? '🚫 Bloqué' :
                                isConnected ? '✅ Connecté' : 
                                player.status === 'in_game' ? '🎮 Rejoindre' : 
                                player.status === 'in_room' ? '🚪 Rejoindre' : 
                                '📨 Inviter';
            
            html += `
                <div class="player-item ${isSelf ? 'self' : ''}" data-peer-id="${player.peer_id}" 
                     style="padding: 12px; margin-bottom: 8px; background: ${isSelf ? 'linear-gradient(135deg, #fff5f9 0%, #ffe5f5 100%)' : 'white'}; 
                            border-radius: 10px; cursor: default; 
                            border: 2px solid ${isSelf ? '#ff69b4' : isBlocked ? '#e74c3c' : isConnected ? '#28a745' : '#667eea'}; 
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
                        ${!isSelf ? `
                            <div style="display: flex; gap: 10px; align-items: center;">
                                ${canJoin ? `
                                    <button onclick="window.lobbyTabsManager.invitePlayer('${player.peer_id}'); event.stopPropagation();" 
                                            style="padding: 6px 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                                   color: white; border: none; border-radius: 6px; font-size: 12px; 
                                                   font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;"
                                            onmouseover="this.style.transform='scale(1.05)'" 
                                            onmouseout="this.style.transform='scale(1)'">
                                        ${displayLabel}
                                    </button>
                                ` : isConnected ? `
                                    <span style="padding: 6px 14px; background: #28a745; 
                                                 color: white; border-radius: 6px; font-size: 12px; 
                                                 font-weight: 600; white-space: nowrap;">
                                        ${displayLabel}
                                    </span>
                                ` : isBlocked ? `
                                    <span style="padding: 6px 14px; background: #e74c3c; 
                                                 color: white; border-radius: 6px; font-size: 12px; 
                                                 font-weight: 600; white-space: nowrap;">
                                        ${displayLabel}
                                    </span>
                                ` : ''}
                                <button onclick="window.lobbyTabsManager.toggleBlockPlayer('${player.peer_id}', '${player.username}'); event.stopPropagation();" 
                                        style="padding: 6px 12px; background: ${isBlocked ? '#95a5a6' : '#e74c3c'}; 
                                               color: white; border: none; border-radius: 6px; font-size: 11px; 
                                               font-weight: 600; cursor: pointer; transition: all 0.2s; 
                                               min-width: 40px; flex-shrink: 0;"
                                        onmouseover="this.style.transform='scale(1.05)'" 
                                        onmouseout="this.style.transform='scale(1)'"
                                        title="${isBlocked ? 'Débloquer ce joueur' : 'Bloquer ce joueur'}">
                                    ${isBlocked ? '✓' : '🚫'}
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        list.innerHTML = html;
    }
    
    // Inviter un joueur (créer une salle unifiée chat + jeu)
    async invitePlayer(peerId) {
        console.log('📨 Invitation joueur:', peerId);
        
        const player = window.realtimeLobbySystem?.getPlayer(peerId);
        if (!player) {
            console.error('❌ Joueur introuvable');
            return;
        }
        
        // Vérifier que P2P est prêt
        if (!window.simpleChatSystem?.peer?.id) {
            console.log('🎯 Initialisation P2P avant invitation...');
            window.simpleChatSystem?.initP2P();
            
            // Attendre que le peer soit prêt
            let attempts = 0;
            while (!window.simpleChatSystem?.peer?.id && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.simpleChatSystem?.peer?.id) {
                console.error('❌ Timeout: P2P non initialisé');
                return;
            }
        }
        
        console.log('✅ P2P prêt, envoi invitation...');
        
        try {
            // Vérifier si je suis déjà dans une salle
            const existingRoomId = window.simpleChatSystem.roomCode;
            const isAlreadyInRoom = !!existingRoomId;
            
            // Utiliser la salle existante ou créer une nouvelle
            const roomId = existingRoomId || window.simpleChatSystem.peer.id;
            
            if (isAlreadyInRoom) {
                console.log('🏠 Invitation à rejoindre ma salle existante:', roomId);
            } else {
                console.log('🏠 Création nouvelle salle:', roomId);
            }
            
            // Connexion P2P
            const conn = window.simpleChatSystem.peer.connect(peerId, {
                reliable: true,
                metadata: {
                    type: 'game_invite',
                    from: window.simpleChatSystem.currentUser,
                    roomId: roomId,
                    existingPlayers: window.simpleChatSystem.roomPlayers ? 
                        Array.from(window.simpleChatSystem.roomPlayers.values()).map(p => ({
                            username: p.username,
                            peer_id: p.peer_id
                        })) : []
                }
            });
            
            conn.on('open', () => {
                console.log('✅ Connexion P2P établie avec', player.username);
                
                // Initialiser structures si nécessaire
                if (!window.simpleChatSystem.connections) {
                    window.simpleChatSystem.connections = new Map();
                }
                if (!window.simpleChatSystem.roomPlayers) {
                    window.simpleChatSystem.roomPlayers = new Map();
                }
                
                // Enregistrer la connexion
                window.simpleChatSystem.connections.set(peerId, conn);
                
                // Définir la salle (si nouvelle)
                if (!isAlreadyInRoom) {
                    window.simpleChatSystem.roomCode = roomId;
                    window.simpleChatSystem.isHost = true;
                }
                
                // Ajouter le nouveau joueur à la salle
                window.simpleChatSystem.roomPlayers.set(peerId, {
                    username: player.username,
                    peer_id: peerId,
                    isHost: false
                });
                
                // Message système
                const message = isAlreadyInRoom ? 
                    `🏠 ${player.username} a rejoint la salle` :
                    `🏠 Salle créée avec ${player.username}`;
                window.simpleChatSystem.showMessage(message, 'system');
                
                // Notifier les autres joueurs déjà connectés
                if (isAlreadyInRoom) {
                    window.simpleChatSystem.connections.forEach((existingConn, existingPeerId) => {
                        if (existingPeerId !== peerId) {
                            existingConn.send({
                                type: 'player_joined_room',
                                username: player.username,
                                peer_id: peerId
                            });
                        }
                    });
                }
                
                // Déclencher événement pour activer le vocal
                if (window.voiceUI) {
                    window.voiceUI.updateSmsVoiceButton();
                }
                
                // Envoyer invitation avec info de la salle
                conn.send({
                    type: 'game_invite',
                    from: window.simpleChatSystem.currentUser,
                    roomId: roomId,
                    existingPlayers: Array.from(window.simpleChatSystem.roomPlayers.values())
                        .filter(p => p.peer_id !== peerId)
                        .map(p => ({ username: p.username, peer_id: p.peer_id })),
                    message: isAlreadyInRoom ?
                        `${window.simpleChatSystem.currentUser} vous invite à rejoindre sa salle !` :
                        `${window.simpleChatSystem.currentUser} vous invite dans sa salle !`
                });
                
                console.log('📨 Invitation envoyée');
                
                // Écouter les messages du joueur
                conn.on('data', (data) => {
                    console.log('📨 Message reçu:', data);
                    this.handleInviteResponse(peerId, player.username, data);
                });
            });
            
            conn.on('error', (err) => {
                console.error('❌ Erreur connexion:', err);
            });
            
            conn.on('close', () => {
                console.log('🔌 Connexion fermée avec', player.username);
                // Retirer de la salle
                window.simpleChatSystem.roomPlayers?.delete(peerId);
                window.simpleChatSystem.connections?.delete(peerId);
            });
            
        } catch (err) {
            console.error('❌ Erreur invitation:', err);
        }
    }
    
    // Gérer la réponse à l'invitation
    handleInviteResponse(peerId, username, data) {
        if (data.type === 'invite_accepted') {
            console.log('✅ Invitation acceptée par', username);
            window.simpleChatSystem.showMessage(
                `✅ ${username} a rejoint la salle !`,
                'system'
            );
            
            // Synchroniser l'état du jeu si une partie est en cours
            if (window.game?.gameStarted) {
                const conn = window.simpleChatSystem.connections.get(peerId);
                if (conn) {
                    conn.send({
                        type: 'game_sync',
                        level: window.game.currentLevel,
                        grid: window.game.grid,
                        score: window.game.score
                    });
                }
            }
        } else if (data.type === 'invite_declined') {
            console.log('❌ Invitation refusée par', username);
            window.simpleChatSystem.showMessage(
                `❌ ${username} a refusé l'invitation`,
                'system'
            );
            // Nettoyer
            window.simpleChatSystem.roomPlayers?.delete(peerId);
            window.simpleChatSystem.connections?.delete(peerId);
        } else if (data.type === 'chat_message') {
            // Message de chat
            window.simpleChatSystem.showMessage(
                data.message,
                'user',
                username
            );
        } else if (data.type === 'game_update') {
            // Mise à jour du jeu (lettre placée, etc.)
            this.handleGameUpdate(data);
        }
    }
    
    // Gérer les mises à jour du jeu
    handleGameUpdate(data) {
        if (!window.game) return;
        
        if (data.cellUpdate) {
            // Mettre à jour une cellule
            const {row, col, letter} = data.cellUpdate;
            if (window.game.grid[row] && window.game.grid[row][col] !== undefined) {
                window.game.grid[row][col] = letter;
                
                // Mettre à jour le DOM directement
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    const letterSpan = cell.querySelector('.cell-letter');
                    if (letterSpan) {
                        letterSpan.textContent = letter;
                        // Vérifier si correct
                        if (letter === window.game.solution[row][col]) {
                            cell.classList.add('correct');
                        } else {
                            cell.classList.remove('correct');
                        }
                    }
                }
            }
        } else if (data.scoreUpdate) {
            // Afficher le score de l'autre joueur
            console.log('📊 Score joueur distant:', data.scoreUpdate);
        }
    }

    // Bloquer/débloquer un joueur
    toggleBlockPlayer(peerId, username) {
        if (!window.simpleChatSystem) return;
        
        const isBlocked = window.simpleChatSystem.isPlayerBlocked(peerId);
        
        if (isBlocked) {
            window.simpleChatSystem.unblockPlayer(peerId);
            window.simpleChatSystem.showMessage(`✅ ${username} débloqué`, 'system');
        } else {
            window.simpleChatSystem.blockPlayer(peerId);
            window.simpleChatSystem.showMessage(`🚫 ${username} bloqué`, 'system');
            
            // Déconnecter si actuellement connecté
            const conn = window.simpleChatSystem.connections?.get(peerId);
            if (conn) {
                conn.close();
                window.simpleChatSystem.connections.delete(peerId);
                window.simpleChatSystem.roomPlayers?.delete(peerId);
            }
        }
        
        // Rafraîchir l'affichage
        this.renderLobbyView();
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.lobbyTabsManager = new LobbyTabsManager();
    console.log('✅ Lobby Manager simplifié prêt');
});
