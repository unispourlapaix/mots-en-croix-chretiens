/**
 * IA d'Accueil du Jeu - Assistante virtuelle qui accueille et guide les joueurs
 * Unisona peut aussi jouer en course contre les joueurs !
 */

class WelcomeAI {
    constructor() {
        this.name = 'Unisona'; // Nom de l'IA
        this.avatar = '👼';
        this.hasWelcomed = false;
        this.isBot = true;
        this.isPlaying = false;
        this.score = 0;
        this.wordsFound = [];
        this.currentGame = null;
        this.playSpeed = 2000; // 2 secondes entre chaque action
        
        this.tips = [
            "💡 Astuce : Commence par les mots les plus courts, ils sont souvent plus faciles !",
            "✨ N'oublie pas d'utiliser les indices si tu es bloqué (bouton 💡)",
            "🎯 Chaque niveau complété te rapporte des points bonus !",
            "💬 Tu peux inviter un ami à jouer avec toi via le chat en haut !",
            "🙏 Les mots sont inspirés de la Bible et de messages d'encouragement chrétiens",
            "⭐ Plus tu complètes de niveaux, plus tu débloques de médailles !",
            "🎮 Le code de ta partie s'affiche dans le menu Chat pour inviter des amis",
            "💝 Prends ton temps, ce jeu est fait pour te détendre et te bénir",
            "🏁 Tu veux faire une course ? Je peux jouer avec toi ! Tape /unisona",
            "🔒 Sécurité : Ne partage jamais ton code de room publiquement, seulement en privé",
            "⚠️ Rappel : Ne partage JAMAIS d'informations personnelles avec des inconnus",
            "🛡️ Prudence : Toute demande d'argent ici est suspecte - signale-la immédiatement",
            "👨‍👩‍👧‍👦 Protection : Signale tout comportement suspect envers les enfants",
            "🤝 Sagesse : Pour les rencontres : lieu public, jamais seul(e), préviens quelqu'un",
            "⏰ Patience : Prends le temps de connaître vraiment les personnes en ligne",
            "📸 Protection : Ne partage jamais de photos privées en ligne. Un ami s'est confié après avoir été victime de chantage - sa famille et les autorités l'ont aidé. Tu peux être protégé(e) aussi ! 💪",
            "🚫 Cyberharcèlement : Si quelqu'un te met mal à l'aise, bloque-le immédiatement et parle à un adulte de confiance",
            "👤 Identité : Ne révèle jamais ton nom complet, adresse, école ou numéro de téléphone en ligne",
            "🎭 Méfiance : Les gens ne sont pas toujours qui ils prétendent être. Reste prudent(e) avec les nouveaux contacts",
            "💬 Parler aide : Si quelque chose te dérange en ligne, parle-en à tes parents ou un adulte de confiance. Tu n'es jamais seul(e) !",
            "🔐 Mots de passe : Ne partage JAMAIS tes mots de passe, même avec des 'amis' en ligne",
            "📱 Captures d'écran : Si quelqu'un te menace ou t'insulte, fais des captures d'écran et signale aux autorités",
            "👨‍👩‍👧 Parents : Parler à tes parents de tes activités en ligne, c'est normal et ça te protège !",
            "🗣️ Brise le silence : Ne garde pas pour toi les intimidations ! Les manipulateurs utilisent la peur pour voler ta paix. Parle, tu seras protégé(e) ! 💪✨",
            "🛡️ Protège les autres : Si tu vois quelqu'un en danger ou harcelé, signale-le ! Protéger les autres est aussi notre devoir 💙"
        ];
        this.welcomeMessages = [
            "Bienvenue dans Mots En Croix Chrétiens ! 🙏✨",
            "Je suis Unisona, ton assistante virtuelle 😊",
            "Je suis là pour t'accompagner dans ce jeu inspirant !",
            "Que Dieu te bénisse dans cette aventure ! 💕"
        ];
    }

    init() {
        // Afficher le message de bienvenue au chargement
        this.showWelcomeMessage();
        
        // Afficher des conseils périodiquement pendant le jeu
        this.startTipScheduler();
    }

    showWelcomeMessage() {
        // Messages de bienvenue désactivés - géré dans index.html
        // pour éviter les doublons
        this.hasWelcomed = true;
    }

