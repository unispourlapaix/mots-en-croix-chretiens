/**
 * Mode Couple Solide - Les clés d'un couple chrétien réussi
 * 88 niveaux sur les fondements d'une relation de couple saine et équilibrée
 */

const levelsCoupleSolide = [
    // 1-10: Fondations (Communication et Transparence)
    { number: 1, words: ["AMOUR", "RESPECT"] },
    { number: 2, words: ["CONFIANCE", "FIDÉLITÉ"] },
    { number: 3, words: ["TRANSPARENCE", "HONNÊTETÉ"] },
    { number: 4, words: ["PARTAGE", "COMMUNION"] },
    { number: 5, words: ["ÉCOUTE", "ATTENTION"] },
    { number: 6, words: ["DIALOGUE", "ÉCHANGE"] },
    { number: 7, words: ["SINCÉRITÉ", "VÉRITÉ"] },
    { number: 8, words: ["OUVERTURE", "FRANCHISE"] },
    { number: 9, words: ["AUTHENTICITÉ", "NATUREL"] },
    { number: 10, words: ["CLARTÉ", "LIMPIDITÉ"] },

    // 11-20: Vertus personnelles (Humilité et Maîtrise de soi)
    { number: 11, words: ["HUMILITÉ", "MODESTIE"] },
    { number: 12, words: ["DOUCEUR", "TENDRESSE"] },
    { number: 13, words: ["PATIENCE", "LONGANIMITÉ"] },
    { number: 14, words: ["TEMPÉRANCE", "MODÉRATION"] },
    { number: 15, words: ["MAÎTRISE", "CONTRÔLE"] },
    { number: 16, words: ["CALME", "SÉRÉNITÉ"] },
    { number: 17, words: ["SAGESSE", "PRUDENCE"] },
    { number: 18, words: ["DISCERNEMENT", "CLAIRVOYANCE"] },
    { number: 19, words: ["RÉFLEXION", "MÉDITATION"] },
    { number: 20, words: ["ÉQUILIBRE", "HARMONIE"] },

    // 21-30: Rejet des comportements toxiques (Ce qu'il faut éviter)
    { number: 21, words: ["ORGUEIL", "VANITÉ"] },
    { number: 22, words: ["VIOLENCE", "BRUTALITÉ"] },
    { number: 23, words: ["ABUS", "MALTRAITANCE"] },
    { number: 24, words: ["MANIPULATION", "CONTRÔLE"] },
    { number: 25, words: ["MENSONGE", "TROMPERIE"] },
    { number: 26, words: ["TRAHISON", "INFIDÉLITÉ"] },
    { number: 27, words: ["MÉPRIS", "DÉDAIN"] },
    { number: 28, words: ["ÉGOÏSME", "INDIVIDUALISME"] },
    { number: 29, words: ["NÉGLIGENCE", "ABANDON"] },
    { number: 30, words: ["INDIFFÉRENCE", "FROIDEUR"] },

    // 31-40: Entraide et Soutien mutuel
    { number: 31, words: ["ENTRAIDE", "ASSISTANCE"] },
    { number: 32, words: ["SOUTIEN", "APPUI"] },
    { number: 33, words: ["AIDE", "SECOURS"] },
    { number: 34, words: ["ACCOMPAGNEMENT", "PRÉSENCE"] },
    { number: 35, words: ["ENCOURAGEMENT", "MOTIVATION"] },
    { number: 36, words: ["RÉCONFORT", "CONSOLATION"] },
    { number: 37, words: ["SOLIDARITÉ", "UNION"] },
    { number: 38, words: ["COMPLÉMENTARITÉ", "SYNERGIE"] },
    { number: 39, words: ["COOPÉRATION", "COLLABORATION"] },
    { number: 40, words: ["ALLIANCE", "PARTENARIAT"] },

    // 41-50: Protection et Sécurité
    { number: 41, words: ["PROTECTION", "SÉCURITÉ"] },
    { number: 42, words: ["REFUGE", "ABRI"] },
    { number: 43, words: ["GARDE", "VIGILANCE"] },
    { number: 44, words: ["DÉFENSE", "BOUCLIER"] },
    { number: 45, words: ["PRÉSERVATION", "CONSERVATION"] },
    { number: 46, words: ["SAUVEGARDE", "GARANTIE"] },
    { number: 47, words: ["BIENVEILLANCE", "BONTÉ"] },
    { number: 48, words: ["PRÉVENANCE", "SOLLICITUDE"] },
    { number: 49, words: ["DÉLICATESSE", "TACT"] },
    { number: 50, words: ["DÉVOUEMENT", "SACRIFICE"] },

    // 51-60: Gestion des défis (Addictions et Tentations)
    { number: 51, words: ["SOBRIÉTÉ", "ABSTINENCE"] },
    { number: 52, words: ["DISCIPLINE", "RIGUEUR"] },
    { number: 53, words: ["RÉSISTANCE", "FORCE"] },
    { number: 54, words: ["COURAGE", "BRAVOURE"] },
    { number: 55, words: ["PERSÉVÉRANCE", "CONSTANCE"] },
    { number: 56, words: ["DÉTERMINATION", "VOLONTÉ"] },
    { number: 57, words: ["LIBÉRATION", "DÉLIVRANCE"] },
    { number: 58, words: ["GUÉRISON", "RESTAURATION"] },
    { number: 59, words: ["RÉSILIENCE", "RENAISSANCE"] },
    { number: 60, words: ["VICTOIRE", "TRIOMPHE"] },

    // 61-70: Pardon et Réconciliation
    { number: 61, words: ["PARDON", "GRÂCE"] },
    { number: 62, words: ["MISÉRICORDE", "COMPASSION"] },
    { number: 63, words: ["RÉCONCILIATION", "PAIX"] },
    { number: 64, words: ["ACCEPTATION", "ACCUEIL"] },
    { number: 65, words: ["COMPRÉHENSION", "EMPATHIE"] },
    { number: 66, words: ["TOLÉRANCE", "INDULGENCE"] },
    { number: 67, words: ["CLÉMENCE", "PITIÉ"] },
    { number: 68, words: ["RESTAURATION", "RÉPARATION"] },
    { number: 69, words: ["RENOUVEAU", "RECOMMENCEMENT"] },
    { number: 70, words: ["ESPÉRANCE", "CONFIANCE"] },

    // 71-80: Croissance et Épanouissement
    { number: 71, words: ["CROISSANCE", "DÉVELOPPEMENT"] },
    { number: 72, words: ["ÉPANOUISSEMENT", "FLORAISON"] },
    { number: 73, words: ["MATURITÉ", "SAGESSE"] },
    { number: 74, words: ["PROGRESSION", "AVANCEMENT"] },
    { number: 75, words: ["TRANSFORMATION", "MÉTAMORPHOSE"] },
    { number: 76, words: ["ÉDIFICATION", "CONSTRUCTION"] },
    { number: 77, words: ["ENRICHISSEMENT", "AMÉLIORATION"] },
    { number: 78, words: ["APPROFONDISSEMENT", "INTIMITÉ"] },
    { number: 79, words: ["COMMUNION", "UNITÉ"] },
    { number: 80, words: ["PLÉNITUDE", "ACCOMPLISSEMENT"] },

    // 81-88: Fruits d'un couple épanoui
    { number: 81, words: ["JOIE", "BONHEUR"] },
    { number: 82, words: ["PAIX", "SÉRÉNITÉ"] },
    { number: 83, words: ["HARMONIE", "ÉQUILIBRE"] },
    { number: 84, words: ["STABILITÉ", "SOLIDITÉ"] },
    { number: 85, words: ["FÉCONDITÉ", "FRUITFULNESS"] },
    { number: 86, words: ["RAYONNEMENT", "TÉMOIGNAGE"] },
    { number: 87, words: ["BÉNÉDICTION", "GRÂCE"] },
    { number: 88, words: ["ÉTERNITÉ", "ENGAGEMENT"] }
];
