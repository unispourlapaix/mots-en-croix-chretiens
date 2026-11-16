const fs = require('fs');

// Utilitaires
function findBestCommonLetter(word1, word2) {
    const common = [];
    for (let i = 0; i < word1.length; i++) {
        for (let j = 0; j < word2.length; j++) {
            if (word1[i] === word2[j]) {
                common.push({ letter: word1[i], pos1: i, pos2: j });
            }
        }
    }
    if (common.length === 0) return null;
    
    let best = common[0];
    let bestScore = Infinity;
    for (const c of common) {
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

function generateHorizontalPath(row, startCol, length) {
    return Array.from({ length }, (_, i) => [row, startCol + i]);
}

function generateVerticalPath(startRow, col, length) {
    return Array.from({ length }, (_, i) => [startRow + i, col]);
}

function createCrosswordPaths(word1, word2) {
    const common = findBestCommonLetter(word1, word2);
    if (!common) {
        console.log(`  ⚠️  Pas de lettre commune: ${word1} × ${word2}`);
        return {
            word1: generateHorizontalPath(2, 1, word1.length),
            word2: generateVerticalPath(0, word1.length + 2, word2.length)
        };
    }
    const row1 = Math.max(common.pos2, 2);
    const col1Start = Math.max(2, 10 - Math.floor(word1.length / 2));
    const word1Path = generateHorizontalPath(row1, col1Start, word1.length);
    const intersectionCol = col1Start + common.pos1;
    const row2Start = row1 - common.pos2;
    const word2Path = generateVerticalPath(row2Start, intersectionCol, word2.length);
    console.log(`  ✓ ${word1} × ${word2} sur '${common.letter}'`);
    return { word1: word1Path, word2: word2Path };
}

function formatPath(path) {
    return `[${path.map(p => `[${p[0]},${p[1]}]`).join(', ')}]`;
}

// Liste manuelle des 122 niveaux
const levels = [
    ['EGALITE', 'RESPECT'], ['AMOUR', 'HONNEUR'], ['JESUS', 'UNITE'], ['ECOUTE', 'DIALOGUE'],
    ['PARTENAIRES', 'COMPLEMENTS'], ['CHEVALIER', 'REALISTE'], ['DEFAUTS', 'HUMAIN'], 
    ['DIGNITE', 'VALEUR'], ['PASOBJET', 'PERSONNE'], ['AUTONOMIE', 'IDENTITE'], 
    ['VOIX', 'DECISIONS'], ['INTELLIGENCE', 'SAGESSE'], ['SOCCUPER', 'RELACHE'],
    ['FORCE', 'TENIR'], ['PERSEVERANCE', 'RIRE'], ['INSATIABLE', 'SAGESSE'],
    ['PROTECTEUR', 'SERVITEUR'], ['MAMAN', 'PARTENAIRE'], ['IMMATURITE', 'ADULTE'],
    ['HUMILITE', 'DOUCEUR'], ['RUSES', 'DISCERNEMENT'], ['CONTROLE', 'LIBERTE'],
    ['VIOLENCE', 'TENDRESSE'], ['SACRIFICE', 'PATIENCE'], ['FIDELITE', 'VIGILANCE'],
    ['JALOUSIE', 'ISOLATION'], ['MATURITE', 'TEMPS'], ['CONFIANCE', 'ENGAGEMENT'],
    ['CONFLIT', 'RESOLUTION'], ['PARDON', 'LIMITES'], ['TRAHISON', 'GUERISON'],
    ['ADDICTION', 'AIDE'], ['MUTUALISATION', 'PARTAGE'], ['INDEPENDANCE', 'AUTONOMIE'],
    ['GESTION', 'SAGESSE'], ['SURENDETTER', 'PRUDENCE'], ['FINANCE', 'EQUILIBRE'],
    ['PARDONNER', 'PRECAUTIONS'], ['MENTEUR', 'VERITE'], ['DIVORCE', 'PROTECTION'],
    ['MANIPULATION', 'CHANTAGE'], ['ABUS', 'COURAGE'], ['SECOURS', 'REFUGE'],
    ['RECONSTRUCTION', 'ESPERANCE'], ['VRAIPARD ON', 'MEMOIRE'], ['RECONCILIATION', 'CHANGEMENT'],
    ['PATIENCE', 'VIGILANCE'], ['GRACE', 'JUSTICE'], ['RESPONSABILITE', 'CONSEQUENCES'],
    ['FAMILLE', 'AMOUR'], ['ENFANTS', 'EDUCATION'], ['EXEMPLE', 'MODELE'],
    ['EQUILIBRE', 'PRIORITES'], ['HERITAGE', 'VALEURS'], ['ATTENTION', 'PROACTIF'],
    ['ANTICIPER', 'PREVENANT'], ['VERITE', 'TRANSPARENCE'], ['EMPATHIE', 'COMPREHENSION'],
    ['SILENCE', 'PAROLE'], ['REPROCHE', 'APPRECIATION'], ['CRITIQUE', 'ENCOURAGEMENT'],
    ['CADEAUX', 'PRESENCE'], ['DOUCEUR', 'CONSTANCE'], ['INTIMITE', 'CONNEXION'],
    ['CONSENTEMENT', 'RESPECT'], ['DESIR', 'TENDRESSE'], ['PUDEUR', 'MYSTERE'],
    ['SEXUALITE', 'BONHEUR'], ['JARDIN', 'SECRET'], ['DESIRS', 'PLAISIR'],
    ['LIBERTE', 'MUTUEL'], ['COMPLICITE', 'PARTAGE'], ['EVOLUTION', 'ADAPTATION'],
    ['REVES', 'PROJETS'], ['INDEPENDANCE', 'INTERDEPENDANCE'], ['MATURITE', 'SAGESSE'],
    ['COMPROMIS', 'NEGOCIATION'], ['PRIERE', 'FOI'], ['DIEU', 'CHRIST'],
    ['BIBLE', 'VERITE'], ['ESPRIT', 'SAGESSE'], ['ADORATION', 'LOUANGE'],
    ['MATERIALISME', 'FONDATION'], ['BIENS', 'ESSENTIEL'], ['RESEAUX', 'TRANSPARENCE'],
    ['PORNOGRAPHIE', 'PURETE'], ['TRAVAIL', 'REPOS'], ['STRESS', 'SOUTIEN'],
    ['COMPARAISON', 'UNICITE'], ['APPRECIER', 'GRATITUDE'], ['APPARENCE', 'REALITE'],
    ['MALADIE', 'BONHEUR'], ['AIDANT', 'SACRIFICE'], ['EPREUVE', 'PRESENCE'],
    ['PERSEVERANCE', 'ENDURANCE'], ['COMBAT', 'VICTOIRE'], ['ESPOIR', 'RESILIENCE'],
    ['RENOUVEAU', 'FRAICHEUR'], ['CELEBRATION', 'GRATITUDE'], ['HERITAGE', 'GENERATIONS'],
    ['TEMOIGNAGE', 'LUMIERE'], ['MISSION', 'APPEL'], ['ETERNITE', 'CIEL'],
    ['TRANSFORMATION', 'BEAUTE'], ['ALLIANCE', 'ENGAGEMENT'], ['BENEDICTION', 'FAVEUR'],
    ['JOIE', 'PAIX'], ['PLÉNITUDE', 'ACCOMPLISSEMENT'], ['AMOUR', 'ETERNEL'],
    ['ROYAUME', 'GLOIRE'], ['ESPERANCE', 'CONFIANCE'], ['REDEMPTION', 'RESTAURATION'],
    ['NOUVELLE VIE', 'RECOMMENCEMENT'], ['AMEN', 'BÉNÉDICTION'], ['DOUCEUR', 'TENDRESSE'],
    ['GRATITUDE', 'RECONNAISSANCE'], ['SERVIR', 'HUMILITÉ'], ['RENOUVEAU', 'ESPOIR'],
    ['VICTOIRE', 'TRIOMPHE'], ['HÉRITAGE', 'TÉMOIGNAGE'], ['GLOIRE', 'LOUANGE'],
    ['PARCOURS', 'CHEMIN']
];

console.log(`📖 Traitement de ${levels.length} niveaux...\n`);

// Créer les remplacements
const replacements = [];
for (let i = 0; i < levels.length; i++) {
    const [word1, word2] = levels[i];
    console.log(`Niveau ${i + 1}:`);
    const paths = createCrosswordPaths(word1, word2);
    replacements.push({
        level: i + 1,
        word1,
        word2,
        newPath1: formatPath(paths.word1),
        newPath2: formatPath(paths.word2)
    });
}

fs.writeFileSync('replacements-simple.json', JSON.stringify(replacements, null, 2));
console.log(`\n✅ ${replacements.length} niveaux traités`);
console.log('📝 Remplacements sauvegardés dans: replacements-simple.json');
