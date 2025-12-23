// Interface utilisateur pour le système de salles
class RoomUI {
    constructor() {
        this.modal = document.getElementById('multiplayerModal');
        this.hostPanel = document.getElementById('hostControlPanel');
        this.availablePanel = document.getElementById('availablePlayersPanel');
        this.leaveBtn = document.getElementById('leaveRoomBtn');
        this.closeBtn = document.getElementById('closeMultiplayerBtn');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Sélecteur de statut de connexion
        const modeSelect = document.getElementById('acceptModeSelect');
        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                if (window.roomSystem) {
                    window.roomSystem.setAcceptMode(e.target.value);
                }
            });
        }

        // Bouton quitter la salle
        if (this.leaveBtn) {
            this.leaveBtn.addEventListener('click', async () => {
                if (window.roomSystem) {
                    if (await CustomModals.showConfirm('🚺 Quitter la salle ?', 'Êtes-vous sûr de vouloir quitter la salle ?', '🚺 Quitter', '❌ Rester')) {
                        window.roomSystem.leaveRoom();
                    }
                }
            });
        }

        // Bouton fermer
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                console.log('🔴 Fermeture du modal multijoueur');
                this.closeModal();
            });
        } else {
            console.warn('⚠️ Bouton closeMultiplayerBtn introuvable');
        }

        // Fermer avec overlay
        const overlay = this.modal?.querySelector('.kawaii-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeModal();
            });
        }
    }

    // Ouvrir le modal
    openModal() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            this.updateUI();
            
            // Minimiser la bulle de chat
            const chatBubble = document.getElementById('chatBubble');
            const toggleBtn = document.getElementById('toggleChatBubble');
            if (chatBubble && !chatBubble.classList.contains('minimized')) {
                chatBubble.classList.add('minimized');
                if (toggleBtn) toggleBtn.textContent = '+';
            }
        }
    }

    // Fermer le modal
    closeModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            
            // Rouvrir la bulle de chat
            const chatBubble = document.getElementById('chatBubble');
            const toggleBtn = document.getElementById('toggleChatBubble');
            if (chatBubble && chatBubble.classList.contains('minimized')) {
                chatBubble.classList.remove('minimized');
                if (toggleBtn) toggleBtn.textContent = '−';
            }
        }
    }

    // Mettre à jour l'interface
    updateUI() {
        if (!window.chatSystem) return;

        const isHost = window.chatSystem.isHost;
        const isInRoom = window.roomSystem?.playersInRoom.size > 1;

        // Afficher/masquer les panels
        if (this.hostPanel) {
            if (isHost) {
                this.hostPanel.classList.remove('hidden');
            } else {
                this.hostPanel.classList.add('hidden');
            }
        }

        if (this.availablePanel) {
            if (!isInRoom) {
                this.availablePanel.classList.remove('hidden');
            } else {
                this.availablePanel.classList.add('hidden');
            }
        }

        // Afficher/masquer le bouton quitter
        if (this.leaveBtn) {
            if (isInRoom && !isHost) {
                this.leaveBtn.classList.remove('hidden');
            } else {
                this.leaveBtn.classList.add('hidden');
            }
        }
    }

    // Afficher l'ID de la salle (pour partage manuel)
    async showRoomId() {
        if (!window.chatSystem || !window.chatSystem.peer) return;

        const peerId = window.chatSystem.peer.id;
        const username = window.chatSystem.currentUser;

        const message = `
🏠 Votre Salle
━━━━━━━━━━━━━━━━
👤 Hôte: ${username}
🔑 ID: ${peerId}

Partagez cet ID pour que d'autres joueurs rejoignent !
        `.trim();

        await CustomModals.showAlert('🆔 Informations de connexion', message);

        // Copier dans le presse-papier
        if (navigator.clipboard) {
            navigator.clipboard.writeText(peerId).then(() => {
                if (window.chatSystem) {
                    window.chatSystem.showMessage('📋 ID copié !', 'system');
                }
            });
        }
    }
}

// Initialiser l'UI
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que chatSystem soit prêt
    const initRoomSystem = () => {
        // Utiliser simpleChatSystem au lieu de chatSystem
        const chatSystem = window.simpleChatSystem || window.chatSystem;
        
        // Vérifier que RoomSystem est défini
        if (!window.RoomSystem || typeof RoomSystem === 'undefined') {
            console.log('⏳ En attente de RoomSystem...');
            setTimeout(initRoomSystem, 100);
            return;
        }
        
        if (chatSystem) {
            console.log('🏠 Initialisation du Room System...');
            window.roomUI = new RoomUI();
            window.roomSystem = new RoomSystem(chatSystem);
            
            // Créer un alias pour compatibilité
            if (!window.chatSystem) {
                window.chatSystem = chatSystem;
            }
            
            // Ajouter un bouton pour afficher l'ID de salle
            const hostPanel = document.getElementById('hostControlPanel');
            if (hostPanel && !document.getElementById('showRoomIdBtn')) {
                const showIdBtn = document.createElement('button');
                showIdBtn.id = 'showRoomIdBtn';
                showIdBtn.textContent = '🔑 Partager Mon ID';
                showIdBtn.className = 'kawaii-modal-button';
                showIdBtn.style.cssText = 'margin: 10px 0; width: 100%;';
                showIdBtn.addEventListener('click', () => {
                    window.roomUI.showRoomId();
                });

                const firstSection = hostPanel.querySelector('.panel-section');
                if (firstSection) {
                    hostPanel.insertBefore(showIdBtn, firstSection);
                }
            }
            
            console.log('✅ Room System initialisé');
        } else {
            // Réessayer dans 500ms
            setTimeout(initRoomSystem, 500);
        }
    };

    initRoomSystem();

    // Modifier le bouton multijoueur pour ouvrir le nouveau modal
    const findMultiplayerBtn = () => {
        const multiplayerBtn = document.querySelector('[onclick*="toggleMultiplayerModal"]') ||
                             document.querySelector('#multiplayerBtn') ||
                             document.querySelector('button[onclick*="multiplayer"]');
        
        if (multiplayerBtn) {
            multiplayerBtn.onclick = null;
            multiplayerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.roomUI) {
                    window.roomUI.openModal();
                }
            });
            console.log('✅ Bouton multijoueur connecté');
        } else {
            setTimeout(findMultiplayerBtn, 500);
        }
    };

    findMultiplayerBtn();
});
