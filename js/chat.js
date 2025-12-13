// Chat WebRTC P2P avec PeerJS - Sans DB ni sauvegarde
class P2PChatSystem {
    constructor() {
        // Couleurs kawaii (doit être défini avant generateColor)
        this.userColors = [
            '#ff69b4', '#ff6b9d', '#c44569', '#f8b500',
            '#4b7bec', '#0abde3', '#10ac84', '#ee5a6f',
            '#c56cf0', '#ffb8b8', '#ffa801', '#54a0ff'
        ];

        this.peer = null;
        this.connections = new Map(); // Map de peerId → DataConnection
        this.messages = []; // Messages en mémoire seulement
        this.username = this.getUsernameFromAuth() || this.generateUsername();
        this.userColor = this.generateColor();
        this.roomId = null;
        this.isHost = false;
        this.maxMessages = 100;
        this.isOpen = false;

        // Écouter les changements d'authentification
        if (typeof authSystem !== 'undefined') {
            authSystem.onAuthChange((user) => {
                if (user && user.username) {
                    this.username = user.username;
                    this.updateUsernameInUI();
                }
            });
        }
    }

    // Obtenir le username depuis authSystem
    getUsernameFromAuth() {
        if (typeof authSystem !== 'undefined') {
            const user = authSystem.getCurrentUser();
            if (user && user.username) {
                return user.username;
            }
        }
        return null;
    }

    // Mettre à jour le username dans l'UI
    updateUsernameInUI() {
        const usernameBtn = this.getElement('Username');
        if (usernameBtn) {
            usernameBtn.textContent = this.username;
        }
    }

    // Générer un pseudo aléatoire
    generateUsername() {
        const adjectives = [
            'Joyeux', 'Paisible', 'Lumineux', 'Fidèle', 'Sage',
            'Courageux', 'Bienveillant', 'Radieux', 'Humble', 'Fort'
        ];
        const nouns = [
            'Disciple', 'Pèlerin', 'Serviteur', 'Gardien', 'Témoin',
            'Ami', 'Frère', 'Sœur', 'Enfant', 'Veilleur'
        ];

        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 99) + 1;

