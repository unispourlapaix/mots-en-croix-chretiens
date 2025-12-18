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
                    }).catch(err => {
                        console.error('Erreur copie:', err);
                        alert('Code: ' + roomCode);
                    });
                }
            });
        }
        
        // Clic sur le code pour voir en entier
        const currentRoomCode = document.getElementById('currentRoomCode');
        if (currentRoomCode) {
            currentRoomCode.addEventListener('click', () => {
                const code = currentRoomCode.textContent;
                if (code && code !== '------') {
                    alert('Code complet:\n\n' + code + '\n\nPartagez ce code avec vos amis pour qu\'ils rejoignent votre salle !');
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
            
            // Format automatique en majuscules
            roomCodeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
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
    
    async handleCreateRoom() {
        if (!window.presenceSystem) {
            alert('❌ Système de présence non initialisé');
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
            alert('❌ Impossible d\'initialiser la connexion P2P. Vérifiez votre connexion internet.');
            return;
        }

        try {
            const roomCode = await window.presenceSystem.createRoom();
            this.showCurrentRoom(roomCode);
            
            // Désactiver les boutons créer/rejoindre
            document.getElementById('createRoomBtn').disabled = true;
            document.getElementById('joinRoomBtn').disabled = true;
            document.getElementById('roomCodeInput').disabled = true;
            
        } catch (error) {
            console.error('Erreur création salle:', error);
            alert('❌ Erreur: ' + error.message);
        }
    }
    
    async handleJoinRoom() {
        const roomCodeInput = document.getElementById('roomCodeInput');
        const roomCode = roomCodeInput.value.trim();
        
        if (!roomCode) {
            alert('⚠️ Entrez un code de salle');
            roomCodeInput.focus();
            return;
        }
        
        // Le code est maintenant un peerID complet (pas de limite stricte)
        if (roomCode.length < 3) {
            alert('⚠️ Le code semble trop court');
            roomCodeInput.focus();
            return;
        }
        
        if (!window.presenceSystem) {
            alert('❌ Système de présence non initialisé');
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
            alert('❌ Impossible d\'initialiser la connexion P2P. Vérifiez votre connexion internet.');
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
            
        } catch (error) {
            console.error('Erreur rejoindre salle:', error);
            alert('❌ Erreur: ' + error.message);
        }
    }
    
    handleLeaveRoom() {
        if (!window.presenceSystem) return;
        
        if (confirm('🚪 Voulez-vous vraiment quitter la salle ?')) {
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
