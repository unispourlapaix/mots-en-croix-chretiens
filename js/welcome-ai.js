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
        
        // Niveaux de difficulté (vitesse de jeu)
        this.difficulty = 'moyen'; // 'rapide', 'moyen', 'lent'
        this.difficultySettings = {
            'rapide': {
                baseSpeed: 800,      // 0.8-1.8 secondes entre actions
                randomRange: 1000,
                emoji: '⚡',
                description: 'Très rapide - Expert'
            },
            'moyen': {
                baseSpeed: 2000,     // 2-3 secondes entre actions
                randomRange: 1000,
                emoji: '🎯',
                description: 'Moyen - Normal'
            },
            'lent': {
                baseSpeed: 4000,     // 4-6 secondes entre actions
                randomRange: 2000,
                emoji: '🐢',
                description: 'Lent - Débutant'
            }
        };
        this.playSpeed = this.difficultySettings[this.difficulty].baseSpeed;
        
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
        
        // Écouter le démarrage du jeu pour activation automatique en solo
        this.setupAutoJoin();
    }
    
    // Configurer l'auto-join en mode solo
    setupAutoJoin() {
        // Écouter l'événement de démarrage du jeu
        document.addEventListener('gameStarted', () => {
            // Attendre un peu que le jeu soit bien lancé
            setTimeout(() => {
                // Vérifier si on est en mode solo (pas de course multijoueur active)
                const isSoloMode = !window.multiplayerRace || !window.multiplayerRace.isRaceMode;
                
                if (isSoloMode && !this.isPlaying) {
                    console.log('🤖 Mode solo détecté - Activation automatique d\'Unisona en mode lent');
                    
                    // Passer en mode lent (facile)
                    this.setDifficulty('lent');
                    
                    // Message d'activation
                    this.sendChatMessage('Je te rejoins pour t\'accompagner ! 🐢 (Mode facile)', 'system');
                    
                    // Rejoindre la partie en mode solo
                    this.joinSoloMode();
                }
            }, 2000); // Attendre 2 secondes après le démarrage
        });
    }
    
    // Rejoindre en mode solo (sans course multijoueur)
    joinSoloMode() {
        if (!window.game || !window.game.gameStarted) {
            console.log('⚠️ Jeu pas encore démarré');
            return false;
        }
        
        this.isPlaying = true;
        this.score = 0;
        this.wordsFound = [];
        
        console.log('✅ Unisona rejoint en mode solo facile 🐢');
        
        // Commencer à jouer
        this.startPlayingRace();
        return true;
    }
    
    // Changer la difficulté
    setDifficulty(level) {
        if (!['rapide', 'moyen', 'lent'].includes(level)) {
            console.error('❌ Difficulté invalide:', level);
            return false;
        }
        
        this.difficulty = level;
        const settings = this.difficultySettings[level];
        this.playSpeed = settings.baseSpeed;
        
        console.log(`✅ Difficulté Unisona: ${settings.emoji} ${settings.description}`);
        
        if (window.simpleChatSystem) {
            window.simpleChatSystem.showMessage(
                `${settings.emoji} Difficulté Unisona changée: ${settings.description}`,
                'system'
            );
        }
        
        return true;
    }
    
    // Obtenir la difficulté actuelle
    getDifficulty() {
        return {
            level: this.difficulty,
            ...this.difficultySettings[this.difficulty]
        };
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
        
        // Vérifier qu'une course est active
        if (!window.multiplayerRace.isRaceMode) {
            this.sendChatMessage(`${this.name} : Démarre d'abord une course avec le bouton 🏁 ! 😊`, 'system');
            return false;
        }
        
        this.isPlaying = true;
        this.score = 0;
        this.wordsFound = [];
        
        // Annoncer mon arrivée dans la course
        if (window.multiplayerRace.isRaceMode) {
            window.multiplayerRace.receiveProgress(this.name, 'start', {
                startTime: Date.now(),
                duration: window.multiplayerRace.raceDuration
            });
        }
        
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
        
        const difficultyInfo = this.getDifficulty();
        this.sendChatMessage(`${this.avatar} Allons-y ! Je suis prête pour la course ! ${difficultyInfo.emoji} (${this.difficulty}) 🏁`, 'system');
        
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
        
        this.sendChatMessage(`${this.avatar} Bonne partie ! Dieu te bénisse ! 💕`, 'system');
    }
    
    // Simuler le jeu en course
    startPlayingRace() {
        if (!this.isPlaying || !window.game) return;
        
        this.currentGame = window.game;
        
        // Récupérer les paramètres de vitesse selon la difficulté
        const settings = this.difficultySettings[this.difficulty];
        
        // Jouer périodiquement avec la vitesse de la difficulté
        const playInterval = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(playInterval);
                return;
            }
            
            // Simuler une progression de manière humaine
            this.makeRaceProgress();
            
        }, settings.baseSpeed + Math.random() * settings.randomRange);
    }
    
    // Calculer le temps de réflexion basé sur la difficulté du mot
    calculateThinkingTime(word) {
        const baseTime = this.difficultySettings[this.difficulty].baseSpeed;
        const wordLength = word.length;
        
        // Plus le mot est long, plus le temps de réflexion augmente
        // Mots de 3-4 lettres : temps de base
        // Mots de 5-7 lettres : +30% de temps
        // Mots de 8+ lettres : +60% de temps
        let multiplier = 1.0;
        if (wordLength >= 8) {
            multiplier = 1.6;
        } else if (wordLength >= 5) {
            multiplier = 1.3;
        }
        
        // Ajouter une variation aléatoire (±20%) pour simuler l'humain
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 à 1.2
        
        return baseTime * multiplier * randomFactor;
    }
    
    // Simuler une pause de réflexion
    shouldTakePause() {
        // 15% de chance de faire une pause (comme un humain qui réfléchit)
        return Math.random() < 0.15;
    }
    
    // Simuler une progression en course
    makeRaceProgress() {
        if (!this.currentGame) return;
        
        // En mode course : vérifier que la course est active
        if (window.multiplayerRace && window.multiplayerRace.isRaceMode) {
            // Mode course multijoueur - vérifier course active
            // (la logique existante continue)
        } else if (!window.game || !window.game.gameStarted) {
            // En mode solo : vérifier que le jeu est actif
            console.log('🏁 Jeu non actif, Unisona arrête de jouer');
            this.leaveRace();
            return;
        }
        
        // Parfois, faire une pause de réflexion (comme un humain qui cherche)
        if (this.shouldTakePause()) {
            const pauseMessages = [
                "Hmm, laisse-moi réfléchir... 🤔",
                "Voyons voir... 💭",
                "Quel mot pourrait bien aller ici ? 🧐",
                "Je cherche... ✨"
            ];
            
            if (Math.random() < 0.5) { // 50% de chance d'afficher le message de pause
                const randomPause = pauseMessages[Math.floor(Math.random() * pauseMessages.length)];
                this.sendChatMessage(randomPause, 'system');
            }
            
            // Ne pas trouver de mot cette fois, juste réfléchir
            return;
        }
        
        // Trouver un mot au hasard parmi ceux du niveau
        const levelData = window.gameDataManager?.getLevelData(this.currentGame.currentLevel);
        if (!levelData || !levelData.words) return;
        
        // Sélectionner un mot que Unisona n'a pas encore trouvé
        const availableWords = levelData.words.filter(w => !this.wordsFound.includes(w.word));
        if (availableWords.length === 0) {
            // Tous les mots trouvés, terminer
            this.sendChatMessage("🎉 J'ai trouvé tous les mots ! Félicitations à toi aussi ! 💕", 'system');
            this.leaveRace();
            return;
        }
        
        // Trier par difficulté (mots courts en premier pour être plus réaliste)
        availableWords.sort((a, b) => a.word.length - b.word.length);
        
        // Choisir parmi les 3 mots les plus faciles (ou tous si moins de 3)
        const easiestWords = availableWords.slice(0, Math.min(3, availableWords.length));
        const randomWord = easiestWords[Math.floor(Math.random() * easiestWords.length)];
        
        this.wordsFound.push(randomWord.word);
        
        // Calculer un score
        const wordScore = randomWord.word.length * 10 + 50; // 10pts/lettre + 50pts bonus
        this.score += wordScore;
        
        // Calculer la progression
        const progress = (this.wordsFound.length / levelData.words.length) * 100;
        
        // Calculer les lettres totales et correctes
        const totalLetters = levelData.words.reduce((sum, w) => sum + w.word.length, 0);
        const lettersCorrect = this.wordsFound.reduce((sum, word) => sum + word.length, 0);
        
        // Envoyer la progression via le système de course SI en mode multijoueur
        if (window.multiplayerRace && window.multiplayerRace.isRaceMode) {
            // Simuler la réception d'une progression comme si c'était un joueur distant
            window.multiplayerRace.receiveProgress(this.name, 'word', {
                word: randomWord.word,
                score: this.score,
                raceScore: this.score, // Pour un bot, score = raceScore
                wordsCompleted: this.wordsFound.length,
                lettersCorrect: lettersCorrect,
                totalLetters: totalLetters,
                percentage: progress
            });
        }
        
        // Messages variés (en mode course ET en mode solo)
        const messageChance = Math.random();
        
        if (messageChance < 0.5) { // 50% de chance de commenter
            let comment;
            const messageType = Math.random();
            
            // 40% messages normaux, 25% rigolos, 20% graves, 15% "tu savais que"
            if (messageType < 0.4) {
                // MESSAGES NORMAUX selon difficulté du mot
                if (randomWord.word.length <= 4) {
                        const easyComments = [
                            "Facile celui-là ! 😊",
                            "Trouvé rapidement ! ✨",
                            "Ah, ce mot était simple ! 💫"
                        ];
                        comment = easyComments[Math.floor(Math.random() * easyComments.length)];
                    } else if (randomWord.word.length <= 7) {
                        const mediumComments = [
                            "Pas mal ! 💪",
                            "J'adore ce mot ! ✨",
                            "Continue, tu progresses bien ! 💝",
                            "On avance ensemble ! 🙏"
                        ];
                        comment = mediumComments[Math.floor(Math.random() * mediumComments.length)];
                    } else {
                        const hardComments = [
                            "Ouf ! Ce mot était difficile ! 😅",
                            "J'ai dû réfléchir pour celui-là ! 🤔",
                            "Quel mot compliqué ! Mais j'ai réussi ! 💪",
                            "Celui-là m'a donné du fil à retordre ! ✨"
                        ];
                        comment = hardComments[Math.floor(Math.random() * hardComments.length)];
                    }
                    
                } else if (messageType < 0.65) {
                    // MESSAGES RIGOLOS (25%)
                    const funnyComments = [
                        "Haha ! Mon cerveau fait 'ding' ! 🔔😄",
                        "Trop facile, je pourrais le faire les yeux fermés ! 😎 (mais je garde les yeux ouverts 👀)",
                        "Mon neurone vient de danser la salsa ! 💃✨",
                        "BINGO ! J'ai trouvé avant que mon café refroidisse ! ☕😂",
                        "Woohoo ! Je mérite une médaille en chocolat ! 🍫🏅",
                        "Eurêka ! Archimède serait fier ! 🛁😄",
                        "Trop stylé ce mot ! Je le mets dans ma collection ! 📚✨",
                        "LOL, même mon chat aurait trouvé celui-là ! 🐱😹",
                        "Ça roule ma poule ! 🐔🎉",
                        "Hop hop hop ! Un mot de plus dans ma besace ! 🎒😊"
                    ];
                    comment = funnyComments[Math.floor(Math.random() * funnyComments.length)];
                    
                } else if (messageType < 0.85) {
                    // MESSAGES GRAVES/PROFONDS (20%)
                    const seriousComments = [
                        "Chaque mot trouvé est une victoire sur le découragement. 💪🙏",
                        "La persévérance est la clé du succès. Continue ! 🗝️✨",
                        "Dieu nous donne la force de surmonter chaque défi. 🙏💝",
                        "Dans la difficulté, on découvre notre vraie force. 💪",
                        "Chaque progrès compte, même le plus petit. 🌱",
                        "La patience et la foi déplacent les montagnes. ⛰️🙏",
                        "N'abandonne jamais, Dieu est avec toi. 💕",
                        "Les victoires les plus douces sont celles qu'on a méritées. 🏆",
                        "Crois en toi, tu es capable de grandes choses. ✨💪",
                        "La sagesse vient de la persévérance. 📖🙏"
                    ];
                    comment = seriousComments[Math.floor(Math.random() * seriousComments.length)];
                    
                } else {
                    // MESSAGES "TU SAVAIS QUE" (15%)
                    const didYouKnowComments = [
                        "💡 Tu savais que ? La Bible contient plus de 3000 promesses de Dieu ! 📖",
                        "💡 Tu savais que ? Le mot 'amour' apparaît plus de 500 fois dans la Bible ! ❤️",
                        "💡 Tu savais que ? Jésus parlait 3 langues : hébreu, araméen et grec ! 🗣️",
                        "💡 Tu savais que ? Le livre le plus court de la Bible est 2 Jean avec 13 versets ! 📚",
                        "💡 Tu savais que ? La Bible a été traduite en plus de 3000 langues ! 🌍",
                        "💡 Tu savais que ? Le mot 'joie' apparaît 242 fois dans la Bible ! 😊",
                        "💡 Tu savais que ? Psaume 117 est le chapitre le plus court de la Bible ! 📖",
                        "💡 Tu savais que ? La prière peut réduire le stress de 50% ! 🙏✨",
                        "💡 Tu savais que ? Le nom de Jésus signifie 'Dieu sauve' en hébreu ! ✝️",
                        "💡 Tu savais que ? La gratitude améliore notre santé mentale ! 💝🧠",
                        "💡 Tu savais que ? Sourire active 17 muscles et libère des endorphines ! 😊✨",
                        "💡 Tu savais que ? La foi peut augmenter la résilience face aux épreuves ! 💪🙏"
                    ];
                    comment = didYouKnowComments[Math.floor(Math.random() * didYouKnowComments.length)];
                }
                
                this.sendChatMessage(comment, 'system');
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
