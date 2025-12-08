// Système de présence GRATUIT avec BroadcastChannel + localStorage
// Fonctionne sans serveur, totalement gratuit !
class PresenceSystem {
    constructor() {
        this.channel = null;
        this.myPresence = null;
        this.onlinePlayers = new Map();
        this.heartbeatInterval = null;
        this.cleanupInterval = null;
        this.storageKey = 'crossword_online_players';
        
        this.init();
    }
    
    init() {
        // Créer un canal de broadcast pour communiquer entre onglets
        try {
            this.channel = new BroadcastChannel('crossword_presence');
            this.channel.onmessage = (event) => this.handleBroadcastMessage(event);
            console.log('✅ BroadcastChannel créé pour la présence');
        } catch (error) {
            console.warn('⚠️ BroadcastChannel non supporté, fallback localStorage seul');
        }
        
        // Écouter les changements de localStorage (entre onglets/fenêtres)
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.syncFromStorage();
            }
        });
        
        // Nettoyer les joueurs inactifs toutes les 5 secondes
        this.cleanupInterval = setInterval(() => {
            this.cleanupInactivePlayers();
        }, 5000);
        
        // Synchroniser depuis le storage au démarrage
        this.syncFromStorage();
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
        
        // Broadcast via BroadcastChannel (même navigateur, différents onglets)
        if (this.channel) {
            this.channel.postMessage({
                type: 'presence',
                data: this.myPresence
            });
        }
        
        // Sauvegarder dans localStorage
        this.saveToStorage();
        
        // Heartbeat toutes les 3 secondes
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        this.heartbeatInterval = setInterval(() => {
            this.myPresence.timestamp = Date.now();
            this.saveToStorage();
            
            if (this.channel) {
                this.channel.postMessage({
                    type: 'heartbeat',
                    data: { peerId, timestamp: Date.now() }
                });
            }
        }, 3000);
        
        console.log('📡 Présence annoncée:', username, peerId);
    }
    
    // Arrêter d'annoncer ma présence (remplace stop)
    stop() {
        this.stopAnnouncing();
    }
    
    stopAnnouncing() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.myPresence) {
            // Broadcast déconnexion
            if (this.channel) {
                this.channel.postMessage({
                    type: 'disconnect',
                    data: { peerId: this.myPresence.peerId }
                });
            }
            
            // Retirer du storage
            this.removeFromStorage(this.myPresence.peerId);
            this.myPresence = null;
        }
    }
    
    // Gérer les messages broadcast
    handleBroadcastMessage(event) {
        const { type, data } = event.data;
        
        switch (type) {
            case 'presence':
                // Un joueur annonce sa présence
                if (data.peerId !== this.myPresence?.peerId) {
                    this.onlinePlayers.set(data.peerId, data);
                    this.notifyPresenceUpdate();
                }
                break;
                
            case 'heartbeat':
                // Mise à jour du timestamp
                const player = this.onlinePlayers.get(data.peerId);
                if (player) {
                    player.timestamp = data.timestamp;
                }
                break;
                
            case 'disconnect':
                // Un joueur se déconnecte
                this.onlinePlayers.delete(data.peerId);
                this.notifyPresenceUpdate();
                break;
        }
    }
    
    // Sauvegarder dans localStorage
    saveToStorage() {
        try {
            const allPlayers = {};
            
            // Ajouter ma présence
            if (this.myPresence) {
                allPlayers[this.myPresence.peerId] = this.myPresence;
            }
            
            // Ajouter les autres joueurs actifs (< 10 secondes)
            const now = Date.now();
            this.onlinePlayers.forEach((player, peerId) => {
                if (now - player.timestamp < 10000) {
                    allPlayers[peerId] = player;
                }
            });
            
            localStorage.setItem(this.storageKey, JSON.stringify(allPlayers));
        } catch (error) {
            console.error('Erreur sauvegarde présence:', error);
        }
    }
    
    // Retirer du storage
    removeFromStorage(peerId) {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const players = JSON.parse(stored);
                delete players[peerId];
                localStorage.setItem(this.storageKey, JSON.stringify(players));
            }
        } catch (error) {
            console.error('Erreur retrait présence:', error);
        }
    }
    
    // Synchroniser depuis localStorage
    syncFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) return;
            
            const players = JSON.parse(stored);
            const now = Date.now();
            
            // Mettre à jour la liste des joueurs en ligne
            Object.entries(players).forEach(([peerId, data]) => {
                // Ignorer ma propre présence et les joueurs trop vieux
                if (peerId !== this.myPresence?.peerId && now - data.timestamp < 10000) {
                    this.onlinePlayers.set(peerId, data);
                }
            });
            
            this.notifyPresenceUpdate();
        } catch (error) {
            console.error('Erreur sync présence:', error);
        }
    }
    
    // Nettoyer les joueurs inactifs (> 10 secondes)
    cleanupInactivePlayers() {
        const now = Date.now();
        let hasChanges = false;
        
        this.onlinePlayers.forEach((player, peerId) => {
            if (now - player.timestamp > 10000) {
                this.onlinePlayers.delete(peerId);
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            this.saveToStorage();
            this.notifyPresenceUpdate();
        }
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
        this.stopAnnouncing();
        
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
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
                console.log('✅ Initialisation du système de présence...');
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

console.log('✅ Système de présence chargé (BroadcastChannel + localStorage)');

