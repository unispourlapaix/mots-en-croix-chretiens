/**
 * Système de Bots IA - 5 bots avec stratégies différentes
 * Chaque bot a sa personnalité et son style de jeu unique
 */

class AIBot {
    constructor(name, avatar, strategy, speed, personality) {
        this.name = name;
        this.avatar = avatar;
        this.strategy = strategy; // 'aggressive', 'balanced', 'careful', 'random', 'expert'
        this.speed = speed; // Vitesse de jeu en ms (500-2000)
        this.personality = personality;
        this.score = 0;
        this.wordsFound = [];
        this.isPlaying = false;
        this.currentGame = null;
    }

    // Démarrer le bot
    startPlaying(game) {
        this.currentGame = game;
        this.isPlaying = true;
        this.score = 0;
        this.wordsFound = [];
        this.playTurn();
    }

    // Arrêter le bot
    stopPlaying() {
        this.isPlaying = false;
        this.currentGame = null;
    }

    // Jouer un tour
    playTurn() {
        if (!this.isPlaying || !this.currentGame) return;

        setTimeout(() => {
            this.makeMove();
            if (this.isPlaying) {
                this.playTurn();
            }
        }, this.speed + Math.random() * 500); // Ajoute de la variabilité
    }

    // Faire un mouvement selon la stratégie
    makeMove() {
        if (!this.currentGame) return;

        const availableWords = this.findAvailableWords();
        if (availableWords.length === 0) return;

        let selectedWord;

        switch (this.strategy) {
            case 'aggressive':
                // Choisit toujours le mot le plus long
                selectedWord = availableWords.sort((a, b) => b.length - a.length)[0];
                break;

            case 'balanced':
                // Choisit des mots de longueur moyenne
                const mediumWords = availableWords.filter(w => w.length >= 4 && w.length <= 6);
                selectedWord = mediumWords.length > 0 
                    ? mediumWords[Math.floor(Math.random() * mediumWords.length)]
                    : availableWords[Math.floor(Math.random() * availableWords.length)];
                break;

            case 'careful':
                // Préfère les mots courts et sûrs
                selectedWord = availableWords.sort((a, b) => a.length - b.length)[0];
                break;

            case 'random':
                // Choisit complètement au hasard
                selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
                break;

            case 'expert':
                // Stratégie optimale : balance longueur et rareté
                selectedWord = this.selectExpertWord(availableWords);
                break;
        }

        if (selectedWord) {
            this.submitWord(selectedWord);
        }
    }

    // Trouver les mots disponibles dans la grille
    findAvailableWords() {
        if (!this.currentGame || !this.currentGame.grid) return [];

        const words = [];
        const grid = this.currentGame.grid;
        const rows = grid.length;
        const cols = grid[0].length;

        // Recherche horizontale
        for (let row = 0; row < rows; row++) {
            let word = '';
            for (let col = 0; col < cols; col++) {
                if (grid[row][col] && grid[row][col] !== '') {
                    word += grid[row][col];
                } else {
                    if (word.length >= 3 && !this.wordsFound.includes(word)) {
                        words.push(word);
                    }
                    word = '';
                }
            }
            if (word.length >= 3 && !this.wordsFound.includes(word)) {
                words.push(word);
            }
        }

        // Recherche verticale
        for (let col = 0; col < cols; col++) {
            let word = '';
            for (let row = 0; row < rows; row++) {
                if (grid[row][col] && grid[row][col] !== '') {
                    word += grid[row][col];
                } else {
                    if (word.length >= 3 && !this.wordsFound.includes(word)) {
                        words.push(word);
                    }
                    word = '';
                }
            }
            if (word.length >= 3 && !this.wordsFound.includes(word)) {
                words.push(word);
            }
        }

        return [...new Set(words)]; // Enlever les doublons
    }

    // Sélection experte de mot
    selectExpertWord(words) {
        // Score basé sur longueur et rareté des lettres
        const scoredWords = words.map(word => ({
            word,
            score: this.calculateWordValue(word)
        }));

        scoredWords.sort((a, b) => b.score - a.score);
        return scoredWords[0]?.word;
    }

    // Calculer la valeur d'un mot
    calculateWordValue(word) {
        const rarityScore = {
            'a': 1, 'e': 1, 'i': 1, 'o': 1, 'u': 1,
            'r': 2, 's': 2, 't': 2, 'n': 2, 'l': 2,
            'c': 3, 'd': 3, 'm': 3, 'p': 3,
            'b': 4, 'f': 4, 'g': 4, 'h': 4, 'v': 4,
            'j': 5, 'q': 5, 'x': 5, 'y': 5, 'z': 5, 'w': 5, 'k': 5
        };

        let score = word.length * 10; // Bonus de longueur
        for (let char of word.toLowerCase()) {
            score += rarityScore[char] || 3;
        }
        return score;
    }

