// La présence est échangée directement entre contacts qui se sont ajoutés.
class FriendsPresence {
    constructor() {
        this.onlinePlayers = new Map();
        this.pending = new Map();
        this.myPresence = { status: 'available' };
        window.addEventListener('roomCreated', () => this.init());
        window.addEventListener('friendsListUpdated', () => this.syncPresence());
        window.addEventListener('online', () => this.syncPresence());
        setInterval(() => {
            if (!document.hidden) this.syncPresence();
        }, 45000);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.syncPresence();
        });
    }

    get isInitialized() {
        return Boolean(window.simpleChatSystem?.peer?.open);
    }

    async init() {
        if (!this.isInitialized) window.simpleChatSystem?.initP2P();
        this.syncPresence();
        return this.isInitialized;
    }

    syncPresence() {
        const peer = window.simpleChatSystem?.peer;
        const friends = window.friendsSystem;
        if (!peer?.open || !friends) return;
        const known = new Set(friends.getFriendsList());
        for (const id of this.onlinePlayers.keys()) {
            if (!known.has(id)) this.updatePlayer(id, null);
        }
        for (const id of known) {
            if (!/^[a-z0-9]+(?:[ _-][a-z0-9]+)*$/i.test(id) || id === peer.id || this.pending.has(id) || window.simpleChatSystem.isPlayerBlocked(id)) continue;
            const connection = peer.connect(id, { label: 'friend-presence-v1' });
            const finish = (presence) => {
                if (this.pending.get(id) !== connection) return;
                this.pending.delete(id);
                clearTimeout(timeout);
                connection.close();
                this.updatePlayer(id, friends.isFriend(id) ? presence : null);
            };
            const timeout = setTimeout(() => finish(null), 5000);
            this.pending.set(id, connection);
            connection.on('data', message => {
                if (message?.type !== 'friend-presence') return;
                const username = /^[\p{L}\p{N}_ -]{1,30}$/u.test(message.username ?? '')
                    ? message.username : 'Ami';
                finish({ peer_id: id, username, status: message.status === 'busy' ? 'busy' : 'available' });
            });
            connection.on('error', () => finish(null));
            connection.on('close', () => finish(null));
        }
        this.notifyPresenceUpdate();
    }

    handleIncoming(connection) {
        const timeout = setTimeout(() => connection.close(), 5000);
        connection.on('close', () => clearTimeout(timeout));
        connection.on('open', () => {
            if (window.friendsSystem?.isFriend(connection.peer) &&
                !window.simpleChatSystem.isPlayerBlocked(connection.peer)) {
                if (!this.onlinePlayers.has(connection.peer)) {
                    const knownName = window.friendsSystem.getFriendData(connection.peer)?.username;
                    const username = /^[\p{L}\p{N}_ -]{1,30}$/u.test(knownName || '') ? knownName : 'Ami';
                    this.updatePlayer(connection.peer, { peer_id: connection.peer, username, status: 'available' });
                }
                connection.send({
                    type: 'friend-presence',
                    username: window.simpleChatSystem.currentUser,
                    status: this.myPresence.status
                });
            } else {
                connection.close();
            }
        });
    }

    isProbeFailure(error) {
        return error.type === 'peer-unavailable' &&
            Array.from(this.pending.keys()).some(id => error.message === 'Could not connect to peer ' + id);
    }

    updatePlayer(id, presence) {
        if (presence) {
            this.onlinePlayers.set(id, presence);
            window.friendsSystem.updateFriendLastSeen(id, presence.username);
        } else {
            this.onlinePlayers.delete(id);
        }
        this.notifyPresenceUpdate();
    }

    updateMyPresence({ status }) {
        this.myPresence.status = status === 'busy' ? 'busy' : 'available';
        this.notifyPresenceUpdate();
    }

    getAllPlayers() {
        return Array.from(this.onlinePlayers.values());
    }

    getPlayer(id) {
        return this.onlinePlayers.get(id);
    }

    notifyPresenceUpdate() {
        window.dispatchEvent(new CustomEvent('presence_updated', {
            detail: { players: this.getAllPlayers(), count: this.onlinePlayers.size }
        }));
    }
}

window.realtimeLobbySystem = new FriendsPresence();
