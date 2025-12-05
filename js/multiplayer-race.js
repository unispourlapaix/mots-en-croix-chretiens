// Mode Course Multijoueur - Même grille, course contre les autres joueurs
class MultiplayerRace {
    constructor(game, chatSystem) {
        this.game = game;
        this.chatSystem = chatSystem;
        this.isRaceMode = false;
        this.raceTimer = null;
        this.raceStartTime = null;
        this.raceDuration = 300; // 5 minutes en secondes
        this.players = new Map(); // playerId -> {username, score, wordsCompleted, progress, finishTime}
        this.myProgress = {
            wordsCompleted: 0,
            lettersCorrect: 0,
            totalLetters: 0
        };
        this.raceFinished = false;
        this.lastProgressShare = 0; // Pour le throttling
    }

    // Démarrer une course
    startRace() {
        if (!this.chatSystem || !this.chatSystem.isInRoom()) {
            this.chatSystem.showMessage('⚠️ Rejoignez d\'abord une room pour jouer en multijoueur', 'system');
            return;
        }

        this.isRaceMode = true;
        this.raceFinished = false;
        this.raceStartTime = Date.now();
        this.myProgress = { wordsCompleted: 0, lettersCorrect: 0, totalLetters: 0 };
        this.players.clear();

        // Afficher le timer
        this.startTimer();
        
        // Afficher le panneau des joueurs
        this.showPlayersPanel();
        
        // Afficher la box des scores
        this.showScoreBox();

        // Notifier les autres joueurs
        this.broadcastProgress('start', {
            startTime: this.raceStartTime,
            duration: this.raceDuration
        });
        this.chatSystem.showMessage('🏁 Course démarrée ! 5 minutes pour compléter la grille !', 'system');

        // Envoyer des mises à jour régulières
        this.progressInterval = setInterval(() => {
            this.sendProgressUpdate();
        }, 5000); // Toutes les 5 secondes
        
        // Mettre à jour l'affichage des joueurs régulièrement
        this.playersUpdateInterval = setInterval(() => {
            this.updatePlayersDisplay();
            this.updateScoreBox();
        }, 2000); // Toutes les 2 secondes
    }