    // Soumettre un mot trouvé
    submitWord(word) {
        this.wordsFound.push(word);
        this.score += word.length * 10;

        // Émettre un événement pour notifier le système
        window.dispatchEvent(new CustomEvent('botFoundWord', {
            detail: {
                bot: this.name,
                avatar: this.avatar,
                word: word,
                score: this.score
            }
        }));
    }
}

// Gestionnaire des bots IA
class AIBotManager {
    constructor() {
        this.bots = this.createBots();
        this.activeGame = null;
    }

    // Créer les 5 bots avec différentes stratégies
    createBots() {
        return [
            new AIBot(
                '🤖 Gabriel',
                '👼',
                'expert',
                800,
                'Expert biblique qui trouve les mots les plus rares'
            ),
            new AIBot(
                '🤖 Marie',
                '🌹',
                'aggressive',
                600,
                'Joue rapidement et cherche les mots longs'
            ),
            new AIBot(
                '🤖 Pierre',
                '⛪',
                'balanced',
                1000,
                'Stratégie équilibrée et réfléchie'
            ),
            new AIBot(
                '🤖 Sophie',
                '📖',
                'careful',
                1200,
                'Prudente, préfère les mots courts mais sûrs'
            ),
            new AIBot(
                '🤖 Thomas',
                '🎲',
                'random',
                900,
                'Imprévisible, joue de manière aléatoire'
            )
        ];
    }

    // Démarrer une partie avec les bots
    startGame(game, numberOfBots = 3) {
        this.activeGame = game;
        
        // Sélectionner aléatoirement des bots
        const selectedBots = this.selectRandomBots(numberOfBots);
        
        selectedBots.forEach(bot => {
            bot.startPlaying(game);
            
            // Ajouter le bot à la liste des joueurs disponibles dans roomSystem
            if (window.roomSystem) {
                window.roomSystem.availablePlayers.set(`bot-${bot.name}`, {
                    username: bot.name,
                    avatar: bot.avatar,
                    roomMode: 'open',
                    playerCount: 1,
                    maxPlayers: 1,
                    lastSeen: Date.now(),
                    isBot: true
                });
                window.roomSystem.updateChatBubble();
            }
        });

        return selectedBots;
    }

    // Arrêter tous les bots
    stopAllBots() {
        this.bots.forEach(bot => {
            bot.stopPlaying();
            
            // Retirer le bot de la liste des joueurs
            if (window.roomSystem) {
                window.roomSystem.availablePlayers.delete(`bot-${bot.name}`);
                window.roomSystem.updateChatBubble();
            }
        });
        this.activeGame = null;
    }

    // Sélectionner des bots aléatoirement
    selectRandomBots(count) {
        const shuffled = [...this.bots].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, this.bots.length));
    }

    // Obtenir les statistiques des bots
    getBotStats() {
        return this.bots.map(bot => ({
            name: bot.name,
            avatar: bot.avatar,
            strategy: bot.strategy,
            personality: bot.personality,
            score: bot.score,
            wordsFound: bot.wordsFound.length,
            isPlaying: bot.isPlaying
        }));
    }

    // Obtenir un bot spécifique
    getBot(name) {
        return this.bots.find(bot => bot.name === name);
    }

    // Ajouter les bots comme joueurs disponibles (sans commencer à jouer)
    showBotsAsAvailable() {
        console.log('🎮 Ajout des bots à la liste...');
        
        // Ajouter 2-3 bots aléatoires comme "en ligne"
        const count = 2 + Math.floor(Math.random() * 2); // 2 ou 3 bots
        const selectedBots = this.selectRandomBots(count);
        
        console.log(`🤖 Sélection de ${selectedBots.length} bots:`, selectedBots.map(b => b.name));
        
        selectedBots.forEach(bot => {
            if (window.roomSystem) {
                const botData = {
                    username: bot.name,
                    avatar: bot.avatar,
                    acceptMode: 'auto',
                    playerCount: 1,
                    maxPlayers: 1,
                    lastSeen: Date.now(),
                    isBot: true
                };
                
                window.roomSystem.availablePlayers.set(`bot-${bot.name}`, botData);
                console.log(`✅ Bot ajouté: ${bot.name}`, botData);
            }
        });
        
        if (window.roomSystem) {
            console.log('📊 Total joueurs disponibles:', window.roomSystem.availablePlayers.size);
            window.roomSystem.updateChatBubble();
        }
    }
}

// Instance globale
window.aiBotManager = new AIBotManager();

console.log('✅ Système de Bots IA initialisé - 5 bots prêts !');
window.addEventListener('botFoundWord', (event) => {
    const { bot, avatar, word, score } = event.detail;
    
    // Afficher dans le chat si disponible
    if (window.chatSystem) {
        window.chatSystem.showMessage(
            `${avatar} ${bot} a trouvé "${word}" ! (${score} pts)`,
            'ai'
        );
    }
    
    console.log(`🤖 ${bot} a trouvé: ${word} (Score: ${score})`);
});

console.log('✅ Système de Bots IA initialisé - 5 bots prêts !');
