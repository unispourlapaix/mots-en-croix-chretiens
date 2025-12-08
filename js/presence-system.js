// Système de présence 100% GRATUIT P2P
// Découverte via "salle commune" PeerJS - 0€, infini, décentralisé !
class PresenceSystem {
    constructor() {
        this.myPresence = null;
        this.onlinePlayers = new Map();
        this.heartbeatInterval = null;
        this.storageKey = 'crossword_players_online';
        this.channel = null;
        this.discoveryRooms = []; // Salles de découverte P2P
        this.DISCOVERY_ROOM_PREFIX = 'JESUS-CROSSWORD-ROOM-'; // Préfixe des salles
        this.MAX_ROOMS = 5; // Nombre de salles pour découverte
        
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
    
    // Rejoindre les salles de découverte P2P
    joinDiscoveryRooms() {
        if (!window.simpleChatSystem?.peer) {
            console.warn('⚠️ Peer non disponible pour découverte');
            return;
        }
        
        console.log('🔍 Rejoindre salles de découverte P2P...');
        
        // Se connecter à plusieurs salles pour augmenter les chances de découverte
        for (let i = 0; i < this.MAX_ROOMS; i++) {
            const roomId = `${this.DISCOVERY_ROOM_PREFIX}${i}`;
            
            try {
                const conn = window.simpleChatSystem.peer.connect(roomId, {
                    reliable: true,
                    metadata: {
                        type: 'discovery',
                        peerId: this.myPresence.peerId,
                        username: this.myPresence.username,
                        avatar: this.myPresence.avatar,
                        acceptMode: this.myPresence.acceptMode
                    }
                });
                
                conn.on('open', () => {
                    console.log(`✅ Connecté à salle ${i}`);
                    
                    // Annoncer ma présence dans cette salle
                    conn.send({
                        type: 'announce',
                        peerId: this.myPresence.peerId,
                        username: this.myPresence.username,
                        avatar: this.myPresence.avatar,
                        acceptMode: this.myPresence.acceptMode,
                        timestamp: Date.now()
                    });
                });
                
                conn.on('data', (data) => {
                    this.handleDiscoveryMessage(data, conn);
                });
                
                conn.on('error', (err) => {
                    // Normal - la salle n'existe peut-être pas encore
                    console.log(`📭 Salle ${i} vide ou inexistante`);
                });
                
                this.discoveryRooms.push(conn);
                
            } catch (err) {
                console.log(`📭 Impossible de rejoindre salle ${i}`);
            }
        }
    }
    
    // Gérer messages de découverte P2P
    handleDiscoveryMessage(data, conn) {
        if (!data || !data.type) return;
        
        switch (data.type) {
            case 'announce':
                // Un autre joueur s'annonce
                if (data.peerId && data.peerId !== this.myPresence?.peerId) {
                    console.log('👋 Joueur découvert via P2P:', data.username);
                    
                    this.onlinePlayers.set(data.peerId, {
                        peerId: data.peerId,
                        username: data.username,
                        avatar: data.avatar || '😊',
                        acceptMode: data.acceptMode || 'manual',
                        timestamp: data.timestamp || Date.now()
                    });
                    
                    this.notifyPresenceUpdate();
                    
                    // Répondre avec ma présence
                    if (conn && conn.open) {
                        conn.send({
                            type: 'announce',
                            peerId: this.myPresence.peerId,
                            username: this.myPresence.username,
                            avatar: this.myPresence.avatar,
                            acceptMode: this.myPresence.acceptMode,
                            timestamp: Date.now()
                        });
                    }
                }
                break;
                
            case 'heartbeat':
                // Mise à jour heartbeat d'un joueur
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
                    this.notifyPresenceUpdate();
                }
                break;
        }
    }
    
    // Devenir salle de découverte (listener)
    becomeDiscoveryRoom() {
        if (!window.simpleChatSystem?.peer) return;
        
        // Écouter les connexions entrantes pour la découverte
        window.simpleChatSystem.peer.on('connection', (conn) => {
            if (conn.metadata?.type === 'discovery') {
                console.log('📞 Connexion découverte entrante:', conn.metadata.username);
                
                conn.on('open', () => {
                    // Envoyer ma présence
                    conn.send({
                        type: 'announce',
                        peerId: this.myPresence.peerId,
                        username: this.myPresence.username,
                        avatar: this.myPresence.avatar,
                        acceptMode: this.myPresence.acceptMode,
                        timestamp: Date.now()
                    });
                    
                    // Envoyer la liste de tous les joueurs que je connais
                    this.onlinePlayers.forEach((player, peerId) => {
                        if (peerId !== conn.peer) { // Ne pas renvoyer le joueur à lui-même
                            conn.send({
                                type: 'announce',
                                peerId: player.peerId,
                                username: player.username,
                                avatar: player.avatar,
                                acceptMode: player.acceptMode,
                                timestamp: player.timestamp
                            });
                        }
                    });
                });
                
                conn.on('data', (data) => {
                    this.handleDiscoveryMessage(data, conn);
                });
            }
        });
    }

    start(username, peerId) {
        this.announcePresence(peerId, username, '😊');
    }
    
    // Annoncer ma présence (local + P2P mondial)
    async announcePresence(peerId, username, avatar = '😊', acceptMode = 'manual') {
        this.myPresence = {
            peerId,
            username,
            avatar,
            acceptMode,
            timestamp: Date.now()
        };
        
        console.log('📢 Annonce présence P2P:', username);
        
        // Sauvegarder localement
        this.saveToStorage();
        
        // Broadcast aux autres onglets
        if (this.channel) {
            this.channel.postMessage({
                type: 'presence',
                presence: this.myPresence
            });
        }
        
        // Devenir salle de découverte P2P (écouter connexions)
        this.becomeDiscoveryRoom();
        
        // Rejoindre salles de découverte P2P (se connecter aux autres)
        setTimeout(() => {
            this.joinDiscoveryRooms();
        }, 1000); // Attendre 1s que le peer soit bien établi
        
        // Démarrer heartbeat
        this.startHeartbeat();
        
        this.notifyPresenceUpdate();
    }
    
    // Heartbeat local + broadcast P2P
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
            
            // Heartbeat P2P vers salles de découverte
            this.discoveryRooms.forEach(conn => {
                if (conn && conn.open) {
                    try {
                        conn.send({
                            type: 'heartbeat',
                            peerId: this.myPresence.peerId,
                            timestamp: Date.now()
                        });
                    } catch (err) {
                        // Connexion fermée, normal
                    }
                }
            });
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
        
        // Broadcast goodbye vers salles P2P
        this.discoveryRooms.forEach(conn => {
            if (conn && conn.open) {
                try {
                    conn.send({
                        type: 'goodbye',
                        peerId: this.myPresence.peerId,
                        username: this.myPresence.username
                    });
                    conn.close();
                } catch (err) {
                    // Connexion déjà fermée
                }
            }
        });
        this.discoveryRooms = [];
        
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

console.log('✅ Système de présence P2P chargé - 100% GRATUIT, 0 serveur ! 🌍🙏');
