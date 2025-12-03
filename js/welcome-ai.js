/**
 * IA d'Accueil du Jeu - Assistante virtuelle qui accueille et guide les joueurs
 */

class WelcomeAI {
    constructor() {
        this.name = 'Sophie'; // Nom de l'IA
        this.hasWelcomed = false;
        this.tips = [
            "💡 Astuce : Commence par les mots les plus courts, ils sont souvent plus faciles !",
            "✨ N'oublie pas d'utiliser les indices si tu es bloqué (bouton 💡)",
            "🎯 Chaque niveau complété te rapporte des points bonus !",
            "💬 Tu peux inviter un ami à jouer avec toi via le chat en haut !",
            "🙏 Les mots sont inspirés de la Bible et de messages d'encouragement chrétiens",
            "⭐ Plus tu complètes de niveaux, plus tu débloques de médailles !",
            "🎮 Le code de ta partie s'affiche dans le menu Chat pour inviter des amis",
            "💝 Prends ton temps, ce jeu est fait pour te détendre et te bénir"
        ];
        this.welcomeMessages = [
            "Bienvenue dans Mots En Croix Chrétiens ! 🙏✨",
            "Je suis Sophie, ton assistante virtuelle 😊",
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
        if (this.hasWelcomed) return;
        
        // Attendre 3 secondes avant d'afficher le premier message (laisser le chat s'initialiser)
        setTimeout(() => {
            this.welcomeMessages.forEach((message, index) => {
                setTimeout(() => {
                    this.sendChatMessage(message, 'system');
                }, index * 2500); // 2.5 secondes entre chaque message
            });
            
            // Afficher un conseil après les messages de bienvenue
            setTimeout(() => {
                const randomTip = this.tips[Math.floor(Math.random() * this.tips.length)];
                this.sendChatMessage(randomTip, 'system');
            }, this.welcomeMessages.length * 2500 + 1500);
            
            this.hasWelcomed = true;
        }, 3000);
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
            // Ajouter l'emoji de Sophie pour les messages système de l'IA
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
}

// Instance globale
const welcomeAI = new WelcomeAI();

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Attendre que le chat soit initialisé
        setTimeout(() => welcomeAI.init(), 1500);
    });
} else {
    setTimeout(() => welcomeAI.init(), 1500);
}
