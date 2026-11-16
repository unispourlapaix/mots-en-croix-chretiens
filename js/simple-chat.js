// Système de chat P2P unifié - interface SMS compacte avec WebRTC
const localNicknameKey = 'mots-croix-pseudo';

class SimpleChatSystem {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.skipWelcomeMessages = false; // Flag pour éviter les messages lors du chargement
        this.lastConnectedUser = null; // Éviter les messages en double
        
        // P2P
        this.peer = null;
        this.connections = new Map(); // peerId -> connection
        this.roomCode = null;
        this.isHost = false;
        
        // Système de blocage
        this.blockedPlayers = new Set(); // Set de peer IDs bloqués
        this.loadBlockedPlayers();
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        this.updateUsername();
    }

    updateUsername() {
        if (!this.currentUser) {
            this.currentUser = this.getSavedNickname() ||
                'Joueur' + Math.floor(Math.random() * 1000);
        }
    }

    getSavedNickname() {
        try {
            return localStorage.getItem(localNicknameKey) || localStorage.getItem('mots-croix-google-pseudo');
        } catch {
            return null;
        }
    }

    setNickname(name) {
        localStorage.setItem(localNicknameKey, name);
        this.currentUser = name;
        window.roomSystem?.updateUsername(name);
        window.dispatchEvent(new CustomEvent('usernameUpdated', { detail: { username: name } }));
    }

    initP2P() {
        if (this.peer) {
            console.log('✅ P2P déjà initialisé, skip');
            return;
        }

        console.log('🚀 Initialisation P2P...');
        
        // Vérifier que PeerJS est disponible
        if (typeof Peer === 'undefined') {
            console.error('❌ PeerJS non chargé - Bibliothèque manquante');
            if (!this.skipWelcomeMessages) {
                this.showMessage('⚠️ Mode hors ligne - PeerJS non disponible', 'system');
            }
            return;
        }
        
        // Préparer le pseudo local
        this.updateUsername();

        try {
            // Récupérer le peer ID sauvegardé (persisté entre sessions)
            const savedPeerId = this.getSavedPeerId();
            
            // Configuration PeerJS avec serveurs STUN pour meilleure connectivité
            // Utiliser le serveur Cloud par défaut (pas de cookies Cloudflare)
            const peerConfig = {
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                },
                debug: 0 // 0 = erreurs seulement, 3 = verbose
            };
            
            // Utiliser le peer ID sauvegardé si disponible
            if (savedPeerId) {
                console.log('🔄 Réutilisation du peer ID sauvegardé:', savedPeerId);
                this.peer = new Peer(savedPeerId, peerConfig);
            } else {
                console.log('🆕 Création d\'un nouveau peer ID');
                this.peer = new Peer(peerConfig);
            }
            
            this.setupPeerHandlers();
            
        } catch (error) {
            console.error('❌ Erreur initialisation P2P:', error);
            console.error('❌ Détails erreur:', error.message, error.stack);
            // Ne pas afficher le message d'erreur au chargement initial
            if (!this.skipWelcomeMessages) {
                this.showMessage('⚠️ Mode hors ligne - Connexion P2P indisponible', 'system');
            }
        }
    }

    // Configurer les gestionnaires d'événements PeerJS
    setupPeerHandlers(connectionTimeout) {
        if (!this.peer) return;
        
        // Nettoyer les anciens listeners si réutilisation
        this.peer.removeAllListeners();
        
        this.peer.on('open', (id) => {
            console.log('🔗 PeerJS connecté, ID:', id);
            this.roomCode = id;
            
            // Annuler le timeout fallback si la connexion réussit
            if (connectionTimeout) {
                clearTimeout(connectionTimeout);
            }
            
            // Sauvegarder le peer ID pour les prochaines sessions
            this.savePeerId(id);
            window.friendsSystem?.setMyFriendCode(id);
            
            // Notifier l'UI que le peer est prêt
            window.dispatchEvent(new CustomEvent('roomCreated', { detail: { roomCode: id } }));
        });

        this.peer.on('connection', (conn) => {
            if (conn.label === 'friend-presence-v1') {
                window.realtimeLobbySystem?.handleIncoming(conn);
                return;
            }
            // Bloquer les connexions de joueurs bloqués
            if (this.isPlayerBlocked(conn.peer)) {
                console.log('🚫 Connexion refusée (joueur bloqué):', conn.peer);
                conn.close();
                return;
            }
            
            // handleConnection gère déjà tous les événements 'data'
            this.handleConnection(conn);
        });

        this.peer.on('error', (err) => {
            if (window.realtimeLobbySystem?.isProbeFailure(err)) return;
            // Ignorer les erreurs de connexion réseau (normales pour localhost)
            if (err.type === 'network' || err.message?.includes('Lost connection')) {
                console.log('ℹ️ PeerJS: Connexion serveur perdue (normal en localhost)');
                return;
            }
            
            // Log détaillé de l'erreur pour les autres cas
            console.error('❌ Erreur PeerJS:', {
                type: err.type,
                message: err.message,
                error: err
            });
            
            // Ignorer les erreurs de connexion à un peer (joueur déconnecté/inexistant)
            if (err.type === 'peer-unavailable' || err.message?.includes('Could not connect to peer')) {
                console.log('ℹ️ PeerJS: Joueur non disponible ou déconnecté');
                this.showMessage('⚠️ Ce joueur est déconnecté ou n\'existe plus', 'system');
                return;
            }
            
            // Erreur d'ID invalide
            if (err.type === 'invalid-id') {
                console.error('❌ PeerJS: ID invalide, régénération...');
                localStorage.removeItem('peerjs_id'); // Supprimer l'ID sauvegardé
                this.showMessage('⚠️ Reconnexion en cours...', 'system');
                // Retry sans ID sauvegardé
                setTimeout(() => {
                    if (this.peer) this.peer.destroy();
                    this.peer = null;
                    this.initP2P();
                }, 1000);
                return;
            }
            
            // Erreurs critiques
            this.showMessage('⚠️ Erreur de connexion P2P', 'system');
            
            // Ne détruire le peer que pour des erreurs vraiment critiques
            if (err.type === 'server-error' || err.type === 'socket-error') {
                if (this.peer) {
                    this.peer.destroy();
                    this.peer = null;
                }
            }
        });
    }

    // Créer une room P2P
    createRoom() {
        // Initialiser P2P si nécessaire
        if (!this.peer) {
            this.initP2P();
        }

        if (!this.peer) {
            this.showMessage('Initialisation P2P en cours...', 'system');
            return null;
        }

        this.isHost = true;
        this.roomCode = this.peer.id;
        this.showMessage('Partie créée ! Partagez le code pour inviter des amis', 'system');
        
        // Attendre un peu que peer.id soit bien défini
        setTimeout(() => {
            if (this.peer && this.peer.id) {
                this.roomCode = this.peer.id;
                // Émettre un événement pour notifier l'UI
                window.dispatchEvent(new CustomEvent('roomCreated', { detail: { roomCode: this.roomCode } }));
            } else {
                // Si peer.id n'est toujours pas défini, le code sera mis à jour via l'événement 'open'
                console.log('⏳ En attente de l\'ID PeerJS...');
            }
        }, 500);
        
        return this.roomCode || 'En attente...';
    }

    // Rejoindre une room P2P
    async joinRoom(roomCode) {
        if (!roomCode || roomCode.trim() === '') {
            this.showMessage('❌ Code de partie invalide', 'system');
            return false;
        }

        // Vérifier que ce n'est pas notre propre code
        if (this.peer && this.peer.id === roomCode) {
            this.showMessage('❌ Vous ne pouvez pas rejoindre votre propre partie', 'system');
            return false;
        }

        // Initialiser P2P si nécessaire
        if (!this.peer) {
            this.initP2P();
            // Attendre un peu l'initialisation
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        if (!this.peer) {
            this.showMessage('❌ Impossible d\'initialiser P2P', 'system');
            return false;
        }

        try {
            this.showMessage('🔗 Tentative de connexion...', 'system');
            
            // Récupérer la couleur du chatSystem si disponible
            const userColor = window.chatSystem?.userColor || '#ff69b4';
            
            const conn = this.peer.connect(roomCode, {
                reliable: true,
                metadata: {
                    username: this.currentUser,
                    color: userColor
                }
            });
            
            // S'assurer que metadata est défini
            if (!conn.metadata) {
                conn.metadata = {
                    username: this.currentUser,
                    color: userColor
                };
            }
            
            // Timeout de connexion
            const timeout = setTimeout(() => {
                if (!conn.open) {
                    conn.close();
                    this.showMessage('❌ Code de partie introuvable ou partie fermée', 'system');
                }
            }, 10000); // 10 secondes timeout

            conn.on('open', () => {
                clearTimeout(timeout);
                console.log('✅ Connecté à:', conn.peer);
                this.connections.set(conn.peer, conn);
                this.roomCode = roomCode;
                this.showMessage('✅ Connecté à la partie !', 'system');
                
                // Ajouter automatiquement comme ami
                if (window.friendsSystem && conn.peer) {
                    const username = conn.metadata?.username || 'Ami';
                    const result = window.friendsSystem.addFriend(conn.peer, username);
                    if (result.success) {
                        console.log('🤝 Ami ajouté automatiquement:', username);
                    }
                }
                
                // Envoyer un message de bienvenue
                conn.send({
                    type: 'join',
                    username: this.currentUser
                });
                
                // Démarrer automatiquement la partie après connexion
                setTimeout(() => {
                    if (window.game && !window.game.gameStarted) {
                        console.log('🎮 Démarrage automatique de la partie...');
                        window.game.startGame();
                        this.showMessage('🎮 Partie démarrée !', 'system');
                    }
                }, 1500); // Attendre 1.5s pour recevoir le mode et la synchro
            });

            conn.on('error', (err) => {
                clearTimeout(timeout);
                console.error('❌ Erreur connexion:', err);
                this.showMessage('❌ Code de partie invalide ou connexion échouée', 'system');
            });

            this.handleConnection(conn);
            return true;
        } catch (error) {
            console.error('❌ Erreur connexion:', error);
            this.showMessage('❌ Impossible de rejoindre cette partie', 'system');
            return false;
        }
    }

    // Gérer une nouvelle connexion
    handleConnection(conn) {
        // Ne pas ajouter immédiatement à la map, attendre que la connexion soit ouverte
        
        conn.on('open', () => {
            console.log('✅ Connecté à:', conn.peer);
            
            // S'assurer que les métadonnées sont définies
            if (!conn.metadata) {
                conn.metadata = {};
            }
            if (!conn.metadata.username) {
                conn.metadata.username = this.currentUser;
            }
            if (!conn.metadata.color) {
                conn.metadata.color = window.chatSystem?.userColor || '#ff69b4';
            }
            
            this.connections.set(conn.peer, conn);
            this.showMessage('✅ Un joueur a rejoint', 'system');
            
            // Ajouter automatiquement comme ami (quand quelqu'un rejoint ma salle)
            if (window.friendsSystem && conn.peer) {
                const username = conn.metadata?.username || 'Ami';
                const result = window.friendsSystem.addFriend(conn.peer, username);
                if (result.success) {
                    console.log('🤝 Ami ajouté automatiquement:', username);
                }
            }
            
            // Notifier aussi le P2PChatSystem avec les métadonnées
            if (window.chatSystem && window.chatSystem.roomId) {
                window.chatSystem.handleIncomingConnection(conn);
            }
            
            // Envoyer un message de bienvenue avec username et color
            conn.send({
                type: 'join',
                username: this.currentUser,
                color: conn.metadata.color
            });
            
            // Envoyer le mode de jeu actuel au nouveau joueur
            if (window.game && window.game.gameMode) {
                conn.send({
                    type: 'game_action',
                    username: this.currentUser,
                    action: {
                        type: 'current_mode',
                        mode: window.game.gameMode
                    },
                    timestamp: Date.now()
                });
                console.log('📤 Mode actuel envoyé au nouveau joueur:', window.game.gameMode);
            }
            
            // Envoyer le niveau actuel au nouveau joueur
            if (window.game && window.game.currentLevel > 1) {
                conn.send({
                    type: 'game_action',
                    username: this.currentUser,
                    action: {
                        type: 'current_level',
                        level: window.game.currentLevel
                    },
                    timestamp: Date.now()
                });
                console.log('📤 Niveau actuel envoyé au nouveau joueur:', window.game.currentLevel);
            }
            
            // Si une course est en cours, envoyer l'état de la course au nouveau joueur
            if (window.multiplayerRace && window.multiplayerRace.isRaceMode) {
                const raceState = window.multiplayerRace.getRaceState();
                conn.send({
                    type: 'race',
                    action: 'state',
                    username: this.currentUser,
                    data: raceState
                });
                console.log('📤 État de course envoyé au nouveau joueur:', raceState);
            }
        });

        conn.on('data', (data) => {
            // Vérifier si c'est un message de salle
            if (window.roomSystem && data.type && 
                ['join-request', 'join-accepted', 'join-refused', 'player-kicked', 
                 'room-mode-changed', 'player-joined', 'player-left', 'host-transferred',
                 'host-left'].includes(data.type)) {
                window.roomSystem.handleRoomMessage(conn, data);
            } else {
                // Message normal
                this.handleMessage(data, conn);
            }
        });

        conn.on('close', () => {
            this.connections.delete(conn.peer);
            this.showMessage('👋 Un joueur est parti', 'system');
            
            // Notifier le P2PChatSystem
            if (window.chatSystem && window.chatSystem.connections) {
                window.chatSystem.connections.delete(conn.peer);
                const username = conn.metadata?.username || 'Utilisateur';
                // Vérifier que la méthode existe avant de l'appeler
                if (typeof window.chatSystem.sendSystemMessage === 'function') {
                    window.chatSystem.sendSystemMessage(`${username} a quitté le chat 👋`);
                }
                if (typeof window.chatSystem.updateParticipantCount === 'function') {
                    window.chatSystem.updateParticipantCount();
                }
            }
            
            // Notifier le room system
            if (window.roomSystem) {
                window.roomSystem.handlePlayerLeft({
                    peerId: conn.peer,
                    username: 'Joueur déconnecté'
                });
            }
        });

        conn.on('error', (err) => {
            console.error('❌ Erreur connexion:', err);
            this.connections.delete(conn.peer);
            this.showMessage('❌ Erreur de connexion avec un joueur', 'system');
        });
    }

    // Gérer les messages reçus
    handleMessage(data, conn) {
        if (window.privateRoom?.active && ['game_action', 'game_state', 'game_sync', 'game_update', 'race'].includes(data.type)) return;
        // Router les messages du P2PChatSystem (chat communautaire)
        if (window.chatSystem && ['message', 'history', 'system'].includes(data.type)) {
            window.chatSystem.handleIncomingMessage(data, conn.peer);
            return; // Ne pas traiter dans SimpleChatSystem
        }
        
        // Gérer les invitations de jeu depuis le lobby
        if (data.type === 'game_invite') {
            this.handleGameInvite(conn, data);
            return;
        }
        
        // Gérer l'arrivée d'un nouveau joueur dans la salle
        if (data.type === 'player_joined_room') {
            this.handlePlayerJoinedRoom(conn, data);
            return;
        }
        
        // Gérer les messages de la salle unifiée
        if (data.type === 'chat_message') {
            console.log('📨 Message salle unifiée reçu:', data);
            this.showMessage(data.message, 'user', data.from);
            return;
        } else if (data.type === 'game_sync') {
            console.log('🔄 Sync jeu reçu:', data);
            if (window.game) {
                // Appliquer le mode de jeu si fourni
                if (data.gameMode && data.gameMode !== window.game.gameMode) {
                    console.log(`🎯 Changement mode: ${window.game.gameMode} → ${data.gameMode}`);
                    window.game.gameMode = data.gameMode;
                    localStorage.setItem('gameMode', data.gameMode);
                    window.game.updateModeButtons();
                }
                
                // Si le jeu est déjà démarré chez l'hôte, synchroniser l'état complet
                if (data.gameStarted && data.grid) {
                    window.game.currentLevel = data.level;
                    window.game.grid = data.grid;
                    window.game.score = data.score;
                    // Redessiner la grille avec les données synchronisées
                    if (window.game.words && window.game.words.length > 0) {
                        window.game.createGrid(window.game.words);
                        // Restaurer les lettres de la grille synchronisée
                        window.game.restoreGridLetters();
                    }
                } else {
                    // Jeu pas encore démarré chez l'hôte, juste appliquer le mode et niveau
                    window.game.currentLevel = data.level || 1;
                }
            }
            return;
        } else if (data.type === 'game_update') {
            console.log('📊 Update jeu reçu:', data);
            if (window.lobbyTabsManager) {
                window.lobbyTabsManager.handleGameUpdate(data);
            }
            return;
        }
        
        if (data.type === 'message') {
            this.receiveMessage(data.username, data.text);
        } else if (data.type === 'join') {
            this.showMessage(`${data.username} a rejoint`, 'system');
            
            // Si une course est en cours, envoyer l'état au nouveau joueur
            if (window.multiplayerRace && window.multiplayerRace.isRaceMode) {
                const raceState = window.multiplayerRace.getRaceState();
                conn.send({
                    type: 'race',
                    action: 'state',
                    username: this.currentUser,
                    data: raceState
                });
                console.log('📤 État de course envoyé à', data.username, ':', raceState);
            }
            
            // Envoyer l'état actuel du jeu au nouveau joueur
            if (window.game && window.game.gameStarted) {
                conn.send({
                    type: 'game_state',
                    username: this.currentUser,
                    level: window.game.currentLevel,
                    grid: window.game.grid,
                    score: window.game.score
                });
                console.log('📤 État du jeu envoyé à', data.username);
            }
        } else if (data.type === 'race') {
            // Transmettre les messages de course au système multiplayer
            if (window.multiplayerRace) {
                window.multiplayerRace.receiveProgress(data.username, data.action, data.data);
            }
        } else if (data.type === 'game_action') {
            // Recevoir une action de jeu d'un autre joueur
            this.handleGameAction(data);
        } else if (data.type === 'game_state') {
            // Recevoir l'état complet du jeu
            this.handleGameState(data);
        }
    }

    // Générer un avatar icône basé sur le username
    getUserAvatar(username) {
        if (!username) return '👤';
        
        // Vérifier s'il y a un avatar personnalisé sauvegardé
        const customAvatar = localStorage.getItem(`avatar_${username}`);
        if (customAvatar) {
            return customAvatar;
        }
        
        // Sinon, générer un avatar par défaut
        const avatars = [
            '👨', '👩', '👦', '👧', '🧑', '👴', '👵', '👶',
            '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲',
            '🥷', '👸', '🤴', '🧙', '🧚', '🧛', '🧜', '🧝',
            '😇', '😎', '🤓', '🤩', '🥳', '😊', '😁', '😄'
        ];
        
        // Utiliser le hash du username pour choisir un avatar constant
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % avatars.length;
        return avatars[index];
    }

    // Sauvegarder l'avatar personnalisé
    setUserAvatar(username, avatar) {
        if (!username) return;
        localStorage.setItem(`avatar_${username}`, avatar);
    }

    // Fermer/minimiser le menu du chat
    closeChat() {
        const chatBubble = document.getElementById('chatBubble');
        const toggleBtn = document.getElementById('toggleChatBubble');
        if (chatBubble && !chatBubble.classList.contains('minimized')) {
            chatBubble.classList.add('minimized');
            if (toggleBtn) toggleBtn.textContent = '+';
        }
    }

    showMessage(text, type = 'message', username = null) {
        const container = document.getElementById('chatSmsContainer');
        const messagesDiv = document.getElementById('chatSmsMessages');
        if (!messagesDiv) return;

        // Afficher le container si caché
        if (container && container.classList.contains('hidden')) {
            container.classList.remove('hidden');
        }

        // Masquer les codes de connexion dans le texte (sauf pour les messages système)
        let displayText = text;
        if (type !== 'system') {
            displayText = this.maskConnectionCodes(text);
        }

        // Créer le message
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-sms-message ${type === 'own' ? 'own' : type === 'ai' ? 'ai' : type === 'system' ? 'system' : 'other'}`;

        // Générer avatar pour les messages utilisateurs
        const avatar = this.getUserAvatar(username || this.currentUser);

        if (type === 'system' || type === 'ai') {
            messageDiv.textContent = type === 'system' ? `✨ ${displayText}` : displayText;
        } else {
            const avatarElement = document.createElement('span');
            avatarElement.className = 'chat-avatar';
            avatarElement.textContent = avatar;
            const nameElement = document.createElement('span');
            nameElement.className = 'username';
            nameElement.textContent = (type === 'own' ? this.currentUser : username || 'Anonyme') + ':';
            messageDiv.append(avatarElement, nameElement, ' ' + displayText);
        }

        messagesDiv.prepend(messageDiv);
        
        // Son de message reçu (sauf pour ses propres messages et système)
        if (type !== 'own' && type !== 'system' && window.audioSystem) {
            window.audioSystem.playMessageReceived();
        }

        // Limiter à 30 messages max (10 visibles + 20 en scroll)
        const messages = messagesDiv.children;
        if (messages.length > 30) {
            messages[messages.length - 1].remove();
        }

        // Scroll vers le haut (nouveau message visible)
        messagesDiv.scrollTop = 0;
    }

    /**
     * Masquer les codes de connexion dans le texte
     */
    maskConnectionCodes(text) {
        // Détecter les codes de salle avec préfixe cc- (ex: cc-abc123def456 ou cc-uuid-avec-tirets)
        const codePattern = /\bcc-[a-zA-Z0-9\-]{8,}\b/g;
        return text.replace(codePattern, (match) => {
            // Masquer complètement le code après le préfixe cc-
            const prefix = 'cc-';
            const code = match.substring(3); // Retirer "cc-"
            const masked = '•'.repeat(code.length);
            return `${prefix}${masked}`;
        });
    }

    // Envoyer un message à tous
    async sendMessage(text) {
        if (window.privateRoom?.active) {
            window.privateRoom.sendChat(text);
            return;
        }

        // Préparer le pseudo local
        this.updateUsername();

        // Vérifier si c'est un code de salle avec préfixe cc- (accepter tirets pour UUID)
        const roomCodePatternWithPrefix = /^cc-[a-zA-Z0-9\-]{8,}$/;
        if (roomCodePatternWithPrefix.test(text.trim())) {
            // Extraire le code réel (sans préfixe cc-)
            const actualCode = text.trim().substring(3); // Retirer "cc-"
            
            console.log('🔍 Code détecté:', text.trim(), '→ Code réel:', actualCode);
            
            // Initialiser P2P si nécessaire
            if (!this.peer) {
                console.log('🚀 P2P pas initialisé, initialisation...');
                this.initP2P();
                // Attendre que le peer soit prêt
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            
            // Rejoindre la salle (les messages sont gérés dans joinRoom)
            try {
                await this.joinRoom(actualCode);
            } catch (error) {
                console.error('❌ Erreur connexion:', error);
            }
            return;
        }

        // Vérifier si c'est une commande spéciale
        if (text.startsWith('/')) {
            this.handleCommand(text);
            return;
        }

        // Afficher le message localement
        this.showMessage(text, 'own', this.currentUser);
        
        // Fermer le menu du chat après l'envoi
        this.closeChat();

        // Si dans une salle unifiée, utiliser broadcastChatMessage
        if (this.isInRoom()) {
            console.log('📤 Envoi via salle unifiée');
            this.broadcastChatMessage(text);
        } 
        // Sinon, méthode P2P classique
        else if (this.connections.size > 0) {
            console.log('📤 Envoi P2P classique');
            const message = {
                type: 'message',
                username: this.currentUser,
                text: text
            };

            this.connections.forEach((conn) => {
                if (conn.open) {
                    conn.send(message);
                }
            });
        }
        
        // Envoyer à Unisona IA si activé - elle répond à TOUS les messages
        if (window.unisonaAI && window.unisonaAI.checkIfEnabled()) {
            console.log('🤖 Envoi du message à Unisona IA...');
            try {
                // Envoyer le message à l'IA et attendre la réponse
                const response = await window.unisonaAI.sendMessage(text);
                console.log('💬 Réponse de Unisona:', response);
                // Afficher la réponse dans le chat
                this.showMessage(response, 'ai', 'Unisona');
            } catch (error) {
                console.error('❌ Erreur IA:', error);
                this.showMessage('Désolée, je n\'ai pas pu répondre 😔 Erreur: ' + error.message, 'ai', 'Unisona');
            }
        } else {
            console.log('⚠️ Unisona IA non disponible ou désactivée');
        }
        
        // Envoyer à Dreamer IA (Gemini) seulement si mentionné
        if (window.dreamerAI && window.dreamerAI.checkIfEnabled()) {
            const lowerText = text.toLowerCase();
            // Détecter si le message est pour Dreamer
            if (lowerText.includes('@dreamer') || 
                lowerText.includes('dreamer') || 
                lowerText.includes('rêve') ||
                lowerText.includes('dream')) {
                
                console.log('💭 Envoi du message à Dreamer AI...');
                try {
                    const response = await window.dreamerAI.sendMessage(text);
                    // Afficher seulement si réponse valide (pas null)
                    if (response) {
                        console.log('💬 Réponse de Dreamer:', response);
                        this.showMessage(response, 'ai', 'Dreamer');
                    }
                } catch (error) {
                    console.error('❌ Erreur Dreamer:', error);
                    // Pas de message d'erreur visible pour l'utilisateur
                }
            }
        } else {
            console.log('⚠️ Dreamer IA non disponible ou désactivée');
        }
    }

    // Gérer les commandes du chat
    handleCommand(command) {
        const cmd = command.toLowerCase().trim();
        
        if (cmd === '/config' || cmd === '/configure' || cmd === '/api') {
            // Ouvrir la configuration de l'IA Unisona
            if (!window.unisonaAI) {
                this.showMessage('❌ Unisona IA n\'est pas disponible', 'system');
                return;
            }
            window.unisonaAI.showConfigModal();
            
        } else if (cmd === '/dreamer-config' || cmd === '/dreamer') {
            // Ouvrir la configuration de Dreamer (Gemini)
            if (!window.dreamerAI) {
                this.showMessage('❌ Dreamer IA n\'est pas disponible', 'system');
                return;
            }
            window.dreamerAI.showConfigModal();
            
        } else if (cmd === '/clear' || cmd === '/reset') {
            // Réinitialiser l'historique de conversation avec Unisona
            if (!window.unisonaAI) {
                this.showMessage('❌ Unisona IA n\'est pas disponible', 'system');
                return;
            }
            window.unisonaAI.clearHistory();
            this.showMessage('🔄 Historique Unisona réinitialisé', 'system');
            
        } else if (cmd === '/dreamer-clear') {
            // Réinitialiser l'historique de conversation avec Dreamer
            if (!window.dreamerAI) {
                this.showMessage('❌ Dreamer IA n\'est pas disponible', 'system');
                return;
            }
            window.dreamerAI.clearHistory();
            this.showMessage('🔄 Historique Dreamer réinitialisé', 'system');
            
        } else if (cmd === '/unisona' || cmd === '/bot' || cmd === '/ia') {
            // Inviter Unisona à rejoindre une course
            if (!window.game || !window.game.gameStarted) {
                this.showMessage('⚠️ Lance d\'abord une partie pour jouer avec Unisona !', 'system');
                return;
            }
            
            if (!window.welcomeAI) {
                this.showMessage('❌ Unisona n\'est pas disponible pour le moment', 'system');
                return;
            }
            
            if (window.welcomeAI.isPlaying) {
                this.showMessage('👼 Unisona joue déjà avec toi !', 'system');
                return;
            }
            
            // Unisona rejoint la course
            const joined = window.welcomeAI.joinRace();
            if (joined) {
                this.showMessage('🏁 Unisona te défie ! Que la meilleure joueuse gagne ! 💪', 'system');
            }
            
        } else if (cmd === '/stop-unisona' || cmd === '/unisona-stop') {
            // Arrêter Unisona
            if (!window.welcomeAI || !window.welcomeAI.isPlaying) {
                this.showMessage('Unisona ne joue pas actuellement', 'system');
                return;
            }
            
            window.welcomeAI.leaveRace();
            this.showMessage('👼 Unisona a quitté la partie', 'system');
            
        } else if (cmd === '/difficulte' || cmd === '/difficulty') {
            // Changer la difficulté d'Unisona
            const args = message.split(' ');
            if (args.length < 2) {
                const current = window.welcomeAI?.getDifficulty();
                if (current) {
                    this.showMessage(`📊 Difficulté actuelle: ${current.emoji} ${current.level} - ${current.description}`, 'system');
                    this.showMessage('💡 Utilise: /difficulte rapide | moyen | lent', 'system');
                } else {
                    this.showMessage('⚠️ Unisona n\'est pas disponible', 'system');
                }
                return;
            }
            
            const level = args[1].toLowerCase();
            if (!window.welcomeAI) {
                this.showMessage('❌ Unisona n\'est pas disponible', 'system');
                return;
            }
            
            if (window.welcomeAI.isPlaying) {
                this.showMessage('⚠️ Impossible de changer la difficulté pendant une course !', 'system');
                return;
            }
            
            const success = window.welcomeAI.setDifficulty(level);
            if (!success) {
                this.showMessage('❌ Difficulté invalide. Utilise: rapide, moyen ou lent', 'system');
            }
            
        } else if (cmd === '/aide' || cmd === '/help') {
            // Afficher l'aide
            this.showMessage('📝 Commandes disponibles :', 'system');
            this.showMessage('/config - Configurer Unisona (OpenAI)', 'system');
            this.showMessage('/dreamer-config - Configurer Dreamer (Gemini GRATUIT)', 'system');
            this.showMessage('/clear - Réinitialiser l\'historique Unisona', 'system');
            this.showMessage('/dreamer-clear - Réinitialiser l\'historique Dreamer', 'system');
            this.showMessage('/unisona ou /bot - Inviter Unisona à jouer en course', 'system');
            this.showMessage('/stop-unisona - Arrêter Unisona', 'system');
            this.showMessage('/difficulte [rapide|moyen|lent] - Changer la difficulté d\'Unisona', 'system');
            this.showMessage('/aide ou /help - Afficher cette aide', 'system');
            
        } else {
            this.showMessage('❓ Commande inconnue. Tape /aide pour voir les commandes', 'system');
        }
    }

    // Recevoir un message d'un autre joueur
    receiveMessage(username, text) {
        this.showMessage(text, 'message', username);
    }
    
    // Diffuser une action de jeu à tous les joueurs connectés
    get gameConnections() {
        return window.privateRoom?.active ? window.privateRoom.connections : this.connections;
    }

    broadcastGameAction(action) {
        if (this.gameConnections.size === 0) {
            console.log('⚠️ Aucune connexion pour broadcaster:', action.type);
            return;
        }
        
        const message = {
            type: 'game_action',
            username: this.currentUser,
            action: action,
            timestamp: Date.now()
        };
        
        let sentCount = 0;
        let failedCount = 0;
        
        this.gameConnections.forEach((conn, peerId) => {
            if (conn.open) {
                try {
                    conn.send(message);
                    sentCount++;
                    console.log(`✅ Message envoyé à ${peerId}:`, action.type);
                } catch (error) {
                    failedCount++;
                    console.error(`❌ Erreur envoi à ${peerId}:`, error);
                }
            } else {
                failedCount++;
                console.warn(`⚠️ Connexion fermée avec ${peerId}`);
            }
        });
        
        console.log(`📊 Broadcast ${action.type}: ${sentCount} envoyés, ${failedCount} échoués sur ${this.gameConnections.size} connexions`);
    }
    
    // Gérer une action de jeu reçue
    handleGameAction(data) {
        if (!window.game) return;
        
        const { action, username } = data;
        console.log(`📥 Action reçue de ${username}:`, action.type, action);
        
        switch(action.type) {
            case 'word_completed':
                // Afficher quand un joueur complète un mot (masqué pour ne pas spoiler)
                const maskedWord = '*'.repeat(action.word.length);
                const modeIcon = action.gameMode === 'couple' ? '💕' : '🙏';
                const progress = action.totalWords ? ` (${action.wordsCompleted}/${action.totalWords})` : '';
                const hintIndicator = action.usedHint ? ' 💡' : '';
                this.showMessage(`🎉 ${modeIcon} ${username} a trouvé un mot de ${action.word.length} lettres${progress}${hintIndicator} ! (${action.score} pts)`, 'system');
                break;
                
            case 'level_completed':
                // Afficher quand un joueur complète un niveau
                const levelModeIcon = action.gameMode === 'couple' ? '💕' : '🙏';
                const bonusInfo = action.bonusPoints ? ` (+${action.bonusPoints} bonus)` : '';
                this.showMessage(`🏆 ${levelModeIcon} ${username} a complété le niveau ${action.level}${bonusInfo} ! (${action.score} pts total)`, 'system');
                break;
                
            case 'hint_used':
                // Afficher quand un joueur utilise un indice
                const hintModeIcon = action.gameMode === 'couple' ? '💕' : '🙏';
                const hintCount = action.hintsUsed > 1 ? ` (${action.hintsUsed}ème indice)` : '';
                this.showMessage(`💡 ${hintModeIcon} ${username} a utilisé un indice${hintCount} (-5 pts → ${action.scoreAfterHint} pts)`, 'system');
                break;
                
            case 'mode_completed':
                // Afficher quand un joueur termine un mode complet
                const completedModeIcon = action.gameMode === 'couple' ? '💕' : '🏆';
                const completedModeName = action.gameMode === 'couple' ? 'Couple' : 'Normal';
                this.showMessage(`🎆 ${completedModeIcon} ${username} a terminé le mode ${completedModeName} ! (${action.modeScore} pts → Total: ${action.totalScore} pts)`, 'system');
                break;
                
            case 'ready_next_level':
                // Un joueur est prêt pour le niveau suivant
                const readyModeIcon = action.gameMode === 'couple' ? '💕' : '🏆';
                
                // Enregistrer l'ordre d'arrivée de ce joueur
                if (window.game && window.game.levelFinishers) {
                    window.game.levelFinishers.push({
                        username: username,
                        position: action.position,
                        timestamp: Date.now()
                    });
                }
                
                // Message avec position et bonus
                let readyMsg = `✅ ${readyModeIcon} ${username} est prêt pour le niveau ${action.nextLevel}`;
                if (action.position === 1) {
                    readyMsg += ` 🥇 Premier ! (+${action.positionBonus} pts)`;
                } else if (action.position === 2) {
                    readyMsg += ` 🥈 Deuxième (+${action.positionBonus} pts)`;
                } else if (action.position === 3) {
                    readyMsg += ` 🥉 Troisième (+${action.positionBonus} pts)`;
                } else if (action.position) {
                    readyMsg += ` (${action.position}ème)`;
                }
                this.showMessage(readyMsg, 'system');
                
                // Vérifier si tous les joueurs sont prêts (simplifié: si je suis prêt aussi)
                if (window.game && window.game.waitingForPlayers && window.game.readyForNextLevel) {
                    // Tous prêts, démarrer le niveau suivant
                    setTimeout(() => {
                        if (window.game && window.game.waitingForPlayers) {
                            window.game.proceedToNextLevel();
                        }
                    }, 1000);
                }
                break;
                
            case 'game_started':
                // Un joueur a démarré le jeu
                const startModeIcon = action.gameMode === 'couple' ? '💕' : action.gameMode === 'sagesse' ? '🧘' : action.gameMode === 'proverbes' ? '📖' : action.gameMode === 'disciple' ? '✝️' : action.gameMode === 'veiller' ? '🕯️' : action.gameMode === 'aimee' ? '💝' : action.gameMode === 'couple-solide' ? '💪' : '🏆';
                const startModeName = action.gameMode === 'couple' ? 'Couple' : action.gameMode === 'sagesse' ? 'Sagesse' : action.gameMode === 'proverbes' ? 'Proverbes' : action.gameMode === 'disciple' ? 'Disciple' : action.gameMode === 'veiller' ? 'Veiller' : action.gameMode === 'aimee' ? 'Aimée' : action.gameMode === 'couple-solide' ? 'Couple Solide' : 'Normal';
                this.showMessage(`🎮 ${startModeIcon} ${username} a démarré une partie en mode ${startModeName} !`, 'system');
                
                // Proposer de rejoindre automatiquement si pas encore en jeu
                if (window.game && !window.game.gameStarted) {
                    this.showMessage(`💡 Vous pouvez cliquer sur "Jouer" pour rejoindre la partie`, 'system');
                }
                break;
                
            case 'mode_changed':
                // Un joueur a changé de mode (UNIQUEMENT si seul, pas de vote)
                // En multijoueur, le changement se fait via mode_change_result après vote
                if (this.gameConnections.size > 0) {
                    console.warn('⚠️ Ignoré: mode_changed reçu en multijoueur (devrait utiliser le vote)');
                    break;
                }
                
                const prevModeIcon = action.previousMode === 'couple' ? '💕' : '🏆';
                const newModeIcon = action.newMode === 'couple' ? '💕' : action.newMode === 'sagesse' ? '🧘' : action.newMode === 'proverbes' ? '📖' : action.newMode === 'disciple' ? '✝️' : action.newMode === 'veiller' ? '🕯️' : action.newMode === 'aimee' ? '💝' : action.newMode === 'couple-solide' ? '💪' : '🏆';
                const prevModeName = action.previousMode === 'couple' ? 'Couple' : action.previousMode === 'sagesse' ? 'Sagesse' : action.previousMode === 'proverbes' ? 'Proverbes' : action.previousMode === 'disciple' ? 'Disciple' : action.previousMode === 'veiller' ? 'Veiller' : action.previousMode === 'aimee' ? 'Aimée' : action.previousMode === 'couple-solide' ? 'Couple Solide' : 'Normal';
                const newModeName = action.newMode === 'couple' ? 'Couple' : action.newMode === 'sagesse' ? 'Sagesse' : action.newMode === 'proverbes' ? 'Proverbes' : action.newMode === 'disciple' ? 'Disciple' : action.newMode === 'veiller' ? 'Veiller' : action.newMode === 'aimee' ? 'Aimée' : action.newMode === 'couple-solide' ? 'Couple Solide' : 'Normal';
                this.showMessage(`🔄 ${username} a changé de mode: ${prevModeIcon} ${prevModeName} → ${newModeIcon} ${newModeName} (${action.totalLevels} niveaux)`, 'system');
                break;
                
            case 'mode_change_request':
                // Recevoir une demande de vote pour changer de mode
                this.handleModeChangeRequest(action, username);
                break;
                
            case 'mode_change_vote':
                // Recevoir un vote d'un autre joueur
                this.handleModeChangeVote(action, username);
                break;
                
            case 'mode_change_result':
                // Recevoir le résultat du vote
                this.handleModeChangeResult(action);
                break;
                
            case 'current_mode':
                // Recevoir le mode actuel d'un autre joueur
                this.handleCurrentMode(action, username);
                break;
                
            case 'current_level':
                // Recevoir le niveau actuel d'un autre joueur
                this.handleCurrentLevel(action, username);
                break;
                
            case 'level_changed':
                // Un joueur a changé de niveau
                this.handleLevelChanged(action, username);
                break;
                
            case 'game_completed':
                // Un joueur a terminé la partie
                this.handleGameCompleted(action, username);
                break;
                
            case 'letters_count_update':
                // Mise à jour du nombre de lettres d'un joueur
                this.handleLettersCountUpdate(action, username);
                break;
        }
    }
    
    // Gérer une demande de changement de mode
    handleModeChangeRequest(action, username) {
        const { voteId, previousMode, newMode, requester } = action;
        
        // Ne pas afficher de modal si c'est notre propre demande
        const myUsername = this.currentUser;
        if (requester === myUsername) return;
        
        const newModeIcon = window.game?.getModeIcon(newMode) || '🎯';
        const newModeName = window.game?.getModeName(newMode) || newMode;
        
        // Créer un message cliquable pour voter
        const voteMessageId = `vote-msg-${voteId}`;
        const voteMessage = document.createElement('div');
        voteMessage.id = voteMessageId;
        voteMessage.className = 'chat-message system-message vote-message';
        voteMessage.style.cssText = `
            cursor: pointer;
            padding: 15px;
            margin: 10px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            border: 2px solid #fff;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
        `;
        
        voteMessage.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; color: white; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <div style="font-size: 32px;"><span class="vote-mode-icon"></span></div>
                    <div style="text-align: left;">
                        <p style="font-size: 14px; margin: 0; opacity: 0.9;">
                            <span class="vote-requester"></span>
                        </p>
                        <p style="font-size: 18px; font-weight: bold; margin: 0;">
                            <span class="vote-mode-name"></span>
                        </p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button class="vote-yes-btn" style="
                        padding: 8px 16px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-size: 14px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: transform 0.2s;
                        white-space: nowrap;
                    ">✅ Oui</button>
                    <button class="vote-no-btn" style="
                        padding: 8px 16px;
                        background: #f44336;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-size: 14px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: transform 0.2s;
                        white-space: nowrap;
                    ">❌ Non</button>
                    <span id="vote-countdown-${voteId}" style="font-size: 12px; opacity: 0.8; white-space: nowrap;">
                        ⏱️ 30s
                    </span>
                </div>
            </div>
        `;
        
        // Ajouter le message au chat
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.appendChild(voteMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Gérer les clics sur les boutons
        voteMessage.querySelector('.vote-mode-icon').textContent = newModeIcon;
        voteMessage.querySelector('.vote-requester').textContent = `🗳️ ${requester} propose :`;
        voteMessage.querySelector('.vote-mode-name').textContent = newModeName;
        const yesBtn = voteMessage.querySelector('.vote-yes-btn');
        const noBtn = voteMessage.querySelector('.vote-no-btn');
        
        const removeVoteMessage = () => {
            if (voteMessage.parentNode) {
                voteMessage.style.opacity = '0';
                setTimeout(() => voteMessage.remove(), 300);
            }
        };
        
        yesBtn.onclick = (e) => {
            e.stopPropagation();
            this.sendModeChangeVote(voteId, true);
            removeVoteMessage();
        };
        
        noBtn.onclick = (e) => {
            e.stopPropagation();
            this.sendModeChangeVote(voteId, false);
            removeVoteMessage();
        };
        
        // Effet hover sur les boutons
        yesBtn.onmouseenter = () => yesBtn.style.transform = 'scale(1.1)';
        yesBtn.onmouseleave = () => yesBtn.style.transform = 'scale(1)';
        noBtn.onmouseenter = () => noBtn.style.transform = 'scale(1.1)';
        noBtn.onmouseleave = () => noBtn.style.transform = 'scale(1)';
        
        // Compte à rebours de 30 secondes
        let timeLeft = 30;
        const countdownEl = document.getElementById(`vote-countdown-${voteId}`);
        const countdownInterval = setInterval(() => {
            timeLeft--;
            if (countdownEl) {
                countdownEl.textContent = `⏱️ ${timeLeft}s`;
                if (timeLeft <= 10) {
                    countdownEl.style.color = '#ffeb3b';
                    countdownEl.style.fontWeight = 'bold';
                }
            }
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                removeVoteMessage();
            }
        }, 1000);
    }
    
    // Envoyer un vote pour le changement de mode
    sendModeChangeVote(voteId, accepted) {
        const message = {
            type: 'game_action',
            username: this.currentUser,
            action: {
                type: 'mode_change_vote',
                voteId: voteId,
                vote: accepted,
                voter: this.currentUser,
                peerId: this.peer?.id
            },
            timestamp: Date.now()
        };
        
        this.gameConnections.forEach((conn) => {
            if (conn.open) {
                conn.send(message);
            }
        });
        
        this.showMessage(`${accepted ? '✅' : '❌'} Vous avez voté ${accepted ? 'POUR' : 'CONTRE'} le changement de mode`, 'system');
    }
    
    // Gérer la réception d'un vote
    handleModeChangeVote(action, username) {
        if (!window.game || !window.game.modeChangeVote) return;
        
        const { voteId, vote, peerId } = action;
        
        // Vérifier que c'est le bon vote
        if (voteId !== window.game.modeChangeVote.id) return;
        
        // Enregistrer le vote
        window.game.modeChangeVote.votes.set(peerId, vote);
        
        console.log(`🗳️ Vote reçu de ${username}: ${vote ? 'OUI' : 'NON'}`);
        
        // Vérifier si tous les joueurs ont voté
        const totalPlayers = this.gameConnections.size + 1;
        const votesReceived = window.game.modeChangeVote.votes.size;
        
        if (votesReceived >= totalPlayers) {
            // Tous les votes sont reçus, traiter immédiatement
            clearTimeout(window.game.modeChangeVote.timeout);
            window.game.processModeChangeVote();
        }
    }
    
    // Gérer le résultat du vote
    handleModeChangeResult(action) {
        const { approved, yesVotes, totalVotes, totalPlayers, newMode } = action;
        
        if (approved && window.game) {
            // Le vote est accepté, appliquer le changement
            const previousMode = window.game.gameMode;
            window.game.applyModeChange(previousMode, newMode);
        }
    }
    
    // Gérer la réception du mode actuel
    handleCurrentMode(action, username) {
        const { mode } = action;
        
        if (!window.game) return;
        
        // Si notre mode est différent, s'aligner sur le mode de la salle
        if (window.game.gameMode !== mode) {
            console.log(`🔄 Synchronisation du mode: ${window.game.gameMode} → ${mode}`);
            const previousMode = window.game.gameMode;
            window.game.applyModeChange(previousMode, mode);
            
            const modeIcons = {
                'normal': '🙏',
                'couple': '💕',
                'sagesse': '🕊️',
                'proverbes': '📖',
                'disciple': '✝️',
                'veiller': '👁️',
                'aimee': '❤️',
                'couple-solide': '💑',
                'race': '🏁'
            };
            const modeIcon = modeIcons[mode] || '🎯';
            this.showMessage(`${modeIcon} Mode synchronisé avec la salle`, 'system');
        }
    }
    
    // Gérer la réception du niveau actuel
    handleCurrentLevel(action, username) {
        const { level } = action;
        
        if (!window.game) return;
        
        // Si notre niveau est différent, s'aligner sur le niveau de la salle
        if (window.game.currentLevel !== level) {
            console.log(`🔄 Synchronisation du niveau: ${window.game.currentLevel} → ${level}`);
            window.game.currentLevel = level;
            this.showMessage(`📊 Niveau ${level} synchronisé avec la salle`, 'system');
        }
    }
    
    // Gérer le changement de niveau d'un autre joueur
    handleLevelChanged(action, username) {
        const { level, score, correctLetters, totalLevels } = action;
        
        if (!window.game) return;
        
        this.showMessage(`🎯 ${username} → Niveau ${level} (📝 ${correctLetters || 0} lettres)`, 'system');
        
        // Synchroniser le niveau si on est en retard
        if (window.game.currentLevel < level && window.game.gameStarted) {
            console.log(`🔄 Synchronisation du niveau: ${window.game.currentLevel} → ${level}`);
            window.game.currentLevel = level;
            window.game.setupLevel();
            document.getElementById('nextLevelButton').style.display = 'none';
            document.getElementById('shareButton').style.display = 'none';
            this.showMessage(`⏩ Niveau synchronisé: ${level}/${totalLevels}`, 'system');
        }
    }
    
    // Gérer la mise à jour du nombre de lettres
    handleLettersCountUpdate(action, username) {
        const { correctLetters, level } = action;
        
        // Afficher de temps en temps pour ne pas spammer
        if (correctLetters % 10 === 0) {
            this.showMessage(`📝 ${username}: ${correctLetters} lettres trouvées`, 'system');
        }
    }
    
    // Gérer la fin de partie d'un joueur
    handleGameCompleted(action, username) {
        const { score, correctLetters } = action;
        
        // Stocker les scores pour le classement
        if (!this.multiplayerScores) {
            this.multiplayerScores = [];
        }
        
        this.multiplayerScores.push({ username, score, correctLetters: correctLetters || 0 });
        this.showMessage(`🏁 ${username} a terminé avec ${score} pts (📝 ${correctLetters || 0} lettres) !`, 'system');
    }
    
    // Gérer la réception de l'état du jeu
    handleGameState(data) {
        if (!window.game) return;
        
        this.showMessage(`📊 ${data.username} est au niveau ${data.level} avec ${data.score} points`, 'system');
    }

    // Gérer l'arrivée d'un nouveau joueur dans la salle
    handlePlayerJoinedRoom(conn, data) {
        console.log('👥 Nouveau joueur dans la salle:', data.username, data.peer_id);
        
        // Ajouter le nouveau joueur à la liste
        if (!this.roomPlayers) {
            this.roomPlayers = new Map();
        }
        
        this.roomPlayers.set(data.peer_id, {
            username: data.username,
            peer_id: data.peer_id,
            isHost: false
        });
        
        // Se connecter au nouveau joueur
        if (data.peer_id !== this.peer?.id && !this.connections.has(data.peer_id)) {
            console.log('🔗 Connexion au nouveau joueur:', data.username);
            const peerConn = this.peer.connect(data.peer_id, {
                reliable: true,
                metadata: {
                    type: 'peer_join',
                    username: this.currentUser,
                    roomId: this.roomCode
                }
            });
            
            peerConn.on('open', () => {
                console.log('✅ Connecté au nouveau joueur:', data.username);
                if (!this.connections) {
                    this.connections = new Map();
                }
                this.connections.set(data.peer_id, peerConn);
            });
            
            peerConn.on('error', (err) => {
                console.error('❌ Erreur connexion avec nouveau joueur', data.username, err);
            });
            
            // Ajouter le gestionnaire de messages pour cette connexion
            this.handleConnection(peerConn);
        }
        
        // Message affiché par lobby-tabs.js côté hôte
    }

    // Gérer une invitation de jeu depuis le lobby (SALLE UNIFIÉE chat + jeu)
    handleGameInvite(conn, data) {
        console.log('📨 Invitation reçue de:', data.from, 'roomId:', data.roomId);
        
        // Afficher une notification/modal
        if (typeof CustomModals !== 'undefined') {
            CustomModals.showConfirm(
                '🏠 Invitation de jeu',
                `${data.from} vous invite dans sa salle ! Accepter ?`,
                '✅ Accepter',
                '❌ Refuser'
            ).then(async (accepted) => {
                if (accepted) {
                    console.log('✅ Invitation acceptée');
                    
                    // 🤖 Arrêter tous les bots quand on rejoint un multijoueur
                    if (window.stopAllBots) {
                        console.log('🤖 Arrêt des bots - Mode multijoueur activé');
                        window.stopAllBots();
                    }
                    
                    // Accepter l'invitation
                    conn.send({
                        type: 'invite_accepted',
                        from: this.currentUser
                    });
                    
                    // Rejoindre la salle unifiée (chat + jeu)
                    if (!this.connections) {
                        this.connections = new Map();
                    }
                    this.connections.set(conn.peer, conn);
                    this.roomCode = data.roomId;
                    this.isHost = false;
                    
                    // Initialiser roomPlayers si nécessaire
                    if (!this.roomPlayers) {
                        this.roomPlayers = new Map();
                    }
                    
                    // Ajouter l'hôte
                    this.roomPlayers.set(conn.peer, {
                        username: data.from,
                        peer_id: conn.peer,
                        isHost: true
                    });
                    
                    // Ajouter les autres joueurs déjà présents dans la salle
                    if (data.existingPlayers && Array.isArray(data.existingPlayers)) {
                        console.log('👥 Connexion aux autres joueurs:', data.existingPlayers.length);
                        for (const player of data.existingPlayers) {
                            // Ajouter à la liste
                            this.roomPlayers.set(player.peer_id, {
                                username: player.username,
                                peer_id: player.peer_id,
                                isHost: false
                            });
                            
                            // Se connecter à chaque joueur existant
                            if (player.peer_id !== this.peer?.id) {
                                console.log('🔗 Connexion à:', player.username, player.peer_id);
                                const peerConn = this.peer.connect(player.peer_id, {
                                    reliable: true,
                                    metadata: {
                                        type: 'peer_join',
                                        username: this.currentUser,
                                        roomId: data.roomId
                                    }
                                });
                                
                                peerConn.on('open', () => {
                                    console.log('✅ Connecté à:', player.username);
                                    this.connections.set(player.peer_id, peerConn);
                                    // Message supprimé - déjà affiché par handleInviteResponse
                                });
                                
                                peerConn.on('error', (err) => {
                                    console.error('❌ Erreur connexion avec', player.username, err);
                                });
                                
                                // Ajouter le gestionnaire de messages pour cette connexion
                                this.handleConnection(peerConn);
                            }
                        }
                    }
                    
                    // M'ajouter
                    if (this.peer?.id) {
                        this.roomPlayers.set('me', {
                            username: this.currentUser,
                            peer_id: this.peer.id,
                            isHost: false
                        });
                    }
                    
                    this.showMessage(`🏠 Vous avez rejoint la salle de ${data.from}`, 'system');
                    
                    // Activer le bouton vocal
                    if (window.voiceUI) {
                        window.voiceUI.updateSmsVoiceButton();
                    }
                    
                    // 🎮 Démarrer automatiquement le jeu si pas encore démarré
                    if (window.game && !window.game.gameStarted) {
                        console.log('🎮 Démarrage automatique du jeu en multijoueur...');
                        setTimeout(() => {
                            window.game.startGame();
                        }, 500); // Petit délai pour laisser la connexion s'établir
                    }
                    
                    // NE PAS ajouter d'écouteur ici - handleConnection() s'en occupe déjà
                    // Les messages seront routés via handleMessage() automatiquement
                } else {
                    console.log('❌ Invitation refusée');
                    // Refuser l'invitation
                    conn.send({
                        type: 'invite_declined',
                        from: this.currentUser
                    });
                    this.showMessage('Invitation refusée', 'system');
                }
            });
        } else {
            // Fallback simple si CustomModals n'est pas disponible
            const accept = confirm(`${data.from} vous invite dans sa salle ! Accepter ?`);
            if (accept) {
                conn.send({
                    type: 'invite_accepted',
                    from: this.currentUser
                });
                
                // Même logique que ci-dessus
                if (!this.connections) this.connections = new Map();
                this.connections.set(conn.peer, conn);
                this.roomCode = data.roomId;
                this.isHost = false;
                
                if (!this.roomPlayers) this.roomPlayers = new Map();
                this.roomPlayers.set(conn.peer, {
                    username: data.from,
                    peer_id: conn.peer,
                    isHost: true
                });
                
                this.showMessage(`🏠 Salle rejointe: ${data.from}`, 'system');
            } else {
                conn.send({
                    type: 'invite_declined',
                    from: this.currentUser
                });
            }
        }
    }

    // Sauvegarder le peer ID pour réutilisation
    savePeerId(peerId) {
        try {
            localStorage.setItem('persistent_peer_id', peerId);
            console.log('💾 Peer ID sauvegardé pour les prochaines sessions');
        } catch (err) {
            console.warn('⚠️ Impossible de sauvegarder le peer ID:', err);
        }
    }
    
    // Vérifier si on est dans une salle unifiée
    isInRoom() {
        return this.roomCode !== null && this.connections.size > 0;
    }
    
    // Diffuser un message de chat dans la salle unifiée
    broadcastChatMessage(text) {
        if (!this.isInRoom()) {
            console.warn('⚠️ Pas dans une salle, impossible d\'envoyer le message');
            return;
        }
        
        const message = {
            type: 'chat_message',
            from: this.currentUser,
            message: text,
            timestamp: Date.now()
        };
        
        // Envoyer à tous les joueurs de la salle
        this.connections.forEach((conn) => {
            if (conn.open) {
                conn.send(message);
                console.log('📤 Message chat envoyé à:', conn.peer);
            }
        });
    }
    
    // Diffuser une mise à jour du jeu dans la salle unifiée
    broadcastGameUpdate(updateData) {
        if (!this.isInRoom()) {
            console.warn('⚠️ Pas dans une salle, impossible d\'envoyer la mise à jour');
            return;
        }
        
        const message = {
            type: 'game_update',
            from: this.currentUser,
            ...updateData,
            timestamp: Date.now()
        };
        
        // Envoyer à tous les joueurs de la salle
        this.connections.forEach((conn) => {
            if (conn.open) {
                conn.send(message);
                console.log('📤 Mise à jour jeu envoyée à:', conn.peer);
            }
        });
    }
    
    // Diffuser la synchronisation complète du jeu
    broadcastGameSync() {
        if (!this.isInRoom() || !window.game) return;
        
        const syncData = {
            type: 'game_sync',
            from: this.currentUser,
            level: window.game.currentLevel,
            grid: window.game.grid,
            score: window.game.score,
            timestamp: Date.now()
        };
        
        this.connections.forEach((conn) => {
            if (conn.open) {
                conn.send(syncData);
                console.log('📤 Sync jeu envoyé à:', conn.peer);
            }
        });
    }

    // Récupérer le peer ID sauvegardé
    getSavedPeerId() {
        try {
            const saved = localStorage.getItem('persistent_peer_id');
            if (saved) {
                console.log('📦 Peer ID trouvé dans le cache');
                return saved;
            }
        } catch (err) {
            console.warn('⚠️ Erreur lecture peer ID:', err);
        }
        return null;
    }

    // Réinitialiser le peer ID (si problème de connexion)
    resetPeerId() {
        try {
            localStorage.removeItem('persistent_peer_id');
            console.log('🔄 Peer ID réinitialisé');
            
            // Déconnecter le peer actuel
            if (this.peer) {
                this.peer.destroy();
                this.peer = null;
            }
            
            // Réinitialiser
            this.initP2P();
        } catch (err) {
            console.error('❌ Erreur réinitialisation peer:', err);
        }
    }

    // Déconnecter P2P
    disconnectP2P() {
        if (this.peer) {
            this.connections.forEach((conn) => conn.close());
            this.connections.clear();
            this.peer.destroy();
            this.peer = null;
            this.roomCode = null;
            this.isHost = false;
        }
    }

    // Obtenir le nombre de joueurs connectés
    getPlayerCount() {
        return this.connections.size + (this.peer ? 1 : 0);
    }

    // Vérifier si en mode P2P
    isInRoom() {
        return Boolean(window.privateRoom?.active) || this.roomCode !== null;
    }

    // === Système de blocage ===
    
    // Bloquer un joueur
    blockPlayer(peerId) {
        this.blockedPlayers.add(peerId);
        this.saveBlockedPlayers();
        console.log('🚫 Joueur bloqué:', peerId);
    }

    // Débloquer un joueur
    unblockPlayer(peerId) {
        this.blockedPlayers.delete(peerId);
        this.saveBlockedPlayers();
        console.log('✅ Joueur débloqué:', peerId);
    }

    // Vérifier si un joueur est bloqué
    isPlayerBlocked(peerId) {
        return this.blockedPlayers.has(peerId);
    }

    // Sauvegarder la liste des joueurs bloqués
    saveBlockedPlayers() {
        try {
            const blocked = Array.from(this.blockedPlayers);
            localStorage.setItem('blockedPlayers', JSON.stringify(blocked));
        } catch (e) {
            console.error('❌ Erreur sauvegarde joueurs bloqués:', e);
        }
    }

    // Charger la liste des joueurs bloqués
    loadBlockedPlayers() {
        try {
            const saved = localStorage.getItem('blockedPlayers');
            if (saved) {
                const blocked = JSON.parse(saved);
                this.blockedPlayers = new Set(blocked);
                console.log('📋 Joueurs bloqués chargés:', this.blockedPlayers.size);
            }
        } catch (e) {
            console.error('❌ Erreur chargement joueurs bloqués:', e);
            this.blockedPlayers = new Set();
        }
    }
}

// Instance globale
window.simpleChatSystem = new SimpleChatSystem();
const simpleChatSystem = window.simpleChatSystem;

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        simpleChatSystem.init();
    });
} else {
    simpleChatSystem.init();
}
