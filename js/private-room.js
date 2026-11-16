// Une salle privée relie deux joueurs, indépendamment du salon public.
class PrivateRoom {
    constructor(chat) {
        this.chat = chat;
        this.connections = new Map();
        this.dialog = document.getElementById('privateRoomDialog');
        this.status = document.getElementById('privateRoomStatus');
        this.form = document.getElementById('privateRoomJoin');
        this.codeField = document.getElementById('privateRoomCodeField');
        this.codeInput = document.getElementById('privateRoomCode');
        this.hostControls = document.getElementById('privateRoomHost');
        this.leaveButton = document.getElementById('privateRoomLeave');
        this.approval = document.getElementById('privateRoomApproval');
        this.createButton = document.getElementById('privateRoomCreate');

        document.getElementById('privateRoomOpen').onclick = () => this.show();
        document.getElementById('privateRoomDismiss').onclick = () => this.dialog.close();
        this.createButton.onclick = () => this.create();
        document.getElementById('privateRoomShare').onclick = () => this.share();
        document.getElementById('privateRoomCopy').onclick = () => this.share(true);
        document.getElementById('privateRoomPasteCode').onclick = () => this.pasteInviteCode();
        document.getElementById('privateRoomCopyCode').onclick = () => this.copy(this.inviteCode(), 'Code copié.');
        document.getElementById('privateRoomRevoke').onclick = () => this.revoke();
        document.getElementById('privateRoomAccept').onclick = () => this.approve(true);
        document.getElementById('privateRoomRefuse').onclick = () => this.approve(false);
        this.leaveButton.onclick = () => this.end('Partie quittée.');
        this.form.onsubmit = (event) => {
            event.preventDefault();
            const name = this.form.elements.nickname.value.trim();
            if (!name || this.active) return;
            if (!this.codeField.hidden) {
                const match = /^([a-f0-9]{32})-([a-f0-9]{32})$/i.exec(this.codeInput.value.trim());
                if (!match) {
                    this.status.textContent = 'Code invalide. Colle le code complet envoyé par ton ami.';
                    this.codeInput.focus();
                    return;
                }
                this.invite = { host: match[1].toLowerCase(), token: match[2].toLowerCase() };
            }
            this.createButton.hidden = true;
            this.active = true;
            this.name = name;
            this.resumeKey = this.newToken();
            this.form.hidden = true;
            this.leaveButton.hidden = false;
            this.retry();
        };

        window.addEventListener('online', () => this.retry());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.retry();
        });

        window.addEventListener('hashchange', () => this.readInvite());
        this.readInvite();
    }

    readInvite() {
        if (this.active) return;
        const url = new URL(window.location.href);
        const fragment = new URLSearchParams(url.hash.slice(1));
        const host = fragment.get('partie');
        const token = fragment.get('invitation');
        if (/^[a-z0-9-]{1,80}$/i.test(host || '') && /^[a-f0-9]{32}$/.test(token || '')) {
            this.invite = { host, token };
            this.setCodeField(false);
            fragment.delete('partie');
            fragment.delete('invitation');
            url.hash = fragment.toString();
            history.replaceState(history.state, '', url);
            this.createButton.hidden = true;
            this.form.hidden = false;
            this.status.textContent = 'Choisis ton pseudo pour demander à rejoindre.';
            this.show();
        }
    }

    setCodeField(visible) {
        this.codeField.hidden = !visible;
        this.codeInput.required = visible;
    }

    async pasteInviteCode() {
        const previous = this.codeInput.value;
        const canFill = () => this.dialog.open && !this.active && !this.codeField.hidden && this.codeInput.value === previous;
        let value;
        try {
            value = (await navigator.clipboard.readText()).trim();
        } catch {
            if (!canFill()) return;
            this.codeInput.focus();
            this.status.textContent = 'Colle le code dans le champ avec le clavier ou le menu de ton téléphone.';
            return;
        }
        if (!canFill()) return;
        if (!value) {
            this.codeInput.focus();
            this.status.textContent = 'Copie le code d’invitation de ton ami, puis colle-le ici.';
            return;
        }
        this.codeInput.value = value;
        this.form.elements.nickname.focus();
        this.status.textContent = 'Code collé. Vérifie ton pseudo et demande à rejoindre.';
    }

    inviteCode() {
        return this.invite.host + '-' + this.invite.token;
    }

    show() {
        if (this.dialog.open) return;
        const nickname = this.form.elements.nickname;
        if (!nickname.value.trim() || nickname.value === nickname.defaultValue) {
            nickname.defaultValue = this.chat.getSavedNickname() || '';
            nickname.value = nickname.defaultValue;
        }
        this.dialog.showModal();
    }

    newToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
            byte.toString(16).padStart(2, '0')).join('');
    }

    create() {
        if (this.active) return;
        this.active = true;
        this.isHost = true;
        this.name = this.chat.currentUser || 'Hôte';
        this.invite = { host: this.newToken(), token: this.newToken() };
        this.form.hidden = true;
        this.createButton.hidden = true;
        this.leaveButton.hidden = false;
        this.retry();
    }

    createPeer() {
        const options = {
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        };
        const peer = this.isHost ? new Peer(this.invite.host, options) : new Peer(options);
        this.peer = peer;
        peer.on('open', () => {
            if (this.peer === peer) this.retry();
        });
        peer.on('connection', (conn) => {
            if (this.peer !== peer || !this.isHost || conn.label !== 'private-room-v1') {
                conn.close();
                return;
            }
            this.watch(conn);
        });
        peer.on('disconnected', () => this.scheduleRetry());
        peer.on('error', (error) => {
            if (this.peer !== peer) return;
            if (error.type === 'peer-unavailable' && !this.isHost && !this.approved) {
                this.end('Hôte introuvable. Vérifie que la partie est ouverte.', true);
                return;
            }
            this.scheduleRetry();
        });
    }

    retry() {
        if (!this.active) return;
        clearTimeout(this.retryTimer);
        if (!this.peer || this.peer.destroyed) {
            if (!this.connection) this.status.textContent = 'Connexion en cours…';
            try {
                this.createPeer();
            } catch {
                this.end('La connexion PeerJS est indisponible.', !this.isHost);
                return;
            }
        } else if (this.peer.disconnected) {
            this.peer.reconnect();
        } else if (this.peer.open && this.isHost && this.hostControls.hidden) {
            this.hostControls.hidden = false;
            this.status.textContent = 'Partage le lien ou le code avec ton invité.';
        } else if (this.peer.open && !this.isHost && !this.attempt && !this.connection) {
            this.status.textContent = this.approved ? 'Reconnexion à la partie…' : 'Connexion à l’hôte…';
            this.attempt = this.peer.connect(this.invite.host, { label: 'private-room-v1', reliable: true });
            this.watch(this.attempt);
        }
        if (!this.peer.open || (this.approved && !this.connection)) this.scheduleRetry();
    }

    scheduleRetry() {
        clearTimeout(this.retryTimer);
        if (this.active) this.retryTimer = setTimeout(() => this.retry(), 3000);
    }

    async share(copyOnly = false) {
        const url = new URL(window.location.href);
        url.hash = new URLSearchParams({ partie: this.invite.host, invitation: this.invite.token });
        const link = url.href;
        try {
            if (!copyOnly && navigator.share) {
                await navigator.share({ title: 'Mots En Croix Chrétiens', url: link });
            } else {
                await this.copy(link, 'Lien copié.');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                this.showCopyValue(link);
            }
        }
    }

    async copy(value, message) {
        try {
            await navigator.clipboard.writeText(value);
            this.status.textContent = message;
        } catch {
            this.showCopyValue(value);
        }
    }

    showCopyValue(value) {
        const input = document.getElementById('privateRoomLink');
        input.value = value;
        input.hidden = false;
        input.select();
    }

    revoke() {
        this.invite.token = this.newToken();
        this.approve(false);
        document.getElementById('privateRoomLink').hidden = true;
        this.status.textContent = 'Ancien lien et ancien code désactivés.';
    }

    watch(conn) {
        let timeout;
        const clearDeadline = () => clearTimeout(timeout);
        const close = () => {
            clearTimeout(timeout);
            if (this.pending?.conn === conn) {
                this.pending = null;
                this.approval.hidden = true;
            }
            if (this.attempt === conn) {
                this.attempt = null;
                if (!this.approved) this.status.textContent = 'Connexion interrompue. Nouvelle tentative…';
                this.scheduleRetry();
            }
            if (this.connection !== conn) return;
            this.connection = null;
            this.connections.delete(conn.peer);
            clearInterval(this.heartbeat);
            this.status.textContent = 'Connexion interrompue. Reconnexion en cours…';
            this.chat.showMessage(this.status.textContent, 'system');
            this.scheduleRetry();
        };
        timeout = setTimeout(() => { conn.close(); close(); }, 20000);
        conn.on('close', close);
        conn.on('error', () => { conn.close(); close(); });
        conn.on('open', () => {
            if (this.attempt === conn) {
                conn.send({
                    type: 'private-join', token: this.invite.token,
                    resume: this.resumeKey, name: this.name
                });
            }
        });
        conn.on('data', (message) => {
            if (!this.active || !message || typeof message !== 'object') return;
            if (this.connection === conn) {
                this.lastSeen = Date.now();
                this.receive(conn, message);
            } else if (this.isHost && message.type === 'private-join') {
                this.request(conn, message);
                if (this.pending?.conn === conn) {
                    clearDeadline();
                    timeout = setTimeout(() => { conn.close(); close(); }, 90000);
                }
            } else if (this.attempt === conn) {
                if (message.type === 'private-waiting') {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => { conn.close(); close(); }, 90000);
                    this.status.textContent = 'En attente de l’accord de l’hôte…';
                } else if (message.type === 'private-accepted') {
                    clearTimeout(timeout);
                    this.attempt = null;
                    this.approved = true;
                    this.remoteName = 'Hôte';
                    this.connect(conn);
                } else if (message.type === 'private-refused') {
                    this.end('Invitation expirée, refusée ou salle occupée.', true);
                }
            }
        });
        // Le minuteur initial protège aussi les connexions sans demande.
        conn.on('data', () => {
            if (this.connection === conn) clearTimeout(timeout);
        });
    }

    request(conn, message) {
        if (this.pending?.conn === conn) return;
        if (this.guest && this.guest.resume === message.resume) {
            this.accept(conn);
            return;
        }
        if (this.guest || this.pending || message.token !== this.invite.token ||
            !/^[a-f0-9]{32}$/.test(message.resume || '') || typeof message.name !== 'string' ||
            !message.name.trim() || message.name.length > 30) {
            conn.send({ type: 'private-refused' });
            return;
        }
        this.pending = { conn, resume: message.resume, name: message.name.trim() };
        conn.send({ type: 'private-waiting' });
        document.getElementById('privateRoomGuest').textContent = this.pending.name + ' souhaite rejoindre.';
        this.approval.hidden = false;
        this.show();
    }

    approve(accepted) {
        if (!this.pending) return;
        const { conn, resume, name } = this.pending;
        this.pending = null;
        this.approval.hidden = true;
        if (!conn.open) return;
        if (accepted) {
            this.guest = { resume, name };
            this.remoteName = name;
            this.accept(conn);
        } else {
            conn.send({ type: 'private-refused' });
        }
    }

    accept(conn) {
        conn.send({ type: 'private-accepted' });
        this.connect(conn);
        this.sendGrid();
    }

    sendGrid() {
        const game = window.game;
        if (this.isHost && this.connection?.open && game?.gameStarted) {
            this.connection.send({
                type: 'private-grid', mode: game.gameMode, level: game.currentLevel,
                grid: game.grid, score: game.score
            });
        }
    }

    connect(conn) {
        const previous = this.connection;
        if (previous && previous !== conn) {
            this.connections.delete(previous.peer);
            this.connection = null;
            previous.close();
        }
        this.connection = conn;
        this.connections.set(conn.peer, conn);
        this.lastSeen = Date.now();
        clearInterval(this.heartbeat);
        this.heartbeat = setInterval(() => {
            if (Date.now() - this.lastSeen > 25000) {
                conn.close();
            } else if (conn.open) {
                conn.send({ type: 'private-ping' });
            }
        }, 5000);
        this.status.textContent = 'Partie privée connectée.';
        this.chat.showMessage(this.status.textContent, 'system');
    }

    receive(conn, message) {
        switch (message.type) {
            case 'private-ping':
                conn.send({ type: 'private-pong' });
                break;
            case 'private-end':
                this.end('L’autre joueur a quitté la partie.', false, false);
                break;
            case 'private-chat':
                if (typeof message.text === 'string' && message.text.length <= 100) {
                    this.chat.showMessage(message.text, 'message', this.remoteName);
                }
                break;
            case 'private-grid':
                if (!this.isHost) window.game?.restorePrivateGrid(message);
                break;
            case 'race':
                if (typeof message.action === 'string' && message.data && typeof message.data === 'object') {
                    window.multiplayerRace?.receiveProgress(this.remoteName, message.action, message.data);
                }
                break;
            case 'game_action':
                if (message.action && typeof message.action.type === 'string') {
                    const action = { ...message.action, requester: this.remoteName };
                    try {
                        this.chat.handleGameAction({ action, username: this.remoteName });
                    } catch (error) {
                        console.warn('Action de partie privée invalide', error);
                    }
                }
                break;
        }
    }

    sendChat(text) {
        if (!this.connection?.open) {
            this.chat.showMessage('La partie privée attend une connexion.', 'system');
            return;
        }
        this.connection.send({ type: 'private-chat', text: text.slice(0, 100) });
        this.chat.showMessage(text.slice(0, 100), 'own');
        this.chat.closeChat();
    }

    end(message, retryInvite = false, notify = true) {
        const sendEnd = notify && this.connection?.open;
        if (sendEnd) this.connection.send({ type: 'private-end' });
        this.active = false;
        clearInterval(this.heartbeat);
        clearTimeout(this.retryTimer);
        const peer = this.peer;
        this.peer = null;
        this.attempt = null;
        this.connection = null;
        this.pending = null;
        this.guest = null;
        this.approved = false;
        this.isHost = false;
        this.resumeKey = null;
        this.connections.clear();
        if (sendEnd) setTimeout(() => peer?.destroy(), 250);
        else peer?.destroy();
        this.codeInput.value = retryInvite && this.invite ? this.inviteCode() : '';
        this.setCodeField(true);
        this.invite = null;
        this.createButton.hidden = false;
        this.form.hidden = false;
        this.hostControls.hidden = true;
        this.approval.hidden = true;
        this.leaveButton.hidden = true;
        const link = document.getElementById('privateRoomLink');
        link.value = '';
        link.hidden = true;
        this.status.textContent = message;
        this.chat.showMessage(message, 'system');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.privateRoom = new PrivateRoom(window.simpleChatSystem);
});

