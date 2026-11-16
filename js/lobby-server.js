// Serveur Lobby "LoveJesus" - Point central de découverte
// Ce code doit tourner en permanence pour maintenir le lobby actif

class LobbyServer {
    constructor() {
        this.LOBBY_ID = "LoveJesus";
        this.peer = null;
        this.connections = new Map(); // peerId -> connection
        this.players = new Map(); // peerId -> playerInfo
        
        this.init();
    }
    
    init() {
        console.log('🙏 Démarrage du Lobby "LoveJesus"...');
        
        // Créer le peer avec l'ID fixe "LoveJesus"
        this.peer = new Peer(this.LOBBY_ID, {
            host: '0.peerjs.com',
            port: 443,
            path: '/',
            secure: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });
        
        this.peer.on('open', (id) => {
            console.log('✅ Lobby "LoveJesus" actif avec ID:', id);
            console.log('🌍 Les joueurs peuvent maintenant se connecter au lobby');
        });
        
        this.peer.on('connection', (conn) => {
            console.log('👋 Nouvelle connexion:', conn.peer);
            this.handleConnection(conn);
        });
        
        this.peer.on('error', (err) => {
            console.error('❌ Erreur lobby:', err);
            
            // Si l'ID est déjà pris, c'est normal (le lobby existe déjà)
            if (err.type === 'unavailable-id') {
                console.log('ℹ️ Le lobby "LoveJesus" existe déjà - OK !');
            } else {
                // Réessayer après 10 secondes
                setTimeout(() => this.init(), 10000);
            }
        });
        
        this.peer.on('disconnected', () => {
            console.log('⚠️ Lobby déconnecté, reconnexion...');
            this.peer.reconnect();
        });
        
        // Nettoyage périodique des connexions mortes
        setInterval(() => {
            this.cleanupDeadConnections();
        }, 30000); // Toutes les 30 secondes
        
        // Broadcast périodique de la liste des joueurs
        setInterval(() => {
            this.broadcastPlayerList();
        }, 5000); // Toutes les 5 secondes
    }
    
    handleConnection(conn) {
        const peerId = conn.peer;
        
        conn.on('open', () => {
            console.log('✅ Connexion établie avec:', peerId);
            this.connections.set(peerId, conn);
            
            // Envoyer la liste actuelle des joueurs au nouveau venu
            this.sendPlayerList(conn);
        });
        
        conn.on('data', (data) => {
            this.handleMessage(conn, data);
        });
        
        conn.on('close', () => {
            console.log('👋 Déconnexion:', peerId);
            this.connections.delete(peerId);
            this.players.delete(peerId);
            
            // Notifier les autres de la déconnexion
            this.broadcastToAll({
                type: 'disconnect',
                data: { peerId }
            });
        });
        
        conn.on('error', (err) => {
            console.error('❌ Erreur connexion:', peerId, err);
            this.connections.delete(peerId);
            this.players.delete(peerId);
        });
    }
    
    handleMessage(conn, message) {
        if (!message || typeof message !== 'object') return;
        
        const peerId = conn.peer;
        
        switch (message.type) {
            case 'presence':
                // Un joueur annonce sa présence
                console.log('📡 Présence reçue:', message.data?.username);
                this.players.set(peerId, message.data);
                
                // Broadcast à tous les autres
                this.broadcastToAll(message, peerId);
                break;
                
            case 'disconnect':
                // Un joueur se déconnecte proprement
                console.log('👋 Déconnexion propre:', message.data?.username);
                this.players.delete(peerId);
                this.connections.delete(peerId);
                
                // Notifier les autres
                this.broadcastToAll(message, peerId);
                break;
        }
    }
    
    sendPlayerList(conn) {
        const playerList = Array.from(this.players.values());
        
        try {
            conn.send({
                type: 'player_list',
                data: playerList
            });
        } catch (error) {
            console.error('❌ Erreur envoi liste:', error);
        }
    }
    
    broadcastPlayerList() {
        const playerList = Array.from(this.players.values());
        
        if (playerList.length > 0) {
            console.log('📢 Broadcast:', playerList.length, 'joueurs en ligne');
            
            this.broadcastToAll({
                type: 'player_list',
                data: playerList
            });
        }
    }
    
    broadcastToAll(message, excludePeerId = null) {
        this.connections.forEach((conn, peerId) => {
            if (peerId !== excludePeerId) {
                try {
                    conn.send(message);
                } catch (error) {
                    console.error('❌ Erreur broadcast à', peerId, error);
                }
            }
        });
    }
    
    cleanupDeadConnections() {
        const now = Date.now();
        const deadPeerIds = [];
        
        this.connections.forEach((conn, peerId) => {
            // Vérifier si la connexion est ouverte
            if (!conn.open) {
                deadPeerIds.push(peerId);
            }
        });
        
        deadPeerIds.forEach(peerId => {
            console.log('🧹 Nettoyage connexion morte:', peerId);
            this.connections.delete(peerId);
            this.players.delete(peerId);
        });
        
        if (deadPeerIds.length > 0) {
            console.log('🧹 Nettoyé', deadPeerIds.length, 'connexions mortes');
        }
    }
    
    getStats() {
        return {
            connections: this.connections.size,
            players: this.players.size,
            playerList: Array.from(this.players.values())
        };
    }
}

// Démarrer le lobby automatiquement
if (typeof window !== 'undefined') {
    // Dans un navigateur - pour tests
    window.lobbyServer = new LobbyServer();
    
    // Interface de debug
    window.getLobbyStats = () => {
        const stats = window.lobbyServer.getStats();
        console.log('📊 Statistiques du Lobby "LoveJesus":');
        console.log('  Connexions:', stats.connections);
        console.log('  Joueurs:', stats.players);
        console.log('  Liste:', stats.playerList);
        return stats;
    };
    
    console.log('ℹ️ Tapez getLobbyStats() pour voir les stats du lobby');
} else {
    // Dans Node.js - pour serveur dédié
    module.exports = LobbyServer;
}
