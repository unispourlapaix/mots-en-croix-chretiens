// Module principal du jeu de mots croisés

// Vérifier que config est chargé
if (typeof config === 'undefined') {
    console.error('❌ ERREUR: config.js non chargé. Rechargez la page (Ctrl+F5).');
    throw new Error('config.js doit être chargé avant game.js');
}

// Vérifier que gameDataManager est chargé
if (typeof gameDataManager === 'undefined') {
    console.error('❌ ERREUR: gameData.js non chargé. Rechargez la page (Ctrl+F5).');
    throw new Error('gameData.js doit être chargé avant game.js');
}

class ChristianCrosswordGame {
    constructor() {
        this.clickCount = 0;
        this.currentLevel = 1;
        this.score = 0;          // Score du mode en cours (repart à 0 à chaque mode)
        this.totalScore = 0;     // Score total cumulé de tous les modes
        this.maxScore = 0;       // Meilleur score jamais atteint
        this.raceScore = 0;      // Score en mode course
        this.gameStarted = false;
        this.currentWordIndex = null; // Index du mot en cours de saisie
        this.lastMoveDirection = null; // Direction du dernier mouvement (horizontal/vertical)
        this.gameMode = 'normal'; // 'normal' ou 'couple'
        this.grid = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.solution = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.blocked = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(false));
        this.words = []; // Initialiser le tableau de mots

        // Tracking des performances pour achievements
        this.hintsUsedThisLevel = 0;

        // Tracking des mots complétés pour éviter les notifications répétées
        this.completedWords = new Set();
        
        // Tracking des mots révélés avec un indice (ne donnent pas de points)
        this.wordsWithHints = new Set();
        
        // Compteur de lettres correctes trouvées
        this.correctLettersCount = 0;

        // Mode multijoueur
        this.multiplayerMode = false;
        this.multiplayerManager = null;

        // Charger les paramètres audio
        this.loadAudioSettings();

        this.initializeEventListeners();
        this.setupMenuLanguageSelector();
        this.updateUIText();
        
        // Mettre à jour le niveau max selon le mode
        this.updateMaxLevelDisplay();

        // Écouter les changements de langue
        window.addEventListener('languageChanged', () => {
            this.onLanguageChange();
        });
        
        // Sauvegarder avant de quitter ou actualiser la page
        window.addEventListener('beforeunload', () => {
            this.saveGame();
            // Nettoyer l'intervalle de sauvegarde automatique
            if (this.autoSaveInterval) {
                clearInterval(this.autoSaveInterval);
            }
        });
        
