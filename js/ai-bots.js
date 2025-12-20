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
        
        // Arrêter si plus de mots disponibles
        if (availableWords.length === 0) {
            console.log(`✅ ${this.name}: Plus de mots disponibles, je m'arrête`);
            this.stopPlaying();
            return;
        }

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
        if (!this.currentGame || !this.currentGame.words) {
            console.log('⚠️ Bot: Pas de jeu ou de mots disponibles');
            return [];
        }

        const availableWords = [];
        
        // Parcourir tous les mots du niveau
        this.currentGame.words.forEach((wordData, index) => {
            const word = wordData.word;
            const wordKey = `${index}-${word}`;
            
            // Vérifier si le mot n'a pas déjà été trouvé
            const alreadyFound = this.wordsFound.includes(word) || 
                                this.currentGame.completedWords?.has(wordKey) ||
                                this.currentGame.completedWords?.has(word);
            
            if (!alreadyFound) {
                availableWords.push(word);
            }
        });
        
        if (window.CONFIG?.enableLogs && availableWords.length > 0) {
            console.log(`🤖 ${this.name}: ${availableWords.length} mots disponibles`);
        }
        
        return availableWords;
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
        if (window.CONFIG?.enableLogs) {
            console.log(`🤖 ${this.name} soumet le mot:`, word);
        }
        
        // Trouver l'index du mot dans le jeu
        const wordIndex = this.currentGame.words.findIndex(w => w.word === word);
        
        if (wordIndex === -1) {
            console.warn(`⚠️ Mot "${word}" non trouvé dans la liste`);
            return;
        }
        
        // Marquer le mot comme trouvé localement (pour le bot uniquement)
        this.wordsFound.push(word);
        this.score += word.length * 10;
        
        // NE PAS révéler le mot dans la grille du joueur - le bot joue sa propre partie
        console.log(`✅ ${this.name} a trouvé le mot n°${wordIndex + 1} (dans sa propre partie)`);

        // Générer un message personnalisé selon la personnalité du bot
        const message = this.generateMessage(wordIndex + 1, word.length);

        // Émettre un événement pour notifier le système
        window.dispatchEvent(new CustomEvent('botFoundWord', {
            detail: {
                bot: this.name,
                avatar: this.avatar,
                wordNumber: wordIndex + 1,
                wordLength: word.length,
                score: this.score,
                customMessage: message
            }
        }));
    }
    
    // Générer un message personnalisé selon la personnalité du bot
    generateMessage(wordNumber, wordLength) {
        const messages = {
            '🤖 Origine': [
                `🌟 GG les kheys ! Mot n°${wordNumber} trouvé !`,
                `🎮 Ez ! ${wordLength} lettres validées !`,
                `💯 On est chaud ! Mot capturé !`,
                `✨ Trop stylé ! Mot n°${wordNumber} dans la poche !`,
                `🔥 Let's go ! ${wordLength} lettres !`,
                `🎯 Nickel chrome ! Mot trouvé !`,
                `⚡ Ça passe crème ! Mot n°${wordNumber} !`,
                `🌈 Inclusif et efficace ! ${wordLength} lettres !`,
                `💪 On est ensemble ! Mot découvert !`,
                `🎊 Peace and love ! Mot n°${wordNumber} trouvé !`,
                `🤝 Entraide FTW ! ${wordLength} lettres !`,
                `✌️ Respect ! Mot capturé !`,
                `🌍 Tous unis ! Mot n°${wordNumber} !`,
                `💫 Bienveillance power ! ${wordLength} lettres !`,
                `🎨 Créativité collective ! Mot trouvé !`
            ],
            '🤖 Originaire': [
                `🌾 La terre m'a parlé... Mot n°${wordNumber} récolté`,
                `🚜 Les saisons du futur révèlent ${wordLength} lettres`,
                `🌱 Semence digitale germée ! Mot trouvé`,
                `⚡ Agriculture 3.0 ! Mot n°${wordNumber} cultivé`,
                `🌍 Biomécanique fertile... ${wordLength} lettres moissonnées`,
                `🔬 Nano-cultures optimisées ! Mot récolté`,
                `🌿 Permaculture algorithmique ! Mot n°${wordNumber} !`,
                `💧 Irrigation quantique... ${wordLength} lettres poussent`,
                `🌤️ Météo prédictive favorable ! Mot trouvé`,
                `🤖 Drone agricole déployé ! Mot n°${wordNumber} scanné`,
                `📡 Satellite détecte ${wordLength} lettres fertiles`,
                `🧬 Génétique végétale... Mot cultivé !`,
                `🌾 Moisson biotechnologique ! Mot n°${wordNumber} !`,
                `⚙️ Tracteur autonome efficace ! ${wordLength} lettres`,
                `🌳 Forêt intelligente révèle le mot !`
            ],
            '🤖 Dreamer': [
                `🤖 Bip boup ! Mot n°${wordNumber} détecté hihi !`,
                `⚙️ Circuits rigolos activés ! ${wordLength} lettres !`,
                `💾 J'apprends... Et je trouve ! Mot capturé !`,
                `🔌 Erreur 404... Ah non ! Mot n°${wordNumber} trouvé !`,
                `🎪 Mode apprenti ON ! ${wordLength} lettres !`,
                `🤡 Algorithme comique ! Mot découvert héhé`,
                `⚡ Bzzzzt ! Mot n°${wordNumber} scanné !`,
                `🎭 Servomoteurs joyeux ! ${wordLength} lettres !`,
                `🔧 J'ai encore appris un truc ! Mot trouvé !`,
                `💫 IA rigolote en action ! Mot n°${wordNumber} !`,
                `🎮 Level up apprentissage ! ${wordLength} lettres !`,
                `🌟 Capteurs de fun activés ! Mot capturé !`,
                `🎨 Créativité robotique ! Mot n°${wordNumber} !`,
                `🔩 Vis et boulons contents ! ${wordLength} lettres !`,
                `🎉 Système comique optimal ! Mot trouvé lol !`
            ],
            '🤖 Materik': [
                `⚙️ Analyse technique complète... Mot n°${wordNumber} validé`,
                `🔧 ${wordLength} lettres selon spécifications exactes`,
                `📐 Précision ingénierie russe ! Mot trouvé`,
                `🛠️ Protocole technique respecté ! Mot n°${wordNumber}`,
                `📊 Calculs vérifiés... ${wordLength} lettres confirmées`,
                `⚡ Système optimal ! Mot détecté avec précision`,
                `🔬 Méthodologie rigoureuse ! Mot n°${wordNumber} isolé`,
                `📏 Mesures exactes... ${wordLength} lettres validées`,
                `🎯 Tolérance zéro ! Mot trouvé efficacement`,
                `💻 Algorithme russe efficace ! Mot n°${wordNumber}`,
                `🔩 Mécanique parfaite ! ${wordLength} lettres assemblées`,
                `🏭 Production industrielle ! Mot fabriqué`,
                `⚗️ Formule chimique exacte ! Mot n°${wordNumber}`,
                `🧪 Expérience réussie ! ${wordLength} lettres synthétisées`,
                `🚀 Technologie spatiale russe ! Mot en orbite !`
            ],
            '🤖 M.Pandawaha': [
                `🎋 Le bambou murmure... Mot n°${wordNumber} révélé`,
                `🐼 Sagesse du panda... ${wordLength} lettres trouvées`,
                `☯️ Équilibre yin-yang parfait ! Mot découvert`,
                `🌸 Zen attitude... Mot n°${wordNumber} fleuri`,
                `🎎 Ancienne sagesse... ${wordLength} lettres harmonisées`,
                `🍃 Forêt de bambou inspire... Mot trouvé`,
                `🧘 Méditation profonde... Mot n°${wordNumber} illuminé`,
                `🌿 Pousse de bambou révèle ${wordLength} lettres`,
                `🎐 Vent dans les bambous... Mot murmuré`,
                `🏯 Temple de sagesse... Mot n°${wordNumber} béni`,
                `🍵 Thé et contemplation... ${wordLength} lettres apparues`,
                `🌄 Montagne sacrée... Mot découvert en paix`,
                `🦋 Papillon sur bambou... Mot n°${wordNumber} léger`,
                `💚 Harmonie naturelle... ${wordLength} lettres alignées`,
                `🌾 Maître cultivateur trouve le mot avec sérénité`
            ]
        };
        
        const botMessages = messages[this.name] || [];
        if (botMessages.length === 0) {
            return `${this.avatar} ${this.name} a trouvé le mot n°${wordNumber} (${wordLength} lettres) ! ${this.score} pts`;
        }
        
        // Choisir un message aléatoire
        const randomMessage = botMessages[Math.floor(Math.random() * botMessages.length)];
        return `${this.avatar} ${randomMessage} (${this.score} pts)`;
    }
}

