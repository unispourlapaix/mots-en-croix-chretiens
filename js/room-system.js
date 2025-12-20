// Système de salles intelligentes - Un joueur = Une salle
class RoomSystem {
    constructor(chatSystem) {
        this.chatSystem = chatSystem;
        this.acceptMode = 'manual'; // 'auto' (en ligne) ou 'manual' (validation manuelle hors salle CODE)
        this.playersInRoom = new Map(); // peerId -> {username, avatar, isHost}
        this.pendingRequests = new Map(); // peerId -> {username, avatar, conn}
        this.blockedPlayers = new Set(); // peerIds bloqués définitivement
        this.myRoomInfo = null; // Info de ma salle
        this.availablePlayers = new Map(); // Liste des joueurs en ligne
        this.presenceInterval = null; // Interval pour annoncer sa présence
        
        // Charger la liste des joueurs bloqués
        this.loadBlockedPlayers();
        
        // Auto-créer ma salle au démarrage
        this.createMyRoom();
        
        // Écouter les changements d'authentification pour mettre à jour la bulle
        if (typeof authSystem !== 'undefined') {
            authSystem.onAuthChange((user) => {
                console.log('🔐 Auth changed dans RoomSystem:', user?.username);
                // Mettre à jour le username dans availablePlayers
                if (user && user.username && this.availablePlayers.has('me')) {
                    const myInfo = this.availablePlayers.get('me');
                    myInfo.username = user.username;
                    this.availablePlayers.set('me', myInfo);
                    console.log('✅ Username mis à jour dans availablePlayers:', user.username);
                    this.updateChatBubble();
                }
            });
        }
        
        // Écouter les événements vocaux pour mettre à jour l'indicateur
        window.addEventListener('voicejoined', () => {
            console.log('🎤 Vocal rejoint - Mise à jour bulle');
            this.updateChatBubble();
        });
        window.addEventListener('voiceleft', () => {
            console.log('🔇 Vocal quitté - Mise à jour bulle');
            this.updateChatBubble();
        });
        window.addEventListener('voicemuteChanged', () => {
            console.log('🎤 État micro changé - Mise à jour bulle');
            this.updateChatBubble();
        });
        window.addEventListener('voicepeerJoined', () => {
            console.log('👤 Peer vocal rejoint - Mise à jour bulle');
            this.updateChatBubble();
        });
        window.addEventListener('voicepeerLeft', () => {
            console.log('👤 Peer vocal quitté - Mise à jour bulle');
            this.updateChatBubble();
        });
        
        // Mise à jour throttled pour volumeChange (éviter trop de re-render)
        let volumeUpdateTimeout;
        window.addEventListener('voicevolumeChange', () => {
            if (volumeUpdateTimeout) return;
            volumeUpdateTimeout = setTimeout(() => {
                this.updateChatBubble();
                volumeUpdateTimeout = null;
            }, 500); // Maximum 2 fois par seconde
        });
        
        // Écouter les événements P2P
        this.setupEventListeners();
        
        // Vérifier si un roomId est dans l'URL pour rejoindre automatiquement
        this.checkURLForRoomInvite();
    }
    
    // Vérifier si un lien d'invitation est dans l'URL
    checkURLForRoomInvite() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('room');
        
