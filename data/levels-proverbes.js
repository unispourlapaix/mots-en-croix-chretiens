/**
 * Mode Proverbes - 88 Proverbes bibliques et sagesse chrétienne
 * Extraits du livre des Proverbes et autres enseignements bibliques
 */

const levelsProverbes = [
    // 1-10: Sagesse et connaissance
    { number: 1, words: ["SAGESSE", "INTELLIGENCE"] },
    { number: 2, words: ["CONNAISSANCE", "DISCERNEMENT"] },
    { number: 3, words: ["ÉCOUTE", "CONSEIL"] },
    { number: 4, words: ["INSTRUCTION", "DISCIPLINE"] },
    { number: 5, words: ["PRUDENCE", "RÉFLEXION"] },
    { number: 6, words: ["JUSTICE", "DROITURE"] },
    { number: 7, words: ["VÉRITÉ", "FIDÉLITÉ"] },
    { number: 8, words: ["INTÉGRITÉ", "HONNÊTETÉ"] },
    { number: 9, words: ["CRAINTE", "RESPECT"] },
    { number: 10, words: ["COMPRÉHENSION", "ENTENDEMENT"] },

    // 11-20: Paroles et communication
    { number: 11, words: ["PAROLE", "LANGUE"] },
    { number: 12, words: ["SILENCE", "RETENUE"] },
    { number: 13, words: ["DOUCEUR", "APAISEMENT"] },
    { number: 14, words: ["CONSEIL", "AVIS"] },
    { number: 15, words: ["MÉDITATION", "PENSÉE"] },
    { number: 16, words: ["PRIÈRE", "SUPPLICATION"] },
    { number: 17, words: ["LOUANGE", "BÉNÉDICTION"] },
    { number: 18, words: ["GRATITUDE", "RECONNAISSANCE"] },
    { number: 19, words: ["CONFESSION", "AVEU"] },
    { number: 20, words: ["PROMESSE", "ENGAGEMENT"] },

    // 21-30: Travail et diligence
    { number: 21, words: ["DILIGENCE", "ARDEUR"] },
    { number: 22, words: ["TRAVAIL", "EFFORT"] },
    { number: 23, words: ["PERSÉVÉRANCE", "CONSTANCE"] },
    { number: 24, words: ["PATIENCE", "ENDURANCE"] },
    { number: 25, words: ["ZÈLE", "ÉNERGIE"] },
    { number: 26, words: ["EXCELLENCE", "QUALITÉ"] },
    { number: 27, words: ["FRUITS", "RÉCOLTE"] },
    { number: 28, words: ["PROSPÉRITÉ", "ABONDANCE"] },
    { number: 29, words: ["PROVISION", "RESSOURCE"] },
    { number: 30, words: ["BÉNÉDICTION", "FAVEUR"] },

    // 31-40: Relations humaines
    { number: 31, words: ["AMITIÉ", "COMPAGNON"] },
    { number: 32, words: ["FIDÉLITÉ", "LOYAUTÉ"] },
    { number: 33, words: ["COMPASSION", "BONTÉ"] },
    { number: 34, words: ["MISÉRICORDE", "PITIÉ"] },
    { number: 35, words: ["PARDON", "RÉCONCILIATION"] },
    { number: 36, words: ["GÉNÉROSITÉ", "LARGESSE"] },
    { number: 37, words: ["PARTAGE", "DON"] },
    { number: 38, words: ["HOSPITALITÉ", "ACCUEIL"] },
    { number: 39, words: ["ENTRAIDE", "SOLIDARITÉ"] },
    { number: 40, words: ["FRATERNITÉ", "COMMUNAUTÉ"] },

    // 41-50: Caractère moral
    { number: 41, words: ["HUMILITÉ", "MODESTIE"] },
    { number: 42, words: ["DOUCEUR", "GENTILLESSE"] },
    { number: 43, words: ["MAÎTRISE", "TEMPÉRANCE"] },
    { number: 44, words: ["SOBRIÉTÉ", "MODÉRATION"] },
    { number: 45, words: ["PURETÉ", "SAINTETÉ"] },
    { number: 46, words: ["INNOCENCE", "SIMPLICITÉ"] },
    { number: 47, words: ["DROITURE", "RECTITUDE"] },
    { number: 48, words: ["FERMETÉ", "SOLIDITÉ"] },
    { number: 49, words: ["COURAGE", "BRAVOURE"] },
    { number: 50, words: ["FORCE", "VIGUEUR"] },

    // 51-60: Famille et foyer
    { number: 51, words: ["FAMILLE", "MAISON"] },
    { number: 52, words: ["ÉPOUSE", "MARI"] },
    { number: 53, words: ["ENFANTS", "HÉRITAGE"] },
    { number: 54, words: ["ÉDUCATION", "ENSEIGNEMENT"] },
    { number: 55, words: ["CORRECTION", "GUIDANCE"] },
    { number: 56, words: ["AMOUR", "TENDRESSE"] },
    { number: 57, words: ["PROTECTION", "SÉCURITÉ"] },
    { number: 58, words: ["HONNEUR", "GLOIRE"] },
    { number: 59, words: ["RESPECT", "DIGNITÉ"] },
    { number: 60, words: ["HARMONIE", "PAIX"] },

    // 61-70: Richesse et pauvreté
    { number: 61, words: ["RICHESSE", "TRÉSOR"] },
    { number: 62, words: ["PAUVRETÉ", "BESOIN"] },
    { number: 63, words: ["CONTENTEMENT", "SATISFACTION"] },
    { number: 64, words: ["SUFFISANCE", "ÉQUILIBRE"] },
    { number: 65, words: ["HÉRITAGE", "PATRIMOINE"] },
    { number: 66, words: ["ÉCONOMIE", "GESTION"] },
    { number: 67, words: ["ÉPARGNE", "PRÉVOYANCE"] },
    { number: 68, words: ["INVESTISSEMENT", "PLACEMENT"] },
    { number: 69, words: ["JUSTICE", "ÉQUITÉ"] },
    { number: 70, words: ["REDISTRIBUTION", "PARTAGE"] },

    // 71-80: Avertissements et garde
    { number: 71, words: ["VIGILANCE", "ATTENTION"] },
    { number: 72, words: ["PRUDENCE", "PRÉCAUTION"] },
    { number: 73, words: ["DISCERNEMENT", "JUGEMENT"] },
    { number: 74, words: ["SOBRIÉTÉ", "LUCIDITÉ"] },
    { number: 75, words: ["RÉSISTANCE", "OPPOSITION"] },
    { number: 76, words: ["PROTECTION", "DÉFENSE"] },
    { number: 77, words: ["REFUGE", "ABRI"] },
    { number: 78, words: ["SÉCURITÉ", "SAUVEGARDE"] },
    { number: 79, words: ["DÉLIVRANCE", "LIBÉRATION"] },
    { number: 80, words: ["VICTOIRE", "TRIOMPHE"] },

    // 81-88: Vie et destinée
    { number: 81, words: ["VIE", "EXISTENCE"] },
    { number: 82, words: ["CHEMIN", "VOIE"] },
    { number: 83, words: ["DIRECTION", "ORIENTATION"] },
    { number: 84, words: ["DESTINÉE", "AVENIR"] },
    { number: 85, words: ["ESPÉRANCE", "ATTENTE"] },
    { number: 86, words: ["RÉCOMPENSE", "COURONNE"] },
    { number: 87, words: ["GLOIRE", "SPLENDEUR"] },
    { number: 88, words: ["ÉTERNITÉ", "ROYAUME"] }
];

// Export pour utilisation dans le jeu
if (typeof window !== 'undefined') {
    window.levelsProverbes = levelsProverbes;
}
