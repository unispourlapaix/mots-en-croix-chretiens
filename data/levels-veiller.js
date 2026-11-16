/**
 * Mode Veiller - Vigilance spirituelle et sociale
 * 88 niveaux opposant les vertus à défendre et les maux à combattre
 */

const levelsVeiller = [
    // 1-10: Unité vs Division
    { number: 1, words: ["UNITÉ", "DIVISION"] },
    { number: 2, words: ["FRATERNITÉ", "SÉPARATION"] },
    { number: 3, words: ["COMMUNION", "EXCLUSION"] },
    { number: 4, words: ["ENSEMBLE", "ISOLEMENT"] },
    { number: 5, words: ["COHÉSION", "FRAGMENTATION"] },
    { number: 6, words: ["HARMONIE", "DISCORDE"] },
    { number: 7, words: ["SOLIDARITÉ", "INDIVIDUALISME"] },
    { number: 8, words: ["RASSEMBLEMENT", "DISPERSION"] },
    { number: 9, words: ["COOPÉRATION", "ANTAGONISME"] },
    { number: 10, words: ["ALLIANCE", "RUPTURE"] },

    // 11-20: Paix vs Haine
    { number: 11, words: ["PAIX", "HAINE"] },
    { number: 12, words: ["AMOUR", "VIOLENCE"] },
    { number: 13, words: ["DOUCEUR", "AGRESSIVITÉ"] },
    { number: 14, words: ["COMPASSION", "CRUAUTÉ"] },
    { number: 15, words: ["BIENVEILLANCE", "MALVEILLANCE"] },
    { number: 16, words: ["TENDRESSE", "DURETÉ"] },
    { number: 17, words: ["APAISEMENT", "CONFLIT"] },
    { number: 18, words: ["RÉCONCILIATION", "VENGEANCE"] },
    { number: 19, words: ["PARDON", "RANCUNE"] },
    { number: 20, words: ["MISÉRICORDE", "CRUAUTÉ"] },

    // 21-30: Respect vs Mépris
    { number: 21, words: ["RESPECT", "MÉPRIS"] },
    { number: 22, words: ["DIGNITÉ", "HUMILIATION"] },
    { number: 23, words: ["HONNEUR", "DÉSHONNEUR"] },
    { number: 24, words: ["ESTIME", "DÉDAIN"] },
    { number: 25, words: ["CONSIDÉRATION", "INDIFFÉRENCE"] },
    { number: 26, words: ["VALORISATION", "DÉVALORISATION"] },
    { number: 27, words: ["RECONNAISSANCE", "INGRATITUDE"] },
    { number: 28, words: ["APPRÉCIATION", "DÉPRÉCIATION"] },
    { number: 29, words: ["ÉGARDS", "GROSSIÈRETÉ"] },
    { number: 30, words: ["POLITESSE", "INCIVILITÉ"] },

    // 31-40: Diversité vs Racisme
    { number: 31, words: ["DIVERSITÉ", "RACISME"] },
    { number: 32, words: ["INCLUSION", "DISCRIMINATION"] },
    { number: 33, words: ["OUVERTURE", "XÉNOPHOBIE"] },
    { number: 34, words: ["ACCUEIL", "REJET"] },
    { number: 35, words: ["TOLÉRANCE", "INTOLÉRANCE"] },
    { number: 36, words: ["PLURALITÉ", "UNIFORMITÉ"] },
    { number: 37, words: ["MULTICULTURALISME", "ETHNOCENTRISME"] },
    { number: 38, words: ["ACCEPTATION", "STIGMATISATION"] },
    { number: 39, words: ["INTÉGRATION", "SÉGRÉGATION"] },
    { number: 40, words: ["MIXITÉ", "APARTHEID"] },

    // 41-50: Liberté vs Oppression
    { number: 41, words: ["LIBERTÉ", "OPPRESSION"] },
    { number: 42, words: ["ÉMANCIPATION", "ASSERVISSEMENT"] },
    { number: 43, words: ["AUTONOMIE", "DÉPENDANCE"] },
    { number: 44, words: ["INDÉPENDANCE", "DOMINATION"] },
    { number: 45, words: ["AFFRANCHISSEMENT", "ESCLAVAGE"] },
    { number: 46, words: ["DÉLIVRANCE", "CAPTIVITÉ"] },
    { number: 47, words: ["LIBÉRATION", "ENFERMEMENT"] },
    { number: 48, words: ["ÉPANOUISSEMENT", "RÉPRESSION"] },
    { number: 49, words: ["EXPRESSION", "CENSURE"] },
    { number: 50, words: ["CHOIX", "CONTRAINTE"] },

    // 51-60: Justice vs Injustice
    { number: 51, words: ["JUSTICE", "INJUSTICE"] },
    { number: 52, words: ["ÉQUITÉ", "INIQUITÉ"] },
    { number: 53, words: ["ÉGALITÉ", "INÉGALITÉ"] },
    { number: 54, words: ["IMPARTIALITÉ", "PARTIALITÉ"] },
    { number: 55, words: ["DROITURE", "CORRUPTION"] },
    { number: 56, words: ["INTÉGRITÉ", "MALHONNÊTETÉ"] },
    { number: 57, words: ["PROBITÉ", "VÉNALITÉ"] },
    { number: 58, words: ["HONNÊTETÉ", "TROMPERIE"] },
    { number: 59, words: ["TRANSPARENCE", "OPACITÉ"] },
    { number: 60, words: ["LÉGALITÉ", "ARBITRAIRE"] },

    // 61-70: Construction vs Destruction
    { number: 61, words: ["CONSTRUIRE", "DÉTRUIRE"] },
    { number: 62, words: ["ÉDIFIER", "DÉMOLIR"] },
    { number: 63, words: ["BÂTIR", "SACCAGER"] },
    { number: 64, words: ["CRÉER", "ANÉANTIR"] },
    { number: 65, words: ["DÉVELOPPER", "RAVAGER"] },
    { number: 66, words: ["CULTIVER", "DÉVASTER"] },
    { number: 67, words: ["NOURRIR", "AFFAMER"] },
    { number: 68, words: ["PROTÉGER", "VANDALISER"] },
    { number: 69, words: ["PRÉSERVER", "SPOLIER"] },
    { number: 70, words: ["RESTAURER", "RUINER"] },

    // 71-80: Démocratie vs Fascisme
    { number: 71, words: ["DÉMOCRATIE", "FASCISME"] },
    { number: 72, words: ["PARTICIPATION", "AUTORITARISME"] },
    { number: 73, words: ["PLURALISME", "TOTALITARISME"] },
    { number: 74, words: ["DIALOGUE", "DICTATURE"] },
    { number: 75, words: ["DÉBAT", "DOGMATISME"] },
    { number: 76, words: ["CONSULTATION", "IMPOSITION"] },
    { number: 77, words: ["REPRÉSENTATION", "TYRANNIE"] },
    { number: 78, words: ["CITOYENNETÉ", "SOUMISSION"] },
    { number: 79, words: ["RESPONSABILITÉ", "ARBITRAIRE"] },
    { number: 80, words: ["LAÏCITÉ", "INTÉGRISME"] },

    // 81-88: Communauté vs Communautarisme
    { number: 81, words: ["COMMUNAUTÉ", "COMMUNAUTARISME"] },
    { number: 82, words: ["PARTAGE", "REPLI"] },
    { number: 83, words: ["OUVERTURE", "SECTARISME"] },
    { number: 84, words: ["UNIVERSALISME", "TRIBALISME"] },
    { number: 85, words: ["HUMANISME", "FANATISME"] },
    { number: 86, words: ["VIVRE-ENSEMBLE", "SÉPARATISME"] },
    { number: 87, words: ["FRATERNITÉ", "CLOISONNEMENT"] },
    { number: 88, words: ["VIGILANCE", "COMPLAISANCE"] }
];

// Export pour utilisation dans le jeu
if (typeof window !== 'undefined') {
    window.levelsVeiller = levelsVeiller;
}
