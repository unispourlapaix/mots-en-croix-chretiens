// Module principal du jeu de mots croisés
class ChristianCrosswordGame {
    constructor() {
        this.clickCount = 0;
        this.currentLevel = 1;
        this.score = 0;          // Score de la partie en cours
        this.maxScore = 0;       // Meilleur score jamais atteint
        this.raceScore = 0;      // Score en mode course
        this.gameStarted = false;
        this.grid = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.solution = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.blocked = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(false));
        this.words = []; // Initialiser le tableau de mots

        // Tracking des performances pour achievements
        this.hintsUsedThisLevel = 0;

        // Tracking des mots complétés pour éviter les notifications répétées
        this.completedWords = new Set();

        // Connexion cloud
        this.cloudConnected = false;
        this.cloudUser = null;

        // Mode multijoueur
        this.multiplayerMode = false;
        this.multiplayerManager = null;

        // Charger la sauvegarde SEULEMENT si elle existe ET que le jeu était démarré
        this.loadGame();
        this.loadAudioSettings();

        this.initializeEventListeners();
        this.setupMenuLanguageSelector();
        this.updateUIText();

        // Écouter les changements d'authentification pour mettre à jour le bouton cloud
        if (typeof authSystem !== 'undefined') {
            authSystem.onAuthChange(async (user) => {
                this.updateMenuCloudButton();
                
                // Charger la progression cloud SEULEMENT lors de la connexion
                if (user && user.id && !this.saveCleared) {
                    console.log('🔐 Utilisateur connecté, chargement progression cloud...');
                    await this.loadProgressFromCloud();
                } else if (this.saveCleared) {
                    console.log('⏭️ Sauvegarde effacée, pas de chargement cloud');
                    this.saveCleared = false; // Réinitialiser le flag
                }
            });
        }
        this.updateMenuCloudButton();

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
        
