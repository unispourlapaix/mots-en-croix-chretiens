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

// Charger les données en les évaluant (attention: méthode simple pour ce cas)
const coupleChretienData = eval('(' + content.split('const coupleChretienData = ')[1].split(';\n\n// Rendre')[0] + ')');

console.log(`\n🔍 Analyse de ${coupleChretienData.levels.length} niveaux...\n`);

// Préparer les remplacements
const replacements = [];

coupleChretienData.levels.forEach((level, index) => {
    const levelNum = index + 1;
    const word1 = level.words[0].word;
    const word2 = level.words[1].word;
    
    console.log(`Niveau ${levelNum}: ${word1} × ${word2}`);
    
    // Créer les nouveaux chemins
    const paths = createCrosswordPaths(word1, word2);
    
    // Sauvegarder le remplacement
    replacements.push({
        level: levelNum,
        word1: {
            word: word1,
            oldPath: formatPath(level.words[0].path),
            newPath: formatPath(paths.word1)
        },
        word2: {
            word: word2,
            oldPath: formatPath(level.words[1].path),
            newPath: formatPath(paths.word2)
        }
    });
});

// Sauvegarder les remplacements
fs.writeFileSync('crossword-replacements.json', JSON.stringify(replacements, null, 2));

console.log(`\n✅ Analyse terminée: ${replacements.length} niveaux à corriger`);
console.log('\n📝 Remplacements sauvegardés dans crossword-replacements.json');
