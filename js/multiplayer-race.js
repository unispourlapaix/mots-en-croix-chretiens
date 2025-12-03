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

        // Notifier les autres joueurs
        this.broadcastProgress('start');
        this.chatSystem.showMessage('🏁 Course démarrée ! 5 minutes pour compléter la grille !', 'system');

        // Envoyer des mises à jour régulières
        this.progressInterval = setInterval(() => {
            this.sendProgressUpdate();
        }, 5000); // Toutes les 5 secondes
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
        this.isRaceMode = false;

        // Afficher le classement final
        this.showFinalRanking();

        const timerEl = document.getElementById('raceTimer');
        if (timerEl) {
            timerEl.remove();
        }
        
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
                this.chatSystem.showMessage(`🏁 ${username} a rejoint la course !`, 'system');
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
                break;

            case 'finish':
                player.finishTime = data.finishTime;
                player.score = data.score;
                const minutes = Math.floor(data.finishTime / 60);
                const seconds = data.finishTime % 60;
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                this.chatSystem.showMessage(`🎊 ${username} a terminé en ${timeStr} ! (${data.score} pts, +${data.bonus} bonus)`, 'system');
                break;
        }
    }

    // Arrêter le mode course
    stopRace() {
        if (this.raceTimer) clearInterval(this.raceTimer);
        if (this.progressInterval) clearInterval(this.progressInterval);
        this.isRaceMode = false;
        this.raceFinished = false;
        
        const timerEl = document.getElementById('raceTimer');
        if (timerEl) timerEl.remove();
        
        // Notifier l'UI que la course est terminée
        window.dispatchEvent(new Event('raceEnded'));
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
