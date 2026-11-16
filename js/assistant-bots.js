/**
 * Système de Bots Assistants - Personnages pour annonces et interactions
 * Différents des bots IA de jeu - ces bots interagissent avec les joueurs
 */

class AssistantBot {
    constructor(name, avatar, personality, role, tone) {
        this.name = name;
        this.avatar = avatar;
        this.personality = personality;
        this.role = role;
        this.tone = tone; // 'sage', 'fun', 'inclusive', 'technical'
        this.messageHistory = [];
    }

    // Générer un message selon la personnalité
    generateMessage(context, messageType) {
        const message = {
            bot: this.name,
            avatar: this.avatar,
            text: '',
            timestamp: Date.now(),
            type: messageType
        };

        switch (messageType) {
            case 'welcome':
                message.text = this.getWelcomeMessage(context);
                break;
            case 'achievement':
                message.text = this.getAchievementMessage(context);
                break;
            case 'encouragement':
                message.text = this.getEncouragementMessage(context);
                break;
            case 'help':
                message.text = this.getHelpMessage(context);
                break;
            case 'announcement':
                message.text = this.getAnnouncementMessage(context);
                break;
            case 'tip':
                message.text = this.getTipMessage(context);
                break;
            case 'biblical':
                message.text = this.getBiblicalQuote(context);
                break;
            default:
                message.text = this.getGenericMessage(context);
        }

        this.messageHistory.push(message);
        return message;
    }

    // Messages de bienvenue
    getWelcomeMessage(context) {
        const messages = {
            'Originaire': [
                `Bienvenue, ${context.username}. Que la sagesse guide tes pas dans ce jeu.`,
                `${context.username}, je suis honoré de t'accueillir. Prends le temps de réfléchir à chaque mot.`,
                `Salutations, voyageur. La patience et la réflexion sont les clés de la réussite.`
            ],
            'Origine': [
                `Hey ${context.username} ! 🎉 Content·e de te voir ici ! On va s'amuser ensemble !`,
                `Coucou ${context.username} ! Bienvenue dans l'aventure ! Tout le monde est le bienvenu ici 😊`,
                `Salut ${context.username} ! Prêt·e à découvrir des mots géniaux ? Let's go ! 🚀`
            ],
            'Dreamer': [
                `Bip boop ! ${context.username} détecté·e ! 🤖 Je suis super content de jouer avec toi !`,
                `Ohhhh ! Un·e nouvel·le ami·e ! Je m'appelle Dreamer et j'adore les mots ! Hehe ! ✨`,
                `*fait un petit tour* Bienvenue ${context.username} ! Je suis un petit robot curieux ! 🔍`
            ],
            'Materik': [
                `Bonjour ${context.username}. Système initialisé. Si tu as besoin d'aide technique, je suis là.`,
                `${context.username}, bienvenue. J'ai optimisé l'interface pour toi. N'hésite pas si tu as des questions.`,
                `Salut ${context.username}. En tant qu'ingénieur, je peux t'expliquer comment tout fonctionne ici.`
            ]
        };

        const botMessages = messages[this.name] || [`Bienvenue ${context.username} !`];
        return botMessages[Math.floor(Math.random() * botMessages.length)];
    }

