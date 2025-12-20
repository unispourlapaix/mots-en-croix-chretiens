// Système de Présence Lobby avec Supabase Realtime
// Remplace le système localStorage/BroadcastChannel par une solution cloud

class RealtimeLobbySystem {
    constructor() {
        this.myPresence = null;
        this.channel = null;
        this.onlinePlayers = new Map(); // peerId -> playerInfo
        this.heartbeatInterval = null;
        this.presenceCallbacks = [];
        this.isInitialized = false;
    }

    // Initialiser le système Realtime
    async init() {
        if (!supabase) {
            console.warn('⚠️ Supabase non configuré, utilisation du système P2P local');
            return false;
        }

        console.log('🌐 Initialisation Lobby Realtime Supabase...');

        try {
            // Créer un channel Realtime pour le lobby
            this.channel = supabase.channel('lobby:public', {
                config: {
                    broadcast: { self: true },
                    presence: { key: '' }
                }
            });

            // Écouter les changements de présence
            this.channel
                .on('presence', { event: 'sync' }, () => {
                    this.syncPresence();
                })
                .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                    console.log('👋 Joueur rejoint:', newPresences);
                    this.handlePresenceJoin(newPresences);
                })
                .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                    console.log('👋 Joueur parti:', leftPresences);
                    this.handlePresenceLeave(leftPresences);
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Lobby Realtime connecté');
                        this.isInitialized = true;
                        
                        // Enregistrer ma présence
                        await this.registerMyPresence();
                        
