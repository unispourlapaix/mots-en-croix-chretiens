// Module multijoueur coopératif peer-to-peer (WebRTC)
class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.peer = null;
        this.connection = null;
        this.isHost = false;
        this.isConnected = false;
        this.peerId = null;
        this.partnerName = '';
        this.myAssignedWords = [];
        this.partnerAssignedWords = [];
        this.playerScores = {}; // Scores par nom de joueur
        this.partnerScore = 0;
    }

    // Initialiser PeerJS
    async initPeerJS() {
        // Utiliser le service PeerJS gratuit
        this.peer = new Peer({
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        return new Promise((resolve, reject) => {
            this.peer.on('open', (id) => {
                this.peerId = id;
                console.log('Mon ID Peer:', id);
                resolve(id);
            });

            this.peer.on('error', (error) => {
                console.error('Erreur Peer:', error);
                reject(error);
            });

            // Recevoir une connexion (quand on est l'hôte)
            this.peer.on('connection', (conn) => {
                this.connection = conn;
                this.setupConnection();
            });
        });
    }

    // Créer une partie (devenir hôte)
    async createGame(playerName) {
        try {
            await this.initPeerJS();
            this.isHost = true;
            
            return {
                success: true,
                roomId: this.peerId,
                message: 'Partie créée ! Partagez ce code avec votre partenaire.'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la création de la partie: ' + error.message
            };
        }
    }

    // Récupérer l'état actuel de la partie
    getGameState() {
        const playerName = this.game.playerName || 'Joueur';
        
        // Mettre à jour mon score
        if (!this.playerScores) {
            this.playerScores = {};
        }
        this.playerScores[playerName] = this.game.score;
        
        return {
            level: this.game.currentLevel,
            score: this.game.score,
            grid: this.game.grid,
            completedWords: Array.from(this.game.completedWords || []),
            clickCount: this.game.clickCount,
            hintsUsed: this.game.hintsUsedThisLevel,
            gameStarted: this.game.gameStarted,
            playerScores: this.playerScores // Scores par nom
        };
    }

    // Partager la sauvegarde avec tous les joueurs
    shareGameProgress() {
        if (this.isConnected && this.connection && this.isHost) {
            const gameState = this.getGameState();
            this.connection.send({
                type: 'gameProgress',
                state: gameState
            });
            console.log('📤 Progression partagée avec les joueurs');
        }
    }

    // Rejoindre une partie
    async joinGame(roomId, playerName) {
        try {
            await this.initPeerJS();
            this.isHost = false;
            
            // Se connecter à l'hôte
            this.connection = this.peer.connect(roomId);
            this.setupConnection();

            return new Promise((resolve) => {
                this.connection.on('open', () => {
                    // Demander la liste des joueurs
                    this.connection.send({
                        type: 'join'
                    });
                    
                    resolve({
                        success: true,
                        message: 'Connecté ! Sélectionnez votre profil...'
                    });
                });

                this.connection.on('error', (error) => {
                    resolve({
                        success: false,
                        message: 'Impossible de rejoindre: ' + error.message
                    });
                });
            });
        } catch (error) {
            return {
                success: false,
                message: 'Erreur lors de la connexion: ' + error.message
            };
        }
    }

    // Configurer la connexion et les événements
    setupConnection() {
        this.connection.on('data', (data) => {
            this.handleMessage(data);
        });

        this.connection.on('close', () => {
            this.isConnected = false;
            this.game.showKawaiiModal('Votre partenaire s\'est déconnecté 😢', '💔');
        });

        this.connection.on('error', (error) => {
            console.error('Erreur de connexion:', error);
        });
    }

    // Gérer les messages reçus
    handleMessage(data) {
        switch(data.type) {
            case 'join':
                // Envoyer la liste des joueurs existants pour permettre la sélection
                this.connection.send({
                    type: 'playerList',
                    players: Object.keys(this.playerScores || {}),
                    scores: this.playerScores || {}
                });
                break;

            case 'selectPlayer':
                // Le joueur a sélectionné son nom
                this.partnerName = data.name;
                this.isConnected = true;
                
                // Assigner les mots et envoyer la configuration
                this.assignWords();
                
                // Récupérer l'état de jeu actuel si une partie est en cours
                const currentGameState = this.game.gameStarted ? this.getGameState() : null;
                
                this.connection.send({
                    type: 'start',
                    level: this.game.currentLevel,
                    yourWords: this.partnerAssignedWords,
                    partnerWords: this.myAssignedWords,
                    gameState: currentGameState
                });
                this.game.showKawaiiModal(`${data.name} a rejoint la partie ! 🎉`, '👥');
                break;

            case 'start':
                this.isConnected = true;
                this.myAssignedWords = data.yourWords;
                this.partnerAssignedWords = data.partnerWords;
                this.game.currentLevel = data.level;
                
                // Si l'hôte partage un état de partie sauvegardé
                if (data.gameState) {
                    this.restoreGameState(data.gameState);
                } else {
                    this.game.setupLevel();
                }
                
                this.highlightMyWords();
                this.game.showKawaiiModal('Partie commencée ! Trouvez vos mots ! 🎮', '🚀');
                break;

            case 'playerList':
                // Afficher la liste des joueurs pour sélection
                this.showPlayerSelection(data.players, data.scores);
                break;

            case 'gameProgress':
                // Recevoir la progression partagée par l'hôte
                this.restoreGameState(data.state);
                this.game.showKawaiiModal('Progression synchronisée ! 🔄', '💾');
                console.log('📥 Progression reçue de l\'hôte');
                break;

            case 'scoreUpdate':
                // Mettre à jour le score du joueur
                if (!this.playerScores) {
                    this.playerScores = {};
                }
                this.playerScores[data.playerName] = data.score;
                this.updateScoreDisplay();
                break;

            case 'cellUpdate':
                // Mettre à jour une cellule modifiée par le partenaire
                this.game.grid[data.row][data.col] = data.value;
                const cell = document.querySelector(`[data-row="${data.row}"][data-col="${data.col}"]`);
                if (cell) {
                    const letterSpan = cell.querySelector('.cell-letter');
                    if (letterSpan) {
                        letterSpan.textContent = data.value;
                    }
                    // Ajouter un effet visuel pour montrer que c'est le partenaire
                    cell.style.backgroundColor = '#ffe6f0';
                    setTimeout(() => {
                        cell.style.backgroundColor = '';
                    }, 500);
                }
                break;

            case 'wordCompleted':
                this.game.showKawaiiModal(`${this.partnerName} a trouvé: ${data.word} ! 🎉`, '⭐');
                break;

            case 'levelCompleted':
                this.checkIfBothCompleted();
                break;
        }
    }

    // Assigner les mots de manière équitable
    assignWords() {
        const levelData = gameDataManager.getLevelData(this.game.currentLevel);
        const words = levelData.words;
        
        // Mélanger et diviser
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        const mid = Math.ceil(shuffled.length / 2);
        
        this.myAssignedWords = shuffled.slice(0, mid).map(w => w.word);
        this.partnerAssignedWords = shuffled.slice(mid).map(w => w.word);
    }

    // Mettre en évidence mes mots
    highlightMyWords() {
        const levelData = gameDataManager.getLevelData(this.game.currentLevel);
        
        levelData.words.forEach((wordData, index) => {
            const isMine = this.myAssignedWords.includes(wordData.word);
            const clueElements = document.querySelectorAll('.clue-item');
            
            if (clueElements[index]) {
                const clue = clueElements[index];
                if (isMine) {
                    clue.style.borderLeft = '4px solid #ff69b4';
                    clue.style.backgroundColor = '#fff5f9';
                } else {
                    clue.style.borderLeft = '4px solid #d3d3d3';
                    clue.style.backgroundColor = '#f5f5f5';
                    clue.style.opacity = '0.6';
                }
            }
        });
    }

    // Envoyer une mise à jour de cellule
    sendCellUpdate(row, col, value) {
        if (this.isConnected && this.connection) {
            this.connection.send({
                type: 'cellUpdate',
                row: row,
                col: col,
                value: value
            });
        }
    }

    // Notifier qu'un mot est complété
    sendWordCompleted(word) {
        if (this.isConnected && this.connection) {
            this.connection.send({
                type: 'wordCompleted',
                word: word
            });
        }
    }

    // Vérifier si un mot m'est assigné
    isMyWord(word) {
        return this.myAssignedWords.includes(word);
    }

    // Afficher la sélection de joueur (système de confiance)
    showPlayerSelection(existingPlayers, scores) {
        const modal = document.createElement('div');
        modal.className = 'player-selection-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        let playersHTML = '';
        if (existingPlayers && existingPlayers.length > 0) {
            playersHTML = existingPlayers.map(name => {
                const score = scores[name] || 0;
                return `
                    <div class="player-option" data-name="${name}" style="
                        background: linear-gradient(135deg, #fff 0%, #f0f8ff 100%);
                        border: 3px solid #ff69b4;
                        border-radius: 15px;
                        padding: 20px;
                        margin: 10px 0;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        <div style="font-size: 20px; font-weight: 700; color: #ff69b4;">👤 ${name}</div>
                        <div style="font-size: 14px; color: #666; margin-top: 5px;">🎯 ${score} pts</div>
                    </div>
                `;
            }).join('');
        }
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            ">
                <h2 style="color: #ff69b4; text-align: center; margin-bottom: 20px;">
                    👪 Qui êtes-vous ?
                </h2>
                <p style="text-align: center; color: #666; margin-bottom: 20px; font-size: 14px;">
                    Cliquez sur votre nom pour reprendre votre partie
                </p>
                
                <div id="playersList" style="max-height: 300px; overflow-y: auto;">
                    ${playersHTML}
                </div>
                
                <div style="margin-top: 20px; border-top: 2px solid #f0f0f0; padding-top: 20px;">
                    <p style="text-align: center; color: #666; margin-bottom: 10px; font-size: 14px;">
                        Ou entrez un nouveau nom
                    </p>
                    <input type="text" id="newPlayerName" placeholder="Votre nom" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #ff69b4;
                        border-radius: 10px;
                        font-size: 16px;
                        text-align: center;
                        margin-bottom: 10px;
                    ">
                    <button id="joinAsNew" style="
                        width: 100%;
                        padding: 15px;
                        background: linear-gradient(135deg, #ff6b9d 0%, #ff1493 100%);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 700;
                        cursor: pointer;
                    ">
                        ✨ Commencer à jouer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Clic sur un joueur existant
        modal.querySelectorAll('.player-option').forEach(option => {
            option.addEventListener('click', () => {
                const name = option.dataset.name;
                this.game.playerName = name;
                this.connection.send({
                    type: 'selectPlayer',
                    name: name
                });
                modal.remove();
            });
            
            option.addEventListener('mouseenter', () => {
                option.style.transform = 'scale(1.05)';
                option.style.boxShadow = '0 8px 20px rgba(255, 105, 180, 0.4)';
            });
            
            option.addEventListener('mouseleave', () => {
                option.style.transform = 'scale(1)';
                option.style.boxShadow = 'none';
            });
        });
        
        // Nouveau joueur
        const joinBtn = modal.querySelector('#joinAsNew');
        const nameInput = modal.querySelector('#newPlayerName');
        
        joinBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (name) {
                this.game.playerName = name;
                this.connection.send({
                    type: 'selectPlayer',
                    name: name
                });
                modal.remove();
            } else {
                nameInput.style.borderColor = 'red';
                setTimeout(() => nameInput.style.borderColor = '#ff69b4', 1000);
            }
        });
        
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinBtn.click();
            }
        });
    }

    // Restaurer l'état de jeu partagé
    restoreGameState(state) {
        if (!state) return;
        
        this.game.currentLevel = state.level;
        this.game.clickCount = state.clickCount || 0;
        this.game.hintsUsedThisLevel = state.hintsUsed || 0;
        this.game.gameStarted = state.gameStarted || false;
        
        // Récupérer mon nom
        const myName = this.game.playerName || 'Joueur';
        
        // Restaurer MON score si je l'ai déjà dans la partie
        if (state.playerScores && state.playerScores[myName] !== undefined) {
            this.game.score = state.playerScores[myName];
            console.log(`✅ Score de ${myName} restauré: ${this.game.score} pts`);
        } else {
            // Nouveau joueur dans cette partie
            this.game.score = 0;
            console.log(`🆕 ${myName} commence avec 0 pts`);
        }
        
        // Sauvegarder tous les scores
        this.playerScores = state.playerScores || {};
        
        // Restaurer la grille
        if (state.grid) {
            this.game.grid = state.grid;
        }
        
        // Restaurer les mots complétés
        if (state.completedWords) {
            this.game.completedWords = new Set(state.completedWords);
        }
        
        // Mettre à jour l'affichage
        this.updateScoreDisplay();
        
        // Recharger le niveau
        this.game.setupLevel();
        this.game.restoreGridLetters();
        this.game.restoreCompletedWords();
        
        console.log(`🔄 ${myName} a rejoint la partie au niveau ${state.level}`);
    }

    // Mettre à jour l'affichage des scores
    updateScoreDisplay() {
        // Mon score
        const scoreElement = document.getElementById('scoreValue');
        if (scoreElement) {
            scoreElement.textContent = this.game.score;
        }
        
        // Tous les scores
        if (this.playerScores && Object.keys(this.playerScores).length > 0) {
            const scoreText = Object.entries(this.playerScores)
                .map(([name, score]) => `${name}: ${score} pts`)
                .join(' | ');
            
            if (window.simpleChatSystem) {
                window.simpleChatSystem.showMessage(
                    `📊 ${scoreText}`,
                    'system'
                );
            }
        }
    }

    // Envoyer mon score aux autres
    sendScoreUpdate() {
        if (this.isConnected && this.connection) {
            const playerName = this.game.playerName || 'Joueur';
            
            // Mettre à jour localement
            if (!this.playerScores) {
                this.playerScores = {};
            }
            this.playerScores[playerName] = this.game.score;
            
            this.connection.send({
                type: 'scoreUpdate',
                playerName: playerName,
                score: this.game.score
            });
        }
    }

    // Vérifier si les deux joueurs ont terminé
    checkIfBothCompleted() {
        // À implémenter selon la logique du jeu
    }

    // Se déconnecter
    disconnect() {
        if (this.connection) {
            this.connection.close();
        }
        if (this.peer) {
            this.peer.destroy();
        }
        this.isConnected = false;
        this.isHost = false;
    }
}

// Export
let multiplayerManager = null;
