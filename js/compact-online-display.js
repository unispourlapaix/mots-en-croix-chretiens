/**
 * Affichage Compact des Joueurs Connectés
 * Mini liste au-dessus du champ de saisie (mobile-friendly)
 */

class CompactOnlineDisplay {
    constructor() {
        this.container = document.getElementById('compactPlayersList');
        this.maxVisible = 4; // Maximum 4 joueurs visibles
        this.updateInterval = null;
        
        if (!this.container) {
            console.warn('⚠️ Container compact players non trouvé');
            return;
        }
        
        this.init();
    }
    
    init() {
        // Mise à jour initiale
        this.updateDisplay();
        
        // Mise à jour périodique (toutes les 2 secondes)
        this.updateInterval = setInterval(() => {
            this.updateDisplay();
        }, 2000);
        
        // Écouter les changements de lobby
        window.addEventListener('friendsListUpdated', () => {
            this.updateDisplay();
        });
        
        // Écouter les connexions/déconnexions dans SimpleChatSystem
        window.addEventListener('roomJoined', () => {
            this.updateDisplay();
        });
        window.addEventListener('roomCreated', () => {
            this.updateDisplay();
        });
        window.addEventListener('peerConnected', () => {
            this.updateDisplay();
        });
        window.addEventListener('peerDisconnected', () => {
            this.updateDisplay();
        });
        
        // Écouter les mises à jour de présence
        if (window.realtimeLobbySystem && typeof window.realtimeLobbySystem.onPresenceUpdate === 'function') {
            window.realtimeLobbySystem.onPresenceUpdate(() => {
                this.updateDisplay();
            });
        }
        
        console.log('📱 Affichage compact des connectés initialisé');
    }
    
    // Obtenir la liste des joueurs en ligne
    getOnlinePlayers() {
        const playersMap = new Map(); // Map par peerId
        const usernameSet = new Set(); // Set pour détecter les doublons de username
        
        // Ne pas s'inclure soi-même
        const currentPeerId = window.simpleChatSystem?.peer?.id;
        const currentUsername = window.simpleChatSystem?.currentUser;
        
        // Source 1: SimpleChatSystem connections (prioritaire pour la salle actuelle)
        if (window.simpleChatSystem?.connections) {
            window.simpleChatSystem.connections.forEach((conn, peerId) => {
                // Double vérification stricte
                if (!peerId || peerId === currentPeerId) return;
                if (!conn || !conn.open) return; // Ignorer les connexions fermées ou invalides
                
                // Vérifier que l'username est valide
                const username = conn.metadata?.username || conn.peer;
                if (!username || username === 'undefined' || username === 'null' || username.trim() === '') return;
                if (username === currentUsername) return; // Ne pas s'inclure par username
                
                if (!playersMap.has(peerId) && !usernameSet.has(username)) {
                    playersMap.set(peerId, {
                        id: peerId,
                        username: username,
                        status: 'connected',
                        inGame: false,
                        source: 'simpleChatSystem'
                    });
                    usernameSet.add(username);
                }
            });
        }
        
        // Source 2: Realtime Lobby
        if (window.realtimeLobbySystem?.onlinePlayers) {
            window.realtimeLobbySystem.onlinePlayers.forEach((playerData, peerId) => {
                // Double vérification stricte
                if (!peerId || peerId === currentPeerId) return;
                if (!playerData || !playerData.username) return;
                
                const username = playerData.username;
                if (username === 'undefined' || username === 'null' || username.trim() === '') return;
                if (username === currentUsername) return; // Ne pas s'inclure par username
                
                if (!playersMap.has(peerId) && !usernameSet.has(username)) {
                    playersMap.set(peerId, {
                        id: peerId,
                        username: username,
                        status: playerData.status || 'available',
                        inGame: playerData.status === 'in_game',
                        source: 'realtimeLobby'
                    });
                    usernameSet.add(username);
                }
            });
        }
        
        // Source 3: Room System
        if (window.roomSystem?.playersInRoom) {
            window.roomSystem.playersInRoom.forEach((playerData, peerId) => {
                // Double vérification stricte
                if (!peerId || peerId === currentPeerId) return;
                if (!playerData || !playerData.username) return;
                
                const username = playerData.username;
                if (username === 'undefined' || username === 'null' || username.trim() === '') return;
                if (username === currentUsername) return; // Ne pas s'inclure par username
                
                if (!playersMap.has(peerId) && !usernameSet.has(username)) {
                    playersMap.set(peerId, {
                        id: peerId,
                        username: username,
                        status: 'in_room',
                        inGame: false,
                        source: 'roomSystem'
                    });
                    usernameSet.add(username);
                }
            });
        }
        
        // Convertir la Map en array
        const cleanedPlayers = Array.from(playersMap.values());
        
        // Log pour débogage
        if (cleanedPlayers.length > 0) {
            console.log('👥 Joueurs connectés:', cleanedPlayers.map(p => p.username).join(', '));
        }
        
        return cleanedPlayers;
    }
    