    startTipScheduler() {
        // Afficher un conseil toutes les 3-5 minutes pendant le jeu
        const scheduleNextTip = () => {
            const delay = (3 + Math.random() * 2) * 60 * 1000; // 3-5 minutes
            setTimeout(() => {
                // Ne donner des conseils que si le jeu est démarré
                if (typeof game !== 'undefined' && game.gameStarted) {
                    const randomTip = this.tips[Math.floor(Math.random() * this.tips.length)];
                    this.sendChatMessage(`💭 ${this.name} : ${randomTip}`, 'system');
                }
                scheduleNextTip();
            }, delay);
        };
        
        scheduleNextTip();
    }

    // Envoyer un message dans le chat
    sendChatMessage(message, type = 'ai') {
        if (typeof simpleChatSystem !== 'undefined') {
            // Ajouter l'emoji d'Unisona pour les messages système de l'IA
            const aiMessage = `👼 ${message}`;
            simpleChatSystem.showMessage(aiMessage, type);
        }
    }

    // Féliciter le joueur pour une réussite
    congratulate() {
        const congratsMessages = [
            "🎉 Bravo ! Tu as terminé ce niveau !",
            "✨ Excellent travail ! Continue comme ça !",
            "🌟 Magnifique ! Que Dieu te bénisse !",
            "💪 Super ! Tu progresses bien !",
            "🎊 Génial ! Tu es sur la bonne voie !",
            "⭐ Félicitations ! Un niveau de plus !",
            "💝 Très bien joué ! Dieu est avec toi !"
        ];
        
        const message = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
        this.sendChatMessage(`💕 ${this.name} : ${message}`, 'system');
    }

    // Encourager le joueur quand il utilise un indice
    encourageOnHint() {
        const hintMessages = [
            "💡 Bonne idée d'utiliser un indice ! Ne t'inquiète pas 😊",
            "✨ Parfois un petit coup de pouce aide beaucoup !",
            "🌟 N'hésite pas, c'est fait pour ça !",
            "💫 Un indice au bon moment, c'est toujours utile !"
        ];
        
        const message = hintMessages[Math.floor(Math.random() * hintMessages.length)];
        this.sendChatMessage(`${this.name} : ${message}`, 'system');
    }

    // Message d'encouragement quand le joueur a du mal
    encourageOnStruggle() {
        const encourageMessages = [
            "💪 Ne t'inquiète pas, tu peux y arriver ! Prends ton temps 😊",
            "🙏 Dieu est avec toi, même dans les moments difficiles !",
            "✨ Chaque difficulté est une opportunité d'apprendre !",
            "💝 Tu progresses, même si ça ne se voit pas tout de suite !",
            "🌈 Après la pluie vient le beau temps ! Continue !",
            "⭐ Crois en toi, tu as déjà réussi les niveaux précédents !"
        ];
        
        const message = encourageMessages[Math.floor(Math.random() * encourageMessages.length)];
        this.sendChatMessage(`💕 ${this.name} : ${message}`, 'system');
    }

    // Célébrer les jalons importants
    celebrateMilestone(level) {
        if (level % 10 === 0) {
            this.sendChatMessage(`🎊 WOW ! Niveau ${level} atteint ! Tu es incroyable ! 🌟`, 'system');
        } else if (level === 25) {
            this.sendChatMessage(`✨ Un quart du chemin parcouru ! Continue ! 💪`, 'system');
        } else if (level === 50) {
            this.sendChatMessage(`🎉 La moitié des niveaux terminés ! Quelle persévérance ! 🙏`, 'system');
        } else if (level === 75) {
            this.sendChatMessage(`⭐ Presque à la fin ! Tu es fantastique ! 💝`, 'system');
        } else if (level === 77) {
            this.sendChatMessage(`🏆 FÉLICITATIONS ! Tu as terminé TOUS les niveaux ! Dieu te bénisse ! 🙏✨💕`, 'system');
        }
    }

    // ===== FONCTIONNALITÉS DE COURSE =====
    
