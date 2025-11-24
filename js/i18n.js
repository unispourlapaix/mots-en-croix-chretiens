// Module de traduction (Internationalisation)
const translations = {
    fr: {
        // Titres et en-têtes
        gameTitle: "🙏 Mots En Croix Chrétiens 🙏",
        gameSubtitle: "Trouve les mots d'encouragement et les mots bibliques",
        
        // Interface
        level: "Niveau",
        score: "Score",
        points: "points",
        
        // Boutons
        play: "🎮 Jouer",
        check: "✅ Vérifier",
        hint: "💡 Indice",
        nextLevel: "➡️ Niveau Suivant",
        reset: "🔄 Recommencer",
        
        // Sections
        horizontal: "➡️ Horizontal",
        vertical: "⬇️ Vertical",
        
        // Messages
        congratulations: "🎉 Félicitations ! Niveau terminé !",
        progress: "Progression: {percent}% - Continue !",
        finalScore: "🏆 Félicitations ! Tu as terminé tous les niveaux ! Score final: {score} points",
        letters: "lettres",
        
        // Mots d'encouragement
        encouragingWords: [
            "Jésus t'aime",
            "Tu es une créature merveilleuse",
            "Persévère",
            "Courage",
            "Foi",
            "Force",
            "Espoir"
        ]
    },
    
    en: {
        // Titles and headers
        gameTitle: "🙏 Christian Crosswords 🙏",
        gameSubtitle: "Find encouraging words and biblical words",
        
        // Interface
        level: "Level",
        score: "Score",
        points: "points",
        
        // Buttons
        play: "🎮 Play",
        check: "✅ Check",
        hint: "💡 Hint",
        nextLevel: "➡️ Next Level",
        reset: "🔄 Restart",
        
        // Sections
        horizontal: "➡️ Across",
        vertical: "⬇️ Down",
        
        // Messages
        congratulations: "🎉 Congratulations! Level completed!",
        progress: "Progress: {percent}% - Keep going!",
        finalScore: "🏆 Congratulations! You completed all levels! Final score: {score} points",
        letters: "letters",
        
        // Encouraging words
        encouragingWords: [
            "Jesus loves you",
            "You are wonderfully made",
            "Persevere",
            "Courage",
            "Faith",
            "Strength",
            "Hope"
        ]
    },
    
    es: {
        // Títulos y encabezados
        gameTitle: "🙏 Crucigramas Cristianos 🙏",
        gameSubtitle: "Encuentra palabras de aliento y palabras bíblicas",
        
        // Interfaz
        level: "Nivel",
        score: "Puntuación",
        points: "puntos",
        
        // Botones
        play: "🎮 Jugar",
        check: "✅ Verificar",
        hint: "💡 Pista",
        nextLevel: "➡️ Siguiente Nivel",
        reset: "🔄 Reiniciar",
        
        // Secciones
        horizontal: "➡️ Horizontal",
        vertical: "⬇️ Vertical",
        
        // Mensajes
        congratulations: "🎉 ¡Felicidades! ¡Nivel completado!",
        progress: "Progreso: {percent}% - ¡Continúa!",
        finalScore: "🏆 ¡Felicidades! ¡Completaste todos los niveles! Puntuación final: {score} puntos",
        letters: "letras",
        
        // Palabras de aliento
        encouragingWords: [
            "Jesús te ama",
            "Eres una criatura maravillosa",
            "Persevera",
            "Valor",
            "Fe",
            "Fuerza",
            "Esperanza"
        ]
    }
};

class I18n {
    constructor(defaultLanguage = 'fr') {
        this.currentLanguage = defaultLanguage;
        this.translations = translations;
    }
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            // Déclencher un événement pour mettre à jour l'interface
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
            return true;
        }
        return false;
    }
    
    getLanguage() {
        return this.currentLanguage;
    }
    
    t(key, replacements = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || key;
        
        // Remplacer les variables dans la chaîne (ex: {score}, {percent})
        return translation.replace(/\{(\w+)\}/g, (match, variable) => {
            return replacements[variable] !== undefined ? replacements[variable] : match;
        });
    }
    
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
    
    getLanguageName(code) {
        const names = {
            fr: 'Français',
            en: 'English',
            es: 'Español'
        };
        return names[code] || code;
    }
}

// Exporter une instance unique (singleton)
const i18n = new I18n();

// Pour les environnements ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}
