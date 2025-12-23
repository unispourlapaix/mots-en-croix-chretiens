/**
 * Template de configuration locale
 * Copie ce fichier en config.local.js et ajoute tes clés API
 */

// Clé API Google Gemini (gratuit sur https://aistudio.google.com/app/apikey)
const GEMINI_API_KEY = '';

// Clé API OpenAI (si tu en as une)
const OPENAI_API_KEY = '';

// Export pour utilisation dans les autres fichiers
if (typeof window !== 'undefined') {
    window.LOCAL_CONFIG = {
        GEMINI_API_KEY,
        OPENAI_API_KEY
    };
}