        return `${adj}${noun}${num}`;
    }

    // Générer une couleur aléatoire
    generateColor() {
        return this.userColors[Math.floor(Math.random() * this.userColors.length)];
    }

    // Initialiser PeerJS
    async initPeer() {
        if (this.peer) return; // Déjà initialisé

        return new Promise((resolve, reject) => {
            // Vérifier que PeerJS est chargé
            if (typeof Peer === 'undefined') {
                reject(new Error('PeerJS non chargé'));
                return;
            }

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
                console.log('✅ Peer connecté avec ID:', id);
                resolve(id);
            });

            this.peer.on('error', (err) => {
                // Gestion intelligente des erreurs comme dans simple-chat.js
                if (err.type === 'network' || err.message?.includes('Lost connection')) {
                    console.log('ℹ️ PeerJS: Connexion serveur perdue (normal en localhost)');
                    // Ne pas rejeter la promesse pour ce type d'erreur
                    return;
                }
                
                if (err.type === 'peer-unavailable' || err.message?.includes('Could not connect to peer')) {
                    console.log('ℹ️ PeerJS: Peer non disponible');
                    return;
                }
                
                // Erreurs critiques uniquement
                console.error('❌ Erreur Peer critique:', err);
                reject(err);
            });

            // Écouter les connexions entrantes (quelqu'un rejoint notre room)
            this.peer.on('connection', (conn) => {
                this.handleIncomingConnection(conn);
            });
        });
    }

    // Créer une room
    async createRoom() {
        try {
            await this.initPeer();

            this.roomId = this.peer.id;
            this.isHost = true;

            this.sendSystemMessage(`${this.username} a créé la room 🎉`);

            return this.roomId;
        } catch (error) {
            console.error('Erreur création room:', error);
            throw error;
        }
    }

    // Rejoindre une room
    async joinRoom(roomId) {
        try {
            await this.initPeer();

            // Se connecter au host de la room
            const conn = this.peer.connect(roomId, {
                reliable: true,
                metadata: {
                    username: this.username,
                    color: this.userColor
                }
            });

            conn.on('open', () => {
                console.log('✅ Connecté à la room:', roomId);
                this.roomId = roomId;
                this.handleIncomingConnection(conn);

                // Envoyer un message de join
                this.broadcastMessage({
                    type: 'join',
                    username: this.username,
                    color: this.userColor,
                    timestamp: Date.now()
                });
            });

            conn.on('error', (err) => {
                console.error('❌ Erreur connexion:', err);
                throw err;
            });

        } catch (error) {
            console.error('Erreur join room:', error);
            throw error;
        }
    }

    // Gérer une connexion entrante
    handleIncomingConnection(conn) {
        const peerId = conn.peer;

        // Stocker la connexion
        this.connections.set(peerId, conn);

        console.log(`✅ Nouvelle connexion: ${peerId}`);

        // Envoyer l'historique des messages au nouveau peer
        if (this.isHost && this.messages.length > 0) {
            conn.on('open', () => {
                conn.send({
                    type: 'history',
                    messages: this.messages
                });
            });
        }

        // Écouter les messages
        conn.on('data', (data) => {
            this.handleIncomingMessage(data, peerId);
        });

        // Gérer la déconnexion
        conn.on('close', () => {
            this.connections.delete(peerId);
            console.log(`❌ Déconnexion: ${peerId}`);

            const username = conn.metadata?.username || 'Utilisateur';
            this.sendSystemMessage(`${username} a quitté le chat 👋`);

            this.updateParticipantCount();
        });

        // Mettre à jour le compteur
        this.updateParticipantCount();
    }

    // Gérer un message entrant
    handleIncomingMessage(data, fromPeerId) {
        if (!data || !data.type) return;

        if (data.type === 'message') {
            // Nouveau message chat
            const message = {
                id: data.id || Date.now(),
                username: data.username,
                color: data.color,
                text: data.text,
                timestamp: data.timestamp
            };

            // Éviter les doublons
            if (!this.messages.find(m => m.id === message.id)) {
                this.messages.push(message);

                // Limiter le nombre de messages
                if (this.messages.length > this.maxMessages) {
                    this.messages.shift();
                }

                this.renderMessages();

                // Redistribuer aux autres peers (sauf l'émetteur)
                this.redistributeMessage(data, fromPeerId);
            }

        } else if (data.type === 'history') {
            // Historique des messages
            this.messages = data.messages || [];
            this.renderMessages();

        } else if (data.type === 'join') {
            // Quelqu'un a rejoint
            this.sendSystemMessage(`${data.username} a rejoint le chat 🙏`);

        } else if (data.type === 'system') {
            // Message système
            this.addSystemMessage(data.text);
        }
    }

    // Redistribuer un message aux autres peers (mesh network)
    redistributeMessage(data, exceptPeerId) {
        this.connections.forEach((conn, peerId) => {
            if (peerId !== exceptPeerId && conn.open) {
                try {
                    conn.send(data);
                } catch (err) {
                    console.error('Erreur envoi à', peerId, err);
                }
            }
        });
    }

    // Envoyer un message
    sendMessage(text) {
        if (!text || text.trim() === '') return;
        if (!this.roomId) {
            alert('Vous devez créer ou rejoindre une room d\'abord !');
            return;
        }

        const message = {
            type: 'message',
            id: Date.now() + Math.random(), // ID unique
            username: this.username,
            color: this.userColor,
            text: text.trim(),
            timestamp: Date.now()
        };

        // Ajouter à notre historique
        this.messages.push(message);

        // Limiter
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }

        // Envoyer à tous les peers
        this.broadcastMessage(message);

        // Refresh l'affichage
        this.renderMessages();

        return message;
    }

    // Broadcast un message à tous les peers
    broadcastMessage(data) {
        this.connections.forEach((conn) => {
            if (conn.open) {
                try {
                    conn.send(data);
                } catch (err) {
                    console.error('Erreur broadcast:', err);
                }
            }
        });
    }

    // Message système
    sendSystemMessage(text) {
        const message = {
            id: Date.now(),
            username: 'Système',
            color: '#95a5a6',
            text: text,
            timestamp: Date.now(),
            isSystem: true
        };

        this.messages.push(message);
        this.renderMessages();

        // Broadcast aux autres
        this.broadcastMessage({
            type: 'system',
            text: text
        });
    }

    // Ajouter un message système (reçu)
    addSystemMessage(text) {
        const message = {
            id: Date.now(),
            username: 'Système',
            color: '#95a5a6',
            text: text,
            timestamp: Date.now(),
            isSystem: true
        };

        this.messages.push(message);
        this.renderMessages();
    }

    // Rendre les messages
    renderMessages() {
        const container = this.getElement('Messages');
        if (!container) return;

        const wasAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;

        container.innerHTML = '';

        // Trier par timestamp
        const sorted = [...this.messages].sort((a, b) => a.timestamp - b.timestamp);

        sorted.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = 'chat-message';

            const isOwn = msg.username === this.username;
            if (isOwn) {
                messageEl.classList.add('own-message');
            }

            // Header
            const header = document.createElement('div');
            header.className = 'chat-message-header';
            header.style.color = msg.color;

            const usernameSpan = document.createElement('span');
            usernameSpan.className = 'chat-username';
            usernameSpan.textContent = msg.username;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'chat-time';
            timeSpan.textContent = this.formatTime(msg.timestamp);

            header.appendChild(usernameSpan);
            header.appendChild(timeSpan);

            // Texte
            const textEl = document.createElement('div');
            textEl.className = 'chat-message-text';
            textEl.textContent = msg.text;

            messageEl.appendChild(header);
            messageEl.appendChild(textEl);

            container.appendChild(messageEl);
        });

        // Auto-scroll
        if (wasAtBottom) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // Formater l'heure
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Mettre à jour le compteur de participants
    updateParticipantCount() {
        const countEl = this.getElement('ParticipantCount');
        if (countEl) {
            const count = this.connections.size + 1; // +1 pour soi-même
            countEl.textContent = `${count} 👥`;
        }
    }

    // Ouvrir le chat (via menu modal et onglet chat)
    open() {
        // Ouvrir le menu modal et switcher vers l'onglet chat
        if (typeof menuTabSystem !== 'undefined') {
            menuTabSystem.openTab('chat');
        }

        this.isOpen = true;

        // Focus sur l'input
        setTimeout(() => {
            const input = this.getElement('Input');
            if (input) input.focus();

            // Scroll vers le bas
            const container = this.getElement('Messages');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }

    // Fermer le chat (ferme le menu modal)
    close() {
        const menuModal = document.getElementById('menuModal');
        if (menuModal) {
            menuModal.classList.add('hidden');
        }
        this.isOpen = false;
    }

    // Toggle (ouvrir menu sur onglet chat)
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            // Vérifier l'authentification avant d'ouvrir
            if (typeof authSystem !== 'undefined' && !authSystem.isAuthenticated()) {
                // Afficher le modal d'authentification
                authSystem.showAuthModal();
            } else {
                this.open();
            }
        }
    }

    // Afficher l'interface de room
    showRoomInterface() {
        const roomUI = this.getElement('RoomInterface');
        const messagesUI = this.getElement('MessagesInterface');

        if (roomUI && messagesUI) {
            roomUI.classList.remove('hidden');
            messagesUI.classList.add('hidden');
        }
    }

    // Cacher l'interface de room
    hideRoomInterface() {
        const roomUI = this.getElement('RoomInterface');
        const messagesUI = this.getElement('MessagesInterface');

        if (roomUI && messagesUI) {
            roomUI.classList.add('hidden');
            messagesUI.classList.remove('hidden');
        }
    }

    // Changer de pseudo
    changeUsername(newUsername) {
        if (newUsername && newUsername.trim() !== '') {
            const oldUsername = this.username;
            this.username = newUsername.trim();
            this.sendSystemMessage(`${oldUsername} est maintenant ${this.username}`);
        }
    }

    // Déconnecter
    disconnect() {
        // Fermer toutes les connexions
        this.connections.forEach(conn => conn.close());
        this.connections.clear();

        // Détruire le peer
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }

        this.roomId = null;
        this.isHost = false;
        this.messages = [];

        console.log('🔌 Déconnecté du chat P2P');
    }

    // Helper pour obtenir un élément (essaie ancien + nouveau ID)
    getElement(baseName) {
        // Essayer avec le prefix menu
        let el = document.getElementById(`menuChat${baseName}`);
        if (el) return el;

        // Essayer avec l'ancien ID
        el = document.getElementById(`chat${baseName}`);
        return el;
    }

    // Initialiser l'UI
    initUI() {
        // Bouton créer room
        const createBtn = this.getElement('CreateRoomBtn');
        if (createBtn) {
            createBtn.addEventListener('click', async () => {
                try {
                    createBtn.disabled = true;
                    createBtn.textContent = 'Création...';

                    const roomId = await this.createRoom();

                    // Afficher le code de room
                    const codeDisplay = this.getElement('RoomCodeDisplay');
                    const codeText = this.getElement('RoomCode');
                    if (codeDisplay && codeText) {
                        codeText.textContent = roomId;
                        codeDisplay.classList.remove('hidden');
                    }

                    this.hideRoomInterface();
                    this.updateParticipantCount();

                } catch (error) {
                    alert('Erreur lors de la création de la room: ' + error.message);
                    createBtn.disabled = false;
                    createBtn.textContent = '🎮 Créer une Room';
                }
            });
        }

        // Bouton rejoindre room
        const joinBtn = this.getElement('JoinRoomBtn');
        const roomCodeInput = this.getElement('RoomCodeInput');
        if (joinBtn && roomCodeInput) {
            joinBtn.addEventListener('click', async () => {
                const roomId = roomCodeInput.value.trim();
                if (!roomId) {
                    alert('Veuillez entrer un code de room');
                    return;
                }

                try {
                    joinBtn.disabled = true;
                    joinBtn.textContent = 'Connexion...';

                    await this.joinRoom(roomId);

                    this.hideRoomInterface();
                    this.updateParticipantCount();

                } catch (error) {
                    alert('Erreur lors de la connexion: ' + error.message);
                    joinBtn.disabled = false;
                    joinBtn.textContent = '🔗 Rejoindre';
                }
            });
        }

        // Copier le code
        const copyBtn = this.getElement('CopyCodeBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const codeText = this.getElement('RoomCode');
                if (codeText) {
                    navigator.clipboard.writeText(codeText.textContent);
                    copyBtn.textContent = '✅ Copié !';
                    setTimeout(() => {
                        copyBtn.textContent = '📋 Copier';
                    }, 2000);
                }
            });
        }

        // Bouton d'envoi
        const sendBtn = this.getElement('SendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                const input = this.getElement('Input');
                if (input) {
                    this.sendMessage(input.value);
                    input.value = '';
                }
            });
        }

        // Enter pour envoyer
        const input = this.getElement('Input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage(input.value);
                    input.value = '';
                }
            });
        }

        // Bouton fermer (pas nécessaire dans menu, mais garde pour compatibilité)
        const closeBtn = this.getElement('CloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // Bouton changer pseudo
        const usernameBtn = this.getElement('Username');
        if (usernameBtn) {
            usernameBtn.textContent = this.username;

            // Désactiver si authentifié (username persistant)
            if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated()) {
                usernameBtn.style.cursor = 'default';
                usernameBtn.title = 'Username de votre compte';
            } else {
                usernameBtn.addEventListener('click', () => {
                    const newUsername = prompt('Nouveau pseudo:', this.username);
                    if (newUsername) {
                        this.changeUsername(newUsername);
                        usernameBtn.textContent = this.username;
                    }
                });
            }
        }

        // Bouton toggle chat (ouvrir/fermer)
        const toggleBtn = document.getElementById('chatToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggle();
            });
        }

        // Afficher l'interface de room au démarrage
        this.showRoomInterface();
    }

    // Nettoyer les vieux messages
    cleanup() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutes

        this.messages = this.messages.filter(msg => {
            return (now - msg.timestamp) < maxAge;
        });

        this.renderMessages();
    }
}

// Instance globale
const chatSystem = new P2PChatSystem();

// Désactivé - On utilise maintenant simple-chat.js
/*
// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        chatSystem.initUI();
    });
} else {
    chatSystem.initUI();
}

// Nettoyage périodique
setInterval(() => {
    chatSystem.cleanup();
}, 5 * 60 * 1000);

// Déconnexion propre avant fermeture
window.addEventListener('beforeunload', () => {
    chatSystem.disconnect();
});
*/
