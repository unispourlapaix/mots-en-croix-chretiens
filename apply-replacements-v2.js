const fs = require('fs');

// Lire les données
const replacements = JSON.parse(fs.readFileSync('replacements-simple.json', 'utf-8'));
let content = fs.readFileSync('js/coupleChretienData.js', 'utf-8');

console.log(`📖 Application de ${replacements.length} remplacements...\n`);

let successCount = 0;
let failCount = 0;

// Extraire tous les blocs de niveau
const levels = content.match(/\{\s*words:\s*\[[\s\S]*?\]\s*\}/g);

if (!levels || levels.length !== replacements.length) {
    console.log(`❌ Erreur: Trouvé ${levels?.length || 0} niveaux dans le fichier, attendu ${replacements.length}`);
    process.exit(1);
}

console.log(`✓ ${levels.length} niveaux trouvés\n`);

// Remplacer niveau par niveau
for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    const rep = replacements[i];
    const { word1, word2, newPath1, newPath2 } = rep;
    
    // Créer le nouveau bloc de niveau
    let newLevel = level;
    
    // Remplacer le path du word1
    const pathRegex1 = new RegExp(
        `(word:\\s*"${word1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",\\s*clue:\\s*"[^"]*",\\s*path:\\s*)\\[\\[[^\\]]*\\](?:[^\\]]+\\])*`,
        ''
    );
    
    newLevel = newLevel.replace(pathRegex1, `$1${newPath1}`);
    
    // Remplacer le path du word2
    const pathRegex2 = new RegExp(
        `(word:\\s*"${word2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",\\s*clue:\\s*"[^"]*",\\s*path:\\s*)\\[\\[[^\\]]*\\](?:[^\\]]+\\])*`,
        ''
    );
    
    newLevel = newLevel.replace(pathRegex2, `$1${newPath2}`);
    
    // Remplacer dans le contenu principal
    content = content.replace(level, newLevel);
    
    console.log(`✓ Niveau ${i + 1}: ${word1} × ${word2}`);
    successCount++;
}

// Sauvegarder le fichier modifié
fs.writeFileSync('js/coupleChretienData.js', content, 'utf-8');

console.log(`\n✅ Traitement terminé:`);
console.log(`   - Succès: ${successCount} niveaux`);
console.log(`   - Échecs: ${failCount} niveaux`);
console.log('\n📝 Fichier mis à jour: js/coupleChretienData.js');
