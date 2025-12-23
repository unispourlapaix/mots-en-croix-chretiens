const fs = require('fs');

// Fonction pour trouver toutes les lettres communes
function findCommonLetters(word1, word2) {
    const common = [];
    for (let i = 0; i < word1.length; i++) {
        for (let j = 0; j < word2.length; j++) {
            if (word1[i] === word2[j]) {
                common.push({ letter: word1[i], pos1: i, pos2: j });
            }
        }
    }
    return common;
}

// Fonction pour trouver la meilleure lettre commune
function findBestCommonLetter(word1, word2) {
    const commons = findCommonLetters(word1, word2);
    if (commons.length === 0) return null;
    
    // Préférer une lettre au milieu pour un meilleur équilibre
    let best = null;
    let bestScore = Infinity;
    
    for (const c of commons) {
        const mid1 = word1.length / 2;
        const mid2 = word2.length / 2;
        const score = Math.abs(c.pos1 - mid1) + Math.abs(c.pos2 - mid2);
        
        if (score < bestScore) {
            bestScore = score;
            best = c;
        }
    }
    
    return best;
}

// Génère un chemin horizontal
function generateHorizontalPath(row, startCol, length) {
    return Array.from({ length }, (_, i) => [row, startCol + i]);
}

// Génère un chemin vertical
function generateVerticalPath(startRow, col, length) {
    return Array.from({ length }, (_, i) => [startRow + i, col]);
}

// Crée les chemins pour un croisement
function createCrosswordPaths(word1, word2) {
    const common = findBestCommonLetter(word1, word2);
    
    if (!common) {
        console.log(`  ⚠️  Aucune lettre commune entre '${word1}' et '${word2}'`);
        return {
            word1: generateHorizontalPath(2, 1, word1.length),
            word2: generateVerticalPath(0, word1.length + 2, word2.length)
        };
    }
    
    // Place le mot 1 horizontalement
    const row1 = Math.max(common.pos2, 2);
    const col1Start = Math.max(2, 10 - Math.floor(word1.length / 2));
    const word1Path = generateHorizontalPath(row1, col1Start, word1.length);
    
    // Place le mot 2 verticalement pour croiser
    const intersectionCol = col1Start + common.pos1;
    const row2Start = row1 - common.pos2;
    const word2Path = generateVerticalPath(row2Start, intersectionCol, word2.length);
    
    console.log(`  ✓ '${word1}' et '${word2}' croisés sur '${common.letter}' à [${row1},${intersectionCol}]`);
    
    return { word1: word1Path, word2: word2Path };
}

// Formater un path
function formatPath(path) {
    return `[${path.map(p => `[${p[0]},${p[1]}]`).join(', ')}]`;
}

// Lire le fichier
console.log('📖 Lecture du fichier coupleChretienData.js...');
const content = fs.readFileSync('js/coupleChretienData.js', 'utf-8');

console.log('\n🔍 Extraction des niveaux...');

// Extraire tous les blocs de niveau avec regex
const levelRegex = /\{\s*words:\s*\[\s*\{[^}]*word:\s*"([^"]+)"[^}]*path:\s*(\[[^\]]*\][^\]]*\])[^}]*\},\s*\{[^}]*word:\s*"([^"]+)"[^}]*path:\s*(\[[^\]]*\][^\]]*\])[^}]*\}\s*\]\s*\}/gs;

const matches = [...content.matchAll(levelRegex)];
console.log(`Trouvé ${matches.length} niveaux\n`);

const replacements = [];
let newContent = content;

matches.forEach((match, index) => {
    const levelNum = index + 1;
    const fullMatch = match[0];
    const word1 = match[1];
    const path1 = match[2];
    const word2 = match[3];
    const path2 = match[4];
    
    console.log(`Niveau ${levelNum}: ${word1} × ${word2}`);
    
    // Créer les nouveaux chemins
    const paths = createCrosswordPaths(word1, word2);
    
    // Formater les nouveaux chemins
    const newPath1 = formatPath(paths.word1);
    const newPath2 = formatPath(paths.word2);
    
    // Créer le nouveau bloc complet
    let newBlock = fullMatch
        .replace(path1, newPath1)
        .replace(path2, newPath2);
    
    // Remplacer dans le contenu
    newContent = newContent.replace(fullMatch, newBlock);
    
    // Sauvegarder le remplacement pour le rapport
    replacements.push({
        level: levelNum,
        word1,
        word2,
        oldPath1: path1,
        newPath1,
        oldPath2: path2,
        newPath2
    });
});

// Sauvegarder le nouveau fichier
fs.writeFileSync('js/coupleChretienData.js', newContent, 'utf-8');

// Sauvegarder les remplacements pour référence
fs.writeFileSync('crossword-replacements.json', JSON.stringify(replacements, null, 2));

console.log(`\n✅ Traitement terminé: ${replacements.length} niveaux corrigés`);
console.log('\n📝 Fichier mis à jour: js/coupleChretienData.js');
console.log('📝 Rapport sauvegardé dans: crossword-replacements.json');
