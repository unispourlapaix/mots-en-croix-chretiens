// Système de présence globale avec Y.js + WebRTC
// Lobby en ligne cross-device sans serveur commercial

class YjsPresenceSystem {
    constructor() {
        this.ydoc = null;
        this.provider = null;
        this.awareness = null;
        this.onPlayersChangeCallback = null;
        this.heartbeatInterval = null;
        this.isInitialized = false;
        
        // État local
        this.myState = {
            peerId: null,
            username: 'Anonyme',
            avatar: '😊',
            timestamp: Date.now(),
            roomCode: null // Code de salle si en salle privée
        };
    }
    
    // Initialiser Y.js avec WebRTC
    async init() {
        if (this.isInitialized) {
            console.log('⚠️ YjsPresenceSystem déjà initialisé');
            return;
        }
        
        try {
            console.log('🔄 Initialisation Y.js Presence...');
            
            // Vérifier que Y et y-webrtc sont chargés
            if (typeof Y === 'undefined') {
                throw new Error('Y.js non chargé - ajoutez le CDN dans index.html');
            }
            if (typeof WebrtcProvider === 'undefined') {
                throw new Error('y-webrtc non chargé - ajoutez le CDN dans index.html');
            }
            
            // Créer le document partagé
            this.ydoc = new Y.Doc();
            
            // Provider WebRTC avec serveurs de signaling publics gratuits
            this.provider = new WebrtcProvider(
                'mots-croix-global-lobby', // Room global pour tous les joueurs
                this.ydoc,
                {
                    signaling: [
                        'wss://signaling.yjs.dev',
                        'wss://y-webrtc-signaling-eu.herokuapp.com',
                        'wss://y-webrtc-signaling-us.herokuapp.com'
                    ],
                    password: null, // Lobby public
                    awareness: true, // Activer awareness pour présence temps réel
                    maxConns: 20, // Max 20 connexions P2P simultanées
                    filterBcConns: true // Filtrer connexions broadcast
                }
            );
            
            // Awareness = qui est connecté maintenant
            this.awareness = this.provider.awareness;
            
            // Écouter les changements de présence
            this.awareness.on('change', () => {
                this.handlePresenceChange();
            });
            
            // Gérer les événements de connexion
            this.provider.on('synced', (synced) => {
                console.log(synced ? '✅ Y.js synchronisé' : '⏳ Y.js en cours de sync...');
            });
            
            this.provider.on('peers', (event) => {
                const { added, removed, webrtcPeers } = event;
                if (added.length > 0) {
                    console.log('👋 Nouveaux peers WebRTC:', added.length);
                }
                if (removed.length > 0) {
                    console.log('👋 Peers déconnectés:', removed.length);
                }
                console.log('🌐 Total peers WebRTC:', webrtcPeers.size);
            });
            
            this.isInitialized = true;
            console.log('✅ YjsPresenceSystem initialisé');
            
            return true;
        } catch (err) {
            console.error('❌ Erreur init Y.js:', err);
            return false;
        }
    }
    
    // Annoncer ma présence
    announcePresence(peerId, username, avatar, roomCode = null) {
        if (!this.isInitialized || !this.awareness) {
            console.warn('⚠️ YjsPresenceSystem non initialisé');
            return;
        }
        
        this.myState = {
            peerId: peerId,
            username: username || 'Anonyme',
            avatar: avatar || '😊',
            timestamp: Date.now(),
            roomCode: roomCode
        };
        
        this.awareness.setLocalState(this.myState);
        console.log('📢 Présence annoncée:', this.myState);
    }
    
    // Démarrer le heartbeat automatique
    startHeartbeat(peerId, username, avatar, roomCode = null) {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        // Premier heartbeat immédiat
        this.announcePresence(peerId, username, avatar, roomCode);
        
        // Heartbeat toutes les 30 secondes
        this.heartbeatInterval = setInterval(() => {
            this.announcePresence(peerId, username, avatar, roomCode);
        }, 30000);
        
        console.log('💓 Heartbeat démarré (30s)');
    }
    
    // Arrêter le heartbeat
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
            console.log('💔 Heartbeat arrêté');
        }
        
        // Retirer ma présence
        if (this.awareness) {
            this.awareness.setLocalState(null);
        }
    }
    
    // Gérer les changements de présence
    handlePresenceChange() {
        if (!this.awareness) return;
        
        const states = this.awareness.getStates();
        const now = Date.now();
        const players = [];
        
        states.forEach((state, clientId) => {
            if (state && state.peerId) {
                // Filtrer les joueurs trop vieux (>90s = considérés déconnectés)
                const age = now - (state.timestamp || 0);
                if (age < 90000) {
                    players.push({
                        clientId: clientId,
                        peerId: state.peerId,
                        username: state.username || 'Anonyme',
                        avatar: state.avatar || '😊',
                        roomCode: state.roomCode || null,
                        timestamp: state.timestamp,
                        age: Math.floor(age / 1000) // âge en secondes
                    });
                }
            }
        });
        
        // Trier par timestamp (plus récent en premier)
        players.sort((a, b) => b.timestamp - a.timestamp);
        
        console.log(`👥 ${players.length} joueur(s) en ligne`, players);
        
        // Notifier le callback
        if (this.onPlayersChangeCallback) {
            this.onPlayersChangeCallback(players);
        }
    }
    
    // Enregistrer un callback pour les changements
    onPlayersChange(callback) {
        this.onPlayersChangeCallback = callback;
        
        // Déclencher immédiatement avec l'état actuel
        this.handlePresenceChange();
    }
    
    // Obtenir la liste actuelle des joueurs
    getOnlinePlayers() {
        if (!this.awareness) return [];
        
        const states = this.awareness.getStates();
        const now = Date.now();
        const players = [];
        
        states.forEach((state, clientId) => {
            if (state && state.peerId) {
                const age = now - (state.timestamp || 0);
                if (age < 90000) {
                    players.push({
                        clientId: clientId,
                        peerId: state.peerId,
                        username: state.username || 'Anonyme',
                        avatar: state.avatar || '😊',
                        roomCode: state.roomCode || null,
                        timestamp: state.timestamp,
                        age: Math.floor(age / 1000)
                    });
                }
            }
        });
        
        return players;
    }
    
    // Mettre à jour mon code de salle
    updateRoomCode(roomCode) {
        if (this.myState) {
            this.announcePresence(
                this.myState.peerId,
                this.myState.username,
                this.myState.avatar,
                roomCode
            );
        }
    }
    
    // Cleanup complet
    destroy() {
        console.log('🧹 Nettoyage YjsPresenceSystem...');
        
        this.stopHeartbeat();
        
        if (this.provider) {
            this.provider.destroy();
            this.provider = null;
        }
        
        if (this.ydoc) {
            this.ydoc.destroy();
            this.ydoc = null;
        }
        
        this.awareness = null;
        this.isInitialized = false;
        this.onPlayersChangeCallback = null;
        
        console.log('✅ YjsPresenceSystem nettoyé');
    }
}

// Export global
window.YjsPresenceSystem = YjsPresenceSystem;
