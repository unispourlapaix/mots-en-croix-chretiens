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

        // Définir un nom d'utilisateur par défaut
        this.currentUser = 'Joueur' + Math.floor(Math.random() * 1000);
        
        // Afficher message de bienvenue clair
        setTimeout(() => {
            this.showMessage('💬 Chat actif ! Vous pouvez envoyer des messages', 'system');
        }, 500);

        // Écouter les changements d'authentification (optionnel)
        if (typeof authSystem !== 'undefined') {
            authSystem.onAuthChange((user) => {
                if (user && user.username) {
                    this.currentUser = user.username;
                    this.showMessage(`✅ Connecté en tant que ${user.username}`, 'system');
                    this.initP2P();
                } else if (!this.currentUser) {
                    this.currentUser = 'Joueur' + Math.floor(Math.random() * 1000);
                }
            });

            // Si déjà connecté, récupérer l'utilisateur
            const user = authSystem.getCurrentUser();
            if (user && user.username) {
                this.currentUser = user.username;
                setTimeout(() => {
                    this.showMessage(`👋 Bonjour ${user.username} !`, 'system');
                }, 800);
                // P2P sera initialisé à la demande (pas au démarrage)
            }
        }
        
        // Ne pas initialiser P2P automatiquement - le faire à la demande
    }

    // Initialiser PeerJS
    initP2P() {
        if (this.peer) return;

        // S'assurer qu'on a un username
        if (!this.currentUser) {
            this.currentUser = 'Joueur' + Math.floor(Math.random() * 1000);
        }

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
            });

            this.peer.on('error', (err) => {
                // Ignorer les erreurs de connexion réseau (normales pour localhost)
                if (err.type === 'network' || err.message?.includes('Lost connection')) {
                    console.log('ℹ️ PeerJS: Connexion serveur perdue (normal en localhost)');
                    // Ne pas afficher de message d'erreur à l'utilisateur
                    return;
                }
                
                console.error('❌ Erreur PeerJS:', err);
                // Ne pas bloquer le jeu si P2P ne fonctionne pas
                this.showMessage('⚠️ Chat P2P non disponible (mode local uniquement)', 'system');
                
                // Nettoyer le peer
                if (this.peer) {
                    this.peer.destroy();
                    this.peer = null;
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
        // Initialiser P2P si nécessaire
        if (!this.peer) {
            this.initP2P();
            // Attendre un peu l'initialisation
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!this.peer) {
            this.showMessage('Impossible d\'initialiser P2P', 'system');
            return false;
        }

        try {
            const conn = this.peer.connect(roomCode);
            this.handleConnection(conn);
            this.roomCode = roomCode;
            this.showMessage('Connexion à la room...', 'system');
            return true;
        } catch (error) {
            console.error('❌ Erreur connexion:', error);
            this.showMessage('Impossible de rejoindre la room', 'system');
            return false;
        }
    }

    // Gérer une nouvelle connexion
    handleConnection(conn) {
        this.connections.set(conn.peer, conn);

        conn.on('open', () => {
            console.log('✅ Connecté à:', conn.peer);
            this.showMessage('Un joueur a rejoint', 'system');
            
            // Envoyer un message de bienvenue
            conn.send({
                type: 'join',
                username: this.currentUser
            });
        });

        conn.on('data', (data) => {
            this.handleMessage(data, conn);
        });

        conn.on('close', () => {
            this.connections.delete(conn.peer);
            this.showMessage('Un joueur est parti', 'system');
        });

        conn.on('error', (err) => {
            console.error('❌ Erreur connexion:', err);
            this.connections.delete(conn.peer);
        });
    }

    // Gérer les messages reçus
    handleMessage(data, conn) {
        if (data.type === 'message') {
            this.receiveMessage(data.username, data.text);
        } else if (data.type === 'join') {
            this.showMessage(`${data.username} a rejoint`, 'system');
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
            messageDiv.innerHTML = `<span class="chat-avatar">${avatar}</span><span class="username">${username}:</span>${text}`;
        } else if (type === 'own') {
            messageDiv.innerHTML = `<span class="chat-avatar">${avatar}</span>${text}`;
        } else if (type === 'system') {
            messageDiv.textContent = `✨ ${text}`;
        } else if (type === 'ai') {
            messageDiv.textContent = text;
        } else {
            messageDiv.innerHTML = `<span class="chat-avatar">${avatar}</span>${text}`;
        }

        messagesDiv.appendChild(messageDiv);

        // Limiter à 20 messages max (scroll automatique)
        const messages = messagesDiv.children;
        if (messages.length > 20) {
            messages[0].remove();
        }

        // Scroll vers le bas
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Envoyer un message à tous
    sendMessage(text) {
        if (!this.currentUser) {
            this.currentUser = 'Joueur' + Math.floor(Math.random() * 1000);
        }

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
