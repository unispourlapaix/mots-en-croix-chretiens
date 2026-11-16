const fs = require('fs');

// Lire les remplacements
const replacements = JSON.parse(fs.readFileSync('replacements-simple.json', 'utf-8'));
const originalContent = fs.readFileSync('js/coupleChretienData.js', 'utf-8');

console.log(`📖 Application de ${replacements.length} remplacements...\n`);

// Préparer les instructions multi_replace
const multiReplace = [];

for (const replacement of replacements) {
    const { level, word1, word2, newPath1, newPath2 } = replacement;
    
    // Trouver l'ancien bloc de niveau dans le fichier
    // On cherche le pattern: word: "WORD1",...path: [[...]]...word: "WORD2",...path: [[...]]
    
    // Pattern pour trouver le bloc complet du niveau
    const wordPattern1 = `word: "${word1}"`;
    const wordPattern2 = `word: "${word2}"`;
    
    // Trouver les positions
    let startIdx = originalContent.indexOf(wordPattern1);
    
    if (startIdx === -1) {
        console.log(`❌ Niveau ${level}: Impossible de trouver "${word1}"`);
        continue;
    }
    
    // Trouver le path de word1
    const pathStart1 = originalContent.indexOf('path: ', startIdx);
    const pathEnd1 = originalContent.indexOf(']', pathStart1);
    let bracketCount = 1;
    let pathEndActual1 = pathStart1 + 6; // Après 'path: '
    
    while (bracketCount > 0 && pathEndActual1 < originalContent.length) {
        if (originalContent[pathEndActual1] === '[') bracketCount++;
        if (originalContent[pathEndActual1] === ']') bracketCount--;
        pathEndActual1++;
    }
    
    const oldPath1 = originalContent.substring(pathStart1 + 6, pathEndActual1).trim();
    
    // Trouver word2
    const startIdx2 = originalContent.indexOf(wordPattern2, pathEndActual1);
    
    if (startIdx2 === -1) {
        console.log(`❌ Niveau ${level}: Impossible de trouver "${word2}"`);
        continue;
    }
    
    // Trouver le path de word2
    const pathStart2 = originalContent.indexOf('path: ', startIdx2);
    let bracketCount2 = 1;
    let pathEndActual2 = pathStart2 + 6;
    
    while (bracketCount2 > 0 && pathEndActual2 < originalContent.length) {
        if (originalContent[pathEndActual2] === '[') bracketCount2++;
        if (originalContent[pathEndActual2] === ']') bracketCount2--;
        pathEndActual2++;
    }
    
    const oldPath2 = originalContent.substring(pathStart2 + 6, pathEndActual2).trim();
    
    // Créer les remplacements avec contexte
    const context1Start = Math.max(0, pathStart1 - 100);
    const context1End = Math.min(originalContent.length, pathEndActual1 + 50);
    const oldString1 = originalContent.substring(context1Start, context1End);
    const newString1 = oldString1.replace(oldPath1, newPath1);
    
    const context2Start = Math.max(0, pathStart2 - 100);
    const context2End = Math.min(originalContent.length, pathEndActual2 + 50);
    const oldString2 = originalContent.substring(context2Start, context2End);
    const newString2 = oldString2.replace(oldPath2, newPath2);
    
    multiReplace.push({
        oldPath1,
        newPath1,
        oldPath2,
        newPath2,
        oldString1,
        newString1,
        oldString2,
        newString2
    });
    
    console.log(`✓ Niveau ${level}: ${word1} × ${word2}`);
}

// Sauvegarder les instructions
fs.writeFileSync('multi-replace-instructions.json', JSON.stringify(multiReplace, null, 2));

console.log(`\n✅ ${multiReplace.length} remplacements préparés`);
console.log('📝 Instructions sauvegardées dans: multi-replace-instructions.json');
console.log('\nPour appliquer: Utilisez ces instructions avec multi_replace_string_in_file');
