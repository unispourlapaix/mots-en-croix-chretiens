/**
 * Mode Sagesse - 88 Sagesses divines pour mieux vivre
 * Valeurs chrétiennes: espoir, persévérance, pardon, inclusion, amour, etc.
 */

const levelsSagesse = [
    // 1-10: Vertus fondamentales
    { number: 1, words: ["AMOUR", "ESPOIR"] },
    { number: 2, words: ["PAIX", "JOIE"] },
    { number: 3, words: ["FOI", "GRACE"] },
    { number: 4, words: ["ESPÉRANCE", "VIE"] },
    { number: 5, words: ["PARDON", "MISÉRICORDE"] },
    { number: 6, words: ["HUMILITÉ", "DOUCEUR"] },
    { number: 7, words: ["PATIENCE", "BONTÉ"] },
    { number: 8, words: ["SAGESSE", "VÉRITÉ"] },
    { number: 9, words: ["JUSTICE", "ÉQUITÉ"] },
    { number: 10, words: ["CHARITÉ", "DON"] },

    // 11-20: Pratiques spirituelles
    { number: 11, words: ["PRIÈRE", "LOUANGE"] },
    { number: 12, words: ["MÉDITATION", "SILENCE"] },
    { number: 13, words: ["JEÛNE", "DISCIPLINE"] },
    { number: 14, words: ["ADORATION", "GLOIRE"] },
    { number: 15, words: ["GRATITUDE", "MERCI"] },
    { number: 16, words: ["CONFESSION", "REPENTANCE"] },
    { number: 17, words: ["COMMUNION", "PARTAGE"] },
    { number: 18, words: ["SERVICE", "AIDE"] },
    { number: 19, words: ["TÉMOIGNAGE", "PAROLE"] },
    { number: 20, words: ["ÉVANGILE", "MESSAGE"] },

    // 21-30: Relations et communauté
    { number: 21, words: ["FRATERNITÉ", "UNITÉ"] },
    { number: 22, words: ["COMPASSION", "EMPATHIE"] },
    { number: 23, words: ["INCLUSION", "ACCUEIL"] },
    { number: 24, words: ["RESPECT", "DIGNITÉ"] },
    { number: 25, words: ["ÉCOUTE", "ATTENTION"] },
    { number: 26, words: ["DIALOGUE", "ÉCHANGE"] },
    { number: 27, words: ["RÉCONCILIATION", "PAIX"] },
    { number: 28, words: ["SOLIDARITÉ", "ENTRAIDE"] },
    { number: 29, words: ["GÉNÉROSITÉ", "LARGESSE"] },
    { number: 30, words: ["HOSPITALITÉ", "OUVERTURE"] },

    // 31-40: Croissance personnelle
    { number: 31, words: ["PERSÉVÉRANCE", "COURAGE"] },
    { number: 32, words: ["RÉSILIENCE", "FORCE"] },
    { number: 33, words: ["CONFIANCE", "ASSURANCE"] },
    { number: 34, words: ["AUTHENTICITÉ", "SINCÉRITÉ"] },
    { number: 35, words: ["INTÉGRITÉ", "HONNÊTETÉ"] },
    { number: 36, words: ["RESPONSABILITÉ", "ENGAGEMENT"] },
    { number: 37, words: ["DISCERNEMENT", "PRUDENCE"] },
    { number: 38, words: ["CRÉATIVITÉ", "INNOVATION"] },
    { number: 39, words: ["EXCELLENCE", "QUALITÉ"] },
    { number: 40, words: ["SIMPLICITÉ", "SOBRIÉTÉ"] },

    // 41-50: Fruits de l'Esprit
    { number: 41, words: ["BIENVEILLANCE", "TENDRESSE"] },
    { number: 42, words: ["FIDÉLITÉ", "LOYAUTÉ"] },
    { number: 43, words: ["DOUCEUR", "GENTILLESSE"] },
    { number: 44, words: ["MAÎTRISE", "TEMPÉRANCE"] },
    { number: 45, words: ["SÉRÉNITÉ", "CALME"] },
    { number: 46, words: ["HARMONIE", "ÉQUILIBRE"] },
    { number: 47, words: ["ALLÉGRESSE", "BONHEUR"] },
    { number: 48, words: ["CONTENTEMENT", "SATISFACTION"] },
    { number: 49, words: ["LIBERTÉ", "DÉLIVRANCE"] },
    { number: 50, words: ["PLÉNITUDE", "ABONDANCE"] },

    // 51-60: Actions et engagements
    { number: 51, words: ["PARTAGE", "DISTRIBUTION"] },
    { number: 52, words: ["PROTECTION", "DÉFENSE"] },
    { number: 53, words: ["GUÉRISON", "RESTAURATION"] },
    { number: 54, words: ["TRANSFORMATION", "CHANGEMENT"] },
    { number: 55, words: ["INNOVATION", "RENOUVEAU"] },
    { number: 56, words: ["CONSTRUCTION", "ÉDIFICATION"] },
    { number: 57, words: ["CROISSANCE", "PROGRÈS"] },
    { number: 58, words: ["ÉVOLUTION", "DÉVELOPPEMENT"] },
    { number: 59, words: ["ENGAGEMENT", "DÉVOUEMENT"] },
    { number: 60, words: ["SACRIFICE", "OFFRANDE"] },

    // 61-70: Valeurs sociales
    { number: 61, words: ["ÉGALITÉ", "PARITÉ"] },
    { number: 62, words: ["TOLÉRANCE", "ACCEPTATION"] },
    { number: 63, words: ["DIVERSITÉ", "PLURALITÉ"] },
    { number: 64, words: ["COLLABORATION", "COOPÉRATION"] },
    { number: 65, words: ["AUTONOMIE", "INDÉPENDANCE"] },
    { number: 66, words: ["ÉMANCIPATION", "LIBÉRATION"] },
    { number: 67, words: ["DIGNITÉ", "NOBLESSE"] },
    { number: 68, words: ["CITOYENNETÉ", "CIVISME"] },
    { number: 69, words: ["ÉCOLOGIE", "NATURE"] },
    { number: 70, words: ["PRÉSERVATION", "CONSERVATION"] },

    // 71-80: Sagesse spirituelle
    { number: 71, words: ["ILLUMINATION", "RÉVÉLATION"] },
    { number: 72, words: ["CONTEMPLATION", "RÉFLEXION"] },
    { number: 73, words: ["DISCERNEMENT", "CLAIRVOYANCE"] },
    { number: 74, words: ["INTUITION", "INSPIRATION"] },
    { number: 75, words: ["PROPHÉTIE", "VISION"] },
    { number: 76, words: ["MIRACLE", "PRODIGE"] },
    { number: 77, words: ["BÉNÉDICTION", "FAVEUR"] },
    { number: 78, words: ["PROVIDENCE", "SOIN"] },
    { number: 79, words: ["RÉSURRECTION", "RENAISSANCE"] },
    { number: 80, words: ["RÉDEMPTION", "SALUT"] },

    // 81-88: Espérance et éternité
    { number: 81, words: ["ESPÉRANCE", "ATTENTE"] },
    { number: 82, words: ["PROMESSE", "ALLIANCE"] },
    { number: 83, words: ["HÉRITAGE", "PATRIMOINE"] },
    { number: 84, words: ["GLOIRE", "SPLENDEUR"] },
    { number: 85, words: ["ÉTERNITÉ", "INFINI"] },
    { number: 86, words: ["ROYAUME", "RÈGNE"] },
    { number: 87, words: ["VICTOIRE", "TRIOMPHE"] },
    { number: 88, words: ["PERFECTION", "ACCOMPLISSEMENT"] }
];

// Export pour utilisation dans le jeu
if (typeof window !== 'undefined') {
    window.levelsSagesse = levelsSagesse;
}