        // Sauvegarder automatiquement toutes les 3 minutes
        this.autoSaveInterval = setInterval(() => {
            if (this.gameStarted) {
                console.log('⏰ Sauvegarde automatique (3 min)');
                this.saveGame();
            }
        }, 3 * 60 * 1000); // 3 minutes en millisecondes
    }

    /**
     * Normalise une lettre en supprimant les accents
     * É → E, À → A, Ç → C, etc.
     */
    normalizeAccents(letter) {
        const map = {
            'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
            'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
            'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
            'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
            'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
            'Ç': 'C', 'Ñ': 'N'
        };
        return map[letter] || letter;
    }

    /**
     * Compare deux lettres en ignorant les accents
     */
    lettersMatch(input, expected) {
        return this.normalizeAccents(input) === this.normalizeAccents(expected);
    }

    saveGame() {
        // CRITICAL: Ne JAMAIS sauvegarder pendant un clearSave
        if (this.isClearingData) {
            console.log('🚫 Sauvegarde bloquée: clearSave en cours');
            return;
        }
        
        // Ne sauvegarder QUE si le jeu est réellement démarré
        if (!this.gameStarted) {
            return;
        }
        
        // Mode Race ne sauvegarde pas la progression (seulement le score)
        if (this.gameMode === 'race') {
            console.log('🏁 Mode Race: pas de sauvegarde de progression');
            return;
        }
        
        // Sauvegarder la progression complète
        const saveData = {
            currentLevel: this.currentLevel,
            score: this.score,
            clickCount: this.clickCount,
            gameStarted: this.gameStarted,
            gameMode: this.gameMode,
            completedWords: Array.from(this.completedWords || []),
            grid: this.grid, // Sauvegarder la grille en cours
            currentWordIndex: this.currentWordIndex,
            lastMoveDirection: this.lastMoveDirection,
            hintsUsedThisLevel: this.hintsUsedThisLevel,
            timestamp: Date.now()
        };
        
        // Sauvegarder avec une clé spécifique au mode de jeu
        const saveKey = `christianCrosswordSave_${this.gameMode}`;
        localStorage.setItem(saveKey, JSON.stringify(saveData));
        console.log(`💾 Partie sauvegardée [${this.gameMode.toUpperCase()}] - Niveau ${this.currentLevel} - Score ${this.score}`);
        
        // Partager la progression en multijoueur si on est l'hôte
        if (this.multiplayerManager && this.multiplayerManager.isHost && this.multiplayerManager.isConnected) {
            this.multiplayerManager.shareGameProgress();
        }
        
        // Envoyer le score mis à jour en multijoueur
        if (this.multiplayerManager && this.multiplayerManager.isConnected) {
            this.multiplayerManager.sendScoreUpdate();
        }
    }

    loadGame() {
        // Mode Race ne charge pas de progression
        if (this.gameMode === 'race') {
            console.log('🏁 Mode Race: pas de chargement de progression');
            return;
        }
        
        // Charger la sauvegarde du mode actuel (ou du mode par défaut)
        const currentMode = this.gameMode || localStorage.getItem('gameMode') || 'normal';
        const saveKey = `christianCrosswordSave_${currentMode}`;
        const savedData = localStorage.getItem(saveKey);
        
        // Si pas de sauvegarde pour ce mode, vérifier l'ancienne clé (migration)
        if (!savedData) {
            const oldSave = localStorage.getItem('christianCrosswordSave');
            if (oldSave) {
                try {
                    const oldData = JSON.parse(oldSave);
                    // Migrer vers la nouvelle clé selon le mode sauvegardé
                    const oldMode = oldData.gameMode || 'normal';
                    const newKey = `christianCrosswordSave_${oldMode}`;
                    localStorage.setItem(newKey, oldSave);
                    localStorage.removeItem('christianCrosswordSave');
                    console.log(`🔄 Migration sauvegarde vers mode ${oldMode}`);
                    
                    // Si c'est le mode actuel, continuer le chargement
                    if (oldMode === currentMode) {
                        this.loadGameFromData(oldData);
                        return;
                    }
                } catch (e) {
                    console.error('❌ Erreur migration:', e);
                }
            }
            
            console.log(`📂 Aucune sauvegarde pour le mode [${currentMode.toUpperCase()}]`);
            this.checkOtherModeSaves();
            return;
        }
        
        try {
            const data = JSON.parse(savedData);
            
            // CRITICAL: Charger SEULEMENT si le jeu était vraiment démarré
            if (!data.gameStarted) {
                console.log(`📂 Sauvegarde [${currentMode.toUpperCase()}] existe mais jeu non démarré - Ignorer`);
                return;
            }
            
            this.loadGameFromData(data);
        } catch (e) {
            console.error('❌ Erreur chargement sauvegarde:', e);
            // En cas d'erreur de parsing, effacer la sauvegarde corrompue
            localStorage.removeItem(saveKey);
        }
    }

    checkOtherModeSaves() {
        // Vérifier s'il existe des sauvegardes dans d'autres modes (seulement Normal et Couple)
        const modes = ['normal', 'couple'];
        const availableSaves = [];
        
        modes.forEach(mode => {
            const saveKey = `christianCrosswordSave_${mode}`;
            const save = localStorage.getItem(saveKey);
            if (save) {
                try {
                    const data = JSON.parse(save);
                    if (data.gameStarted) {
                        availableSaves.push({
                            mode,
                            level: data.currentLevel,
                            score: data.score,
                            timestamp: data.timestamp
                        });
                    }
                } catch (e) {
                    // Ignorer les sauvegardes corrompues
                }
            }
        });
        
        if (availableSaves.length > 0) {
            console.log('💡 Parties disponibles dans d\'autres modes:');
            availableSaves.forEach(save => {
                const modeEmoji = save.mode === 'couple' ? '👫' : save.mode === 'race' ? '🏁' : '🎯';
                console.log(`   ${modeEmoji} ${save.mode.toUpperCase()}: Niveau ${save.level}, Score ${save.score}`);
            });
            
            // Afficher un message dans le chat si disponible
            if (window.simpleChatSystem) {
                const modeNames = availableSaves.map(s => {
                    const emoji = s.mode === 'couple' ? '👫' : s.mode === 'race' ? '🏁' : '🎯';
                    return `${emoji} ${s.mode} (niv.${s.level})`;
                }).join(', ');
                window.simpleChatSystem.showMessage(
                    `💡 Vous avez des parties en cours: ${modeNames}. Changez de mode pour les reprendre !`,
                    'system'
                );
            }
        }
    }

    loadGameFromData(data) {
        console.log(`📂 Restauration partie [${data.gameMode?.toUpperCase() || 'NORMAL'}]:`, {
            level: data.currentLevel,
            score: data.score,
            completedWordsCount: data.completedWords?.length || 0
        });
        
        // Indiquer au chat de ne pas afficher les messages de bienvenue
        if (window.simpleChatSystem) {
            window.simpleChatSystem.skipWelcomeMessages = true;
        }
            
        // Restaurer l'état du jeu
        this.currentLevel = data.currentLevel || 1;
        this.score = data.score || 0;
        this.maxScore = data.maxScore || this.score; // Utiliser maxScore sauvegardé ou score actuel
        this.raceScore = data.raceScore || 0;
            this.clickCount = data.clickCount || 0;
            this.gameStarted = true;
            this.gameMode = data.gameMode || 'normal';
            this.completedWords = new Set(data.completedWords || []);
            this.currentWordIndex = data.currentWordIndex || null;
            this.lastMoveDirection = data.lastMoveDirection || null;
            this.hintsUsedThisLevel = data.hintsUsedThisLevel || 0;
            
            // Restaurer la grille si elle existe
            if (data.grid) {
                this.grid = data.grid;
                console.log('📝 Grille restaurée avec', 
                    this.grid.flat().filter(cell => cell && cell !== '').length, 
                    'lettres'
                );
            }
            
            // Charger le score total
            const savedTotalScore = localStorage.getItem('christianCrosswordTotalScore');
            if (savedTotalScore) {
                this.totalScore = parseInt(savedTotalScore, 10) || 0;
                console.log('🎯 Score total chargé:', this.totalScore);
            }
                
            setTimeout(() => {
                    try {
                        // Masquer l'écran de démarrage et le bouton jouer
                        document.getElementById('startScreen').classList.add('hidden');
                        document.getElementById('playButton').style.display = 'none';
                        
                        // Afficher l'écran de jeu
                        document.getElementById('gameScreen').classList.remove('hidden');
                        
                        // Mettre à jour l'UI
                        const scoreEl = document.getElementById('infoBannerScore');
                        const levelEl = document.getElementById('infoBannerLevel');
                        if (scoreEl) scoreEl.textContent = this.score;
                        if (levelEl) levelEl.textContent = this.currentLevel;
                        
                        // Recharger le niveau complètement
                        this.setupLevel();
                        
                        // Restaurer les lettres saisies
                        if (data.grid) this.grid = data.grid;
                        this.restoreGridLetters();
                        
                        // Compléter automatiquement les mots déjà complétés
                        this.restoreCompletedWords();
                        
                        // Notifier que le jeu a été chargé (pour Unisona et les bots)
                        window.dispatchEvent(new CustomEvent('gameLoaded', {
                            detail: {
                                level: this.currentLevel,
                                gameMode: this.gameMode
                            }
                        }));
                        
                    } catch (error) {
                        console.error('❌ Erreur restauration:', error);
                        // En cas d'erreur, réinitialiser l'état et afficher l'écran de démarrage
                        this.gameStarted = false;
                        document.getElementById('startScreen').classList.remove('hidden');
                        document.getElementById('gameScreen').classList.add('hidden');
                        document.getElementById('playButton').style.display = 'inline-block';
                        // Effacer la sauvegarde corrompue du mode actuel
                        const saveKey = `christianCrosswordSave_${this.gameMode}`;
                        localStorage.removeItem(saveKey);
                    }
                }, 100);
    }

    clearSave() {
        // CRITICAL: Bloquer toute sauvegarde pendant l'effacement
        this.isClearingData = true;
        
        // Réinitialiser complètement l'état du jeu
        this.gameStarted = false;
        this.completedWords = new Set();
        this.currentLevel = 1;
        this.score = 0;
        this.maxScore = 0;
        this.raceScore = 0;
        this.clickCount = 0;
        
        // Effacer toutes les sauvegardes de tous les modes
        const modes = ['normal', 'couple', 'race'];
        modes.forEach(mode => {
            const saveKey = `christianCrosswordSave_${mode}`;
            localStorage.removeItem(saveKey);
        });
        // Effacer aussi l'ancienne clé pour migration
        localStorage.removeItem('christianCrosswordSave');
        
        // Marquer qu'on a effacé pour éviter que le cloud recharge
        this.saveCleared = true;
        
        console.log('🗑️ Toutes les sauvegardes effacées (Normal, Couple, Race)');
        console.log('🔒 Blocage des sauvegardes activé');
    }

    checkAndAskForResumeOrRestart() {
        // Récupérer toutes les sauvegardes disponibles (tous les modes)
        const modes = ['normal', 'couple', 'sagesse', 'proverbes', 'disciple', 'veiller', 'aimee'];
        const availableSaves = [];
        
        modes.forEach(mode => {
            const saveKey = `christianCrosswordSave_${mode}`;
            const save = localStorage.getItem(saveKey);
            if (save) {
                try {
                    const data = JSON.parse(save);
                    if (data.gameStarted) {
                        availableSaves.push({
                            mode,
                            data,
                            saveKey,
                            timestamp: data.timestamp || 0
                        });
                    }
                } catch (e) {
                    console.error(`❌ Erreur lecture sauvegarde ${mode}:`, e);
                }
            }
        });
        
        // Vérifier aussi l'ancienne clé pour migration
        const oldSave = localStorage.getItem('christianCrosswordSave');
        if (oldSave && availableSaves.length === 0) {
            try {
                const oldData = JSON.parse(oldSave);
                if (oldData.gameStarted) {
                    const oldMode = oldData.gameMode || 'normal';
                    availableSaves.push({
                        mode: oldMode,
                        data: oldData,
                        saveKey: 'christianCrosswordSave',
                        timestamp: oldData.timestamp || 0,
                        needsMigration: true
                    });
                }
            } catch (e) {
                console.error('❌ Erreur lecture ancienne sauvegarde:', e);
            }
        }
        
        if (availableSaves.length === 0) {
            console.log('📂 Aucune sauvegarde - Affichage sélecteur de mode');
            this.showNewGameModeSelection();
            return;
        }
        
        // Trier par timestamp décroissant (plus récent en premier)
        availableSaves.sort((a, b) => b.timestamp - a.timestamp);
        
        // Afficher la modal de choix
        this.showResumeModal(availableSaves);
    }

    showResumeModal(availableSaves) {
        const modal = document.createElement('div');
        modal.className = 'resume-modal';
        
        // Créer la liste des parties disponibles
        const savesHTML = availableSaves.map((save, index) => {
            const modeEmoji = save.mode === 'couple' ? '👫' : save.mode === 'race' ? '🏁' : '🎯';
            const modeName = save.mode === 'couple' ? 'Couple' : save.mode === 'race' ? 'Course' : 'Normal';
            const lettresCount = save.data.grid ? save.data.grid.flat().filter(cell => cell && cell !== '').length : 0;
            const isRecent = index === 0;
            const date = save.timestamp ? new Date(save.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
            
            return `
                <div class="resume-save-item ${isRecent ? 'most-recent' : ''}" data-mode="${save.mode}">
                    ${isRecent ? '<div class="recent-badge">Plus récent</div>' : ''}
                    <div class="resume-save-header">
                        <span class="resume-save-mode">${modeEmoji} ${modeName}</span>
                        ${date ? `<span class="resume-save-date">${date}</span>` : ''}
                    </div>
                    <div class="resume-save-stats">
                        <div class="resume-stat">
                            <span class="resume-stat-label">Niveau</span>
                            <span class="resume-stat-value">${save.data.currentLevel}</span>
                        </div>
                        <div class="resume-stat">
                            <span class="resume-stat-label">Score</span>
                            <span class="resume-stat-value">${save.data.score}</span>
                        </div>
                        ${lettresCount > 0 ? `
                        <div class="resume-stat">
                            <span class="resume-stat-label">Lettres</span>
                            <span class="resume-stat-value">${lettresCount}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="resume-save-actions">
                        <button class="resume-save-btn resume-continue-btn" data-index="${index}">
                            ▶️ Continuer
                        </button>
                        <button class="resume-save-btn resume-delete-btn" data-index="${index}">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        modal.innerHTML = `
            <div class="resume-modal-content">
                <div class="resume-modal-header">
                    <h2>🎮 Parties sauvegardées</h2>
                    <p class="resume-subtitle">Reprenez où vous en étiez ou choisissez un nouveau mode</p>
                </div>
                <div class="resume-modal-body">
                    <div class="resume-saves-list">
                        ${savesHTML}
                    </div>
                </div>
                <div class="resume-modal-footer">
                    <button class="resume-btn resume-btn-new" id="resumeNewGame">
                        ✨ Choisir un mode de jeu
                    </button>
                    <button class="resume-btn resume-btn-close" id="resumeClose">
                        ❌ Annuler
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer les boutons de continuation
        modal.querySelectorAll('.resume-continue-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const save = availableSaves[index];
                
                // Migrer si nécessaire
                if (save.needsMigration) {
                    const newKey = `christianCrosswordSave_${save.mode}`;
                    localStorage.setItem(newKey, JSON.stringify(save.data));
                    localStorage.removeItem('christianCrosswordSave');
                    console.log(`🔄 Migration sauvegarde vers ${save.mode}`);
                }
                
                // Définir le mode avant de charger
                this.gameMode = save.mode;
                localStorage.setItem('gameMode', save.mode);
                
                modal.remove();
                this.loadGameFromData(save.data);
                
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.showMessage(
                        `▶️ Reprise de la partie ${save.mode === 'couple' ? '👫' : save.mode === 'race' ? '🏁' : '🎯'} ${save.mode.toUpperCase()} - Niveau ${save.data.currentLevel}`,
                        'system'
                    );
                }
            });
        });
        
        // Gérer les boutons de suppression
        modal.querySelectorAll('.resume-delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const index = parseInt(e.target.dataset.index);
                const save = availableSaves[index];
                
                // Créer une modal de confirmation personnalisée
                const confirmDelete = await CustomModals.showConfirm(
                    '🗑️ Supprimer la partie ?',
                    `Êtes-vous sûr de vouloir supprimer la partie ${save.mode.toUpperCase()} ?\n\nNiveau ${save.data.currentLevel || 1} - ${save.data.score || 0} points\n\nCette action est irréversible.`,
                    '🗑️ Supprimer',
                    '❌ Annuler'
                );
                
                if (confirmDelete) {
                    localStorage.removeItem(save.saveKey);
                    availableSaves.splice(index, 1);
                    
                    if (availableSaves.length === 0) {
                        modal.remove();
                        console.log('🗑️ Toutes les sauvegardes supprimées');
                    } else {
                        // Rafraîchir la modal
                        modal.remove();
                        this.showResumeModal(availableSaves);
                    }
                    
                    if (window.simpleChatSystem) {
                        window.simpleChatSystem.showMessage(
                            `🗑️ Partie ${save.mode.toUpperCase()} supprimée`,
                            'system'
                        );
                    }
                }
            });
        });
        
        // Gérer le bouton "Choisir un mode"
        document.getElementById('resumeNewGame').addEventListener('click', () => {
            modal.remove();
            this.showNewGameModeSelection();
        });
        
        // Gérer le bouton "Annuler"
        document.getElementById('resumeClose').addEventListener('click', () => {
            modal.remove();
        });
        
        // Animation d'entrée
        setTimeout(() => modal.classList.add('show'), 10);
    }

    showNewGameModeSelection() {
        const modal = document.createElement('div');
        modal.className = 'resume-modal';
        modal.innerHTML = `
            <div class="resume-modal-content mode-selection">
                <div class="resume-modal-header">
                    <h2>✨ Nouvelle partie</h2>
                    <p class="resume-subtitle">Choisissez un mode de jeu</p>
                </div>
                <div class="resume-modal-body">
                    <div class="mode-cards">
                        <div class="mode-card" data-mode="normal">
                            <div class="mode-card-icon">🙏</div>
                            <div class="mode-card-title">Normal</div>
                            <div class="mode-card-desc">77 niveaux classiques</div>
                        </div>
                        <div class="mode-card" data-mode="couple">
                            <div class="mode-card-icon">💕</div>
                            <div class="mode-card-title">Couple</div>
                            <div class="mode-card-desc">122 mots d'amour et d'unité</div>
                        </div>
                        <div class="mode-card" data-mode="sagesse">
                            <div class="mode-card-icon">🕊️</div>
                            <div class="mode-card-title">Sagesse</div>
                            <div class="mode-card-desc">88 sagesses divines</div>
                        </div>
                        <div class="mode-card" data-mode="proverbes">
                            <div class="mode-card-icon">📖</div>
                            <div class="mode-card-title">Proverbes</div>
                            <div class="mode-card-desc">88 proverbes bibliques</div>
                        </div>
                        <div class="mode-card" data-mode="disciple">
                            <div class="mode-card-icon">✝️</div>
                            <div class="mode-card-title">Disciple</div>
                            <div class="mode-card-desc">88 vers l'amour vrai</div>
                        </div>
                        <div class="mode-card" data-mode="veiller">
                            <div class="mode-card-icon">👁️</div>
                            <div class="mode-card-title">Veiller</div>
                            <div class="mode-card-desc">88 vertus vs maux</div>
                        </div>
                        <div class="mode-card" data-mode="aimee">
                            <div class="mode-card-icon">❤️</div>
                            <div class="mode-card-title">Aimée</div>
                            <div class="mode-card-desc">88 aimer Dieu & autrui</div>
                        </div>
                        <div class="mode-card" data-mode="couple-solide">
                            <div class="mode-card-icon">💑</div>
                            <div class="mode-card-title">Couple Solide</div>
                            <div class="mode-card-desc">88 clés du couple</div>
                        </div>
                    </div>
                </div>
                <div class="resume-modal-footer">
                    <button class="resume-btn resume-btn-back" id="backToSaves">
                        ← Retour
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer le clic sur les cartes de mode
        modal.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', async () => {
                const mode = card.dataset.mode;
                
                // Vérifier s'il existe déjà une sauvegarde pour ce mode
                const saveKey = `christianCrosswordSave_${mode}`;
                const existingSave = localStorage.getItem(saveKey);
                
                if (existingSave) {
                    if (await CustomModals.showConfirm('🗑️ Partie existante', `Une partie ${mode.toUpperCase()} existe déjà. La supprimer pour recommencer ?`, '🗑️ Supprimer', '❌ Garder')) {
                        localStorage.removeItem(saveKey);
                    } else {
                        modal.remove();
                        return;
                    }
                }
                
                // Définir le mode et commencer
                this.gameMode = mode;
                localStorage.setItem('gameMode', mode);
                
                modal.remove();
                
                if (window.simpleChatSystem) {
                    const modeIcons = {
                        'normal': '🙏',
                        'couple': '💕',
                        'sagesse': '🕊️',
                        'proverbes': '📖',
                        'disciple': '✝️',
                        'veiller': '👁️',
                        'aimee': '❤️',
                        'race': '🏁'
                    };
                    const modeEmoji = modeIcons[mode] || '🎯';
                    window.simpleChatSystem.showMessage(
                        `${modeEmoji} Nouvelle partie en mode ${mode.toUpperCase()} !`,
                        'system'
                    );
                }
            });
        });
        
        // Bouton retour
        document.getElementById('backToSaves').addEventListener('click', () => {
            modal.remove();
            this.checkAndAskForResumeOrRestart();
        });
        
        setTimeout(() => modal.classList.add('show'), 10);
    }

    restoreCompletedWords() {
        // Remplir automatiquement les mots complétés dans la grille
        if (!this.completedWords || this.completedWords.size === 0) {
            return;
        }

        console.log('🔄 Restauration des mots complétés:', this.completedWords.size);
        
        this.words.forEach(wordData => {
            const wordKey = `${wordData.word}_${wordData.row}_${wordData.col}`;
            
            // Si ce mot était complété
            if (this.completedWords.has(wordKey)) {
                // Remplir les lettres dans la grille
                if (wordData.path) {
                    for (let i = 0; i < wordData.word.length && i < wordData.path.length; i++) {
                        const [row, col] = wordData.path[i];
                        const letter = wordData.word[i];
                        this.grid[row][col] = letter;
                        
                        // Mettre à jour l'affichage
                        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                        if (cellElement) {
                            const letterSpan = cellElement.querySelector('.cell-letter');
                            if (letterSpan) {
                                letterSpan.textContent = letter;
                            }
                            cellElement.classList.add('correct');
                        }
                    }
                }
            }
        });
        
        console.log('✅ Mots restaurés');
    }

    restoreGridLetters() {
        // Restaurer toutes les lettres saisies dans la grille
        if (!this.grid) return;
        
        console.log('🔄 Restauration des lettres saisies...');
        let restoredCount = 0;
        
        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                const cellValue = this.grid[i][j];
                if (cellValue && cellValue !== '') {
                    const cellElement = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (!cellElement) continue;
                    
                    // Gérer les intersections (format "A/B")
                    if (cellValue.includes('/')) {
                        const [letter1, letter2] = cellValue.split('/');
                        const letter1Span = cellElement.querySelector('.cell-letter-horiz');
                        const letter2Span = cellElement.querySelector('.cell-letter-vert');
                        
                        if (letter1Span && letter1) letter1Span.textContent = letter1;
                        if (letter2Span && letter2) letter2Span.textContent = letter2;
                        
                        // Vérifier si les deux sont correctes
                        const expected1 = letter1Span?.dataset.expected;
                        const expected2 = letter2Span?.dataset.expected;
                        if (letter1 === expected1 && letter2 === expected2) {
                            cellElement.classList.add('correct');
                        }
                    } 
                    // Gérer les cases normales
                    else {
                        const letterSpan = cellElement.querySelector('.cell-letter');
                        if (letterSpan) {
                            letterSpan.textContent = cellValue;
                            
                            // Vérifier si correcte
                            if (cellValue === this.solution[i][j]) {
                                cellElement.classList.add('correct');
                            }
                        }
                    }
                    restoredCount++;
                }
            }
        }
        
        console.log(`✅ ${restoredCount} lettres restaurées`);
    }

    initializeEventListeners() {
        document.getElementById('playButton').addEventListener('click', () => this.handlePlayButtonClick());
        
        // Menu déroulant de sélection de mode
        const modeDropdownBtn = document.getElementById('modeDropdownBtn');
        const modeDropdownMenu = document.getElementById('modeDropdownMenu');
        
        if (modeDropdownBtn && modeDropdownMenu) {
            // Toggle du menu
            modeDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                modeDropdownBtn.classList.toggle('open');
                modeDropdownMenu.classList.toggle('open');
            });
            
            // Fermer le menu en cliquant ailleurs
            document.addEventListener('click', () => {
                modeDropdownBtn.classList.remove('open');
                modeDropdownMenu.classList.remove('open');
            });
            
            // Options de mode
            const modeOptions = modeDropdownMenu.querySelectorAll('.mode-option');
            modeOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const mode = option.dataset.mode;
                    this.switchGameMode(mode);
                    modeDropdownBtn.classList.remove('open');
                    modeDropdownMenu.classList.remove('open');
                });
            });
        }
        
        // Options de mode dans le menu
        const modeMenuOptions = document.querySelectorAll('.mode-menu-option');
        modeMenuOptions.forEach(option => {
            option.addEventListener('click', () => {
                const mode = option.dataset.mode;
                this.switchGameMode(mode);
                // Fermer le modal menu
                const menuModal = document.getElementById('menuModal');
                if (menuModal) {
                    menuModal.classList.add('hidden');
                }
            });
        });
        
        // Charger le mode sauvegardé
        const savedMode = localStorage.getItem('gameMode');
        if (savedMode && (savedMode === 'normal' || savedMode === 'couple' || savedMode === 'race' || savedMode === 'sagesse' || savedMode === 'proverbes' || savedMode === 'disciple' || savedMode === 'veiller' || savedMode === 'aimee' || savedMode === 'couple-solide')) {
            this.gameMode = savedMode;
            this.updateModeButtons();
        }
        
        // Boutons multijoueur - Gérés par le nouveau système room-ui.js
        // Les anciens boutons flottants et modals sont remplacés par le système de salles
        
        document.getElementById('checkButton').addEventListener('click', () => this.checkAnswers());
        document.getElementById('hintButton').addEventListener('click', () => this.showHint());
        document.getElementById('shareButton').addEventListener('click', () => this.handleShare());
        document.getElementById('nextLevelButton').addEventListener('click', () => this.nextLevel());
        document.getElementById('resetButton').addEventListener('click', () => this.resetGame());

        // Nouveau système de salles - Les événements sont gérés par room-ui.js
        const closeMultiplayerBtn = document.getElementById('closeMultiplayerBtn');
        if (closeMultiplayerBtn) {
            // Pas besoin d'ajouter l'événement ici, il est géré par room-ui.js
        }

        // Modal kawaii
        document.getElementById('kawaiiModalBtn').addEventListener('click', () => this.closeKawaiiModal());
        document.querySelector('.kawaii-modal-overlay').addEventListener('click', () => this.closeKawaiiModal());

        // Modal de score
        document.getElementById('saveScoreBtn').addEventListener('click', () => this.handleSaveScore());
        document.getElementById('skipScoreBtn').addEventListener('click', () => this.closeScoreModal());

        // Permettre de fermer le modal de score en cliquant sur l'overlay
        const scoreOverlay = document.querySelector('#scoreModal .kawaii-modal-overlay');
        if (scoreOverlay) {
            scoreOverlay.addEventListener('click', () => this.closeScoreModal());
        }

        this.setupAudioControls();

        // Menu modal
        document.getElementById('menuButton').addEventListener('click', () => this.openMenu());
        document.getElementById('closeMenuBtn').addEventListener('click', () => this.closeMenu());

        // Permettre de fermer le menu en cliquant sur l'overlay
        const menuOverlay = document.querySelector('#menuModal .kawaii-modal-overlay');
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => this.closeMenu());
        }

        // Achievements modal
        document.getElementById('achievementsBtn').addEventListener('click', () => this.openAchievements());
        document.getElementById('closeAchievementsBtn').addEventListener('click', () => this.closeAchievements());

        // Permettre de fermer le modal des achievements en cliquant sur l'overlay
        const achievementsOverlay = document.querySelector('#achievementsModal .kawaii-modal-overlay');
        if (achievementsOverlay) {
            achievementsOverlay.addEventListener('click', () => this.closeAchievements());
        }

        // Boutons leaderboard tab
        const refreshLeaderboardBtn = document.getElementById('refreshLeaderboardBtn');
        if (refreshLeaderboardBtn) {
            refreshLeaderboardBtn.addEventListener('click', () => {
                if (typeof menuTabSystem !== 'undefined') {
                    menuTabSystem.loadLeaderboard();
                }
            });
        }

        const viewFullLeaderboardBtn = document.getElementById('viewFullLeaderboardBtn');
        if (viewFullLeaderboardBtn) {
            viewFullLeaderboardBtn.addEventListener('click', () => {
                window.open('public/leaderboard.html', '_blank');
            });
        }

        // Filtres des achievements
        document.querySelectorAll('.achievements-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterAchievements(e.target.dataset.filter));
        });

        // Audio sliders
        document.getElementById('musicVolume').addEventListener('input', (e) => this.handleMusicVolumeChange(e));
        document.getElementById('soundVolume').addEventListener('input', (e) => this.handleSoundVolumeChange(e));

        // Artist link
        document.getElementById('artistLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openArtistModule();
        });
    }

    showKawaiiModal(message, icon = '✨') {
        const modal = document.getElementById('kawaiiModal');
        const messageEl = document.getElementById('kawaiiModalMessage');
        const iconEl = document.querySelector('.kawaii-modal-icon');

        messageEl.textContent = message;
        iconEl.textContent = icon;
        modal.classList.remove('hidden');

        return new Promise((resolve) => {
            this.kawaiiModalResolve = resolve;
        });
    }

    closeKawaiiModal() {
        const modal = document.getElementById('kawaiiModal');
        modal.classList.add('hidden');

        if (this.kawaiiModalResolve) {
            this.kawaiiModalResolve();
            this.kawaiiModalResolve = null;
        }
    }

    async showAchievementUnlocked(achievements) {
        // Afficher chaque achievement débloqué avec une animation
        for (const achievement of achievements) {
            const message = `${achievement.icon} ${achievement.name}\n\n${achievement.description}\n\n+${achievement.points} points`;
            await this.showKawaiiModal(message, '🏆');
        }
    }

    showScoreModal(score) {
        const modal = document.getElementById('scoreModal');
        const scoreDisplay = document.getElementById('finalScoreDisplay');
        scoreDisplay.textContent = score;
        this.scoreToRecord = score;

        // Réinitialiser le formulaire
        document.getElementById('scoreForm').reset();

        modal.classList.remove('hidden');
    }

    closeScoreModal() {
        const modal = document.getElementById('scoreModal');
        modal.classList.add('hidden');
    }

    async handleSaveScore() {
        const name = document.getElementById('playerName').value.trim();
        if (!name) {
            await this.showKawaiiModal('Saisis un pseudo pour enregistrer le score.', '⚠️');
            return;
        }
        this.closeScoreModal();
        const success = leaderboardManager.recordScore(name, this.scoreToRecord);
        await this.showKawaiiModal(success ? 'Score enregistré sur cet appareil.' : 'Impossible d’enregistrer le score.', success ? '✅' : '⚠️');
    }

    savePersonalBest() {
        const name = window.simpleChatSystem?.currentUser || 'Joueur';
        leaderboardManager.recordScore(name, Math.max(this.score, this.maxScore));
    }

    setupMenuLanguageSelector() {
        const dropdown = document.getElementById('languageDropdown');
        const expandBtn = document.getElementById('languageExpandButton');
        const flagSpan = document.getElementById('currentLanguageFlag');
        
        if (!dropdown) return;

        const languageFlags = {
            fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪',
            it: '🇮🇹', pt: '🇵🇹', ru: '🇷🇺', zh: '🇨🇳',
            ko: '🇰🇷', ja: '🇯🇵', ar: '🇸🇦', hi: '🇮🇳',
            pl: '🇵🇱', sw: '🇰🇪'
        };

        const languages = i18n.getAvailableLanguages();
        dropdown.innerHTML = '';
        
        languages.forEach(lang => {
            const item = document.createElement('div');
            item.className = 'language-dropdown-item';
            item.innerHTML = `
                <span class="lang-flag">${languageFlags[lang] || '🌍'}</span>
                <span class="lang-name">${i18n.getLanguageName(lang)}</span>
            `;
            item.dataset.lang = lang;

            if (lang === i18n.getLanguage()) {
                item.classList.add('active');
                if (flagSpan) flagSpan.textContent = languageFlags[lang] || '🌍';
            }

            item.addEventListener('click', () => {
                this.changeLanguage(lang);
                this.updateMenuLanguageButtons();
                if (flagSpan) flagSpan.textContent = languageFlags[lang] || '🌍';
                
                // Fermer le dropdown
                dropdown.style.display = 'none';
                dropdown.classList.remove('show');
            });
            
            dropdown.appendChild(item);
        });
        
        // Gérer le clic sur le bouton
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = dropdown.style.display === 'flex';
                
                if (isVisible) {
                    dropdown.classList.remove('show');
                    setTimeout(() => dropdown.style.display = 'none', 200);
                } else {
                    dropdown.style.display = 'flex';
                    setTimeout(() => dropdown.classList.add('show'), 10);
                }
            });
        }
        
        // Fermer au clic ailleurs
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-control-compact')) {
                dropdown.classList.remove('show');
                setTimeout(() => dropdown.style.display = 'none', 200);
            }
        });
    }

    updateMenuLanguageButtons() {
        const currentLang = i18n.getLanguage();
        const flagSpan = document.getElementById('currentLanguageFlag');
        
        const languageFlags = {
            fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪',
            it: '🇮🇹', pt: '🇵🇹', ru: '🇷🇺', zh: '🇨🇳',
            ko: '🇰🇷', ja: '🇯🇵', ar: '🇸🇦', hi: '🇮🇳',
            pl: '🇵🇱', sw: '🇰🇪'
        };
        
        if (flagSpan) {
            flagSpan.textContent = languageFlags[currentLang] || '🌍';
        }
        
        document.querySelectorAll('.language-dropdown-item').forEach(item => {
            item.classList.toggle('active', item.dataset.lang === currentLang);
        });
        
        // Ancienne compatibilité
        document.querySelectorAll('#menuLanguageSelector .language-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });
    }

    changeLanguage(lang) {
        i18n.setLanguage(lang);
        gameDataManager.setLanguage(lang);
        
        // Mettre à jour les boutons de sélection de langue
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }

    onLanguageChange() {
        this.updateUIText();
        
        // Si le jeu est en cours, recharger le niveau actuel avec la nouvelle langue
        if (!document.getElementById('gameScreen').classList.contains('hidden')) {
            this.setupLevel();
        }
    }

    updateUIText() {
        // Mettre à jour tous les textes de l'interface
        document.querySelector('.header h1').textContent = i18n.t('gameTitle');
        document.querySelector('.header p').textContent = i18n.t('gameSubtitle');
        document.getElementById('playButton').innerHTML = `${i18n.t('play')} (<span id="clickCount">${this.clickCount}</span>/${config.maxEncouragingWords})`;
        document.getElementById('checkButton').textContent = i18n.t('check');
        document.getElementById('hintButton').textContent = i18n.t('hint');
        document.getElementById('nextLevelButton').textContent = i18n.t('nextLevel');
        document.getElementById('resetButton').textContent = i18n.t('reset');

        // Les flèches sont maintenant géométriques, pas besoin de mettre à jour le texte

        // Mettre à jour les labels (maintenant dans le header du chat)
        const levelSpan = document.getElementById('infoBannerLevel');
        const scoreSpan = document.getElementById('infoBannerScore');
        
        if (levelSpan) {
            levelSpan.textContent = this.currentLevel;
        }
        if (scoreSpan) {
            scoreSpan.textContent = this.score;
        }
        
        // Mettre à jour le bandeau info
        if (typeof infoBannerManager !== 'undefined' && infoBannerManager.initialized) {
            infoBannerManager.updateStats(this);
        }

        // Mettre à jour les boutons de l'en-tête
        const installBtn = document.getElementById('installButton');
        if (installBtn) installBtn.textContent = i18n.t('installButton');
        const menuBtn = document.getElementById('menuButton');
        if (menuBtn) menuBtn.textContent = i18n.t('menuButton');

        // Mettre à jour les textes du menu
        this.updateMenuText();

        // Mettre à jour les textes des modaux
        this.updateModalsText();
    }

    updateMenuText() {
        // Titre du menu
        const menuHeader = document.querySelector('.menu-header h2');
        if (menuHeader) menuHeader.textContent = i18n.t('menuSettings');

        const labels = {
            '#languageExpandButton .lang-text': 'menuLanguageTitle',
            '#menuAudioTitle': 'menuAudioTitle',
            'label[for="musicVolume"]': 'menuMusicLabel',
            'label[for="soundVolume"]': 'menuSoundLabel',
            '#menuAboutTitle': 'menuAboutTitle',
            '#settingsTabContent .about-item strong': 'menuArtistLabel',
            '#artistLink': 'menuArtistLink'
        };
        for (const [selector, key] of Object.entries(labels)) {
            const element = document.querySelector(selector);
            if (element) element.textContent = i18n.t(key);
        }
    }

    updateModalsText() {
        // Modal de score
        const scoreModal = document.querySelector('#scoreModal .kawaii-modal-body');
        if (scoreModal) {
            const paragraphs = scoreModal.querySelectorAll('p');
            if (paragraphs[0]) {
                paragraphs[0].innerHTML = `<strong>${i18n.t('modalCongratulations')}</strong>`;
            }
            if (paragraphs[1]) {
                const scoreValue = document.getElementById('finalScoreDisplay').textContent;
                paragraphs[1].innerHTML = `${i18n.t('modalYourScore')} <span id="finalScoreDisplay">${scoreValue}</span> ${i18n.t('points')}`;
            }
            if (paragraphs[2]) {
                paragraphs[2].textContent = i18n.t('modalSaveOnline');
            }
        }

        // Placeholders et boutons du modal de score
        const playerNameInput = document.getElementById('playerName');
        if (playerNameInput) playerNameInput.placeholder = i18n.t('modalNamePlaceholder');


        const saveScoreBtn = document.getElementById('saveScoreBtn');
        if (saveScoreBtn) saveScoreBtn.textContent = i18n.t('modalSaveButton');

        const skipScoreBtn = document.getElementById('skipScoreBtn');
        if (skipScoreBtn) skipScoreBtn.textContent = i18n.t('modalSkipButton');

    }

    handlePlayButtonClick() {
        this.clickCount++;
        document.getElementById('clickCount').textContent = this.clickCount;

        // Vérifier si c'est un niveau bonus
        const nextLevelData = gameDataManager.getLevelData(this.currentLevel);
        const isBonusLevel = nextLevelData && nextLevelData.bonusWords;

        if (this.clickCount <= config.maxEncouragingWords) {
            if (isBonusLevel) {
                this.showBonusWord(this.clickCount - 1, nextLevelData.bonusWords);
            } else {
                this.showEncouragingWord(this.clickCount - 1);
            }
        }

        if (this.clickCount === config.maxEncouragingWords) {
            // Cacher le bouton jouer
            document.getElementById('playButton').style.display = 'none';

            setTimeout(() => {
                this.startGame();
            }, config.levelTransitionDelay);
        }
        // Note: pas de saveGame() ici, sera appelé automatiquement par startGame()
    }

    showEncouragingWord(index) {
        const encouragingWords = i18n.t('encouragingWords');
        if (index < encouragingWords.length) {
            const wordsContainer = document.getElementById('encouragingWords');
            const wordElement = document.createElement('div');
            wordElement.className = 'word-float';
            wordElement.textContent = encouragingWords[index];
            wordElement.style.animationDelay = `${index * 0.15}s`;
            wordsContainer.appendChild(wordElement);
        }
    }

    showBonusWord(index, bonusWords) {
        if (index < bonusWords.length) {
            const wordsContainer = document.getElementById('encouragingWords');
            const wordElement = document.createElement('div');
            wordElement.className = 'bonus-word-float';
            wordElement.textContent = bonusWords[index];
            wordElement.style.animationDelay = `${index * 0.2}s`;
            wordsContainer.appendChild(wordElement);
        }
    }

    /**
     * Obtenir l'icône d'un mode
     */
    getModeIcon(mode) {
        const icons = {
            'normal': '🙏',
            'couple': '💕',
            'sagesse': '🕊️',
            'proverbes': '📖',
            'disciple': '✝️',
            'veiller': '👁️',
            'aimee': '💝',
            'couple-solide': '💪',
            'race': '🏁'
        };
        return icons[mode] || '🎯';
    }

    /**
     * Obtenir le nom d'un mode
     */
    getModeName(mode) {
        const names = {
            'normal': 'Normal',
            'couple': 'Couple',
            'sagesse': 'Sagesse',
            'proverbes': 'Proverbes',
            'disciple': 'Disciple',
            'veiller': 'Veiller',
            'aimee': 'Aimée',
            'couple-solide': 'Couple Solide',
            'race': 'Course'
        };
        return names[mode] || mode;
    }

    /**
     * Met à jour l'affichage du nombre maximum de niveaux
     */
    updateMaxLevelDisplay() {
        const maxLevelEl = document.getElementById('infoBannerMaxLevel');
        if (maxLevelEl) {
            maxLevelEl.textContent = gameDataManager.getTotalLevels();
        }
    }

    /**
     * Met à jour le score avec animation
     * @param {number} points - Points à ajouter (peut être positif ou négatif)
     */
    updateScoreWithAnimation(points) {
        // Mettre à jour le score
        this.score += points;
        
        // Mettre à jour l'affichage de la bannière
        const scoreEl = document.getElementById('infoBannerScore');
        if (scoreEl) scoreEl.textContent = this.score;
        
        // Mettre à jour l'affichage au-dessus de la grille avec animation
        const gameScoreValue = document.getElementById('gameScoreValue');
        if (gameScoreValue) {
            // Retirer l'ancienne animation
            gameScoreValue.classList.remove('score-increase');
            
            // Forcer un reflow pour redémarrer l'animation
            void gameScoreValue.offsetWidth;
            
            // Ajouter l'animation
            if (points !== 0) {
                gameScoreValue.classList.add('score-increase');
                
                // Créer popup de points
                const popup = document.createElement('div');
                popup.className = 'score-popup';
                popup.textContent = points > 0 ? `+${points}` : points;
                
                const scoreDisplay = document.getElementById('gameScoreDisplay');
                if (scoreDisplay) {
                    scoreDisplay.style.position = 'relative';
                    scoreDisplay.appendChild(popup);
                    
                    // Retirer le popup après l'animation
                    setTimeout(() => {
                        if (popup.parentNode === scoreDisplay) {
                            scoreDisplay.removeChild(popup);
                        }
                    }, 1000);
                }
            }
            
            // Mettre à jour la valeur avec animation de compteur
            const startValue = this.score - points;
            const duration = 300; // ms
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing cubic
                const easeProgress = progress < 0.5 
                    ? 4 * progress * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                const currentValue = Math.round(startValue + (points * easeProgress));
                gameScoreValue.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    gameScoreValue.textContent = this.score;
                }
            };
            
            requestAnimationFrame(animate);
        }
        
        // Mettre à jour le système d'achievements
        if (window.achievementSystem) {
            window.achievementSystem.updateScore(this.score);
        }
    }

    /**
     * Change le mode de jeu (normal, couple, sagesse, proverbes, disciple, veiller, aimee, race)
     * @param {string} mode - Le mode de jeu
     */
    switchGameMode(mode) {
        const validModes = ['normal', 'couple', 'race', 'sagesse', 'proverbes', 'disciple', 'veiller', 'aimee', 'couple-solide'];
        if (!validModes.includes(mode)) {
            console.error('Mode invalide:', mode);
            return;
        }
        
        // Le mode course nécessite d'être en salle multijoueur
        if (mode === 'race') {
            if (!window.simpleChatSystem || !window.simpleChatSystem.isInRoom()) {
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.showMessage('⚠️ Le mode Course nécessite d\'être en salle multijoueur. Créez ou rejoignez une salle d\'abord !', 'system');
                }
                return;
            }
            
            // Démarrer le mode course
            if (window.multiplayerRace) {
                window.multiplayerRace.startRace();
                
                // Mettre à jour l'interface
                this.updateModeButtons();
                
                if (window.audioSystem) {
                    window.audioSystem.playClick();
                }
            }
            return;
        }

        // Si on est déjà dans ce mode, ne rien faire
        if (this.gameMode === mode) {
            return;
        }

        const previousMode = this.gameMode;
        
        // 🗳️ Si des joueurs sont connectés, demander l'approbation par vote
        if (window.simpleChatSystem && window.simpleChatSystem.gameConnections.size > 0) {
            // Lancer un vote pour le changement de mode
            this.requestModeChangeVote(previousMode, mode);
            return;
        }
        
        // Pas de joueurs connectés, changement direct
        this.applyModeChange(previousMode, mode);
    }

    // Demander un vote pour changer de mode
    requestModeChangeVote(previousMode, newMode) {
        const username = window.simpleChatSystem?.currentUser || 'Joueur';
        const voteId = `vote_${Date.now()}`;
        
        // Initialiser le système de vote
        if (!this.modeChangeVote) {
            this.modeChangeVote = {
                id: voteId,
                previousMode: previousMode,
                newMode: newMode,
                requester: username,
                votes: new Map(), // peerId -> boolean (true = oui, false = non)
                timeout: null
            };
        }
        
        // Ajouter le vote du demandeur (automatiquement oui)
        const myPeerId = window.simpleChatSystem?.peer?.id;
        if (myPeerId) {
            this.modeChangeVote.votes.set(myPeerId, true);
        }
        
        // Envoyer la demande de vote à tous les joueurs
        window.simpleChatSystem.broadcastGameAction({
            type: 'mode_change_request',
            voteId: voteId,
            previousMode: previousMode,
            newMode: newMode,
            requester: username,
            totalPlayers: window.simpleChatSystem.gameConnections.size + 1 // +1 pour soi-même
        });
        
        // Notifier localement
        const newModeIcon = this.getModeIcon(newMode);
        const newModeName = this.getModeName(newMode);
        window.simpleChatSystem.showMessage(`🗳️ Vote lancé: Changer pour le mode ${newModeIcon} ${newModeName}`, 'system');
        
        // Timeout de 30 secondes pour le vote
        this.modeChangeVote.timeout = setTimeout(() => {
            this.processModeChangeVote();
        }, 30000);
    }

    // Traiter les résultats du vote
    processModeChangeVote() {
        if (!this.modeChangeVote) return;
        
        const { votes, previousMode, newMode, requester } = this.modeChangeVote;
        const totalPlayers = window.simpleChatSystem.gameConnections.size + 1;
        const votesReceived = votes.size;
        
        // Compter les votes OUI explicites
        const yesVotes = Array.from(votes.values()).filter(v => v === true).length;
        
        // Les joueurs qui n'ont pas voté = vote NON automatique
        const noVotesExplicit = Array.from(votes.values()).filter(v => v === false).length;
        const noVotesImplicit = totalPlayers - votesReceived; // Pas de vote = NON
        const noVotes = noVotesExplicit + noVotesImplicit;
        
        // Majorité = plus de 50%
        const majorityNeeded = Math.ceil(totalPlayers / 2);
        const approved = yesVotes >= majorityNeeded;
        
        console.log(`🗳️ Résultats du vote: ${yesVotes} oui, ${noVotes} non (${noVotesExplicit} explicites + ${noVotesImplicit} absents) sur ${totalPlayers} joueurs`);
        
        // Envoyer le résultat à tous
        window.simpleChatSystem.broadcastGameAction({
            type: 'mode_change_result',
            voteId: this.modeChangeVote.id,
            approved: approved,
            yesVotes: yesVotes,
            noVotes: noVotes,
            totalVotes: votesReceived,
            totalPlayers: totalPlayers,
            previousMode: previousMode,
            newMode: newMode
        });
        
        // Afficher le résultat localement
        const newModeIcon = this.getModeIcon(newMode);
        const newModeName = this.getModeName(newMode);
        const abstentionMsg = noVotesImplicit > 0 ? ` (${noVotesImplicit} absent${noVotesImplicit > 1 ? 's' : ''} = NON)` : '';
        
        if (approved) {
            window.simpleChatSystem.showMessage(`✅ Vote accepté (${yesVotes} OUI / ${noVotes} NON sur ${totalPlayers}${abstentionMsg}) ! Changement vers ${newModeIcon} ${newModeName}`, 'system');
            // Appliquer le changement
            setTimeout(() => {
                this.applyModeChange(previousMode, newMode);
            }, 1000);
        } else {
            window.simpleChatSystem.showMessage(`❌ Vote rejeté (${yesVotes} OUI / ${noVotes} NON sur ${totalPlayers}${abstentionMsg}). Mode ${this.getModeIcon(previousMode)} ${this.getModeName(previousMode)} conservé`, 'system');
        }
        
        // Nettoyer
        this.modeChangeVote = null;
    }

    // Appliquer le changement de mode (après approbation ou si seul)
    applyModeChange(previousMode, mode) {
        // Sauvegarder la partie en cours du mode actuel avant de changer
        if (this.gameStarted) {
            this.saveGame();
        }

        // Changer le mode
        this.gameMode = mode;
        localStorage.setItem('gameMode', mode);
        
        // Changer la musique d'ambiance selon le nouveau mode
        if (window.audioSystem && this.gameStarted) {
            window.audioSystem.setGameMode(mode);
        }

        // Mettre à jour l'affichage des boutons
        this.updateModeButtons();

        // Si le jeu a déjà commencé, essayer de charger la sauvegarde du nouveau mode
        if (this.gameStarted) {
            const saveKey = `christianCrosswordSave_${mode}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    if (data.gameStarted) {
                        // Charger la partie sauvegardée du nouveau mode
                        console.log(`🔄 Changement de mode: ${previousMode} → ${mode} (reprise partie)`);
                        this.loadGameFromData(data);
                        
                        // Notifier localement (pas de broadcast, déjà fait via mode_change_result)
                        if (window.simpleChatSystem) {
                            const modeEmoji = mode === 'couple' ? '👫' : mode === 'race' ? '🏁' : '🎯';
                            window.simpleChatSystem.showMessage(
                                `${modeEmoji} Mode ${mode.toUpperCase()} - Partie reprise au niveau ${data.currentLevel} !`,
                                'system'
                            );
                        }
                        return;
                    }
                } catch (e) {
                    console.error('❌ Erreur chargement sauvegarde du mode', mode, ':', e);
                }
            }
            
            // Pas de sauvegarde pour ce mode, réinitialiser
            console.log(`🔄 Changement de mode: ${previousMode} → ${mode} (nouvelle partie)`);
            this.currentLevel = 1;
            this.score = 0; // Score du mode repart à 0
            this.totalClicks = 0;
            this.totalHintsUsed = 0;
            this.completedWords = new Set();
            
            // Recharger le niveau
            this.setupLevel();
            this.saveGame();
            
            // Notifier localement le changement de mode (pas de broadcast, déjà fait via mode_change_result)
            if (window.simpleChatSystem) {
                const modeIcons = {
                    'normal': '🙏',
                    'couple': '💕',
                    'sagesse': '🕊️',
                    'proverbes': '📖',
                    'disciple': '✝️',
                    'veiller': '👁️',
                    'aimee': '❤️',
                    'couple-solide': '💑',
                    'race': '🏁'
                };
                const modeNames = {
                    'normal': 'Normal',
                    'couple': 'Couple',
                    'sagesse': 'Sagesse',
                    'proverbes': 'Proverbes',
                    'disciple': 'Disciple',
                    'veiller': 'Veiller',
                    'aimee': 'Aimée',
                    'couple-solide': 'Couple Solide',
                    'race': 'Course'
                };
                const modeIcon = modeIcons[mode] || '🎯';
                const modeName = modeNames[mode] || mode;
                window.simpleChatSystem.showMessage(`${modeIcon} Changement de mode : ${modeName} (${gameDataManager.getTotalLevels()} niveaux)`, 'system');
            }
            
            // Message de confirmation
            if (window.audioSystem) {
                window.audioSystem.playClick();
            }
        }

        // Mettre à jour l'affichage du niveau max
        this.updateMaxLevelDisplay();

        console.log(`✨ Mode changé: ${mode} (${gameDataManager.getTotalLevels()} niveaux)`);
    }

    /**
     * Met à jour l'état visuel du menu déroulant de mode
     */
    updateModeButtons() {
        const dropdownBtn = document.getElementById('modeDropdownBtn');
        const modeOptions = document.querySelectorAll('.mode-option');
        const modeMenuOptions = document.querySelectorAll('.mode-menu-option');
        
        // Mettre à jour le bouton principal
        if (dropdownBtn) {
            const icon = dropdownBtn.querySelector('.mode-current-icon');
            const name = dropdownBtn.querySelector('.mode-current-name');
            const count = dropdownBtn.querySelector('.mode-current-count');
            
            if (this.gameMode === 'normal') {
                if (icon) icon.textContent = '🙏';
                if (name) name.textContent = 'Mode Normal';
                if (count) count.textContent = '(77)';
            } else if (this.gameMode === 'couple') {
                if (icon) icon.textContent = '💕';
                if (name) name.textContent = 'Mode Couple';
                if (count) count.textContent = '(122)';
            } else if (this.gameMode === 'sagesse') {
                if (icon) icon.textContent = '🕊️';
                if (name) name.textContent = 'Mode Sagesse';
                if (count) count.textContent = '(88)';
            } else if (this.gameMode === 'proverbes') {
                if (icon) icon.textContent = '📖';
                if (name) name.textContent = 'Mode Proverbes';
                if (count) count.textContent = '(88)';
            } else if (this.gameMode === 'disciple') {
                if (icon) icon.textContent = '✝️';
                if (name) name.textContent = 'Mode Disciple';
                if (count) count.textContent = '(88)';
            } else if (this.gameMode === 'veiller') {
                if (icon) icon.textContent = '👁️';
                if (name) name.textContent = 'Mode Veiller';
                if (count) count.textContent = '(88)';
            } else if (this.gameMode === 'aimee') {
                if (icon) icon.textContent = '❤️';
                if (name) name.textContent = 'Mode Aimée';
                if (count) count.textContent = '(88)';
            } else if (this.gameMode === 'couple-solide') {
                if (icon) icon.textContent = '💑';
                if (name) name.textContent = 'Mode Couple Solide';
                if (count) count.textContent = '(88)';
            } else if (this.gameMode === 'race') {
                if (icon) icon.textContent = '🏁';
                if (name) name.textContent = 'Mode Course';
                if (count) count.textContent = '(5 min)';
            }
        }
        
        // Mettre à jour les options actives du dropdown
        modeOptions.forEach(option => {
            if (option.dataset.mode === this.gameMode) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Mettre à jour les options actives du menu
        modeMenuOptions.forEach(option => {
            if (option.dataset.mode === this.gameMode) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    async startGame() {
        this.gameStarted = true;
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        
        // Initialiser l'affichage du score au-dessus de la grille
        const gameScoreValue = document.getElementById('gameScoreValue');
        if (gameScoreValue) {
            gameScoreValue.textContent = this.score;
        }
        
        // Démarrer la musique d'ambiance selon le mode
        if (window.audioSystem) {
            window.audioSystem.setGameMode(this.gameMode);
            if (!window.audioSystem.currentAudio) window.audioSystem.playNextTrack();
        }
        
        // Message de bienvenue d'un bot assistant
        if (window.assistantBotManager) {
            const username = window.simpleChatSystem?.currentUser || 'Joueur';
            window.assistantBotManager.sendMessage('welcome', { username });
        }
        
        // Émettre événement pour notifier que le jeu a démarré (après l'intro)
        document.dispatchEvent(new CustomEvent('gameStarted'));
        
        // Créer automatiquement une room P2P quand on démarre une partie
        if (typeof simpleChatSystem !== 'undefined' && !simpleChatSystem.isInRoom()) {
            try {
                const roomCode = simpleChatSystem.createRoom();
                if (roomCode) {
                    console.log('🎮 Room créée automatiquement:', roomCode);
                }
            } catch (error) {
                console.error('Erreur création room auto:', error);
            }
        }
        
        // 🌐 Partager le démarrage du jeu avec les autres joueurs
        if (window.simpleChatSystem && window.simpleChatSystem.gameConnections.size > 0) {
            window.simpleChatSystem.broadcastGameAction({
                type: 'game_started',
                gameMode: this.gameMode,
                level: this.currentLevel
            });
        }
        
        this.setupLevel();
        window.privateRoom?.sendGrid();
        this.saveGame();
        
        // Démarrer le tutorial APRÈS l'intro, quand la grille est visible
        // Vérifier si c'est la première fois
        const tutorialCompleted = localStorage.getItem('tutorialCompleted');
        if (!tutorialCompleted) {
            setTimeout(() => {
                if (window.tutorialSystem) {
                    tutorialSystem.start();
                }
            }, 1000);
        }
    }

    restorePrivateGrid({ mode, level, grid, score }) {
        const modes = ['normal', 'couple', 'race', 'sagesse', 'proverbes', 'disciple', 'veiller', 'aimee', 'couple-solide'];
        if (!modes.includes(mode) || !Number.isInteger(level) || level < 1 || !Number.isFinite(score) ||
            !Array.isArray(grid) || grid.length !== config.gridSize ||
            !grid.every(row => Array.isArray(row) && row.length === config.gridSize &&
                row.every(cell => typeof cell === 'string' && cell.length <= 12))) return;

        const previousMode = this.gameMode;
        this.gameMode = mode;
        if (level > gameDataManager.getTotalLevels()) {
            this.gameMode = previousMode;
            return;
        }
        this.updateModeButtons();
        this.updateMaxLevelDisplay();
        this.currentLevel = level;
        this.score = score;
        this.gameStarted = true;
        this.setupLevel();
        this.grid = grid;
        this.restoreGridLetters();
        this.restoreCompletedWords();

        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        for (const id of ['infoBannerScore', 'gameScoreValue']) {
            const scoreElement = document.getElementById(id);
            if (scoreElement) scoreElement.textContent = this.score;
        }
    }

    setupLevel() {
        this.clearGrid();

        // Réinitialiser le compteur d'indices pour le nouveau niveau
        this.hintsUsedThisLevel = 0;

        // Réinitialiser le tracking des mots complétés
        this.completedWords = new Set();
        
        // Réinitialiser le tracking des mots avec indice
        this.wordsWithHints = new Set();
        
        // Réinitialiser le mot en cours et la direction
        this.currentWordIndex = null;
        this.lastMoveDirection = null;

        // Vérifier que gameDataManager est disponible
        if (typeof gameDataManager === 'undefined') {
            console.error('❌ gameDataManager non disponible');
            return;
        }

        const levelData = gameDataManager.getLevelData(this.currentLevel);

        if (levelData) {
            // Enrichir les mots avec la direction détectée si elle n'existe pas
            this.words = levelData.words.map((wordData, index) => {
                if (!wordData.direction && wordData.path) {
                    const detectedDirection = this.detectWordDirection(wordData.path);
                    console.log(`🔍 Mot #${index} "${wordData.word}": direction détectée = ${detectedDirection}`);
                    return {
                        ...wordData,
                        direction: detectedDirection
                    };
                }
                return wordData;
            });
            
            this.placeWords(this.words);
            this.createGrid(this.words);
            this.displayClues(this.words);
            const currentLevelEl = document.getElementById('infoBannerLevel');
            if (currentLevelEl) currentLevelEl.textContent = this.currentLevel;
            
            // 🎯 NOUVEAU: Positionner automatiquement sur le premier mot au démarrage
            setTimeout(() => {
                this.focusFirstIncompleteWord();
            }, 300);
        }
    }

    clearGrid() {
        this.grid = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.solution = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.blocked = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(false));
    }

    placeWords(words) {
        // Initialiser un tableau pour détecter les intersections
        this.intersections = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(null));
        
        // 🎯 NOUVEAU: Créer une map des propriétaires de chaque case
        this.cellOwnerMap = Array(config.gridSize).fill().map(() => 
            Array(config.gridSize).fill().map(() => [])
        );
        
        // Première passe : créer un map des positions utilisées par chaque mot
        const cellUsageMap = Array(config.gridSize).fill().map(() => 
            Array(config.gridSize).fill().map(() => [])
        );
        
        // Suivre l'ordre de placement des mots
        const wordOrderMap = Array(config.gridSize).fill().map(() => 
            Array(config.gridSize).fill().map(() => [])
        );
        
        // Suivre le nombre d'intersections par mot
        const wordIntersectionCount = new Map();
        
        words.forEach((wordData, wordIndex) => {
            wordIntersectionCount.set(wordIndex, 0);
            const { word, path, start, direction } = wordData;
            
            if (path && Array.isArray(path)) {
                path.forEach(([row, col], letterIndex) => {
                    cellUsageMap[row][col].push({
                        wordIndex,
                        letterIndex,
                        letter: word[letterIndex],
                        direction: direction || 'bent'
                    });
                    wordOrderMap[row][col].push({
                        wordIndex,
                        letter: word[letterIndex]
                    });
                    // 🎯 Ajouter aussi au cellOwnerMap permanent
                    this.cellOwnerMap[row][col].push({
                        wordIndex,
                        word: word,
                        letterIndex,
                        letter: word[letterIndex],
                        direction: direction || 'bent'
                    });
                });
            } else if (start && direction) {
                const [row, col] = start;
                for (let i = 0; i < word.length; i++) {
                    const targetRow = direction === 'horizontal' ? row : row + i;
                    const targetCol = direction === 'horizontal' ? col + i : col;
                    cellUsageMap[targetRow][targetCol].push({
                        wordIndex,
                        letterIndex: i,
                        letter: word[i],
                        direction
                    });
                    wordOrderMap[targetRow][targetCol].push({
                        wordIndex,
                        letter: word[i]
                    });
                    // 🎯 Ajouter aussi au cellOwnerMap permanent
                    this.cellOwnerMap[targetRow][targetCol].push({
                        wordIndex,
                        word: word,
                        letterIndex: i,
                        letter: word[i],
                        direction
                    });
                }
            }
        });
        
        // Deuxième passe : placer les lettres et détecter les vraies intersections
        words.forEach((wordData, wordIndex) => {
            const { word, path, start, direction } = wordData;

            console.log(`📝 Placement mot #${wordIndex} "${word}": path=${path?.length || 0} lettres, start=${start}, direction=${direction}`);

            // Support des mots coudés avec path (nouveau système)
            if (path && Array.isArray(path)) {
                for (let i = 0; i < word.length && i < path.length; i++) {
                    const [row, col] = path[i];
                    const currentLetter = word[i];
                    const cellUsage = cellUsageMap[row][col];
                    
                    // Vérifier s'il y a une vraie intersection (plusieurs mots à cette position)
                    if (cellUsage.length > 1) {
                        // Trouver l'autre mot à cette intersection
                        const otherUsage = cellUsage.find(u => u.wordIndex !== wordIndex);
                        
                        if (otherUsage) {
                            // Déterminer les directions AVANT tout traitement
                            const thisDirection = direction || 'bent';
                            const otherDirection = otherUsage.direction;
                            
                            // Vérifier si l'un des deux mots a déjà une intersection
                            const thisWordHasIntersection = wordIntersectionCount.get(wordIndex) > 0;
                            const otherWordHasIntersection = wordIntersectionCount.get(otherUsage.wordIndex) > 0;
                            
                            if (thisWordHasIntersection || otherWordHasIntersection) {
                                console.warn(`⚠️ Intersection ignorée à [${row},${col}]: au moins un mot a déjà une intersection`);
                                
                                // 🎯 QUAND MÊME créer une intersection "technique" pour marquer que deux mots se croisent
                                const wordsAtThisCell = wordOrderMap[row][col];
                                if (wordsAtThisCell && wordsAtThisCell.length >= 2) {
                                    const letter1 = wordsAtThisCell[0].letter;
                                    const letter2 = wordsAtThisCell[1].letter;
                                    
                                    // Créer une intersection technique (sans intersection visuelle)
                                    this.intersections[row][col] = {
                                        horizontal: currentLetter,
                                        vertical: otherUsage.letter,
                                        letter1: letter1,
                                        letter2: letter2,
                                        word1Index: wordsAtThisCell[0].wordIndex,
                                        word2Index: wordsAtThisCell[1].wordIndex,
                                        word1Direction: thisDirection,
                                        word2Direction: otherDirection,
                                        ignored: true // Marquer comme intersection ignorée
                                    };
                                    console.log(`🔧 Intersection technique créée à [${row},${col}]: mot #${wordsAtThisCell[0].wordIndex} + mot #${wordsAtThisCell[1].wordIndex}`);
                                }
                                
                                // Placer les lettres normalement (chaque mot place sa lettre)
                                if (!this.solution[row][col]) {
                                    this.solution[row][col] = currentLetter;
                                }
                                // Continuer pour placer les autres lettres du mot
                                continue;
                            }
                            
                            // Créer une intersection seulement si les directions sont différentes
                            // et qu'aucun des deux n'est un mot coudé
                            if (thisDirection !== 'bent' && otherDirection !== 'bent' && 
                                thisDirection !== otherDirection) {
                                
                                // Utiliser l'ordre des mots pour déterminer l'ordre des lettres
                                const wordsAtThisCell = wordOrderMap[row][col];
                                const letter1 = wordsAtThisCell[0].letter; // Premier mot posé
                                const letter2 = wordsAtThisCell[1].letter; // Deuxième mot posé
                                
                                // Incrémenter les compteurs d'intersection
                                wordIntersectionCount.set(wordIndex, wordIntersectionCount.get(wordIndex) + 1);
                                wordIntersectionCount.set(otherUsage.wordIndex, wordIntersectionCount.get(otherUsage.wordIndex) + 1);
                                
                                // Stocker l'intersection dans l'ordre de placement
                                this.intersections[row][col] = {
                                    horizontal: thisDirection === 'horizontal' ? currentLetter : otherUsage.letter,
                                    vertical: thisDirection === 'vertical' ? currentLetter : otherUsage.letter,
                                    letter1: letter1, // Premier mot
                                    letter2: letter2, // Deuxième mot
                                    word1Index: wordsAtThisCell[0].wordIndex, // Index du premier mot
                                    word2Index: wordsAtThisCell[1].wordIndex, // Index du deuxième mot
                                    word1Direction: thisDirection === 'horizontal' ? thisDirection : otherDirection,
                                    word2Direction: thisDirection === 'vertical' ? thisDirection : otherDirection
                                };
                                this.solution[row][col] = `${letter1}/${letter2}`;
                                console.log(`📍 Intersection à [${row},${col}]: 1er="${letter1}" (mot #${wordsAtThisCell[0].wordIndex}) / 2e="${letter2}" (mot #${wordsAtThisCell[1].wordIndex})`);
                            } else {
                                // Collision détectée (même direction ou mot coudé)
                                // Créer un carrefour partagé automatiquement
                                const wordsAtThisCell = wordOrderMap[row][col];
                                if (wordsAtThisCell && wordsAtThisCell.length >= 2) {
                                    const letter1 = wordsAtThisCell[0].letter; // Premier mot posé
                                    const letter2 = wordsAtThisCell[1].letter; // Deuxième mot posé
                                    
                                    // Incrémenter les compteurs d'intersection
                                    wordIntersectionCount.set(wordIndex, wordIntersectionCount.get(wordIndex) + 1);
                                    wordIntersectionCount.set(otherUsage.wordIndex, wordIntersectionCount.get(otherUsage.wordIndex) + 1);
                                    
                                    this.intersections[row][col] = {
                                        horizontal: currentLetter,
                                        vertical: otherUsage.letter,
                                        letter1: letter1, // Premier mot
                                        letter2: letter2, // Deuxième mot
                                        word1Index: wordsAtThisCell[0].wordIndex, // Index du premier mot
                                        word2Index: wordsAtThisCell[1].wordIndex, // Index du deuxième mot
                                        word1Direction: thisDirection,
                                        word2Direction: otherDirection
                                    };
                                    this.solution[row][col] = `${letter1}/${letter2}`;
                                    console.log(`🚦 Carrefour partagé à [${row},${col}]: 1er="${letter1}" (mot #${wordsAtThisCell[0].wordIndex}) / 2e="${letter2}" (mot #${wordsAtThisCell[1].wordIndex}) (${thisDirection}/${otherDirection})`);
                                } else if (!this.solution[row][col]) {
                                    this.solution[row][col] = currentLetter;
                                }
                            }
                        }
                    } else {
                        // Case utilisée par un seul mot
                        if (!this.solution[row][col]) {
                            this.solution[row][col] = currentLetter;
                        } else {
                            console.warn(`⚠️ Case [${row},${col}] déjà occupée par "${this.solution[row][col]}", tentative de placer "${currentLetter}" du mot #${wordIndex}`);
                        }
                    }
                }
            }
            // Support des mots droits (ancien système pour compatibilité)
            else if (start && direction) {
                const [row, col] = start;
                for (let i = 0; i < word.length; i++) {
                    const currentLetter = word[i];
                    const targetRow = direction === 'horizontal' ? row : row + i;
                    const targetCol = direction === 'horizontal' ? col + i : col;
                    const cellUsage = cellUsageMap[targetRow][targetCol];
                    
                    // Vérifier s'il y a une vraie intersection
                    if (cellUsage.length > 1) {
                        const otherUsage = cellUsage.find(u => u.wordIndex !== wordIndex);
                        
                        if (otherUsage && direction !== otherUsage.direction) {
                            // Vérifier si l'un des deux mots a déjà une intersection
                            const thisWordHasIntersection = wordIntersectionCount.get(wordIndex) > 0;
                            const otherWordHasIntersection = wordIntersectionCount.get(otherUsage.wordIndex) > 0;
                            
                            if (thisWordHasIntersection || otherWordHasIntersection) {
                                console.warn(`⚠️ Intersection ignorée à [${targetRow},${targetCol}]: au moins un mot a déjà une intersection`);
                                if (!this.solution[targetRow][targetCol]) {
                                    this.solution[targetRow][targetCol] = currentLetter;
                                }
                                continue;
                            }
                            
                            // Utiliser l'ordre des mots pour déterminer l'ordre des lettres
                            const wordsAtThisCell = wordOrderMap[targetRow][targetCol];
                            const letter1 = wordsAtThisCell[0].letter; // Premier mot posé
                            const letter2 = wordsAtThisCell[1].letter; // Deuxième mot posé
                            
                            // Incrémenter les compteurs d'intersection
                            wordIntersectionCount.set(wordIndex, wordIntersectionCount.get(wordIndex) + 1);
                            wordIntersectionCount.set(otherUsage.wordIndex, wordIntersectionCount.get(otherUsage.wordIndex) + 1);
                            
                            this.intersections[targetRow][targetCol] = {
                                horizontal: direction === 'horizontal' ? currentLetter : otherUsage.letter,
                                vertical: direction === 'vertical' ? currentLetter : otherUsage.letter,
                                letter1: letter1, // Premier mot
                                letter2: letter2  // Deuxième mot
                            };
                            this.solution[targetRow][targetCol] = `${letter1}/${letter2}`;
                            console.log(`📍 Intersection à [${targetRow},${targetCol}]: 1er="${letter1}" 2e="${letter2}"`);
                        } else if (otherUsage && direction === otherUsage.direction) {
                            // Vérifier si l'un des deux mots a déjà une intersection
                            const thisWordHasIntersection = wordIntersectionCount.get(wordIndex) > 0;
                            const otherWordHasIntersection = wordIntersectionCount.get(otherUsage.wordIndex) > 0;
                            
                            if (thisWordHasIntersection || otherWordHasIntersection) {
                                console.warn(`⚠️ Carrefour ignoré à [${targetRow},${targetCol}]: au moins un mot a déjà une intersection`);
                                if (!this.solution[targetRow][targetCol]) {
                                    this.solution[targetRow][targetCol] = currentLetter;
                                }
                                continue;
                            }
                            
                            // Collision détectée (même direction)
                            // Créer un carrefour partagé automatiquement
                            const wordsAtThisCell = wordOrderMap[targetRow][targetCol];
                            if (wordsAtThisCell && wordsAtThisCell.length >= 2) {
                                const letter1 = wordsAtThisCell[0].letter; // Premier mot posé
                                const letter2 = wordsAtThisCell[1].letter; // Deuxième mot posé
                                
                                // Incrémenter les compteurs d'intersection
                                wordIntersectionCount.set(wordIndex, wordIntersectionCount.get(wordIndex) + 1);
                                wordIntersectionCount.set(otherUsage.wordIndex, wordIntersectionCount.get(otherUsage.wordIndex) + 1);
                                
                                this.intersections[targetRow][targetCol] = {
                                    horizontal: currentLetter,
                                    vertical: otherUsage.letter,
                                    letter1: letter1, // Premier mot
                                    letter2: letter2  // Deuxième mot
                                };
                                this.solution[targetRow][targetCol] = `${letter1}/${letter2}`;
                                console.log(`🚦 Carrefour partagé à [${targetRow},${targetCol}]: 1er="${letter1}" 2e="${letter2}" (même direction: ${direction})`);
                            } else if (!this.solution[targetRow][targetCol]) {
                                this.solution[targetRow][targetCol] = currentLetter;
                            }
                        }
                    } else {
                        if (!this.solution[targetRow][targetCol]) {
                            this.solution[targetRow][targetCol] = currentLetter;
                        }
                    }
                }
            }
        });

        // Bloquer les cellules inutilisées
        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                if (this.solution[i][j] === '') {
                    this.blocked[i][j] = true;
                }
            }
        }
    }

    createGrid(words = this.words) {
        const gridContainer = document.getElementById('crosswordGrid');
        gridContainer.innerHTML = '';

        if (!words || words.length === 0) {
            console.warn('⚠️ Aucun mot à afficher dans la grille');
            return;
        }

        // Ajouter des traits décoratifs animés roses
        const lineTop = document.createElement('div');
        lineTop.className = 'decorative-line line-top';
        gridContainer.appendChild(lineTop);

        const lineBottom = document.createElement('div');
        lineBottom.className = 'decorative-line line-bottom';
        gridContainer.appendChild(lineBottom);

        const lineLeft = document.createElement('div');
        lineLeft.className = 'decorative-line line-left';
        gridContainer.appendChild(lineLeft);

        const lineRight = document.createElement('div');
        lineRight.className = 'decorative-line line-right';
        gridContainer.appendChild(lineRight);

        // Ajouter des blasons et icônes décoratifs sur tous les bords
        const decorativeIcons = ['✝️', '🕊️', '🙏', '⛪', '📖', '💒', '🌈', '🕯️', '👼', '⭐', '💫', '🔔', '🎺'];

        // Coins avec positions aléatoires
        gridContainer.dataset.decorTopLeft = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];
        gridContainer.dataset.decorBottomRight = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];

        // Créer 4-6 décorations aléatoires sur les bords
        const numDecorations = 4 + Math.floor(Math.random() * 3); // 4 à 6 emojis
        for (let i = 0; i < numDecorations; i++) {
            const decor = document.createElement('div');
            decor.className = 'grid-decoration random';
            decor.textContent = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];
            decor.style.animationDelay = `${Math.random() * 2}s`;

            // Choisir un bord aléatoire
            const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
            const position = 15 + Math.random() * 70; // Position entre 15% et 85% du bord

            switch(side) {
                case 0: // top
                    decor.style.top = '-35px';
                    decor.style.left = `${position}%`;
                    break;
                case 1: // right
                    decor.style.right = '-35px';
                    decor.style.top = `${position}%`;
                    break;
                case 2: // bottom
                    decor.style.bottom = '-35px';
                    decor.style.left = `${position}%`;
                    break;
                case 3: // left
                    decor.style.left = '-35px';
                    decor.style.top = `${position}%`;
                    break;
            }

            gridContainer.appendChild(decor);
        }

        // Créer un map des positions de départ pour ajouter les icônes
        const startPositions = new Map();
        words.forEach((wordData, index) => {
            // Support des mots coudés (path) et mots droits (start)
            const [row, col] = wordData.path ? wordData.path[0] : wordData.start;
            const key = `${row}-${col}`;
            if (!startPositions.has(key)) {
                startPositions.set(key, []);
            }
            startPositions.get(key).push({ index, direction: wordData.direction || 'bent' });
        });

        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                if (this.blocked[i][j]) {
                    cell.classList.add('blocked');
                } else {
                    // Ajouter l'icône si c'est une case de départ
                    const key = `${i}-${j}`;
                    if (startPositions.has(key)) {
                        const wordIcons = this.getWordIcons();
                        const startInfo = startPositions.get(key);
                        const iconSpan = document.createElement('span');
                        iconSpan.className = 'cell-icon';
                        iconSpan.textContent = startInfo.map(info => wordIcons[info.index]).join('');
                        cell.appendChild(iconSpan);
                    }

                    // Vérifier si c'est une intersection avec lettres différentes
                    const isIntersection = this.intersections[i][j] !== null;
                    
                    // Déclarer input et letterSpan avant le bloc if/else pour la portée
                    let input;
                    let letterSpan = null;
                    
                    if (isIntersection) {
                        // Case d'intersection spéciale
                        cell.classList.add('intersection-cell');
                        
                        // Créer deux spans pour les deux lettres
                        const letterContainer = document.createElement('div');
                        letterContainer.className = 'intersection-letters';
                        
                        const letter1Span = document.createElement('span');
                        letter1Span.className = 'cell-letter-horiz';
                        letter1Span.dataset.expected = this.intersections[i][j].horizontal || this.intersections[i][j].letter1;
                        letter1Span.dataset.direction = 'horizontal';
                        letterContainer.appendChild(letter1Span);
                        
                        const letter2Span = document.createElement('span');
                        letter2Span.className = 'cell-letter-vert';
                        letter2Span.dataset.expected = this.intersections[i][j].vertical || this.intersections[i][j].letter2;
                        letter2Span.dataset.direction = 'vertical';
                        letterContainer.appendChild(letter2Span);
                        
                        cell.appendChild(letterContainer);
                        
                        // Input acceptant 2 caractères pour intersection
                        input = document.createElement('input');
                        input.type = 'text';
                        input.maxLength = 2;
                        input.className = 'cell-input intersection-input';
                        input.autocomplete = 'off';
                        input.autocorrect = 'off';
                        input.autocapitalize = 'characters';
                        input.placeholder = '2';
                        cell.appendChild(input);
                    } else {
                        // Case normale
                        letterSpan = document.createElement('span');
                        letterSpan.className = 'cell-letter';
                        
                        // En mode Couple, ajouter une classe selon la direction du mot
                        if (this.gameMode === 'couple') {
                            // Trouver la direction du mot contenant cette case
                            const wordData = words.find(w => 
                                w.path && w.path.some(([r, c]) => r === i && c === j)
                            );
                            if (wordData && wordData.path) {
                                // Détecter la direction en analysant le path
                                const direction = this.detectWordDirection(wordData.path);
                                if (direction === 'vertical') {
                                    letterSpan.classList.add('vertical-letter');
                                } else if (direction === 'horizontal') {
                                    letterSpan.classList.add('horizontal-letter');
                                }
                            }
                        }
                        
                        cell.appendChild(letterSpan);

                        // Créer un input transparent pour la saisie
                        input = document.createElement('input');
                        input.type = 'text';
                        input.maxLength = 1;
                        input.className = 'cell-input';
                        input.autocomplete = 'off';
                        input.autocorrect = 'off';
                        input.autocapitalize = 'characters';
                        cell.appendChild(input);
                    }

                    // Gérer le focus
                    input.addEventListener('focus', () => {
                        document.querySelectorAll('.cell.focused').forEach(c => c.classList.remove('focused'));
                        cell.classList.add('focused');
                        
                        // 🎯 Utiliser cellOwnerMap pour trouver les mots de cette case
                        const owners = this.cellOwnerMap && this.cellOwnerMap[i] && this.cellOwnerMap[i][j];
                        
                        if (owners && owners.length > 0) {
                            // Convertir en format compatible avec le code existant
                            const wordsAtCell = owners.map(owner => ({
                                wordData: this.words[owner.wordIndex],
                                index: owner.wordIndex,
                                cellIndex: owner.letterIndex
                            }));
                            
                            let selectedWord = null;
                            
                            console.log(`🖱️ Clic sur [${i},${j}]: ${wordsAtCell.length} mot(s) propriétaire(s):`, wordsAtCell.map(w => `#${w.index} "${w.wordData.word}"`));
                            
                            // 🚨 VÉRIFICATION: Si plusieurs mots, ça devrait être une intersection
                                if (wordsAtCell.length > 1) {
                                    const isIntersection = this.intersections && this.intersections[i] && this.intersections[i][j];
                                    if (!isIntersection) {
                                        console.error(`❌ ERREUR: Case [${i},${j}] utilisée par ${wordsAtCell.length} mots mais PAS d'intersection!`, 
                                            wordsAtCell.map(w => `#${w.index} "${w.wordData.word}" pos=${w.cellIndex}/${w.wordData.path?.length}`));
                                    }
                                }
                                
                                // 🎯 NOUVEAU: Si le mot actuel ne contient PAS cette case, on DOIT changer de mot
                                const currentWordContainsThisCell = this.currentWordIndex !== null && 
                                    wordsAtCell.some(w => w.index === this.currentWordIndex);
                                
                                if (!currentWordContainsThisCell && wordsAtCell.length === 1) {
                                    // Cette case appartient à UN SEUL mot : c'est forcément celui-là
                                    selectedWord = wordsAtCell[0];
                                    console.log(`🎯 Auto-switch: case n'appartient qu'au mot #${selectedWord.index} "${selectedWord.wordData.word}"`);
                                } else if (currentWordContainsThisCell) {
                                    // Garder le mot actuel si possible
                                    selectedWord = wordsAtCell.find(w => w.index === this.currentWordIndex);
                                    console.log(`✅ Garder mot actuel #${this.currentWordIndex}`);
                                } else {
                                    // Intersection ou choix multiple : choisir le mot le moins avancé (plus de cases vides)
                                    let bestWord = wordsAtCell[0];
                                    let maxEmptyCells = 0;
                                    
                                    for (const w of wordsAtCell) {
                                        let emptyCells = 0;
                                        if (w.wordData.path) {
                                            for (const [row, col] of w.wordData.path) {
                                                const cellValue = this.grid[row][col];
                                                if (!cellValue || cellValue === '' || 
                                                    (cellValue.includes('/') && (cellValue === '/' || cellValue.endsWith('/') || cellValue.startsWith('/')))) {
                                                    emptyCells++;
                                                }
                                            }
                                        }
                                        
                                        if (emptyCells > maxEmptyCells) {
                                            maxEmptyCells = emptyCells;
                                            bestWord = w;
                                        }
                                    }
                                    
                                    selectedWord = bestWord;
                                    console.log(`🎯 Choix intelligent: mot #${selectedWord.index} "${selectedWord.wordData.word}" (${maxEmptyCells} cases vides)`);
                                }
                                
                                // Mettre à jour l'index ET la direction
                                this.currentWordIndex = selectedWord.index;
                                this.lastMoveDirection = selectedWord.wordData.direction;
                                console.log(`🎯 Focus: Mot #${this.currentWordIndex} "${selectedWord.wordData.word}" direction=${this.lastMoveDirection} à [${i},${j}]`);
                        } else {
                            // Aucun propriétaire trouvé (case bloquée ou vide)
                            console.warn(`⚠️ Aucun mot propriétaire à la case [${i},${j}]`);
                            this.currentWordIndex = null;
                            this.lastMoveDirection = null;
                        }
                    });

                    input.addEventListener('blur', () => {
                        cell.classList.remove('focused');
                    });

                    // Gérer l'input
                    input.addEventListener('input', (e) => {
                        const value = e.target.value.toUpperCase();
                        const isIntersection = cell.classList.contains('intersection-cell');
                        
                        console.log(`⌨️ Input [${i},${j}]: "${value}" | intersection=${isIntersection} | currentWordIndex=${this.currentWordIndex}`);
                        
                        if (isIntersection) {
                            // Gérer intersection avec 2 lettres
                            // 🔒 PRIORITÉ ABSOLUE : garder le mot en cours
                            let currentWord = null;
                            
                            // 🎯 NOUVEAU: Utiliser les infos de l'intersection pour identifier le mot
                            const intersectionData = this.intersections && this.intersections[i] && this.intersections[i][j];
                            
                            if (this.currentWordIndex !== null && this.words && this.words[this.currentWordIndex]) {
                                // ✅ Mot actuel défini, on le garde
                                currentWord = this.words[this.currentWordIndex];
                                console.log(`✅ Intersection: GARDER mot #${this.currentWordIndex} "${currentWord.word}"`);
                            } else if (intersectionData && intersectionData.word1Index !== undefined && intersectionData.word2Index !== undefined) {
                                // Utiliser les infos de l'intersection pour choisir intelligemment
                                const word1 = this.words[intersectionData.word1Index];
                                const word2 = this.words[intersectionData.word2Index];
                                
                                // Si on a une direction de mouvement, choisir le mot correspondant
                                if (this.lastMoveDirection === word1.direction) {
                                    currentWord = word1;
                                    this.currentWordIndex = intersectionData.word1Index;
                                    console.log(`🎯 Intersection: utiliser mot #${this.currentWordIndex} "${currentWord.word}" (direction=${this.lastMoveDirection})`);
                                } else if (this.lastMoveDirection === word2.direction) {
                                    currentWord = word2;
                                    this.currentWordIndex = intersectionData.word2Index;
                                    console.log(`🎯 Intersection: utiliser mot #${this.currentWordIndex} "${currentWord.word}" (direction=${this.lastMoveDirection})`);
                                } else {
                                    // Par défaut, prendre le premier mot
                                    currentWord = word1;
                                    this.currentWordIndex = intersectionData.word1Index;
                                    console.log(`⚠️ Intersection: défaut mot #${this.currentWordIndex} "${currentWord.word}"`);
                                }
                            } else if (this.lastMoveDirection && this.words && this.words.length > 0) {
                                // Fallback intelligent : chercher le mot dans la même direction que le mouvement précédent
                                const wordsAtCell = this.words
                                    .map((wordData, index) => ({ wordData, index }))
                                    .filter(w => w.wordData.path && w.wordData.path.some(([r, c]) => r === i && c === j));
                                
                                console.log(`🔍 Intersection [${i},${j}]: ${wordsAtCell.length} mot(s) détecté(s):`, wordsAtCell.map(w => `#${w.index} "${w.wordData.word}"`));
                                
                                // Privilégier le mot dans la même direction
                                const wordInSameDirection = wordsAtCell.find(w => w.wordData.direction === this.lastMoveDirection);
                                const selectedWord = wordInSameDirection || wordsAtCell[0];
                                
                                if (selectedWord) {
                                    currentWord = selectedWord.wordData;
                                    this.currentWordIndex = selectedWord.index;
                                    this.lastMoveDirection = currentWord.direction;
                                    console.warn(`⚠️ Fallback intelligent: mot #${this.currentWordIndex} "${currentWord.word}" (direction=${this.lastMoveDirection})`);
                                }
                            }
                            
                            // Si on saisit qu'une seule lettre et qu'on a un mot en cours
                            if (value.length === 1 && /[A-Z]/.test(value) && currentWord) {
                                const letter = value[0];
                                const letter1Span = cell.querySelector('.cell-letter-horiz');
                                const letter2Span = cell.querySelector('.cell-letter-vert');
                                
                                console.log(`📝 Saisie intersection: mot #${this.currentWordIndex} "${currentWord.word}" direction=${currentWord.direction}`);
                                
                                // 🎯 Utiliser les infos de l'intersection pour savoir quelle lettre modifier
                                const intersectionData = this.intersections && this.intersections[i] && this.intersections[i][j];
                                let isWord1 = false;
                                
                                if (intersectionData && intersectionData.word1Index !== undefined && intersectionData.word2Index !== undefined) {
                                    // Utiliser les index sauvegardés dans l'intersection
                                    isWord1 = (this.currentWordIndex === intersectionData.word1Index);
                                    console.log(`🔍 Intersection: mot actuel=${this.currentWordIndex}, word1=${intersectionData.word1Index}, word2=${intersectionData.word2Index}, isWord1=${isWord1}`);
                                } else {
                                    // Fallback : utiliser la direction
                                    isWord1 = (currentWord.direction === 'horizontal');
                                }
                                
                                // Mettre à jour seulement la lettre correspondant au mot en cours
                                if (isWord1) {
                                    // On tape le premier mot (letter1)
                                    letter1Span.textContent = letter;
                                    // Garder letter2 tel quel si déjà rempli
                                    const currentValue = this.grid[i][j];
                                    if (currentValue && currentValue.includes('/')) {
                                        const [, existingLetter2] = currentValue.split('/');
                                        this.grid[i][j] = `${letter}/${existingLetter2 || ''}`;
                                    } else {
                                        this.grid[i][j] = `${letter}/`;
                                    }
                                } else {
                                    // On tape le deuxième mot (letter2)
                                    letter2Span.textContent = letter;
                                    // Garder letter1 tel quel si déjà rempli
                                    const currentValue = this.grid[i][j];
                                    if (currentValue && currentValue.includes('/')) {
                                        const [existingLetter1] = currentValue.split('/');
                                        this.grid[i][j] = `${existingLetter1 || ''}/${letter}`;
                                    } else {
                                        this.grid[i][j] = `/${letter}`;
                                    }
                                }
                                
                                // Son de placement de lettre
                                if (window.audioSystem) {
                                    window.audioSystem.playLetterPlace();
                                }
                                
                                // Vérifier si correct
                                const expected1 = letter1Span.dataset.expected;
                                const expected2 = letter2Span.dataset.expected;
                                const [inputLetter1, inputLetter2] = this.grid[i][j].split('/');
                                
                                if (this.lettersMatch(inputLetter1 || '', expected1) && this.lettersMatch(inputLetter2 || '', expected2)) {
                                    cell.classList.add('correct');
                                    this.correctLettersCount += 2; // Deux lettres correctes
                                    this.broadcastLettersCount();
                                    this.checkCompletedWords();
                                } else if (currentWord.direction === 'horizontal' && this.lettersMatch(inputLetter1, expected1)) {
                                    // Partiellement correct pour ce mot
                                    this.correctLettersCount += 1;
                                    this.broadcastLettersCount();
                                    this.checkCompletedWords();
                                } else if (currentWord.direction === 'vertical' && this.lettersMatch(inputLetter2, expected2)) {
                                    // Partiellement correct pour ce mot
                                    this.correctLettersCount += 1;
                                    this.broadcastLettersCount();
                                    this.checkCompletedWords();
                                }
                                
                                // Vider l'input et avancer
                                input.value = '';
                                setTimeout(() => {
                                    // 🔒 GARDER le mot actuel pour continuer après l'intersection
                                    const savedWordIndex = this.currentWordIndex;
                                    const savedDirection = this.lastMoveDirection;
                                    console.log(`🔄 Intersection: continuer mot #${savedWordIndex} direction=${savedDirection}`);
                                    this.moveToNextCell(i, j);
                                    this.checkIfLevelComplete();
                                    this.saveGame(); // 💾 Sauvegarde auto
                                }, 50);
                            }
                            // Gérer la saisie de 2 lettres (remplissage complet de l'intersection)
                            else if (value.length >= 2 && /[A-Z]{2}/.test(value)) {
                                const letter1 = value[0];
                                const letter2 = value[1];
                                
                                const letter1Span = cell.querySelector('.cell-letter-horiz');
                                const letter2Span = cell.querySelector('.cell-letter-vert');
                                
                                // 🎯 Utiliser les infos de l'intersection pour placer les lettres dans le bon ordre
                                const intersectionData = this.intersections && this.intersections[i] && this.intersections[i][j];
                                
                                if (intersectionData && currentWord) {
                                    // Déterminer quelle lettre va où selon le mot en cours
                                    if (this.currentWordIndex === intersectionData.word1Index) {
                                        // On tape le premier mot : letter1 = notre mot, letter2 = l'autre
                                        letter1Span.textContent = letter1;
                                        letter2Span.textContent = letter2 || intersectionData.letter2;
                                        this.grid[i][j] = `${letter1}/${letter2 || intersectionData.letter2}`;
                                    } else if (this.currentWordIndex === intersectionData.word2Index) {
                                        // On tape le deuxième mot : letter2 = notre mot, letter1 = l'autre
                                        letter1Span.textContent = letter1 || intersectionData.letter1;
                                        letter2Span.textContent = letter2;
                                        this.grid[i][j] = `${letter1 || intersectionData.letter1}/${letter2}`;
                                    } else {
                                        // Cas par défaut
                                        letter1Span.textContent = letter1;
                                        letter2Span.textContent = letter2;
                                        this.grid[i][j] = `${letter1}/${letter2}`;
                                    }
                                } else {
                                    // Pas d'info intersection, mode classique
                                    letter1Span.textContent = letter1;
                                    letter2Span.textContent = letter2;
                                    this.grid[i][j] = `${letter1}/${letter2}`;
                                }
                                
                                // Son de placement de lettre
                                if (window.audioSystem) {
                                    window.audioSystem.playLetterPlace();
                                }
                                
                                // Vérifier si correct
                                const expected1 = letter1Span.dataset.expected;
                                const expected2 = letter2Span.dataset.expected;
                                
                                if (this.lettersMatch(letter1, expected1) && this.lettersMatch(letter2, expected2)) {
                                    cell.classList.add('correct');
                                    this.correctLettersCount += 2;
                                    this.broadcastLettersCount();
                                    this.checkCompletedWords();
                                } else {
                                    cell.classList.remove('correct');
                                }
                                
                                // Vider l'input et avancer
                                input.value = '';
                                setTimeout(() => {
                                    // 🔒 GARDER le mot actuel pour continuer après l'intersection
                                    const savedWordIndex = this.currentWordIndex;
                                    const savedDirection = this.lastMoveDirection;
                                    console.log(`🔄 Intersection 2 lettres: continuer mot #${savedWordIndex} direction=${savedDirection}`);
                                    this.moveToNextCell(i, j);
                                    this.checkIfLevelComplete();
                                    this.saveGame(); // 💾 Sauvegarde auto
                                }, 50);
                            }
                            else {
                                // currentWord n'est pas défini ou saisie incorrecte
                                console.error(`❌ Intersection: impossible de continuer, currentWord=${currentWord}, value="${value}"`);
                                input.value = '';
                            }
                        } else {
                            // Gérer case normale avec 1 lettre
                            const letter = value;
                            if (letter && /[A-Z]/.test(letter)) {
                                const letterSpan = cell.querySelector('.cell-letter');
                                letterSpan.textContent = letter;
                                this.grid[i][j] = letter;
                                
                                // Son de placement de lettre
                                if (window.audioSystem) {
                                    window.audioSystem.playLetterPlace();
                                }

                                // Envoyer la mise à jour en multijoueur
                                if (this.multiplayerMode && this.multiplayerManager) {
                                    this.multiplayerManager.sendCellUpdate(i, j, letter);
                                }
                                
                                // Ne plus partager chaque lettre (trop fréquent)
                                // La progression sera partagée seulement lors des mots complets

                                // Vérifier si correct
                                if (this.lettersMatch(letter, this.solution[i][j])) {
                                    cell.classList.add('correct');
                                    this.correctLettersCount += 1;
                                    this.broadcastLettersCount();
                                    // Vérifier les mots complétés en temps réel
                                    this.checkCompletedWords();
                                } else {
                                    cell.classList.remove('correct');
                                }

                                // Vider l'input et avancer
                                input.value = '';
                                setTimeout(() => {
                                    this.moveToNextCell(i, j);
                                    // Vérifier si le niveau est complet après le déplacement
                                    this.saveGame(); // 💾 Sauvegarde auto
                                    this.checkIfLevelComplete();
                                }, 50);
                            }
                        }
                    });

                    // Gérer les touches spéciales
                    input.addEventListener('keydown', (e) => {
                        // Tab ou Espace : Changer de direction à une intersection
                        if ((e.key === 'Tab' || e.key === ' ') && cell.classList.contains('intersection-cell')) {
                            e.preventDefault();
                            
                            // Trouver tous les mots à cette intersection
                            if (this.words && this.words.length > 0) {
                                const wordsAtCell = this.words
                                    .map((wordData, index) => ({
                                        wordData,
                                        index,
                                        cellIndex: wordData.path ? wordData.path.findIndex(([r, c]) => r === i && c === j) : -1
                                    }))
                                    .filter(w => w.cellIndex !== -1);
                                
                                if (wordsAtCell.length > 1) {
                                    // Trouver le mot actuel
                                    const currentIdx = this.currentWordIndex;
                                    const currentInList = wordsAtCell.findIndex(w => w.index === currentIdx);
                                    
                                    // Passer au suivant (ou au premier si on est au dernier)
                                    const nextIdx = (currentInList + 1) % wordsAtCell.length;
                                    const nextWord = wordsAtCell[nextIdx];
                                    
                                    this.currentWordIndex = nextWord.index;
                                    this.lastMoveDirection = nextWord.wordData.direction;
                                    
                                    // Feedback visuel
                                    const directionText = nextWord.wordData.direction === 'horizontal' ? 'Horizontal →' : 'Vertical ↓';
                                    console.log(`🔄 Direction changée: ${directionText}`);
                                }
                            }
                            return;
                        }
                        
                        if (e.key === 'Backspace' || e.key === 'Delete') {
                            e.preventDefault();
                            const currentValue = this.grid[i][j];
                            
                            // Gérer l'effacement pour les intersections
                            if (cell.classList.contains('intersection-cell')) {
                                const letter1Span = cell.querySelector('.cell-letter-horiz');
                                const letter2Span = cell.querySelector('.cell-letter-vert');
                                if (letter1Span) letter1Span.textContent = '';
                                if (letter2Span) letter2Span.textContent = '';
                            } else if (letterSpan) {
                                letterSpan.textContent = '';
                            }
                            
                            this.grid[i][j] = '';
                            cell.classList.remove('correct');
                            input.value = '';

                            // Envoyer la mise à jour en multijoueur
                            if (this.multiplayerMode && this.multiplayerManager) {
                                this.multiplayerManager.sendCellUpdate(i, j, '');
                            }

                            if (!currentValue) {
                                this.moveToPreviousCell(i, j);
                            }
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            this.moveTo(Math.max(0, i - 1), j);
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            this.moveTo(Math.min(config.gridSize - 1, i + 1), j);
                        } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            this.moveTo(i, Math.max(0, j - 1));
                        } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            this.moveTo(i, Math.min(config.gridSize - 1, j + 1));
                        }
                    });
                }

                gridContainer.appendChild(cell);
            }
        }
    }

    getWordIcons() {
        // Chiffres simples en gras pour une meilleure lisibilité
        return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
    }

    detectWordDirection(path) {
        // Analyser le path pour déterminer si le mot est horizontal, vertical ou coudé
        if (!path || path.length < 2) return null;
        
        let isHorizontal = true;
        let isVertical = true;
        
        for (let i = 1; i < path.length; i++) {
            const [prevRow, prevCol] = path[i - 1];
            const [currRow, currCol] = path[i];
            
            // Si la ligne change, ce n'est pas horizontal
            if (prevRow !== currRow) isHorizontal = false;
            // Si la colonne change, ce n'est pas vertical
            if (prevCol !== currCol) isVertical = false;
        }
        
        if (isHorizontal) return 'horizontal';
        if (isVertical) return 'vertical';
        return 'bent'; // Mot coudé
    }

    moveTo(row, col) {
        if (this.blocked[row][col]) return;

        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            const input = cell.querySelector('.cell-input');
            if (input) {
                document.querySelectorAll('.cell.focused').forEach(c => c.classList.remove('focused'));
                cell.classList.add('focused');
                input.focus();
            }
        }
    }

    moveToNextCell(row, col) {
        // TOUJOURS suivre le path du mot actuel
        if (!this.words || this.words.length === 0) return;
        
        // 1. Si on a un mot en cours défini, le suivre en priorité
        if (this.currentWordIndex !== null && this.words[this.currentWordIndex]) {
            const wordData = this.words[this.currentWordIndex];
            if (wordData.path) {
                const cellIndex = wordData.path.findIndex(([r, c]) => r === row && c === col);
                if (cellIndex !== -1 && cellIndex < wordData.path.length - 1) {
                    // Aller à la prochaine case du même mot (suit le path exact)
                    const [nextRow, nextCol] = wordData.path[cellIndex + 1];
                    this.lastMoveDirection = wordData.direction;
                    console.log(`➡️ NextCell: Suite mot #${this.currentWordIndex} "${wordData.word}" [${row},${col}] → [${nextRow},${nextCol}]`);
                    this.moveTo(nextRow, nextCol);
                    return;
                } else if (cellIndex === wordData.path.length - 1) {
                    // 🎯 Fin du mot actuel
                    console.log(`🏁 Fin du mot #${this.currentWordIndex} "${wordData.word}" à [${row},${col}]`);
                    
                    // Vérifier si le mot est maintenant complété
                    const wordKey = `${wordData.word}_${wordData.row}_${wordData.col}`;
                    const isWordCompleted = this.completedWords && this.completedWords.has(wordKey);
                    
                    // Vérifier si c'est une intersection
                    const isIntersection = this.intersections && this.intersections[row] && this.intersections[row][col];
                    
                    if (isIntersection && !isWordCompleted) {
                        // Mot non complété qui finit sur une intersection : chercher l'autre mot à cette intersection
                        const otherWords = this.words
                            .map((w, idx) => ({
                                wordData: w,
                                idx: idx,
                                cellIndex: w.path ? w.path.findIndex(([r, c]) => r === row && c === col) : -1
                            }))
                            .filter(w => w.idx !== this.currentWordIndex && w.cellIndex !== -1);
                        
                        if (otherWords.length > 0) {
                            // Switch vers l'autre mot de l'intersection s'il n'est pas complété
                            const nextWord = otherWords[0];
                            const nextWordKey = `${nextWord.wordData.word}_${nextWord.wordData.row}_${nextWord.wordData.col}`;
                            const isNextWordCompleted = this.completedWords && this.completedWords.has(nextWordKey);
                            
                            if (!isNextWordCompleted && nextWord.cellIndex < nextWord.wordData.path.length - 1) {
                                this.currentWordIndex = nextWord.idx;
                                this.lastMoveDirection = nextWord.wordData.direction;
                                console.log(`🔄 Switch vers mot #${this.currentWordIndex} "${nextWord.wordData.word}" à l'intersection`);
                                
                                const [nextRow, nextCol] = nextWord.wordData.path[nextWord.cellIndex + 1];
                                this.moveTo(nextRow, nextCol);
                                return;
                            }
                        }
                    }
                    
                    // Sinon, passer au mot suivant non complété
                    console.log(`⏭️ Passage au mot suivant non complété...`);
                    this.moveToNextIncompleteWord(this.currentWordIndex);
                    return;
                }
            }
        }
        
        // 2. Chercher TOUS les mots contenant cette case
        const candidateWords = [];
        for (let idx = 0; idx < this.words.length; idx++) {
            const wordData = this.words[idx];
            if (wordData.path) {
                const cellIndex = wordData.path.findIndex(([r, c]) => r === row && c === col);
                if (cellIndex !== -1 && cellIndex < wordData.path.length - 1) {
                    candidateWords.push({ idx, wordData, cellIndex });
                }
            }
        }
        
        // 3. Sélectionner le meilleur candidat
        if (candidateWords.length > 0) {
            let selectedWord = candidateWords[0];
            
            // Privilégier le mot dans la même direction si définie
            if (this.lastMoveDirection && candidateWords.length > 1) {
                const wordInSameDirection = candidateWords.find(
                    w => w.wordData.direction === this.lastMoveDirection
                );
                if (wordInSameDirection) {
                    selectedWord = wordInSameDirection;
                }
            }
            
            // Suivre le path exact du mot sélectionné
            const [nextRow, nextCol] = selectedWord.wordData.path[selectedWord.cellIndex + 1];
            this.currentWordIndex = selectedWord.idx;
            this.lastMoveDirection = selectedWord.wordData.direction;
            this.moveTo(nextRow, nextCol);
            return;
        }
        
        // 4. Aucun mot trouvé - passer au premier mot non complété
        console.warn('⚠️ Aucun mot trouvé pour continuer depuis', row, col);
        this.moveToNextIncompleteWord(-1); // -1 pour commencer depuis le début
    }

    moveToPreviousCell(row, col) {
        // TOUJOURS suivre le path du mot actuel en arrière
        if (!this.words || this.words.length === 0) return;
        
        // 1. Si on a un mot en cours défini, le suivre en priorité
        if (this.currentWordIndex !== null && this.words[this.currentWordIndex]) {
            const wordData = this.words[this.currentWordIndex];
            if (wordData.path) {
                const cellIndex = wordData.path.findIndex(([r, c]) => r === row && c === col);
                if (cellIndex > 0) {
                    // Aller à la case précédente du même mot (suit le path exact)
                    const [prevRow, prevCol] = wordData.path[cellIndex - 1];
                    this.lastMoveDirection = wordData.direction;
                    this.moveTo(prevRow, prevCol);
                    return;
                }
            }
        }
        
        // 2. Chercher TOUS les mots contenant cette case
        const candidateWords = [];
        for (let idx = 0; idx < this.words.length; idx++) {
            const wordData = this.words[idx];
            if (wordData.path) {
                const cellIndex = wordData.path.findIndex(([r, c]) => r === row && c === col);
                if (cellIndex > 0) {
                    candidateWords.push({ idx, wordData, cellIndex });
                }
            }
        }
        
        // 3. Sélectionner le meilleur candidat
        if (candidateWords.length > 0) {
            let selectedWord = candidateWords[0];
            
            // Privilégier le mot dans la même direction si définie
            if (this.lastMoveDirection && candidateWords.length > 1) {
                const wordInSameDirection = candidateWords.find(
                    w => w.wordData.direction === this.lastMoveDirection
                );
                if (wordInSameDirection) {
                    selectedWord = wordInSameDirection;
                }
            }
            
            // Suivre le path exact du mot sélectionné en arrière
            const [prevRow, prevCol] = selectedWord.wordData.path[selectedWord.cellIndex - 1];
            this.currentWordIndex = selectedWord.idx;
            this.lastMoveDirection = selectedWord.wordData.direction;
            this.moveTo(prevRow, prevCol);
            return;
        }
        
        // 4. Aucun mot trouvé - chercher la cellule non bloquée précédente (fallback rare)
        console.warn('⚠️ Aucun mot trouvé pour revenir depuis', row, col);
        for (let i = row; i >= 0; i--) {
            for (let j = (i === row ? col - 1 : config.gridSize - 1); j >= 0; j--) {
                if (!this.blocked[i][j]) {
                    this.currentWordIndex = null;
                    this.lastMoveDirection = null;
                    this.moveTo(i, j);
                    return;
                }
            }
        }
    }

    displayClues(words = this.words) {
        const horizontalClues = document.getElementById('horizontalClues');
        const verticalClues = document.getElementById('verticalClues');

        const wordIcons = this.getWordIcons();

        horizontalClues.innerHTML = '';
        verticalClues.innerHTML = '';

        if (!words || words.length === 0) {
            console.warn('⚠️ Aucun mot à afficher dans les indices');
            return;
        }

        words.forEach((wordData, index) => {
            const clueElement = document.createElement('div');
            clueElement.className = 'clue';

            // Icône numérique pour identifier le mot
            const numberIcon = wordIcons[index];

            if (wordData.direction === 'horizontal') {
                clueElement.innerHTML = `
                    <span class="clue-icon">${numberIcon}</span>
                    <span class="clue-text">${wordData.clue}</span>
                    <span class="clue-length">${wordData.word.length}</span>
                `;
                horizontalClues.appendChild(clueElement);
            } else {
                clueElement.innerHTML = `
                    <span class="clue-icon">${numberIcon}</span>
                    <span class="clue-text">${wordData.clue}</span>
                    <span class="clue-length">${wordData.word.length}</span>
                `;
                verticalClues.appendChild(clueElement);
            }
        });
    }

    async checkAnswers() {
        let correctCells = 0;
        let totalCells = 0;
        let completedWords = 0;

        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                if (!this.blocked[i][j]) {
                    totalCells++;
                    const cellValue = this.grid[i][j];
                    const solutionValue = this.solution[i][j];
                    
                    // Gérer les intersections
                    if (solutionValue && solutionValue.includes('/')) {
                        const [letter1, letter2] = solutionValue.split('/');
                        if (cellValue && cellValue.includes('/')) {
                            const [inputLetter1, inputLetter2] = cellValue.split('/');
                            if (inputLetter1 === letter1 && inputLetter2 === letter2) {
                                correctCells++;
                            }
                        }
                    } else {
                        if (cellValue === solutionValue) {
                            correctCells++;
                        }
                    }
                }
            }
        }

        // Vérifier les mots complets
        if (this.words && this.words.length > 0) {
            this.words.forEach(wordData => {
                let wordComplete = true;
                if (wordData.path) {
                    for (let i = 0; i < wordData.word.length && i < wordData.path.length; i++) {
                        const [row, col] = wordData.path[i];
                        const expectedLetter = wordData.word[i];
                        if (!this.isCellCorrect(row, col, expectedLetter, wordData.direction)) {
                            wordComplete = false;
                            break;
                        }
                    }
                }
                if (wordComplete) completedWords++;
            });
        }

        const percentage = (correctCells / totalCells) * 100;
        // 10 points par lettre correcte
        const pointsPerLetter = 10;
        const letterPoints = correctCells * pointsPerLetter;
        
        // 50 points bonus par mot complété
        const wordBonus = 50;
        const wordBonusPoints = completedWords * wordBonus;
        
        const totalPoints = letterPoints + wordBonusPoints;
        this.updateScoreWithAnimation(totalPoints);

        // Notifier dans le chat
        if (percentage === 100 && typeof window.simpleChatSystem !== 'undefined') {
            window.simpleChatSystem.showMessage(`🎉 Grille complète ! ${correctCells} lettres (+${letterPoints}pts) + ${completedWords} mots bonus (+${wordBonusPoints}pts) = +${totalPoints} points`, 'system');
        } else if (completedWords > 0 && typeof window.simpleChatSystem !== 'undefined') {
            window.simpleChatSystem.showMessage(`✅ ${correctCells}/${totalCells} lettres (+${letterPoints}pts) + ${completedWords} mots bonus (+${wordBonusPoints}pts) = +${totalPoints} points`, 'system');
        } else if (percentage > 0 && typeof window.simpleChatSystem !== 'undefined') {
            window.simpleChatSystem.showMessage(`✅ ${correctCells}/${totalCells} lettres correctes ! +${totalPoints} points`, 'system');
        }

        // Notifier le système de course multijoueur (si actif)
        if (window.multiplayerRace && window.multiplayerRace.isRaceMode) {
            // Le système de course calculera la progression et enverra les mises à jour
            // Pas besoin d'action ici - les mises à jour sont automatiques
        }

        // Sauvegarder le progrès
        this.saveGame();

        if (percentage === 100) {
            // Enregistrer la complétion du niveau avec le système d'achievements
            const currentLevelData = gameDataManager.getLevelData(this.currentLevel);
            const isBonusLevel = currentLevelData && currentLevelData.bonusWords;
            const newAchievements = achievementSystem.recordLevelCompletion(
                this.currentLevel,
                this.hintsUsedThisLevel,
                isBonusLevel
            );

            // Afficher les achievements débloqués
            if (newAchievements && newAchievements.length > 0) {
                await this.showAchievementUnlocked(newAchievements);
            }

            await this.showKawaiiModal(i18n.t('congratulations'), '🎉');
            document.getElementById('nextLevelButton').style.display = 'inline-block';
            document.getElementById('shareButton').style.display = 'inline-block';
        } else {
            await this.showKawaiiModal(i18n.t('progress', { percent: Math.round(percentage) }), '💪');
        }
    }

    // Vérifier les mots complétés en temps réel
    // Fonction utilitaire pour vérifier si une cellule correspond à la solution
    isCellCorrect(row, col, expectedLetter, wordDirection) {
        const cellValue = this.grid[row][col];
        const solutionValue = this.solution[row][col];
        
        // Si la solution contient "/" (intersection avec deux lettres différentes)
        if (solutionValue && solutionValue.includes('/')) {
            const [horizLetter, vertLetter] = solutionValue.split('/');
            
            // Si la cellule contient aussi "/" (les deux lettres sont remplies)
            if (cellValue && cellValue.includes('/')) {
                const [inputHoriz, inputVert] = cellValue.split('/');
                // Les deux lettres doivent correspondre
                return inputHoriz === horizLetter && inputVert === vertLetter;
            }
            
            // Sinon, vérifier juste la lettre appropriée selon la direction du mot
            if (wordDirection === 'horizontal') {
                return cellValue === horizLetter;
            } else if (wordDirection === 'vertical') {
                return cellValue === vertLetter;
            }
            
            // Si pas de direction spécifiée, vérifier si c'est l'une des deux lettres
            return cellValue === horizLetter || cellValue === vertLetter;
        }
        
        // Case normale : comparaison directe
        return cellValue === solutionValue;
    }

    checkCompletedWords() {
        if (!this.words || this.words.length === 0) return;

        // Vérifier chaque mot
        this.words.forEach((wordData, wordIndex) => {
            // Vérifier si ce mot était déjà marqué comme complété
            if (!this.completedWords) {
                this.completedWords = new Set();
            }

            const wordKey = `${wordData.word}_${wordData.row}_${wordData.col}`;
            
            // Si déjà notifié, ne rien faire
            if (this.completedWords.has(wordKey)) return;

            // Vérifier si le mot est complet
            let wordComplete = true;
            if (wordData.path) {
                for (let i = 0; i < wordData.word.length && i < wordData.path.length; i++) {
                    const [row, col] = wordData.path[i];
                    const expectedLetter = wordData.word[i];
                    const cellValue = this.grid[row][col];
                    
                    // Gérer les intersections avec format "A/B"
                    let isCorrect = false;
                    if (cellValue && cellValue.includes('/')) {
                        // C'est une intersection, vérifier si la lettre attendue est dans l'une des deux
                        const [letter1, letter2] = cellValue.split('/');
                        // Déterminer quelle lettre utiliser selon la direction du mot
                        if (wordData.direction === 'horizontal') {
                            isCorrect = this.lettersMatch(letter1, expectedLetter);
                        } else {
                            isCorrect = this.lettersMatch(letter2, expectedLetter);
                        }
                    } else {
                        // Case normale
                        isCorrect = this.lettersMatch(cellValue, expectedLetter);
                    }
                    
                    if (!isCorrect) {
                        wordComplete = false;
                        break;
                    }
                }
            }

            // Si le mot vient d'être complété
            if (wordComplete) {
                this.completedWords.add(wordKey);
                
                // 🌟 Animer les cellules du mot en or
                if (wordData.path) {
                    wordData.path.forEach(([row, col]) => {
                        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                        if (cell) {
                            // Ajouter la classe d'animation
                            cell.classList.add('word-completed');
                            
                            // Retirer la classe après l'animation pour pouvoir la rejouer
                            setTimeout(() => {
                                cell.classList.remove('word-completed');
                            }, 1000);
                        }
                    });
                }
                
                // Son de mot valide
                if (window.audioSystem) {
                    window.audioSystem.playWordValid();
                }
                
                // Vérifier si ce mot a été révélé avec un indice
                const usedHint = this.wordsWithHints.has(wordKey);
                
                // Ajouter les points bonus SEULEMENT si aucun indice n'a été utilisé
                const wordBonus = usedHint ? 0 : 50;
                if (wordBonus > 0) {
                    this.updateScoreWithAnimation(wordBonus);
                    console.log(`✅ Mot complété: "${wordData.word}" (+${wordBonus} points)`);
                } else {
                    console.log(`✅ Mot complété: "${wordData.word}" (0 points - indice utilisé)`);
                }
                
                // 🌐 TOUJOURS partager avec les autres joueurs en multijoueur (APRÈS mise à jour du score)
                if (window.simpleChatSystem && window.simpleChatSystem.gameConnections && window.simpleChatSystem.gameConnections.size > 0) {
                    const totalWords = this.words.length;
                    const wordsCompleted = this.completedWords.size;
                    console.log(`📢 Broadcast mot complété: "${wordData.word}" aux ${window.simpleChatSystem.gameConnections.size} joueurs`);
                    window.simpleChatSystem.broadcastGameAction({
                        type: 'word_completed',
                        word: wordData.word,
                        score: this.score, // Score APRÈS ajout des points
                        gameMode: this.gameMode,
                        wordLength: wordData.word.length,
                        wordsCompleted: wordsCompleted,
                        totalWords: totalWords,
                        usedHint: usedHint
                    });
                }
                
                // 🎯 NOUVELLE LOGIQUE: Passer au prochain mot non complété
                // Si c'est le mot en cours qui vient d'être complété
                if (this.currentWordIndex === wordIndex) {
                    this.moveToNextIncompleteWord(wordIndex);
                }
            }
        });
    }

    /**
     * Passe au prochain mot non complété
     * @param {number} currentWordIndex - Index du mot actuel (qui vient d'être complété)
     */
    moveToNextIncompleteWord(currentWordIndex) {
        if (!this.words || this.words.length === 0) return;
        
        console.log(`🔄 Recherche du prochain mot non complété après le mot #${currentWordIndex}`);
        
        // Chercher le prochain mot non complété (en commençant après le mot actuel)
        for (let i = 1; i <= this.words.length; i++) {
            const nextIndex = (currentWordIndex + i) % this.words.length;
            const nextWord = this.words[nextIndex];
            const wordKey = `${nextWord.word}_${nextWord.row}_${nextWord.col}`;
            
            // Si ce mot n'est pas complété
            if (!this.completedWords.has(wordKey)) {
                console.log(`➡️ Passage au mot #${nextIndex}: "${nextWord.word}"`);
                
                // Aller à la première lettre VIDE de ce mot
                if (nextWord.path && nextWord.path.length > 0) {
                    // Trouver la première case vide du mot
                    let firstEmptyIndex = 0;
                    for (let j = 0; j < nextWord.path.length; j++) {
                        const [row, col] = nextWord.path[j];
                        const cellValue = this.grid[row][col];
                        
                        // Si la case est vide ou partiellement remplie (intersection)
                        if (!cellValue || cellValue === '' || 
                            (cellValue.includes('/') && (cellValue === '/' || cellValue.endsWith('/') || cellValue.startsWith('/')))) {
                            firstEmptyIndex = j;
                            break;
                        }
                    }
                    
                    const [firstRow, firstCol] = nextWord.path[firstEmptyIndex];
                    console.log(`🎯 Première case vide du mot #${nextIndex}: [${firstRow},${firstCol}] (index ${firstEmptyIndex})`);
                    
                    // Mettre à jour le mot en cours
                    this.currentWordIndex = nextIndex;
                    this.lastMoveDirection = nextWord.direction;
                    
                    // Se déplacer vers la première case vide du nouveau mot
                    setTimeout(() => {
                        this.moveTo(firstRow, firstCol);
                    }, 200); // Petit délai pour que l'animation soit visible
                }
                return;
            }
        }
        
        // Tous les mots sont complétés
        console.log(`🎉 Tous les mots sont complétés !`);
        this.currentWordIndex = null;
        this.lastMoveDirection = null;
    }

    /**
     * Focus sur le premier mot non complété (utilisé au démarrage d'un niveau)
     */
    focusFirstIncompleteWord() {
        if (!this.words || this.words.length === 0) return;
        
        // Chercher le premier mot non complété
        for (let i = 0; i < this.words.length; i++) {
            const word = this.words[i];
            const wordKey = `${word.word}_${word.row}_${word.col}`;
            
            // Si ce mot n'est pas complété
            if (!this.completedWords || !this.completedWords.has(wordKey)) {
                console.log(`🎯 Focus initial sur mot #${i}: "${word.word}"`);
                
                // Aller à la première lettre de ce mot
                if (word.path && word.path.length > 0) {
                    const [firstRow, firstCol] = word.path[0];
                    
                    // Mettre à jour le mot en cours
                    this.currentWordIndex = i;
                    this.lastMoveDirection = word.direction;
                    
                    // Se déplacer vers la première case
                    this.moveTo(firstRow, firstCol);
                }
                return;
            }
        }
    }

    async checkIfLevelComplete() {
        // Vérifier si toutes les cellules sont correctement remplies
        let allCorrect = true;
        let totalCells = 0;
        let incorrectCells = [];

        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                if (!this.blocked[i][j]) {
                    totalCells++;
                    const cellValue = this.grid[i][j];
                    const solutionValue = this.solution[i][j];
                    
                    // Vérifier si la cellule est remplie
                    if (!cellValue || cellValue === '') {
                        allCorrect = false;
                        incorrectCells.push(`[${i},${j}] vide`);
                        continue;
                    }
                    
                    // Vérifier si correcte (gérer les intersections)
                    if (solutionValue && solutionValue.includes('/')) {
                        const [letter1, letter2] = solutionValue.split('/');
                        if (cellValue.includes('/')) {
                            const [inputLetter1, inputLetter2] = cellValue.split('/');
                            if (!this.lettersMatch(inputLetter1, letter1) || !this.lettersMatch(inputLetter2, letter2)) {
                                allCorrect = false;
                                incorrectCells.push(`[${i},${j}] intersection: "${cellValue}" ≠ "${solutionValue}"`);
                            }
                        } else {
                            allCorrect = false;
                            incorrectCells.push(`[${i},${j}] pas d'intersection: "${cellValue}" ≠ "${solutionValue}"`);
                        }
                    } else {
                        if (!this.lettersMatch(cellValue, solutionValue)) {
                            allCorrect = false;
                            incorrectCells.push(`[${i},${j}] simple: "${cellValue}" ≠ "${solutionValue}"`);
                        }
                    }
                }
            }
        }
        
        if (!allCorrect) {
            console.log(`❌ Niveau incomplet: ${incorrectCells.length} cellule(s) incorrecte(s):`, incorrectCells.slice(0, 5));
        }

        // Si tout est correct, passer au niveau suivant automatiquement
        if (allCorrect && totalCells > 0) {
            console.log(`✅ Niveau complété! ${totalCells} cellules correctes`);
            // Son de victoire
            if (window.audioSystem) {
                window.audioSystem.playVictory();
            }
            
            // Féliciter le joueur avec l'IA
            if (typeof welcomeAI !== 'undefined') {
                welcomeAI.congratulate();
            }
            
            // Message de félicitation d'un bot assistant
            if (window.assistantBotManager) {
                const username = window.simpleChatSystem?.currentUser || 'Joueur';
                window.assistantBotManager.sendMessage('achievement', { 
                    username,
                    level: this.currentLevel,
                    score: this.score
                });
            }
            
            // Émettre événement pour les bots
            window.dispatchEvent(new CustomEvent('levelComplete', {
                detail: {
                    username: window.simpleChatSystem?.currentUser || 'Joueur',
                    level: this.currentLevel,
                    score: this.score
                }
            }));
            
            // Arrêter tous les bots AI
            if (window.aiBotManager) {
                window.aiBotManager.stopAllBots();
            }
            
            // Ajouter les points du niveau
            const bonusPoints = Math.round(100 * this.currentLevel * config.basePointsMultiplier);
            this.updateScoreWithAnimation(bonusPoints);

            // Notifier dans le chat
            if (typeof window.simpleChatSystem !== 'undefined') {
                window.simpleChatSystem.showMessage(`🏆 Niveau ${this.currentLevel} terminé ! +${bonusPoints} points bonus`, 'system');
                
                // Partager la complétion du niveau avec les autres joueurs
                if (window.simpleChatSystem.gameConnections.size > 0) {
                    window.simpleChatSystem.broadcastGameAction({
                        type: 'level_completed',
                        level: this.currentLevel,
                        score: this.score,
                        gameMode: this.gameMode,
                        bonusPoints: bonusPoints
                    });
                }
            }
            
            // Partager la progression en mode course (au niveau complété)
            if (window.multiplayerRace && window.multiplayerRace.isRaceMode) {
                window.multiplayerRace.shareLevelCompleted(this.currentLevel, this.score);
            }

            this.savePersonalBest();

            // Attendre un peu pour montrer l'animation de complétion
            setTimeout(async () => {
                const totalLevels = gameDataManager.getTotalLevels();
                if (this.currentLevel < totalLevels) {
                    // Si des joueurs sont connectés, attendre tout le monde
                    if (window.simpleChatSystem && window.simpleChatSystem.gameConnections.size > 0) {
                        // Initialiser le système de classement si nécessaire
                        if (!this.levelFinishers) {
                            this.levelFinishers = [];
                        }
                        
                        // Marquer ce joueur comme prêt
                        this.waitingForPlayers = true;
                        this.readyForNextLevel = true;
                        
                        // Enregistrer l'ordre d'arrivée
                        const finishPosition = this.levelFinishers.length + 1;
                        this.levelFinishers.push({
                            username: window.simpleChatSystem.currentUser,
                            position: finishPosition,
                            timestamp: Date.now()
                        });
                        
                        // Calculer le bonus selon la position (seulement en mode Normal)
                        let positionBonus = 0;
                        if (this.gameMode === 'normal') {
                            if (finishPosition === 1) {
                                positionBonus = 200; // Premier
                                this.updateScoreWithAnimation(positionBonus);
                            } else if (finishPosition === 2) {
                                positionBonus = 100; // Deuxième
                                this.updateScoreWithAnimation(positionBonus);
                            } else if (finishPosition === 3) {
                                positionBonus = 50; // Troisième
                                this.updateScoreWithAnimation(positionBonus);
                            }
                        }
                        
                        // Notifier les autres qu'on est prêt avec la position
                        window.simpleChatSystem.broadcastGameAction({
                            type: 'ready_next_level',
                            level: this.currentLevel,
                            nextLevel: this.currentLevel + 1,
                            gameMode: this.gameMode,
                            position: finishPosition,
                            positionBonus: positionBonus
                        });
                        
                        // Message différent selon le mode
                        const modeIcon = this.gameMode === 'couple' ? '💕' : '🏆';
                        const positionText = positionBonus > 0 ? `\n\n🎉 +${positionBonus} points bonus (${finishPosition === 1 ? '1er' : finishPosition === 2 ? '2ème' : '3ème'})!` : '';
                        await this.showKawaiiModal(`${modeIcon} Niveau terminé !${positionText}\n\n⏳ Attente des autres joueurs...`, '🎉');
                        
                        if (typeof window.simpleChatSystem !== 'undefined') {
                            const bonusMsg = positionBonus > 0 ? ` (+${positionBonus} pts)` : '';
                            window.simpleChatSystem.showMessage(`${modeIcon} Vous êtes prêt !${bonusMsg} En attente des autres joueurs...`, 'system');
                        }
                        
                        // La suite sera gérée par handleGameAction quand tous seront prêts
                        return;
                    }
                    
                    // Pas de joueurs connectés : passage automatique
                    // Afficher un message de félicitations rapide
                    await this.showKawaiiModal(i18n.t('congratulations') + '\n' + i18n.t('nextLevel'), '🎉');
                    this.currentLevel++;
                    
                    // Célébrer les jalons avec l'IA
                    if (typeof welcomeAI !== 'undefined') {
                        welcomeAI.celebrateMilestone(this.currentLevel);
                    }
                    
                    this.setupLevel();
                    // Sauvegarder le progrès
                    this.saveGame();
                } else {
                    // Fin du mode - Ajouter le score du mode au score total
                    const modeScore = this.score;
                    this.totalScore += modeScore;
                    
                    // Sauvegarder le score total
                    localStorage.setItem('christianCrosswordTotalScore', this.totalScore.toString());
                    
                    // Notifier les autres joueurs
                    if (window.simpleChatSystem && window.simpleChatSystem.gameConnections.size > 0) {
                        const modeIcon = this.gameMode === 'couple' ? '💕' : '🏆';
                        const modeName = this.gameMode === 'couple' ? 'Couple' : 'Normal';
                        window.simpleChatSystem.broadcastGameAction({
                            type: 'mode_completed',
                            gameMode: this.gameMode,
                            modeScore: modeScore,
                            totalScore: this.totalScore
                        });
                        window.simpleChatSystem.showMessage(`🎆 Mode ${modeName} terminé ! ${modeScore} pts ajoutés au score total (${this.totalScore} pts)`, 'system');
                    }
                    
                    // Fin du jeu
                                        // Sinon, proposer de sauvegarder le score total
                    this.showScoreModal(this.totalScore);
                    // Effacer la sauvegarde du mode car il est terminé
                    this.clearSave();
                }
            }, 500);
        }
    }

    // Passer au niveau suivant (après attente des joueurs)
    proceedToNextLevel() {
        if (!this.waitingForPlayers || !this.readyForNextLevel) return;
        
        this.waitingForPlayers = false;
        this.readyForNextLevel = false;
        this.levelFinishers = []; // Réinitialiser pour le prochain niveau
        
        this.currentLevel++;
        
        // Célébrer les jalons avec l'IA
        if (typeof welcomeAI !== 'undefined') {
            welcomeAI.celebrateMilestone(this.currentLevel);
        }
        
        this.setupLevel();
        // Sauvegarder le progrès
        this.saveGame();
        
        if (typeof window.simpleChatSystem !== 'undefined') {
            window.simpleChatSystem.showMessage('🚀 Tous les joueurs sont prêts ! Passage au niveau ' + this.currentLevel, 'system');
        }
    }

    // Menu functions
    openMenu() {
        const modal = document.getElementById('menuModal');
        modal.classList.remove('hidden');
        
        // Basculer vers l'onglet Settings par défaut
        if (window.menuTabSystem) {
            window.menuTabSystem.switchTab('settings');
        }
        
        // Ne plus minimiser automatiquement le chat - laisser l'utilisateur décider
    }

    closeMenu() {
        const modal = document.getElementById('menuModal');
        modal.classList.add('hidden');
        
        // Rouvrir la bulle de chat
        const chatBubble = document.getElementById('chatBubble');
        const toggleBtn = document.getElementById('toggleChatBubble');
        if (chatBubble && chatBubble.classList.contains('minimized')) {
            chatBubble.classList.remove('minimized');
            if (toggleBtn) toggleBtn.textContent = '−';
        }
    }

    openAchievements() {
        const modal = document.getElementById('achievementsModal');
        this.updateAchievementsDisplay();
        modal.classList.remove('hidden');
        this.closeMenu();
        
        // Minimiser la bulle de chat
        const chatBubble = document.getElementById('chatBubble');
        const toggleBtn = document.getElementById('toggleChatBubble');
        if (chatBubble && !chatBubble.classList.contains('minimized')) {
            chatBubble.classList.add('minimized');
            if (toggleBtn) toggleBtn.textContent = '+';
        }
    }

    closeAchievements() {
        const modal = document.getElementById('achievementsModal');
        modal.classList.add('hidden');
        
        // Rouvrir la bulle de chat
        const chatBubble = document.getElementById('chatBubble');
        const toggleBtn = document.getElementById('toggleChatBubble');
        if (chatBubble && chatBubble.classList.contains('minimized')) {
            chatBubble.classList.remove('minimized');
            if (toggleBtn) toggleBtn.textContent = '−';
        }
    }

    updateAchievementsDisplay(filter = 'all') {
        const stats = achievementSystem.getGlobalStats();

        // Mettre à jour les stats globales
        document.getElementById('achievementCount').textContent =
            `${stats.unlockedAchievements}/${stats.totalAchievements}`;
        document.getElementById('achievementPoints').textContent = stats.totalPoints;

        // Mettre à jour les stats de course si disponible
        if (typeof raceMedalSystem !== 'undefined') {
            const raceProgress = raceMedalSystem.getProgress();
            document.getElementById('raceMedalCount').textContent = 
                `${raceProgress.unlocked}/${raceProgress.total}`;
            document.getElementById('racePoints').textContent = raceMedalSystem.getRaceScore();
            
            // Afficher les médailles de course
            this.updateRaceMedalsDisplay();
        }

        // Remplir la section des médailles de score
        this.updateScoreMedalsShowcase();

        // Afficher les achievements
        const achievementsList = document.getElementById('achievementsList');
        achievementsList.innerHTML = '';

        const allAchievements = achievementSystem.getAllAchievements();

        allAchievements.forEach(achievement => {
            const isUnlocked = achievementSystem.isUnlocked(achievement.id);

            // Appliquer le filtre
            if (filter === 'unlocked' && !isUnlocked) return;
            if (filter === 'locked' && isUnlocked) return;

            const achievementCard = document.createElement('div');
            achievementCard.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            achievementCard.style.borderLeft = `4px solid ${achievementSystem.getRarityColor(achievement.rarity)}`;

            const iconClass = isUnlocked ? '' : 'locked-icon';
            const displayIcon = isUnlocked ? achievement.icon : '🔒';

            achievementCard.innerHTML = `
                <div class="achievement-icon ${iconClass}">${displayIcon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-meta">
                        <span class="achievement-rarity" style="color: ${achievementSystem.getRarityColor(achievement.rarity)}">
                            ${achievementSystem.getRarityLabel(achievement.rarity)}
                        </span>
                        <span class="achievement-points">+${achievement.points} pts</span>
                    </div>
                </div>
            `;

            achievementsList.appendChild(achievementCard);
        });
    }

    updateScoreMedalsShowcase() {
        const scoreMedalsGrid = document.getElementById('scoreMedalsGrid');
        if (!scoreMedalsGrid) return;

        scoreMedalsGrid.innerHTML = '';

        // Récupérer les médailles de score
        const scoreMedals = [
            { id: 'score_1000', threshold: 1000, icon: '🥉', name: 'Apprenti' },
            { id: 'score_5000', threshold: 5000, icon: '🥈', name: 'Disciple Appliqué' },
            { id: 'score_10000', threshold: 10000, icon: '🥇', name: 'Érudit Biblique' },
            { id: 'score_25000', threshold: 25000, icon: '🏅', name: 'Maître des Mots' },
            { id: 'score_50000', threshold: 50000, icon: '🎖️', name: 'Sage Inspiré' },
            { id: 'score_100000', threshold: 100000, icon: '🏆', name: 'Champion Légendaire' },
            { id: 'score_250000', threshold: 250000, icon: '⭐', name: 'Virtuose Divin' }
        ];

        const currentScore = achievementSystem.userAchievements.currentScore || 0;

        scoreMedals.forEach(medal => {
            const isUnlocked = achievementSystem.isUnlocked(medal.id);
            const progress = Math.min(100, (currentScore / medal.threshold) * 100);

            const medalItem = document.createElement('div');
            medalItem.className = `score-medal-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            medalItem.title = isUnlocked ? `Débloquée ! ${medal.threshold.toLocaleString()} points` : `${medal.threshold.toLocaleString()} points requis`;

            medalItem.innerHTML = `
                <div class="score-medal-icon">${isUnlocked ? medal.icon : '🔒'}</div>
                <div class="score-medal-name">${medal.name}</div>
                <div class="score-medal-requirement">${medal.threshold.toLocaleString()}</div>
                ${!isUnlocked ? `
                    <div class="score-medal-progress">
                        <div class="score-medal-progress-bar" style="width: ${progress}%"></div>
                    </div>
                ` : '<div style="color: #4caf50; font-size: 0.75em; margin-top: 5px;">✓ Débloquée</div>'}
            `;

            scoreMedalsGrid.appendChild(medalItem);
        });
    }

    updateRaceMedalsDisplay() {
        const raceMedalsGrid = document.getElementById('raceMedalsGrid');
        if (!raceMedalsGrid || typeof raceMedalSystem === 'undefined') return;

        raceMedalsGrid.innerHTML = '';
        
        const allMedals = raceMedalSystem.getAllMedals();
        const raceScore = raceMedalSystem.getRaceScore();

        // Afficher TOUTES les 112 médailles
        allMedals.forEach(medal => {
            const progress = Math.min(100, (raceScore / medal.points) * 100);
            
            const medalItem = document.createElement('div');
            medalItem.className = `race-medal-item ${medal.unlocked ? 'unlocked' : 'locked'}`;
            medalItem.title = medal.meaning;

            medalItem.innerHTML = `
                <div class="race-medal-icon">${medal.unlocked ? medal.icon : '🔒'}</div>
                <div class="race-medal-word">${medal.word}</div>
                <div class="race-medal-points">${medal.points.toLocaleString()} pts</div>
                ${!medal.unlocked ? `
                    <div class="race-medal-progress">
                        <div class="race-medal-progress-bar" style="width: ${progress}%"></div>
                    </div>
                ` : '<div class="race-medal-status">✓</div>'}
            `;

            raceMedalsGrid.appendChild(medalItem);
        });

        // Ajouter un message si toutes les médailles sont débloquées
        if (allMedals.every(m => m.unlocked)) {
            raceMedalsGrid.innerHTML = '<div class="all-medals-unlocked">🎉 Toutes les 112 médailles débloquées ! Champion !</div>';
        }
    }

    filterAchievements(filter) {
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.achievements-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Réafficher avec le filtre
        this.updateAchievementsDisplay(filter);
    }


    setupAudioControls() {
        const expand = document.getElementById('audioExpandButton');
        const panel = document.getElementById('audioControlPanel');
        const setExpanded = open => {
            panel.hidden = !open;
            expand.setAttribute('aria-expanded', String(open));
        };
        expand.addEventListener('click', () => setExpanded(panel.hidden));
        document.addEventListener('click', event => {
            if (!event.target.closest('#audioControlCompact')) setExpanded(false);
        });
        document.getElementById('audioControlCompact').addEventListener('keydown', event => {
            if (event.key === 'Escape' && !panel.hidden) {
                setExpanded(false);
                expand.focus();
            }
        });

        document.getElementById('audioToggleButton').addEventListener('click', () => {
            window.audioSystem.toggle();
            this.updateAudioControls();
        });
        document.getElementById('musicToggleButton').addEventListener('click', () => {
            window.audioSystem.toggleMusic();
            this.updateAudioControls();
        });
        this.updateAudioControls();
    }

    updateAudioControls() {
        const audio = window.audioSystem;
        const update = (id, label, enabled) => {
            const button = document.getElementById(id);
            button.textContent = label + (enabled ? ' · Oui' : ' · Non');
            button.setAttribute('aria-label', label);
            button.setAttribute('aria-pressed', String(enabled));
        };
        update('audioToggleButton', 'Effets sonores', audio.isEnabled());
        update('musicToggleButton', 'Musique', audio.musicEnabled);

        const hasSound = audio.isEnabled() && this.soundVolume > 0;
        const hasMusic = audio.musicEnabled && this.musicVolume > 0;
        const expand = document.getElementById('audioExpandButton');
        expand.textContent = hasSound ? '🔊' : hasMusic ? '🎵' : '🔇';
        expand.setAttribute('aria-label', hasSound || hasMusic ? 'Réglages audio' : 'Réglages audio, son coupé');
    }

    loadAudioSettings() {
        const audio = window.audioSystem;
        let saved;
        try {
            saved = JSON.parse(localStorage.getItem('audioSettings'));
        } catch {
            saved = null;
        }
        const percent = (value, fallback) => Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : fallback;
        this.musicVolume = percent(saved?.musicVolume, 8);
        this.soundVolume = percent(saved?.soundVolume, 18);
        document.getElementById('musicVolume').value = this.musicVolume;
        document.getElementById('soundVolume').value = this.soundVolume;
        audio.setMusicVolume(this.musicVolume / 100);
        audio.setVolume(this.soundVolume / 100);
        this.updateVolumeDisplays();
    }

    saveAudioSettings() {
        const audioData = {
            musicVolume: this.musicVolume,
            soundVolume: this.soundVolume
        };
        localStorage.setItem('audioSettings', JSON.stringify(audioData));
    }

    handleMusicVolumeChange(e) {
        this.musicVolume = parseInt(e.target.value);
        this.updateVolumeDisplays();
        this.saveAudioSettings();
        this.updateAudioControls();
        // Appliquer le volume au système audio
        if (window.audioSystem) {
            window.audioSystem.setMusicVolume(this.musicVolume / 100);
        }
    }

    handleSoundVolumeChange(e) {
        this.soundVolume = parseInt(e.target.value);
        this.updateVolumeDisplays();
        this.saveAudioSettings();
        this.updateAudioControls();
        // Appliquer le volume au système audio
        if (window.audioSystem) {
            window.audioSystem.setVolume(this.soundVolume / 100);
        }
    }

    updateVolumeDisplays() {
        const musicDisplay = document.getElementById('musicVolumeValue');
        const soundDisplay = document.getElementById('soundVolumeValue');
        if (musicDisplay) musicDisplay.textContent = `${this.musicVolume}%`;
        if (soundDisplay) soundDisplay.textContent = `${this.soundVolume}%`;
    }

    openArtistModule() {
        // Ouvrir le module artiste Emmanuel dans un nouvel onglet
        window.open('public/emmanuel-artist-module.html', '_blank');
    }

    showHint() {
        // Révéler une lettre aléatoire
        const emptyCells = [];
        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                if (!this.blocked[i][j] && this.grid[i][j] !== this.solution[i][j]) {
                    emptyCells.push([i, j]);
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const [row, col] = randomCell;
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

            // Mettre à jour uniquement le span de la lettre
            const letterSpan = cell.querySelector('.cell-letter');
            if (letterSpan) {
                letterSpan.textContent = this.solution[row][col];
            }

            cell.classList.add('correct');
            this.grid[row][col] = this.solution[row][col];
            this.score -= config.hintPenalty;
            const scoreEl = document.getElementById('infoBannerScore');
            if (scoreEl) scoreEl.textContent = Math.max(0, this.score);

            // Identifier le mot auquel appartient cette cellule et le marquer comme "révélé avec indice"
            if (this.words) {
                for (const wordData of this.words) {
                    if (wordData.path) {
                        const cellInWord = wordData.path.some(([r, c]) => r === row && c === col);
                        if (cellInWord) {
                            const wordKey = `${wordData.word}_${wordData.row}_${wordData.col}`;
                            this.wordsWithHints.add(wordKey);
                            console.log(`💡 Indice utilisé pour le mot "${wordData.word}" - Ne donnera pas de points bonus`);
                            break;
                        }
                    }
                }
            }

            // Tracker l'utilisation d'un indice pour les achievements
            this.hintsUsedThisLevel++;
            
            // Notifier les autres joueurs de l'utilisation d'un indice
            if (window.simpleChatSystem && window.simpleChatSystem.gameConnections.size > 0) {
                window.simpleChatSystem.broadcastGameAction({
                    type: 'hint_used',
                    level: this.currentLevel,
                    gameMode: this.gameMode,
                    hintsUsed: this.hintsUsedThisLevel,
                    scoreAfterHint: Math.max(0, this.score)
                });
            }
            
            // Encourager le joueur avec l'IA
            if (typeof welcomeAI !== 'undefined') {
                if (this.hintsUsedThisLevel === 1) {
                    welcomeAI.encourageOnHint();
                } else if (this.hintsUsedThisLevel === 3) {
                    // Encourager si le joueur a besoin de plusieurs indices
                    welcomeAI.encourageOnStruggle();
                }
            }

            // Vérifier si des mots sont maintenant complétés
            this.checkCompletedWords();
            
            // Vérifier si le niveau est terminé
            this.checkIfLevelComplete();

            // Sauvegarder le progrès
            this.saveGame();
        }
    }
    
    // Révéler un mot complet (utilisé par les bots IA)
    revealWord(wordIndex, noPenalty = false) {
        if (!this.words || wordIndex < 0 || wordIndex >= this.words.length) {
            console.error('❌ Index de mot invalide:', wordIndex);
            return false;
        }
        
        const wordData = this.words[wordIndex];
        const wordKey = `${wordIndex}-${wordData.word}`;
        
        // Vérifier si le mot n'est pas déjà complété
        if (this.completedWords.has(wordKey) || this.completedWords.has(wordData.word)) {
            console.log('ℹ️ Mot déjà révélé:', wordData.word);
            return false;
        }
        
        console.log(`🔓 Révélation du mot "${wordData.word}" (index: ${wordIndex})`);
        
        // Révéler toutes les lettres du mot
        if (wordData.path) {
            wordData.path.forEach(([row, col]) => {
                const letter = this.solution[row][col];
                this.grid[row][col] = letter;
                
                // Mettre à jour l'affichage
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    const letterSpan = cell.querySelector('.cell-letter');
                    if (letterSpan) {
                        letterSpan.textContent = letter;
                    }
                    cell.classList.add('correct');
                }
            });
            
            // Marquer le mot comme complété
            this.completedWords.add(wordKey);
            this.completedWords.add(wordData.word);
            
            // Appliquer la pénalité si nécessaire (pas pour les bots)
            if (!noPenalty) {
                this.score -= config.hintPenalty * wordData.word.length;
                const scoreEl = document.getElementById('infoBannerScore');
                if (scoreEl) scoreEl.textContent = Math.max(0, this.score);
            }
            
            // Vérifier si le niveau est terminé
            this.checkIfLevelComplete();
            
            return true;
        }
        
        return false;
    }

    async nextLevel() {
        const totalLevels = gameDataManager.getTotalLevels();
        if (this.currentLevel < totalLevels) {
            this.currentLevel++;
            
            // Broadcaster le changement de niveau en multijoueur
            if (window.simpleChatSystem && window.simpleChatSystem.isInRoom()) {
                window.simpleChatSystem.broadcastGameAction({
                    type: 'level_changed',
                    level: this.currentLevel,
                    score: this.score,
                    correctLetters: this.correctLettersCount,
                    totalLevels: totalLevels
                });
            }
            
            this.setupLevel();
            document.getElementById('nextLevelButton').style.display = 'none';
            document.getElementById('shareButton').style.display = 'none';
            // Sauvegarder le progrès localement
            this.saveGame();
        } else {
            // Fin du jeu
            
            // En multijoueur, comparer les scores
            if (window.simpleChatSystem && window.simpleChatSystem.isInRoom()) {
                await this.handleMultiplayerGameEnd();
                return;
            }
            
            this.savePersonalBest();

                        // Sinon, proposer de sauvegarder le score
            this.showScoreModal(this.score);
        }
    }
    
    // Gérer la fin de partie en multijoueur
    async handleMultiplayerGameEnd() {
        // Broadcaster notre score final
        window.simpleChatSystem.broadcastGameAction({
            type: 'game_completed',
            score: this.score,
            correctLetters: this.correctLettersCount,
            username: window.simpleChatSystem.currentUser
        });
        
        // Attendre 2 secondes pour recevoir les scores des autres
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Récupérer tous les scores
        const allScores = [{ 
            username: window.simpleChatSystem.currentUser, 
            score: this.score,
            correctLetters: this.correctLettersCount 
        }];
        
        // Ajouter les scores reçus des autres joueurs
        if (window.simpleChatSystem.multiplayerScores) {
            allScores.push(...window.simpleChatSystem.multiplayerScores);
        }
        
        // Trier par score décroissant
        allScores.sort((a, b) => b.score - a.score);
        
        // Déterminer le gagnant
        const winner = allScores[0];
        const isWinner = winner.username === window.simpleChatSystem.currentUser;
        
        // Afficher le classement
        let rankingHtml = '<div style="text-align: center; padding: 20px;">';
        rankingHtml += '<h2 style="color: #ff69b4; margin-bottom: 20px;">🏆 Classement Final</h2>';
        
        allScores.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            const color = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#999';
            rankingHtml += `<div style="margin: 10px 0; padding: 15px; background: linear-gradient(135deg, ${color}22 0%, ${color}11 100%); border-radius: 10px;">`;
            rankingHtml += `<span style="font-size: 24px;">${medal}</span> `;
            rankingHtml += `<strong style="color: ${color};">${player.username}</strong><br>`;
            rankingHtml += `<span style="font-size: 20px; font-weight: bold; color: #ff69b4;">${player.score} pts</span> `;
            rankingHtml += `<span style="font-size: 14px; color: #666;">📝 ${player.correctLetters || 0} lettres</span>`;
            rankingHtml += '</div>';
        });
        
        rankingHtml += '</div>';
        
        // Afficher le résultat
        if (isWinner) {
            await this.showKawaiiModal(
                `🎉 VICTOIRE ! 🎉\n\nVous avez gagné avec ${this.score} points !\n📝 ${this.correctLettersCount} lettres trouvées\n\n${rankingHtml}`,
                '👑'
            );
            window.simpleChatSystem.showMessage('🎉 Vous avez gagné la partie !', 'system');
        } else {
            await this.showKawaiiModal(
                `Partie terminée !\n\nVotre score : ${this.score} points\n📝 ${this.correctLettersCount} lettres trouvées\nGagnant : ${winner.username} (${winner.score} pts)\n\n${rankingHtml}`,
                '🏁'
            );
        }
        
        // Sauvegarder le score
        this.savePersonalBest();
    }
    
    // Broadcaster le nombre de lettres trouvées
    broadcastLettersCount() {
        if (window.simpleChatSystem && window.simpleChatSystem.isInRoom()) {
            window.simpleChatSystem.broadcastGameAction({
                type: 'letters_count_update',
                correctLetters: this.correctLettersCount,
                level: this.currentLevel
            });
        }
    }

    resetGame() {
        // CRITICAL: Effacer AVANT de reset l'UI pour éviter toute race condition
        this.clearSave();
        
        // Reset UI
        this.currentLevel = 1;
        this.score = 0;
        this.clickCount = 0;
        this.gameStarted = false;
        const scoreEl = document.getElementById('infoBannerScore');
        if (scoreEl) scoreEl.textContent = '0';
        document.getElementById('clickCount').textContent = '0';
        document.getElementById('encouragingWords').innerHTML = '';
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('nextLevelButton').style.display = 'none';
        document.getElementById('shareButton').style.display = 'none';
        document.getElementById('playButton').style.display = 'inline-block';
        this.updateUIText();
        
        console.log('♻️ Jeu réinitialisé - Prêt pour nouveau démarrage');
    }

    async handleShare() {
        try {
            const success = await shareImageGenerator.shareImage(this.currentLevel);
            if (success) {
                await this.showKawaiiModal('Image partagée avec succès ! 📤', '✨');
            }
        } catch (error) {
            console.error('Erreur lors du partage:', error);
            await this.showKawaiiModal('Une erreur est survenue lors du partage', '❌');
        }
    }

    // === MÉTHODES MULTIJOUEUR ===
    
    openMultiplayerModal() {
        document.getElementById('multiplayerModal').classList.remove('hidden');
        document.getElementById('multiplayerMenu').classList.remove('hidden');
        document.getElementById('roomCodeDisplay').classList.add('hidden');
        document.getElementById('joinRoomInput').classList.add('hidden');
    }

    // Fermer le modal multijoueur (compatible nouveau système)
    closeMultiplayerModal() {
        const modal = document.getElementById('multiplayerModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /* ===== ANCIENNES MÉTHODES MULTIJOUEUR - COMMENTÉES =====
    async createMultiplayerRoom() {
        const playerName = document.getElementById('multiplayerPlayerName').value.trim();
        if (!playerName) {
            await this.showKawaiiModal('Veuillez entrer votre nom', '⚠️');
            return;
        }

        // Initialiser le gestionnaire multijoueur
        this.multiplayerManager = new MultiplayerManager(this);
        const result = await this.multiplayerManager.createGame(playerName);

        if (result.success) {
            this.multiplayerMode = true;
            document.getElementById('multiplayerMenu').classList.add('hidden');
            document.getElementById('roomCodeDisplay').classList.remove('hidden');
            document.getElementById('roomCode').textContent = result.roomId;
        } else {
            await this.showKawaiiModal(result.message, '❌');
        }
    }

    /* ===== ANCIENNES MÉTHODES MULTIJOUEUR - OBSOLÈTES =====
     * Ces méthodes sont remplacées par le nouveau système de salles (room-system.js + room-ui.js)
     * Conservées temporairement pour référence, à supprimer plus tard
     */
    
    /*
    // Nouvelles fonctions pour le bouton flottant
    toggleMultiplayerDropdown() {
        // Vérifier si l'utilisateur est authentifié
        if (typeof authSystem !== 'undefined' && !authSystem.isAuthenticated()) {
            // Fermer le dropdown s'il est ouvert
            const dropdown = document.getElementById('multiplayerDropdown');
            dropdown.classList.add('hidden');
            
            // Afficher le modal d'authentification
            authSystem.showAuthModal();
            return;
        }

        // Utilisateur connecté : afficher le dropdown
        const dropdown = document.getElementById('multiplayerDropdown');
        dropdown.classList.toggle('hidden');
        
        // Pré-remplir et afficher les infos utilisateur
        if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated()) {
            const user = authSystem.getCurrentUser();
            const nameInput = document.getElementById('multiplayerPlayerNameFloat');
            const userInfo = document.getElementById('multiplayerUserInfo');
            
            if (user && user.username) {
                // Afficher l'info utilisateur
                if (userInfo) {
                    userInfo.textContent = `👤 ${user.username}`;
                }
                
                // Pré-remplir et désactiver l'input (au cas où il serait visible)
                if (nameInput) {
                    nameInput.value = user.username;
                    nameInput.disabled = true;
                    nameInput.style.opacity = '0.7';
                    nameInput.style.cursor = 'not-allowed';
                }
            }
        }
    }

    async createMultiplayerRoomFloat() {
        // Récupérer le username depuis authSystem
        let playerName = '';
        if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated()) {
            const user = authSystem.getCurrentUser();
            playerName = user.username || '';
        }
        
        // Fallback sur l'input si pas de username (ne devrait pas arriver)
        if (!playerName) {
            playerName = document.getElementById('multiplayerPlayerNameFloat').value.trim();
        }
        
        if (!playerName) {
            await this.showKawaiiModal('Erreur: Nom d\'utilisateur manquant', '⚠️');
            return;
        }

        // Initialiser le gestionnaire multijoueur
        this.multiplayerManager = new MultiplayerManager(this);
        const result = await this.multiplayerManager.createGame(playerName);

        if (result.success) {
            this.multiplayerMode = true;
            document.getElementById('roomCodeDisplayFloat').classList.remove('hidden');
            document.getElementById('roomCodeFloat').textContent = result.roomId;
            
            // Masquer les champs de création
            document.getElementById('createRoomBtnFloat').style.display = 'none';
            document.getElementById('multiplayerPlayerNameFloat').style.display = 'none';
            document.querySelector('.dropdown-divider').style.display = 'none';
            document.getElementById('roomCodeInputFloat').style.display = 'none';
            document.getElementById('joinRoomBtnFloat').style.display = 'none';
        } else {
            await this.showKawaiiModal(result.message, '❌');
        }
    }

    async joinMultiplayerRoomFloat() {
        // Récupérer le username depuis authSystem
        let playerName = '';
        if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated()) {
            const user = authSystem.getCurrentUser();
            playerName = user.username || '';
        }
        
        // Fallback sur l'input si pas de username (ne devrait pas arriver)
        if (!playerName) {
            playerName = document.getElementById('multiplayerPlayerNameFloat').value.trim();
        }
        
        const roomCode = document.getElementById('roomCodeInputFloat').value.trim();

        if (!playerName || !roomCode) {
            await this.showKawaiiModal('Veuillez entrer le code de la partie', '⚠️');
            return;
        }

        // Initialiser le gestionnaire multijoueur
        this.multiplayerManager = new MultiplayerManager(this);
        const result = await this.multiplayerManager.joinGame(roomCode, playerName);

        if (result.success) {
            this.multiplayerMode = true;
            document.getElementById('multiplayerDropdown').classList.add('hidden');
            await this.showKawaiiModal(result.message, '✅');
            
            // Démarrer le jeu
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('gameScreen').classList.remove('hidden');
        } else {
            await this.showKawaiiModal(result.message, '❌');
        }
    }

    copyRoomCodeFloat() {
        const roomCode = document.getElementById('roomCodeFloat').textContent;
        navigator.clipboard.writeText(roomCode).catch(err => {
            console.error('Erreur lors de la copie:', err);
        });
    }

    showJoinRoomInput() {
        document.getElementById('multiplayerMenu').classList.add('hidden');
        document.getElementById('joinRoomInput').classList.remove('hidden');
    }

    async joinMultiplayerRoom() {
        const playerName = document.getElementById('multiplayerPlayerName').value.trim();
        const roomCode = document.getElementById('roomCodeInput').value.trim();

        if (!playerName || !roomCode) {
            await this.showKawaiiModal('Veuillez entrer votre nom et le code', '⚠️');
            return;
        }

        // Initialiser le gestionnaire multijoueur
        this.multiplayerManager = new MultiplayerManager(this);
        const result = await this.multiplayerManager.joinGame(roomCode, playerName);

        if (result.success) {
            this.multiplayerMode = true;
            this.closeMultiplayerModal();
            await this.showKawaiiModal(result.message, '✅');
            
            // Démarrer le jeu
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('gameScreen').classList.remove('hidden');
        } else {
            await this.showKawaiiModal(result.message, '❌');
        }
    }

    async copyRoomCode() {
        const code = document.getElementById('roomCode').textContent;
        try {
            await navigator.clipboard.writeText(code);
            await this.showKawaiiModal('Code copié ! 📋', '✅');
        } catch (error) {
            await this.showKawaiiModal('Impossible de copier le code', '❌');
        }
    }
    */
    
    /* FIN DES MÉTHODES OBSOLÈTES MULTIJOUEUR */

}

// Initialiser le jeu quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.game = new ChristianCrosswordGame();
    console.log('✅ Jeu initialisé et exposé globalement');
    
    // Vérifier la sauvegarde après que tous les scripts soient chargés
    setTimeout(() => {
        if (window.game && typeof gameDataManager !== 'undefined') {
            window.game.checkAndAskForResumeOrRestart();
        } else {
            console.warn('⚠️ gameDataManager non chargé, impossible de restaurer');
        }
    }, 100);
});