    // Messages d'accomplissement
    getAchievementMessage(context) {
        // Utiliser les messages existants de welcomeAI si disponibles
        const congratsMessages = [
            "🎉 Bravo ! Tu as terminé ce niveau !",
            "✨ Excellent travail ! Continue comme ça !",
            "🌟 Magnifique ! Que Dieu te bénisse !",
            "💪 Super ! Tu progresses bien !",
            "🎊 Génial ! Tu es sur la bonne voie !",
            "⭐ Félicitations ! Un niveau de plus !",
            "💝 Très bien joué ! Dieu est avec toi !"
        ];
        
        const messages = {
            'Originaire': [
                `Remarquable, ${context.username}. Ta persévérance porte ses fruits.`,
                `Sage décision. Tu progresses avec honneur.`,
                `Excellence. Continue sur cette voie, jeune apprenti.`,
                congratsMessages[Math.floor(Math.random() * congratsMessages.length)]
            ],
            'Origine': [
                `Trop bien ${context.username} ! Tu gères grave ! 🌟`,
                `Waouh ! T'es un·e champion·ne ! Continue comme ça ! 💪`,
                `Yeahhh ! ${context.username} rocks ! T'es incroyable ! 🎊`,
                congratsMessages[Math.floor(Math.random() * congratsMessages.length)]
            ],
            'Dreamer': [
                `Bip boop ! Calcul: ${context.username} = GÉNIAL·E ! 🤖✨`,
                `Ohhhh ! Bravo bravo ! *fait des petits sauts de joie* 🎉`,
                `Mon capteur de bonheur explose ! Tu es super fort·e ! 💫`,
                congratsMessages[Math.floor(Math.random() * congratsMessages.length)]
            ],
            'Materik': [
                `Performance optimale détectée. Bien joué, ${context.username}.`,
                `Efficacité: 100%. Système impressionné.`,
                `Achievement unlocked. Analyse: tu maîtrises bien le système.`,
                congratsMessages[Math.floor(Math.random() * congratsMessages.length)]
            ]
        };

        const botMessages = messages[this.name] || [`Bravo ${context.username} !`];
        return botMessages[Math.floor(Math.random() * botMessages.length)];
    }

    // Messages d'encouragement
    getEncouragementMessage(context) {
        // Utiliser les messages existants de welcomeAI
        const encourageMessages = [
            "💪 Ne t'inquiète pas, tu peux y arriver ! Prends ton temps 😊",
            "🙏 Dieu est avec toi, même dans les moments difficiles !",
            "✨ Chaque difficulté est une opportunité d'apprendre !",
            "💝 Tu progresses, même si ça ne se voit pas tout de suite !",
            "🌈 Après la pluie vient le beau temps ! Continue !",
            "⭐ Crois en toi, tu as déjà réussi les niveaux précédents !"
        ];
        
        const messages = {
            'Originaire': [
                `Ne perds pas espoir, ${context.username}. Même les plus sages ont connu l'échec.`,
                `La difficulté forge le caractère. Continue d'essayer.`,
                `Respire profondément. La solution viendra avec la patience.`,
                encourageMessages[Math.floor(Math.random() * encourageMessages.length)]
            ],
            'Origine': [
                `Pas grave si c'est dur ! On apprend tous à notre rythme ! 😊`,
                `Hey, t'inquiète ! Même les pros galèrent parfois ! Continue, t'assures ! 💪`,
                `C'est ok de faire des erreurs ! C'est comme ça qu'on progresse ! ✨`,
                encourageMessages[Math.floor(Math.random() * encourageMessages.length)]
            ],
            'Dreamer': [
                `Bip ! Ne sois pas triste ! Les robots aussi font des erreurs ! 🤖💙`,
                `*câlin virtuel* Tu vas y arriver ! Mon algorithme croit en toi ! ✨`,
                `Ohh... Pas de panique ! Réessayons ensemble ! Je suis là ! 🔍`,
                encourageMessages[Math.floor(Math.random() * encourageMessages.length)]
            ],
            'Materik': [
                `Erreur détectée mais corrigible. Analyse des alternatives en cours...`,
                `Debug mode activé. Chaque erreur est une opportunité d'optimisation.`,
                `System check: Tu as tout ce qu'il faut pour réussir. Réessaie.`,
                encourageMessages[Math.floor(Math.random() * encourageMessages.length)]
            ]
        };

        const botMessages = messages[this.name] || [`Continue, ${context.username} !`];
        return botMessages[Math.floor(Math.random() * botMessages.length)];
    }

    // Messages d'aide
    getHelpMessage(context) {
        const messages = {
            'Originaire': [
                `Laisse-moi te guider, ${context.username}. ${context.tip}`,
                `Un conseil de sage : ${context.tip}`,
                `Voici ce que l'expérience m'a appris : ${context.tip}`
            ],
            'Origine': [
                `Alors écoute bien ! ${context.tip} C'est simple non ? 😄`,
                `J'ai un super tip pour toi : ${context.tip} Fonce ! 🚀`,
                `Petit conseil entre potes : ${context.tip} Tu vas voir, c'est cool ! ✨`
            ],
            'Dreamer': [
                `Bip boop ! J'ai scanné et trouvé : ${context.tip} Hehe ! 🤖`,
                `Ohh j'ai une idée ! ${context.tip} *yeux qui brillent* ✨`,
                `Mon processeur dit que : ${context.tip} C'est pas génial ça ? 🔍`
            ],
            'Materik': [
                `Documentation trouvée : ${context.tip}`,
                `Solution technique identifiée : ${context.tip}`,
                `Selon les spécifications : ${context.tip}`
            ]
        };

        const botMessages = messages[this.name] || [context.tip];
        return botMessages[Math.floor(Math.random() * botMessages.length)];
    }

