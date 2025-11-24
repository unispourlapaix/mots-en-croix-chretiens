// Données du jeu - Niveaux et mots
const gameData = {
    fr: {
        levels: [
            {
                words: [
                    { word: "JESUS", clue: "Notre Sauveur", start: [2, 2], direction: "horizontal" },
                    { word: "AMOUR", clue: "Dieu est...", start: [4, 1], direction: "horizontal" },
                    { word: "FOI", clue: "Croire sans voir", start: [2, 2], direction: "vertical" },
                    { word: "PAIX", clue: "Ce que Jésus nous donne", start: [6, 3], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "ESPERANCE", clue: "Vertu théologale", start: [1, 1], direction: "horizontal" },
                    { word: "GRACE", clue: "Faveur divine", start: [3, 4], direction: "vertical" },
                    { word: "MARIE", clue: "Mère de Jésus", start: [5, 2], direction: "horizontal" },
                    { word: "CROIX", clue: "Symbole du sacrifice", start: [7, 1], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "RESURRECTION", clue: "Victoire sur la mort", start: [1, 3], direction: "horizontal" },
                    { word: "ETERNITE", clue: "Vie sans fin", start: [4, 1], direction: "vertical" },
                    { word: "SAINT", clue: "Pur et sanctifié", start: [6, 5], direction: "horizontal" },
                    { word: "GLOIRE", clue: "Honneur à Dieu", start: [2, 7], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "BENEDICTION", clue: "Faveur divine", start: [1, 2], direction: "horizontal" },
                    { word: "MIRACLE", clue: "Œuvre surnaturelle", start: [3, 1], direction: "vertical" },
                    { word: "PROPHETE", clue: "Messager de Dieu", start: [5, 4], direction: "horizontal" },
                    { word: "ALLIANCE", clue: "Pacte avec Dieu", start: [2, 6], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "PERSEVERANCE", clue: "Tenir bon dans l'épreuve", start: [1, 1], direction: "horizontal" },
                    { word: "SAGESSE", clue: "Connaissance divine", start: [4, 3], direction: "vertical" },
                    { word: "REDEMPTION", clue: "Rachat par le sang", start: [6, 2], direction: "horizontal" },
                    { word: "TRINITE", clue: "Père, Fils, Saint-Esprit", start: [2, 8], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFORMATION", clue: "Changement par l'Esprit", start: [1, 1], direction: "horizontal" },
                    { word: "REVELATION", clue: "Vérité révélée", start: [3, 4], direction: "vertical" },
                    { word: "SANCTIFICATION", clue: "Processus de sainteté", start: [5, 2], direction: "horizontal" },
                    { word: "INTERCESSION", clue: "Prière pour autrui", start: [7, 6], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "OMNIPOTENCE", clue: "Toute-puissance divine", start: [1, 2], direction: "horizontal" },
                    { word: "MISERICORDE", clue: "Compassion infinie", start: [3, 1], direction: "vertical" },
                    { word: "PROVIDENCE", clue: "Soin divin", start: [5, 4], direction: "horizontal" },
                    { word: "GLORIFICATION", clue: "Élévation finale", start: [2, 7], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFIGURATION", clue: "Révélation de la gloire", start: [1, 1], direction: "horizontal" },
                    { word: "RECONCILIATION", clue: "Rétablissement de l'union", start: [3, 3], direction: "vertical" },
                    { word: "REGENERATION", clue: "Nouvelle naissance", start: [5, 2], direction: "horizontal" },
                    { word: "JUSTIFICATION", clue: "Déclaration de justice", start: [7, 5], direction: "vertical" }
                ]
            }
        ]
    },
    
    en: {
        levels: [
            {
                words: [
                    { word: "JESUS", clue: "Our Savior", start: [2, 2], direction: "horizontal" },
                    { word: "LOVE", clue: "God is...", start: [4, 1], direction: "horizontal" },
                    { word: "FAITH", clue: "Believing without seeing", start: [2, 2], direction: "vertical" },
                    { word: "PEACE", clue: "What Jesus gives us", start: [6, 3], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "HOPE", clue: "Theological virtue", start: [1, 1], direction: "horizontal" },
                    { word: "GRACE", clue: "Divine favor", start: [3, 4], direction: "vertical" },
                    { word: "MARY", clue: "Mother of Jesus", start: [5, 2], direction: "horizontal" },
                    { word: "CROSS", clue: "Symbol of sacrifice", start: [7, 1], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "RESURRECTION", clue: "Victory over death", start: [1, 3], direction: "horizontal" },
                    { word: "ETERNITY", clue: "Endless life", start: [4, 1], direction: "vertical" },
                    { word: "SAINT", clue: "Pure and sanctified", start: [6, 5], direction: "horizontal" },
                    { word: "GLORY", clue: "Honor to God", start: [2, 7], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "BLESSING", clue: "Divine favor", start: [1, 2], direction: "horizontal" },
                    { word: "MIRACLE", clue: "Supernatural work", start: [3, 1], direction: "vertical" },
                    { word: "PROPHET", clue: "Messenger of God", start: [5, 4], direction: "horizontal" },
                    { word: "COVENANT", clue: "Pact with God", start: [2, 6], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "PERSEVERANCE", clue: "Standing firm in trials", start: [1, 1], direction: "horizontal" },
                    { word: "WISDOM", clue: "Divine knowledge", start: [4, 3], direction: "vertical" },
                    { word: "REDEMPTION", clue: "Bought by the blood", start: [6, 2], direction: "horizontal" },
                    { word: "TRINITY", clue: "Father, Son, Holy Spirit", start: [2, 8], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFORMATION", clue: "Change by the Spirit", start: [1, 1], direction: "horizontal" },
                    { word: "REVELATION", clue: "Truth revealed", start: [3, 4], direction: "vertical" },
                    { word: "SANCTIFICATION", clue: "Process of holiness", start: [5, 2], direction: "horizontal" },
                    { word: "INTERCESSION", clue: "Prayer for others", start: [7, 6], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "OMNIPOTENCE", clue: "All-powerful divine", start: [1, 2], direction: "horizontal" },
                    { word: "MERCY", clue: "Infinite compassion", start: [3, 1], direction: "vertical" },
                    { word: "PROVIDENCE", clue: "Divine care", start: [5, 4], direction: "horizontal" },
                    { word: "GLORIFICATION", clue: "Final elevation", start: [2, 7], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFIGURATION", clue: "Revelation of glory", start: [1, 1], direction: "horizontal" },
                    { word: "RECONCILIATION", clue: "Restoration of unity", start: [3, 3], direction: "vertical" },
                    { word: "REGENERATION", clue: "New birth", start: [5, 2], direction: "horizontal" },
                    { word: "JUSTIFICATION", clue: "Declaration of righteousness", start: [7, 5], direction: "vertical" }
                ]
            }
        ]
    },
    
    es: {
        levels: [
            {
                words: [
                    { word: "JESUS", clue: "Nuestro Salvador", start: [2, 2], direction: "horizontal" },
                    { word: "AMOR", clue: "Dios es...", start: [4, 1], direction: "horizontal" },
                    { word: "FE", clue: "Creer sin ver", start: [2, 2], direction: "vertical" },
                    { word: "PAZ", clue: "Lo que Jesús nos da", start: [6, 3], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "ESPERANZA", clue: "Virtud teologal", start: [1, 1], direction: "horizontal" },
                    { word: "GRACIA", clue: "Favor divino", start: [3, 4], direction: "vertical" },
                    { word: "MARIA", clue: "Madre de Jesús", start: [5, 2], direction: "horizontal" },
                    { word: "CRUZ", clue: "Símbolo del sacrificio", start: [7, 1], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "RESURRECCION", clue: "Victoria sobre la muerte", start: [1, 3], direction: "horizontal" },
                    { word: "ETERNIDAD", clue: "Vida sin fin", start: [4, 1], direction: "vertical" },
                    { word: "SANTO", clue: "Puro y santificado", start: [6, 5], direction: "horizontal" },
                    { word: "GLORIA", clue: "Honor a Dios", start: [2, 7], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "BENDICION", clue: "Favor divino", start: [1, 2], direction: "horizontal" },
                    { word: "MILAGRO", clue: "Obra sobrenatural", start: [3, 1], direction: "vertical" },
                    { word: "PROFETA", clue: "Mensajero de Dios", start: [5, 4], direction: "horizontal" },
                    { word: "ALIANZA", clue: "Pacto con Dios", start: [2, 6], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "PERSEVERANCIA", clue: "Mantenerse firme en la prueba", start: [1, 1], direction: "horizontal" },
                    { word: "SABIDURIA", clue: "Conocimiento divino", start: [4, 3], direction: "vertical" },
                    { word: "REDENCION", clue: "Comprado por la sangre", start: [6, 2], direction: "horizontal" },
                    { word: "TRINIDAD", clue: "Padre, Hijo, Espíritu Santo", start: [2, 8], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFORMACION", clue: "Cambio por el Espíritu", start: [1, 1], direction: "horizontal" },
                    { word: "REVELACION", clue: "Verdad revelada", start: [3, 4], direction: "vertical" },
                    { word: "SANTIFICACION", clue: "Proceso de santidad", start: [5, 2], direction: "horizontal" },
                    { word: "INTERCESION", clue: "Oración por otros", start: [7, 6], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "OMNIPOTENCIA", clue: "Todo-poderoso divino", start: [1, 2], direction: "horizontal" },
                    { word: "MISERICORDIA", clue: "Compasión infinita", start: [3, 1], direction: "vertical" },
                    { word: "PROVIDENCIA", clue: "Cuidado divino", start: [5, 4], direction: "horizontal" },
                    { word: "GLORIFICACION", clue: "Elevación final", start: [2, 7], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFIGURACION", clue: "Revelación de la gloria", start: [1, 1], direction: "horizontal" },
                    { word: "RECONCILIACION", clue: "Restauración de la unidad", start: [3, 3], direction: "vertical" },
                    { word: "REGENERACION", clue: "Nuevo nacimiento", start: [5, 2], direction: "horizontal" },
                    { word: "JUSTIFICACION", clue: "Declaración de justicia", start: [7, 5], direction: "vertical" }
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
