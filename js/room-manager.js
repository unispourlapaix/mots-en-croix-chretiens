// Gestionnaire d'UI pour créer/rejoindre salles
class RoomManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Boutons
        const createRoomBtn = document.getElementById('createRoomBtn');
        const joinRoomBtn = document.getElementById('joinRoomBtn');
        const leaveRoomBtn = document.getElementById('leaveRoomBtn');
        const roomCodeInput = document.getElementById('roomCodeInput');
        const chatConnexionBtn = document.getElementById('chatConnexionBtn');
        
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => this.handleCreateRoom());
        }
        
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => this.handleJoinRoom());
        }
        
        if (leaveRoomBtn) {
            leaveRoomBtn.addEventListener('click', () => this.handleLeaveRoom());
        }
        
        // Bouton copier code
        const copyRoomCodeBtn = document.getElementById('copyRoomCodeBtn');
        if (copyRoomCodeBtn) {
            copyRoomCodeBtn.addEventListener('click', () => {
                const roomCode = document.getElementById('currentRoomCode')?.textContent;
                if (roomCode && roomCode !== '------') {
                    navigator.clipboard.writeText(roomCode).then(() => {
                        copyRoomCodeBtn.textContent = '✅';
                        setTimeout(() => {
                            copyRoomCodeBtn.textContent = '📋';
                        }, 2000);
                    }).catch(async err => {
                        console.error('Erreur copie:', err);
                        await CustomModals.showAlert('ℹ️ Code Room', 'Code: ' + roomCode);
                    });
                }
            });
        }
        
        // Bouton partager lien
        const shareRoomLinkBtn = document.getElementById('shareRoomLinkBtn');
        if (shareRoomLinkBtn) {
            shareRoomLinkBtn.addEventListener('click', async () => {
                if (window.roomSystem) {
                    const success = await window.roomSystem.copyShareLink();
                    if (success) {
                        shareRoomLinkBtn.textContent = '✅';
                        setTimeout(() => {
                            shareRoomLinkBtn.textContent = '🔗';
                        }, 2000);
                    }
                }
            });
        }
        
        // Clic sur le code pour voir en entier
        const currentRoomCode = document.getElementById('currentRoomCode');
        if (currentRoomCode) {
            currentRoomCode.addEventListener('click', () => {
                const code = currentRoomCode.textContent;
                if (code && code !== '------') {
                    this.showCodeModal(code);
                }
            });
            currentRoomCode.style.cursor = 'pointer';
        }
        
        if (chatConnexionBtn) {
            chatConnexionBtn.addEventListener('click', () => this.openConnexionTab());
        }
        
        // Enter pour rejoindre
        if (roomCodeInput) {
            roomCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleJoinRoom();
                }
            });
            
            // Supprimer espaces automatiquement (peerID sensibles à la casse, ne pas convertir)
            roomCodeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.trim();
            });
        }
        
        // Vérifier si on était dans une salle
        this.checkExistingRoom();
        
        // Écouter les changements d'authentification
        if (typeof authSystem !== 'undefined') {
            authSystem.onAuthChange(() => this.updateConnexionButton());
            // Mise à jour initiale
            this.updateConnexionButton();
        }
        
        console.log('✅ Room Manager initialisé');
    }
    
    // Afficher le code de salle dans une modal élégante
    showCodeModal(code) {
        // Supprimer les anciennes modals
        document.querySelectorAll('.code-display-modal').forEach(m => m.remove());
        
        const modal = document.createElement('div');
        modal.className = 'code-display-modal';
        modal.innerHTML = `
            <div class="modal-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9998;
                backdrop-filter: blur(4px);
            "></div>
            <div class="modal-content" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #ffffff;
                padding: 35px;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                z-index: 9999;
                text-align: center;
                min-width: 320px;
                max-width: 90vw;
            ">
                <h3 style="
                    color: #333;
                    margin: 0 0 12px 0;
                    font-size: 20px;
                    font-weight: 600;
                ">🔑 Code de la salle</h3>
                <p style="
                    color: #666;
                    margin: 0 0 20px 0;
                    font-size: 14px;
                ">Partagez ce code pour inviter vos amis</p>
                <div style="
                    background: #f8f9fa;
                    padding: 16px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border: 2px solid #e9ecef;
                ">
                    <code style="
                        font-size: 15px;
                        font-weight: 500;
                        color: #495057;
                        font-family: 'Courier New', monospace;
                        word-break: break-all;
                        line-height: 1.6;
                    ">${code}</code>
                </div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="copy-code-btn" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.2s;
                    ">📋 Copier</button>
                    <button class="close-modal-btn" style="
                        background: #e9ecef;
                        color: #495057;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.2s;
                    ">Fermer</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Bouton copier
        const copyBtn = modal.querySelector('.copy-code-btn');
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(code);
                copyBtn.textContent = '✅ Copié !';
                copyBtn.style.background = '#10ac84';
                setTimeout(() => {
                    copyBtn.textContent = '📋 Copier';
                    copyBtn.style.background = '#667eea';
                }, 2000);
            } catch (err) {
                console.error('Erreur copie:', err);
            }
        });
        
        // Bouton hover
        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.transform = 'translateY(-2px)';
            copyBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        });
        copyBtn.addEventListener('mouseleave', () => {
            copyBtn.style.transform = 'translateY(0)';
            copyBtn.style.boxShadow = 'none';
        });
        
        const closeBtn = modal.querySelector('.close-modal-btn');
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = '#dee2e6';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = '#e9ecef';
        });
        
        // Fermer
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    }
    
    async handleCreateRoom() {
        if (!window.presenceSystem) {
            await CustomModals.showAlert('❌ Système indisponible', 'Le système de présence n\'est pas initialisé');
            return;
        }
        
        // S'assurer que PeerJS est initialisé
        if (!window.simpleChatSystem?.peer) {
            console.log('🚀 Initialisation P2P avant création salle...');
            window.simpleChatSystem.initP2P();
            
            // Attendre que le peer soit prêt
            await new Promise((resolve) => {
                const checkPeer = setInterval(() => {
                    if (window.simpleChatSystem?.peer?.id) {
                        clearInterval(checkPeer);
                        resolve();
                    }
                }, 100);
                
                // Timeout après 10 secondes
                setTimeout(() => {
                    clearInterval(checkPeer);
                    resolve();
                }, 10000);
            });
        }
        
        if (!window.simpleChatSystem?.peer) {
            await CustomModals.showAlert('❌ Connexion P2P', 'Impossible d\'initialiser la connexion P2P. Vérifiez votre connexion internet.');
            return;
        }

        try {
            const roomCode = await window.presenceSystem.createRoom();
            this.showCurrentRoom(roomCode);
            
            // Désactiver les boutons créer/rejoindre
            document.getElementById('createRoomBtn').disabled = true;
            document.getElementById('joinRoomBtn').disabled = true;
            document.getElementById('roomCodeInput').disabled = true;
            
            // Auto-joindre le vocal après création de la salle
            this.autoJoinVoice();
            
        } catch (error) {
            console.error('Erreur création salle:', error);
            await CustomModals.showAlert('❌ Erreur de création', error.message);
        }
    }
    
    async handleJoinRoom() {
        const roomCodeInput = document.getElementById('roomCodeInput');
        const roomCode = roomCodeInput.value.trim();
        
        if (!roomCode) {
            await CustomModals.showAlert('⚠️ Code manquant', 'Entrez un code de salle');
            roomCodeInput.focus();
            return;
        }
        
        // Le code est maintenant un peerID complet (pas de limite stricte)
        if (roomCode.length < 3) {
            await CustomModals.showAlert('⚠️ Code invalide', 'Le code semble trop court');
            roomCodeInput.focus();
            return;
        }
        
        if (!window.presenceSystem) {
            await CustomModals.showAlert('❌ Système indisponible', 'Le système de présence n\'est pas initialisé');
            return;
        }
        
        // S'assurer que PeerJS est initialisé
        if (!window.simpleChatSystem?.peer) {
            console.log('🚀 Initialisation P2P avant rejoindre salle...');
            window.simpleChatSystem.initP2P();
            
            // Attendre que le peer soit prêt
            await new Promise((resolve) => {
                const checkPeer = setInterval(() => {
                    if (window.simpleChatSystem?.peer?.id) {
                        clearInterval(checkPeer);
                        resolve();
                    }
                }, 100);
                
                // Timeout après 10 secondes
                setTimeout(() => {
                    clearInterval(checkPeer);
                    resolve();
                }, 10000);
            });
        }
        
        if (!window.simpleChatSystem?.peer) {
            await CustomModals.showAlert('❌ Connexion P2P', 'Impossible d\'initialiser la connexion P2P. Vérifiez votre connexion internet.');
            return;
        }

        try {
            await window.presenceSystem.joinRoom(roomCode);
            this.showCurrentRoom(roomCode);
            
            // Désactiver les boutons
            document.getElementById('createRoomBtn').disabled = true;
            document.getElementById('joinRoomBtn').disabled = true;
            roomCodeInput.disabled = true;
            roomCodeInput.value = '';
            
            // Auto-joindre le vocal après jonction de la salle
            this.autoJoinVoice();
            
        } catch (error) {
            console.error('Erreur rejoindre salle:', error);
            await CustomModals.showAlert('❌ Erreur', error.message);
        }
    }
    
    async handleLeaveRoom() {
        if (!window.presenceSystem) return;
        
        if (await CustomModals.showConfirm('🚺 Quitter la salle ?', 'Voulez-vous vraiment quitter la salle ?', '🚺 Quitter', '❌ Rester')) {
            window.presenceSystem.leaveRoom();
            this.hideCurrentRoom();
            
            // Réactiver les boutons
            document.getElementById('createRoomBtn').disabled = false;
            document.getElementById('joinRoomBtn').disabled = false;
            document.getElementById('roomCodeInput').disabled = false;
        }
    }
    
    showCurrentRoom(roomCode) {
        const currentRoomInfo = document.getElementById('currentRoomInfo');
        const currentRoomCode = document.getElementById('currentRoomCode');
        
        if (currentRoomInfo) {
            currentRoomInfo.classList.remove('hidden');
        }
        
        if (currentRoomCode) {
            currentRoomCode.textContent = roomCode;
        }
        
        // Cacher actions créer/rejoindre
        const createBtn = document.getElementById('createRoomBtn');
        const joinGroup = document.querySelector('.join-room-group');
        if (createBtn) createBtn.style.display = 'none';
        if (joinGroup) joinGroup.style.display = 'none';
    }
    
    hideCurrentRoom() {
        const currentRoomInfo = document.getElementById('currentRoomInfo');
        
        if (currentRoomInfo) {
            currentRoomInfo.classList.add('hidden');
        }
        
        // Réafficher actions
        const createBtn = document.getElementById('createRoomBtn');
        const joinGroup = document.querySelector('.join-room-group');
        if (createBtn) createBtn.style.display = 'flex';
        if (joinGroup) joinGroup.style.display = 'flex';
    }
    
    checkExistingRoom() {
        // Vérifier si on était dans une salle avant
        const storedRoom = localStorage.getItem('crossword_current_room');
        if (storedRoom) {
            try {
                const roomData = JSON.parse(storedRoom);
                if (roomData.code) {
                    console.log('🏠 Salle précédente trouvée:', roomData.code);
                    this.showCurrentRoom(roomData.code);
                }
            } catch (err) {
                console.warn('Erreur lecture salle stockée');
            }
        }
    }
    
    updateConnexionButton() {
        const chatConnexionBtn = document.getElementById('chatConnexionBtn');
        if (!chatConnexionBtn) return;
        
        if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated()) {
            const user = authSystem.getCurrentUser();
            let avatar = '👤';
            
            // Récupérer l'avatar de l'utilisateur
            if (typeof window.simpleChatSystem !== 'undefined') {
                const userAvatar = window.simpleChatSystem.getUserAvatar(user.username);
                if (userAvatar) avatar = userAvatar;
            }
            
            // Bouton devient "Mon Profil" avec l'avatar
            chatConnexionBtn.innerHTML = `${avatar} ${user.username}`;
            chatConnexionBtn.classList.remove('connexion-btn');
            chatConnexionBtn.classList.add('profile-btn');
            chatConnexionBtn.title = 'Mon profil';
        } else {
            // Bouton "Connexion" par défaut
            chatConnexionBtn.innerHTML = '👤 Connexion';
            chatConnexionBtn.classList.remove('profile-btn');
            chatConnexionBtn.classList.add('connexion-btn');
            chatConnexionBtn.title = 'Se connecter';
        }
    }

    openConnexionTab() {
        // Fermer la bulle de chat flottante
        const chatBubble = document.getElementById('chatBubble');
        const chatBubbleBody = document.getElementById('chatBubbleBody');
        if (chatBubble && chatBubbleBody) {
            chatBubbleBody.style.display = 'none';
            const toggleBtn = document.getElementById('toggleChatBubble');
            if (toggleBtn) {
                toggleBtn.textContent = '+';
            }
        }
        
        // Ouvrir le menu principal
        const menuModal = document.getElementById('menuModal');
        if (menuModal) {
            menuModal.classList.remove('hidden');
        }
        
        // Activer l'onglet connexion
        const connexionTab = document.querySelector('.menu-tab[data-tab="connexion"]');
        const connexionContent = document.getElementById('connexionTabContent');
        
        if (connexionTab && connexionContent) {
            // Désactiver tous les onglets
            document.querySelectorAll('.menu-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.menu-tab-content').forEach(content => content.classList.remove('active'));
            
            // Activer l'onglet connexion
            connexionTab.classList.add('active');
            connexionContent.classList.add('active');
        }
        
        console.log('👤 Ouverture onglet connexion');
    }

    /**
     * Auto-joindre le chat vocal après création/jonction de salle
     */
    async autoJoinVoice() {
        // Attendre un peu que la salle soit bien établie
        await new Promise(resolve => setTimeout(resolve, 500));

        // Vérifier que le système vocal existe
        if (!window.voiceSystem) {
            console.log('⚠️ Système vocal non disponible');
            return;
        }

        // Vérifier que le chat système a une room active
        if (!window.simpleChatSystem?.roomId) {
            console.log('⚠️ Pas de room active pour le vocal');
            return;
        }

        try {
            console.log('🎤 Auto-connexion au vocal...');
            await window.voiceSystem.joinVoiceRoom();
            console.log('✅ Vocal activé automatiquement');
        } catch (error) {
            // Ne pas bloquer si l'utilisateur refuse le micro
            console.log('ℹ️ Vocal non activé:', error.message);
            
            // Afficher un message discret
            if (window.simpleChatSystem) {
                window.simpleChatSystem.sendSystemMessage(
                    '🎤 Vocal disponible ! Activez votre micro depuis le menu si besoin.'
                );
            }
        }
    }
}

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.roomManager = new RoomManager();
    });
} else {
    window.roomManager = new RoomManager();
}

console.log('✅ Room Manager chargé');
