// Système de présence en temps réel via Supabase Realtime
// Permet de voir tous les joueurs en ligne cross-device

class LobbyPresence {
    constructor() {
        this.channel = null;
        this.myPresence = null;
        this.onlinePlayers = new Map(); // peerId -> {username, avatar, peer_id, online_at}
        this.isTracking = false;
        this.onPlayersUpdated = null; // Callback quand la liste change
    }

    // Initialiser et rejoindre le lobby public
    async joinLobby(peerId, username, avatar = '😊') {
        if (!window.supabaseClient) {
            console.error('❌ Supabase non initialisé');
            return false;
        }

        if (this.isTracking) {
            console.log('⚠️ Déjà dans le lobby');
            return true;
        }

        try {
            // Créer un channel public pour le lobby
            this.channel = window.supabaseClient.channel('public-lobby', {
                config: {
                    presence: {
                        key: peerId, // Utiliser peerId comme clé unique
                    },
                },
            });

            // Écouter les changements de présence
            this.channel
                .on('presence', { event: 'sync' }, () => {
                    this._syncPresence();
                })
                .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                    console.log('👋 Joueur rejoint:', key, newPresences);
                    this._syncPresence();
                })
                .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                    console.log('👋 Joueur parti:', key, leftPresences);
                    this._syncPresence();
                });

            // S'abonner au channel
            const status = await this.channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // S'annoncer comme présent
                    this.myPresence = {
                        peer_id: peerId,
                        username: username,
                        avatar: avatar,
                        online_at: new Date().toISOString(),
                    };

                    const trackStatus = await this.channel.track(this.myPresence);
                    
                    if (trackStatus === 'ok') {
                        this.isTracking = true;
                        console.log('✅ Présence annoncée dans le lobby:', username);
                    } else {
                        console.error('❌ Erreur track presence:', trackStatus);
                    }
                }
            });

            return true;
        } catch (error) {
            console.error('❌ Erreur joinLobby:', error);
            return false;
        }
    }

    // Synchroniser la liste des joueurs présents
    _syncPresence() {
        if (!this.channel) return;

        const state = this.channel.presenceState();
        this.onlinePlayers.clear();

        // Parcourir tous les joueurs présents
        Object.keys(state).forEach(peerId => {
            const presences = state[peerId];
            if (presences && presences.length > 0) {
                // Prendre la présence la plus récente
                const latest = presences[0];
                this.onlinePlayers.set(peerId, {
                    peer_id: latest.peer_id,
                    username: latest.username,
                    avatar: latest.avatar || '😊',
                    online_at: latest.online_at,
                });
            }
        });

        console.log(`📡 ${this.onlinePlayers.size} joueurs en ligne (sync)`);

        // Notifier les listeners
        if (this.onPlayersUpdated) {
            this.onPlayersUpdated(Array.from(this.onlinePlayers.values()));
        }
    }

    // Mettre à jour mes informations (username, avatar, etc.)
    async updateMyPresence(updates) {
        if (!this.channel || !this.isTracking) {
            console.warn('⚠️ Pas dans le lobby');
            return false;
        }

        try {
            // Fusionner les mises à jour
            this.myPresence = {
                ...this.myPresence,
                ...updates,
                online_at: new Date().toISOString(),
            };

            const status = await this.channel.track(this.myPresence);
            
            if (status === 'ok') {
                console.log('✅ Présence mise à jour:', updates);
                return true;
            } else {
                console.error('❌ Erreur updateMyPresence:', status);
                return false;
            }
        } catch (error) {
            console.error('❌ Erreur updateMyPresence:', error);
            return false;
        }
    }

    // Quitter le lobby proprement
    async leaveLobby() {
        if (!this.channel) return;

        try {
            // Untrack puis unsubscribe
            await this.channel.untrack();
            await this.channel.unsubscribe();
            
            this.channel = null;
            this.myPresence = null;
            this.isTracking = false;
            this.onlinePlayers.clear();
            
            console.log('👋 Quitté le lobby');
        } catch (error) {
            console.error('❌ Erreur leaveLobby:', error);
        }
    }

    // Obtenir la liste actuelle des joueurs
    getOnlinePlayers() {
        return Array.from(this.onlinePlayers.values());
    }

    // Définir le callback de mise à jour
    setOnPlayersUpdated(callback) {
        this.onPlayersUpdated = callback;
    }

    // Vérifier si un joueur spécifique est en ligne
    isPlayerOnline(peerId) {
        return this.onlinePlayers.has(peerId);
    }

    // Obtenir les infos d'un joueur
    getPlayerInfo(peerId) {
        return this.onlinePlayers.get(peerId);
    }
}

// Créer une instance globale
if (typeof window !== 'undefined') {
    window.lobbyPresence = new LobbyPresence();
    console.log('✅ LobbyPresence initialisé');
}
