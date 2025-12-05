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
        // Sélecteur de mode de salle
        const modeSelect = document.getElementById('roomModeSelect');
        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                if (window.roomSystem) {
                    window.roomSystem.setRoomMode(e.target.value);
                }
            });
        }

        // Bouton rejoindre une salle
        const joinBtn = document.getElementById('joinPlayerRoomBtn');
        const targetInput = document.getElementById('targetUsername');
        
        if (joinBtn && targetInput) {
            joinBtn.addEventListener('click', () => {
                const targetUsername = targetInput.value.trim();
                if (targetUsername) {
                    this.joinPlayerRoom(targetUsername);
                } else {
                    if (window.chatSystem) {
                        window.chatSystem.showMessage('❌ Entrez un nom de joueur', 'system');
                    }
                }
            });

            // Rejoindre avec Enter
            targetInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    joinBtn.click();
                }
            });
        }

        // Bouton quitter la salle
        if (this.leaveBtn) {
            this.leaveBtn.addEventListener('click', () => {
                if (window.roomSystem) {
                    if (confirm('Êtes-vous sûr de vouloir quitter la salle ?')) {
                        window.roomSystem.leaveRoom();
                    }
                }
            });
        }

        // Bouton fermer
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Fermer avec overlay
        const overlay = this.modal?.querySelector('.kawaii-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeModal();
            });
        }
    }

    // Rejoindre la salle d'un joueur
    async joinPlayerRoom(targetUsername) {
        if (!window.roomSystem || !window.chatSystem) {
            console.error('Room system ou chat system non initialisé');
            return;
        }

        // Pour l'instant, on demande le Peer ID
        // TODO: Implémenter un serveur de signaling pour découverte automatique
        const targetPeerId = prompt(`Peer ID de ${targetUsername} :\n(Le joueur doit vous donner son ID)`);
        
        if (!targetPeerId) {
            window.chatSystem.showMessage('❌ Peer ID requis', 'system');
            return;
        }

        await window.roomSystem.requestJoinRoom(targetUsername, targetPeerId);
    }

    // Ouvrir le modal
    openModal() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            this.updateUI();
        }
    }

    // Fermer le modal
    closeModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
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
    showRoomId() {
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

        alert(message);

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
        if (window.chatSystem) {
            window.roomUI = new RoomUI();
            window.roomSystem = new RoomSystem(window.chatSystem);
            
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
