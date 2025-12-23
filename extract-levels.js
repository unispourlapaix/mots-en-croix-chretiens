// Script Node.js pour extraire les niveaux de gameData.js
const fs = require('fs');
const path = require('path');

// Charger gameData.js
const gameDataPath = path.join(__dirname, 'js', 'gameData.js');
const content = fs.readFileSync(gameDataPath, 'utf-8');

// Exécuter le contenu pour obtenir l'objet gameData
// On retire les exports et on évalue
const cleanContent = content
    .replace(/if \(typeof module.*?\n.*?\n.*?\n/g, '')
    .replace(/const gameDataManager.*$/s, '');

// Créer un contexte pour évaluer le code
eval(cleanContent);

// gameData est maintenant disponible

// Extraire les niveaux français
const frLevels = gameData.fr.levels;
console.log(`Trouve ${frLevels.length} niveaux francais`);

// Créer le fichier levels-fr.js
const frContent = `// Niveaux en français pour Mots En Croix Chrétiens
// ${frLevels.length} niveaux avec mots croisés chrétiens

const levelsFR = ${JSON.stringify(frLevels, null, 4)};

// Export pour utilisation modulaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = levelsFR;
}
`;

fs.writeFileSync(path.join(__dirname, 'js', 'levels', 'levels-fr.js'), frContent, 'utf-8');
console.log('OK - Fichier levels-fr.js cree avec ' + frLevels.length + ' niveaux');

// Extraire les niveaux espagnols si disponibles
if (gameData.es && gameData.es.levels) {
    const esLevels = gameData.es.levels;
    console.log(`Trouve ${esLevels.length} niveaux espagnols`);

    const esContent = `// Niveles en español para Mots En Croix Chrétiens
// ${esLevels.length} niveles con crucigramas cristianos

const levelsES = ${JSON.stringify(esLevels, null, 4)};

// Export para uso modular
if (typeof module !== 'undefined' && module.exports) {
    module.exports = levelsES;
}
`;

    fs.writeFileSync(path.join(__dirname, 'js', 'levels', 'levels-es.js'), esContent, 'utf-8');
    console.log('OK - Fichier levels-es.js cree avec ' + esLevels.length + ' niveaux');
}

console.log('Extraction terminee!');