        // Sauvegarder de manière minimale : level, score et mots complétés
        const saveData = {
            currentLevel: this.currentLevel,
            score: this.score,
            clickCount: this.clickCount,
            gameStarted: this.gameStarted,
            completedWords: Array.from(this.completedWords || []), // Mots déjà complétés
            timestamp: Date.now()
        };
        localStorage.setItem('christianCrosswordSave', JSON.stringify(saveData));
    }

    loadGame() {
        const savedData = localStorage.getItem('christianCrosswordSave');
        
        // Si pas de sauvegarde, rester en mode premier démarrage
        if (!savedData) {
            console.log('📂 Aucune sauvegarde - Première visite');
            return;
        }
        
        try {
            const data = JSON.parse(savedData);
            
            // CRITICAL: Charger SEULEMENT si le jeu était vraiment démarré
            if (!data.gameStarted) {
                console.log('📂 Sauvegarde existe mais jeu non démarré - Ignorer');
                return;
            }
            
            console.log('📂 Restauration partie en cours:', {
                level: data.currentLevel,
                score: data.score,
                completedWordsCount: data.completedWords?.length || 0
            });
                
            // Restaurer l'état du jeu
            this.currentLevel = data.currentLevel || 1;
            this.score = data.score || 0;
            this.maxScore = data.maxScore || this.score; // Utiliser maxScore sauvegardé ou score actuel
            this.raceScore = data.raceScore || 0;
            this.clickCount = data.clickCount || 0;
            this.gameStarted = true;
            this.completedWords = new Set(data.completedWords || []);
                
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
                        
                        // Compléter automatiquement les mots déjà complétés
                        this.restoreCompletedWords();
                        
                    } catch (error) {
                        console.error('❌ Erreur restauration:', error);
                        // En cas d'erreur, réinitialiser l'état et afficher l'écran de démarrage
                        this.gameStarted = false;
                        document.getElementById('startScreen').classList.remove('hidden');
                        document.getElementById('gameScreen').classList.add('hidden');
                        document.getElementById('playButton').style.display = 'inline-block';
                        // Effacer la sauvegarde corrompue
                        localStorage.removeItem('christianCrosswordSave');
                    }
                }, 100);
        } catch (e) {
            console.error('❌ Erreur chargement sauvegarde:', e);
            // En cas d'erreur de parsing, effacer la sauvegarde corrompue
            localStorage.removeItem('christianCrosswordSave');
        }
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
        
        // Effacer localStorage
        localStorage.removeItem('christianCrosswordSave');
        
        // Marquer qu'on a effacé pour éviter que le cloud recharge
        this.saveCleared = true;
        
        console.log('🗑️ Sauvegarde locale effacée - Remise à zéro complète');
        console.log('🔒 Blocage des sauvegardes activé');
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

    initializeEventListeners() {
        document.getElementById('playButton').addEventListener('click', () => this.handlePlayButtonClick());
        
        // Boutons multijoueur flottants (vérifier s'ils existent)
        const floatingBtn = document.querySelector('.multiplayer-floating-btn .floating-btn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', () => this.toggleMultiplayerDropdown());
        }
        
        const createRoomBtnFloat = document.getElementById('createRoomBtnFloat');
        if (createRoomBtnFloat) {
            createRoomBtnFloat.addEventListener('click', () => this.createMultiplayerRoomFloat());
        }
        
        const joinRoomBtnFloat = document.getElementById('joinRoomBtnFloat');
        if (joinRoomBtnFloat) {
            joinRoomBtnFloat.addEventListener('click', () => this.joinMultiplayerRoomFloat());
        }
        
        const copyCodeBtnFloat = document.getElementById('copyCodeBtnFloat');
        if (copyCodeBtnFloat) {
            copyCodeBtnFloat.addEventListener('click', () => this.copyRoomCodeFloat());
        }
        
        document.getElementById('checkButton').addEventListener('click', () => this.checkAnswers());
        document.getElementById('hintButton').addEventListener('click', () => this.showHint());
        document.getElementById('shareButton').addEventListener('click', () => this.handleShare());
        document.getElementById('nextLevelButton').addEventListener('click', () => this.nextLevel());
        document.getElementById('resetButton').addEventListener('click', () => this.resetGame());

        // Ancien multijoueur (garde pour compatibilité avec le modal existant)
        document.getElementById('createRoomBtn').addEventListener('click', () => this.createMultiplayerRoom());
        document.getElementById('joinRoomBtn').addEventListener('click', () => this.showJoinRoomInput());
        document.getElementById('connectBtn').addEventListener('click', () => this.joinMultiplayerRoom());
        document.getElementById('closeMultiplayerBtn').addEventListener('click', () => this.closeMultiplayerModal());
        document.getElementById('copyCodeBtn').addEventListener('click', () => this.copyRoomCode());

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

        // Modal de connexion cloud
        document.getElementById('cloudConnectSubmitBtn').addEventListener('click', () => this.handleCloudConnect());
        document.getElementById('cloudCancelBtn').addEventListener('click', () => this.closeCloudModal());

        // Permettre de fermer le modal cloud en cliquant sur l'overlay
        const cloudOverlay = document.querySelector('#cloudModal .kawaii-modal-overlay');
        if (cloudOverlay) {
            cloudOverlay.addEventListener('click', () => this.closeCloudModal());
        }

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

        // Boutons connexion tab
        const signInBtn = document.getElementById('signInBtn');
        if (signInBtn) {
            signInBtn.addEventListener('click', () => this.handleSignIn());
        }

        const signUpBtn = document.getElementById('signUpBtn');
        if (signUpBtn) {
            signUpBtn.addEventListener('click', () => this.handleSignUp());
        }

        const signOutProfileBtn = document.getElementById('signOutProfileBtn');
        if (signOutProfileBtn) {
            signOutProfileBtn.addEventListener('click', () => this.handleSignOut());
        }

        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.handleEditProfile());
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
        const email = document.getElementById('playerEmail').value.trim();

        if (!name || !email) {
            await this.showKawaiiModal('Veuillez remplir tous les champs', '⚠️');
            return;
        }

        // Vérifier si Supabase est configuré
        if (!supabaseScoreManager.isConfigured()) {
            await this.showKawaiiModal('Le système de score en ligne n\'est pas encore configuré', '⚠️');
            this.closeScoreModal();
            return;
        }

        this.closeScoreModal();
        await this.showKawaiiModal('Sauvegarde du score en cours...', '💾');

        const result = await supabaseScoreManager.saveScore(name, email, this.score);

        if (result.success) {
            await this.showKawaiiModal('Score sauvegardé avec succès ! 🎉', '✅');
        } else {
            await this.showKawaiiModal('Erreur lors de la sauvegarde du score', '❌');
        }
    }

    loadCloudConnection() {
        const cloudData = localStorage.getItem('cloudConnection');
        if (cloudData) {
            try {
                const data = JSON.parse(cloudData);
                this.cloudConnected = true;
                this.cloudUser = data;
            } catch (e) {
                console.error('Erreur chargement connexion cloud:', e);
            }
        }
    }

    saveCloudConnection(name, email) {
        const cloudData = { name, email, connectedAt: Date.now() };
        localStorage.setItem('cloudConnection', JSON.stringify(cloudData));
        this.cloudConnected = true;
        this.cloudUser = cloudData;
    }

    disconnectCloud() {
        localStorage.removeItem('cloudConnection');
        this.cloudConnected = false;
        this.cloudUser = null;
    }

    updateMenuCloudButton() {
        const btn = document.getElementById('menuCloudBtn');
        if (!btn) return;

        // Utiliser l'authentification Supabase au lieu du système cloud local
        if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated()) {
            const user = authSystem.getCurrentUser();
            btn.textContent = `✅ Connecté: ${user.username}`;
            btn.classList.add('connected');
        } else {
            btn.textContent = '☁️ Connexion Cloud';
            btn.classList.remove('connected');
        }
    }

    async handleMenuCloudButton() {
        // Vérifier si l'utilisateur est connecté via authSystem
        if (typeof authSystem !== 'undefined' && authSystem.isAuthenticated()) {
            const user = authSystem.getCurrentUser();
            await this.showKawaiiModal(
                `Connecté en tant que ${user.username}\n\nVos scores sont sauvegardés automatiquement.`,
                '☁️'
            );
        } else {
            // Afficher le modal d'authentification
            if (typeof authSystem !== 'undefined') {
                authSystem.showAuthModal();
            } else {
                await this.showKawaiiModal('Système d\'authentification non disponible', '⚠️');
            }
        }
    }

    showCloudModal() {
        const modal = document.getElementById('cloudModal');
        document.getElementById('cloudForm').reset();
        modal.classList.remove('hidden');
    }

    closeCloudModal() {
        const modal = document.getElementById('cloudModal');
        modal.classList.add('hidden');
    }

    async handleCloudConnect() {
        const name = document.getElementById('cloudPlayerName').value.trim();
        const email = document.getElementById('cloudPlayerEmail').value.trim();

        if (!name || !email) {
            await this.showKawaiiModal('Veuillez remplir tous les champs', '⚠️');
            return;
        }

        // Vérifier si Supabase est configuré
        if (!supabaseScoreManager.isConfigured()) {
            await this.showKawaiiModal('Le système de score en ligne n\'est pas encore configuré', '⚠️');
            this.closeCloudModal();
            return;
        }

        this.closeCloudModal();
        await this.showKawaiiModal('Connexion au cloud en cours...', '☁️');

        // Sauvegarder la connexion
        this.saveCloudConnection(name, email);
        this.updateMenuCloudButton();

        await this.showKawaiiModal(`Connecté avec succès !\n\nVos scores seront automatiquement sauvegardés en ligne.`, '✅');
    }

    async saveScoreToCloud() {
        if (!this.cloudConnected || !this.cloudUser) {
            return;
        }

        if (!supabaseScoreManager.isConfigured()) {
            return;
        }

        try {
            const result = await supabaseScoreManager.saveScore(
                this.cloudUser.name,
                this.cloudUser.email,
                this.score
            );

            if (result.success) {
                console.log('✅ Score sauvegardé automatiquement sur le cloud');
            }
        } catch (error) {
            console.error('❌ Erreur sauvegarde cloud:', error);
        }
    }

    // Nouvelle méthode pour sauvegarder la progression complète
    async saveProgressToCloud() {
        // Vérifier si l'utilisateur est authentifié
        if (typeof authSystem === 'undefined' || !authSystem.currentUser) {
            return;
        }

        try {
            console.log('☁️ Sauvegarde cloud...');
            const result = await supabaseScoreManager.saveProgress(
                authSystem.currentUser.id,
                authSystem.currentUser.username,
                this.currentLevel,
                this.score,        // Score actuel
                this.maxScore,     // Meilleur score
                this.raceScore     // Score de course
            );

            if (result.success) {
                // Mettre à jour maxScore local si le cloud a un meilleur
                if (result.maxScore && result.maxScore > this.maxScore) {
                    this.maxScore = result.maxScore;
                }
                console.log('✅ Progression sauvegardée dans le cloud');
            }
        } catch (error) {
            console.error('❌ Erreur sauvegarde progression:', error);
        }
    }

    // Charger la progression depuis le cloud
    async loadProgressFromCloud() {
        if (typeof authSystem === 'undefined' || !authSystem.currentUser) {
            return false;
        }

        try {
            const result = await supabaseScoreManager.loadProgress(authSystem.currentUser.id);

            if (result.success) {
                // Comparer avec la sauvegarde locale
                const localSave = localStorage.getItem('christianCrosswordSave');
                const localData = localSave ? JSON.parse(localSave) : null;

                // Si sauvegarde vient d'être effacée, ne pas charger le cloud
                if (this.saveCleared) {
                    console.log('⏭️ Sauvegarde locale effacée, ignorer cloud');
                    return false;
                }

                // Utiliser la progression la plus avancée
                if (!localData || result.level > localData.currentLevel || result.score > localData.score) {
                    this.currentLevel = result.level;
                    this.score = result.score;
                    this.maxScore = Math.max(result.maxScore || 0, localData?.maxScore || 0);
                    this.raceScore = result.raceScore || 0;
                    console.log('✅ Progression chargée depuis le cloud:', { 
                        level: result.level, 
                        score: result.score,
                        maxScore: this.maxScore,
                        raceScore: this.raceScore
                    });
                    
                    // Mettre à jour le localStorage aussi
                    this.saveGame();
                    return true;
                } else {
                    // Même si on ne charge pas tout, prendre le meilleur maxScore
                    const cloudMaxScore = result.maxScore || 0;
                    if (cloudMaxScore > this.maxScore) {
                        this.maxScore = cloudMaxScore;
                        console.log('⬆️ maxScore mis à jour depuis le cloud:', this.maxScore);
                    }
                    console.log('ℹ️ Sauvegarde locale plus récente, pas de chargement cloud');
                }
            }
        } catch (error) {
            console.error('❌ Erreur chargement progression:', error);
        }

        return false;
    }

    setupMenuLanguageSelector() {
        const container = document.getElementById('menuLanguageSelector');
        if (!container) return;

        const languages = i18n.getAvailableLanguages();
        languages.forEach(lang => {
            const btn = document.createElement('button');
            btn.className = 'language-btn';
            btn.textContent = i18n.getLanguageName(lang);
            btn.dataset.lang = lang;

            if (lang === i18n.getLanguage()) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', () => {
                this.changeLanguage(lang);
                this.updateMenuLanguageButtons();
            });
            container.appendChild(btn);
        });
    }

    updateMenuLanguageButtons() {
        const currentLang = i18n.getLanguage();
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

        // Section Cloud
        const cloudTitle = document.querySelector('.menu-section h3');
        if (cloudTitle) cloudTitle.textContent = i18n.t('menuCloudTitle');
        const cloudBtn = document.getElementById('menuCloudBtn');
        if (cloudBtn) cloudBtn.textContent = i18n.t('menuCloudButton');
        const cloudDesc = document.querySelector('.menu-description');
        if (cloudDesc) cloudDesc.textContent = i18n.t('menuCloudDescription');

        // Section Langue
        const sections = document.querySelectorAll('.menu-section');
        if (sections[1]) {
            const langTitle = sections[1].querySelector('h3');
            if (langTitle) langTitle.textContent = i18n.t('menuLanguageTitle');
        }

        // Section Audio
        if (sections[2]) {
            const audioTitle = sections[2].querySelector('h3');
            if (audioTitle) audioTitle.textContent = i18n.t('menuAudioTitle');
            const musicLabel = sections[2].querySelector('label[for="musicVolume"]');
            if (musicLabel) musicLabel.textContent = i18n.t('menuMusicLabel');
            const soundLabel = sections[2].querySelector('label[for="soundVolume"]');
            if (soundLabel) soundLabel.textContent = i18n.t('menuSoundLabel');
        }

        // Section À propos
        if (sections[3]) {
            const aboutTitle = sections[3].querySelector('h3');
            if (aboutTitle) aboutTitle.textContent = i18n.t('menuAboutTitle');

            const aboutItems = sections[3].querySelectorAll('.about-item strong');
            if (aboutItems[0]) aboutItems[0].textContent = i18n.t('menuArtistLabel');
            if (aboutItems[1]) aboutItems[1].textContent = i18n.t('menuCreationLabel');
            if (aboutItems[2]) aboutItems[2].textContent = i18n.t('menuCodingLabel');

            const artistLink = document.getElementById('artistLink');
            if (artistLink) artistLink.textContent = i18n.t('menuArtistLink');

            const creationText = sections[3].querySelectorAll('.about-item')[1];
            if (creationText) {
                const textNode = Array.from(creationText.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                if (textNode) textNode.textContent = ' ' + i18n.t('menuCreationText');
            }

            const codingText = sections[3].querySelectorAll('.about-item')[2];
            if (codingText) {
                const textNode = Array.from(codingText.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                if (textNode) textNode.textContent = ' ' + i18n.t('menuCodingText');
            }
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

        const playerEmailInput = document.getElementById('playerEmail');
        if (playerEmailInput) playerEmailInput.placeholder = i18n.t('modalEmailPlaceholder');

        const saveScoreBtn = document.getElementById('saveScoreBtn');
        if (saveScoreBtn) saveScoreBtn.textContent = i18n.t('modalSaveButton');

        const skipScoreBtn = document.getElementById('skipScoreBtn');
        if (skipScoreBtn) skipScoreBtn.textContent = i18n.t('modalSkipButton');

        // Modal cloud
        const cloudModal = document.querySelector('#cloudModal .kawaii-modal-body');
        if (cloudModal) {
            const paragraphs = cloudModal.querySelectorAll('p');
            if (paragraphs[0]) {
                paragraphs[0].innerHTML = `<strong>${i18n.t('modalCloudTitle')}</strong>`;
            }
            if (paragraphs[1]) {
                paragraphs[1].textContent = i18n.t('modalCloudDescription');
            }
        }

        // Placeholders et boutons du modal cloud
        const cloudPlayerNameInput = document.getElementById('cloudPlayerName');
        if (cloudPlayerNameInput) cloudPlayerNameInput.placeholder = i18n.t('modalNamePlaceholder');

        const cloudPlayerEmailInput = document.getElementById('cloudPlayerEmail');
        if (cloudPlayerEmailInput) cloudPlayerEmailInput.placeholder = i18n.t('modalEmailPlaceholder');

        const cloudConnectBtn = document.getElementById('cloudConnectSubmitBtn');
        if (cloudConnectBtn) cloudConnectBtn.textContent = i18n.t('modalConnectButton');

        const cloudCancelBtn = document.getElementById('cloudCancelBtn');
        if (cloudCancelBtn) cloudCancelBtn.textContent = i18n.t('modalCancelButton');
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

    async startGame() {
        this.gameStarted = true;
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        
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
        
        this.setupLevel();
        this.saveGame();
    }

    setupLevel() {
        this.clearGrid();

        // Réinitialiser le compteur d'indices pour le nouveau niveau
        this.hintsUsedThisLevel = 0;

        // Réinitialiser le tracking des mots complétés
        this.completedWords = new Set();

        const levelData = gameDataManager.getLevelData(this.currentLevel);

        if (levelData) {
            // Sauvegarder les mots du niveau pour pouvoir les restaurer
            this.words = levelData.words;
            
            this.placeWords(levelData.words);
            this.createGrid(levelData.words);
            this.displayClues(levelData.words);
            const currentLevelEl = document.getElementById('infoBannerLevel');
            if (currentLevelEl) currentLevelEl.textContent = this.currentLevel;
        }
    }

    clearGrid() {
        this.grid = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.solution = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.blocked = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(false));
    }

    placeWords(words) {
        words.forEach(wordData => {
            const { word, path, start, direction } = wordData;

            // Support des mots coudés avec path (nouveau système)
            if (path && Array.isArray(path)) {
                for (let i = 0; i < word.length && i < path.length; i++) {
                    const [row, col] = path[i];
                    this.solution[row][col] = word[i];
                }
            }
            // Support des mots droits (ancien système pour compatibilité)
            else if (start && direction) {
                const [row, col] = start;
                for (let i = 0; i < word.length; i++) {
                    if (direction === 'horizontal') {
                        this.solution[row][col + i] = word[i];
                    } else {
                        this.solution[row + i][col] = word[i];
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

                    // Créer un span visible pour afficher la lettre
                    const letterSpan = document.createElement('span');
                    letterSpan.className = 'cell-letter';
                    cell.appendChild(letterSpan);

                    // Créer un input transparent pour la saisie
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.className = 'cell-input';
                    input.autocomplete = 'off';
                    input.autocorrect = 'off';
                    input.autocapitalize = 'characters';
                    cell.appendChild(input);

                    // Gérer le focus
                    input.addEventListener('focus', () => {
                        document.querySelectorAll('.cell.focused').forEach(c => c.classList.remove('focused'));
                        cell.classList.add('focused');
                    });

                    input.addEventListener('blur', () => {
                        cell.classList.remove('focused');
                    });

                    // Gérer l'input
                    input.addEventListener('input', (e) => {
                        const letter = e.target.value.toUpperCase();
                        if (letter && /[A-Z]/.test(letter)) {
                            letterSpan.textContent = letter;
                            this.grid[i][j] = letter;

                            // Envoyer la mise à jour en multijoueur
                            if (this.multiplayerMode && this.multiplayerManager) {
                                this.multiplayerManager.sendCellUpdate(i, j, letter);
                            }

                            // Vérifier si correct
                            if (letter === this.solution[i][j]) {
                                cell.classList.add('correct');
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
                                this.checkIfLevelComplete();
                            }, 50);
                        }
                    });

                    // Gérer les touches spéciales
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Backspace' || e.key === 'Delete') {
                            e.preventDefault();
                            const currentValue = this.grid[i][j];

                            letterSpan.textContent = '';
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
        // Essayer d'abord à droite (horizontal)
        if (col + 1 < config.gridSize && !this.blocked[row][col + 1]) {
            this.moveTo(row, col + 1);
            return;
        }

        // Sinon essayer en bas (vertical)
        if (row + 1 < config.gridSize && !this.blocked[row + 1][col]) {
            this.moveTo(row + 1, col);
            return;
        }

        // Chercher la prochaine cellule non bloquée
        for (let i = row; i < config.gridSize; i++) {
            for (let j = (i === row ? col + 1 : 0); j < config.gridSize; j++) {
                if (!this.blocked[i][j]) {
                    this.moveTo(i, j);
                    return;
                }
            }
        }
    }

    moveToPreviousCell(row, col) {
        // Essayer d'abord à gauche (horizontal)
        if (col - 1 >= 0 && !this.blocked[row][col - 1]) {
            this.moveTo(row, col - 1);
            return;
        }

        // Sinon essayer en haut (vertical)
        if (row - 1 >= 0 && !this.blocked[row - 1][col]) {
            this.moveTo(row - 1, col);
            return;
        }

        // Si aucune cellule précédente n'est disponible, chercher la cellule non bloquée précédente
        for (let i = row; i >= 0; i--) {
            for (let j = (i === row ? col - 1 : config.gridSize - 1); j >= 0; j--) {
                if (!this.blocked[i][j]) {
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
                    if (this.grid[i][j] === this.solution[i][j]) {
                        correctCells++;
                    }
                }
            }
        }

        // Vérifier les mots complets
        const levelData = gameDataManager.getLevelData(this.currentLevel);
        if (levelData && levelData.words) {
            levelData.words.forEach(wordData => {
                let wordComplete = true;
                if (wordData.path) {
                    for (let i = 0; i < wordData.word.length && i < wordData.path.length; i++) {
                        const [row, col] = wordData.path[i];
                        if (this.grid[row][col] !== wordData.word[i]) {
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
        this.score += totalPoints;
        const scoreEl = document.getElementById('infoBannerScore');
        if (scoreEl) scoreEl.textContent = this.score;

        // Mettre à jour le score dans le système d'achievements
        if (window.achievementSystem) {
            window.achievementSystem.updateScore(this.score);
        }

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
    checkCompletedWords() {
        const levelData = gameDataManager.getLevelData(this.currentLevel);
        if (!levelData || !levelData.words) return;

        // Vérifier chaque mot
        levelData.words.forEach(wordData => {
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
                    if (this.grid[row][col] !== wordData.word[i]) {
                        wordComplete = false;
                        break;
                    }
                }
            }

            // Si le mot vient d'être complété
            if (wordComplete) {
                this.completedWords.add(wordKey);
                
                // Ajouter les points bonus
                const wordBonus = 50;
                this.score += wordBonus;
                const scoreEl = document.getElementById('infoBannerScore');
                if (scoreEl) scoreEl.textContent = this.score;

                // Mettre à jour le score dans le système d'achievements
                if (window.achievementSystem) {
                    window.achievementSystem.updateScore(this.score);
                }

                // Notifier dans le chat
                if (typeof window.simpleChatSystem !== 'undefined') {
                    window.simpleChatSystem.showMessage(`✨ Mot complété : "${wordData.word}" ! +${wordBonus} pts`, 'system');
                }
                
                // Sauvegarder automatiquement après chaque mot complété
                console.log('💾 Sauvegarde auto (mot complété):', wordData.word);
                this.saveGame();
                
                // Sauvegarder aussi la progression dans le cloud (level + score uniquement)
                this.saveProgressToCloud();

                // Animation visuelle sur les cellules du mot
                if (wordData.path) {
                    wordData.path.forEach(([row, col]) => {
                        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                        if (cell) {
                            cell.classList.add('word-completed');
                            setTimeout(() => {
                                cell.classList.remove('word-completed');
                            }, 1000);
                        }
                    });
                }
            }
        });
    }

    async checkIfLevelComplete() {
        // Vérifier si toutes les cellules sont correctement remplies
        let allCorrect = true;
        let totalCells = 0;

        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                if (!this.blocked[i][j]) {
                    totalCells++;
                    // Vérifier si la cellule est remplie et correcte
                    if (this.grid[i][j] === '' || this.grid[i][j] !== this.solution[i][j]) {
                        allCorrect = false;
                        break;
                    }
                }
            }
            if (!allCorrect) break;
        }

        // Si tout est correct, passer au niveau suivant automatiquement
        if (allCorrect && totalCells > 0) {
            // Féliciter le joueur avec l'IA
            if (typeof welcomeAI !== 'undefined') {
                welcomeAI.congratulate();
            }
            
            // Ajouter les points du niveau
            const bonusPoints = Math.round(100 * this.currentLevel * config.basePointsMultiplier);
            this.score += bonusPoints;
            const scoreEl = document.getElementById('infoBannerScore');
            if (scoreEl) scoreEl.textContent = this.score;

            // Mettre à jour le score dans le système d'achievements
            if (window.achievementSystem) {
                window.achievementSystem.updateScore(this.score);
            }

            // Notifier dans le chat
            if (typeof window.simpleChatSystem !== 'undefined') {
                window.simpleChatSystem.showMessage(`🏆 Niveau ${this.currentLevel} terminé ! +${bonusPoints} points bonus`, 'system');
            }

            // Sauvegarder automatiquement sur le cloud si connecté
            await this.saveScoreToCloud();

            // Attendre un peu pour montrer l'animation de complétion
            setTimeout(async () => {
                const totalLevels = gameDataManager.getTotalLevels();
                if (this.currentLevel < totalLevels) {
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
                    // Fin du jeu
                    if (this.cloudConnected) {
                        // Si connecté au cloud, juste afficher un message de félicitations
                        await this.showKawaiiModal(
                            `🎉 Félicitations ! Vous avez terminé tous les niveaux !\n\nScore final: ${this.score} points\n\n✅ Score sauvegardé automatiquement sur le cloud`,
                            '🏆'
                        );
                    } else {
                        // Sinon, proposer de sauvegarder le score
                        this.showScoreModal(this.score);
                    }
                    // Effacer la sauvegarde car le jeu est terminé
                    this.clearSave();
                }
            }, 500);
        }
    }

    // Menu functions
    openMenu() {
        const modal = document.getElementById('menuModal');
        modal.classList.remove('hidden');
    }

    closeMenu() {
        const modal = document.getElementById('menuModal');
        modal.classList.add('hidden');
    }

    openAchievements() {
        const modal = document.getElementById('achievementsModal');
        this.updateAchievementsDisplay();
        modal.classList.remove('hidden');
        this.closeMenu();
    }

    closeAchievements() {
        const modal = document.getElementById('achievementsModal');
        modal.classList.add('hidden');
    }

    updateAchievementsDisplay(filter = 'all') {
        const stats = achievementSystem.getGlobalStats();

        // Mettre à jour les stats globales
        document.getElementById('achievementCount').textContent =
            `${stats.unlockedAchievements}/${stats.totalAchievements}`;
        document.getElementById('achievementPoints').textContent = stats.totalPoints;
        document.getElementById('completionPercent').textContent = `${stats.completionPercentage}%`;

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

    filterAchievements(filter) {
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.achievements-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Réafficher avec le filtre
        this.updateAchievementsDisplay(filter);
    }

    // Méthode handleMenuCloudButton maintenant définie plus haut dans la classe
    // (ligne ~283 - utilise authSystem au lieu de cloudConnected)

    // Audio settings
    loadAudioSettings() {
        const audioData = localStorage.getItem('audioSettings');
        if (audioData) {
            try {
                const data = JSON.parse(audioData);
                this.musicVolume = data.musicVolume !== undefined ? data.musicVolume : 50;
                this.soundVolume = data.soundVolume !== undefined ? data.soundVolume : 50;
            } catch (e) {
                console.error('Erreur chargement audio:', e);
                this.musicVolume = 50;
                this.soundVolume = 50;
            }
        } else {
            this.musicVolume = 50;
            this.soundVolume = 50;
        }

        // Mettre à jour les sliders
        setTimeout(() => {
            const musicSlider = document.getElementById('musicVolume');
            const soundSlider = document.getElementById('soundVolume');
            if (musicSlider) musicSlider.value = this.musicVolume;
            if (soundSlider) soundSlider.value = this.soundVolume;
            this.updateVolumeDisplays();
        }, 100);
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
    }

    handleSoundVolumeChange(e) {
        this.soundVolume = parseInt(e.target.value);
        this.updateVolumeDisplays();
        this.saveAudioSettings();
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

            // Tracker l'utilisation d'un indice pour les achievements
            this.hintsUsedThisLevel++;
            
            // Encourager le joueur avec l'IA
            if (typeof welcomeAI !== 'undefined') {
                if (this.hintsUsedThisLevel === 1) {
                    welcomeAI.encourageOnHint();
                } else if (this.hintsUsedThisLevel === 3) {
                    // Encourager si le joueur a besoin de plusieurs indices
                    welcomeAI.encourageOnStruggle();
                }
            }

            // Sauvegarder le progrès
            this.saveGame();
        }
    }

    async nextLevel() {
        const totalLevels = gameDataManager.getTotalLevels();
        if (this.currentLevel < totalLevels) {
            this.currentLevel++;
            this.setupLevel();
            document.getElementById('nextLevelButton').style.display = 'none';
            document.getElementById('shareButton').style.display = 'none';
            // Sauvegarder le progrès localement
            this.saveGame();
            // Sauvegarder la progression dans le cloud (level + score uniquement)
            await this.saveProgressToCloud();
        } else {
            // Fin du jeu
            // Sauvegarder automatiquement sur le cloud si connecté
            await this.saveScoreToCloud();

            if (this.cloudConnected) {
                // Si connecté au cloud, juste afficher un message de félicitations
                await this.showKawaiiModal(
                    `🎉 Félicitations ! Vous avez terminé tous les niveaux !\n\nScore final: ${this.score} points\n\n✅ Score sauvegardé automatiquement sur le cloud`,
                    '🏆'
                );
            } else {
                // Sinon, proposer de sauvegarder le score
                this.showScoreModal(this.score);
            }
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

    closeMultiplayerModal() {
        document.getElementById('multiplayerModal').classList.add('hidden');
    }

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
        navigator.clipboard.writeText(roomCode).then(() => {
            this.showKawaiiModal('Code copié ! 📋', '✅');
        }).catch(err => {
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

    // Gestion de la connexion
    async handleSignIn() {
        const username = document.getElementById('authUsername').value.trim();
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value.trim();

        if (!email || !password) {
            await this.showKawaiiModal('Veuillez remplir tous les champs', '⚠️');
            return;
        }

        if (typeof authSystem !== 'undefined') {
            const result = await authSystem.signIn(email, password);
            if (result.success) {
                await this.showKawaiiModal('Connexion réussie ! 🎉', '✅');
                if (typeof menuTabSystem !== 'undefined') {
                    menuTabSystem.updateConnexionTab();
                }
            } else {
                await this.showKawaiiModal(result.message || 'Erreur de connexion', '❌');
            }
        }
    }

    async handleSignUp() {
        const username = document.getElementById('authUsername').value.trim();
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value.trim();

        if (!username || !email || !password) {
            await this.showKawaiiModal('Veuillez remplir tous les champs', '⚠️');
            return;
        }

        if (typeof authSystem !== 'undefined') {
            const result = await authSystem.signUp(email, password, username);
            if (result.success) {
                await this.showKawaiiModal('Compte créé ! 🎉 Vérifiez votre email.', '✅');
                if (typeof menuTabSystem !== 'undefined') {
                    menuTabSystem.updateConnexionTab();
                }
            } else {
                await this.showKawaiiModal(result.message || 'Erreur lors de la création', '❌');
            }
        }
    }

    async handleSignOut() {
        if (typeof authSystem !== 'undefined') {
            const result = await authSystem.signOut();
            if (result.success) {
                await this.showKawaiiModal('Déconnexion réussie', '👋');
                if (typeof menuTabSystem !== 'undefined') {
                    menuTabSystem.updateConnexionTab();
                }
            }
        }
    }

    async handleEditProfile() {
        const newUsername = prompt('Nouveau pseudo:');
        if (newUsername && newUsername.trim() && typeof authSystem !== 'undefined') {
            const result = await authSystem.updateUsername(newUsername.trim());
            if (result.success) {
                await this.showKawaiiModal('Pseudo mis à jour ! ✨', '✅');
                if (typeof menuTabSystem !== 'undefined') {
                    menuTabSystem.updateConnexionTab();
                }
            } else {
                await this.showKawaiiModal(result.message || 'Erreur lors de la modification', '❌');
            }
        }
    }
}

// Initialiser le jeu quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.game = new ChristianCrosswordGame();
    console.log('✅ Jeu initialisé et exposé globalement');
});