        if (roomId && roomId.trim()) {
            console.log('🔗 Invitation trouvée dans l\'URL:', roomId);
            
            // Attendre que l'utilisateur soit prêt et le système initialisé
            setTimeout(() => {
                if (this.chatSystem.currentUser) {
                    console.log('📥 Tentative de rejoindre automatiquement la salle:', roomId);
                    this.requestJoinRoom('Salle partagée', roomId.trim());
                    
                    // Nettoyer l'URL après
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    // Réessayer si le user n'est pas encore prêt
                    setTimeout(() => this.checkURLForRoomInvite(), 500);
                }
            }, 2000); // Attendre 2 secondes après le chargement
        }
    }

    // Créer automatiquement ma salle
    createMyRoom() {
        console.log('🏠 Tentative de création de room...');
        console.log('👤 CurrentUser:', this.chatSystem.currentUser);
        
        if (!this.chatSystem.currentUser) {
            console.warn('⚠️ Username non défini, attente...');
            setTimeout(() => this.createMyRoom(), 500);
            return;
        }
        
        // NOUVEAU: Attendre que l'authentification soit vérifiée
        if (typeof authSystem !== 'undefined' && authSystem.isCheckingAuth) {
            console.log('⏳ Attente vérification authentification... (currentUser:', this.chatSystem.currentUser + ')');
            setTimeout(() => this.createMyRoom(), 300);
            return;
        }

        console.log('✅ Username OK, création de la room pour:', this.chatSystem.currentUser);
        console.log('🔍 Auth status - isCheckingAuth:', authSystem?.isCheckingAuth, 'isAuthenticated:', authSystem?.isAuthenticated());

        // Initialiser P2P avec mon username comme ID de base
        if (!this.chatSystem.peer) {
            console.log('📡 Initialisation P2P...');
            this.chatSystem.initP2P();
        }

        this.chatSystem.isHost = true;
        
        // Attendre que le peer soit prêt
        const checkPeer = () => {
            if (this.chatSystem.peer && this.chatSystem.peer.id) {
                console.log('🎯 Peer prêt avec ID:', this.chatSystem.peer.id);
                
                this.myRoomInfo = {
                    roomId: this.chatSystem.peer.id,
                    hostUsername: this.chatSystem.currentUser,
                    acceptMode: this.acceptMode,
                    playerCount: 1,
                    maxPlayers: 8,
                    lastSeen: Date.now()
                };
                
                console.log('📝 Room info créée:', this.myRoomInfo);
                
                // M'ajouter à ma propre salle
                this.playersInRoom.set('me', {
                    username: this.chatSystem.currentUser,
                    avatar: this.chatSystem.getUserAvatar(this.chatSystem.currentUser),
                    isHost: true
                });
                
                console.log('👥 Ajouté à playersInRoom');
                
                // M'ajouter aussi à la liste des joueurs disponibles
                this.availablePlayers.set('me', {
                    username: this.chatSystem.currentUser,
                    avatar: this.chatSystem.getUserAvatar(this.chatSystem.currentUser) || '👤',
                    acceptMode: this.acceptMode || 'manual',
                    roomMode: this.acceptMode || 'manual',
                    playerCount: 1,
                    maxPlayers: 8,
                    lastSeen: Date.now(),
                    isMe: true,
                    isBot: false
                });
                
                console.log('🌐 Ajouté à availablePlayers, total:', this.availablePlayers.size);
                
                this.chatSystem.showMessage(`🏠 Vous êtes en ligne ! Mode: ${this.getAcceptModeIcon()}`, 'system');
                this.updateUI();
                
                // Mettre à jour la bulle de chat pour afficher le joueur local
                console.log('🔄 Mise à jour de la bulle de chat...');
                this.updateChatBubble();
                
                // Démarrer l'annonce de présence périodique
                this.startPresenceBroadcast();
            } else {
                console.log('⏳ En attente du peer...');
                setTimeout(checkPeer, 200);
            }
        };
        
        checkPeer();
    }

    // Mettre à jour le username après connexion
    updateUsername(newUsername) {
        console.log('🔄 Mise à jour du username:', this.chatSystem.currentUser, '->', newUsername);
        
        // Mettre à jour dans chatSystem
        this.chatSystem.currentUser = newUsername;
        
        // Mettre à jour dans myRoomInfo
        if (this.myRoomInfo) {
            this.myRoomInfo.hostUsername = newUsername;
        }
        
        // Mettre à jour dans playersInRoom
        const mePlayer = this.playersInRoom.get('me');
        if (mePlayer) {
            mePlayer.username = newUsername;
            mePlayer.avatar = this.chatSystem.getUserAvatar(newUsername);
        }
        
        // Mettre à jour dans availablePlayers
        const meAvailable = this.availablePlayers.get('me');
        if (meAvailable) {
            meAvailable.username = newUsername;
            meAvailable.avatar = this.chatSystem.getUserAvatar(newUsername) || '👤';
            meAvailable.acceptMode = this.acceptMode; // Garder le mode actuel
        }
        
        // Rafraîchir l'affichage
        this.updateUI();
        this.updateChatBubble();
        
        console.log('✅ Username mis à jour partout');
    }

    // Générer un lien de partage pour la salle
    generateShareLink() {
        if (!this.myRoomInfo || !this.myRoomInfo.roomId) {
            console.warn('⚠️ Pas de salle active');
            return null;
        }
        
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?room=${encodeURIComponent(this.myRoomInfo.roomId)}`;
        
        console.log('🔗 Lien de partage généré:', shareUrl);
        return shareUrl;
    }
    
    // Copier le lien de partage dans le presse-papiers
    async copyShareLink() {
        const shareLink = this.generateShareLink();
        
        if (!shareLink) {
            this.chatSystem.showMessage('❌ Impossible de générer le lien', 'system');
            return false;
        }
        
        try {
            await navigator.clipboard.writeText(shareLink);
            this.chatSystem.showMessage('✅ Lien de partage copié !', 'system');
            console.log('📋 Lien copié:', shareLink);
            return true;
        } catch (err) {
            console.error('❌ Erreur copie:', err);
            this.chatSystem.showMessage('❌ Impossible de copier le lien', 'system');
            return false;
        }
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
        
        // Initialiser le bot actif au démarrage
        setTimeout(() => {
            this.initializeActiveBot();
        }, 1000);
    }
    
    // Initialiser le bot actif au démarrage
    initializeActiveBot() {
        const activeBot = localStorage.getItem('activeBot') || 'bot-unisona';
        console.log('🤖 Initialisation du bot actif:', activeBot);
        
        // Ajouter le bot à la liste des joueurs
        const botNames = {
            'bot-unisona': { name: 'Unisona', avatar: '🎭', displayName: 'Unisona' },
            'bot-origine': { name: '🤖 Origine', avatar: '👼', displayName: 'Origine' },
            'bot-originaire': { name: '🤖 Originaire', avatar: '🌹', displayName: 'Originaire' },
            'bot-dreamer': { name: '🤖 Dreamer', avatar: '⛪', displayName: 'Dreamer' },
            'bot-materik': { name: '🤖 Materik', avatar: '📖', displayName: 'Materik' },
            'bot-mpandawaha': { name: '🤖 M.Pandawaha', avatar: '🎲', displayName: 'M.Pandawaha' }
        };
        
        const botInfo = botNames[activeBot];
        if (botInfo) {
            this.availablePlayers.set(activeBot, {
                username: botInfo.displayName,
                avatar: botInfo.avatar,
                isBot: true,
                playerCount: 1,
                maxPlayers: 2,
                mode: 'solo'
            });
            
            // Démarrer le bot après initialisation
            setTimeout(() => {
                if (activeBot === 'bot-unisona') {
                    if (window.welcomeAI && !window.welcomeAI.isPlaying) {
                        window.welcomeAI.joinSoloMode();
                    }
                } else if (window.aiBots) {
                    const existingBot = window.aiBots.find(b => b.name === botInfo.name);
                    if (existingBot && !existingBot.isPlaying && window.game) {
                        existingBot.startPlaying(window.game);
                    }
                }
            }, 500);
            
            this.updateChatBubble();
        }
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
        
        // Log supprimé (trop fréquent)
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
            acceptMode: roomMode || 'manual',
            roomMode: roomMode || 'manual',
            playerCount,
            maxPlayers,
            lastSeen: timestamp,
            isBot: false
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
            // Ne pas nettoyer le joueur local ni les bots
            if (player.isMe || player.isBot) {
                return;
            }
            
            if (now - player.lastSeen > staleThreshold) {
                console.log('🗑️ Retrait joueur inactif:', player.username);
                this.availablePlayers.delete(peerId);
            }
        });
        
        this.updateAvailablePlayersList();
    }

    // Changer le mode d'acceptation
    setAcceptMode(mode) {
        if (!['auto', 'manual'].includes(mode)) {
            console.error('Mode invalide:', mode);
            return;
        }

        this.acceptMode = mode;
        if (this.myRoomInfo) {
            this.myRoomInfo.acceptMode = mode;
        }

        // Notifier tous les joueurs du changement
        this.broadcastToRoom({
            type: 'accept-mode-changed',
            mode: mode
        });

        this.chatSystem.showMessage(`⚙️ Statut de connexion: ${this.getAcceptModeIcon()}`, 'system');
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

        // Vérifier si le joueur est bloqué
        if (this.blockedPlayers.has(peerId)) {
            conn.send({
                type: 'join-refused',
                reason: 'blocked'
            });
            conn.close();
            return;
        }

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

        // Mode automatique : accepter directement
        if (this.acceptMode === 'auto') {
            this.acceptJoinRequest(conn, { username, avatar, peerId });
            return;
        }

        // Mode manuel : ajouter à la liste des demandes en attente
        this.pendingRequests.set(peerId, {
            username,
            avatar,
            conn
        });
        
        this.chatSystem.showMessage(`🔔 ${username} demande à rejoindre`, 'system');
        this.showJoinRequestNotification(username, peerId);
        this.updateUI();
    }
    
    // Afficher une notification pour demande entrante
    showJoinRequestNotification(username, peerId) {
        // Créer une notification visuelle
        const notification = document.createElement('div');
        notification.className = 'join-request-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🔔</span>
                <span class="notification-text">${username} veut vous rejoindre</span>
                <div class="notification-actions">
                    <button class="btn-accept-notif" data-peer-id="${peerId}">✅ Accepter</button>
                    <button class="btn-refuse-notif" data-peer-id="${peerId}">❌ Refuser</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Event listeners
        notification.querySelector('.btn-accept-notif').addEventListener('click', () => {
            const request = this.pendingRequests.get(peerId);
            if (request) {
                this.acceptJoinRequest(request.conn, {
                    peerId,
                    username: request.username,
                    avatar: request.avatar
                });
            }
            notification.remove();
        });
        
        notification.querySelector('.btn-refuse-notif').addEventListener('click', () => {
            this.refuseJoinRequest(peerId);
            notification.remove();
        });
        
        // Auto-fermer après 30 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
                // Refuser automatiquement si pas de réponse
                if (this.pendingRequests.has(peerId)) {
                    this.refuseJoinRequest(peerId);
                }
            }
        }, 30000);
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
    
    // Obtenir l'icône du statut de connexion
    getAcceptModeIcon() {
        const icons = {
            'auto': '🟢 En ligne',
            'manual': '✋ Manuel'
        };
        return icons[this.acceptMode] || '✋ Manuel';
    }

    // Configurer les écouteurs d'événements
    setupEventListeners() {
        // Écouter les connexions entrantes
        if (this.chatSystem.peer) {
            this.chatSystem.peer.on('connection', (conn) => {
                this.chatSystem.handleConnection(conn);
            });
        }

        // Gestion du bouton de minimisation de la bulle
        const toggleBtn = document.getElementById('toggleChatBubble');
        const chatBubble = document.getElementById('chatBubble');
        
        if (toggleBtn && chatBubble) {
            // Supprimer les anciens listeners s'ils existent
            if (toggleBtn._toggleHandler) {
                toggleBtn.removeEventListener('click', toggleBtn._toggleHandler);
            }
            
            // Créer le handler et le sauvegarder
            const toggleHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const isCurrentlyMinimized = chatBubble.classList.contains('minimized');
                
                if (isCurrentlyMinimized) {
                    // Maximiser
                    chatBubble.classList.remove('minimized');
                    toggleBtn.textContent = '−';
                    console.log('📖 Chat ouvert');
                } else {
                    // Minimiser
                    chatBubble.classList.add('minimized');
                    toggleBtn.textContent = '+';
                    console.log('📕 Chat minimisé');
                }
            };
            
            toggleBtn._toggleHandler = toggleHandler;
            toggleBtn.addEventListener('click', toggleHandler);
            
            // Empêcher la fermeture quand on clique dans la bulle
            chatBubble.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // NE PLUS fermer automatiquement la bulle quand on clique en dehors
            // L'utilisateur doit utiliser le bouton - pour la fermer
        }
        
        // Ajouter la recherche de joueurs
        const searchInput = document.getElementById('playerSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterPlayers(e.target.value);
            });
        }
        
        // Initialiser l'affichage de la bulle après un court délai pour s'assurer que le DOM est prêt
        setTimeout(() => {
            console.log('🔄 Première mise à jour de la bulle...');
            this.updateChatBubble();
        }, 100);
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
            modeDisplay.textContent = this.getAcceptModeIcon();
        }

        // Mettre à jour le compteur de joueurs
        const playerCount = document.getElementById('roomPlayerCount');
        if (playerCount) {
            const maxPlayers = this.myRoomInfo?.maxPlayers || 8;
            playerCount.textContent = `${this.playersInRoom.size}/${maxPlayers}`;
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
                btn.addEventListener('click', async (e) => {
                    const peerId = e.target.dataset.peerId;
                    if (await CustomModals.showConfirm('🚪 Exclure le joueur ?', 'Êtes-vous sûr de vouloir exclure ce joueur ?', '🚪 Exclure', '❌ Annuler')) {
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

        // Mettre à jour la bulle de chat flottante
        this.updateChatBubble();
    }

    // Mettre à jour la bulle de chat flottante
    updateChatBubble() {
        const bubbleList = document.getElementById('connectedPlayersList');
        const onlineCountEl = document.getElementById('onlineCount');
        
        if (!bubbleList || !onlineCountEl) {
            console.warn('⚠️ Éléments de la bulle non trouvés');
            return;
        }

        // S'assurer que 'me' est toujours présent si le chatSystem est initialisé
        if (this.chatSystem.currentUser && !this.availablePlayers.has('me')) {
            console.log('🔧 Réajout de "me" dans availablePlayers');
            this.availablePlayers.set('me', {
                username: this.chatSystem.currentUser,
                avatar: this.chatSystem.getUserAvatar(this.chatSystem.currentUser) || '👤',
                isMe: true,
                playerCount: 1,
                maxPlayers: 8,
                mode: 'solo',
                acceptMode: this.acceptMode
            });
        }

        const count = this.availablePlayers.size;
        onlineCountEl.textContent = count;
        
        // Log seulement si le nombre change
        if (this._lastPlayerCount !== count) {
            console.log('🔄 Mise à jour bulle chat:', count, 'joueurs');
            this._lastPlayerCount = count;
        }

        if (count === 0) {
            bubbleList.innerHTML = `
                <div class="no-players-message">
                    <span class="emoji">💤</span>
                    Aucun joueur en ligne...
                </div>
            `;
            return;
        }

        let bubbleHTML = '';
        this.availablePlayers.forEach((player, peerId) => {
            const modeIcon = {
                'auto': '🟢',
                'manual': '✋'
            }[player.acceptMode] || '✋';

            const modeName = {
                'auto': 'En ligne',
                'manual': 'Manuel'
            }[player.acceptMode] || 'Manuel';

            // Afficher un badge "Vous" pour le joueur local
            const isMe = player.isMe || peerId === 'me';
            const nameDisplay = isMe ? `${player.username} <span style="color: #667eea; font-weight: bold;">(Vous)</span>` : player.username;
            
            // Vérifier si le joueur est en vocal
            const isInVoice = isMe && window.voiceUI?.voiceSystem?.isInVoiceRoom;
            
            // État du micro pour ce joueur
            let micStatus = '';
            if (isInVoice) {
                const isMuted = window.voiceUI?.voiceSystem?.isMuted || false;
                micStatus = isMuted ? '🔇' : '🎤';
            } else if (!isMe && window.voiceUI?.voiceSystem?.voiceCalls?.has(peerId)) {
                // Autre joueur en vocal
                const voiceState = window.voiceUI?.voiceSystem?.getPeerVoiceState(peerId);
                const isSpeaking = voiceState?.isSpeaking || false;
                micStatus = isSpeaking ? '<span class="voice-speaking">🎤</span>' : '🎤';
            }
            
            const voiceBadge = micStatus ? `<span class="voice-active-badge" title="État vocal">${micStatus}</span>` : '';

            bubbleHTML += `
                <div class="connected-player-item" data-peer-id="${peerId}">
                    <div class="player-avatar-mini">${player.avatar || '👤'}</div>
                    <div class="player-details">
                        <div class="player-name-mini">${nameDisplay} ${voiceBadge}</div>
                        <div class="player-status-mini">
                            <span class="status-indicator"></span>
                            <span>${player.playerCount || 1}/${player.maxPlayers || 8}</span>
                            <span class="room-mode-badge">${modeIcon} ${modeName}</span>
                            ${player.isBot && player.difficulty ? `<span class="bot-difficulty-badge" style="font-size: 9px; color: #667eea; font-weight: 600; margin-left: 4px;">${player.difficulty}</span>` : ''}
                        </div>
                    </div>
                    ${!isMe ? `
                        <div class="player-actions-mini">
                            ${window.voiceUI?.voiceSystem?.isInVoiceRoom && window.voiceUI?.voiceSystem?.voiceCalls?.has(peerId) ? `
                                <button class="action-btn-mini btn-voice-control" data-peer-id="${peerId}" title="Contrôles vocaux">
                                    🔊
                                </button>
                            ` : ''}
                            ${player.isBot ? `
                                <button class="action-btn-mini btn-change-bot" title="Changer de bot">
                                    🔄
                                </button>
                            ` : `
                                <button class="action-btn-mini btn-join-bubble" data-peer-id="${peerId}" data-username="${player.username}" title="Jouer avec ${player.username}">
                                    🎮
                                </button>
                            `}
                            ${!player.isBot ? `
                                <button class="action-btn-mini btn-more-options" data-peer-id="${peerId}" data-username="${player.username}" title="Plus d'options">
                                    ⋮
                                </button>
                            ` : ''}
                        </div>
                    ` : `
                        <div class="player-actions-mini">
                            ${isInVoice ? `
                                <button class="action-btn-mini btn-toggle-mic ${window.voiceUI?.voiceSystem?.isMuted ? 'muted' : ''}" title="${window.voiceUI?.voiceSystem?.isMuted ? 'Activer' : 'Couper'} le micro">
                                    ${window.voiceUI?.voiceSystem?.isMuted ? '🔇' : '🎤'}
                                </button>
                            ` : ''}
                            <span class="me-indicator" title="C'est vous !">👤</span>
                        </div>
                    `}
                </div>
            `;
        });

        bubbleList.innerHTML = bubbleHTML;

        // Utiliser la délégation d'événements pour éviter de perdre les écouteurs lors des mises à jour
        
        // Retirer les anciens écouteurs si présents
        const oldClickHandler = bubbleList._clickHandler;
        if (oldClickHandler) {
            bubbleList.removeEventListener('click', oldClickHandler);
        }
        
        // Créer un gestionnaire d'événements unique
        const clickHandler = (e) => {
            // Chercher le bouton parent même si on clique sur un élément enfant
            // Essayer plusieurs méthodes pour capturer le clic
            let target = e.target;
            
            // Si ce n'est pas déjà un bouton, chercher le parent bouton
            if (!target.matches('button')) {
                target = target.closest('button');
            }
            
            // Si toujours pas de bouton, vérifier si on a cliqué sur une zone d'action
            if (!target && e.target.closest('.player-actions-mini')) {
                target = e.target.closest('.player-actions-mini').querySelector('button');
            }
            
            if (!target) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // Récupérer les données depuis le bouton ou ses parents
            const peerId = target.dataset.peerId || target.closest('[data-peer-id]')?.dataset.peerId;
            const username = target.dataset.username || target.closest('[data-username]')?.dataset.username;
            
            // Log pour débug
            console.log('🖱️ Clic détecté sur:', target.className, { peerId, username });
            
            // Bouton rejoindre
            if (target.classList.contains('btn-join-bubble')) {
                console.log('🎮 Rejoindre:', { peerId, username });
                
                if (peerId && peerId.startsWith('bot-')) {
                    this.joinBotGame(username);
                } else if (peerId && username) {
                    this.requestJoinRoom(username, peerId);
                }
            }
            
            // Toggle micro (joueur local)
            else if (target.classList.contains('btn-toggle-mic')) {
                console.log('🎤 Toggle micro');
                try {
                    if (window.voiceUI?.voiceSystem) {
                        window.voiceUI.voiceSystem.toggleMute();
                        setTimeout(() => this.updateChatBubble(), 100);
                    } else {
                        console.warn('⚠️ Système vocal non disponible');
                    }
                } catch (error) {
                    console.error('❌ Erreur toggle micro:', error);
                }
            }
            
            // Contrôles vocaux
            else if (target.classList.contains('btn-voice-control')) {
                console.log('🔊 Contrôles vocaux pour:', peerId);
                try {
                    if (peerId) {
                        this.showVoiceControlMenu(peerId);
                    } else {
                        console.warn('⚠️ peerId manquant pour contrôles vocaux');
                    }
                } catch (error) {
                    console.error('❌ Erreur contrôles vocaux:', error);
                }
            }
            
            // Plus d'options
            else if (target.classList.contains('btn-more-options')) {
                console.log('⋮ Plus d\'options:', { peerId, username });
                
                if (peerId && username) {
                    this.showPlayerContextMenu(e, peerId, username);
                } else {
                    console.warn('⚠️ Données manquantes pour le menu contextuel');
                }
            }
            
            // Changer de bot (sur Unisona)
            else if (target.classList.contains('btn-change-bot')) {
                console.log('🔄 Changer de bot');
                this.showBotSelectionMenu(e);
            }
        };
        
        // Sauvegarder la référence et attacher l'écouteur
        bubbleList._clickHandler = clickHandler;
        bubbleList.addEventListener('click', clickHandler);
    }
    
    // Afficher le menu contextuel pour un joueur
    showPlayerContextMenu(event, peerId, username) {
        // Supprimer les anciens menus
        document.querySelectorAll('.player-context-menu').forEach(m => m.remove());
        
        const isBlocked = this.blockedPlayers.has(peerId);
        const isBot = peerId.startsWith('bot-');
        
        const menu = document.createElement('div');
        menu.className = 'player-context-menu';
        menu.innerHTML = `
            ${!isBot && !isBlocked ? `
                <button class="context-menu-item" data-action="block">
                    🚫 Bloquer ${username}
                </button>
            ` : ''}
            ${!isBot && isBlocked ? `
                <button class="context-menu-item" data-action="unblock">
                    ✅ Débloquer ${username}
                </button>
            ` : ''}
            ${!isBot ? `
                <button class="context-menu-item" data-action="report">
                    ⚠️ Signaler ${username}
                </button>
            ` : ''}
        `;
        
        // Positionner le menu - utiliser le bouton cliqué (closest('button'))
        const button = event.target.closest('button');
        const rect = button ? button.getBoundingClientRect() : event.target.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.left = `${rect.left - 100}px`;
        menu.style.zIndex = '10000';
        
        document.body.appendChild(menu);
        
        // Event listeners
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                
                switch(action) {
                    case 'block':
                        this.blockPlayer(peerId, username);
                        break;
                    case 'unblock':
                        this.unblockPlayer(peerId, username);
                        break;
                    case 'report':
                        this.reportPlayer(peerId, username);
                        break;
                }
                
                menu.remove();
            });
        });
        
        // Fermer au clic extérieur
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 100);
    }

    showBotSelectionMenu(event) {
        // Empêcher la propagation de l'événement
        if (event) {
            event.stopPropagation();
        }
        
        // Supprimer les anciens menus et leurs event listeners
        document.querySelectorAll('.bot-selection-menu').forEach(m => {
            if (m._closeHandler) {
                document.removeEventListener('click', m._closeHandler);
            }
            m.remove();
        });
        
        // Liste des bots disponibles
        const bots = [
            { id: 'bot-unisona', name: 'Unisona', emoji: '🎭', description: 'Bot principal polyvalent', difficulty: '🎯 Adaptatif' },
            { id: 'bot-origine', name: 'Origine', emoji: '🌟', description: 'Ado inclusif fun', difficulty: '⚡ Expert' },
            { id: 'bot-originaire', name: 'Originaire', emoji: '🌾', description: 'Agriculteur futur sage', difficulty: '🔥 Difficile' },
            { id: 'bot-dreamer', name: 'Dreamer', emoji: '🤖', description: 'Robot rigolo apprenti', difficulty: '🎯 Moyen' },
            { id: 'bot-materik', name: 'Materik', emoji: '⚙️', description: 'Ingénieur russe technique', difficulty: '🐢 Facile' },
            { id: 'bot-mpandawaha', name: 'M.Pandawaha', emoji: '🎋', description: 'Maître sage bambou', difficulty: '🎲 Intermédiaire' }
        ];
        
        // Récupérer le bot actif actuel
        const activeBot = localStorage.getItem('activeBot') || 'bot-unisona';
        
        const menu = document.createElement('div');
        menu.className = 'bot-selection-menu';
        menu.innerHTML = `
            <div class="bot-menu-header">🔄 Choisir votre compagnon IA</div>
            <div class="bot-menu-items">
                ${bots.map(bot => `
                    <button class="bot-menu-item ${bot.id === activeBot ? 'active' : ''}" data-bot-id="${bot.id}">
                        <span class="bot-emoji">${bot.emoji}</span>
                        <div class="bot-info">
                            <div class="bot-name">${bot.name} ${bot.id === activeBot ? '✓' : ''}</div>
                            <div class="bot-desc">${bot.description}</div>
                            <div class="bot-difficulty" style="font-size: 10px; color: #667eea; font-weight: 600; margin-top: 2px;">${bot.difficulty}</div>
                        </div>
                    </button>
                `).join('')}
            </div>
        `;
        
        // Positionner le menu au centre de l'écran
        menu.style.position = 'fixed';
        menu.style.top = '50%';
        menu.style.left = '50%';
        menu.style.transform = 'translate(-50%, -50%)';
        menu.style.zIndex = '10000';
        
        document.body.appendChild(menu);
        
        // Event listeners pour les items
        menu.querySelectorAll('.bot-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const botId = item.dataset.botId;
                this.switchActiveBot(botId);
                
                // Nettoyer proprement
                if (menu._closeHandler) {
                    document.removeEventListener('click', menu._closeHandler);
                }
                menu.remove();
            });
        });
        
        // Fermer au clic extérieur
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !e.target.classList.contains('btn-change-bot')) {
                if (menu._closeHandler) {
                    document.removeEventListener('click', menu._closeHandler);
                }
                menu.remove();
            }
        };
        
        // Sauvegarder la référence du handler
        menu._closeHandler = closeMenu;
        
        // Attacher l'écouteur après un court délai
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
    }
    
    async switchActiveBot(botId) {
        // Arrêter tous les bots
        if (window.stopAllBots) {
            window.stopAllBots();
        }
        
        // Supprimer tous les bots de la liste des joueurs
        const botPeers = Array.from(this.availablePlayers.keys()).filter(id => id.startsWith('bot-'));
        botPeers.forEach(id => {
            this.availablePlayers.delete(id);
        });
        
        // Sauvegarder le bot actif
        localStorage.setItem('activeBot', botId);
        
        // Ajouter le nouveau bot
        const botNames = {
            'bot-unisona': { name: 'Unisona', avatar: '🎭', displayName: 'Unisona', difficulty: '🎯 Adaptatif' },
            'bot-origine': { name: '🤖 Origine', avatar: '👼', displayName: 'Origine', difficulty: '⚡ Expert' },
            'bot-originaire': { name: '🤖 Originaire', avatar: '🌹', displayName: 'Originaire', difficulty: '🔥 Difficile' },
            'bot-dreamer': { name: '🤖 Dreamer', avatar: '⛪', displayName: 'Dreamer', difficulty: '🎯 Moyen' },
            'bot-materik': { name: '🤖 Materik', avatar: '📖', displayName: 'Materik', difficulty: '🐢 Facile' },
            'bot-mpandawaha': { name: '🤖 M.Pandawaha', avatar: '🎲', displayName: 'M.Pandawaha', difficulty: '🎲 Intermédiaire' }
        };
        
        const botInfo = botNames[botId];
        if (botInfo) {
            this.availablePlayers.set(botId, {
                username: botInfo.displayName,
                avatar: botInfo.avatar,
                isBot: true,
                difficulty: botInfo.difficulty,
                playerCount: 1,
                maxPlayers: 2,
                mode: 'solo'
            });
            
            // Démarrer le bot approprié
            setTimeout(() => {
                if (botId === 'bot-unisona') {
                    if (window.welcomeAI && !window.welcomeAI.isPlaying) {
                        window.welcomeAI.joinSoloMode();
                    }
                } else if (window.aiBots) {
                    // Trouver le bot par son nom complet
                    const existingBot = window.aiBots.find(b => b.name === botInfo.name);
                    if (existingBot && !existingBot.isPlaying && window.game) {
                        existingBot.startPlaying(window.game);
                    }
                }
            }, 500);
            
            // Mettre à jour l'interface
            this.updateChatBubble();
            
            // Notifier l'utilisateur
            if (window.simpleChatSystem) {
                window.simpleChatSystem.showMessage(
                    `${botInfo.avatar} ${botInfo.displayName} est maintenant votre compagnon IA actif !`,
                    'system'
                );
            }
        }
    }
    
    // Bloquer un joueur
    async blockPlayer(peerId, username) {
        if (await CustomModals.showConfirm('🚫 Bloquer le joueur ?', `Bloquer ${username} ?\n\nCe joueur ne pourra plus vous envoyer de demandes.`, '🚫 Bloquer', '❌ Annuler')) {
            this.blockedPlayers.add(peerId);
            
            // Déconnecter si connecté
            const conn = this.chatSystem.connections.get(peerId);
            if (conn) {
                conn.close();
                this.chatSystem.connections.delete(peerId);
            }
            
            // Retirer des listes
            this.playersInRoom.delete(peerId);
            this.pendingRequests.delete(peerId);
            
            this.chatSystem.showMessage(`🚫 ${username} a été bloqué`, 'system');
            this.updateChatBubble();
            this.updateUI();
            
            // Sauvegarder dans localStorage
            this.saveBlockedPlayers();
        }
    }
    
    // Débloquer un joueur
    unblockPlayer(peerId, username) {
        this.blockedPlayers.delete(peerId);
        this.chatSystem.showMessage(`✅ ${username} a été débloqué`, 'system');
        this.updateChatBubble();
        
        // Sauvegarder dans localStorage
        this.saveBlockedPlayers();
    }
    
    // Signaler un joueur
    async reportPlayer(peerId, username) {
        const reason = await CustomModals.showPrompt('🚨 Signaler le joueur', `Signaler ${username}\n\nRaison du signalement :`, '', 'Ex: Comportement inapproprié', '🚨 Signaler', '❌ Annuler');
        
        if (reason && reason.trim()) {
            // Ici on pourrait envoyer à un serveur de modération
            console.log(`🚨 Signalement: ${username} (${peerId}) - Raison: ${reason}`);
            
            this.chatSystem.showMessage(`⚠️ Signalement envoyé pour ${username}`, 'system');
            
            // Pour l'instant, juste bloquer automatiquement
            if (await CustomModals.showConfirm('🚫 Bloquer aussi ?', `Voulez-vous également bloquer ${username} ?`, '🚫 Bloquer', '❌ Non')) {
                this.blockedPlayers.add(peerId);
                this.updateChatBubble();
                this.saveBlockedPlayers();
            }
        }
    }
    
    // Sauvegarder la liste des joueurs bloqués
    saveBlockedPlayers() {
        try {
            const blocked = Array.from(this.blockedPlayers);
            localStorage.setItem('blockedPlayers', JSON.stringify(blocked));
        } catch (error) {
            console.error('Erreur sauvegarde blocklist:', error);
        }
    }
    
    // Charger la liste des joueurs bloqués
    loadBlockedPlayers() {
        try {
            const blocked = localStorage.getItem('blockedPlayers');
            if (blocked) {
                const list = JSON.parse(blocked);
                this.blockedPlayers = new Set(list);
            }
        } catch (error) {
            console.error('Erreur chargement blocklist:', error);
        }
    }
    
    // Filtrer les joueurs dans la bulle
    filterPlayers(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const playerItems = document.querySelectorAll('.connected-player-item');
        
        playerItems.forEach(item => {
            const username = item.dataset.username?.toLowerCase() || '';
            
            if (!term || username.includes(term)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }
    // Rejoindre une partie avec un bot
    joinBotGame(botName) {
        console.log('🤖 Démarrage d\'une partie avec:', botName);
        
        // Vérifier si le jeu est démarré
        if (!window.game || !window.game.gameStarted) {
            if (window.simpleChatSystem) {
                window.simpleChatSystem.showMessage('⚠️ Démarre d\'abord une partie avant d\'inviter un bot !', 'system');
            }
            console.warn('⚠️ Le jeu n\'est pas démarré');
            return;
        }
        
        // Afficher un message
        if (window.simpleChatSystem) {
            window.simpleChatSystem.showMessage(`🤖 Démarrage d'une partie avec ${botName}...`, 'system');
        }
        
        // Fermer le modal si ouvert
        const modal = document.getElementById('multiplayerModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Cas spécial : Unisona (elle a son propre système)
        if (botName === 'Unisona' || botName === '👼 Unisona') {
            if (window.welcomeAI) {
                console.log('✅ Unisona trouvée, démarrage en mode solo...');
                const started = window.welcomeAI.joinSoloMode();
                if (started && window.simpleChatSystem) {
                    window.simpleChatSystem.showMessage('🎮 👼 Unisona a rejoint la partie !', 'ai');
                }
            } else {
                console.error('❌ welcomeAI non disponible');
            }
            return;
        }
        
        // Démarrer le jeu avec les autres bots (via aiBotManager)
        if (window.aiBotManager) {
            // Trouver le bot
            const bot = window.aiBotManager.getBot(botName);
            if (bot) {
                console.log(`✅ Bot trouvé: ${botName}, démarrage...`);
                // Démarrer le bot (il jouera automatiquement)
                bot.startPlaying(window.game);
                
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.showMessage(`🎮 ${botName} a rejoint la partie !`, 'ai');
                }
            } else {
                console.error('❌ Bot non trouvé:', botName);
            }
        }
    }
    
    // Afficher les contrôles vocaux pour un joueur
    showVoiceControlMenu(peerId) {
        const player = this.availablePlayers.get(peerId);
        if (!player) return;
        
        const currentVolume = window.voiceUI?.voiceSystem?.audioElements?.get(peerId)?.volume || 1;
        const volumePercent = Math.round(currentVolume * 100);
        
        const menu = `
            <div class="voice-control-popup" id="voiceControlPopup">
                <div class="popup-header">
                    <h4>🔊 Contrôles vocaux - ${player.username}</h4>
                    <button class="close-popup" onclick="document.getElementById('voiceControlPopup').remove()">✕</button>
                </div>
                <div class="popup-content">
                    <label>Volume: <span id="volumeValue">${volumePercent}%</span></label>
                    <input type="range" id="volumeSlider" min="0" max="100" value="${volumePercent}" step="5">
                    <button class="btn-mute-peer" data-peer-id="${peerId}">
                        ${currentVolume === 0 ? '🔊 Réactiver' : '🔇 Couper le son'}
                    </button>
                </div>
            </div>
        `;
        
        // Supprimer l'ancien menu s'il existe
        const oldMenu = document.getElementById('voiceControlPopup');
        if (oldMenu) oldMenu.remove();
        
        // Ajouter le nouveau menu
        document.body.insertAdjacentHTML('beforeend', menu);
        
        // Gérer le slider de volume
        const slider = document.getElementById('volumeSlider');
        const valueDisplay = document.getElementById('volumeValue');
        
        slider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            valueDisplay.textContent = `${e.target.value}%`;
            if (window.voiceUI?.voiceSystem) {
                window.voiceUI.voiceSystem.setPeerVolume(peerId, volume);
            }
        });
        
        // Gérer le bouton mute/unmute
        document.querySelector('.btn-mute-peer').addEventListener('click', () => {
            const audio = window.voiceUI?.voiceSystem?.audioElements?.get(peerId);
            if (audio) {
                const newVolume = audio.volume === 0 ? 1 : 0;
                audio.volume = newVolume;
                slider.value = newVolume * 100;
                valueDisplay.textContent = `${Math.round(newVolume * 100)}%`;
                document.querySelector('.btn-mute-peer').textContent = newVolume === 0 ? '🔊 Réactiver' : '🔇 Couper le son';
            }
        });
        
        // Fermer en cliquant en dehors
        setTimeout(() => {
            document.addEventListener('click', function closePopup(e) {
                const popup = document.getElementById('voiceControlPopup');
                if (popup && !popup.contains(e.target)) {
                    popup.remove();
                    document.removeEventListener('click', closePopup);
                }
            });
        }, 100);
    }
}

// Exposer la classe globalement
window.RoomSystem = RoomSystem;

// Instance globale
window.roomSystem = null;

