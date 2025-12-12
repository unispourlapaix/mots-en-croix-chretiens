/**
 * Système de Tutorial Interactif avec Unisona
 * Guide le joueur lors du premier démarrage
 */

class TutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.tutorialCompleted = false;
        this.highlightedElements = [];
        
        // Étapes du tutorial
        this.steps = [
            {
                id: 'welcome',
                message: "Bienvenue ! Je suis Unisona 🤖✨ Cliquez sur une case de la grille pour commencer à jouer ! 📝",
                delay: 5000
            },
            {
                id: 'navigation',
                message: "Tapez au clavier pour remplir les cases. Utilisez Backspace pour effacer, les flèches ← → ↑ ↓ pour naviguer 🎯",
                delay: 5000
            },
            {
                id: 'hints',
                message: "Besoin d'aide ? Cliquez sur 💡 Indice pour révéler une lettre. Les indices sont sur la droite 👉",
                highlight: '#hintButton',
                delay: 5000
            },
            {
                id: 'complete',
                message: "Bon jeu ! N'hésitez pas à me demander de l'aide dans le chat 💬",
                action: () => this.completeTutorial(),
                delay: 3000
            }
        ];
    }

    async start() {
        // Vérifier si le tutorial a déjà été fait
        const completed = localStorage.getItem('tutorialCompleted');
        if (completed === 'true') {
            console.log('✅ Tutorial déjà complété');
            return;
        }

        this.isActive = true;
        this.currentStep = 0;

        console.log('🎓 Démarrage du tutorial interactif...');

        // Attendre que le jeu soit chargé
        await this.waitForGameReady();

        // Démarrer le tutorial
        await this.executeStep(0);
    }

    async waitForGameReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (window.game && window.simpleChatSystem && document.getElementById('crosswordGrid')) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }

    async executeStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.completeTutorial();
            return;
        }

        const step = this.steps[stepIndex];
        this.currentStep = stepIndex;

        // Retirer les highlights précédents
        this.clearHighlights();

        // Afficher le message d'Unisona dans le chat
        if (step.message && window.simpleChatSystem) {
            window.simpleChatSystem.showMessage(step.message, 'ai', 'Unisona');
        }

        // Ajouter le highlight si spécifié
        if (step.highlight) {
            this.highlightElement(step.highlight);
            
            // Retirer automatiquement le highlight après 3 secondes
            setTimeout(() => {
                this.clearHighlights();
            }, 3000);
        }

        // Exécuter l'action de l'étape
        if (step.action) {
            step.action();
        }

        // Passer automatiquement à l'étape suivante
        if (step.delay) {
            setTimeout(() => {
                this.nextStep();
            }, step.delay);
        }
    }

    nextStep() {
        if (!this.isActive) return;
        this.executeStep(this.currentStep + 1);
    }

    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        // Créer un overlay de highlight avec position fixed (pas de scroll-linked effect)
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight';
        
        // Fonction pour mettre à jour la position
        const updatePosition = () => {
            const rect = element.getBoundingClientRect();
            highlight.style.top = `${rect.top - 5}px`;
            highlight.style.left = `${rect.left - 5}px`;
            highlight.style.width = `${rect.width + 10}px`;
            highlight.style.height = `${rect.height + 10}px`;
        };
        
        highlight.style.cssText = `
            position: fixed;
            border: 3px solid #FFD700;
            border-radius: 8px;
            pointer-events: none;
            z-index: 9999;
            animation: pulse 2s ease-in-out infinite;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
            will-change: transform;
        `;

        // Position initiale
        updatePosition();
        
        // Utiliser ResizeObserver et scroll passif pour la performance
        const scrollHandler = () => {
            requestAnimationFrame(updatePosition);
        };
        
        const resizeObserver = new ResizeObserver(updatePosition);
        resizeObserver.observe(element);
        
        window.addEventListener('scroll', scrollHandler, { passive: true, capture: true });
        window.addEventListener('resize', scrollHandler, { passive: true });
        
        // Stocker les handlers pour le cleanup
        highlight._scrollHandler = scrollHandler;
        highlight._resizeObserver = resizeObserver;

        document.body.appendChild(highlight);
        this.highlightedElements.push(highlight);

        // Scroll vers l'élément
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    clearHighlights() {
        this.highlightedElements.forEach(el => {
            // Retirer les écouteurs
            if (el._scrollHandler) {
                window.removeEventListener('scroll', el._scrollHandler, { capture: true });
                window.removeEventListener('resize', el._scrollHandler);
            }
            if (el._resizeObserver) {
                el._resizeObserver.disconnect();
            }
            el.remove();
        });
        this.highlightedElements = [];
    }

    completeTutorial() {
        this.isActive = false;
        this.tutorialCompleted = true;
        this.clearHighlights();

        // Sauvegarder dans localStorage
        localStorage.setItem('tutorialCompleted', 'true');

        // Message final
        if (window.simpleChatSystem) {
            window.simpleChatSystem.showMessage(
                "🎊 Tutorial terminé ! Vous êtes maintenant prêt(e) à jouer. Amusez-vous bien ! 💖",
                'ai',
                'Unisona'
            );
        }

        console.log('✅ Tutorial complété et sauvegardé');
    }

    reset() {
        // Réinitialiser le tutorial (utile pour tester)
        localStorage.removeItem('tutorialCompleted');
        this.isActive = false;
        this.currentStep = 0;
        this.clearHighlights();
        console.log('🔄 Tutorial réinitialisé');
    }

    skip() {
        if (this.isActive) {
            this.completeTutorial();
            if (window.simpleChatSystem) {
                window.simpleChatSystem.showMessage(
                    "Tutorial ignoré. Tapez 'aide' dans le chat si vous avez besoin d'aide ! 💬",
                    'ai',
                    'Unisona'
                );
            }
        }
    }
}

// Créer l'instance globale
window.tutorialSystem = new TutorialSystem();

// Ajouter l'animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.05);
            opacity: 0.8;
        }
    }

    .tutorial-highlight {
        animation: pulse 2s ease-in-out infinite !important;
    }
`;
document.head.appendChild(style);

console.log('✅ Tutorial System chargé - Commandes disponibles:');
console.log('   tutorialSystem.start()  - Démarrer le tutorial');
console.log('   tutorialSystem.reset()  - Réinitialiser le tutorial');
console.log('   tutorialSystem.skip()   - Ignorer le tutorial');
