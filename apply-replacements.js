const fs = require('fs');

// Lire les données
const replacements = JSON.parse(fs.readFileSync('replacements-simple.json', 'utf-8'));
let content = fs.readFileSync('js/coupleChretienData.js', 'utf-8');

console.log(`📖 Application de ${replacements.length} remplacements...\n`);

let successCount = 0;
let failCount = 0;

for (const rep of replacements) {
    const { level, word1, word2, newPath1, newPath2 } = rep;
    
    try {
        // Créer un pattern regex pour trouver et remplacer le path du word1
        // Pattern: word: "WORD1", clue: "...", path: [[...]]
        const regex1 = new RegExp(
            `(word:\\s*"${word1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",\\s*clue:\\s*"[^"]*",\\s*path:\\s*)\\[\\[[^\\]]*\\][^\\]]*\\]`,
            'g'
        );
        
        const beforeWord1 = content;
        content = content.replace(regex1, `$1${newPath1}`);
        
        if (content === beforeWord1) {
            console.log(`❌ Niveau ${level}: Échec remplacement ${word1}`);
            failCount++;
            continue;
        }
        
        // Même chose pour word2
        const regex2 = new RegExp(
            `(word:\\s*"${word2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",\\s*clue:\\s*"[^"]*",\\s*path:\\s*)\\[\\[[^\\]]*\\][^\\]]*\\]`,
            'g'
        );
        
        const beforeWord2 = content;
        content = content.replace(regex2, `$1${newPath2}`);
        
        if (content === beforeWord2) {
            console.log(`❌ Niveau ${level}: Échec remplacement ${word2}`);
            failCount++;
            continue;
        }
        
        console.log(`✓ Niveau ${level}: ${word1} × ${word2}`);
        successCount++;
        
    } catch (error) {
        console.log(`❌ Niveau ${level}: Erreur - ${error.message}`);
        failCount++;
    }
}

// Sauvegarder le fichier modifié
fs.writeFileSync('js/coupleChretienData.js', content, 'utf-8');

console.log(`\n✅ Traitement terminé:`);
console.log(`   - Succès: ${successCount} niveaux`);
console.log(`   - Échecs: ${failCount} niveaux`);
console.log('\n📝 Fichier mis à jour: js/coupleChretienData.js');
