/**
 * Mode Disciple - Le cheminement vers l'amour vrai
 * 88 mots caractérisant le parcours du disciple chrétien
 */

const levelsDisciple = [
    // 1-10: Appel et conversion
    { number: 1, words: ["APPEL", "RÉPONSE"] },
    { number: 2, words: ["CONVERSION", "TRANSFORMATION"] },
    { number: 3, words: ["REPENTANCE", "RENOUVEAU"] },
    { number: 4, words: ["NAISSANCE", "RÉGÉNÉRATION"] },
    { number: 5, words: ["ABANDON", "CONSÉCRATION"] },
    { number: 6, words: ["RENONCEMENT", "SACRIFICE"] },
    { number: 7, words: ["SOUMISSION", "OBÉISSANCE"] },
    { number: 8, words: ["ENGAGEMENT", "DÉVOUEMENT"] },
    { number: 9, words: ["DÉVOTION", "FIDÉLITÉ"] },
    { number: 10, words: ["ALLIANCE", "PROMESSE"] },

    // 11-20: Foi et confiance
    { number: 11, words: ["FOI", "CONFIANCE"] },
    { number: 12, words: ["CROYANCE", "CONVICTION"] },
    { number: 13, words: ["CERTITUDE", "ASSURANCE"] },
    { number: 14, words: ["ESPÉRANCE", "ATTENTE"] },
    { number: 15, words: ["PATIENCE", "PERSÉVÉRANCE"] },
    { number: 16, words: ["ENDURANCE", "FERMETÉ"] },
    { number: 17, words: ["COURAGE", "BRAVOURE"] },
    { number: 18, words: ["FORCE", "PUISSANCE"] },
    { number: 19, words: ["VICTOIRE", "TRIOMPHE"] },
    { number: 20, words: ["CONQUÊTE", "DÉLIVRANCE"] },

    // 21-30: Relation avec Dieu
    { number: 21, words: ["INTIMITÉ", "COMMUNION"] },
    { number: 22, words: ["PRÉSENCE", "PROXIMITÉ"] },
    { number: 23, words: ["ADORATION", "LOUANGE"] },
    { number: 24, words: ["PRIÈRE", "INTERCESSION"] },
    { number: 25, words: ["MÉDITATION", "CONTEMPLATION"] },
    { number: 26, words: ["ÉCOUTE", "RÉVÉLATION"] },
    { number: 27, words: ["SILENCE", "RECUEILLEMENT"] },
    { number: 28, words: ["GRATITUDE", "RECONNAISSANCE"] },
    { number: 29, words: ["ÉMERVEILLEMENT", "JOIE"] },
    { number: 30, words: ["PAIX", "SÉRÉNITÉ"] },

    // 31-40: Croissance spirituelle
    { number: 31, words: ["CROISSANCE", "MATURITÉ"] },
    { number: 32, words: ["DÉVELOPPEMENT", "PROGRÈS"] },
    { number: 33, words: ["APPRENTISSAGE", "FORMATION"] },
    { number: 34, words: ["DISCIPLINE", "ENTRAÎNEMENT"] },
    { number: 35, words: ["SANCTIFICATION", "PURIFICATION"] },
    { number: 36, words: ["TRANSFORMATION", "MÉTAMORPHOSE"] },
    { number: 37, words: ["RENOUVELLEMENT", "RAFRAÎCHISSEMENT"] },
    { number: 38, words: ["ILLUMINATION", "COMPRÉHENSION"] },
    { number: 39, words: ["SAGESSE", "DISCERNEMENT"] },
    { number: 40, words: ["CONNAISSANCE", "RÉVÉLATION"] },

    // 41-50: Amour et compassion
    { number: 41, words: ["AMOUR", "CHARITÉ"] },
    { number: 42, words: ["COMPASSION", "MISÉRICORDE"] },
    { number: 43, words: ["TENDRESSE", "DOUCEUR"] },
    { number: 44, words: ["BIENVEILLANCE", "BONTÉ"] },
    { number: 45, words: ["GÉNÉROSITÉ", "LARGESSE"] },
    { number: 46, words: ["PARDON", "RÉCONCILIATION"] },
    { number: 47, words: ["ACCEPTATION", "TOLÉRANCE"] },
    { number: 48, words: ["INCLUSION", "ACCUEIL"] },
    { number: 49, words: ["EMPATHIE", "SENSIBILITÉ"] },
    { number: 50, words: ["ÉCOUTE", "ATTENTION"] },

    // 51-60: Service et mission
    { number: 51, words: ["SERVICE", "MINISTÈRE"] },
    { number: 52, words: ["DON", "OFFRANDE"] },
    { number: 53, words: ["PARTAGE", "DISTRIBUTION"] },
    { number: 54, words: ["AIDE", "ASSISTANCE"] },
    { number: 55, words: ["SOUTIEN", "ENCOURAGEMENT"] },
    { number: 56, words: ["TÉMOIGNAGE", "PROCLAMATION"] },
    { number: 57, words: ["ÉVANGÉLISATION", "ANNONCE"] },
    { number: 58, words: ["MISSION", "ENVOI"] },
    { number: 59, words: ["AMBASSADE", "REPRÉSENTATION"] },
    { number: 60, words: ["LUMIÈRE", "SEL"] },

    // 61-70: Vertus du disciple
    { number: 61, words: ["HUMILITÉ", "MODESTIE"] },
    { number: 62, words: ["SIMPLICITÉ", "SOBRIÉTÉ"] },
    { number: 63, words: ["PURETÉ", "INTÉGRITÉ"] },
    { number: 64, words: ["HONNÊTETÉ", "SINCÉRITÉ"] },
    { number: 65, words: ["AUTHENTICITÉ", "VÉRITÉ"] },
    { number: 66, words: ["DROITURE", "JUSTICE"] },
    { number: 67, words: ["ÉQUITÉ", "IMPARTIALITÉ"] },
    { number: 68, words: ["FIDÉLITÉ", "LOYAUTÉ"] },
    { number: 69, words: ["CONSTANCE", "STABILITÉ"] },
    { number: 70, words: ["FIABILITÉ", "COHÉRENCE"] },

    // 71-80: Communauté et unité
    { number: 71, words: ["FRATERNITÉ", "COMMUNION"] },
    { number: 72, words: ["UNITÉ", "HARMONIE"] },
    { number: 73, words: ["SOLIDARITÉ", "ENTRAIDE"] },
    { number: 74, words: ["COLLABORATION", "COOPÉRATION"] },
    { number: 75, words: ["PARTAGE", "COMMUNAUTÉ"] },
    { number: 76, words: ["HOSPITALITÉ", "OUVERTURE"] },
    { number: 77, words: ["RESPECT", "DIGNITÉ"] },
    { number: 78, words: ["HONNEUR", "ESTIME"] },
    { number: 79, words: ["ÉDIFICATION", "CONSTRUCTION"] },
    { number: 80, words: ["ENCOURAGEMENT", "FORTIFICATION"] },

    // 81-88: Fruit de l'amour
    { number: 81, words: ["PLÉNITUDE", "ABONDANCE"] },
    { number: 82, words: ["RAYONNEMENT", "INFLUENCE"] },
    { number: 83, words: ["FÉCONDITÉ", "PRODUCTIVITÉ"] },
    { number: 84, words: ["ACCOMPLISSEMENT", "RÉALISATION"] },
    { number: 85, words: ["HÉRITAGE", "TRANSMISSION"] },
    { number: 86, words: ["ÉTERNITÉ", "GLOIRE"] },
    { number: 87, words: ["COURONNE", "RÉCOMPENSE"] },
    { number: 88, words: ["PERFECTION", "AMOUR"] }
];

// Export pour utilisation dans le jeu
if (typeof window !== 'undefined') {
    window.levelsDisciple = levelsDisciple;
}
