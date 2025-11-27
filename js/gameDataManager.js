// Gestionnaire de données de jeu multilingue avec chargement dynamique des niveaux
// Supporte le fallback automatique vers le français pour les niveaux non traduits

class GameDataManager {
    constructor() {
        // Import des niveaux par langue (lazy loading)
        this.levelCache = {};
        this.currentLanguage = 'fr';

        // Langues supportées
        this.supportedLanguages = [
            'fr', 'en', 'es', 'de', 'it', 'pt', 'ru',
            'zh', 'ko', 'ja', 'ar', 'hi', 'pl', 'sw'
        ];

        // Chemins des fichiers de niveaux
        this.levelPaths = {
            fr: './levels/levels-fr.js',
            en: './levels/levels-en.js',
            es: './levels/levels-es.js',
            de: './levels/levels-de.js',
            it: './levels/levels-it.js',
            pt: './levels/levels-pt.js',
            ru: './levels/levels-ru.js',
            zh: './levels/levels-zh.js',
            ko: './levels/levels-ko.js',
            ja: './levels/levels-ja.js',
            ar: './levels/levels-ar.js',
            hi: './levels/levels-hi.js',
            pl: './levels/levels-pl.js',
            sw: './levels/levels-sw.js'
        };
    }

    /**
     * Charge les niveaux pour une langue donnée
     * @param {string} lang - Code de la langue
     * @returns {Promise<Array>} - Tableau des niveaux
     */
    async loadLevels(lang) {
        // Si déjà en cache, retourner le cache
        if (this.levelCache[lang]) {
            return this.levelCache[lang];
        }

        // Essayer de charger les niveaux pour cette langue
        try {
            const script = document.createElement('script');
            script.src = `js/levels/levels-${lang}.js`;

            // Attendre le chargement du script
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });

            // Récupérer les niveaux depuis la variable globale
            const levelsVarName = `levels${lang.toUpperCase()}`;
            if (window[levelsVarName]) {
                this.levelCache[lang] = window[levelsVarName];
                return this.levelCache[lang];
            }
        } catch (error) {
            console.warn(`Impossible de charger les niveaux pour ${lang}, fallback vers français`);
        }

        // Fallback vers le français si la langue n'est pas disponible
        if (lang !== 'fr' && !this.levelCache['fr']) {
            await this.loadLevels('fr');
        }

        // Retourner les niveaux français comme fallback
        return this.levelCache['fr'] || [];
    }

    /**
     * Change la langue courante
     * @param {string} lang - Code de la langue
     * @returns {Promise<boolean>} - true si le changement a réussi
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Langue ${lang} non supportée`);
            return false;
        }

        this.currentLanguage = lang;

        // Précharger les niveaux
        await this.loadLevels(lang);

        return true;
    }

    /**
     * Récupère un niveau spécifique
     * @param {number} levelNumber - Numéro du niveau (1-based)
     * @returns {Object|null} - Données du niveau ou null
     */
    getLevelData(levelNumber) {
        const levels = this.levelCache[this.currentLanguage];

        if (!levels) {
            console.error(`Niveaux non chargés pour ${this.currentLanguage}`);
            return null;
        }

        if (levelNumber < 1 || levelNumber > levels.length) {
            console.error(`Niveau ${levelNumber} hors limites`);
            return null;
        }

        return levels[levelNumber - 1];
    }

    /**
     * Récupère tous les niveaux pour la langue courante
     * @returns {Array} - Tableau de tous les niveaux
     */
    getAllLevels() {
        return this.levelCache[this.currentLanguage] || [];
    }

    /**
     * Récupère le nombre total de niveaux
     * @returns {number} - Nombre de niveaux
     */
    getTotalLevels() {
        const levels = this.levelCache[this.currentLanguage];
        return levels ? levels.length : 0;
    }

    /**
     * Vérifie si une langue a des niveaux traduits
     * @param {string} lang - Code de la langue
     * @returns {boolean} - true si des niveaux existent
     */
    hasTranslation(lang) {
        return !!this.levelCache[lang];
    }

    /**
     * Obtient la langue courante
     * @returns {string} - Code de la langue courante
     */
    getLanguage() {
        return this.currentLanguage;
    }
}

// Exporter une instance unique (singleton) avec initialisation synchrone pour compatibilité
const gameDataManager = new GameDataManager();

// Initialisation synchrone pour la compatibilité avec l'ancien code
// On garde temporairement l'ancien gameData en mémoire
if (typeof gameData !== 'undefined') {
    // Si gameData existe déjà (ancien système), on l'utilise pour initialiser le cache
    if (gameData.fr && gameData.fr.levels) {
        gameDataManager.levelCache.fr = gameData.fr.levels;
    }
    if (gameData.es && gameData.es.levels) {
        gameDataManager.levelCache.es = gameData.es.levels;
    }
}

// Pour les environnements ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = gameDataManager;
}
