// Module principal du jeu de mots croisés
class ChristianCrosswordGame {
    constructor() {
        this.clickCount = 0;
        this.currentLevel = 1;
        this.score = 0;
        this.grid = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.solution = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(''));
        this.blocked = Array(config.gridSize).fill().map(() => Array(config.gridSize).fill(false));
        
        this.initializeEventListeners();
        this.setupLanguageSelector();
        this.updateUIText();
        
        // Écouter les changements de langue
        window.addEventListener('languageChanged', () => {
            this.onLanguageChange();
        });
    }

    initializeEventListeners() {
        document.getElementById('playButton').addEventListener('click', () => this.handlePlayButtonClick());
        document.getElementById('checkButton').addEventListener('click', () => this.checkAnswers());
        document.getElementById('hintButton').addEventListener('click', () => this.showHint());
        document.getElementById('nextLevelButton').addEventListener('click', () => this.nextLevel());
        document.getElementById('resetButton').addEventListener('click', () => this.resetGame());
    }

    setupLanguageSelector() {
        const container = document.getElementById('languageSelector');
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
            
            btn.addEventListener('click', () => this.changeLanguage(lang));
            container.appendChild(btn);
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
        
        // Mettre à jour les titres des sections
        const horizontalTitle = document.querySelector('#horizontalClues').previousElementSibling;
        if (horizontalTitle) horizontalTitle.textContent = i18n.t('horizontal');
        
        const verticalTitle = document.querySelector('#verticalClues').previousElementSibling;
        if (verticalTitle) verticalTitle.textContent = i18n.t('vertical');
        
        // Mettre à jour les labels
        document.querySelector('.level-info div:first-child strong').innerHTML = 
            `${i18n.t('level')}: <span id="currentLevel">${this.currentLevel}</span>/${gameDataManager.getTotalLevels()}`;
        document.querySelector('.score-display').innerHTML = 
            `${i18n.t('score')}: <span id="score">${this.score}</span> ${i18n.t('points')}`;
    }

    handlePlayButtonClick() {
        this.clickCount++;
        document.getElementById('clickCount').textContent = this.clickCount;
        
        if (this.clickCount <= config.maxEncouragingWords) {
            this.showEncouragingWord(this.clickCount - 1);
        }
        
        if (this.clickCount === config.maxEncouragingWords) {
            setTimeout(() => {
                this.startGame();
            }, config.levelTransitionDelay);
        }
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
            this.createGrid();
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
            const { word, start, direction } = wordData;
            const [row, col] = start;
            
            for (let i = 0; i < word.length; i++) {
                if (direction === 'horizontal') {
                    this.solution[row][col + i] = word[i];
                } else {
                    this.solution[row + i][col] = word[i];
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

    createGrid() {
        const gridContainer = document.getElementById('crosswordGrid');
        gridContainer.innerHTML = '';
        
        // Ajouter des blasons décoratifs
        const decorativeIcons = ['✝️', '🕊️', '🙏', '⛪', '📖', '💒', '🌈', '🕯️'];
        gridContainer.dataset.decorTop = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];
        gridContainer.dataset.decorBottom = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];
        gridContainer.dataset.decorLeft = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];
        gridContainer.dataset.decorRight = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];

        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                if (this.blocked[i][j]) {
                    cell.classList.add('blocked');
                } else {
                    cell.contentEditable = true;
                    cell.addEventListener('input', (e) => this.handleCellInput(e, i, j));
                    cell.addEventListener('keydown', (e) => this.handleKeyNavigation(e, i, j));
                }

                gridContainer.appendChild(cell);
            }
        }
    }

    handleCellInput(event, row, col) {
        const value = event.target.textContent.toUpperCase();
        if (value.length > 1) {
            event.target.textContent = value.slice(-1);
        }
        this.grid[row][col] = event.target.textContent.toUpperCase();
        
        if (this.grid[row][col] === this.solution[row][col]) {
            event.target.classList.add('correct');
        }
    }

    handleKeyNavigation(event, row, col) {
        const key = event.key;
        let newRow = row, newCol = col;

        switch(key) {
            case 'ArrowUp': newRow = Math.max(0, row - 1); break;
            case 'ArrowDown': newRow = Math.min(config.gridSize - 1, row + 1); break;
            case 'ArrowLeft': newCol = Math.max(0, col - 1); break;
            case 'ArrowRight': newCol = Math.min(config.gridSize - 1, col + 1); break;
            default: return;
        }

        event.preventDefault();
        const nextCell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
        if (nextCell && !this.blocked[newRow][newCol]) {
            nextCell.focus();
        }
    }

    displayClues(words) {
        const horizontalClues = document.getElementById('horizontalClues');
        const verticalClues = document.getElementById('verticalClues');
        
        // Icônes kawaii pour les indices
        const icons = ['💝', '🌸', '✨', '🌟', '💕', '🦋', '🌺', '🎀'];
        
        horizontalClues.innerHTML = '';
        verticalClues.innerHTML = '';

        let hIndex = 0;
        let vIndex = 0;
        
        words.forEach((wordData) => {
            const clueElement = document.createElement('div');
            clueElement.className = 'clue';
            
            if (wordData.direction === 'horizontal') {
                const icon = icons[hIndex % icons.length];
                clueElement.innerHTML = `<span class="clue-icon">${icon}</span> ${wordData.clue} <span class="clue-length">(${wordData.word.length})</span>`;
                horizontalClues.appendChild(clueElement);
                hIndex++;
            } else {
                const icon = icons[vIndex % icons.length];
                clueElement.innerHTML = `<span class="clue-icon">${icon}</span> ${wordData.clue} <span class="clue-length">(${wordData.word.length})</span>`;
                verticalClues.appendChild(clueElement);
                vIndex++;
            }
        });
    }

    checkAnswers() {
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

        if (percentage === 100) {
            alert(i18n.t('congratulations'));
            document.getElementById('nextLevelButton').style.display = 'inline-block';
        } else {
            alert(i18n.t('progress', { percent: Math.round(percentage) }));
        }
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
            cell.textContent = this.solution[row][col];
            cell.classList.add('correct');
            this.grid[row][col] = this.solution[row][col];
            this.score -= config.hintPenalty;
            document.getElementById('score').textContent = Math.max(0, this.score);
        }
    }

    nextLevel() {
        const totalLevels = gameDataManager.getTotalLevels();
        if (this.currentLevel < totalLevels) {
            this.currentLevel++;
            this.setupLevel();
            document.getElementById('nextLevelButton').style.display = 'none';
        } else {
            alert(i18n.t('finalScore', { score: this.score }));
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
        this.updateUIText();
    }
}

// Initialiser le jeu quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new ChristianCrosswordGame();
});
