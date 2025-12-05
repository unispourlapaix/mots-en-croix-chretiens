// Niveaux en français pour Mots En Croix Chrétiens
// 77 niveaux avec mots croisés chrétiens

const levelsFR = [

            {
                // Niveau 1 - Introduction avec mots en croix (grille 10x10)
                words: [
                    {
                        word: "JESUS",
                        clue: "Lumière qui guide nos pas dans l'obscurité de la vie",
                        path: [[1,3], [2,3], [3,3], [3,4], [3,5]], // Mot coudé en L
                        direction: "bent"
                    },
                    {
                        word: "AMOUR",
                        clue: "Force divine qui transforme les cœurs et unit les âmes",
                        path: [[4,0], [4,1], [4,2], [4,3], [4,4]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "PAIX",
                        clue: "Sérénité profonde qui apaise l'âme tourmentée",
                        path: [[6,2], [6,3], [7,3], [8,3]], // Coudé en L inversé
                        direction: "bent"
                    },
                    {
                        word: "FOI",
                        clue: "Confiance qui illumine le chemin de l'espoir",
                        path: [[2,6], [2,7], [2,8]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "VIE",
                        clue: "Don précieux qui fleurit dans l'amour éternel",
                        path: [[6,7], [7,7], [8,7]], // Vertical
                        direction: "vertical"
                    }
                
];

// Export pour utilisation modulaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = levelsFR;
}
