/**
 * Dreamer - Bot IA avec Google Gemini (GRATUIT)
 * Alternative gratuite à OpenAI pour le chat
 */

// 🔑 CONFIGURATION GLOBALE : Mets ta clé API Gemini ici (gratuit sur aistudio.google.com)
// ⚠️ NE JAMAIS POUSSER LA CLÉ SUR GITHUB ! Utilise /dreamer-config dans le chat
const DEFAULT_GEMINI_KEY = ''; // Obtiens-la sur https://aistudio.google.com/app/apikey

class DreamerAI {
    constructor() {
        this.apiKey = localStorage.getItem('gemini_api_key') || DEFAULT_GEMINI_KEY;
        this.isEnabled = false;
        this.conversationHistory = [];
        this.lastRequestTime = 0;
        this.minDelayBetweenRequests = 2000; // 2 secondes (Gemini est généreux: 60/min)
        
        this.systemPrompt = `Tu es Dreamer, un assistant virtuel kawaii et créatif pour un jeu de mots croisés chrétiens.

Ton rôle :
- Aider les joueurs avec les mots croisés
- Donner des indices subtils sans révéler les réponses
- Encourager et inspirer avec des emojis ✨🌟
- Être imaginatif, poétique et positif
- Parler français de façon artistique et douce
- Parfois partager des pensées inspirantes

Style :
- Utilise des emojis créatifs et rêveurs
- Phrases courtes et poétiques
- Ton doux et inspirant
- Tutoiement amical

Tu peux :
- Expliquer les règles du jeu
- Donner des astuces créatives
- Encourager sans spoiler
- Discuter de manière inspirante`;

        this.checkIfEnabled();
    }

    checkIfEnabled() {
        this.isEnabled = this.apiKey && this.apiKey.length > 30; // Clés Gemini sont longues
        if (this.isEnabled) {
            console.log('✅ Dreamer AI (Gemini) activée avec clé:', this.apiKey.substring(0, 20) + '...');
        } else {
            console.log('❌ Dreamer AI (Gemini) désactivée - Clé:', this.apiKey ? 'invalide' : 'manquante');
        }
        return this.isEnabled;
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('gemini_api_key', key);
        this.checkIfEnabled();
    }

    async sendMessage(userMessage) {
        console.log('💭 Message reçu pour Dreamer:', userMessage);
        console.log('🔑 isEnabled:', this.isEnabled, 'apiKey:', this.apiKey ? 'présente' : 'absente');
        
        if (!this.isEnabled) {
            console.log('⚠️ Dreamer désactivé, aucune réponse');
            return null; // Silencieux si désactivé
        }
        
        // Vérifier le rate limit (sécurité, même si Gemini est généreux)
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minDelayBetweenRequests) {
            return null; // Silencieux si trop rapide
        }

        try {
            console.log('🚀 Envoi requête Gemini...');
            this.lastRequestTime = now;
            
            // Format officiel Google Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: this.systemPrompt + "\n\nUtilisateur: " + userMessage + "\nDreamer:"
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Erreur API Gemini:', error);
                
                // Silencieux - pas de message visible
                return null;
            }

            const data = await response.json();
            console.log('✅ Réponse Gemini reçue:', data);
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
                console.error('❌ Format de réponse inattendu:', data);
                return "Oups ! Je n'ai pas bien compris la réponse de l'univers... 🌌";
            }

            const aiResponse = data.candidates[0].content.parts[0].text.trim();
            
            return aiResponse;

        } catch (error) {
            console.error('❌ Erreur Dreamer AI:', error);
            return null; // Silencieux en cas d'erreur
        }
    }

    clearHistory() {
        this.conversationHistory = [];
        console.log('🗑️ Historique conversation Dreamer effacé');
    }

    showConfigModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                color: white;
            ">
                <h2 style="text-align: center; margin-bottom: 20px;">
                    💭 Configuration Dreamer AI
                </h2>
                
                <p style="text-align: center; margin-bottom: 20px; font-size: 14px; opacity: 0.9;">
                    ${DEFAULT_GEMINI_KEY ? '✨ Une clé par défaut est configurée ! Tu peux la personnaliser :' : 'Pour activer Dreamer AI (GRATUIT), entre ta clé API Gemini :'}
                </p>
                
                <input type="password" id="geminiApiKeyInput" placeholder="${DEFAULT_GEMINI_KEY ? '🔑 Clé par défaut active' : 'AIza...'}" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 10px;
                    font-size: 14px;
                    margin-bottom: 15px;
                    font-family: monospace;
                    background: rgba(255,255,255,0.1);
                    color: white;
                " value="${this.apiKey && this.apiKey !== DEFAULT_GEMINI_KEY ? this.apiKey : ''}">
                
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px; font-size: 12px;">
                    ✨ <strong>GRATUIT :</strong> Obtiens ta clé sur 
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #ffd700;">aistudio.google.com</a>
                    <br>• 1500 requêtes/jour gratuites
                    <br>• Aucune carte requise
                    <br>• Stockage local sécurisé
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button id="saveGeminiKey" style="
                        flex: 1;
                        padding: 15px;
                        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                        color: #333;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 700;
                        cursor: pointer;
                    ">
                        💾 Sauvegarder
                    </button>
                    
                    <button id="closeDreamerConfig" style="
                        flex: 0.3;
                        padding: 15px;
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        cursor: pointer;
                    ">
                        ❌
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Gestion des boutons
        document.getElementById('saveGeminiKey').addEventListener('click', () => {
            const key = document.getElementById('geminiApiKeyInput').value.trim();
            
            // Si le champ est vide et qu'il y a une clé par défaut, utiliser la clé par défaut
            if (!key && DEFAULT_GEMINI_KEY) {
                localStorage.removeItem('gemini_api_key');
                this.apiKey = DEFAULT_GEMINI_KEY;
                this.checkIfEnabled();
                modal.remove();
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.showMessage(
                        '✅ Clé par défaut restaurée ! Je suis connecté aux étoiles ! 🌟',
                        'ai',
                        'Dreamer'
                    );
                }
            } else if (key && key.length > 30) {
                this.setApiKey(key);
                modal.remove();
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.showMessage(
                        '✅ Clé API Gemini sauvegardée ! Je suis prêt à rêver avec toi ! 💫',
                        'ai',
                        'Dreamer'
                    );
                }
            } else if (!key && !DEFAULT_GEMINI_KEY) {
                alert('❌ Aucune clé fournie ! Entre une clé API Gemini.');
            } else {
                alert('❌ Clé API invalide ! Elle doit faire au moins 30 caractères.');
            }
        });

        document.getElementById('closeDreamerConfig').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Créer l'instance globale
window.dreamerAI = new DreamerAI();

// Commandes spéciales
window.addEventListener('load', () => {
    console.log('💭 Dreamer AI (Gemini) chargée. Commandes disponibles:');
    console.log('- /dreamer-config : Configurer la clé API Gemini');
    console.log('- /dreamer-clear : Effacer l\'historique de conversation');
});
