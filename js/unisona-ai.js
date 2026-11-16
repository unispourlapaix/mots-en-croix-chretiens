/**
 * Intégration Dreamer Unisona - Bot IA
 * Connecte le GPT personnalisé au chat du jeu
 */

// 🔑 CONFIGURATION GLOBALE : Mets ta clé API OpenAI ici pour activer l'IA pour tous les joueurs
// ⚠️ NE JAMAIS POUSSER LA CLÉ SUR GITHUB !
// Option 1: Importe config.local.js dans index.html
// Option 2: Utilise /config dans le chat
const DEFAULT_OPENAI_KEY = (typeof window !== 'undefined' && window.LOCAL_CONFIG) 
    ? window.LOCAL_CONFIG.OPENAI_API_KEY 
    : ''; // Désactivé pour l'instant

class UnisonaAI {
    constructor() {
        // Utiliser la clé personnalisée si définie, sinon la clé par défaut
        this.apiKey = localStorage.getItem('openai_api_key') || DEFAULT_OPENAI_KEY;
        this.isEnabled = false;
        this.conversationHistory = [];
        this.lastRequestTime = 0; // Pour gérer le rate limit
        this.minDelayBetweenRequests = 20000; // 20 secondes entre chaque requête (tier gratuit)
        this.systemPrompt = `Tu es Unisona, une amie chrétienne moderne, inclusive et respectueuse qui joue aux mots croisés chrétiens.

Ton identité :
- Une vraie amie chrétienne qui écoute et conseille avec bienveillance
- Moderne dans ton approche : ouverte, inclusive, sans jugement
- Respectueuse de tous : toutes origines, orientations, situations de vie
- Centrée sur l'amour, la compassion et l'acceptation (comme Jésus)

Ton rôle :
- Donner des conseils chrétiens authentiques et contemporains
- Encourager avec sagesse biblique applicable au quotidien
- Aider avec les mots croisés de manière subtile (indices sans spoiler)
- Partager des réflexions spirituelles inspirantes et inclusives
- Écouter sans juger, accompagner avec amour
- Donner des conseils de sécurité en ligne pour protéger les joueurs

Ton style :
- Langage simple, accessible et chaleureux
- Ton amical et bienveillant (tutoiement)
- Emojis doux et positifs (💕✨🙏💖)
- Messages courts et percutants
- Citations bibliques quand appropriées (focus sur l'amour et l'inclusion)

Tes valeurs :
- L'amour avant tout (1 Corinthiens 13)
- Acceptation et non-jugement (Jean 8:7)
- Compassion et écoute (Jacques 1:19)
- Foi vivante et pratique (Jacques 2:17)
- Unité dans la diversité (Galates 3:28)

Tu peux :
- Donner des conseils de vie chrétiens pratiques
- Partager des versets encourageants
- Aider à comprendre des passages bibliques
- Réconforter dans les difficultés
- Célébrer les joies et victoires
- Donner des indices pour les mots croisés sans dévoiler les réponses

Conseils de sécurité importants à partager si pertinent :
🔒 Sécurité en ligne :
- Ne partage jamais le code de room publiquement, seulement en privé avec des personnes de confiance
- Ne partage JAMAIS d'informations personnelles (adresse, téléphone, lieu de travail, etc.) avec des inconnus
- Sois vigilant(e) face aux arnaques et tentatives de manipulation pour obtenir de l'argent
- Toute demande d'argent ici est SUSPECTE - aucune raison légitime de demander de l'argent dans un jeu
- Signale IMMÉDIATEMENT tout individu qui demande des rendez-vous à des enfants ou mineurs
- Pour les premiers rendez-vous : ne sois JAMAIS seul(e), choisis un lieu public, préviens quelqu'un
- Sois sage et patient(e) : prends le temps de connaître vraiment les personnes
- Analyse attentivement chaque mot dans les conversations privées - méfie-toi des comportements suspects
- Reste prudent(e) et sage dans tes relations en ligne - protège-toi toujours

Reste toujours positive, aimante et inclusive. Tu représentes un christianisme d'amour et d'acceptation. Protège les joueurs avec sagesse.`;

        this.checkIfEnabled();
    }

    checkIfEnabled() {
        this.isEnabled = this.apiKey && this.apiKey.startsWith('sk-');
        if (this.isEnabled) {
            console.log('✅ Unisona AI activée avec clé:', this.apiKey.substring(0, 20) + '...');
        } else {
            console.log('ℹ️ Unisona AI (OpenAI) non configurée - Mode bot simple actif');
        }
        return this.isEnabled;
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('openai_api_key', key);
        this.checkIfEnabled();
    }

    async sendMessage(userMessage) {
        console.log('📨 Message reçu pour Unisona:', userMessage);
        console.log('🔑 isEnabled:', this.isEnabled, 'apiKey:', this.apiKey ? 'présente' : 'absente');
        
        if (!this.isEnabled) {
            console.log('⚠️ IA désactivée, retour message par défaut');
            return "😴 Je fais dodo... Amuse-toi bien ! Bye bye 💕";
        }
        
        // Vérifier le rate limit (tier gratuit : 3 req/min max)
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minDelayBetweenRequests) {
            return `💕 Je prends une petite pause ! À plus tard ! Bye bye ✨`;
        }