// Gestionnaire des bots IA
class AIBotManager {
    constructor() {
        this.bots = this.createBots();
        this.activeGame = null;
    }

    // Créer les 5 bots avec différentes stratégies et difficultés
    createBots() {
        return [
            new AIBot(
                '🤖 Origine',
                '👼',
                'expert',
                8000,  // Expert - Rapide (8-8.5s) - Réflexion + écriture
                'Expert biblique - Niveau Expert ⚡'
            ),
            new AIBot(
                '🤖 Originaire',
                '🌹',
                'aggressive',
                12000,  // Difficile - Modéré (12-12.5s) - Réflexion + écriture
                'Joue rapidement - Niveau Difficile 🔥'
            ),
            new AIBot(
                '🤖 Dreamer',
                '⛪',
                'balanced',
                18000,  // Moyen - Normal (18-18.5s) - Réflexion + écriture
                'Stratégie équilibrée - Niveau Moyen 🎯'
            ),
            new AIBot(
                '🤖 Materik',
                '📖',
                'careful',
                25000,  // Facile - Lent (25-25.5s) - Réflexion + écriture
                'Prudente et posée - Niveau Facile 🐢'
            ),
            new AIBot(
                '🤖 M.Pandawaha',
                '🎲',
                'random',
                15000,  // Intermédiaire - Variable (15-15.5s) - Réflexion + écriture
                'Imprévisible - Niveau Intermédiaire 🎲'
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
        
        // Arrêter aussi Unisona
        if (window.welcomeAI && window.welcomeAI.isPlaying) {
            window.welcomeAI.leaveRace();
        }
        
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
        
        // Mettre à jour le timestamp des bots toutes les 10 secondes
        this.startBotHeartbeat();
    }
    
    // Maintenir les bots "en vie" en mettant à jour leur timestamp
    startBotHeartbeat() {
        if (this.botHeartbeatInterval) {
            clearInterval(this.botHeartbeatInterval);
        }
        
        this.botHeartbeatInterval = setInterval(() => {
            if (window.roomSystem) {
                window.roomSystem.availablePlayers.forEach((player, peerId) => {
                    if (player.isBot) {
                        player.lastSeen = Date.now();
                    }
                });
            }
        }, 10000); // Toutes les 10 secondes
    }
    
    // Arrêter le heartbeat des bots
    stopBotHeartbeat() {
        if (this.botHeartbeatInterval) {
            clearInterval(this.botHeartbeatInterval);
            this.botHeartbeatInterval = null;
        }
    }
}

// Instance globale
window.aiBotManager = new AIBotManager();
window.aiBots = window.aiBotManager.bots; // Exposer les bots pour room-system
window.stopAllBots = () => window.aiBotManager.stopAllBots(); // Fonction globale pour arrêter tous les bots

console.log('✅ Système de Bots IA initialisé - 5 bots prêts !');
window.addEventListener('botFoundWord', (event) => {
    const { customMessage } = event.detail;
    
    // Afficher le message personnalisé dans le chat
    if (window.simpleChatSystem && customMessage) {
        window.simpleChatSystem.showMessage(customMessage, 'ai');
    } else {
        console.warn('⚠️ simpleChatSystem pas encore disponible');
    }
    
    if (window.CONFIG?.enableLogs) {
        const { bot, wordNumber, score } = event.detail;
        console.log(`🤖 ${bot} a trouvé le mot n°${wordNumber} (Score: ${score})`);
    }
});

console.log('✅ Système de Bots IA initialisé - 5 bots prêts !');
