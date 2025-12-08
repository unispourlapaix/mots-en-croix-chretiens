// Système de chat P2P unifié - interface SMS compacte avec WebRTC
class SimpleChatSystem {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        
        // P2P
        this.peer = null;
        this.connections = new Map(); // peerId -> connection
        this.roomCode = null;
        this.isHost = false;
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        // Récupérer le username depuis authSystem si disponible
        this.updateUsername();
        
        // Afficher message de bienvenue clair
        setTimeout(() => {
            this.showMessage('💬 Chat actif ! Vous pouvez envoyer des messages', 'system');
        }, 500);

        // Écouter les changements d'authentification
        if (typeof authSystem !== 'undefined') {
            authSystem.onAuthChange((user) => {
                this.updateUsername();
                if (user && user.username) {
                    this.showMessage(`✅ Connecté en tant que ${user.username}`, 'system');
                    this.initP2P();
                }
            });

            // Si déjà connecté, afficher le message de bienvenue
            if (this.currentUser && this.currentUser !== 'Joueur' + Math.floor(Math.random() * 1000)) {
                setTimeout(() => {
                    this.showMessage(`👋 Bonjour ${this.currentUser} !`, 'system');
                }, 800);
            }
        }
        
        // Ne pas initialiser P2P automatiquement - le faire à la demande
    }

    // Mettre à jour le username depuis authSystem
    updateUsername() {
        if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated()) {
            const user = authSystem.getCurrentUser();
            if (user && user.username) {
                this.currentUser = user.username;
                console.log('✅ Chat utilise le pseudo:', this.currentUser);
                return;
            }
        }
        
        // Si pas connecté, générer un pseudo aléatoire
        if (!this.currentUser) {
            this.currentUser = 'Joueur' + Math.floor(Math.random() * 1000);
        }
    }

    // Initialiser PeerJS
    initP2P() {
        if (this.peer) {
            console.log('✅ P2P déjà initialisé, skip');
            return;
        }

        console.log('🚀 Initialisation P2P...');
        
        // Mettre à jour le username depuis authSystem
        this.updateUsername();

        try {
            // Configuration PeerJS avec serveurs STUN pour meilleure connectivité
            const peerConfig = {
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            };
            
            this.peer = new Peer(peerConfig);
            
            this.peer.on('open', (id) => {
                console.log('🔗 PeerJS connecté, ID:', id);
                this.roomCode = id;
                // Notifier l'UI que le peer est prêt
                window.dispatchEvent(new CustomEvent('roomCreated', { detail: { roomCode: id } }));
            });

            this.peer.on('connection', (conn) => {
                this.handleConnection(conn);
                
                // Notifier le système de salles
                if (window.roomSystem) {
                    conn.on('data', (data) => {
                        // Transférer les messages de salle au RoomSystem
                        if (data.type && ['join-request', 'join-accepted', 'join-refused', 
                            'player-kicked', 'room-mode-changed', 'player-joined', 
                            'player-left', 'host-transferred'].includes(data.type)) {
                            window.roomSystem.handleRoomMessage(conn, data);
                        }
                    });
                }
            });

            this.peer.on('error', (err) => {
                // Ignorer les erreurs de connexion réseau (normales pour localhost)
                if (err.type === 'network' || err.message?.includes('Lost connection')) {
                    console.log('ℹ️ PeerJS: Connexion serveur perdue (normal en localhost)');
                    return;
                }
                
                // Ignorer les erreurs de connexion à un peer (joueur déconnecté/inexistant)
                if (err.type === 'peer-unavailable' || err.message?.includes('Could not connect to peer')) {
                    console.log('ℹ️ PeerJS: Joueur non disponible ou déconnecté');
                    this.showMessage('⚠️ Ce joueur est déconnecté ou n\'existe plus', 'system');
                    return;
                }
                
                // Erreurs critiques seulement
                console.error('❌ Erreur PeerJS critique:', err);
                this.showMessage('⚠️ Erreur de connexion P2P', 'system');
                
                // Ne détruire le peer que pour des erreurs vraiment critiques
                if (err.type === 'server-error' || err.type === 'socket-error') {
                    if (this.peer) {
                        this.peer.destroy();
                        this.peer = null;
                    }
                }
            });
        } catch (error) {
            console.error('❌ Erreur initialisation P2P:', error);
            this.showMessage('⚠️ Chat en mode local uniquement', 'system');
        }
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
            
            const conn = this.peer.connect(roomCode, {
                reliable: true
            });
            
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
                
                // Envoyer un message de bienvenue
                conn.send({
                    type: 'join',
                    username: this.currentUser
                });
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
            this.connections.set(conn.peer, conn);
            this.showMessage('✅ Un joueur a rejoint', 'system');
            
            // Envoyer un message de bienvenue
            conn.send({
                type: 'join',
                username: this.currentUser
            });
            
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
        } else if (data.type === 'race') {
            // Transmettre les messages de course au système multiplayer
            if (window.multiplayerRace) {
                window.multiplayerRace.receiveProgress(data.username, data.action, data.data);
            }
        }
    }

    // Générer un avatar icône basé sur le username
    getUserAvatar(username) {
        const avatars = [
            '👨', '👩', '👦', '👧', '🧑', '👴', '👵', '👶',
            '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲',
            '🥷', '👸', '🤴', '🧙', '🧚', '🧛', '🧜', '🧝',
            '😇', '😎', '🤓', '🤩', '🥳', '😊', '😁', '😄'
        ];
        
        if (!username) return '👤';
        
        // Utiliser le hash du username pour choisir un avatar constant
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % avatars.length;
        return avatars[index];
    }

    showMessage(text, type = 'message', username = null) {
        const container = document.getElementById('chatSmsContainer');
        const messagesDiv = document.getElementById('chatSmsMessages');
        if (!messagesDiv) return;

        // Afficher le container si caché
        if (container && container.classList.contains('hidden')) {
            container.classList.remove('hidden');
        }

        // Créer le message
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-sms-message ${type === 'own' ? 'own' : type === 'ai' ? 'ai' : type === 'system' ? 'system' : 'other'}`;

        // Générer avatar pour les messages utilisateurs
        const avatar = this.getUserAvatar(username || this.currentUser);

        if (type === 'message' && username) {
            messageDiv.innerHTML = `<span class="chat-avatar">${avatar}</span><span class="username">${username}:</span> ${text}`;
        } else if (type === 'own') {
            messageDiv.innerHTML = `<span class="chat-avatar">${avatar}</span><span class="username">${this.currentUser}:</span> ${text}`;
        } else if (type === 'system') {
            messageDiv.textContent = `✨ ${text}`;
        } else if (type === 'ai') {
            messageDiv.textContent = text;
        } else {
            messageDiv.innerHTML = `<span class="chat-avatar">${avatar}</span><span class="username">${username || 'Anonyme'}:</span> ${text}`;
        }

        messagesDiv.prepend(messageDiv);

        // Limiter à 30 messages max (10 visibles + 20 en scroll)
        const messages = messagesDiv.children;
        if (messages.length > 30) {
            messages[messages.length - 1].remove();
        }

        // Scroll vers le haut (nouveau message visible)
        messagesDiv.scrollTop = 0;
    }

    // Envoyer un message à tous
    sendMessage(text) {
        // Mettre à jour le username depuis authSystem
        this.updateUsername();

        // Afficher le message localement
        this.showMessage(text, 'own', this.currentUser);

        // Si P2P actif, envoyer aux autres
        if (this.connections.size > 0) {
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
    }

    // Recevoir un message d'un autre joueur
    receiveMessage(username, text) {
        this.showMessage(text, 'message', username);
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
        return this.roomCode !== null;
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
