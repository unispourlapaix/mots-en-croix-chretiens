// Configuration globale du jeu
const config = {
    // Identification du jeu
    gamePrefix: 'mots-en-croix-chretiens',
    gameName: 'Mots En Croix Chrétiens',
    
    // Paramètres de la grille
    gridSize: 10, // Grille compacte 10x10 avec mots coudés
    cellSize: 35,
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
    debug: false,
    enableLogs: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' // Activer automatiquement les logs en localhost
};

// Remplacer console.log par une version conditionnelle
if (!config.enableLogs) {
    const noop = () => {};
    window.console.log = noop;
    window.console.debug = noop;
} else {
    console.log('🔍 Mode DEBUG activé - Logs console actifs');
    console.log('🌐 Environnement:', window.location.hostname);
}

// Pour les environnements ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}
