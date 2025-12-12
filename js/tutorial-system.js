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
                message: "Bienvenue ! Je suis Unisona 🤖✨ Je vais vous guider pour vos premiers pas ! Prêt(e) ?",
                action: () => this.showWelcome(),
                waitForUser: true
            },
            {
                id: 'grid',
                message: "Voici la grille de mots croisés ! Cliquez sur une case pour commencer à écrire 📝",
                highlight: '#crosswordGrid',
                action: () => this.waitForCellClick(),
                waitForUser: true
            },
            {
                id: 'typing',
                message: "Parfait ! Tapez une lettre au clavier. Pas besoin de cliquer dans la case, tapez directement ⌨️",
                action: () => this.waitForLetterInput(),
                waitForUser: true
            },
            {
                id: 'navigation',
                message: "Super ! Le curseur avance automatiquement. Utilisez Backspace pour effacer, les flèches ← → ↑ ↓ pour vous déplacer 🎯",
                action: () => this.showNavigation(),
                delay: 3000
            },
            {
                id: 'clues',
                message: "Les indices sont affichés ici 👇 Horizontal → et Vertical ↓. Chaque mot a son numéro.",
                highlight: '.clues-container',
                delay: 3000
            },
            {
                id: 'intersection',
                message: "ASTUCE : Aux intersections avec lettres différentes, vous verrez deux lettres séparées par une diagonale. Appuyez sur TAB pour changer de direction ! 🔄",
                highlight: '.intersection-cell',
                delay: 4000
            },
            {
                id: 'modes',
                message: "3 modes de jeu : 👫 Couple (vertical bleu), 🎯 Normal, 🏁 Course. Changez-les ici !",
                highlight: '.mode-switcher',
                delay: 3000
            },
            {
                id: 'hints',
                message: "Besoin d'aide ? Cliquez sur 💡 Indice pour révéler une lettre. Mais attention, ça réduit votre score ! 😉",
                highlight: '#hintButton',
                delay: 3000
            },
            {
                id: 'multiplayer',
                message: "Vous pouvez aussi jouer en multijoueur ! Créez une salle ou rejoignez des amis pour des courses de mots croisés 🏃‍♂️💨",
                highlight: '#roomButton',
                delay: 3000
            },
            {
                id: 'complete',
                message: "Voilà ! Vous savez tout 🎉 Bon jeu, et n'hésitez pas à me demander de l'aide dans le chat ! 💬",
                action: () => this.completeTutorial(),
                delay: 2000
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

        // Si l'étape ne nécessite pas d'attendre l'utilisateur, passer à la suivante après le délai
        if (!step.waitForUser && step.delay) {
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

    showWelcome() {
        // Attendre que l'utilisateur réponde dans le chat ou clique sur "Continuer"
        // Pour simplifier, on passe automatiquement après 5 secondes
        setTimeout(() => {
            this.nextStep();
        }, 5000);
    }

    waitForCellClick() {
        const grid = document.getElementById('crosswordGrid');
        if (!grid) {
            this.nextStep();
            return;
        }

        const handler = (e) => {
            const cell = e.target.closest('.cell:not(.blocked)');
            if (cell) {
                grid.removeEventListener('click', handler);
                setTimeout(() => {
                    this.nextStep();
                }, 500);
            }
        };

        grid.addEventListener('click', handler);
    }

    waitForLetterInput() {
        const handler = (e) => {
            if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                document.removeEventListener('keydown', handler);
                setTimeout(() => {
                    this.nextStep();
                }, 1000);
            }
        };

        document.addEventListener('keydown', handler);
    }

    showNavigation() {
        // Juste montrer, pas d'interaction requise
        // L'étape suivante se déclenchera automatiquement
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