    // Messages d'annonce
    getAnnouncementMessage(context) {
        const messages = {
            'Originaire': [
                `Écoutez tous : ${context.announcement}`,
                `J'ai une annonce importante : ${context.announcement}`,
                `Que chacun soit informé : ${context.announcement}`
            ],
            'Origine': [
                `Yo tout le monde ! ${context.announcement} 📢`,
                `Hey les ami·e·s ! ${context.announcement} 🎉`,
                `Nouvelle fraîche ! ${context.announcement} ✨`
            ],
            'Dreamer': [
                `Bip bip ! Annonce spéciale ! ${context.announcement} 🤖`,
                `*sonnerie* Message important : ${context.announcement} 📡`,
                `Ohh écoutez tous ! ${context.announcement} *excité* 🔔`
            ],
            'Materik': [
                `[SYSTEM] ${context.announcement}`,
                `Notification système : ${context.announcement}`,
                `Info technique : ${context.announcement}`
            ]
        };

        const botMessages = messages[this.name] || [context.announcement];
        return botMessages[Math.floor(Math.random() * botMessages.length)];
    }

    // Messages de conseil/tip
    getTipMessage(context) {
        // Utiliser les tips existants de welcomeAI
        const sharedTips = [
            "💡 Astuce : Commence par les mots les plus courts, ils sont souvent plus faciles !",
            "✨ N'oublie pas d'utiliser les indices si tu es bloqué (bouton 💡)",
            "🎯 Chaque niveau complété te rapporte des points bonus !",
            "💬 Tu peux inviter un ami à jouer avec toi via le chat en haut !",
            "🙏 Les mots sont inspirés de la Bible et de messages d'encouragement chrétiens",
            "⭐ Plus tu complètes de niveaux, plus tu débloques de médailles !",
            "🎮 Le code de ta partie s'affiche dans le menu Chat pour inviter des amis",
            "💝 Prends ton temps, ce jeu est fait pour te détendre et te bénir"
        ];
        
        const safetyTips = [
            "🔒 Sécurité : Ne partage jamais ton code de room publiquement, seulement en privé",
            "⚠️ Rappel : Ne partage JAMAIS d'informations personnelles avec des inconnus",
            "🛡️ Prudence : Toute demande d'argent ici est suspecte - signale-la immédiatement",
            "👨‍👩‍👧‍👦 Protection : Signale tout comportement suspect envers les enfants",
            "🤝 Sagesse : Pour les rencontres : lieu public, jamais seul(e), préviens quelqu'un",
            "⏰ Patience : Prends le temps de connaître vraiment les personnes en ligne",
            "📸 Protection : Ne partage jamais de photos privées en ligne",
            "🚫 Cyberharcèlement : Si quelqu'un te met mal à l'aise, bloque-le immédiatement",
            "👤 Identité : Ne révèle jamais ton nom complet, adresse, école ou numéro de téléphone",
            "🗣️ Brise le silence : Ne garde pas pour toi les intimidations ! Parle, tu seras protégé(e) ! 💪✨"
        ];
        
        const tips = {
            'Originaire': [
                `La sagesse dit : commence par les mots courts pour voir la structure.`,
                `Un vieux proverbe : la patience révèle ce que la hâte cache.`,
                `Observe les intersections entre les mots, elles sont la clé.`,
                ...sharedTips,
                ...safetyTips
            ],
            'Origine': [
                `Petit tips : commence par chercher les mots de 3-4 lettres, c'est plus facile ! 💡`,
                `Astuce cool : si t'es bloqué·e, prends une pause et reviens ! 🎯`,
                `Tu savais ? Les indices peuvent vraiment aider, pas de honte à les utiliser ! ✨`,
                ...sharedTips,
                ...safetyTips
            ],
            'Dreamer': [
                `Bip ! Mon analyse montre que jouer en vocal c'est plus fun ! 🎤`,
                `Ohh découverte ! Tu peux partager ton score avec tes ami·e·s ! 🤖💙`,
                `Secret de robot : les achievements cachés sont trop cools à débloquer ! ✨`,
                ...sharedTips,
                ...safetyTips
            ],
            'Materik': [
                `Optimisation recommandée : utilise les raccourcis clavier pour plus d'efficacité.`,
                `Performance tip : le mode vocal P2P est plus stable que tu ne le penses.`,
                `Algorithme suggéré : commence par remplir les mots qui ont le plus d'intersections.`,
                ...sharedTips,
                ...safetyTips
            ]
        };

        const botTips = tips[this.name] || sharedTips;
        return botTips[Math.floor(Math.random() * botTips.length)];
    }

