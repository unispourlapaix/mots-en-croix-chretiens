const googleDriveScope = 'https://www.googleapis.com/auth/drive.appdata';
const googleBackupName = 'mots-en-croix-chretiens.json';
const googleNicknamePattern = /^[\p{L}\p{N}_ -]{1,30}$/u;

class GoogleDriveSave {
    constructor() {
        this.signIn = document.getElementById('googleSignInBtn');
        this.controls = document.getElementById('googleBackupControls');
        this.nickname = document.getElementById('googleBackupNickname');
        this.status = document.getElementById('googleSignInStatus');
        this.saveButton = document.getElementById('googleBackupSave');
        this.restoreButton = document.getElementById('googleBackupRestore');
        this.signOutButton = document.getElementById('googleBackupSignOut');

        this.signIn.onclick = () => this.connect();
        document.getElementById('chatConnexionBtn')?.addEventListener('click', () => window.menuTabSystem?.openTab('connexion'));
        this.saveButton.onclick = () => this.run(() => this.save());
        this.restoreButton.onclick = () => this.restore();
        this.signOutButton.onclick = () => this.disconnect('Google déconnecté.');
    }

    connect() {
        const clientId = document.querySelector('meta[name="google-drive-client-id"]').content.trim();
        const oauth = window.google?.accounts?.oauth2;
        if (!clientId || !oauth) {
            this.status.textContent = clientId ? 'Google est indisponible pour le moment.' : 'La connexion Google reste à configurer.';
            return;
        }

        this.signIn.disabled = true;
        this.status.textContent = 'Ouverture de Google…';
        const failed = () => this.disconnect('Connexion Google annulée ou indisponible.');
        try {
            const client = oauth.initTokenClient({
                client_id: clientId,
                scope: googleDriveScope,
                include_granted_scopes: false,
                error_callback: failed,
                callback: (response) => {
                    if (!response.access_token || !oauth.hasGrantedAllScopes(response, googleDriveScope)) {
                        failed();
                        return;
                    }
                    this.accessToken = response.access_token;
                    this.run(() => this.load());
                }
            });
            client.requestAccessToken({ prompt: 'select_account' });
        } catch {
            failed();
        }
    }

    disconnect(message) {
        this.accessToken = null;
        this.fileId = null;
        this.backup = null;
        this.nickname.value = '';
        this.controls.hidden = true;
        this.signIn.hidden = false;
        this.signIn.disabled = false;
        this.status.textContent = message;
    }

    async request(path, options = {}) {
        const response = await fetch('https://www.googleapis.com/' + path, {
            ...options,
            headers: { ...options.headers, Authorization: 'Bearer ' + this.accessToken }
        });
        if (!response.ok) {
            const error = new Error('Google Drive : ' + response.status);
            error.status = response.status;
            throw error;
        }
        return response.json();
    }

    async run(action) {
        this.saveButton.disabled = this.restoreButton.disabled = this.signOutButton.disabled = true;
        try {
            await action();
        } catch (error) {
            if (error.status === 401 || this.controls.hidden) {
                this.disconnect(error.status === 401
                    ? 'Session expirée. Reconnecte-toi à Google.'
                    : 'Impossible de charger la sauvegarde Google Drive.');
            } else {
                this.status.textContent = 'Impossible de sauvegarder. Réessaie dans un instant.';
            }
        } finally {
            this.saveButton.disabled = this.signOutButton.disabled = false;
            this.restoreButton.disabled = !this.backup?.p;
        }
    }

    async load() {
        const query = new URLSearchParams({
            spaces: 'appDataFolder',
            q: "name = '" + googleBackupName + "' and trashed = false",
            orderBy: 'modifiedTime desc',
            pageSize: '1',
            fields: 'files(id)'
        });
        const { files } = await this.request('drive/v3/files?' + query);
        this.fileId = files[0]?.id;
        if (this.fileId) {
            const data = await this.request('drive/v3/files/' + encodeURIComponent(this.fileId) + '?alt=media');
            if (data.v !== 1 || typeof data.n !== 'string' || !googleNicknamePattern.test(data.n) ||
                (data.p && (!Array.isArray(data.p) || data.p.length !== 5))) {
                throw new Error('Format de sauvegarde inconnu');
            }
            this.backup = data;
            this.applyNickname(data.n);
        }
        this.nickname.value = this.backup?.n || '';
        this.signIn.hidden = true;
        this.controls.hidden = false;
        this.status.textContent = this.backup ? 'Sauvegarde Google retrouvée.' : 'Choisis un pseudo pour ta sauvegarde.';
    }

    async save() {
        const name = this.nickname.value.trim();
        if (!googleNicknamePattern.test(name)) {
            this.status.textContent = 'Choisis un pseudo de 1 à 30 caractères avec des lettres, des chiffres, des espaces ou des tirets.';
            this.nickname.focus();
            return;
        }

        const game = window.game;
        const canSaveGame = game?.gameStarted && game.gameMode !== 'race' &&
            !game.isClearingData && (!window.privateRoom?.active || window.privateRoom.isHost);
        const backup = { v: 1, n: name };
        const progress = canSaveGame
            ? [game.gameMode, game.currentLevel, game.score, Math.max(game.score, game.maxScore), game.raceScore]
            : this.backup?.p;
        if (progress) backup.p = progress;

        this.status.textContent = 'Sauvegarde en cours…';
        if (this.fileId) {
            await this.request('upload/drive/v3/files/' + encodeURIComponent(this.fileId) + '?uploadType=media&fields=id', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backup)
            });
        } else {
            const boundary = 'mots-croix-' + crypto.randomUUID();
            const metadata = { name: googleBackupName, parents: ['appDataFolder'], mimeType: 'application/json' };
            const body = [metadata, backup].map(data =>
                '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify(data) + '\r\n').join('') + '--' + boundary + '--\r\n';
            const file = await this.request('upload/drive/v3/files?uploadType=multipart&fields=id', {
                method: 'POST',
                headers: { 'Content-Type': 'multipart/related; boundary=' + boundary },
                body
            });
            this.fileId = file.id;
        }

        this.backup = backup;
        this.applyNickname(name);
        this.status.textContent = canSaveGame ? 'Pseudo et progression sauvegardés.' : 'Pseudo sauvegardé.';
    }

    applyNickname(name) {
        localStorage.setItem('mots-croix-google-pseudo', name);
        if (window.simpleChatSystem) {
            window.simpleChatSystem.currentUser = name;
            window.roomSystem?.updateUsername(name);
            window.menuTabSystem?.updateConnexionTab();
            window.dispatchEvent(new CustomEvent('usernameUpdated', { detail: { username: name } }));
        }
    }

    restore() {
        const progress = this.backup?.p;
        if (!progress) return;
        const [mode, level, score, maxScore, raceScore] = progress;
        if (window.game?.restoreCheckpoint({ mode, level, score, maxScore, raceScore })) {
            leaderboardManager.recordScore(this.backup.n, Math.max(score, maxScore));
            this.status.textContent = 'Progression restaurée.';
        } else {
            this.status.textContent = 'Impossible de reprendre cette sauvegarde maintenant.';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new GoogleDriveSave());

