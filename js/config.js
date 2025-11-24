// Configuration globale du jeu
const config = {
    // Paramètres de la grille
    gridSize: 15, // Augmenté pour accommoder les mots plus longs
    cellSize: 32,
    cellSizeMobile: 28,
    
    // Paramètres du jeu
    maxEncouragingWords: 7,
    hintPenalty: 5,
    
    // Points par niveau
    basePointsMultiplier: 1,
    
    // Animation
    animationDelay: 0.3, // secondes entre chaque mot d'encouragement
    levelTransitionDelay: 2000, // millisecondes avant de démarrer le jeu
    
    // Langue par défaut
    defaultLanguage: 'fr',
    
    // Debug mode
    debug: false
};

// Pour les environnements ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}
