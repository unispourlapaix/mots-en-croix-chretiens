/**
 * Simulateur IA pour tester le système P2P et le chat
 * L'IA joue automatiquement et envoie des messages
 */

class AISimulator {
    constructor() {
        this.isActive = false;
        this.aiUsername = 'IA_Joueur';
        this.messages = [
            'Bonjour ! 👋',
            'Belle grille !',
            'J\'ai trouvé un mot 🎉',
            'Bravo pour ce niveau !',
            'C\'est un peu difficile 🤔',
            'Amen ! 🙏',
            'Gloire à Dieu ✨',
            'Que Dieu vous bénisse',
            'Belle partie !',
            'On continue ? 😊'
        ];
        this.messageInterval = null;
        this.playInterval = null;
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;

        console.log('🤖 IA Simulateur démarré');

        // Simuler la connexion à la room
        this.simulateJoinRoom();

        // Envoyer des messages aléatoires toutes les 8-15 secondes
        this.messageInterval = setInterval(() => {
            if (this.isActive) {
                this.sendRandomMessage();
            }
        }, Math.random() * 7000 + 8000); // 8-15 sec

        // Simuler des actions de jeu toutes les 5-10 secondes
        this.playInterval = setInterval(() => {
            if (this.isActive) {
                this.simulateGameAction();
            }
        }, Math.random() * 5000 + 5000); // 5-10 sec
    }

    stop() {
        this.isActive = false;
        if (this.messageInterval) {
            clearInterval(this.messageInterval);
            this.messageInterval = null;
        }
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
        console.log('🤖 IA Simulateur arrêté');
    }

    simulateJoinRoom() {
        // Simuler qu'un joueur IA a rejoint
        if (typeof simpleChatSystem !== 'undefined') {
            setTimeout(() => {
                simpleChatSystem.showMessage(`${this.aiUsername} a rejoint la partie`, 'system');
            }, 2000);
        }
    }

    sendRandomMessage() {
        if (typeof simpleChatSystem === 'undefined') return;

        const randomMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
        
        // Afficher le message comme s'il venait d'un autre joueur
        simpleChatSystem.showMessage(randomMessage, 'message', this.aiUsername);
        
        console.log(`🤖 IA: ${randomMessage}`);
    }

    simulateGameAction() {
        const actions = [
            '🤖 L\'IA cherche un mot...',
            '🤖 L\'IA vérifie ses réponses',
            '🤖 L\'IA a trouvé "FOI" !',
            '🤖 L\'IA a trouvé "AMOUR" !',
            '🤖 L\'IA utilise un indice',
            '🤖 L\'IA réfléchit...'
        ];

        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        console.log(randomAction);

        // 30% de chance d'envoyer un message de célébration après une action
        if (Math.random() < 0.3) {
            const celebrationMessages = ['Super ! 🎉', 'Excellent ! ✨', 'C\'est bon ! 👍', 'Trouvé ! 🎯'];
            const msg = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
            
            setTimeout(() => {
                if (this.isActive && typeof simpleChatSystem !== 'undefined') {
                    simpleChatSystem.showMessage(msg, 'message', this.aiUsername);
                }
            }, 1000);
        }
    }

    // Créer plusieurs IAs simultanées
    static startMultipleAI(count = 2) {
        const simulators = [];
        const aiNames = [
            'IA_Pierre', 'IA_Marie', 'IA_Jean', 'IA_Sophie', 
            'IA_Thomas', 'IA_Claire', 'IA_Paul', 'IA_Anne'
        ];

        for (let i = 0; i < count; i++) {
            const ai = new AISimulator();
            ai.aiUsername = aiNames[i] || `IA_Joueur${i + 1}`;
            
            // Délai aléatoire pour que les IAs ne démarrent pas toutes en même temps
            setTimeout(() => {
                ai.start();
            }, i * 3000);
            
            simulators.push(ai);
        }

        console.log(`🤖 ${count} IAs démarrées`);
        return simulators;
    }

    static stopAll(simulators) {
        simulators.forEach(ai => ai.stop());
        console.log('🤖 Toutes les IAs arrêtées');
    }
}

// Rendre accessible globalement
window.AISimulator = AISimulator;

// Démarrage automatique pour test
console.log(`
🤖 AI Simulator chargé!

Pour tester le chat:
1. window.testChat()           → Lance 2 IAs qui chattent
2. window.stopTestChat()       → Arrête le test

Commandes manuelles:
- window.aiTest = new AISimulator(); aiTest.start()
- window.aiTest.stop()
- window.aiTeam = AISimulator.startMultipleAI(3)
- AISimulator.stopAll(window.aiTeam)
`);

// Fonction de test automatique
window.testChat = function() {
    console.log('🎮 Démarrage du test chat avec 2 IAs...');
    
    // Afficher un message de bienvenue
    if (typeof simpleChatSystem !== 'undefined') {
        simpleChatSystem.showMessage('Test automatique démarré - 2 IAs vont chatter', 'system');
    }
    
    // Lancer 2 IAs
    window.chatTestAIs = AISimulator.startMultipleAI(2);
    
    console.log('✅ Test en cours - Les IAs chattent automatiquement');
    console.log('💡 Tapez window.stopTestChat() pour arrêter');
};

window.stopTestChat = function() {
    if (window.chatTestAIs) {
        AISimulator.stopAll(window.chatTestAIs);
        window.chatTestAIs = null;
        console.log('⏹️ Test arrêté');
        
        if (typeof simpleChatSystem !== 'undefined') {
            simpleChatSystem.showMessage('Test terminé', 'system');
        }
    } else {
        console.log('❌ Aucun test en cours');
    }
};
