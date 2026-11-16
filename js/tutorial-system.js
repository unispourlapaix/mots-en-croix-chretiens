/**
 * Système de Tutorial Unisona - via Chat
 * Se déclenche après l'intro (7 clics), guide via le chat
 */

class TutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.tutorialCompleted = false;
        this.highlightedElements = [];
        
        // Étapes du tutorial (via chat Unisona)
        this.steps = [
            {
                id: 'welcome',
                message: "Super ! 🎮 Maintenant clique sur une case de la grille pour commencer à écrire 📝",
                highlight: '#crosswordGrid',
                delay: 4000
            },
            {
                id: 'clues',
                message: "Les indices sont affichés ici 👇 Horizontal → et Vertical ↓. Lis-les pour savoir quoi écrire !",
                highlight: '.clues-container',
                delay: 4000
            },
            {
                id: 'hints',
                message: "Besoin d'aide ? Clique sur 💡 Indice pour révéler une lettre (mais ça réduit ton score !) 😉",
                highlight: '#hintButton',
                delay: 4000
            },
            {
                id: 'complete',
                message: "Voilà ! Tu sais tout maintenant ! 🎉 Amuse-toi bien et n'hésite pas à me parler dans le chat ! 💬",
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

        console.log('🎓 Démarrage du tutorial Unisona...');

        // Démarrer directement (la grille est déjà visible)
        await this.executeStep(0);
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

        // Passer à l'étape suivante après le délai
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

        // Créer un overlay de highlight avec position fixed
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

        console.log('✅ Tutorial Unisona complété');
    }

    reset() {
        // Réinitialiser le tutorial
        localStorage.removeItem('tutorialCompleted');
        this.isActive = false;
        this.currentStep = 0;
        this.clearHighlights();
        console.log('🔄 Tutorial réinitialisé');
    }

    skip() {
        if (this.isActive) {
            this.completeTutorial();
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
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);