    // Démarrer le chronomètre
    startTimer() {
        const timerElement = document.getElementById('raceTimer');
        if (!timerElement) {
            // Créer l'élément timer s'il n'existe pas
            const header = document.querySelector('.header');
            const timer = document.createElement('div');
            timer.id = 'raceTimer';
            timer.className = 'race-timer';
            timer.textContent = '⏱️ 5:00';
            header.appendChild(timer);
        }

        this.raceTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.raceStartTime) / 1000);
            const remaining = Math.max(0, this.raceDuration - elapsed);
            
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            const timerEl = document.getElementById('raceTimer');
            if (timerEl) {
                timerEl.textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                // Changer la couleur selon le temps restant
                if (remaining <= 30) {
                    timerEl.style.color = '#ff1744'; // Rouge
                } else if (remaining <= 60) {
                    timerEl.style.color = '#ff9800'; // Orange
                } else {
                    timerEl.style.color = '#4caf50'; // Vert
                }
            }

            if (remaining === 0) {
                this.endRace();
            }
        }, 1000);
    }

    // Envoyer une mise à jour de progression
    sendProgressUpdate() {
        if (!this.isRaceMode || this.raceFinished) return;

        // Calculer la progression actuelle
        this.calculateProgress();

        this.broadcastProgress('update', {
            wordsCompleted: this.myProgress.wordsCompleted,
            lettersCorrect: this.myProgress.lettersCorrect,
            totalLetters: this.myProgress.totalLetters,
            score: this.game.score
        });
    }
    
    // Partager la progression immédiatement (appelé à chaque lettre)
    shareProgress() {
        if (!this.isRaceMode || this.raceFinished) return;
        
        // Calculer et envoyer la progression sans attendre l'intervalle
        this.calculateProgress();
        
        // Throttle pour éviter trop de messages (max 1 par seconde)
        const now = Date.now();
        if (!this.lastProgressShare || now - this.lastProgressShare > 1000) {
            this.broadcastProgress('progress', {
                wordsCompleted: this.myProgress.wordsCompleted,
                lettersCorrect: this.myProgress.lettersCorrect,
                totalLetters: this.myProgress.totalLetters,
                percentage: this.myProgress.totalLetters > 0 
                    ? Math.round((this.myProgress.lettersCorrect / this.myProgress.totalLetters) * 100)
                    : 0
            });
            this.lastProgressShare = now;
        }
    }
    
    // Partager un mot trouvé
    shareWordFound(word, newScore) {
        if (!this.isRaceMode || this.raceFinished) return;
        
        this.broadcastProgress('word', {
            word: word,
            score: newScore,
            wordsCompleted: this.myProgress.wordsCompleted + 1
        });
    }

    // Calculer la progression actuelle
    calculateProgress() {
        let correctCells = 0;
        let totalCells = 0;
        let wordsCompleted = 0;

        // Compter les lettres correctes
        for (let i = 0; i < this.game.grid.length; i++) {
            for (let j = 0; j < this.game.grid[i].length; j++) {
                if (!this.game.blocked[i][j]) {
                    totalCells++;
                    if (this.game.grid[i][j] === this.game.solution[i][j]) {
                        correctCells++;
                    }
                }
            }
        }

        // Compter les mots complets
        const levelData = gameDataManager.getLevelData(this.game.currentLevel);
        if (levelData && levelData.words) {
            levelData.words.forEach(wordData => {
                let wordComplete = true;
                if (wordData.path) {
                    for (let i = 0; i < wordData.word.length && i < wordData.path.length; i++) {
                        const [row, col] = wordData.path[i];
                        if (this.game.grid[row][col] !== wordData.word[i]) {
                            wordComplete = false;
                            break;
                        }
                    }
                }
                if (wordComplete) wordsCompleted++;
            });
        }

        this.myProgress = {
            wordsCompleted,
            lettersCorrect: correctCells,
            totalLetters: totalCells
        };

        // Vérifier si la grille est complète
        if (correctCells === totalCells && totalCells > 0 && !this.raceFinished) {
            this.finishRace();
        }
    }

    // Terminer la course pour ce joueur
    finishRace() {
        if (this.raceFinished) return;

        this.raceFinished = true;
        const finishTime = Math.floor((Date.now() - this.raceStartTime) / 1000);
        
        // Calculer le bonus selon le classement
        const finishedPlayers = Array.from(this.players.values()).filter(p => p.finishTime).length;
        let bonus = 0;
        if (finishedPlayers === 0) bonus = 500; // Premier
        else if (finishedPlayers === 1) bonus = 300; // Deuxième
        else if (finishedPlayers === 2) bonus = 100; // Troisième

        this.game.score += bonus;
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.textContent = this.game.score;

        const minutes = Math.floor(finishTime / 60);
        const seconds = finishTime % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        this.broadcastProgress('finish', {
            score: this.game.score,
            finishTime,
            bonus
        });

        this.chatSystem.showMessage(`🏁 Vous avez terminé en ${timeStr} ! +${bonus} pts bonus`, 'system');
    }

    // Terminer la course (temps écoulé)
    endRace() {
        clearInterval(this.raceTimer);
        clearInterval(this.progressInterval);
        clearInterval(this.playersUpdateInterval);
        this.isRaceMode = false;

        // Afficher le classement final
        this.showFinalRanking();

        const timerEl = document.getElementById('raceTimer');
        if (timerEl) {
            timerEl.remove();
        }
        
        // Cacher le panneau des joueurs et la box des scores
        this.hidePlayersPanel();
        this.hideScoreBox();
        
        // Notifier l'UI que la course est terminée
        window.dispatchEvent(new Event('raceEnded'));
    }

    // Afficher le classement final
    showFinalRanking() {
        this.chatSystem.showMessage('⏰ Temps écoulé ! Classement final :', 'system');

        // Créer le tableau des scores
        const allPlayers = [
            {
                username: this.chatSystem.currentUser,
                score: this.game.score,
                finishTime: this.raceFinished ? Math.floor((Date.now() - this.raceStartTime) / 1000) : null
            },
            ...Array.from(this.players.values())
        ];

        // Trier par score décroissant
        allPlayers.sort((a, b) => b.score - a.score);

        // Afficher le top 5
        allPlayers.slice(0, 5).forEach((player, index) => {
            const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index];
            const timeStr = player.finishTime 
                ? ` (${Math.floor(player.finishTime / 60)}:${(player.finishTime % 60).toString().padStart(2, '0')})`
                : ' (incomplet)';
            this.chatSystem.showMessage(`${medal} ${player.username}: ${player.score} pts${timeStr}`, 'system');
        });
    }

    // Diffuser la progression via P2P
    broadcastProgress(type, data = {}) {
        if (!this.chatSystem || !this.chatSystem.connections) return;

        const message = {
            type: 'race',
            action: type,
            username: this.chatSystem.currentUser,
            data: data,
            timestamp: Date.now()
        };

        this.chatSystem.connections.forEach((conn) => {
            if (conn.open) {
                conn.send(message);
            }
        });
    }

    // Recevoir une mise à jour de progression d'un autre joueur
    receiveProgress(username, action, data) {
        if (!this.players.has(username)) {
            this.players.set(username, {
                username,
                score: 0,
                wordsCompleted: 0,
                progress: 0,
                finishTime: null
            });
        }

        const player = this.players.get(username);

        switch (action) {
            case 'start':
                // Recevoir notification de démarrage de course
                if (!this.isRaceMode && data.startTime && data.duration) {
                    // Rejoindre la course en cours
                    this.joinOngoingRace(data.startTime, data.duration);
                } else {
                    this.chatSystem.showMessage(`🏁 ${username} a rejoint la course !`, 'system');
                }
                break;
            
            case 'state':
                // Recevoir l'état complet de la course en cours
                if (!this.isRaceMode && data.isRaceActive) {
                    this.joinOngoingRace(data.startTime, data.duration);
                }
                break;
            
            case 'progress':
                // Mise à jour de progression en temps réel
                player.lettersCorrect = data.lettersCorrect || 0;
                player.totalLetters = data.totalLetters || 0;
                player.wordsCompleted = data.wordsCompleted || 0;
                player.progress = data.percentage || 0;
                // Mettre à jour l'affichage immédiatement
                this.updatePlayersDisplay();
                this.updateScoreBox();
                break;
            
            case 'word':
                // Un joueur a trouvé un mot
                player.score = data.score || 0;
                player.wordsCompleted = data.wordsCompleted || 0;
                this.chatSystem.showMessage(`🎯 ${username} a trouvé : "${data.word}" !`, 'ai');
                // Mettre à jour l'affichage immédiatement
                this.updatePlayersDisplay();
                this.updateScoreBox();
                break;

            case 'update':
                player.score = data.score || 0;
                player.wordsCompleted = data.wordsCompleted || 0;
                const progress = data.totalLetters > 0 
                    ? Math.round((data.lettersCorrect / data.totalLetters) * 100)
                    : 0;
                player.progress = progress;

                // Notifier les jalons importants
                if (data.wordsCompleted > 0 && data.wordsCompleted % 3 === 0 && data.wordsCompleted !== player.lastNotifiedWords) {
                    player.lastNotifiedWords = data.wordsCompleted;
                    this.chatSystem.showMessage(`⭐ ${username} : ${data.wordsCompleted} mots complétés !`, 'system');
                }
                // Mettre à jour l'affichage
                this.updatePlayersDisplay();
                this.updateScoreBox();
                break;

            case 'finish':
                player.finishTime = data.finishTime;
                player.score = data.score;
                const minutes = Math.floor(data.finishTime / 60);
                const seconds = data.finishTime % 60;
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                this.chatSystem.showMessage(`🎊 ${username} a terminé en ${timeStr} ! (${data.score} pts, +${data.bonus} bonus)`, 'system');
                // Mettre à jour l'affichage immédiatement
                this.updatePlayersDisplay();
                this.updateScoreBox();
                break;
        }
    }

    // Arrêter le mode course
    stopRace() {
        if (this.raceTimer) clearInterval(this.raceTimer);
        if (this.progressInterval) clearInterval(this.progressInterval);
        if (this.playersUpdateInterval) clearInterval(this.playersUpdateInterval);
        this.isRaceMode = false;
        this.raceFinished = false;
        
        const timerEl = document.getElementById('raceTimer');
        if (timerEl) timerEl.remove();
        
        // Cacher le panneau des joueurs et la box des scores
        this.hidePlayersPanel();
        this.hideScoreBox();
        
        // Notifier l'UI que la course est terminée
        window.dispatchEvent(new Event('raceEnded'));
    }
    
    // Afficher la box des scores
    showScoreBox() {
        const box = document.getElementById('raceScoreBox');
        if (box) {
            box.style.display = 'block';
            this.updateScoreBox();
        }
    }
    
    // Cacher la box des scores
    hideScoreBox() {
        const box = document.getElementById('raceScoreBox');
        if (box) {
            box.style.display = 'none';
        }
    }
    
    // Mettre à jour la box des scores
    updateScoreBox() {
        const listEl = document.getElementById('raceScoreList');
        if (!listEl || !this.isRaceMode) return;
        
        // Calculer ma progression actuelle
        this.calculateProgress();
        
        // Créer la liste de tous les joueurs
        const allPlayers = [
            {
                username: this.chatSystem.currentUser,
                score: this.game.score,
                isMe: true
            },
            ...Array.from(this.players.values()).map(p => ({
                username: p.username,
                score: p.score || 0,
                isMe: false
            }))
        ];
        
        // Trier par score décroissant
        allPlayers.sort((a, b) => b.score - a.score);
        
        // Générer le HTML
        listEl.innerHTML = allPlayers.map((player, index) => {
            const avatar = this.chatSystem.getUserAvatar(player.username);
            const meClass = player.isMe ? 'me' : '';
            const leaderClass = index === 0 ? 'leader' : '';
            const medal = index === 0 ? '👑' : '';
            
            return `
                <div class="race-score-item ${meClass} ${leaderClass}">
                    <span class="race-score-avatar">${avatar}</span>
                    <span class="race-score-name">${medal} ${player.username}</span>
                    <span class="race-score-points">⭐${player.score}</span>
                </div>
            `;
        }).join('');
    }
    
    // Afficher le panneau des joueurs
    showPlayersPanel() {
        const panel = document.getElementById('racePlayersPanel');
        if (panel) {
            panel.style.display = 'block';
            this.updatePlayersDisplay();
        }
    }
    
    // Cacher le panneau des joueurs
    hidePlayersPanel() {
        const panel = document.getElementById('racePlayersPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
    
    // Mettre à jour l'affichage des joueurs
    updatePlayersDisplay() {
        const listEl = document.getElementById('racePlayersList');
        if (!listEl || !this.isRaceMode) return;
        
        // Calculer ma progression actuelle
        this.calculateProgress();
        
        // Créer la liste de tous les joueurs
        const allPlayers = [
            {
                username: this.chatSystem.currentUser,
                score: this.game.score,
                wordsCompleted: this.myProgress.wordsCompleted,
                progress: this.myProgress.totalLetters > 0 
                    ? Math.round((this.myProgress.lettersCorrect / this.myProgress.totalLetters) * 100)
                    : 0,
                isMe: true,
                finishTime: this.raceFinished ? Math.floor((Date.now() - this.raceStartTime) / 1000) : null
            },
            ...Array.from(this.players.values()).map(p => ({
                ...p,
                isMe: false
            }))
        ];
        
        // Trier par score décroissant
        allPlayers.sort((a, b) => b.score - a.score);
        
        // Générer le HTML
        listEl.innerHTML = allPlayers.map((player, index) => {
            const medal = ['🥇', '🥈', '🥉'][index] || `${index + 1}.`;
            const avatar = this.chatSystem.getUserAvatar(player.username);
            const meClass = player.isMe ? 'me' : '';
            const finishedIcon = player.finishTime ? '✅' : '';
            
            return `
                <div class="race-player-item ${meClass}">
                    <div class="race-player-info">
                        <span class="race-player-avatar">${medal} ${avatar}</span>
                        <span class="race-player-name">${player.username} ${finishedIcon}</span>
                    </div>
                    <div class="race-player-stats">
                        <div class="race-player-progress">
                            <div class="race-progress-bar">
                                <div class="race-progress-fill" style="width: ${player.progress}%"></div>
                            </div>
                            <span>${player.progress}%</span>
                        </div>
                        <div class="race-player-words">📝 ${player.wordsCompleted}</div>
                        <div class="race-player-score">⭐ ${player.score}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Obtenir l'état actuel de la course
    getRaceState() {
        return {
            isRaceActive: this.isRaceMode,
            startTime: this.raceStartTime,
            duration: this.raceDuration,
            myProgress: this.myProgress,
            players: Array.from(this.players.values())
        };
    }
    
    // Rejoindre une course déjà en cours
    joinOngoingRace(startTime, duration) {
        if (this.isRaceMode) return; // Déjà dans une course
        
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        
        if (remaining <= 0) {
            this.chatSystem.showMessage('⏰ La course est déjà terminée', 'system');
            return;
        }
        
        this.isRaceMode = true;
        this.raceFinished = false;
        this.raceStartTime = startTime;
        this.raceDuration = duration;
        this.myProgress = { wordsCompleted: 0, lettersCorrect: 0, totalLetters: 0 };
        
        // Afficher le timer avec le temps correct
        this.startTimer();
        
        // Afficher le panneau des joueurs
        this.showPlayersPanel();
        
        // Afficher la box des scores
        this.showScoreBox();
        
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        this.chatSystem.showMessage(`🏁 Course en cours ! Temps restant: ${minutes}:${seconds.toString().padStart(2, '0')}`, 'system');
        
        // Envoyer des mises à jour régulières
        this.progressInterval = setInterval(() => {
            this.sendProgressUpdate();
        }, 5000);
        
        // Mettre à jour l'affichage des joueurs régulièrement
        this.playersUpdateInterval = setInterval(() => {
            this.updatePlayersDisplay();
            this.updateScoreBox();
        }, 2000);
        
        // Mettre à jour l'UI
        const startBtn = document.getElementById('startRaceButton');
        const stopBtn = document.getElementById('stopRaceButton');
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';
    }
}

// Instance globale
window.multiplayerRace = null;

// Initialiser quand le jeu est prêt
const initMultiplayerRace = () => {
    let attempts = 0;
    const maxAttempts = 100; // 10 secondes max (100 * 100ms)
    
    const checkInit = setInterval(() => {
        attempts++;
        
        if (window.game && window.simpleChatSystem) {
            window.multiplayerRace = new MultiplayerRace(window.game, window.simpleChatSystem);
            clearInterval(checkInit);
            console.log('✅ Mode Multijoueur initialisé');
        } else if (attempts >= maxAttempts) {
            clearInterval(checkInit);
            console.warn('⚠️ Timeout: Mode Multijoueur non initialisé après 10 secondes');
            console.warn('   window.game:', !!window.game, 'window.simpleChatSystem:', !!window.simpleChatSystem);
        }
    }, 100);
};

// Lancer l'initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMultiplayerRace);
} else {
    initMultiplayerRace();
}
