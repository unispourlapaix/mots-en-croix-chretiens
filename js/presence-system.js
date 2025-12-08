// Système de présence 100% GRATUIT P2P
// Partage familial/amis via CODE DE SALLE - Simple et sécurisé !
class PresenceSystem {
    constructor() {
        this.myPresence = null;
        this.onlinePlayers = new Map();
        this.heartbeatInterval = null;
        this.storageKey = 'crossword_players_online';
        this.channel = null;
        this.currentRoomCode = null; // Code de la salle actuelle
        this.roomConnection = null; // Connexion à la salle partagée
        this.connectedPeers = new Map(); // peer_id → DataConnection
        
        this.init();
    }
    
    init() {
        console.log('✅ Système de présence 100% P2P - GRATUIT À VIE');
        
        // BroadcastChannel pour sync locale entre onglets
        try {
            this.channel = new BroadcastChannel('crossword_presence');
            this.channel.onmessage = (e) => this.handleChannelMessage(e.data);
        } catch (err) {
            console.warn('BroadcastChannel non supporté');
        }
        
        // Écouter localStorage pour sync locale
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.syncFromStorage();
            }
        });
        
        // Sync initial
        this.syncFromStorage();
        
        // Cleanup périodique
        setInterval(() => this.cleanupInactive(), 5000);
    }
    
    init() {
        console.log('✅ Système de partage familial/amis P2P');
        
        // BroadcastChannel pour sync locale entre onglets
        try {
            this.channel = new BroadcastChannel('crossword_presence');
            this.channel.onmessage = (e) => this.handleChannelMessage(e.data);
        } catch (err) {
            console.warn('BroadcastChannel non supporté');
        }
        
        // Écouter localStorage pour sync locale
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.syncFromStorage();
            }
        });
        
        // Sync initial
        this.syncFromStorage();
        
        // Cleanup périodique
        setInterval(() => this.cleanupInactive(), 5000);
        
        // Écouter connexions entrantes
        this.setupIncomingConnections();
    }
    
    // Générer code de salle aléatoire
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 (confusion)
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    // CRÉER une salle (hôte)
    async createRoom() {
        if (!window.simpleChatSystem?.peer) {
            throw new Error('PeerJS non initialisé');
        }
        
        const roomCode = this.generateRoomCode();
        const roomPeerId = `ROOM-${roomCode}-${Date.now()}`;
        
        this.currentRoomCode = roomCode;
        
        console.log('🏠 Salle créée:', roomCode);
        console.log('📋 Partagez ce code avec vos amis/famille !');
        
        // Sauvegarder info de la salle
        localStorage.setItem('crossword_current_room', JSON.stringify({
            code: roomCode,
            peerId: roomPeerId,
            host: this.myPresence.peerId,
            createdAt: Date.now()
        }));
        
        // Afficher le code à l'utilisateur
        this.showRoomCodeModal(roomCode);
        
        return roomCode;
    }
    
    // REJOINDRE une salle avec code
    async joinRoom(roomCode) {
        if (!window.simpleChatSystem?.peer) {
            throw new Error('PeerJS non initialisé');
        }
        
        roomCode = roomCode.toUpperCase().trim();
        
        if (roomCode.length !== 6) {
            throw new Error('Code invalide (doit faire 6 caractères)');
        }
        
        this.currentRoomCode = roomCode;
        
        console.log('🚪 Tentative de rejoindre salle:', roomCode);
        
        // Se connecter au peer qui a créé la salle
        // On essaie plusieurs variantes car l'hôte peut avoir plusieurs peers
        const searchPatterns = [
            `ROOM-${roomCode}-*`
        ];
        
        // Annoncer qu'on cherche cette salle via broadcast local
        if (this.channel) {
            this.channel.postMessage({
                type: 'room_search',
                roomCode: roomCode,
                searcherPeerId: this.myPresence.peerId,
                searcherUsername: this.myPresence.username
            });
        }
        
        // Sauvegarder qu'on est dans cette salle
        localStorage.setItem('crossword_current_room', JSON.stringify({
            code: roomCode,
            joinedAt: Date.now()
        }));
        
        console.log('✅ Vous êtes dans la salle:', roomCode);
        console.log('⏳ Attente de connexion avec les autres membres...');
        
        return roomCode;
    }
    
    // Afficher modal avec code de salle
    showRoomCodeModal(roomCode) {
        // Créer modal simple
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
            min-width: 300px;
        `;
        
        modal.innerHTML = `
            <h2 style="color: #ff69b4; margin-bottom: 20px;">🏠 Salle créée !</h2>
            <p style="margin-bottom: 15px;">Partagez ce code avec vos amis/famille :</p>
            <div style="
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                background: #f0f0f0;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                letter-spacing: 5px;
                font-family: monospace;
            ">${roomCode}</div>
            <button id="copyRoomCode" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px 5px;
            ">📋 Copier</button>
            <button id="closeRoomModal" style="
                background: #ff69b4;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px 5px;
            ">✅ OK</button>
        `;
        
        document.body.appendChild(modal);
        
        // Copier le code
        document.getElementById('copyRoomCode').onclick = () => {
            navigator.clipboard.writeText(roomCode);
            alert('✅ Code copié !');
        };
        
        // Fermer modal
        document.getElementById('closeRoomModal').onclick = () => {
            modal.remove();
        };
    }
    
    // Écouter connexions entrantes
    setupIncomingConnections() {
        if (!window.simpleChatSystem?.peer) return;
        
        window.simpleChatSystem.peer.on('connection', (conn) => {
            console.log('📞 Connexion entrante de:', conn.peer);
            
            conn.on('open', () => {
                console.log('✅ Connexion établie avec:', conn.peer);
                
                // Envoyer ma présence
                conn.send({
                    type: 'presence_announce',
                    peerId: this.myPresence.peerId,
                    username: this.myPresence.username,
                    avatar: this.myPresence.avatar,
                    acceptMode: this.myPresence.acceptMode,
                    roomCode: this.currentRoomCode,
                    timestamp: Date.now()
                });
                
                // Envoyer liste de tous les joueurs que je connais
                this.onlinePlayers.forEach((player, peerId) => {
                    if (peerId !== conn.peer) {
                        conn.send({
                            type: 'presence_announce',
                            peerId: player.peerId,
                            username: player.username,
                            avatar: player.avatar,
                            acceptMode: player.acceptMode,
                            timestamp: player.timestamp
                        });
                    }
                });
                
                this.connectedPeers.set(conn.peer, conn);
            });
            
            conn.on('data', (data) => {
                this.handlePeerMessage(data, conn);
            });
            
            conn.on('close', () => {
                console.log('👋 Connexion fermée:', conn.peer);
                this.connectedPeers.delete(conn.peer);
                this.onlinePlayers.delete(conn.peer);
                this.notifyPresenceUpdate();
            });
        });
    }
    
    // Gérer messages P2P
    handlePeerMessage(data, conn) {
        if (!data || !data.type) return;
        
        switch (data.type) {
            case 'presence_announce':
                // Un joueur s'annonce
                if (data.peerId && data.peerId !== this.myPresence?.peerId) {
                    console.log('👋 Joueur découvert:', data.username);
                    
                    this.onlinePlayers.set(data.peerId, {
                        peerId: data.peerId,
                        username: data.username,
                        avatar: data.avatar || '😊',
                        acceptMode: data.acceptMode || 'manual',
                        timestamp: data.timestamp || Date.now()
                    });
                    
                    this.notifyPresenceUpdate();
                    
                    // Si c'est une nouvelle connexion, propager aux autres
                    if (!this.connectedPeers.has(data.peerId)) {
                        this.broadcastToRoom({
                            type: 'presence_announce',
                            peerId: data.peerId,
                            username: data.username,
                            avatar: data.avatar,
                            acceptMode: data.acceptMode,
                            timestamp: data.timestamp
                        }, conn.peer); // Ne pas renvoyer à l'émetteur
                    }
                }
                break;
                
            case 'heartbeat':
                // Mise à jour heartbeat
                if (data.peerId && this.onlinePlayers.has(data.peerId)) {
                    const player = this.onlinePlayers.get(data.peerId);
                    player.timestamp = data.timestamp || Date.now();
                    this.onlinePlayers.set(data.peerId, player);
                }
                break;
                
            case 'goodbye':
                // Un joueur se déconnecte
                if (data.peerId) {
                    console.log('👋 Joueur parti:', data.username);
                    this.onlinePlayers.delete(data.peerId);
                    this.connectedPeers.delete(data.peerId);
                    this.notifyPresenceUpdate();
                }
                break;
        }
    }
    
    // Broadcaster un message à tous les peers connectés
    broadcastToRoom(message, excludePeerId = null) {
        this.connectedPeers.forEach((conn, peerId) => {
            if (peerId !== excludePeerId && conn.open) {
                try {
                    conn.send(message);
                } catch (err) {
                    console.warn('Erreur broadcast:', err);
                }
            }
        });
    }
    
    // Quitter la salle actuelle
    leaveRoom() {
        if (!this.currentRoomCode) return;
        
        console.log('🚪 Quitter salle:', this.currentRoomCode);
        
        // Annoncer départ
        this.broadcastToRoom({
            type: 'goodbye',
            peerId: this.myPresence.peerId,
            username: this.myPresence.username
        });
        
        // Fermer toutes les connexions
        this.connectedPeers.forEach((conn) => {
            try {
                conn.close();
            } catch (err) {
                // Déjà fermé
            }
        });
        
        this.connectedPeers.clear();
        this.onlinePlayers.clear();
        this.currentRoomCode = null;
        
        localStorage.removeItem('crossword_current_room');
        
        this.notifyPresenceUpdate();
        
        console.log('✅ Salle quittée');
    }

    start(username, peerId) {
        this.announcePresence(peerId, username, '😊');
    }
    
    // Annoncer ma présence (local + optionnel salle)
    async announcePresence(peerId, username, avatar = '😊', acceptMode = 'manual') {
        this.myPresence = {
            peerId,
            username,
            avatar,
            acceptMode,
            timestamp: Date.now()
        };
        
        console.log('📢 Présence enregistrée:', username);
        
        // Sauvegarder localement
        this.saveToStorage();
        
        // Broadcast aux autres onglets
        if (this.channel) {
            this.channel.postMessage({
                type: 'presence',
                presence: this.myPresence
            });
        }
        
        // Si dans une salle, annoncer à tous
        if (this.currentRoomCode) {
            this.broadcastToRoom({
                type: 'presence_announce',
                peerId: this.myPresence.peerId,
                username: this.myPresence.username,
                avatar: this.myPresence.avatar,
                acceptMode: this.myPresence.acceptMode,
                roomCode: this.currentRoomCode,
                timestamp: Date.now()
            });
        }
        
        // Démarrer heartbeat
        this.startHeartbeat();
        
        this.notifyPresenceUpdate();
    }
    
    // Heartbeat local + broadcast salle
    startHeartbeat() {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        
        this.heartbeatInterval = setInterval(() => {
            if (!this.myPresence) return;
            
            this.myPresence.timestamp = Date.now();
            
            // Heartbeat local
            this.saveToStorage();
            
            if (this.channel) {
                this.channel.postMessage({
                    type: 'heartbeat',
                    peerId: this.myPresence.peerId,
                    timestamp: Date.now()
                });
            }
            
            // Heartbeat salle P2P
            if (this.currentRoomCode) {
                this.broadcastToRoom({
                    type: 'heartbeat',
                    peerId: this.myPresence.peerId,
                    timestamp: Date.now()
                });
            }
        }, 3000); // Heartbeat toutes les 3s
    }
    
    // Gérer messages BroadcastChannel
    handleChannelMessage(message) {
        if (!message) return;
        
        switch (message.type) {
            case 'presence':
                if (message.player && message.player.peerId !== this.myPresence?.peerId) {
                    this.onlinePlayers.set(message.player.peerId, message.player);
                    this.notifyPresenceUpdate();
                    console.log('👋 Joueur détecté:', message.player.username);
                }
                break;
                
            case 'heartbeat':
                const player = this.onlinePlayers.get(message.peerId);
                if (player) {
                    player.timestamp = message.timestamp;
                }
                break;
                
            case 'disconnect':
                this.onlinePlayers.delete(message.peerId);
                this.notifyPresenceUpdate();
                console.log('👋 Joueur parti:', message.peerId);
                break;
        }
    }
    
    // Sauvegarder dans localStorage
    saveToStorage() {
        try {
            const allPlayers = {};
            
            if (this.myPresence) {
                allPlayers[this.myPresence.peerId] = this.myPresence;
            }
            
            const now = Date.now();
            this.onlinePlayers.forEach((player, peerId) => {
                if (now - player.timestamp < 15000) {
                    allPlayers[peerId] = player;
                }
            });
            
            localStorage.setItem(this.storageKey, JSON.stringify(allPlayers));
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
        }
    }
    
    // Sync depuis localStorage
    syncFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) return;
            
            const players = JSON.parse(stored);
            const now = Date.now();
            
            Object.entries(players).forEach(([peerId, player]) => {
                if (peerId !== this.myPresence?.peerId && now - player.timestamp < 15000) {
                    this.onlinePlayers.set(peerId, player);
                }
            });
            
            this.notifyPresenceUpdate();
        } catch (error) {
            console.error('❌ Erreur sync:', error);
        }
    }
    
    // Cleanup joueurs inactifs
    cleanupInactive() {
        const now = Date.now();
        let hasChanges = false;
        
        this.onlinePlayers.forEach((player, peerId) => {
            if (now - player.timestamp > 15000) {
                this.onlinePlayers.delete(peerId);
                hasChanges = true;
                console.log('🧹 Joueur inactif retiré:', player.username);
            }
        });
        
        if (hasChanges) {
            this.saveToStorage();
            this.notifyPresenceUpdate();
        }
    }
    
    // Arrêter
    async stop() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        // Quitter la salle si dans une
        if (this.currentRoomCode) {
            this.leaveRoom();
        }
        
        // Broadcast déconnexion locale
        if (this.channel && this.myPresence) {
            this.channel.postMessage({
                type: 'disconnect',
                peerId: this.myPresence.peerId
            });
        }
        
        // Retirer du localStorage
        if (this.myPresence) {
            try {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    const players = JSON.parse(stored);
                    delete players[this.myPresence.peerId];
                    localStorage.setItem(this.storageKey, JSON.stringify(players));
                }
            } catch (error) {
                console.error('❌ Erreur cleanup local:', error);
            }
        }
        
        this.myPresence = null;
    }
    
    // Notifier le système de salles
    notifyPresenceUpdate() {
        if (window.roomSystem) {
            // Mettre à jour availablePlayers avec les joueurs découverts
            this.onlinePlayers.forEach((player, peerId) => {
                if (!window.roomSystem.availablePlayers.has(peerId)) {
                    window.roomSystem.availablePlayers.set(peerId, {
                        username: player.username,
                        avatar: player.avatar,
                        acceptMode: player.acceptMode || 'manual',
                        playerCount: 1,
                        maxPlayers: 8,
                        lastSeen: player.timestamp,
                        isMe: false,
                        isBot: false
                    });
                }
            });
            
            // Retirer les joueurs qui ne sont plus en ligne
            window.roomSystem.availablePlayers.forEach((player, peerId) => {
                if (!player.isMe && !player.isBot && !this.onlinePlayers.has(peerId)) {
                    window.roomSystem.availablePlayers.delete(peerId);
                }
            });
            
            window.roomSystem.updateChatBubble();
        }
    }
    
    // Obtenir la liste des joueurs en ligne
    getOnlinePlayers() {
        return Array.from(this.onlinePlayers.values());
    }
    
    // Nettoyer avant fermeture
    async cleanup() {
        await this.stop();
        
        if (this.channel) {
            this.channel.close();
        }
    }
}

// Instance globale
window.presenceSystem = new PresenceSystem();

// Nettoyer avant fermeture de page
window.addEventListener('beforeunload', async () => {
    await window.presenceSystem.cleanup();
});

// Initialiser automatiquement quand tout est prêt
const initPresenceSystem = () => {
    let attempts = 0;
    const maxAttempts = 50;

    const checkInit = setInterval(() => {
        attempts++;

        if (window.simpleChatSystem && window.roomSystem) {
            const chatSystem = window.simpleChatSystem;

            // Attendre que le peer soit prêt
            if (chatSystem.peer && chatSystem.peer.id && chatSystem.currentUser) {
                clearInterval(checkInit);
                console.log('✅ Initialisation système présence localStorage...');
                window.presenceSystem.start(chatSystem.currentUser, chatSystem.peer.id);
            }
        }

        if (attempts >= maxAttempts) {
            clearInterval(checkInit);
            console.warn('⚠️ Timeout: Système de présence non initialisé');
        }
    }, 200);
};

// Lancer l'initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPresenceSystem);
} else {
    initPresenceSystem();
}

console.log('✅ Système de partage familial/amis P2P chargé - CODE DE SALLE 🏠🔐');