    // Mettre à jour l'affichage
    updateDisplay() {
        if (!this.container) return;
        
        const players = this.getOnlinePlayers();
        
        // Vider le container
        this.container.innerHTML = '';
        
        // Ajouter l'icône Menu au début
        const menuIcon = document.createElement('span');
        menuIcon.className = 'compact-menu-icon';
        menuIcon.textContent = '☰';
        menuIcon.title = 'Ouvrir menu amis';
        menuIcon.onclick = () => {
            window.friendsUI?.openFriendsModal();
        };
        this.container.appendChild(menuIcon);
        
        if (players.length === 0) {
            // Vérifier si on a des amis ajoutés
            const hasFriends = window.friendsSystem?.getFriendsCount() > 0;
            
            if (!hasFriends) {
                // Pas d'amis ajoutés
                this.container.innerHTML = `
                    <span style="color: #999; font-size: 10px; padding: 2px 6px;">
                        Aucun ami ajouté. 
                        <span style="color: #667eea; cursor: pointer; text-decoration: underline;" 
                              onclick="window.friendsUI?.openFriendsModal()">
                            Ajouter des amis
                        </span>
                    </span>
                `;
            } else {
                // Amis ajoutés mais aucun en ligne
                this.container.insertAdjacentHTML('beforeend', '<span style="color: #999; font-size: 10px; padding: 2px 6px;">Aucun ami en ligne</span>');
            }
            return;
        }
        
        // Afficher jusqu'à 4 joueurs
        const visiblePlayers = players.slice(0, this.maxVisible);
        const remainingCount = players.length - this.maxVisible;
        
        visiblePlayers.forEach(player => {
            const chip = this.createPlayerChip(player);
            this.container.appendChild(chip);
        });
        
        // Si plus de 4 joueurs, afficher "+X"
        if (remainingCount > 0) {
            const moreChip = document.createElement('span');
            moreChip.className = 'compact-players-more';
            moreChip.textContent = `+${remainingCount}`;
            moreChip.title = `${remainingCount} autre${remainingCount > 1 ? 's' : ''} joueur${remainingCount > 1 ? 's' : ''}`;
            moreChip.onclick = () => this.showFullList();
            this.container.appendChild(moreChip);
        }
    }
    
    // Créer un chip de joueur
    createPlayerChip(player) {
        const chip = document.createElement('div');
        chip.className = 'compact-player-chip';
        // Pas de title pour éviter la redondance
        
        // Icône de statut
        const statusIcon = document.createElement('span');
        statusIcon.className = `compact-player-status ${player.inGame ? 'in-game' : 'online'}`;
        statusIcon.textContent = player.inGame ? '🎮' : '🟢';
        
        // Nom du joueur (tronqué)
        const name = document.createElement('span');
        name.className = 'compact-player-name';
        name.textContent = this.truncateName(player.username);
        
        chip.appendChild(statusIcon);
        chip.appendChild(name);
        
        // Clic pour afficher le menu d'options
        chip.onclick = (e) => {
            e.stopPropagation();
            this.showPlayerMenu(player, chip);
        };
        
        return chip;
    }
    
    // Tronquer le nom si trop long
    truncateName(name) {
        if (name.length > 10) {
            return name.substring(0, 9) + '…';
        }
        return name;
    }
    
    // Obtenir le label du statut
    getStatusLabel(status) {
        const labels = {
            'available': 'Disponible',
            'in_game': 'En jeu',
            'in_room': 'En salle',
            'busy': 'Occupé'
        };
        return labels[status] || 'En ligne';
    }
    
