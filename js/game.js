// Module principal du jeu de mots croisés
class ChristianCrosswordGame {
    constructor() {
        this.clickCount = 0;
        this.currentLevel = 1;
        this.score = 0;
        this.grid = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.solution = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.blocked = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(false));

        // Connexion cloud
        this.cloudConnected = false;
        this.cloudUser = null;

        // Charger la sauvegarde
        this.loadGame();
        this.loadCloudConnection();
        this.loadAudioSettings();

        this.initializeEventListeners();
        this.setupMenuLanguageSelector();
        this.updateUIText();
        this.updateMenuCloudButton();

        // Écouter les changements de langue
        window.addEventListener('languageChanged', () => {
            this.onLanguageChange();
        });
    }

    saveGame() {
        const saveData = {
            currentLevel: this.currentLevel,
            score: this.score,
            clickCount: this.clickCount,
            timestamp: Date.now()
        };
        localStorage.setItem('christianCrosswordSave', JSON.stringify(saveData));
    }

    loadGame() {
        const savedData = localStorage.getItem('christianCrosswordSave');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.currentLevel = data.currentLevel || 1;
                this.score = data.score || 0;
                this.clickCount = data.clickCount || 0;
            } catch (e) {
                console.error('Erreur lors du chargement de la sauvegarde:', e);
            }
        }
    }

    clearSave() {
        localStorage.removeItem('christianCrosswordSave');
    }

    initializeEventListeners() {
        document.getElementById('playButton').addEventListener('click', () => this.handlePlayButtonClick());
        document.getElementById('checkButton').addEventListener('click', () => this.checkAnswers());
        document.getElementById('hintButton').addEventListener('click', () => this.showHint());
        document.getElementById('nextLevelButton').addEventListener('click', () => this.nextLevel());
        document.getElementById('resetButton').addEventListener('click', () => this.resetGame());

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

        // Menu cloud button
        document.getElementById('menuCloudBtn').addEventListener('click', () => this.handleMenuCloudButton());

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
        if (this.cloudConnected && this.cloudUser) {
            btn.textContent = `✅ Connecté: ${this.cloudUser.name}`;
            btn.classList.add('connected');
        } else {
            btn.textContent = '☁️ Connexion Cloud';
            btn.classList.remove('connected');
        }
    }

    async showCloudDisconnectMenu() {
        await this.showKawaiiModal(
            `Connecté en tant que ${this.cloudUser.name}\n\nVos scores sont sauvegardés automatiquement.`,
            '☁️'
        );
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

        // Mettre à jour les labels
        document.querySelector('.level-info div:first-child strong').innerHTML =
            `${i18n.t('level')}: <span id="currentLevel">${this.currentLevel}</span>/${gameDataManager.getTotalLevels()}`;
        document.querySelector('.score-display').innerHTML =
            `${i18n.t('score')}: <span id="score">${this.score}</span> ${i18n.t('points')}`;

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

        // Sauvegarder le progrès
        this.saveGame();
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

    startGame() {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        this.setupLevel();
    }

    setupLevel() {
        this.clearGrid();
        const levelData = gameDataManager.getLevelData(this.currentLevel);

        if (levelData) {
            this.placeWords(levelData.words);
            this.createGrid(levelData.words);
            this.displayClues(levelData.words);
            document.getElementById('currentLevel').textContent = this.currentLevel;
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

    createGrid(words) {
        const gridContainer = document.getElementById('crosswordGrid');
        gridContainer.innerHTML = '';

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

                            // Vérifier si correct
                            if (letter === this.solution[i][j]) {
                                cell.classList.add('correct');
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

    displayClues(words) {
        const horizontalClues = document.getElementById('horizontalClues');
        const verticalClues = document.getElementById('verticalClues');

        const wordIcons = this.getWordIcons();

        horizontalClues.innerHTML = '';
        verticalClues.innerHTML = '';

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

        const percentage = (correctCells / totalCells) * 100;
        this.score += Math.round(percentage * this.currentLevel * config.basePointsMultiplier);
        document.getElementById('score').textContent = this.score;

        // Sauvegarder le progrès
        this.saveGame();

        if (percentage === 100) {
            await this.showKawaiiModal(i18n.t('congratulations'), '🎉');
            document.getElementById('nextLevelButton').style.display = 'inline-block';
        } else {
            await this.showKawaiiModal(i18n.t('progress', { percent: Math.round(percentage) }), '💪');
        }
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
            // Ajouter les points du niveau
            this.score += Math.round(100 * this.currentLevel * config.basePointsMultiplier);
            document.getElementById('score').textContent = this.score;

            // Sauvegarder automatiquement sur le cloud si connecté
            await this.saveScoreToCloud();

            // Attendre un peu pour montrer l'animation de complétion
            setTimeout(async () => {
                const totalLevels = gameDataManager.getTotalLevels();
                if (this.currentLevel < totalLevels) {
                    // Afficher un message de félicitations rapide
                    await this.showKawaiiModal(i18n.t('congratulations') + '\n' + i18n.t('nextLevel'), '🎉');
                    this.currentLevel++;
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

    handleMenuCloudButton() {
        if (this.cloudConnected) {
            // Déjà connecté - proposer de se déconnecter
            this.showCloudDisconnectMenu();
        } else {
            // Pas connecté - afficher le modal de connexion
            this.closeMenu();
            this.showCloudModal();
        }
    }

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
            document.getElementById('score').textContent = Math.max(0, this.score);

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
            // Sauvegarder le progrès
            this.saveGame();
            // Sauvegarder automatiquement sur le cloud si connecté
            await this.saveScoreToCloud();
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
            // Effacer la sauvegarde car le jeu est terminé
            this.clearSave();
        }
    }

    resetGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.clickCount = 0;
        document.getElementById('score').textContent = '0';
        document.getElementById('clickCount').textContent = '0';
        document.getElementById('encouragingWords').innerHTML = '';
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('nextLevelButton').style.display = 'none';
        document.getElementById('playButton').style.display = 'inline-block';
        this.updateUIText();

        // Effacer la sauvegarde
        this.clearSave();
    }
}

// Initialiser le jeu quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new ChristianCrosswordGame();
});
