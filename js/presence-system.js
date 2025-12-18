// Système de présence 100% GRATUIT P2P
// Partage familial/amis via CODE DE SALLE - Simple et sécurisé !
class PresenceSystem {
    constructor() {
        this.myPresence = null;
        this.onlinePlayers = new Map();
        this.heartbeatInterval = null;
        this.storageKey = 'crossword_players_online';
        this.channel = null;
        this.currentRoomCode = null; // Code de la salle actuelle
        this.roomConnection = null; // Connexion à la salle partagée
        this.connectedPeers = new Map(); // peer_id → DataConnection
        
        this.init();
    }
    
    init() {
        console.log('✅ Système de partage familial/amis P2P');
        
        // BroadcastChannel pour sync locale entre onglets
        try {
            this.channel = new BroadcastChannel('crossword_presence');
            this.channel.onmessage = (e) => this.handleChannelMessage(e.data);
        } catch (err) {
            console.warn('BroadcastChannel non supporté');
        }
        
        // Écouter localStorage pour sync locale
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.syncFromStorage();
            }
        });
        
        // Sync initial
        this.syncFromStorage();
        
        // Cleanup périodique
        setInterval(() => this.cleanupInactive(), 5000);
        
        // Écouter connexions entrantes
        this.setupIncomingConnections();
    }
    
    // Générer code de salle aléatoire
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 (confusion)
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    // CRÉER une salle (hôte)
    async createRoom() {
        // Attendre que PeerJS soit prêt (avec retry)
        if (!window.simpleChatSystem?.peer?.id) {
            console.log('⏳ En attente de PeerJS...');
            
            // Tenter d'initialiser si pas fait
            if (!window.simpleChatSystem?.peer) {
                window.simpleChatSystem?.initP2P();
            }
            
            // Attendre jusqu'à 5 secondes
            let attempts = 0;
            while (!window.simpleChatSystem?.peer?.id && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.simpleChatSystem?.peer?.id) {
                throw new Error('PeerJS non initialisé après 5 secondes. Vérifiez votre connexion internet.');
            }
        }
        
        // Utiliser le peer existant (NE PAS recréer)
        const myPeerId = window.simpleChatSystem.peer.id;
        const roomCode = this.generateRoomCode();
        
        // Initialiser myPresence si pas encore fait
        if (!this.myPresence) {
            const username = window.simpleChatSystem?.currentUser || 'Joueur';
            console.log('🔧 Initialisation myPresence pour:', username);
            this.myPresence = {
                peerId: myPeerId,
                username: username,
                avatar: '😊',
                acceptMode: 'auto',
                timestamp: Date.now()
            };
        }
        
        this.currentRoomCode = roomCode;
        this.isRoomHost = true;
        
        console.log('🏠 Salle créée:', roomCode);
        console.log('📋 Partagez ce code avec vos amis/famille !');
        console.log('🆔 Votre Peer ID:', myPeerId);
        
        // Enregistrer association code → peer ID (pour restauration locale)
        const roomData = {
            code: roomCode,
            hostPeerId: myPeerId,
            hostUsername: this.myPresence.username,
            createdAt: Date.now()
        };
        localStorage.setItem(`room_${roomCode}`, JSON.stringify(roomData));
        
        // Passer en mode acceptation automatique pour les salles avec CODE
        if (window.roomSystem && typeof window.roomSystem.setAcceptMode === 'function') {
            window.roomSystem.setAcceptMode('auto');
            console.log('✅ Mode acceptation auto activé pour salle CODE');
        }
        
        // Ajouter moi-même à la liste
        this.onlinePlayers.set(myPeerId, {
            peerId: myPeerId,
            username: this.myPresence.username,
            avatar: this.myPresence.avatar,
            isHost: true,
            timestamp: Date.now()
        });
        
        // Notifier UI
        this.notifyPresenceUpdate();
        
        // Afficher le code à l'utilisateur
        this.showRoomCodeModal(roomCode);
        
        console.log('⏳ En attente de connexions P2P directes...');
        
        return roomCode;
    }
    
    // REJOINDRE une salle avec code
    async joinRoom(roomCode) {
        // Attendre que PeerJS soit prêt (avec retry)
        if (!window.simpleChatSystem?.peer?.id) {
            console.log('⏳ En attente de PeerJS...');
            
            // Tenter d'initialiser si pas fait
            if (!window.simpleChatSystem?.peer) {
                window.simpleChatSystem?.initP2P();
            }
            
            // Attendre jusqu'à 5 secondes
            let attempts = 0;
            while (!window.simpleChatSystem?.peer?.id && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.simpleChatSystem?.peer?.id) {
                throw new Error('PeerJS non initialisé après 5 secondes. Vérifiez votre connexion internet.');
            }
        }
        
        roomCode = roomCode.toUpperCase().trim();
        
        if (roomCode.length !== 6) {
            throw new Error('Code invalide (doit faire 6 caractères)');
        }
        
        // Initialiser myPresence si pas encore fait
        if (!this.myPresence) {
            const username = window.simpleChatSystem?.currentUser || 'Joueur';
            const myPeerId = window.simpleChatSystem.peer.id;
            console.log('🔧 Initialisation myPresence pour:', username);
            this.myPresence = {
                peerId: myPeerId,
                username: username,
                avatar: '😊',
                acceptMode: 'auto',
                timestamp: Date.now()
            };
        }
        
        // Lire le registre pour trouver le peer ID de l'hôte
        const roomDataStr = localStorage.getItem(`room_${roomCode}`);
        if (!roomDataStr) {
            console.error('❌ Salle non trouvée dans localStorage:', roomCode);
            console.log('💡 Salles disponibles:', Object.keys(localStorage).filter(k => k.startsWith('room_')));
            throw new Error(`Salle ${roomCode} introuvable. L'hôte doit d'abord créer la salle.`);
        }
        
        const roomData = JSON.parse(roomDataStr);
        const hostPeerId = roomData.hostPeerId;
        
        // Vérifier si on est l'hôte
        const myPeerId = window.simpleChatSystem?.peer?.id;
        if (hostPeerId === myPeerId) {
            console.warn('⚠️ Vous êtes l\'hôte de cette salle, pas besoin de la rejoindre !');
            this.currentRoomCode = roomCode;
            this.isRoomHost = true;
            
            // Émettre l'événement roomJoined quand même
            window.dispatchEvent(new CustomEvent('roomJoined', {
                detail: { roomCode, isHost: true }
            }));
            
            return; // Ne pas se connecter à soi-même
        }
        
        this.currentRoomCode = roomCode;
        this.isRoomHost = false;
        
        console.log('🚪 Rejoindre salle:', roomCode);
        console.log('🎯 Connexion à l\'hôte:', hostPeerId);
        
        // Passer en mode acceptation automatique
        if (window.roomSystem && typeof window.roomSystem.setAcceptMode === 'function') {
            window.roomSystem.setAcceptMode('auto');
            console.log('✅ Mode acceptation auto activé');
        }
        
        // Connexion P2P directe
        await this.connectToRoomHost(hostPeerId, roomCode);
        
        console.log('✅ Connecté à la salle:', roomCode);
        
        return roomCode;
    }
    
    // Se connecter directement à l'hôte de la salle (P2P cross-browser)
    async connectToRoomHost(hostPeerId, roomCode) {
        const myPeerId = window.simpleChatSystem.peer.id;
        
        console.log('🔗 Connexion P2P à:', hostPeerId);
        
        // Créer la connexion
        const conn = window.simpleChatSystem.peer.connect(hostPeerId, {
            reliable: true,
            metadata: {
                type: 'room_join',
                code: roomCode,
                peerId: myPeerId,
                username: this.myPresence.username,
                avatar: this.myPresence.avatar
            }
        });
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                conn.close();
                reject(new Error('Timeout: Impossible de joindre l\'hôte. Vérifiez que la salle existe.'));
            }, 10000);
            
            conn.on('open', () => {
                clearTimeout(timeout);
                console.log('✅ Connexion P2P établie avec l\'hôte');
                
                // Enregistrer la connexion
                this.connectedPeers.set(hostPeerId, conn);
                window.simpleChatSystem.connections.set(hostPeerId, conn);
                
                // Envoyer handshake
                conn.send({
                    type: 'hello',
                    peerId: myPeerId,
                    username: this.myPresence.username,
                    avatar: this.myPresence.avatar,
                    roomCode: roomCode
                });
                
                resolve(conn);
            });
            
            conn.on('data', (data) => {
                this.handlePeerMessage(data, conn);
            });
            
            conn.on('error', (err) => {
                clearTimeout(timeout);
                console.error('❌ Erreur connexion P2P:', err);
                reject(err);
            });
            
            conn.on('close', () => {
                console.log('🔌 Connexion fermée avec:', hostPeerId);
                this.connectedPeers.delete(hostPeerId);
                window.simpleChatSystem.connections.delete(hostPeerId);
            });
        });
    }
    
    // Vérifier si déjà connecté (fonction helper)
    isConnectedTo(peerId) {
        const conn = this.connectedPeers.get(peerId);
        if (!conn) return false;
        return conn.open === true;
    }
    
    // Enregistrer dans le registre de la salle
    registerInRoom(roomCode) {
        const roomKey = `crossword_room_${roomCode}`;
        
        try {
            let roomData = localStorage.getItem(roomKey);
            let members = roomData ? JSON.parse(roomData) : {};
            
            // Ajouter ma présence
            members[this.myPresence.peerId] = {
                peerId: this.myPresence.peerId,
                username: this.myPresence.username,
                avatar: this.myPresence.avatar,
                joinedAt: Date.now()
            };
            
            localStorage.setItem(roomKey, JSON.stringify(members));
            
            // Aussi sauvegarder que je suis dans cette salle
            localStorage.setItem('crossword_current_room', JSON.stringify({
                code: roomCode,
                joinedAt: Date.now()
            }));
            
            console.log('📝 Enregistré dans la salle:', roomCode);
        } catch (err) {
            console.error('Erreur enregistrement salle:', err);
        }
    }
    
    // Découvrir les membres de la salle
    async discoverRoomMembers(roomCode) {
        const roomKey = `crossword_room_${roomCode}`;
        
        // Vérifier que P2P est initialisé
        if (!window.simpleChatSystem?.peer?.id) {
            console.log('⏳ P2P pas encore prêt, réessai dans 500ms...');
            setTimeout(() => this.discoverRoomMembers(roomCode), 500);
            return;
        }
        
        try {
            const roomData = localStorage.getItem(roomKey);
            if (!roomData) {
                console.log('📭 Aucun membre trouvé pour le moment');
                return;
            }
            
            const members = JSON.parse(roomData);
            const memberCount = Object.keys(members).length;
            console.log('👥 Membres trouvés:', memberCount);
            console.log('📋 Détails des membres:', members);
            
            // Se connecter à chaque membre (sauf soi-même et les bots)
            for (const [peerId, member] of Object.entries(members)) {
                // Skip bots
                if (peerId.startsWith('bot-')) {
                    console.log('⏭️ Sauté (bot):', member.username);
                    continue;
                }
                
                if (peerId !== this.myPresence.peerId && !this.connectedPeers.has(peerId)) {
                    console.log('🔗 Tentative connexion à:', member.username, '(', peerId, ')');
                    this.connectToPeer(peerId, member);
                } else if (peerId === this.myPresence.peerId) {
                    console.log('⏭️ Sauté (c\'est moi):', member.username);
                } else {
                    console.log('✅ Déjà connecté:', member.username);
                }
            }
        } catch (err) {
            console.error('❌ Erreur découverte membres:', err);
        }
    }
    
    // Se connecter activement à un peer
    connectToPeer(peerId, memberInfo) {
        // Protection: Ne pas tenter de connexion aux bots
        if (peerId.startsWith('bot-')) {
            console.log('⏭️ Skip bot, pas de connexion P2P nécessaire:', peerId);
            return;
        }
        
        if (!window.simpleChatSystem?.peer) return;
        
        try {
            const conn = window.simpleChatSystem.peer.connect(peerId, {
                reliable: true,
                metadata: {
                    type: 'room_member',
                    roomCode: this.currentRoomCode,
                    peerId: this.myPresence.peerId,
                    username: this.myPresence.username,
                    avatar: this.myPresence.avatar
                }
            });
            
            conn.on('open', () => {
                console.log('✅ Connecté à:', peerId);
                
                this.connectedPeers.set(peerId, conn);
                
                // IMPORTANT: Ajouter aussi à simpleChatSystem pour les messages
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.connections.set(peerId, conn);
                    console.log('💬 Connexion ajoutée au chat');
                }
                
                // Ajouter aux joueurs en ligne
                this.onlinePlayers.set(peerId, {
                    peerId: peerId,
                    username: memberInfo.username,
                    avatar: memberInfo.avatar || '😊',
                    acceptMode: 'auto', // Dans une salle, acceptation auto
                    timestamp: Date.now()
                });
                
                console.log('✅ Joueur ajouté à onlinePlayers:', memberInfo.username);
                console.log('📊 Total joueurs en ligne:', this.onlinePlayers.size);
                
                this.notifyPresenceUpdate();
                
                // Envoyer ma présence
                conn.send({
                    type: 'presence_announce',
                    peerId: this.myPresence.peerId,
                    username: this.myPresence.username,
                    avatar: this.myPresence.avatar,
                    roomCode: this.currentRoomCode,
                    timestamp: Date.now()
                });
            });
            
            conn.on('data', (data) => {
                this.handlePeerMessage(data, conn);
            });
            
            conn.on('close', () => {
                console.log('👋 Déconnecté de:', peerId);
                this.connectedPeers.delete(peerId);
                this.onlinePlayers.delete(peerId);
                
                // Retirer aussi de simpleChatSystem
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.connections.delete(peerId);
                }
                
                this.notifyPresenceUpdate();
            });
            
            conn.on('error', (err) => {
                console.warn('Erreur connexion à', peerId, ':', err);
            });
            
        } catch (err) {
            console.error('Erreur connexion peer:', err);
        }
    }
    
    // Afficher modal avec code de salle
    showRoomCodeModal(roomCode) {
        // Créer modal simple
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
            min-width: 300px;
        `;
        
        modal.innerHTML = `
            <h2 style="color: #ff69b4; margin-bottom: 20px;">🏠 Salle créée !</h2>
            <p style="margin-bottom: 15px;">Partagez ce code avec vos amis/famille :</p>
            <div style="
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                background: #f0f0f0;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                letter-spacing: 5px;
                font-family: monospace;
            ">${roomCode}</div>
            <button id="copyRoomCode" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px 5px;
            ">📋 Copier</button>
            <button id="closeRoomModal" style="
                background: #ff69b4;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px 5px;
            ">✅ OK</button>
        `;
        
        document.body.appendChild(modal);
        
        // Copier le code
        document.getElementById('copyRoomCode').onclick = () => {
            navigator.clipboard.writeText(roomCode);
        };
        
        // Fermer modal
        document.getElementById('closeRoomModal').onclick = () => {
            modal.remove();
        };
    }
    
    // Écouter connexions entrantes
    setupIncomingConnections() {
        if (!window.simpleChatSystem?.peer) return;
        
        window.simpleChatSystem.peer.on('connection', (conn) => {
            console.log('📞 Connexion entrante de:', conn.peer);
            
            // Vérifier si c'est un membre de salle avec metadata
            if (conn.metadata && conn.metadata.type === 'room_join') {
                console.log('🏠 Membre salle détecté:', conn.metadata.username, 'pour room:', conn.metadata.roomCode);
                
                // Vérifier que c'est bien notre salle
                if (this.currentRoomCode === conn.metadata.roomCode) {
                    console.log('✅ Code salle valide, acceptation automatique');
                } else {
                    console.warn('⚠️ Code salle différent:', conn.metadata.roomCode, 'vs', this.currentRoomCode);
                }
            }
            
            conn.on('open', () => {
                console.log('✅ Connexion établie avec:', conn.peer);
                
                // Ajouter le peer aux joueurs en ligne
                if (conn.metadata && conn.metadata.username) {
                    this.onlinePlayers.set(conn.peer, {
                        peerId: conn.peer,
                        username: conn.metadata.username,
                        avatar: conn.metadata.avatar || '😊',
                        acceptMode: 'auto',
                        timestamp: Date.now()
                    });
                    console.log('✅ Ajouté aux joueurs en ligne:', conn.metadata.username);
                }
                
                // Envoyer ma présence
                conn.send({
                    type: 'host_hello',
                    peerId: this.myPresence.peerId,
                    username: this.myPresence.username,
                    avatar: this.myPresence.avatar,
                    acceptMode: this.myPresence.acceptMode,
                    roomCode: this.currentRoomCode,
                    timestamp: Date.now()
                });
                
                // Envoyer liste de tous les joueurs que je connais
                this.onlinePlayers.forEach((player, peerId) => {
                    if (peerId !== conn.peer) {
                        conn.send({
                            type: 'presence_announce',
                            peerId: player.peerId,
                            username: player.username,
                            avatar: player.avatar,
                            acceptMode: player.acceptMode,
                            timestamp: player.timestamp
                        });
                    }
                });
                
                this.connectedPeers.set(conn.peer, conn);
                
                // IMPORTANT: Ajouter aussi à simpleChatSystem pour les messages
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.connections.set(conn.peer, conn);
                    console.log('💬 Connexion entrante ajoutée au chat');
                }
                
                // Notifier l'UI
                this.notifyPresenceUpdate();
                
                if (conn.metadata && conn.metadata.username) {
                    window.simpleChatSystem.showMessage(`✅ ${conn.metadata.username} a rejoint la salle`, 'system');
                }
            });
            
            conn.on('data', (data) => {
                this.handlePeerMessage(data, conn);
            });
            
            conn.on('close', () => {
                console.log('👋 Connexion fermée:', conn.peer);
                this.connectedPeers.delete(conn.peer);
                this.onlinePlayers.delete(conn.peer);
                
                // Retirer aussi de simpleChatSystem
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.connections.delete(conn.peer);
                }
                
                this.notifyPresenceUpdate();
            });
        });
    }
    
    // Gérer messages P2P
    handlePeerMessage(data, conn) {
        if (!data || !data.type) return;
        
        console.log('📨 Message reçu:', data.type, 'de', conn.peer);
        
        switch (data.type) {
            case 'hello':
                // Invité se présente
                console.log('👋 Invité connecté:', data.username);
                
                // Ajouter à la liste
                this.onlinePlayers.set(data.peerId, {
                    peerId: data.peerId,
                    username: data.username,
                    avatar: data.avatar || '😊',
                    timestamp: Date.now()
                });
                
                // Enregistrer la connexion
                this.connectedPeers.set(data.peerId, conn);
                window.simpleChatSystem.connections.set(data.peerId, conn);
                
                // Répondre avec notre info
                conn.send({
                    type: 'welcome',
                    peerId: this.myPresence.peerId,
                    username: this.myPresence.username,
                    avatar: this.myPresence.avatar
                });
                
                // Notifier autres membres
                this.broadcastToRoom({
                    type: 'member_joined',
                    peerId: data.peerId,
                    username: data.username,
                    avatar: data.avatar
                }, data.peerId);
                
                this.notifyPresenceUpdate();
                break;
                
            case 'welcome':
                // Hôte répond
                console.log('✅ Bienvenue de:', data.username);
                
                this.onlinePlayers.set(data.peerId, {
                    peerId: data.peerId,
                    username: data.username,
                    avatar: data.avatar || '😊',
                    timestamp: Date.now()
                });
                
                this.notifyPresenceUpdate();
                break;
                
            case 'member_joined':
                // Autre membre rejoint
                console.log('👋 Nouveau membre:', data.username);
                
                this.onlinePlayers.set(data.peerId, {
                    peerId: data.peerId,
                    username: data.username,
                    avatar: data.avatar || '😊',
                    timestamp: Date.now()
                });
                
                this.notifyPresenceUpdate();
                break;
                
            case 'heartbeat':
                // Mise à jour heartbeat
                if (data.peerId && this.onlinePlayers.has(data.peerId)) {
                    const player = this.onlinePlayers.get(data.peerId);
                    player.timestamp = data.timestamp || Date.now();
                    this.onlinePlayers.set(data.peerId, player);
                }
                break;
                
            case 'goodbye':
                // Membre déconnecté
                if (data.peerId) {
                    console.log('👋 Membre parti:', data.username);
                    this.onlinePlayers.delete(data.peerId);
                    this.connectedPeers.delete(data.peerId);
                    this.notifyPresenceUpdate();
                }
                break;
        }
    }
    
    // Broadcaster un message à tous les peers connectés
    broadcastToRoom(message, excludePeerId = null) {
        this.connectedPeers.forEach((conn, peerId) => {
            if (peerId !== excludePeerId && conn.open) {
                try {
                    conn.send(message);
                } catch (err) {
                    console.warn('Erreur broadcast:', err);
                }
            }
        });
    }
    
    // Quitter la salle actuelle
    leaveRoom() {
        if (!this.currentRoomCode) return;
        
        console.log('🚪 Quitter salle:', this.currentRoomCode);
        
        // Arrêter le watcher
        if (this.roomWatchInterval) {
            clearInterval(this.roomWatchInterval);
            this.roomWatchInterval = null;
        }
        
        // Retirer du registre de la salle
        this.unregisterFromRoom(this.currentRoomCode);
        
        // Annoncer départ aux autres
        this.broadcastToRoom({
            type: 'goodbye',
            peerId: this.myPresence.peerId,
            username: this.myPresence.username,
            roomCode: this.currentRoomCode
        });
        
        // Fermer toutes les connexions
        this.connectedPeers.forEach((conn) => {
            try {
                conn.close();
            } catch (err) {
                // Déjà fermé
            }
        });
        
        this.connectedPeers.clear();
        this.onlinePlayers.clear();
        this.currentRoomCode = null;
        
        // Revenir en mode manuel après avoir quitté une salle CODE
        if (window.roomSystem && typeof window.roomSystem.setAcceptMode === 'function') {
            window.roomSystem.setAcceptMode('manual');
            console.log('✅ Mode manuel restauré');
        }
        
        // Nettoyer aussi simpleChatSystem.connections
        if (window.simpleChatSystem) {
            window.simpleChatSystem.connections.clear();
            console.log('🧹 Connexions chat nettoyées');
        }
        
        localStorage.removeItem('crossword_current_room');
        
        this.notifyPresenceUpdate();
        
        console.log('✅ Salle quittée proprement');
    }
    
    // Se retirer du registre de la salle
    unregisterFromRoom(roomCode) {
        const roomKey = `crossword_room_${roomCode}`;
        
        try {
            const roomData = localStorage.getItem(roomKey);
            if (roomData) {
                const members = JSON.parse(roomData);
                delete members[this.myPresence.peerId];
                
                // Si plus personne, supprimer la salle
                if (Object.keys(members).length === 0) {
                    localStorage.removeItem(roomKey);
                    console.log('🗑️ Salle vide supprimée');
                } else {
                    localStorage.setItem(roomKey, JSON.stringify(members));
                }
            }
        } catch (err) {
            console.error('Erreur désinscription salle:', err);
        }
    }

    start(username, peerId) {
        // Ne pas réannoncer si déjà fait avec les mêmes infos
        if (this.myPresence && this.myPresence.username === username && this.myPresence.peerId === peerId) {
            console.log('⏭️ Présence déjà annoncée, skip');
            return;
        }
        
        this.announcePresence(peerId, username, '😊');
    }
    
    // Annoncer ma présence (local + optionnel salle)
    async announcePresence(peerId, username, avatar = '😊', acceptMode = 'manual') {
        // Si on change de peer ID, retirer l'ancien
        if (this.myPresence && this.myPresence.peerId !== peerId) {
            console.log('🔄 Changement de peer ID:', this.myPresence.peerId, '→', peerId);
            this.onlinePlayers.delete(this.myPresence.peerId);
            
            // Retirer aussi de availablePlayers
            if (window.roomSystem) {
                window.roomSystem.availablePlayers.delete(this.myPresence.peerId);
            }
        }
        
        // NOUVEAU: Nettoyer immédiatement TOUS les anciens peer IDs avec le même username
        const oldPeerIds = [];
        this.onlinePlayers.forEach((player, pid) => {
            // Ne pas nettoyer les bots
            if (player.username === username && pid !== peerId && !pid.startsWith('bot-')) {
                oldPeerIds.push(pid);
            }
        });
        
        if (oldPeerIds.length > 0) {
            console.log('🧹 Nettoyage immédiat de', oldPeerIds.length, 'ancien(s) peer ID(s) pour:', username);
            oldPeerIds.forEach(pid => {
                this.onlinePlayers.delete(pid);
                if (window.roomSystem) {
                    window.roomSystem.availablePlayers.delete(pid);
                }
                console.log('   🗑️ Retiré:', pid);
            });
        }
        
        this.myPresence = {
            peerId,
            username,
            avatar,
            acceptMode,
            timestamp: Date.now()
        };
        
        console.log('📢 Présence enregistrée:', username, '(', peerId, ')');
        
        // Sauvegarder localement
        this.saveToStorage();
        
        // Broadcast aux autres onglets
        if (this.channel) {
            this.channel.postMessage({
                type: 'presence',
                presence: this.myPresence
            });
        }
        
        // Si dans une salle, annoncer à tous
        if (this.currentRoomCode) {
            this.broadcastToRoom({
                type: 'presence_announce',
                peerId: this.myPresence.peerId,
                username: this.myPresence.username,
                avatar: this.myPresence.avatar,
                acceptMode: this.myPresence.acceptMode,
                roomCode: this.currentRoomCode,
                timestamp: Date.now()
            });
        }
        
        // Démarrer heartbeat
        this.startHeartbeat();
        
        this.notifyPresenceUpdate();
    }
    
    // Heartbeat local + broadcast salle
    startHeartbeat() {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        
        this.heartbeatInterval = setInterval(() => {
            if (!this.myPresence) return;
            
            this.myPresence.timestamp = Date.now();
            
            // Heartbeat local
            this.saveToStorage();
            
            if (this.channel) {
                this.channel.postMessage({
                    type: 'heartbeat',
                    peerId: this.myPresence.peerId,
                    timestamp: Date.now()
                });
            }
            
            // Heartbeat salle P2P
            if (this.currentRoomCode) {
                this.broadcastToRoom({
                    type: 'heartbeat',
                    peerId: this.myPresence.peerId,
                    timestamp: Date.now()
                });
            }
        }, 3000); // Heartbeat toutes les 3s
    }
    
    // Gérer messages BroadcastChannel
    handleChannelMessage(message) {
        if (!message) return;
        
        switch (message.type) {
            case 'presence':
                if (message.player && message.player.peerId !== this.myPresence?.peerId) {
                    this.onlinePlayers.set(message.player.peerId, message.player);
                    this.notifyPresenceUpdate();
                    console.log('👋 Joueur détecté:', message.player.username);
                }
                break;
                
            case 'heartbeat':
                const player = this.onlinePlayers.get(message.peerId);
                if (player) {
                    player.timestamp = message.timestamp;
                }
                break;
                
            case 'disconnect':
                this.onlinePlayers.delete(message.peerId);
                this.notifyPresenceUpdate();
                console.log('👋 Joueur parti:', message.peerId);
                break;
                
            case 'room_created':
            case 'room_join':
                // Quelqu'un a créé ou rejoint une salle
                if (message.roomCode === this.currentRoomCode && 
                    message.peerId !== this.myPresence?.peerId) {
                    console.log('👋 Nouveau membre dans la salle:', message.username);
                    // On va le découvrir via discoverRoomMembers()
                }
                break;
        }
    }
    
    // Sauvegarder dans localStorage (SEULEMENT pour onglets du même navigateur)
    saveToStorage() {
        // IMPORTANT: Ne PAS sauvegarder dans localStorage pour les salles CODE
        // Les salles CODE utilisent P2P pur pour éviter les doublons cross-browser
        if (this.currentRoomCode) {
            return; // Skip localStorage pour salles CODE
        }
        
        try {
            const allPlayers = {};
            
            if (this.myPresence) {
                allPlayers[this.myPresence.peerId] = this.myPresence;
            }
            
            const now = Date.now();
            this.onlinePlayers.forEach((player, peerId) => {
                if (now - player.timestamp < 15000) {
                    allPlayers[peerId] = player;
                }
            });
            
            localStorage.setItem(this.storageKey, JSON.stringify(allPlayers));
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
        }
    }
    
    // Sync depuis localStorage (SEULEMENT pour onglets du même navigateur)
    syncFromStorage() {
        // IMPORTANT: Ne PAS synchroniser via localStorage pour les salles CODE
        // Les salles CODE utilisent P2P pur pour éviter les doublons cross-browser
        if (this.currentRoomCode) {
            console.log('⏭️ Skip localStorage sync (salle CODE active, P2P uniquement)');
            return;
        }
        
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) return;
            
            const players = JSON.parse(stored);
            const now = Date.now();
            
            Object.entries(players).forEach(([peerId, player]) => {
                if (peerId !== this.myPresence?.peerId && now - player.timestamp < 15000) {
                    this.onlinePlayers.set(peerId, player);
                }
            });
            
            this.notifyPresenceUpdate();
        } catch (error) {
            console.error('❌ Erreur sync:', error);
        }
    }
    
    // Cleanup joueurs inactifs
    cleanupInactive() {
        const now = Date.now();
        const INACTIVE_TIMEOUT = 30000; // 30 secondes au lieu de 15
        let hasChanges = false;
        
        this.onlinePlayers.forEach((player, peerId) => {
            // Ne jamais supprimer: le joueur local, les bots
            if (peerId === this.myPresence?.peerId || peerId.startsWith('bot-')) {
                return;
            }
            
            // Supprimer si inactif > 30s
            if (now - player.timestamp > INACTIVE_TIMEOUT) {
                this.onlinePlayers.delete(peerId);
                hasChanges = true;
                console.log('🧹 Joueur inactif retiré:', player.username, '(dernier heartbeat:', Math.floor((now - player.timestamp) / 1000), 's)');
            }
        });
        
        if (hasChanges) {
            this.saveToStorage();
            this.notifyPresenceUpdate();
        }
    }
    
    // Arrêter
    async stop() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        // Quitter la salle si dans une
        if (this.currentRoomCode) {
            this.leaveRoom();
        }
        
        // Broadcast déconnexion locale
        if (this.channel && this.myPresence) {
            this.channel.postMessage({
                type: 'disconnect',
                peerId: this.myPresence.peerId
            });
        }
        
        // Retirer du localStorage
        if (this.myPresence) {
            try {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    const players = JSON.parse(stored);
                    delete players[this.myPresence.peerId];
                    localStorage.setItem(this.storageKey, JSON.stringify(players));
                }
            } catch (error) {
                console.error('❌ Erreur cleanup local:', error);
            }
        }
        
        this.myPresence = null;
    }
    
    // Notifier le système de salles
    notifyPresenceUpdate() {
        if (!window.roomSystem) return;
        
        // Clear et rebuild pour éviter doublons
        window.roomSystem.availablePlayers.clear();
        
        // Ajouter moi-même
        if (this.myPresence) {
            window.roomSystem.availablePlayers.set('me', {
                username: this.myPresence.username,
                isMe: true
            });
        }
        
        // Ajouter les autres joueurs
        this.onlinePlayers.forEach((player, peerId) => {
            if (peerId !== this.myPresence?.peerId) {
                window.roomSystem.availablePlayers.set(peerId, {
                    username: player.username,
                    isMe: false
                });
            }
        });
        
        // Rafraîchir l'UI
        window.roomSystem.updateAvailablePlayersList();
        window.roomSystem.updateChatBubble();
    }
    
    // Obtenir la liste des joueurs en ligne
    getOnlinePlayers() {
        return Array.from(this.onlinePlayers.values());
    }
    
    // Nettoyer avant fermeture
    async cleanup() {
        await this.stop();
        
        if (this.channel) {
            this.channel.close();
        }
    }
}

// Instance globale
window.presenceSystem = new PresenceSystem();

// Nettoyer avant fermeture de page
window.addEventListener('beforeunload', async () => {
    await window.presenceSystem.cleanup();
});

// Initialiser automatiquement quand tout est prêt
const initPresenceSystem = () => {
    let attempts = 0;
    const maxAttempts = 50;

    const checkInit = setInterval(() => {
        attempts++;

        if (window.simpleChatSystem && window.roomSystem) {
            const chatSystem = window.simpleChatSystem;

            // Attendre que le peer soit prêt
            if (chatSystem.peer && chatSystem.peer.id && chatSystem.currentUser) {
                clearInterval(checkInit);
                console.log('✅ Initialisation système présence localStorage...');
                window.presenceSystem.start(chatSystem.currentUser, chatSystem.peer.id);
            }
        }

        if (attempts >= maxAttempts) {
            clearInterval(checkInit);
            console.warn('⚠️ Timeout: Système de présence non initialisé');
        }
    }, 200);
};

// Lancer l'initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPresenceSystem);
} else {
    initPresenceSystem();
}

console.log('✅ Système de partage familial/amis P2P chargé - CODE DE SALLE 🏠🔐');
