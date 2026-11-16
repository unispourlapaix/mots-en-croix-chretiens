/**
 * Mode Aimée - Les deux commandements de l'amour
 * 88 niveaux sur aimer Dieu et aimer les autres
 */

const levelsAimee = [
    // 1-10: Les deux commandements
    { number: 1, words: ["AIMER", "DIEU"] },
    { number: 2, words: ["AIMER", "AUTRUI"] },
    { number: 3, words: ["AMOUR", "PROCHAIN"] },
    { number: 4, words: ["CHARITÉ", "COMPASSION"] },
    { number: 5, words: ["BIENVEILLANCE", "BONTÉ"] },
    { number: 6, words: ["TENDRESSE", "DOUCEUR"] },
    { number: 7, words: ["AFFECTION", "ATTACHEMENT"] },
    { number: 8, words: ["DÉVOTION", "ADORATION"] },
    { number: 9, words: ["VÉNÉRATION", "CULTE"] },
    { number: 10, words: ["LOUANGE", "GLOIRE"] },

    // 11-20: Aimer Dieu de tout son cœur
    { number: 11, words: ["CŒUR", "ÂMES"] },
    { number: 12, words: ["ESPRIT", "PENSÉE"] },
    { number: 13, words: ["FORCE", "VOLONTÉ"] },
    { number: 14, words: ["TOUT", "ENTIER"] },
    { number: 15, words: ["CONSÉCRATION", "OFFRANDE"] },
    { number: 16, words: ["ABANDON", "CONFIANCE"] },
    { number: 17, words: ["FOI", "CROYANCE"] },
    { number: 18, words: ["ESPÉRANCE", "ATTENTE"] },
    { number: 19, words: ["FIDÉLITÉ", "LOYAUTÉ"] },
    { number: 20, words: ["OBÉISSANCE", "SOUMISSION"] },

    // 21-30: Miséricorde et pardon
    { number: 21, words: ["MISÉRICORDE", "PITIÉ"] },
    { number: 22, words: ["PARDON", "GRÂCE"] },
    { number: 23, words: ["RÉCONCILIATION", "PAIX"] },
    { number: 24, words: ["CLÉMENCE", "INDULGENCE"] },
    { number: 25, words: ["ABSOLUTION", "RÉDEMPTION"] },
    { number: 26, words: ["COMPASSION", "EMPATHIE"] },
    { number: 27, words: ["COMPRÉHENSION", "TOLÉRANCE"] },
    { number: 28, words: ["PATIENCE", "LONGANIMITÉ"] },
    { number: 29, words: ["DOUCEUR", "MANSUÉTUDE"] },
    { number: 30, words: ["BIENVEILLANCE", "BÉNIGNITÉ"] },

    // 31-40: Aider et servir
    { number: 31, words: ["AIDER", "ASSISTER"] },
    { number: 32, words: ["SERVIR", "MINISTÈRE"] },
    { number: 33, words: ["SOUTENIR", "APPUYER"] },
    { number: 34, words: ["SECOURIR", "SAUVER"] },
    { number: 35, words: ["ACCOMPAGNER", "GUIDER"] },
    { number: 36, words: ["ENCOURAGER", "FORTIFIER"] },
    { number: 37, words: ["CONSOLER", "RÉCONFORTER"] },
    { number: 38, words: ["RELEVER", "RESTAURER"] },
    { number: 39, words: ["SOIGNER", "GUÉRIR"] },
    { number: 40, words: ["PROTÉGER", "DÉFENDRE"] },

    // 41-50: Partager et donner
    { number: 41, words: ["PARTAGER", "DISTRIBUER"] },
    { number: 42, words: ["DONNER", "OFFRIR"] },
    { number: 43, words: ["GÉNÉROSITÉ", "LARGESSE"] },
    { number: 44, words: ["LIBÉRALITÉ", "MUNIFICENCE"] },
    { number: 45, words: ["AUMÔNE", "CHARITÉ"] },
    { number: 46, words: ["DON", "CADEAU"] },
    { number: 47, words: ["SACRIFICE", "OFFRANDE"] },
    { number: 48, words: ["RENONCEMENT", "ABANDON"] },
    { number: 49, words: ["DÉSINTÉRESSEMENT", "ALTRUISME"] },
    { number: 50, words: ["ABNÉGATION", "OUBLI"] },

    // 51-60: Accueillir et inclure
    { number: 51, words: ["ACCUEILLIR", "RECEVOIR"] },
    { number: 52, words: ["HOSPITALITÉ", "HÉBERGEMENT"] },
    { number: 53, words: ["INCLUSION", "INTÉGRATION"] },
    { number: 54, words: ["OUVERTURE", "DISPONIBILITÉ"] },
    { number: 55, words: ["FRATERNITÉ", "COMMUNION"] },
    { number: 56, words: ["UNITÉ", "SOLIDARITÉ"] },
    { number: 57, words: ["PARTAGE", "COMMUNAUTÉ"] },
    { number: 58, words: ["RASSEMBLEMENT", "ASSEMBLÉE"] },
    { number: 59, words: ["CONVIVIALITÉ", "CHALEUR"] },
    { number: 60, words: ["PROXIMITÉ", "PRÉSENCE"] },

    // 61-70: Respecter et honorer
    { number: 61, words: ["RESPECTER", "HONORER"] },
    { number: 62, words: ["ESTIMER", "VALORISER"] },
    { number: 63, words: ["DIGNITÉ", "NOBLESSE"] },
    { number: 64, words: ["RÉVÉRENCE", "VÉNÉRATION"] },
    { number: 65, words: ["CONSIDÉRATION", "ÉGARDS"] },
    { number: 66, words: ["ATTENTION", "DÉLICATESSE"] },
    { number: 67, words: ["POLITESSE", "COURTOISIE"] },
    { number: 68, words: ["PRÉVENANCE", "SOLLICITUDE"] },
    { number: 69, words: ["DÉVOUEMENT", "SOIN"] },
    { number: 70, words: ["ÉCOUTE", "PRÉSENCE"] },

    // 71-80: Construire et édifier
    { number: 71, words: ["CONSTRUIRE", "BÂTIR"] },
    { number: 72, words: ["ÉDIFIER", "ÉLEVER"] },
    { number: 73, words: ["CRÉER", "FORMER"] },
    { number: 74, words: ["DÉVELOPPER", "CULTIVER"] },
    { number: 75, words: ["NOURRIR", "ALIMENTER"] },
    { number: 76, words: ["FAIRE", "GRANDIR"] },
    { number: 77, words: ["ENCOURAGEMENT", "STIMULATION"] },
    { number: 78, words: ["ENSEIGNEMENT", "FORMATION"] },
    { number: 79, words: ["TRANSMISSION", "HÉRITAGE"] },
    { number: 80, words: ["MULTIPLICATION", "ABONDANCE"] },

    // 81-88: Fruits de l'amour
    { number: 81, words: ["JOIE", "ALLÉGRESSE"] },
    { number: 82, words: ["PAIX", "SÉRÉNITÉ"] },
    { number: 83, words: ["HARMONIE", "ÉQUILIBRE"] },
    { number: 84, words: ["PLÉNITUDE", "ÉPANOUISSEMENT"] },
    { number: 85, words: ["BONHEUR", "BÉATITUDE"] },
    { number: 86, words: ["RAYONNEMENT", "LUMIÈRE"] },
    { number: 87, words: ["FÉCONDITÉ", "FRUITFULNESS"] },
    { number: 88, words: ["PERFECTION", "ACCOMPLISSEMENT"] }
];

// Export pour utilisation dans le jeu
if (typeof window !== 'undefined') {
    window.levelsAimee = levelsAimee;
}