    // Afficher le menu d'options du joueur
    showPlayerMenu(player, chipElement) {
        // Fermer tout menu existant
        this.closePlayerMenu();
        
        // Créer le menu
        const menu = document.createElement('div');
        menu.className = 'player-context-menu futuristic';
        menu.id = 'playerContextMenu';
        
        // Menu pour un autre joueur : Bloquer, etc.
        menu.innerHTML = `
            <div class="player-menu-actions">
                <button class="player-menu-btn" data-action="block">
                    BLOQUER
                </button>
            </div>
        `;
        
        // Positionner le menu à côté du chip
        const rect = chipElement.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = rect.bottom + 5 + 'px';
        menu.style.left = rect.left + 'px';
        menu.style.zIndex = '10000';
        
        document.body.appendChild(menu);
        
        // Ajouter les gestionnaires d'événements
        const blockBtn = menu.querySelector('[data-action="block"]');
        
        if (blockBtn) {
            blockBtn.addEventListener('click', () => this.blockPlayer(player.id, player.username));
        }
        
        // Fermer le menu au clic ailleurs
        setTimeout(() => {
            document.addEventListener('click', this.closePlayerMenu.bind(this), { once: true });
        }, 100);
    }
    
    // Fermer le menu
    closePlayerMenu() {
        const menu = document.getElementById('playerContextMenu');
        if (menu) {
            menu.remove();
        }
    }
    
    // Ouvrir l'interface de connexion/inscription
    openAuthModal() {
        window.menuTabSystem?.openTab('connexion');
    }
    
    // Bloquer un joueur
    blockPlayer(playerId, username) {
        console.log('🚫 Bloquer:', username);
        
        this.closePlayerMenu();
        
        // Utiliser le système de blocage si disponible
        if (window.simpleChatSystem?.blockPlayer) {
            window.simpleChatSystem.blockPlayer(playerId);
            this.showNotification(`${username} a été bloqué`);
            this.updateDisplay(); // Rafraîchir l'affichage
        } else {
            this.showNotification('Fonction de blocage non disponible');
        }
    }
    
    // Changer son pseudo
    changeUsername() {
        console.log('✏️ Changer pseudo');
        
        this.closePlayerMenu();
        
        // Ouvrir le système d'authentification si disponible
        window.menuTabSystem?.openTab('connexion');
    }
    
    // Afficher une notification
    showNotification(message) {
        // Utiliser le système de notification existant si disponible
        if (window.roomSystem?.showMessage) {
            window.roomSystem.showMessage(message, 'info');
        } else {
            console.log('ℹ️', message);
        }
    }
    
    // Gérer le clic sur un joueur
    handlePlayerClick(player) {
        console.log('👤 Clic sur joueur:', player.username);
        
        // Si le lobby est ouvert, sélectionner le joueur
        if (window.lobbyTabs && typeof window.lobbyTabs.selectPlayer === 'function') {
            window.lobbyTabs.selectPlayer(player.id);
        }
        
        // Ouvrir l'onglet lobby si fermé
        const lobbyTab = document.querySelector('[data-tab="lobby"]');
        if (lobbyTab) {
            lobbyTab.click();
        }
        
        // Ouvrir la bulle de chat si minimisée
        const chatBubble = document.getElementById('chatBubble');
        if (chatBubble?.classList.contains('minimized')) {
            document.getElementById('toggleChatBubble')?.click();
        }
    }
    
    // Afficher la liste complète (ouvre le lobby)
    showFullList() {
        console.log('📋 Affichage liste complète');
        
        // Ouvrir l'onglet lobby
        const lobbyTab = document.querySelector('[data-tab="lobby"]');
        if (lobbyTab) {
            lobbyTab.click();
        }
        
        // Ouvrir la bulle de chat si minimisée
        const chatBubble = document.getElementById('chatBubble');
        if (chatBubble?.classList.contains('minimized')) {
            document.getElementById('toggleChatBubble')?.click();
        }
    }
    
    // Nettoyer
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.compactOnlineDisplay = new CompactOnlineDisplay();
    });
} else {
    window.compactOnlineDisplay = new CompactOnlineDisplay();
}

console.log('📱 Module d\'affichage compact chargé');
