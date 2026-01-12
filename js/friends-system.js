/**
 * Système de Gestion d'Amis par Code
 * Protection de la vie privée - Les utilisateurs ne voient que leurs amis ajoutés
 */

class FriendsSystem {
    constructor() {
        this.myFriendCode = null; // Mon code unique (peer_id)
        this.friendsList = new Set(); // Liste des codes amis ajoutés
        this.friendsData = new Map(); // Code ami -> {username, addedAt, lastSeen}
        this.storageKey = 'christian_crossword_friends';
        
        // Charger la liste d'amis sauvegardée
        this.loadFriendsList();
        
        console.log('🤝 Système d\'amis initialisé');
    }
    
    // Initialiser mon code unique
    setMyFriendCode(code) {
        this.myFriendCode = code;
        console.log('🔑 Mon code d\'ami:', code);
    }
    
    // Ajouter un ami par son code
    addFriend(friendCode, username = 'Ami') {
        if (!friendCode) {
            return { success: false, message: 'Code invalide' };
        }
        
        // Ne pas s'ajouter soi-même
        if (friendCode === this.myFriendCode) {
            return { success: false, message: 'Vous ne pouvez pas ajouter votre propre code' };
        }
        
        // Vérifier si déjà ajouté
        if (this.friendsList.has(friendCode)) {
            return { success: false, message: 'Cet ami est déjà dans votre liste' };
        }
        
        // Ajouter l'ami
        this.friendsList.add(friendCode);
        this.friendsData.set(friendCode, {
            username: username,
            addedAt: Date.now(),
            lastSeen: null
        });
        
        // Sauvegarder
        this.saveFriendsList();
        
        console.log('✅ Ami ajouté:', friendCode, username);
        
        // Notifier le changement
        this.notifyFriendsUpdate();
        
        return { success: true, message: `${username} ajouté à vos amis !` };
    }
    
    // Supprimer un ami
    removeFriend(friendCode) {
        if (!this.friendsList.has(friendCode)) {
            return { success: false, message: 'Ami non trouvé' };
        }
        
        const friendData = this.friendsData.get(friendCode);
        this.friendsList.delete(friendCode);
        this.friendsData.delete(friendCode);
        
        // Sauvegarder
        this.saveFriendsList();
        
        console.log('🗑️ Ami retiré:', friendCode);
        
        // Notifier le changement
        this.notifyFriendsUpdate();
        
        return { success: true, message: `${friendData?.username || 'Ami'} retiré de votre liste` };
    }
    
    // Vérifier si quelqu'un est dans ma liste d'amis
    isFriend(friendCode) {
        return this.friendsList.has(friendCode);
    }
    
    // Obtenir la liste complète des amis
    getFriendsList() {
        return Array.from(this.friendsList);
    }
    
    // Obtenir les données d'un ami
    getFriendData(friendCode) {
        return this.friendsData.get(friendCode);
    }
    
    // Mettre à jour la dernière vue d'un ami
    updateFriendLastSeen(friendCode, username = null) {
        if (!this.friendsList.has(friendCode)) return;
        
        const friendData = this.friendsData.get(friendCode);
        if (friendData) {
            friendData.lastSeen = Date.now();
            if (username) {
                friendData.username = username;
            }
            this.friendsData.set(friendCode, friendData);
            this.saveFriendsList();
        }
    }
    
    // Filtrer les joueurs en ligne pour ne montrer que les amis
    filterOnlinePlayersByFriends(onlinePlayers) {
        const friendsOnline = new Map();
        
        for (const [peerId, playerData] of onlinePlayers) {
            // Inclure soi-même
            if (peerId === this.myFriendCode) {
                friendsOnline.set(peerId, playerData);
                continue;
            }
            
            // Inclure uniquement les amis
            if (this.isFriend(peerId)) {
                friendsOnline.set(peerId, playerData);
                // Mettre à jour la dernière vue
                this.updateFriendLastSeen(peerId, playerData.username);
            }
        }
        
        return friendsOnline;
    }
    
    // Sauvegarder la liste d'amis
    saveFriendsList() {
        try {
            const data = {
                friends: Array.from(this.friendsList),
                friendsData: Array.from(this.friendsData.entries())
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (err) {
            console.error('❌ Erreur sauvegarde liste amis:', err);
        }
    }
    
    // Charger la liste d'amis
    loadFriendsList() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.friendsList = new Set(data.friends || []);
                this.friendsData = new Map(data.friendsData || []);
                console.log(`📋 ${this.friendsList.size} ami(s) chargé(s)`);
            }
        } catch (err) {
            console.error('❌ Erreur chargement liste amis:', err);
        }
    }
    
    // Notifier les changements
    notifyFriendsUpdate() {
        window.dispatchEvent(new CustomEvent('friendsListUpdated', {
            detail: {
                friendsCount: this.friendsList.size,
                friends: this.getFriendsList()
            }
        }));
    }
    
    // Obtenir le nombre d'amis
    getFriendsCount() {
        return this.friendsList.size;
    }
    
    // Exporter mon code d'ami (pour partager)
    exportMyCode() {
        if (!this.myFriendCode) {
            return { success: false, message: 'Code non initialisé' };
        }
        
        return {
            success: true,
            code: this.myFriendCode,
            message: `Votre code d'ami : ${this.myFriendCode}`
        };
    }
}

// Instance globale
window.friendsSystem = new FriendsSystem();

console.log('🤝 Système de gestion d\'amis chargé');
