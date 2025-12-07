// Système de salles intelligentes - Un joueur = Une salle
class RoomSystem {
    constructor(chatSystem) {
        this.chatSystem = chatSystem;
        this.roomMode = 'open'; // 'open', 'private', 'invite'
        this.playersInRoom = new Map(); // peerId -> {username, avatar, isHost}
        this.pendingRequests = new Map(); // peerId -> {username, avatar}
        this.kickedPlayers = new Set(); // peerIds exclus
        this.myRoomInfo = null; // Info de ma salle
        this.availablePlayers = new Map(); // Liste des joueurs en ligne
        this.presenceInterval = null; // Interval pour annoncer sa présence
        
        // Auto-créer ma salle au démarrage
        this.createMyRoom();
        
        // Écouter les événements P2P
        this.setupEventListeners();
    }

    // Créer automatiquement ma salle
    createMyRoom() {
        if (!this.chatSystem.currentUser) {
            console.warn('⚠️ Username non défini, attente...');
            setTimeout(() => this.createMyRoom(), 500);
            return;
        }

        // Initialiser P2P avec mon username comme ID de base
        if (!this.chatSystem.peer) {
            this.chatSystem.initP2P();
        }

        this.chatSystem.isHost = true;
        
        // Attendre que le peer soit prêt
        const checkPeer = () => {
            if (this.chatSystem.peer && this.chatSystem.peer.id) {
                this.myRoomInfo = {
                    roomId: this.chatSystem.peer.id,
                    hostUsername: this.chatSystem.currentUser,
                    mode: this.roomMode,
                    playerCount: 1,
                    maxPlayers: 8,
                    lastSeen: Date.now()
                };
                
                // M'ajouter à ma propre salle
                this.playersInRoom.set('me', {
                    username: this.chatSystem.currentUser,
                    avatar: this.chatSystem.getUserAvatar(this.chatSystem.currentUser),
                    isHost: true
                });
                
                this.chatSystem.showMessage(`🏠 Votre salle est créée ! Mode: ${this.getRoomModeIcon()}`, 'system');
                this.updateUI();
                
                // Démarrer l'annonce de présence périodique
                this.startPresenceBroadcast();
            } else {
                setTimeout(checkPeer, 200);
            }
        };
        
        checkPeer();
    }

    // Démarrer la diffusion périodique de présence
    startPresenceBroadcast() {
        // Annoncer immédiatement
        this.announcePresence();
        
        // Puis toutes les 10 secondes
        this.presenceInterval = setInterval(() => {
            this.announcePresence();
            this.cleanupStalePlayer();
        }, 10000);
        
        console.log('📡 Broadcast de présence démarré');
    }

    // Arrêter la diffusion de présence
    stopPresenceBroadcast() {
        if (this.presenceInterval) {
            clearInterval(this.presenceInterval);
            this.presenceInterval = null;
        }
    }

    // Annoncer ma présence via broadcast
    announcePresence() {
        if (!this.myRoomInfo || this.roomMode === 'private') {
            return; // Ne pas annoncer si privé
        }

        const announcement = {
            type: 'player-presence',
            peerId: this.chatSystem.peer?.id,
            username: this.chatSystem.currentUser,
            avatar: this.chatSystem.getUserAvatar(this.chatSystem.currentUser),
            roomMode: this.roomMode,
            playerCount: this.playersInRoom.size,
            maxPlayers: this.myRoomInfo.maxPlayers,
            timestamp: Date.now()
        };

        // Broadcast à tous les peers connectés
        this.chatSystem.connections.forEach((conn) => {
            if (conn.open) {
                conn.send(announcement);
            }
        });
        
        console.log('📡 Présence annoncée:', announcement.username);
    }

