// Configuration globale du jeu
const config = {
    // Paramètres de la grille
    gridSize: 10,
    cellSize: 40,
    cellSizeMobile: 30,
    
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