    // Rejoindre une course en tant que bot adversaire
    joinRace() {
        if (!window.multiplayerRace) {
            this.sendChatMessage(`${this.name} : Je ne peux pas rejoindre, le mode course n'est pas actif ! 😅`, 'system');
            return false;
        }
        
        this.isPlaying = true;
        this.score = 0;
        this.wordsFound = [];
        
        // S'ajouter comme joueur disponible dans le système de présence
        if (window.presenceSystem) {
            window.presenceSystem.onlinePlayers.set('bot-unisona', {
                peerId: 'bot-unisona',
                username: this.name,
                avatar: this.avatar,
                isBot: true,
                lastSeen: Date.now()
            });
        }
        
        this.sendChatMessage(`${this.avatar} ${this.name} : Allons-y ! Je suis prête pour la course ! 🏁`, 'system');
        
        // Commencer à simuler le jeu
        this.startPlayingRace();
        return true;
    }
    
    // Quitter une course
    leaveRace() {
        this.isPlaying = false;
        this.currentGame = null;
        
        if (window.presenceSystem) {
            window.presenceSystem.onlinePlayers.delete('bot-unisona');
        }
        
        this.sendChatMessage(`${this.avatar} ${this.name} : Bonne partie ! Dieu te bénisse ! 💕`, 'system');
    }
    
    // Simuler le jeu en course
    startPlayingRace() {
        if (!this.isPlaying || !window.game) return;
        
        this.currentGame = window.game;
        
        // Jouer périodiquement
        const playInterval = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(playInterval);
                return;
            }
            
            // Simuler une progression
            this.makeRaceProgress();
            
        }, this.playSpeed + Math.random() * 1000); // 2-3 secondes entre actions
    }
    
    // Simuler une progression en course
    makeRaceProgress() {
        if (!this.currentGame || !window.multiplayerRace) return;
        
        // Trouver un mot au hasard parmi ceux du niveau
        const levelData = window.gameDataManager?.getLevelData(this.currentGame.currentLevel);
        if (!levelData || !levelData.words) return;
        
        // Sélectionner un mot que Sophie n'a pas encore trouvé
        const availableWords = levelData.words.filter(w => !this.wordsFound.includes(w.word));
        if (availableWords.length === 0) {
            // Tous les mots trouvés, terminer
            this.leaveRace();
            return;
        }
        
        // Prendre un mot au hasard
        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        this.wordsFound.push(randomWord.word);
        
        // Calculer un score
        const wordScore = randomWord.word.length * 10 + 50; // 10pts/lettre + 50pts bonus
        this.score += wordScore;
        
        // Envoyer la progression via le système de course
        if (window.multiplayerRace && window.multiplayerRace.isRaceMode) {
            // Simuler un événement de progression
            const fakeProgressData = {
                username: this.name,
                level: this.currentGame.currentLevel,
                progress: (this.wordsFound.length / levelData.words.length) * 100,
                score: this.score,
                avatar: this.avatar
            };
            
            // Afficher la progression dans le chat
            if (Math.random() < 0.3) { // 30% de chance de commenter
                const comments = [
                    "Ce mot était difficile ! 💪",
                    "J'adore ce niveau ! ✨",
                    "Dieu est avec nous ! 🙏",
                    "Continue, tu progresses bien ! 💝"
                ];
                const randomComment = comments[Math.floor(Math.random() * comments.length)];
                this.sendChatMessage(`${this.avatar} ${this.name} : ${randomComment}`, 'system');
            }
        }
    }
    
    // Être disponible pour rejoindre des courses
    makeAvailableForRace() {
        if (window.roomSystem) {
            window.roomSystem.availablePlayers.set('bot-unisona', {
                username: this.name,
                avatar: this.avatar,
                acceptMode: 'auto',
                playerCount: 1,
                maxPlayers: 1,
                lastSeen: Date.now(),
                isBot: true
            });
            window.roomSystem.updateChatBubble();
            
            console.log('✅ Unisona est disponible pour les courses !');
        }
    }
}

// Instance globale
const welcomeAI = new WelcomeAI();

// Rendre Sophie disponible globalement
window.welcomeAI = welcomeAI;

// Lancer l'initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Attendre que le chat soit initialisé
        setTimeout(() => {
            welcomeAI.init();
            // Rendre Unisona disponible pour les courses après 5 secondes
            setTimeout(() => welcomeAI.makeAvailableForRace(), 5000);
        }, 1500);
    });
} else {
    setTimeout(() => {
        welcomeAI.init();
        // Rendre Unisona disponible pour les courses après 5 secondes
        setTimeout(() => welcomeAI.makeAvailableForRace(), 5000);
    }, 1500);
}

console.log('✅ Unisona (Bot IA) initialisée - Prête pour le chat et les courses !');
