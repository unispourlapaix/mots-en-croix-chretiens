// Données du jeu - Niveaux et mots
const gameData = {
    fr: {
        levels: [
            {
                // Niveau 1 - Croisement simple en forme de croix
                words: [
                    { word: "JESUS", clue: "Notre Sauveur", start: [4, 2], direction: "horizontal" },  // J-E-S-U-S
                    { word: "PAIX", clue: "Ce que Jésus donne", start: [2, 4], direction: "vertical" }, // Croise sur S
                    { word: "AMOUR", clue: "Dieu est...", start: [4, 5], direction: "vertical" },      // Croise sur S
                    { word: "FOI", clue: "Croire sans voir", start: [6, 2], direction: "horizontal" }  // Croise sur I
                ]
            },
            {
                // Niveau 2 - Croisements multiples
                words: [
                    { word: "ESPERANCE", clue: "Vertu théologale", start: [3, 1], direction: "horizontal" }, // E-S-P-E-R-A-N-C-E
                    { word: "GRACE", clue: "Faveur divine", start: [1, 6], direction: "vertical" },          // Croise sur A
                    { word: "PRIERE", clue: "Communication avec Dieu", start: [3, 3], direction: "vertical" }, // Croise sur P
                    { word: "CROIX", clue: "Symbole du sacrifice", start: [7, 6], direction: "horizontal" }  // Croise sur C
                ]
            },
            {
                // Niveau 3 - Grille plus complexe
                words: [
                    { word: "RESURRECTION", clue: "Victoire sur la mort", start: [2, 0], direction: "horizontal" },
                    { word: "ETERNITE", clue: "Vie sans fin", start: [0, 2], direction: "vertical" },
                    { word: "SAINT", clue: "Pur et sanctifié", start: [2, 2], direction: "vertical" },
                    { word: "GLOIRE", clue: "Honneur à Dieu", start: [6, 5], direction: "horizontal" }
                ]
            },
            {
                // Niveau 4 - Mots qui s'entrecroisent
                words: [
                    { word: "BENEDICTION", clue: "Faveur divine", start: [1, 1], direction: "horizontal" },
                    { word: "MIRACLE", clue: "Œuvre surnaturelle", start: [0, 5], direction: "vertical" },
                    { word: "PROPHETE", clue: "Messager de Dieu", start: [5, 2], direction: "horizontal" },
                    { word: "ALLIANCE", clue: "Pacte avec Dieu", start: [1, 8], direction: "vertical" }
                ]
            },
            {
                // Niveau 5
                words: [
                    { word: "PERSEVERANCE", clue: "Tenir bon dans l'épreuve", start: [1, 0], direction: "horizontal" },
                    { word: "SAGESSE", clue: "Connaissance divine", start: [0, 3], direction: "vertical" },
                    { word: "REDEMPTION", clue: "Rachat par le sang", start: [6, 1], direction: "horizontal" },
                    { word: "ESPRIT", clue: "Saint Esprit", start: [1, 8], direction: "vertical" }
                ]
            },
            {
                // Niveau 6
                words: [
                    { word: "TRANSFORMATION", clue: "Changement par l'Esprit", start: [0, 0], direction: "horizontal" },
                    { word: "REVELATION", clue: "Vérité révélée", start: [0, 5], direction: "vertical" },
                    { word: "SANCTIFICATION", clue: "Processus de sainteté", start: [5, 0], direction: "horizontal" },
                    { word: "COMMUNION", clue: "Union avec Dieu", start: [0, 10], direction: "vertical" }
                ]
            },
            {
                // Niveau 7
                words: [
                    { word: "OMNIPOTENCE", clue: "Toute-puissance divine", start: [1, 1], direction: "horizontal" },
                    { word: "MISERICORDE", clue: "Compassion infinie", start: [0, 5], direction: "vertical" },
                    { word: "PROVIDENCE", clue: "Soin divin", start: [5, 2], direction: "horizontal" },
                    { word: "SALUT", clue: "Délivrance divine", start: [1, 9], direction: "vertical" }
                ]
            },
            {
                // Niveau 8
                words: [
                    { word: "TRANSFIGURATION", clue: "Révélation de la gloire", start: [0, 0], direction: "horizontal" },
                    { word: "RECONCILIATION", clue: "Rétablissement de l'union", start: [0, 8], direction: "vertical" },
                    { word: "JUSTIFICATION", clue: "Déclaration de justice", start: [5, 1], direction: "horizontal" },
                    { word: "LOUANGE", clue: "Adoration à Dieu", start: [0, 12], direction: "vertical" }
                ]
            }
        ]
    },
    
    en: {
        levels: [
            {
                words: [
                    { word: "JESUS", clue: "Our Savior", start: [4, 2], direction: "horizontal" },
                    { word: "PEACE", clue: "What Jesus gives", start: [2, 4], direction: "vertical" },
                    { word: "LOVE", clue: "God is...", start: [4, 5], direction: "vertical" },
                    { word: "JOY", clue: "Fruit of the Spirit", start: [6, 2], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "HOPE", clue: "Theological virtue", start: [3, 1], direction: "horizontal" },
                    { word: "GRACE", clue: "Divine favor", start: [1, 2], direction: "vertical" },
                    { word: "PRAYER", clue: "Talk with God", start: [3, 3], direction: "vertical" },
                    { word: "CROSS", clue: "Symbol of sacrifice", start: [7, 1], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "RESURRECTION", clue: "Victory over death", start: [2, 0], direction: "horizontal" },
                    { word: "ETERNITY", clue: "Endless life", start: [0, 2], direction: "vertical" },
                    { word: "SAINT", clue: "Pure and sanctified", start: [2, 2], direction: "vertical" },
                    { word: "GLORY", clue: "Honor to God", start: [6, 5], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "BLESSING", clue: "Divine favor", start: [1, 1], direction: "horizontal" },
                    { word: "MIRACLE", clue: "Supernatural work", start: [0, 5], direction: "vertical" },
                    { word: "PROPHET", clue: "Messenger of God", start: [5, 2], direction: "horizontal" },
                    { word: "COVENANT", clue: "Pact with God", start: [1, 7], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "PERSEVERANCE", clue: "Standing firm", start: [1, 0], direction: "horizontal" },
                    { word: "WISDOM", clue: "Divine knowledge", start: [0, 3], direction: "vertical" },
                    { word: "REDEMPTION", clue: "Bought by blood", start: [6, 1], direction: "horizontal" },
                    { word: "SPIRIT", clue: "Holy Spirit", start: [1, 8], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFORMATION", clue: "Change by Spirit", start: [0, 0], direction: "horizontal" },
                    { word: "REVELATION", clue: "Truth revealed", start: [0, 5], direction: "vertical" },
                    { word: "SANCTIFICATION", clue: "Process of holiness", start: [5, 0], direction: "horizontal" },
                    { word: "COMMUNION", clue: "Union with God", start: [0, 10], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "OMNIPOTENCE", clue: "All-powerful", start: [1, 1], direction: "horizontal" },
                    { word: "MERCY", clue: "Infinite compassion", start: [0, 5], direction: "vertical" },
                    { word: "PROVIDENCE", clue: "Divine care", start: [5, 2], direction: "horizontal" },
                    { word: "SALVATION", clue: "Divine deliverance", start: [1, 9], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFIGURATION", clue: "Revelation of glory", start: [0, 0], direction: "horizontal" },
                    { word: "RECONCILIATION", clue: "Restoration of unity", start: [0, 8], direction: "vertical" },
                    { word: "JUSTIFICATION", clue: "Declaration of righteousness", start: [5, 1], direction: "horizontal" },
                    { word: "WORSHIP", clue: "Adoration to God", start: [0, 12], direction: "vertical" }
                ]
            }
        ]
    },
    
    es: {
        levels: [
            {
                words: [
                    { word: "JESUS", clue: "Nuestro Salvador", start: [4, 2], direction: "horizontal" },
                    { word: "PAZ", clue: "Lo que Jesús da", start: [2, 4], direction: "vertical" },
                    { word: "AMOR", clue: "Dios es...", start: [4, 5], direction: "vertical" },
                    { word: "FE", clue: "Creer sin ver", start: [6, 2], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "ESPERANZA", clue: "Virtud teologal", start: [3, 1], direction: "horizontal" },
                    { word: "GRACIA", clue: "Favor divino", start: [1, 3], direction: "vertical" },
                    { word: "ORACION", clue: "Hablar con Dios", start: [3, 3], direction: "vertical" },
                    { word: "CRUZ", clue: "Símbolo del sacrificio", start: [7, 1], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "RESURRECCION", clue: "Victoria sobre muerte", start: [2, 0], direction: "horizontal" },
                    { word: "ETERNIDAD", clue: "Vida sin fin", start: [0, 2], direction: "vertical" },
                    { word: "SANTO", clue: "Puro y santificado", start: [2, 2], direction: "vertical" },
                    { word: "GLORIA", clue: "Honor a Dios", start: [6, 5], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "BENDICION", clue: "Favor divino", start: [1, 1], direction: "horizontal" },
                    { word: "MILAGRO", clue: "Obra sobrenatural", start: [0, 5], direction: "vertical" },
                    { word: "PROFETA", clue: "Mensajero de Dios", start: [5, 2], direction: "horizontal" },
                    { word: "ALIANZA", clue: "Pacto con Dios", start: [1, 7], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "PERSEVERANCIA", clue: "Mantenerse firme", start: [1, 0], direction: "horizontal" },
                    { word: "SABIDURIA", clue: "Conocimiento divino", start: [0, 3], direction: "vertical" },
                    { word: "REDENCION", clue: "Comprado por sangre", start: [6, 1], direction: "horizontal" },
                    { word: "ESPIRITU", clue: "Espíritu Santo", start: [1, 8], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFORMACION", clue: "Cambio por Espíritu", start: [0, 0], direction: "horizontal" },
                    { word: "REVELACION", clue: "Verdad revelada", start: [0, 5], direction: "vertical" },
                    { word: "SANTIFICACION", clue: "Proceso de santidad", start: [5, 0], direction: "horizontal" },
                    { word: "COMUNION", clue: "Unión con Dios", start: [0, 10], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "OMNIPOTENCIA", clue: "Todo-poderoso", start: [1, 1], direction: "horizontal" },
                    { word: "MISERICORDIA", clue: "Compasión infinita", start: [0, 5], direction: "vertical" },
                    { word: "PROVIDENCIA", clue: "Cuidado divino", start: [5, 2], direction: "horizontal" },
                    { word: "SALVACION", clue: "Liberación divina", start: [1, 9], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFIGURACION", clue: "Revelación de gloria", start: [0, 0], direction: "horizontal" },
                    { word: "RECONCILIACION", clue: "Restauración unidad", start: [0, 8], direction: "vertical" },
                    { word: "JUSTIFICACION", clue: "Declaración justicia", start: [5, 1], direction: "horizontal" },
                    { word: "ALABANZA", clue: "Adoración a Dios", start: [0, 12], direction: "vertical" }
                ]
            }
        ]
    }
};

class GameDataManager {
    constructor() {
        this.data = gameData;
        this.currentLanguage = 'fr';
    }
    
    setLanguage(lang) {
        if (this.data[lang]) {
            this.currentLanguage = lang;
            return true;
        }
        return false;
    }
    
    getLevelData(levelNumber) {
        const levels = this.data[this.currentLanguage]?.levels;
        if (levels && levelNumber > 0 && levelNumber <= levels.length) {
            return levels[levelNumber - 1];
        }
        return null;
    }
    
    getTotalLevels() {
        return this.data[this.currentLanguage]?.levels.length || 0;
    }
    
    getAllLevels() {
        return this.data[this.currentLanguage]?.levels || [];
    }
}

// Exporter une instance unique
const gameDataManager = new GameDataManager();

// Pour les environnements ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = gameDataManager;
}