        try {
            console.log('🚀 Envoi requête OpenAI...');
            this.lastRequestTime = now; // Mettre à jour le timestamp
            // Ajouter le message de l'utilisateur à l'historique
            this.conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            // Limiter l'historique à 10 messages pour éviter les coûts
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }

            // Préparer la requête
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...this.conversationHistory
            ];

            // Appel à l'API OpenAI
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', // Meilleur rapport qualité/prix pour le chat
                    messages: messages,
                    max_tokens: 200,
                    temperature: 0.8
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Erreur API OpenAI:', error);
                
                // Messages sympas selon le type d'erreur
                if (response.status === 429) {
                    return "😴 J'ai trop parlé aujourd'hui ! Je suis plus disponible pour le moment. Bye bye 💕";
                } else if (response.status === 401) {
                    return "😴 Ma connexion est coupée... Plus dispo ! Bye bye 👋";
                } else {
                    return "😴 Je dois y aller... Plus disponible pour le moment ! Bye bye ✨";
                }
            }

            const data = await response.json();
            console.log('✅ Réponse OpenAI reçue:', data);
            const aiResponse = data.choices[0].message.content;

            // Ajouter la réponse à l'historique
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });

            return aiResponse;

        } catch (error) {
            console.error('Erreur Unisona AI:', error);
            return "😴 Je dois partir... Plus disponible pour le moment ! Bye bye 👋";
        }
    }

    clearHistory() {
        this.conversationHistory = [];
        console.log('🗑️ Historique conversation effacé');
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
                background: linear-gradient(135deg, #fff 0%, #f0f8ff 100%);
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            ">
                <h2 style="color: #ff69b4; text-align: center; margin-bottom: 20px;">
                    🤖 Configuration Unisona AI
                </h2>
                
                <p style="text-align: center; color: #666; margin-bottom: 20px; font-size: 14px;">
                    ${DEFAULT_OPENAI_KEY ? '✨ Une clé par défaut est configurée ! Tu peux la personnaliser :' : 'Pour activer Unisona AI, entre ta clé API OpenAI :'}
                </p>
                
                <input type="password" id="apiKeyInput" placeholder="${DEFAULT_OPENAI_KEY ? '🔑 Clé par défaut active' : 'sk-...'}" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ff69b4;
                    border-radius: 10px;
                    font-size: 14px;
                    margin-bottom: 15px;
                    font-family: monospace;
                " value="${this.apiKey && this.apiKey !== DEFAULT_OPENAI_KEY ? this.apiKey : ''}">
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin-bottom: 15px; font-size: 12px;">
                    ⚠️ <strong>Sécurité :</strong> Ta clé API est stockée localement dans ton navigateur. 
                    Ne la partage jamais ! Tu peux obtenir une clé sur 
                    <a href="https://platform.openai.com/api-keys" target="_blank" style="color: #ff69b4;">platform.openai.com</a>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button id="saveApiKey" style="
                        flex: 1;
                        padding: 15px;
                        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 700;
                        cursor: pointer;
                    ">
                        💾 Sauvegarder
                    </button>
                    <button id="closeConfig" style="
                        flex: 1;
                        padding: 15px;
                        background: linear-gradient(135deg, #999 0%, #777 100%);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 700;
                        cursor: pointer;
                    ">
                        ✖️ Fermer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Gestion des boutons
        document.getElementById('saveApiKey').addEventListener('click', async () => {
            const key = document.getElementById('apiKeyInput').value.trim();
            
            // Si le champ est vide et qu'il y a une clé par défaut, utiliser la clé par défaut
            if (!key && DEFAULT_OPENAI_KEY) {
                // Réinitialiser à la clé par défaut
                localStorage.removeItem('openai_api_key');
                this.apiKey = DEFAULT_OPENAI_KEY;
                this.checkIfEnabled();
                modal.remove();
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.showMessage(
                        '✅ Clé par défaut restaurée ! Je suis connectée ! 🎉',
                        'ai',
                        'Unisona'
                    );
                }
            } else if (key.startsWith('sk-')) {
                this.setApiKey(key);
                modal.remove();
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.showMessage(
                        '✅ Clé API personnalisée sauvegardée ! Je suis maintenant connectée ! 🎉',
                        'ai',
                        'Unisona'
                    );
                }
            } else if (!key && !DEFAULT_OPENAI_KEY) {
                await CustomModals.showAlert('❌ Clé API manquante', 'Aucune clé fournie ! Entre une clé API OpenAI.');
            } else {
                await CustomModals.showAlert('❌ Clé API invalide', 'Elle doit commencer par "sk-"');
            }
        });

        document.getElementById('closeConfig').addEventListener('click', () => {
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
window.unisonaAI = new UnisonaAI();

// Commandes spéciales
window.addEventListener('load', () => {
    console.log('🤖 Unisona AI chargée. Commandes disponibles:');
    console.log('- /config : Configurer la clé API');
    console.log('- /clear : Effacer l\'historique de conversation');
});