                        // Démarrer le heartbeat (toutes les 30s)
                        this.startHeartbeat();
                    }
                });

            return true;
        } catch (err) {
            console.error('❌ Erreur init Lobby Realtime:', err);
            return false;
        }
    }

    // Enregistrer ma présence
    async registerMyPresence() {
        if (!window.simpleChatSystem?.peer?.id) {
            console.warn('⚠️ Peer non initialisé, impossible d\'enregistrer la présence');
            return;
        }

        const username = window.authSystem?.getCurrentUser()?.username || 
                        window.simpleChatSystem?.currentUser || 
                        'Joueur';
        const peerId = window.simpleChatSystem.peer.id;

        this.myPresence = {
            peer_id: peerId,
            username: username,
            avatar: '😊',
            room_code: window.roomSystem?.roomInfo?.roomId || null,
            room_mode: window.roomSystem?.acceptMode || 'manual',
            player_count: 1,
            max_players: 8,
            status: window.roomSystem?.roomInfo?.roomId ? 'in_room' : 'available',
            last_seen: new Date().toISOString()
        };

        try {
            // Track presence dans le channel (source unique de vérité)
            await this.channel.track(this.myPresence);
            console.log('✅ Présence enregistrée:', username, peerId);

            // Notifier les callbacks
            this.notifyPresenceUpdate();
        } catch (err) {
            console.error('❌ Erreur enregistrement présence:', err);
        }
    }

    // Synchroniser la présence depuis le channel
    syncPresence() {
        if (!this.channel) return;

        const state = this.channel.presenceState();
        
        // Convertir en Map
        this.onlinePlayers.clear();
        
        Object.keys(state).forEach(peerId => {
            const presences = state[peerId];
            if (presences && presences.length > 0) {
                const presence = presences[0]; // Prendre la première présence
                this.onlinePlayers.set(presence.peer_id, presence);
            }
        });

        console.log(`👥 ${this.onlinePlayers.size} joueur(s) en ligne`);
        this.notifyPresenceUpdate();
    }

    // Gérer l'arrivée d'un joueur
    handlePresenceJoin(newPresences) {
        newPresences.forEach(presence => {
            this.onlinePlayers.set(presence.peer_id, presence);
            console.log('➕', presence.username, 'a rejoint le lobby');
        });

        this.notifyPresenceUpdate();
    }

    // Gérer le départ d'un joueur
    handlePresenceLeave(leftPresences) {
        leftPresences.forEach(presence => {
            this.onlinePlayers.delete(presence.peer_id);
            console.log('➖', presence.username, 'a quitté le lobby');
        });

        this.notifyPresenceUpdate();
    }

    // Démarrer le heartbeat
    startHeartbeat() {
        // Nettoyer l'ancien interval si existant
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        // Heartbeat toutes les 30 secondes
        this.heartbeatInterval = setInterval(async () => {
            if (this.myPresence && this.channel) {
                // Mettre à jour last_seen
                this.myPresence.last_seen = new Date().toISOString();
                
                // Update dans le channel uniquement
                await this.channel.track(this.myPresence);
            }
        }, 30000); // 30 secondes

        console.log('💓 Heartbeat démarré (30s)');
    }

    // Mettre à jour ma présence
    async updateMyPresence(updates) {
        if (!this.myPresence) return;

        // Fusionner les updates
        this.myPresence = {
            ...this.myPresence,
            ...updates,
            last_seen: new Date().toISOString()
        };

        try {
            // Update channel uniquement
            await this.channel.track(this.myPresence);

            console.log('🔄 Présence mise à jour:', updates);
            this.notifyPresenceUpdate();
        } catch (err) {
            console.error('❌ Erreur update présence:', err);
        }
    }

    // Mettre à jour le code de salle
    async updateRoomCode(roomCode) {
        await this.updateMyPresence({
            room_code: roomCode,
            player_count: 1,
            status: roomCode ? 'in_room' : 'available'
        });
    }

    // Mettre à jour le mode d'acceptation
    async updateAcceptMode(mode) {
        await this.updateMyPresence({
            room_mode: mode
        });
    }

    // Mettre à jour le statut
    async updateStatus(status) {
        await this.updateMyPresence({
            status: status
        });
    }

    // Récupérer les joueurs disponibles
    getAvailablePlayers() {
        return Array.from(this.onlinePlayers.values())
            .filter(player => {
                // Exclure soi-même et les joueurs en partie
                return player.peer_id !== this.myPresence?.peer_id && 
                       player.status === 'lobby';
            });
    }

    // Récupérer tous les joueurs (y compris soi-même, mais sans bots)
    getAllPlayers() {
        return Array.from(this.onlinePlayers.values())
            .filter(player => {
                // Exclure les bots locaux (peer_id commence par 'bot-')
                return !player.peer_id.startsWith('bot-');
            });
    }

    // Récupérer un joueur spécifique
    getPlayer(peerId) {
        return this.onlinePlayers.get(peerId);
    }

    // S'abonner aux changements de présence
    onPresenceChange(callback) {
        this.presenceCallbacks.push(callback);
    }

    // Notifier les callbacks
    notifyPresenceUpdate() {
        const players = this.getAvailablePlayers();
        
        // Dispatcher un événement global pour mise à jour réactive
        window.dispatchEvent(new CustomEvent('presence_updated', {
            detail: { players, count: this.onlinePlayers.size }
        }));
        
        this.presenceCallbacks.forEach(cb => {
            try {
                cb(players);
            } catch (err) {
                console.error('❌ Erreur callback présence:', err);
            }
        });
    }

    // Nettoyer avant fermeture
    async cleanup() {
        console.log('🧹 Nettoyage Lobby Realtime...');

        // Arrêter le heartbeat
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        // Untrack presence
        if (this.channel && this.myPresence) {
            await this.channel.untrack();
        }

        // Unsubscribe channel
        if (this.channel) {
            await this.channel.unsubscribe();
        }

        console.log('✅ Lobby Realtime nettoyé');
    }

    // Arrêter le système
    async stop() {
        await this.cleanup();
        this.onlinePlayers.clear();
        this.myPresence = null;
        this.isInitialized = false;
    }
}

// Instance globale
window.realtimeLobbySystem = new RealtimeLobbySystem();

// Nettoyer avant fermeture
window.addEventListener('beforeunload', async () => {
    await window.realtimeLobbySystem.cleanup();
});

// Auto-initialiser si Supabase est disponible
if (typeof supabase !== 'undefined' && supabase) {
    // Écouter l'événement roomCreated émis par simple-chat.js
    window.addEventListener('roomCreated', async (e) => {
        if (!window.realtimeLobbySystem.isInitialized) {
            console.log('🎯 roomCreated event détecté, initialisation du lobby...');
            await window.realtimeLobbySystem.init();
        }
    });
    
    // Fallback: vérifier périodiquement si le peer existe déjà
    const checkPeerReady = setInterval(async () => {
        if (window.simpleChatSystem?.peer?.id && !window.realtimeLobbySystem.isInitialized) {
            clearInterval(checkPeerReady);
            console.log('🎯 Peer déjà prêt, initialisation du lobby...');
            await window.realtimeLobbySystem.init();
        }
    }, 1000);
    
    // Arrêter le fallback après 5s
    setTimeout(() => clearInterval(checkPeerReady), 5000);
}

console.log('✅ Realtime Lobby System chargé');
