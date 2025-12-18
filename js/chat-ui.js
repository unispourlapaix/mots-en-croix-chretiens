/**
 * Chat UI - Interface utilisateur pour le système P2P
 * Wire l'UI du menu au SimpleChatSystem
 */

class ChatUI {
    constructor() {
        this.chatSystem = window.simpleChatSystem;
        this.authSystem = window.authSystem;
        
        // Éléments DOM - Menu
        this.chatUsername = document.getElementById('chatUsername');
        this.chatParticipantCount = document.getElementById('chatParticipantCount');
        this.chatJoinRoomBtn = document.getElementById('chatJoinRoomBtn');
        this.chatRoomCodeInput = document.getElementById('chatRoomCodeInput');
        this.chatRoomCodeDisplay = document.getElementById('chatRoomCodeDisplay');
        this.chatRoomCode = document.getElementById('chatRoomCode');
        this.chatCopyCodeBtn = document.getElementById('chatCopyCodeBtn');
        this.chatMessageArea = document.getElementById('chatMessageArea');
        this.chatMessageInput = document.getElementById('chatMessageInput');
        this.chatSendBtn = document.getElementById('chatSendBtn');
        
        // Éléments DOM - Interface SMS
        this.chatSmsContainer = document.getElementById('chatSmsContainer');
        this.chatSmsInput = document.getElementById('chatSmsInput');
        this.chatSmsSend = document.getElementById('chatSmsSend');
        this.chatSmsClose = document.getElementById('chatSmsClose');
        this.chatSmsParticipants = document.getElementById('chatSmsParticipants');
        
        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        // Écouter la création automatique de room
        window.addEventListener('roomCreated', (e) => {
            this.displayRoomCode(e.detail.roomCode);
        });

        // Bouton rejoindre une room
        if (this.chatJoinRoomBtn) {
            this.chatJoinRoomBtn.addEventListener('click', () => this.handleJoinRoom());
        }

        // Enter dans l'input de code pour rejoindre
        if (this.chatRoomCodeInput) {
            this.chatRoomCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleJoinRoom();
                }
            });
        }

        // Bouton copier le code
        if (this.chatCopyCodeBtn) {
            this.chatCopyCodeBtn.addEventListener('click', () => this.handleCopyCode());
        }

        // Bouton envoyer SMS
        if (this.chatSmsSend) {
            this.chatSmsSend.addEventListener('click', () => this.handleSendSms());
        }

        // Enter dans l'input SMS
        if (this.chatSmsInput) {
            this.chatSmsInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSendSms();
                }
            });
        }

        // Écouter les changements d'authentification
        if (this.authSystem) {
            this.authSystem.onAuthChange(() => {
                this.updateUI();
            });
        }

        // Écouter les changements de connexion P2P
        if (this.chatSystem) {
            // Interval pour mettre à jour le compteur de participants
            setInterval(() => {
                this.updateParticipantCount();
                this.updateSmsParticipantCount();
            }, 1000);
        }
    }

    displayRoomCode(roomCode) {
        // Afficher le code
        if (this.chatRoomCode) {
            this.chatRoomCode.textContent = roomCode;
        }
        if (this.chatRoomCodeDisplay) {
            this.chatRoomCodeDisplay.classList.remove('hidden');
        }
    }

    async handleJoinRoom() {
        const roomCode = this.chatRoomCodeInput?.value.trim();
        if (!roomCode) {
            alert('Veuillez entrer un code de room');
            return;
        }

        // Initialiser P2P si nécessaire
        if (this.chatSystem && !this.chatSystem.peer) {
            this.chatSystem.initP2P();
            // Attendre un peu que P2P s'initialise
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!this.chatSystem || !this.chatSystem.peer) {
            alert('Impossible d\'initialiser le chat P2P. Réessayez dans quelques secondes.');
            return;
        }

        try {
            const success = await this.chatSystem.joinRoom(roomCode);

            // Vider le champ de saisie
            if (this.chatRoomCodeInput) {
                this.chatRoomCodeInput.value = '';
            }

            if (success) {
                this.chatSystem.showMessage('✅ Connecté à la room!', 'system');
                
                // NE PAS fermer le menu, rester sur l'onglet Chat
                // L'utilisateur peut voir les connectés et discuter
                
                // Afficher le chat SMS
                const chatSmsContainer = document.getElementById('chatSmsContainer');
                if (chatSmsContainer) {
                    chatSmsContainer.classList.remove('hidden');
                }
                
                console.log('✅ Room rejointe avec succès:', roomCode);
            }
        } catch (error) {
            console.error('Erreur connexion room:', error);
            alert('Erreur lors de la connexion: ' + error.message);
        }
    }

    handleCopyCode() {
        const code = this.chatRoomCode?.textContent;
        if (!code || code === 'Démarrez une partie') return;

        navigator.clipboard.writeText(code).then(() => {
            if (this.chatCopyCodeBtn) {
                const originalText = this.chatCopyCodeBtn.textContent;
                this.chatCopyCodeBtn.textContent = '✅ Copié!';
                setTimeout(() => {
                    this.chatCopyCodeBtn.textContent = originalText;
                }, 2000);
            }
        }).catch(err => {
            console.error('Erreur copie:', err);
            alert('Erreur lors de la copie du code');
        });
    }

    handleSendMessage() {
        const message = this.chatMessageInput?.value.trim();
        if (!message) return;

        if (!this.chatSystem) {
            alert('Le système de chat n\'est pas disponible');
            return;
        }

        try {
            this.chatSystem.sendMessage(message);
            
            // Vider l'input
            if (this.chatMessageInput) {
                this.chatMessageInput.value = '';
            }
        } catch (error) {
            console.error('Erreur envoi message:', error);
            alert('Erreur lors de l\'envoi du message');
        }
    }

    handleSendSms() {
        const message = this.chatSmsInput?.value.trim();
        if (!message) return;

        if (!this.chatSystem) {
            return;
        }

        try {
            this.chatSystem.sendMessage(message);
            
            // Vider l'input SMS
            if (this.chatSmsInput) {
                this.chatSmsInput.value = '';
            }
        } catch (error) {
            console.error('Erreur envoi SMS:', error);
        }
    }

    updateSmsParticipantCount() {
        if (!this.chatSmsParticipants || !this.chatSystem) return;
        const count = this.chatSystem.getPlayerCount();
        this.chatSmsParticipants.textContent = `${count} 👥`;
    }

    updateUI() {
        // Mettre à jour le nom d'utilisateur
        if (this.chatUsername) {
            if (this.authSystem && this.authSystem.isAuthenticated()) {
                const username = this.authSystem.currentUser?.username || 'Utilisateur';
                this.chatUsername.textContent = `Connecté: ${username}`;
                this.chatUsername.style.color = '#4caf50';
            } else {
                this.chatUsername.textContent = 'Non connecté';
                this.chatUsername.style.color = '#666';
            }
        }

        // Mettre à jour le compteur de participants
        this.updateParticipantCount();
    }

    updateParticipantCount() {
        if (!this.chatParticipantCount || !this.chatSystem) return;

        const count = this.chatSystem.getPlayerCount();
        this.chatParticipantCount.textContent = `${count} 👥`;
    }

    // Rendre le chat repositionnable sur mobile
    makeDraggable() {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;

        const chatHeader = chatContainer.querySelector('.chat-header');
        if (!chatHeader) return;

        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;

        chatHeader.style.cursor = 'move';
        chatHeader.style.touchAction = 'none';

        const dragStart = (e) => {
            if (window.innerWidth > 768) return; // Seulement sur mobile

            const touch = e.type.includes('touch') ? e.touches[0] : e;
            initialX = touch.clientX - currentX;
            initialY = touch.clientY - currentY;
            isDragging = true;
        };

        const drag = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const touch = e.type.includes('touch') ? e.touches[0] : e;
            currentX = touch.clientX - initialX;
            currentY = touch.clientY - initialY;

            chatContainer.style.transform = `translate(${currentX}px, ${currentY}px)`;
        };

        const dragEnd = () => {
            isDragging = false;
        };

        // Touch events
        chatHeader.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);

        // Mouse events pour test desktop
        chatHeader.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    }
}

// Initialiser l'UI quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chatUI = new ChatUI();
        window.chatUI.makeDraggable();
    });
} else {
    window.chatUI = new ChatUI();
    window.chatUI.makeDraggable();
}
