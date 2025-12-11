/**
 * Adaptateur Trystero pour remplacer PeerJS
 * API compatible avec l'ancien système PeerJS
 * Utilise BitTorrent trackers publics (décentralisé, sans serveur)
 */

class TrysteroAdapter {
    constructor() {
        this.id = null;
        this.room = null;
        this.connections = new Map();
        this.eventHandlers = {
            'open': [],
            'connection': [],
            'error': [],
            'close': []
        };
        this.username = null;
        this.roomId = null;
    }

    /**
     * Initialiser l'adaptateur
     */
    async init(username, roomId = null) {
        this.username = username;
        this.roomId = roomId || this.generateRoomId();
        this.id = this.generatePeerId();

        try {
            console.log('🚀 Initialisation Trystero P2P...');
            console.log('📍 Room:', this.roomId);
            console.log('🆔 Peer ID:', this.id);

            // Rejoindre ou créer une room Trystero
            // Configuration avec BitTorrent trackers publics
            const config = {
                appId: 'mots-croix-chretiens-v1',
                // Utiliser plusieurs trackers pour meilleure fiabilité
                trackerUrls: [
                    'wss://tracker.openwebtorrent.com',
                    'wss://tracker.btorrent.xyz',
                    'wss://tracker.files.fm:7073/announce'
                ],
                // Timeout pour les connexions
                rtcConfig: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            };

            this.room = window.joinRoom(config, this.roomId);

            // Actions disponibles
            const [sendChatMessage, getChatMessage] = this.room.makeAction('chat');
            const [sendRoomData, getRoomData] = this.room.makeAction('room');
            const [sendPresence, getPresence] = this.room.makeAction('presence');
            const [sendRaceData, getRaceData] = this.room.makeAction('race');

            // Stocker les actions
            this.actions = {
                sendChatMessage,
                sendRoomData,
                sendPresence,
                sendRaceData
            };

            // Gérer les nouveaux peers
            this.room.onPeerJoin(peerId => {
                console.log('👋 Nouveau peer connecté:', peerId);
                
                // Créer un objet connection compatible PeerJS
                const connection = {
                    peer: peerId,
                    open: true,
                    send: (data) => this.sendToConnection(peerId, data),
                    close: () => this.closeConnection(peerId),
                    on: (event, handler) => {
                        if (!this.connections.has(peerId)) {
                            this.connections.set(peerId, { handlers: {} });
                        }
                        const conn = this.connections.get(peerId);
                        if (!conn.handlers[event]) conn.handlers[event] = [];
                        conn.handlers[event].push(handler);
                    }
                };

                this.connections.set(peerId, connection);

                // Émettre l'événement 'connection'
                this.emit('connection', connection);

                // Envoyer notre présence au nouveau peer
                setTimeout(() => {
                    this.actions.sendPresence({
                        type: 'presence',
                        peerId: this.id,
                        username: this.username,
                        timestamp: Date.now()
                    }, peerId);
                }, 100);
            });

            // Gérer les départs de peers
            this.room.onPeerLeave(peerId => {
                console.log('👋 Peer déconnecté:', peerId);
                const connection = this.connections.get(peerId);
                if (connection && connection.handlers?.['close']) {
                    connection.handlers['close'].forEach(h => h());
                }
                this.connections.delete(peerId);
            });

            // Recevoir les messages chat
            getChatMessage((data, peerId) => {
                const connection = this.connections.get(peerId);
                if (connection && connection.handlers?.['data']) {
                    connection.handlers['data'].forEach(h => h(data));
                }
            });

            // Recevoir les données de room
            getRoomData((data, peerId) => {
                const connection = this.connections.get(peerId);
                if (connection && connection.handlers?.['data']) {
                    connection.handlers['data'].forEach(h => h(data));
                }
            });

            // Recevoir les présences
            getPresence((data, peerId) => {
                const connection = this.connections.get(peerId);
                if (connection && connection.handlers?.['data']) {
                    connection.handlers['data'].forEach(h => h(data));
                }
            });

            // Recevoir les données de course
            getRaceData((data, peerId) => {
                const connection = this.connections.get(peerId);
                if (connection && connection.handlers?.['data']) {
                    connection.handlers['data'].forEach(h => h(data));
                }
            });

            // Room prête
            setTimeout(() => {
                console.log('✅ Trystero P2P initialisé');
                this.emit('open', this.id);
            }, 500);

        } catch (error) {
            console.error('❌ Erreur initialisation Trystero:', error);
            this.emit('error', error);
        }
    }

    /**
     * Envoyer des données à une connexion spécifique
     */
    sendToConnection(peerId, data) {
        if (!this.room || !this.actions) {
            console.error('❌ Room non initialisée');
            return;
        }

        // Choisir l'action appropriée selon le type de données
        if (data.type === 'chat') {
            this.actions.sendChatMessage(data, peerId);
        } else if (data.type === 'race' || data.type === 'race-start' || 
                   data.type === 'word-completed' || data.type === 'race-finished') {
            this.actions.sendRaceData(data, peerId);
        } else if (data.type === 'presence') {
            this.actions.sendPresence(data, peerId);
        } else {
            this.actions.sendRoomData(data, peerId);
        }
    }

    /**
     * Broadcast à tous les peers
     */
    broadcast(data) {
        this.connections.forEach((_, peerId) => {
            this.sendToConnection(peerId, data);
        });
    }

    /**
     * Connecter à un peer (room)
     */
    connect(roomId) {
        // Dans Trystero, on rejoint directement la room
        if (this.room) {
            console.log('⚠️ Déjà dans une room, déconnexion...');
            this.destroy();
        }
        
        return this.init(this.username, roomId);
    }

    /**
     * Fermer une connexion
     */
    closeConnection(peerId) {
        const connection = this.connections.get(peerId);
        if (connection && connection.handlers?.['close']) {
            connection.handlers['close'].forEach(h => h());
        }
        this.connections.delete(peerId);
    }

    /**
     * Event listener
     */
    on(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        }
    }

    /**
     * Émettre un événement
     */
    emit(event, ...args) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(...args));
        }
    }

    /**
     * Détruire la connexion
     */
    destroy() {
        if (this.room) {
            this.room.leave();
            this.room = null;
        }
        this.connections.clear();
        this.emit('close');
    }

    /**
     * Générer un ID de peer unique
     */
    generatePeerId() {
        return 'peer-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Générer un ID de room unique
     */
    generateRoomId() {
        return 'room-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    }

    /**
     * Obtenir le nombre de peers connectés
     */
    getPeerCount() {
        return this.connections.size;
    }

    /**
     * Obtenir la liste des peers
     */
    getPeers() {
        return Array.from(this.connections.keys());
    }
}

// Exporter pour compatibilité globale
window.TrysteroAdapter = TrysteroAdapter;

// Alias Peer pour compatibilité avec l'ancien code PeerJS
window.Peer = function(config) {
    const adapter = new TrysteroAdapter();
    // Initialiser automatiquement
    setTimeout(() => {
        const username = window.authSystem?.getCurrentUser()?.username || 
                        'Joueur' + Math.floor(Math.random() * 1000);
        adapter.init(username);
    }, 0);
    return adapter;
};

console.log('✅ Adaptateur Trystero chargé - P2P décentralisé activé');