    // Message générique
    getGenericMessage(context) {
        return context.message || `${this.avatar} ${this.name} : ${context.text || 'Bonjour !'}`;
    }
    
    // Citations bibliques
    getBiblicalQuote(context) {
        // Utiliser les citations bibliques si disponibles
        if (typeof biblicalQuotes === 'undefined') {
            return `${this.avatar} "Que la paix soit avec toi" - Message de foi`;
        }
        
        // Sélectionner une catégorie selon le contexte
        const categories = ['foundations', 'growth', 'wisdom', 'love', 'strength', 'peace'];
        const category = context.category || categories[Math.floor(Math.random() * categories.length)];
        
        if (biblicalQuotes[category] && biblicalQuotes[category].length > 0) {
            const quote = biblicalQuotes[category][Math.floor(Math.random() * biblicalQuotes[category].length)];
            
            // Personnaliser selon le bot
            const introductions = {
                'Originaire': `📖 Méditation : "${quote.text}" - ${quote.ref}`,
                'Origine': `✨ Citation inspirante : "${quote.text}" - ${quote.ref} 💙`,
                'Dreamer': `🤖 Ma base de données dit : "${quote.text}" - ${quote.ref} (C'est beau non ? 💫)`,
                'Materik': `📚 Référence biblique chargée : "${quote.text}" - ${quote.ref}`
            };
            
            return introductions[this.name] || `"${quote.text}" - ${quote.ref}`;
        }
        
        return `${this.avatar} Que la foi guide tes pas !`;
    }

    // Réagir à un événement
    reactToEvent(eventType, data) {
        const reactions = {
            'player_joined': () => this.generateMessage({ username: data.username }, 'welcome'),
            'level_complete': () => this.generateMessage({ username: data.username }, 'achievement'),
            'player_struggling': () => this.generateMessage({ username: data.username }, 'encouragement'),
            'need_help': () => this.generateMessage({ tip: data.tip }, 'help'),
            'announcement': () => this.generateMessage({ announcement: data.text }, 'announcement'),
            'random_tip': () => this.generateMessage({}, 'tip')
        };

        const reaction = reactions[eventType];
        return reaction ? reaction() : null;
    }
}

// Gestionnaire des bots assistants
class AssistantBotManager {
    constructor() {
        this.bots = this.createBots();
        this.activeBot = null;
        this.rotationInterval = null;
    }

    // Créer les 4 bots assistants
    createBots() {
        return {
            originaire: new AssistantBot(
                'Originaire',
                '🧙‍♂️',
                'Sage et réfléchi, avec une grande expérience de la vie',
                'Guide spirituel et conseiller',
                'sage'
            ),
            origine: new AssistantBot(
                'Origine',
                '🌈',
                'Jeune, enthousiaste et inclusif, toujours positif',
                'Ambassadeur de la communauté',
                'inclusive'
            ),
            dreamer: new AssistantBot(
                'Dreamer',
                '🤖',
                'Petit robot curieux, adorable et plein d\'énergie',
                'Assistant technique ludique',
                'fun'
            ),
            materik: new AssistantBot(
                'Materik',
                '💻',
                'Ingénieur informatique précis et efficace',
                'Support technique expert',
                'technical'
            )
        };
    }

