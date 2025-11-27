// Niveles en español para Mots En Croix Chrétiens
// Niveles con crucigramas cristianos

const levelsES = [

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
                
];

// Export para uso modular
if (typeof module !== 'undefined' && module.exports) {
    module.exports = levelsES;
}
