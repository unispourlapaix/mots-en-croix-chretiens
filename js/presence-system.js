// Système de présence GRATUIT avec PeerJS + localStorage sync
// Découverte automatique via localStorage partagé entre onglets !
class PresenceSystem {
    constructor() {
        this.myPresence = null;
        this.onlinePlayers = new Map();
        this.heartbeatInterval = null;
        this.storageKey = 'crossword_players_online';
        this.channel = null;
        
        this.init();
    }
    
    init() {
        console.log('✅ Système de présence initialisé');
        
        // BroadcastChannel pour sync entre onglets
        try {
            this.channel = new BroadcastChannel('crossword_presence');
            this.channel.onmessage = (e) => this.handleChannelMessage(e.data);
        } catch (err) {
            console.warn('BroadcastChannel non supporté');
        }
        
        // Écouter localStorage pour sync
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
    
    // Annoncer ma présence

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
        
        console.log('📡 Annonce présence:', username, peerId);
        
        // Sauvegarder dans localStorage
        this.saveToStorage();
        
        // Broadcaster via BroadcastChannel
        if (this.channel) {
            this.channel.postMessage({
                type: 'presence',
                player: this.myPresence
            });
        }
        
        // Heartbeat toutes les 3 secondes
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        
        this.heartbeatInterval = setInterval(() => {
            this.myPresence.timestamp = Date.now();
            this.saveToStorage();
            
            if (this.channel) {
                this.channel.postMessage({
                    type: 'heartbeat',
                    peerId,
                    timestamp: Date.now()
                });
            }
        }, 3000);
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
    stop() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        // Broadcast déconnexion
        if (this.channel && this.myPresence) {
            this.channel.postMessage({
                type: 'disconnect',
                peerId: this.myPresence.peerId
            });
        }
        
        // Retirer du storage
        if (this.myPresence) {
            try {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    const players = JSON.parse(stored);
                    delete players[this.myPresence.peerId];
                    localStorage.setItem(this.storageKey, JSON.stringify(players));
                }
            } catch (error) {
                console.error('❌ Erreur cleanup:', error);
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
    cleanup() {
        this.stop();
        
        if (this.channel) {
            this.channel.close();
        }
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

console.log('✅ Système de présence chargé (localStorage + BroadcastChannel) 🙏');
