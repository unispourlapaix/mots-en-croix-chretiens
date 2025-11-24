// Données du jeu - Niveaux et mots
const gameData = {
    fr: {
        levels: [
            {
                // Niveau 1 - Introduction avec mots en croix (grille 10x10)
                words: [
                    {
                        word: "JESUS",
                        clue: "Notre Sauveur",
                        path: [[1,3], [2,3], [3,3], [3,4], [3,5]], // Mot coudé en L
                        direction: "bent"
                    },
                    {
                        word: "AMOUR",
                        clue: "Dieu est...",
                        path: [[4,0], [4,1], [4,2], [4,3], [4,4]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "PAIX",
                        clue: "Ce que Jésus donne",
                        path: [[6,2], [6,3], [7,3], [8,3]], // Coudé en L inversé
                        direction: "bent"
                    },
                    {
                        word: "FOI",
                        clue: "Croire sans voir",
                        path: [[2,6], [2,7], [2,8]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "VIE",
                        clue: "Jésus donne la...",
                        path: [[6,7], [7,7], [8,7]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // Niveau 2 - Vertus chrétiennes avec croix complexes (grille 10x10)
                words: [
                    {
                        word: "ESPERANCE",
                        clue: "Vertu théologale",
                        path: [[0,2], [1,2], [2,2], [2,3], [2,4], [2,5], [3,5], [4,5], [5,5]], // Coudé en escalier
                        direction: "bent"
                    },
                    {
                        word: "GRACE",
                        clue: "Faveur divine",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PRIERE",
                        clue: "Communication avec Dieu",
                        path: [[7,1], [7,2], [7,3], [8,3], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "AMOUR",
                        clue: "Plus grand commandement",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "FOI",
                        clue: "Croire en Dieu",
                        path: [[0,7], [1,7], [2,7]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // Niveau 3 - Mystères de la foi (grille 10x10)
                words: [
                    {
                        word: "ETERNITE",
                        clue: "Vie sans fin",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "GLOIRE",
                        clue: "Honneur à Dieu",
                        path: [[3,0], [3,1], [3,2], [3,3], [3,4], [3,5]], // Horizontal croisant ETERNITE
                        direction: "horizontal"
                    },
                    {
                        word: "SAINT",
                        clue: "Pur et sanctifié",
                        path: [[4,6], [5,6], [6,6], [7,6], [8,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "CIEL",
                        clue: "Demeure de Dieu",
                        path: [[1,7], [2,7], [3,7], [4,7]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ANGE",
                        clue: "Messager céleste",
                        path: [[8,0], [8,1], [8,2], [8,3]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Niveau 4 - Œuvres divines (grille 10x10)
                words: [
                    {
                        word: "MIRACLE",
                        clue: "Œuvre surnaturelle",
                        path: [[1,3], [2,3], [3,3], [3,4], [3,5], [3,6], [3,7]], // Coudé en L
                        direction: "bent"
                    },
                    {
                        word: "PROPHETE",
                        clue: "Messager de Dieu",
                        path: [[0,0], [1,0], [2,0], [3,0], [4,0], [5,0], [6,0], [7,0]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "GUERISON",
                        clue: "Restauration",
                        path: [[5,2], [5,3], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "FORCE",
                        clue: "Puissance divine",
                        path: [[1,8], [2,8], [3,8], [4,8], [5,8]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // Niveau 5 - Qualités spirituelles (grille 10x10)
                words: [
                    {
                        word: "SAGESSE",
                        clue: "Connaissance divine",
                        path: [[2,1], [2,2], [2,3], [3,3], [4,3], [5,3], [6,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PATIENCE",
                        clue: "Attendre avec foi",
                        path: [[4,5], [5,5], [6,5], [6,6], [6,7], [6,8], [7,8], [8,8]], // Coudé en escalier
                        direction: "bent"
                    },
                    {
                        word: "HUMILITE",
                        clue: "Modestie chrétienne",
                        path: [[0,6], [1,6], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "COURAGE",
                        clue: "Force face à l'adversité",
                        path: [[8,0], [8,1], [8,2], [8,3], [8,4], [8,5], [8,6]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Niveau 6 - Processus spirituels (grille 10x10)
                words: [
                    {
                        word: "COMMUNION",
                        clue: "Union avec Dieu",
                        path: [[1,1], [1,2], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "REPENTANCE",
                        clue: "Se détourner du péché",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7]], // Coudé en L
                        direction: "bent"
                    },
                    {
                        word: "ADOPTION",
                        clue: "Enfants de Dieu",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4], [5,5], [5,6], [5,7]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Niveau 7 - Attributs de Dieu (grille 10x10)
                words: [
                    {
                        word: "PROVIDENCE",
                        clue: "Soin divin",
                        path: [[0,2], [1,2], [2,2], [2,3], [2,4], [2,5], [2,6], [2,7], [2,8], [3,8]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "JUSTICE",
                        clue: "Droiture parfaite",
                        path: [[4,1], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "MAJESTE",
                        clue: "Grandeur divine",
                        path: [[5,5], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // Niveau 8 - Doctrines avancées (grille 10x10) - Défi final!
                words: [
                    {
                        word: "EXALTATION",
                        clue: "Élever très haut",
                        path: [[0,3], [0,4], [0,5], [1,5], [2,5], [3,5], [4,5], [5,5], [6,5], [7,5]], // Coudé en croix
                        direction: "bent"
                    },
                    {
                        word: "REDEMPTION",
                        clue: "Rachat divin",
                        path: [[2,0], [2,1], [2,2], [2,3], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "REVELATION",
                        clue: "Vérité révélée",
                        path: [[4,6], [4,7], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]], // Coudé en U
                        direction: "bent"
                    }
                ]
            }
        ]
    },
    
    en: {
        levels: [
            {
                words: [
                    { word: "JESUS", clue: "Our Savior", start: [5, 3], direction: "horizontal" },
                    { word: "LOVE", clue: "God is...", start: [3, 5], direction: "vertical" },
                    { word: "PEACE", clue: "What Jesus gives", start: [5, 5], direction: "vertical" },
                    { word: "JOY", clue: "Fruit of the Spirit", start: [7, 3], direction: "horizontal" },
                    { word: "LIFE", clue: "Jesus gives...", start: [9, 5], direction: "horizontal" },
                    { word: "FAITH", clue: "Believe without seeing", start: [5, 8], direction: "vertical" },
                    { word: "GOD", clue: "Our Heavenly Father", start: [3, 10], direction: "vertical" },
                    { word: "CROSS", clue: "Symbol of sacrifice", start: [11, 3], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "HOPE", clue: "Theological virtue", start: [4, 2], direction: "horizontal" },
                    { word: "GRACE", clue: "Divine favor", start: [2, 4], direction: "vertical" },
                    { word: "PRAYER", clue: "Talk with God", start: [4, 6], direction: "vertical" },
                    { word: "PRAISE", clue: "Worship God", start: [6, 2], direction: "horizontal" },
                    { word: "FORGIVE", clue: "Divine mercy", start: [2, 10], direction: "vertical" },
                    { word: "SERVE", clue: "Help others", start: [8, 4], direction: "horizontal" },
                    { word: "LISTEN", clue: "Hear the Word", start: [10, 2], direction: "horizontal" },
                    { word: "GIVE", clue: "Share with joy", start: [4, 12], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "RESURRECTION", clue: "Victory over death", start: [3, 1], direction: "horizontal" },
                    { word: "ETERNITY", clue: "Endless life", start: [1, 5], direction: "vertical" },
                    { word: "SAINT", clue: "Pure and sanctified", start: [3, 8], direction: "vertical" },
                    { word: "GLORY", clue: "Honor to God", start: [7, 3], direction: "horizontal" },
                    { word: "HEAVEN", clue: "God's dwelling", start: [5, 1], direction: "horizontal" },
                    { word: "ANGEL", clue: "Heavenly messenger", start: [9, 5], direction: "horizontal" },
                    { word: "LIGHT", clue: "God is...", start: [3, 12], direction: "vertical" },
                    { word: "TRUTH", clue: "Jesus is the...", start: [5, 10], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "BLESSING", clue: "Divine favor", start: [2, 2], direction: "horizontal" },
                    { word: "MIRACLE", clue: "Supernatural work", start: [1, 6], direction: "vertical" },
                    { word: "PROPHET", clue: "Messenger of God", start: [4, 1], direction: "horizontal" },
                    { word: "COVENANT", clue: "Pact with God", start: [2, 10], direction: "vertical" },
                    { word: "HEALING", clue: "Restoration", start: [6, 3], direction: "horizontal" },
                    { word: "DELIVER", clue: "Set free", start: [8, 1], direction: "horizontal" },
                    { word: "PROMISE", clue: "God's faithful word", start: [4, 5], direction: "vertical" },
                    { word: "VICTORY", clue: "Triumph in Christ", start: [10, 4], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "PERSEVERANCE", clue: "Standing firm", start: [2, 1], direction: "horizontal" },
                    { word: "WISDOM", clue: "Divine knowledge", start: [1, 4], direction: "vertical" },
                    { word: "REDEMPTION", clue: "Bought by blood", start: [4, 2], direction: "horizontal" },
                    { word: "SPIRIT", clue: "Holy Spirit", start: [2, 9], direction: "vertical" },
                    { word: "PATIENCE", clue: "Wait with faith", start: [6, 1], direction: "horizontal" },
                    { word: "HUMILITY", clue: "Christian modesty", start: [8, 4], direction: "horizontal" },
                    { word: "COURAGE", clue: "Strength in adversity", start: [4, 11], direction: "vertical" },
                    { word: "KINDNESS", clue: "Quality of heart", start: [6, 7], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFORMATION", clue: "Change by Spirit", start: [1, 1], direction: "horizontal" },
                    { word: "REVELATION", clue: "Truth revealed", start: [1, 6], direction: "vertical" },
                    { word: "SANCTIFICATION", clue: "Process of holiness", start: [3, 2], direction: "horizontal" },
                    { word: "COMMUNION", clue: "Union with God", start: [1, 12], direction: "vertical" },
                    { word: "REPENTANCE", clue: "Turn from sin", start: [5, 1], direction: "horizontal" },
                    { word: "CONVERSION", clue: "Change direction", start: [7, 4], direction: "horizontal" },
                    { word: "PURIFICATION", clue: "Made pure", start: [9, 1], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "OMNIPOTENCE", clue: "All-powerful", start: [2, 2], direction: "horizontal" },
                    { word: "MERCY", clue: "Infinite compassion", start: [1, 6], direction: "vertical" },
                    { word: "PROVIDENCE", clue: "Divine care", start: [4, 1], direction: "horizontal" },
                    { word: "JUSTICE", clue: "Perfect righteousness", start: [2, 10], direction: "vertical" },
                    { word: "SOVEREIGNTY", clue: "Supreme authority", start: [6, 3], direction: "horizontal" },
                    { word: "OMNISCIENCE", clue: "Total knowledge", start: [8, 1], direction: "horizontal" },
                    { word: "MAJESTY", clue: "Divine grandeur", start: [10, 4], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "TRANSFIGURATION", clue: "Revelation of glory", start: [1, 1], direction: "horizontal" },
                    { word: "RECONCILIATION", clue: "Restoration of unity", start: [1, 9], direction: "vertical" },
                    { word: "JUSTIFICATION", clue: "Declaration of righteousness", start: [3, 2], direction: "horizontal" },
                    { word: "PROPITIATION", clue: "Atonement for sins", start: [5, 1], direction: "horizontal" },
                    { word: "INTERCESSION", clue: "Prayer for others", start: [7, 4], direction: "horizontal" },
                    { word: "GLORIFICATION", clue: "Final elevation", start: [3, 11], direction: "vertical" },
                    { word: "CONSECRATION", clue: "Dedicated to God", start: [9, 2], direction: "horizontal" }
                ]
            }
        ]
    },
    
    es: {
        levels: [
            {
                words: [
                    { word: "JESUS", clue: "Nuestro Salvador", start: [5, 3], direction: "horizontal" },
                    { word: "AMOR", clue: "Dios es...", start: [3, 5], direction: "vertical" },
                    { word: "PAZ", clue: "Lo que Jesús da", start: [5, 5], direction: "vertical" },
                    { word: "FE", clue: "Creer sin ver", start: [7, 3], direction: "horizontal" },
                    { word: "VIDA", clue: "Jesús da la...", start: [9, 5], direction: "horizontal" },
                    { word: "GOZO", clue: "Fruto del Espíritu", start: [5, 8], direction: "vertical" },
                    { word: "DIOS", clue: "Nuestro Padre celestial", start: [3, 10], direction: "vertical" },
                    { word: "CRUZ", clue: "Símbolo del sacrificio", start: [11, 3], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "ESPERANZA", clue: "Virtud teologal", start: [4, 2], direction: "horizontal" },
                    { word: "GRACIA", clue: "Favor divino", start: [2, 4], direction: "vertical" },
                    { word: "ORACION", clue: "Hablar con Dios", start: [4, 6], direction: "vertical" },
                    { word: "ALABANZA", clue: "Adorar a Dios", start: [6, 2], direction: "horizontal" },
                    { word: "PERDON", clue: "Misericordia divina", start: [2, 10], direction: "vertical" },
                    { word: "SERVIR", clue: "Ayudar a otros", start: [8, 4], direction: "horizontal" },
                    { word: "ESCUCHAR", clue: "Oír la Palabra", start: [10, 2], direction: "horizontal" },
                    { word: "DAR", clue: "Compartir con alegría", start: [4, 12], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "RESURRECCION", clue: "Victoria sobre muerte", start: [3, 1], direction: "horizontal" },
                    { word: "ETERNIDAD", clue: "Vida sin fin", start: [1, 5], direction: "vertical" },
                    { word: "SANTO", clue: "Puro y santificado", start: [3, 8], direction: "vertical" },
                    { word: "GLORIA", clue: "Honor a Dios", start: [7, 3], direction: "horizontal" },
                    { word: "CIELO", clue: "Morada de Dios", start: [5, 1], direction: "horizontal" },
                    { word: "ANGEL", clue: "Mensajero celestial", start: [9, 5], direction: "horizontal" },
                    { word: "LUZ", clue: "Dios es...", start: [3, 12], direction: "vertical" },
                    { word: "VERDAD", clue: "Jesús es la...", start: [5, 10], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "BENDICION", clue: "Favor divino", start: [2, 2], direction: "horizontal" },
                    { word: "MILAGRO", clue: "Obra sobrenatural", start: [1, 6], direction: "vertical" },
                    { word: "PROFETA", clue: "Mensajero de Dios", start: [4, 1], direction: "horizontal" },
                    { word: "ALIANZA", clue: "Pacto con Dios", start: [2, 10], direction: "vertical" },
                    { word: "SANIDAD", clue: "Restauración", start: [6, 3], direction: "horizontal" },
                    { word: "LIBERTAR", clue: "Liberar", start: [8, 1], direction: "horizontal" },
                    { word: "PROMESA", clue: "Palabra fiel de Dios", start: [4, 5], direction: "vertical" },
                    { word: "VICTORIA", clue: "Triunfo en Cristo", start: [10, 4], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "PERSEVERANCIA", clue: "Mantenerse firme", start: [2, 1], direction: "horizontal" },
                    { word: "SABIDURIA", clue: "Conocimiento divino", start: [1, 4], direction: "vertical" },
                    { word: "REDENCION", clue: "Comprado por sangre", start: [4, 2], direction: "horizontal" },
                    { word: "ESPIRITU", clue: "Espíritu Santo", start: [2, 9], direction: "vertical" },
                    { word: "PACIENCIA", clue: "Esperar con fe", start: [6, 1], direction: "horizontal" },
                    { word: "HUMILDAD", clue: "Modestia cristiana", start: [8, 4], direction: "horizontal" },
                    { word: "VALOR", clue: "Fuerza ante adversidad", start: [4, 11], direction: "vertical" },
                    { word: "BONDAD", clue: "Cualidad del corazón", start: [6, 7], direction: "vertical" }
                ]
            },
            {
                words: [
                    { word: "TRANSFORMACION", clue: "Cambio por Espíritu", start: [1, 1], direction: "horizontal" },
                    { word: "REVELACION", clue: "Verdad revelada", start: [1, 6], direction: "vertical" },
                    { word: "SANTIFICACION", clue: "Proceso de santidad", start: [3, 2], direction: "horizontal" },
                    { word: "COMUNION", clue: "Unión con Dios", start: [1, 12], direction: "vertical" },
                    { word: "ARREPENTIR", clue: "Apartarse del pecado", start: [5, 1], direction: "horizontal" },
                    { word: "CONVERSION", clue: "Cambio de dirección", start: [7, 4], direction: "horizontal" },
                    { word: "PURIFICACION", clue: "Ser hecho puro", start: [9, 1], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "OMNIPOTENCIA", clue: "Todo-poderoso", start: [2, 2], direction: "horizontal" },
                    { word: "MISERICORDIA", clue: "Compasión infinita", start: [1, 6], direction: "vertical" },
                    { word: "PROVIDENCIA", clue: "Cuidado divino", start: [4, 1], direction: "horizontal" },
                    { word: "JUSTICIA", clue: "Rectitud perfecta", start: [2, 10], direction: "vertical" },
                    { word: "SOBERANIA", clue: "Autoridad suprema", start: [6, 3], direction: "horizontal" },
                    { word: "OMNISCIENCIA", clue: "Conocimiento total", start: [8, 1], direction: "horizontal" },
                    { word: "MAJESTAD", clue: "Grandeza divina", start: [10, 4], direction: "horizontal" }
                ]
            },
            {
                words: [
                    { word: "TRANSFIGURACION", clue: "Revelación de gloria", start: [1, 1], direction: "horizontal" },
                    { word: "RECONCILIACION", clue: "Restauración unidad", start: [1, 9], direction: "vertical" },
                    { word: "JUSTIFICACION", clue: "Declaración justicia", start: [3, 2], direction: "horizontal" },
                    { word: "PROPICIACION", clue: "Expiación pecados", start: [5, 1], direction: "horizontal" },
                    { word: "INTERCESION", clue: "Oración por otros", start: [7, 4], direction: "horizontal" },
                    { word: "GLORIFICACION", clue: "Elevación final", start: [3, 11], direction: "vertical" },
                    { word: "CONSAGRACION", clue: "Dedicado a Dios", start: [9, 2], direction: "horizontal" }
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
