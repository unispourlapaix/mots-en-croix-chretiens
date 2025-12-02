// Chat simple et léger (en mémoire, pas de DB)
class SimpleChatSystem {
    constructor() {
        this.messages = []; // Messages en mémoire seulement
        this.username = this.generateUsername();
        this.maxMessages = 50; // Limite pour performance
        this.isOpen = false;

        // Couleurs kawaii pour les utilisateurs
        this.userColors = [
            '#ff69b4', '#ff6b9d', '#c44569', '#f8b500',
            '#4b7bec', '#0abde3', '#10ac84', '#ee5a6f',
            '#c56cf0', '#ffb8b8', '#ffa801', '#54a0ff'
        ];

        this.userColor = this.userColors[Math.floor(Math.random() * this.userColors.length)];
    }

    // Générer un pseudo aléatoire
    generateUsername() {
        const adjectives = [
            'Joyeux', 'Paisible', 'Lumineux', 'Fidèle', 'Sage',
            'Courageux', 'Bienveillant', 'Radieux', 'Humble', 'Fort'
        ];
        const nouns = [
            'Disciple', 'Pèlerin', 'Serviteur', 'Gardien', 'Témoin',
            'Ami', 'Frère', 'Sœur', 'Enfant', 'Veilleur'
        ];

        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 99) + 1;

        return `${adj}${noun}${num}`;
    }

    // Envoyer un message
    sendMessage(text) {
        if (!text || text.trim() === '') return;

        const message = {
            id: Date.now(),
            username: this.username,
            color: this.userColor,
            text: text.trim(),
            timestamp: Date.now()
        };

        this.messages.push(message);

        // Limiter le nombre de messages en mémoire
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }

        // Broadcast aux autres onglets (même utilisateur)
        this.broadcastMessage(message);

        // Refresh l'affichage
        this.renderMessages();

        return message;
    }

    // Broadcast via localStorage (pour simuler multi-users entre onglets)
    broadcastMessage(message) {
        // Utiliser localStorage juste comme canal de communication temporaire
        localStorage.setItem('chatLastMessage', JSON.stringify(message));
        localStorage.removeItem('chatLastMessage'); // Supprimer immédiatement
    }

    // Écouter les messages des autres onglets
    listenToOtherTabs() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'chatLastMessage' && e.newValue) {
                try {
                    const message = JSON.parse(e.newValue);

                    // Éviter les doublons
                    if (!this.messages.find(m => m.id === message.id)) {
                        this.messages.push(message);

                        // Limiter
                        if (this.messages.length > this.maxMessages) {
                            this.messages.shift();
                        }

                        this.renderMessages();
                    }
                } catch (err) {
                    console.error('Erreur parsing message:', err);
                }
            }
        });
    }

    // Rendre les messages
    renderMessages() {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        // Garder la position de scroll
        const wasAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;

        container.innerHTML = '';

        // Trier par timestamp
        const sorted = [...this.messages].sort((a, b) => a.timestamp - b.timestamp);

        sorted.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = 'chat-message';

            const isOwn = msg.username === this.username;
            if (isOwn) {
                messageEl.classList.add('own-message');
            }

            // Header du message
            const header = document.createElement('div');
            header.className = 'chat-message-header';
            header.style.color = msg.color;

            const usernameSpan = document.createElement('span');
            usernameSpan.className = 'chat-username';
            usernameSpan.textContent = msg.username;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'chat-time';
            timeSpan.textContent = this.formatTime(msg.timestamp);

            header.appendChild(usernameSpan);
            header.appendChild(timeSpan);

            // Texte du message
            const textEl = document.createElement('div');
            textEl.className = 'chat-message-text';
            textEl.textContent = msg.text;

            messageEl.appendChild(header);
            messageEl.appendChild(textEl);

            container.appendChild(messageEl);
        });

        // Auto-scroll si on était en bas
        if (wasAtBottom) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // Formater l'heure
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Ouvrir le chat
    open() {
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.classList.remove('hidden');
            this.isOpen = true;

            // Focus sur l'input
            const input = document.getElementById('chatInput');
            if (input) input.focus();

            // Scroll to bottom
            setTimeout(() => {
                const container = document.getElementById('chatMessages');
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 100);
        }
    }

    // Fermer le chat
    close() {
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.classList.add('hidden');
            this.isOpen = false;
        }
    }

    // Toggle
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    // Changer de pseudo
    changeUsername(newUsername) {
        if (newUsername && newUsername.trim() !== '') {
            this.username = newUsername.trim();

            // Message système
            this.sendSystemMessage(`${this.username} a rejoint le chat 🙏`);
        }
    }

    // Message système
    sendSystemMessage(text) {
        const message = {
            id: Date.now(),
            username: 'Système',
            color: '#95a5a6',
            text: text,
            timestamp: Date.now(),
            isSystem: true
        };

        this.messages.push(message);
        this.broadcastMessage(message);
        this.renderMessages();
    }

    // Initialiser l'interface
    initUI() {
        // Bouton d'envoi
        const sendBtn = document.getElementById('chatSendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                const input = document.getElementById('chatInput');
                if (input) {
                    this.sendMessage(input.value);
                    input.value = '';
                }
            });
        }

        // Enter pour envoyer
        const input = document.getElementById('chatInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage(input.value);
                    input.value = '';
                }
            });
        }

        // Bouton fermer
        const closeBtn = document.getElementById('chatCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // Bouton changer pseudo
        const usernameBtn = document.getElementById('chatUsername');
        if (usernameBtn) {
            usernameBtn.textContent = this.username;
            usernameBtn.addEventListener('click', () => {
                const newUsername = prompt('Nouveau pseudo:', this.username);
                if (newUsername) {
                    this.changeUsername(newUsername);
                    usernameBtn.textContent = this.username;
                }
            });
        }

        // Écouter les autres onglets
        this.listenToOtherTabs();

        // Message de bienvenue
        this.sendSystemMessage('Bienvenue dans le chat ! 💬');
    }

    // Nettoyer les vieux messages (appelé périodiquement)
    cleanup() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutes

        this.messages = this.messages.filter(msg => {
            return (now - msg.timestamp) < maxAge;
        });

        this.renderMessages();
    }
}

// Instance globale
const chatSystem = new SimpleChatSystem();

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        chatSystem.initUI();
    });
} else {
    chatSystem.initUI();
}

// Nettoyage périodique (toutes les 5 minutes)
setInterval(() => {
    chatSystem.cleanup();
}, 5 * 60 * 1000);