    // Recevoir une annonce de présence
    handlePlayerPresence(data) {
        const { peerId, username, avatar, roomMode, playerCount, maxPlayers, timestamp } = data;
        
        // Ne pas s'ajouter soi-même
        if (peerId === this.chatSystem.peer?.id) {
            return;
        }

        // Mettre à jour la liste des joueurs disponibles
        this.availablePlayers.set(peerId, {
            username,
            avatar,
            roomMode,
            playerCount,
            maxPlayers,
            lastSeen: timestamp
        });

        console.log('👤 Joueur détecté:', username, `(${playerCount}/${maxPlayers})`);
        
        // Mettre à jour l'UI
        this.updateAvailablePlayersList();
    }

    // Nettoyer les joueurs inactifs (plus de 30 secondes)
    cleanupStalePlayer() {
        const now = Date.now();
        const staleThreshold = 30000; // 30 secondes
        
        this.availablePlayers.forEach((player, peerId) => {
            if (now - player.lastSeen > staleThreshold) {
                console.log('🗑️ Retrait joueur inactif:', player.username);
                this.availablePlayers.delete(peerId);
            }
        });
        
        this.updateAvailablePlayersList();
    }

    // Changer le mode de la salle
    setRoomMode(mode) {
        if (!['open', 'private', 'invite'].includes(mode)) {
            console.error('Mode invalide:', mode);
            return;
        }

        this.roomMode = mode;
        if (this.myRoomInfo) {
            this.myRoomInfo.mode = mode;
        }

        // Notifier tous les joueurs du changement
        this.broadcastToRoom({
            type: 'room-mode-changed',
            mode: mode
        });

        this.chatSystem.showMessage(`🏠 Mode de salle: ${this.getRoomModeIcon()}`, 'system');
        this.updateUI();
    }

