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
                    this.connection.send({
                        type: 'join',
                        name: playerName
                    });
                    
                    resolve({
                        success: true,
                        message: 'Connecté à la partie !'
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
                this.partnerName = data.name;
                this.isConnected = true;
                // Assigner les mots et envoyer la configuration
                this.assignWords();
                this.connection.send({
                    type: 'start',
                    level: this.game.currentLevel,
                    yourWords: this.partnerAssignedWords,
                    partnerWords: this.myAssignedWords
                });
                this.game.showKawaiiModal(`${data.name} a rejoint la partie ! 🎉`, '👥');
                break;

            case 'start':
                this.isConnected = true;
                this.myAssignedWords = data.yourWords;
                this.partnerAssignedWords = data.partnerWords;
                this.game.currentLevel = data.level;
                this.game.setupLevel();
                this.highlightMyWords();
                this.game.showKawaiiModal('Partie commencée ! Trouvez vos mots ! 🎮', '🚀');
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