    // Obtenir un bot spécifique
    getBot(name) {
        const botKey = name.toLowerCase();
        return this.bots[botKey] || null;
    }

    // Sélectionner un bot aléatoire
    getRandomBot() {
        const botNames = Object.keys(this.bots);
        const randomName = botNames[Math.floor(Math.random() * botNames.length)];
        return this.bots[randomName];
    }

    // Sélectionner le meilleur bot pour un type de message
    getBotForContext(messageType, preferredTone = null) {
        if (preferredTone) {
            // Trouver un bot avec le ton préféré
            const bot = Object.values(this.bots).find(b => b.tone === preferredTone);
            if (bot) return bot;
        }

        // Sélection par défaut selon le type de message
        const defaultBots = {
            'welcome': this.bots.origine,
            'achievement': this.bots.originaire,
            'encouragement': this.bots.dreamer,
            'help': this.bots.materik,
            'announcement': this.bots.origine,
            'tip': this.getRandomBot()
        };

        return defaultBots[messageType] || this.getRandomBot();
    }

    // Envoyer un message via un bot
    sendMessage(messageType, context = {}, preferredBot = null) {
        const bot = preferredBot || this.getBotForContext(messageType);
        const message = bot.generateMessage(context, messageType);
        
        // Afficher dans le chat si disponible
        if (window.simpleChatSystem) {
            window.simpleChatSystem.showMessage(
                `${message.avatar} ${message.bot} : ${message.text}`,
                'ai'
            );
        }

        console.log(`${message.avatar} ${message.bot}:`, message.text);
        return message;
    }

    // Démarrer une rotation de tips aléatoires
    startTipRotation(intervalMinutes = 5) {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
        }

        this.rotationInterval = setInterval(() => {
            // Alterner entre tips et citations bibliques (50/50)
            const messageType = Math.random() > 0.5 ? 'tip' : 'biblical';
            const bot = this.getRandomBot();
            this.sendMessage(messageType, {}, bot);
        }, intervalMinutes * 60 * 1000);

        console.log(`🔄 Rotation de tips/citations démarrée (toutes les ${intervalMinutes} minutes)`);
    }

    // Arrêter la rotation
    stopTipRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
            console.log('⏹️ Rotation de tips arrêtée');
        }
    }

    // Réagir à un événement de jeu
    handleGameEvent(eventType, data) {
        const bot = this.getBotForContext(eventType);
        const message = bot.reactToEvent(eventType, data);
        
        if (message && window.simpleChatSystem) {
            window.simpleChatSystem.showMessage(
                `${message.avatar} ${message.bot} : ${message.text}`,
                'ai'
            );
        }

        return message;
    }

    // Obtenir les statistiques des bots
    getBotStats() {
        return Object.entries(this.bots).map(([key, bot]) => ({
            name: bot.name,
            avatar: bot.avatar,
            personality: bot.personality,
            role: bot.role,
            tone: bot.tone,
            messagesCount: bot.messageHistory.length
        }));
    }
}

// Instance globale
window.assistantBotManager = new AssistantBotManager();

// Écouter les événements de jeu pour les bots assistants
window.addEventListener('playerJoinedRoom', (e) => {
    window.assistantBotManager.handleGameEvent('player_joined', e.detail);
});

window.addEventListener('levelComplete', (e) => {
    window.assistantBotManager.handleGameEvent('level_complete', e.detail);
});

window.addEventListener('playerStruggling', (e) => {
    window.assistantBotManager.handleGameEvent('player_struggling', e.detail);
});

console.log('✅ Système de Bots Assistants initialisé - 4 personnalités prêtes !');
console.log('👥 Bots disponibles:', Object.keys(window.assistantBotManager.bots).join(', '));
console.log('📚 Citations bibliques:', typeof biblicalQuotes !== 'undefined' ? 'Chargées ✓' : 'Non disponibles');
console.log('💬 Messages existants:', typeof welcomeAI !== 'undefined' ? 'Intégrés ✓' : 'Non disponibles');

// Démarrer la rotation de tips/citations après 2 minutes (pour ne pas spammer au démarrage)
setTimeout(() => {
    window.assistantBotManager.startTipRotation(10); // Un message toutes les 10 minutes
}, 2 * 60 * 1000);