    // Rejoindre la salle d'un joueur
    async requestJoinRoom(targetUsername, targetPeerId) {
        if (!targetPeerId) {
            this.chatSystem.showMessage('❌ Impossible de trouver ce joueur', 'system');
            return false;
        }

        // Initialiser P2P si nécessaire
        if (!this.chatSystem.peer) {
            this.chatSystem.initP2P();
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        try {
            this.chatSystem.showMessage(`🚪 Demande d'accès à la salle de ${targetUsername}...`, 'system');
            
            const conn = this.chatSystem.peer.connect(targetPeerId, {
                reliable: true
            });

            const timeout = setTimeout(() => {
                if (!conn.open) {
                    conn.close();
                    this.chatSystem.showMessage('❌ Impossible de contacter ce joueur', 'system');
                }
            }, 10000);

            conn.on('open', () => {
                clearTimeout(timeout);
                
                // Envoyer une demande d'accès
                conn.send({
                    type: 'join-request',
                    username: this.chatSystem.currentUser,
                    avatar: this.chatSystem.getUserAvatar(this.chatSystem.currentUser),
                    peerId: this.chatSystem.peer.id
                });
                
                this.chatSystem.showMessage('⏳ Demande envoyée, en attente...', 'system');
            });

            conn.on('data', (data) => {
                this.handleRoomMessage(conn, data);
            });

            conn.on('close', () => {
                clearTimeout(timeout);
            });

            conn.on('error', (err) => {
                clearTimeout(timeout);
                console.log('ℹ️ Connexion échouée:', err.type);
                
                // Message utilisateur plus clair selon le type d'erreur
                if (err.type === 'peer-unavailable' || err.message?.includes('Could not connect')) {
                    this.chatSystem.showMessage('❌ Joueur introuvable ou déconnecté', 'system');
                } else {
                    this.chatSystem.showMessage('❌ Impossible de se connecter à ce joueur', 'system');
                }
            });

            return true;
        } catch (error) {
            console.error('Erreur requestJoinRoom:', error);
            this.chatSystem.showMessage('❌ Erreur lors de la demande', 'system');
            return false;
        }
    }

    // Gérer les messages de salle
    handleRoomMessage(conn, data) {
        switch (data.type) {
            case 'player-presence':
                this.handlePlayerPresence(data);
                break;
            
            case 'join-request':
                this.handleJoinRequest(conn, data);
                break;
            
            case 'join-accepted':
                this.handleJoinAccepted(conn, data);
                break;
            
            case 'join-refused':
                this.handleJoinRefused(data);
                break;
            
            case 'player-kicked':
                this.handlePlayerKicked(data);
                break;
            
            case 'room-mode-changed':
                this.handleRoomModeChanged(data);
                break;
            
            case 'player-joined':
                this.handlePlayerJoined(data);
                break;
            
            case 'player-left':
                this.handlePlayerLeft(data);
                break;
            
            case 'host-transferred':
                this.handleHostTransferred(data);
                break;
            
            case 'host-left':
                this.handleHostLeft(data);
                break;
        }
    }

    // Gérer une demande d'accès (côté hôte)
    handleJoinRequest(conn, data) {
        const { username, avatar, peerId } = data;

        // Vérifier si le joueur est exclu
        if (this.kickedPlayers.has(peerId)) {
            conn.send({
                type: 'join-refused',
                reason: 'excluded'
            });
            conn.close();
            return;
        }

        // Mode privé : refuser automatiquement
        if (this.roomMode === 'private') {
            conn.send({
                type: 'join-refused',
                reason: 'private'
            });
            conn.close();
            this.chatSystem.showMessage(`🚫 ${username} a tenté de rejoindre (salle privée)`, 'system');
            return;
        }

        // Mode ouvert : accepter automatiquement
        if (this.roomMode === 'open') {
            this.acceptJoinRequest(conn, { username, avatar, peerId });
            return;
        }

        // Mode invitation : ajouter à la liste des demandes
        if (this.roomMode === 'invite') {
            this.pendingRequests.set(peerId, {
                username,
                avatar,
                conn
            });
            
            this.chatSystem.showMessage(`🔔 ${username} demande à rejoindre`, 'system');
            this.updateUI();
        }
    }

    // Accepter une demande
    acceptJoinRequest(conn, playerInfo) {
        const { username, avatar, peerId } = playerInfo;

        // Vérifier la limite de joueurs
        if (this.playersInRoom.size >= this.myRoomInfo.maxPlayers) {
            conn.send({
                type: 'join-refused',
                reason: 'full'
            });
            conn.close();
            this.chatSystem.showMessage(`❌ Salle pleine, ${username} ne peut pas rejoindre`, 'system');
            return;
        }

        // Ajouter le joueur
        this.playersInRoom.set(peerId, {
            username,
            avatar,
            isHost: false
        });

        // Stocker la connexion
        this.chatSystem.connections.set(peerId, conn);

        // Envoyer l'acceptation avec info de salle
        conn.send({
            type: 'join-accepted',
            roomInfo: this.myRoomInfo,
            players: Array.from(this.playersInRoom.entries()).map(([id, p]) => ({
                peerId: id,
                ...p
            }))
        });

        // Notifier tous les autres joueurs
        this.broadcastToRoom({
            type: 'player-joined',
            peerId: peerId,
            username: username,
            avatar: avatar
        }, peerId); // Exclure le nouveau joueur de la notification

        this.chatSystem.showMessage(`✅ ${username} a rejoint la salle`, 'system');
        
        // Retirer des demandes en attente si présent
        this.pendingRequests.delete(peerId);
        
        this.updateUI();
    }

    // Refuser une demande
    refuseJoinRequest(peerId) {
        const request = this.pendingRequests.get(peerId);
        if (!request) return;

        request.conn.send({
            type: 'join-refused',
            reason: 'denied'
        });
        request.conn.close();

        this.chatSystem.showMessage(`❌ Demande de ${request.username} refusée`, 'system');
        this.pendingRequests.delete(peerId);
        this.updateUI();
    }

    // Gérer l'acceptation (côté joueur qui rejoint)
    handleJoinAccepted(conn, data) {
        const { roomInfo, players } = data;
        
        // Mettre à jour ma liste de joueurs
        this.playersInRoom.clear();
        players.forEach(player => {
            this.playersInRoom.set(player.peerId, {
                username: player.username,
                avatar: player.avatar,
                isHost: player.isHost
            });
        });

        // M'ajouter
        this.playersInRoom.set('me', {
            username: this.chatSystem.currentUser,
            avatar: this.chatSystem.getUserAvatar(this.chatSystem.currentUser),
            isHost: false
        });

        this.chatSystem.isHost = false;
        this.chatSystem.roomCode = roomInfo.roomId;
        
        this.chatSystem.showMessage(`✅ Vous avez rejoint la salle de ${roomInfo.hostUsername}`, 'system');
        this.updateUI();

        // Envoyer l'état de la course si en cours
        if (window.multiplayerRace && window.multiplayerRace.isRaceActive) {
            const raceState = window.multiplayerRace.getRaceState();
            conn.send({
                type: 'race',
                action: 'state',
                data: raceState,
                username: this.chatSystem.currentUser
            });
        }
    }

    // Gérer le refus (côté joueur qui rejoint)
    handleJoinRefused(data) {
        const reasons = {
            'private': 'La salle est privée',
            'excluded': 'Vous avez été exclu de cette salle',
            'full': 'La salle est pleine',
            'denied': 'Votre demande a été refusée'
        };
        
        const message = reasons[data.reason] || 'Accès refusé';
        this.chatSystem.showMessage(`❌ ${message}`, 'system');
    }

    // Exclure un joueur
    kickPlayer(peerId) {
        const player = this.playersInRoom.get(peerId);
        if (!player || player.isHost) return;

        // Marquer comme exclu
        this.kickedPlayers.add(peerId);

        // Envoyer notification d'exclusion
        const conn = this.chatSystem.connections.get(peerId);
        if (conn) {
            conn.send({
                type: 'player-kicked',
                reason: 'host-decision'
            });
            conn.close();
        }

        // Retirer de la salle
        this.playersInRoom.delete(peerId);
        this.chatSystem.connections.delete(peerId);

        this.chatSystem.showMessage(`🚫 ${player.username} a été exclu`, 'system');
        
        // Notifier les autres
        this.broadcastToRoom({
            type: 'player-left',
            peerId: peerId,
            username: player.username,
            reason: 'kicked'
        });

        this.updateUI();
    }

    // Gérer l'exclusion (côté joueur exclu)
    handlePlayerKicked(data) {
        this.chatSystem.showMessage('❌ Vous avez été exclu de la salle', 'system');
        
        // Nettoyer les connexions
        this.playersInRoom.clear();
        this.chatSystem.connections.clear();
        this.chatSystem.isHost = false;
        this.chatSystem.roomCode = null;
        
        this.updateUI();
        
        // Recréer ma propre salle
        setTimeout(() => this.createMyRoom(), 1000);
    }

    // Gérer l'arrivée d'un nouveau joueur
    handlePlayerJoined(data) {
        const { peerId, username, avatar } = data;
        
        this.playersInRoom.set(peerId, {
            username,
            avatar,
            isHost: false
        });
        
        this.chatSystem.showMessage(`✅ ${username} a rejoint la salle`, 'system');
        this.updateUI();
    }

    // Gérer le départ de l'hôte
    handleHostLeft(data) {
        this.chatSystem.showMessage('❌ L\'hôte a quitté - salle fermée', 'system');
        
        // Nettoyer
        this.playersInRoom.clear();
        this.chatSystem.connections.clear();
        this.chatSystem.isHost = false;
        this.chatSystem.roomCode = null;
        
        this.updateUI();
        
        // Recréer ma propre salle
        setTimeout(() => this.createMyRoom(), 1000);
    }

    // Gérer le départ d'un joueur
    handlePlayerLeft(data) {
        const { peerId, username } = data;
        
        this.playersInRoom.delete(peerId);
        this.chatSystem.connections.delete(peerId);
        
        const reason = data.reason === 'kicked' ? '(exclu)' : '';
        this.chatSystem.showMessage(`👋 ${username} a quitté la salle ${reason}`, 'system');
        this.updateUI();
    }

    // Transférer l'hôte
    transferHost(newHostPeerId) {
        const newHost = this.playersInRoom.get(newHostPeerId);
        if (!newHost || newHost.isHost) return;

        // Mettre à jour les rôles
        this.playersInRoom.forEach((player, id) => {
            player.isHost = (id === newHostPeerId);
        });

        // Notifier tout le monde
        this.broadcastToRoom({
            type: 'host-transferred',
            newHostPeerId: newHostPeerId,
            newHostUsername: newHost.username
        });

        this.chatSystem.showMessage(`👑 ${newHost.username} est maintenant l'hôte`, 'system');
        this.updateUI();
    }

    // Gérer le transfert d'hôte
    handleHostTransferred(data) {
        const { newHostPeerId, newHostUsername } = data;
        
        // Mettre à jour les rôles
        this.playersInRoom.forEach((player, id) => {
            player.isHost = (id === newHostPeerId);
        });

        const isMe = (newHostPeerId === this.chatSystem.peer.id || newHostPeerId === 'me');
        this.chatSystem.isHost = isMe;

        this.chatSystem.showMessage(`👑 ${newHostUsername} est maintenant l'hôte`, 'system');
        this.updateUI();
    }

    // Quitter la salle
    leaveRoom() {
        if (this.chatSystem.isHost) {
            // Si hôte, notifier et fermer
            this.broadcastToRoom({
                type: 'host-left',
                message: 'L\'hôte a quitté la salle'
            });
            
            this.chatSystem.connections.forEach(conn => conn.close());
            this.chatSystem.connections.clear();
        } else {
            // Si invité, notifier et partir
            this.broadcastToRoom({
                type: 'player-left',
                peerId: this.chatSystem.peer.id,
                username: this.chatSystem.currentUser
            });
        }

        this.playersInRoom.clear();
        this.pendingRequests.clear();
        this.chatSystem.isHost = false;
        this.chatSystem.roomCode = null;

        this.chatSystem.showMessage('👋 Vous avez quitté la salle', 'system');
        
        // Recréer ma propre salle
        this.createMyRoom();
    }

    // Diffuser un message à tous les joueurs
    broadcastToRoom(message, excludePeerId = null) {
        this.chatSystem.connections.forEach((conn, peerId) => {
            if (peerId !== excludePeerId && conn.open) {
                conn.send(message);
            }
        });
    }

    // Obtenir l'icône du mode de salle
    getRoomModeIcon() {
        const icons = {
            'open': '🔓 Entrée Libre',
            'private': '🔒 Privée',
            'invite': '🎫 Sur Invitation'
        };
        return icons[this.roomMode] || '🔓 Entrée Libre';
    }

    // Configurer les écouteurs d'événements
    setupEventListeners() {
        // Écouter les connexions entrantes
        if (this.chatSystem.peer) {
            this.chatSystem.peer.on('connection', (conn) => {
                this.chatSystem.handleConnection(conn);
            });
        }
    }

    // Mettre à jour l'interface
    updateUI() {
        // Mettre à jour le panel de contrôle hôte
        this.updateHostPanel();
        
        // Mettre à jour la liste des joueurs
        this.updatePlayersList();
        
        // Mettre à jour les demandes en attente
        this.updatePendingRequests();
    }

    // Mettre à jour le panel hôte
    updateHostPanel() {
        const panel = document.getElementById('hostControlPanel');
        if (!panel) return;

        if (!this.chatSystem.isHost) {
            panel.classList.add('hidden');
            return;
        }

        panel.classList.remove('hidden');
        
        // Mettre à jour le mode
        const modeDisplay = document.getElementById('roomModeDisplay');
        if (modeDisplay) {
            modeDisplay.textContent = this.getRoomModeIcon();
        }

        // Mettre à jour le compteur de joueurs
        const playerCount = document.getElementById('roomPlayerCount');
        if (playerCount) {
            playerCount.textContent = `${this.playersInRoom.size}/${this.myRoomInfo?.maxPlayers || 8}`;
        }
    }

    // Mettre à jour la liste des joueurs
    updatePlayersList() {
        const list = document.getElementById('roomPlayersList');
        if (!list) return;

        list.innerHTML = '';

        this.playersInRoom.forEach((player, peerId) => {
            const div = document.createElement('div');
            div.className = 'room-player-item';
            
            const isMe = (peerId === 'me');
            const hostBadge = player.isHost ? '👑 ' : '';
            const meBadge = isMe ? '(Vous) ' : '';
            
            div.innerHTML = `
                <span class="player-avatar">${player.avatar}</span>
                <span class="player-name">${hostBadge}${player.username} ${meBadge}</span>
                ${this.chatSystem.isHost && !player.isHost && !isMe ? `
                    <button class="btn-kick" data-peer-id="${peerId}">🚫</button>
                ` : ''}
            `;
            
            list.appendChild(div);
        });

        // Ajouter les écouteurs pour les boutons d'exclusion
        if (this.chatSystem.isHost) {
            list.querySelectorAll('.btn-kick').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const peerId = e.target.dataset.peerId;
                    if (confirm('Êtes-vous sûr de vouloir exclure ce joueur ?')) {
                        this.kickPlayer(peerId);
                    }
                });
            });
        }
    }

    // Mettre à jour les demandes en attente
    updatePendingRequests() {
        const container = document.getElementById('pendingRequestsContainer');
        const list = document.getElementById('pendingRequestsList');
        
        if (!container || !list) return;

        if (this.pendingRequests.size === 0) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        list.innerHTML = '';

        this.pendingRequests.forEach((request, peerId) => {
            const div = document.createElement('div');
            div.className = 'pending-request-item';
            
            div.innerHTML = `
                <span class="request-avatar">${request.avatar}</span>
                <span class="request-name">${request.username}</span>
                <button class="btn-accept" data-peer-id="${peerId}">✅</button>
                <button class="btn-refuse" data-peer-id="${peerId}">❌</button>
            `;
            
            list.appendChild(div);
        });

        // Ajouter les écouteurs
        list.querySelectorAll('.btn-accept').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const peerId = e.target.dataset.peerId;
                const request = this.pendingRequests.get(peerId);
                if (request) {
                    this.acceptJoinRequest(request.conn, {
                        peerId,
                        username: request.username,
                        avatar: request.avatar
                    });
                }
            });
        });

        list.querySelectorAll('.btn-refuse').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const peerId = e.target.dataset.peerId;
                this.refuseJoinRequest(peerId);
            });
        });
    }

    // Mettre à jour la liste des joueurs disponibles
    updateAvailablePlayersList() {
        const container = document.getElementById('availablePlayersPanel');
        if (!container) return;

        // Si je suis déjà dans une salle, masquer la liste
        if (this.playersInRoom.size > 1) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');

        // Afficher le nombre de joueurs en ligne
        const count = this.availablePlayers.size;
        let listHTML = `<h4>🌐 Joueurs en Ligne (${count})</h4>`;

        if (count === 0) {
            listHTML += '<p class="no-players">Aucun joueur en ligne pour le moment...</p>';
        } else {
            listHTML += '<div class="available-players-list">';
            
            this.availablePlayers.forEach((player, peerId) => {
                const modeIcon = {
                    'open': '🔓',
                    'private': '🔒',
                    'invite': '🎫'
                }[player.roomMode] || '🔓';
                
                listHTML += `
                    <div class="available-player-item" data-peer-id="${peerId}">
                        <span class="player-avatar">${player.avatar}</span>
                        <div class="player-info">
                            <span class="player-name">${player.username}</span>
                            <span class="player-status">${modeIcon} ${player.playerCount}/${player.maxPlayers} joueurs</span>
                        </div>
                        <button class="btn-join-player" data-peer-id="${peerId}" data-username="${player.username}">
                            🚪 Rejoindre
                        </button>
                    </div>
                `;
            });
            
            listHTML += '</div>';
        }

        container.innerHTML = listHTML;

        // Ajouter les écouteurs pour les boutons rejoindre
        container.querySelectorAll('.btn-join-player').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const peerId = e.target.dataset.peerId;
                const username = e.target.dataset.username;
                this.requestJoinRoom(username, peerId);
            });
        });
    }
}

// Instance globale
window.roomSystem = null;
