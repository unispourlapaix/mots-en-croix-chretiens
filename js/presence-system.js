// Système de présence GRATUIT avec PeerJS Lobby
// Découverte mondiale via serveur PeerJS cloud gratuit !
class PresenceSystem {
    constructor() {
        this.LOBBY_ID = "LoveJesus"; // 🙏 Lobby global pour tous les joueurs
        this.lobbyConnection = null;
        this.myPresence = null;
        this.onlinePlayers = new Map();
        this.heartbeatInterval = null;
        this.reconnectInterval = null;
        this.isConnectedToLobby = false;
        
        this.init();
    }
    
    init() {
        console.log('✅ Système de présence PeerJS initialisé');
    }
    
    // Se connecter au lobby global
    connectToLobby() {
        if (!window.simpleChatSystem?.peer || this.isConnectedToLobby) return;
        
        console.log('🌍 Connexion au lobby mondial "LoveJesus"...');
        
        try {
            // Se connecter au lobby
            this.lobbyConnection = window.simpleChatSystem.peer.connect(this.LOBBY_ID, {
                reliable: true,
                metadata: {
                    type: 'lobby',
                    username: this.myPresence?.username,
                    peerId: window.simpleChatSystem.peer.id
                }
            });
            
            this.lobbyConnection.on('open', () => {
                console.log('✅ Connecté au lobby "LoveJesus"');
                this.isConnectedToLobby = true;
                
                // Annoncer ma présence
                if (this.myPresence) {
                    this.broadcastPresence();
                }
            });
            
            this.lobbyConnection.on('data', (data) => {
                this.handleLobbyMessage(data);
            });
            
            this.lobbyConnection.on('close', () => {
                console.log('❌ Déconnecté du lobby');
                this.isConnectedToLobby = false;
                // Reconnecter après 5 secondes
                setTimeout(() => this.connectToLobby(), 5000);
            });
            
            this.lobbyConnection.on('error', (err) => {
                console.error('❌ Erreur lobby:', err);
                this.isConnectedToLobby = false;
            });
            
        } catch (error) {
            console.error('❌ Erreur connexion lobby:', error);
            // Réessayer après 5 secondes
            setTimeout(() => this.connectToLobby(), 5000);
        }
    }
    
    // Annoncer ma présence (remplace start)
    start(username, peerId) {
        this.announcePresence(peerId, username, '😊');
    }
    
    announcePresence(peerId, username, avatar) {
        this.myPresence = {
            peerId,
            username,
            avatar,
            timestamp: Date.now(),
            acceptMode: window.roomSystem?.acceptMode || 'manual'
        };
        
        console.log('📡 Présence annoncée:', username, peerId);
        
        // Se connecter au lobby
        this.connectToLobby();
        
        // Broadcast périodique
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        this.heartbeatInterval = setInterval(() => {
            this.broadcastPresence();
        }, 10000); // Toutes les 10 secondes
    }
    
    // Broadcast ma présence au lobby
    broadcastPresence() {
        if (!this.lobbyConnection || !this.isConnectedToLobby || !this.myPresence) return;
        
        try {
            this.lobbyConnection.send({
                type: 'presence',
                data: {
                    ...this.myPresence,
                    timestamp: Date.now()
                }
            });
        } catch (error) {
            console.error('❌ Erreur broadcast présence:', error);
        }
    }
    
    // Gérer les messages du lobby
    handleLobbyMessage(message) {
        if (!message || typeof message !== 'object') return;
        
        switch (message.type) {
            case 'presence':
                // Un joueur annonce sa présence
                if (message.data && message.data.peerId !== this.myPresence?.peerId) {
                    this.onlinePlayers.set(message.data.peerId, message.data);
                    this.notifyPresenceUpdate();
                    console.log('👋 Joueur détecté:', message.data.username);
                }
                break;
                
            case 'player_list':
                // Le lobby envoie la liste complète des joueurs
                if (Array.isArray(message.data)) {
                    console.log('📋 Liste des joueurs reçue:', message.data.length, 'joueurs');
                    message.data.forEach(player => {
                        if (player.peerId !== this.myPresence?.peerId) {
                            this.onlinePlayers.set(player.peerId, player);
                        }
                    });
                    this.notifyPresenceUpdate();
                }
                break;
                
            case 'disconnect':
                // Un joueur se déconnecte
                if (message.data?.peerId) {
                    this.onlinePlayers.delete(message.data.peerId);
                    this.notifyPresenceUpdate();
                    console.log('👋 Joueur parti:', message.data.username || message.data.peerId);
                }
                break;
        }
    }
    
    // Arrêter d'annoncer ma présence
    stop() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        // Annoncer la déconnexion au lobby
        if (this.lobbyConnection && this.isConnectedToLobby && this.myPresence) {
            try {
                this.lobbyConnection.send({
                    type: 'disconnect',
                    data: { 
                        peerId: this.myPresence.peerId,
                        username: this.myPresence.username
                    }
                });
            } catch (error) {
                console.error('❌ Erreur annonce déconnexion:', error);
            }
        }
        
        // Fermer la connexion lobby
        if (this.lobbyConnection) {
            this.lobbyConnection.close();
            this.lobbyConnection = null;
        }
        
        this.isConnectedToLobby = false;
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
    cleanup() {
        this.stop();
    }
}

// Instance globale
window.presenceSystem = new PresenceSystem();

// Nettoyer avant fermeture de page
window.addEventListener('beforeunload', () => {
    window.presenceSystem.cleanup();
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
                console.log('✅ Initialisation du système de présence "LoveJesus"...');
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

console.log('✅ Système de présence PeerJS chargé - Lobby: "LoveJesus" 🙏');

