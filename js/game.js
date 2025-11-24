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

        // Ajouter des blasons et icônes décoratifs sur tous les bords
        const decorativeIcons = ['✝️', '🕊️', '🙏', '⛪', '📖', '💒', '🌈', '🕯️', '👼', '⭐', '💫', '🔔', '🎺'];

        // Coins
        gridContainer.dataset.decorTopLeft = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];
        gridContainer.dataset.decorBottomRight = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];

        // Créer les décorations sur les 4 côtés
        const positions = ['top', 'bottom', 'left', 'right'];
        positions.forEach(pos => {
            const decor = document.createElement('div');
            decor.className = `grid-decoration ${pos}`;
            decor.textContent = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];
            decor.style.animationDelay = `${Math.random() * 2}s`;
            gridContainer.appendChild(decor);
        });

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

                    // Créer un span pour la lettre
                    const letterSpan = document.createElement('span');
                    letterSpan.className = 'cell-letter';
                    cell.appendChild(letterSpan);

                    // Rendre la cellule focusable
                    cell.tabIndex = 0;

                    // Focus au clic
                    cell.addEventListener('click', () => {
                        cell.focus();
                    });

                    // Gérer toute la saisie clavier
                    cell.addEventListener('keydown', (e) => this.handleCellKeydown(e, i, j));
                }

                gridContainer.appendChild(cell);
            }
        }
    }

    getWordIcons() {
        // Chiffres simples en gras pour une meilleure lisibilité
        return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
    }

    handleCellKeydown(event, row, col) {
        const key = event.key;
        const cell = event.target;
        const letterSpan = cell.querySelector('.cell-letter');

        // Gestion des lettres A-Z
        if (key.length === 1 && /[a-zA-Z]/.test(key)) {
            event.preventDefault();

            const letter = key.toUpperCase();

            // Mettre à jour le span de la lettre
            if (letterSpan) {
                letterSpan.textContent = letter;
            }

            // Mettre à jour le modèle
            this.grid[row][col] = letter;

            // Vérifier si c'est correct
            if (letter === this.solution[row][col]) {
                cell.classList.add('correct');
            } else {
                cell.classList.remove('correct');
            }

            // Auto-avance
            setTimeout(() => {
                this.moveToNextCell(row, col);
            }, 50);
            return;
        }

        // Gestion du Backspace/Delete
        if (key === 'Backspace' || key === 'Delete') {
            event.preventDefault();

            // Effacer la lettre
            if (letterSpan) {
                letterSpan.textContent = '';
            }

            this.grid[row][col] = '';
            cell.classList.remove('correct');

            // Si la cellule était vide, revenir en arrière
            if (!currentValue || currentValue === '') {
                this.moveToPreviousCell(row, col);
            }
            return;
        }

        // Gestion des flèches directionnelles
        let newRow = row, newCol = col;
        switch(key) {
            case 'ArrowUp':
                newRow = Math.max(0, row - 1);
                event.preventDefault();
                break;
            case 'ArrowDown':
                newRow = Math.min(config.gridSize - 1, row + 1);
                event.preventDefault();
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, col - 1);
                event.preventDefault();
                break;
            case 'ArrowRight':
                newCol = Math.min(config.gridSize - 1, col + 1);
                event.preventDefault();
                break;
            default:
                return;
        }

        // Déplacer vers la nouvelle cellule
        const nextCell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
        if (nextCell && !this.blocked[newRow][newCol]) {
            nextCell.focus();
        }
    }

    moveToNextCell(row, col) {
        // Essayer d'abord à droite (horizontal)
        if (col + 1 < config.gridSize && !this.blocked[row][col + 1]) {
            const nextCell = document.querySelector(`[data-row="${row}"][data-col="${col + 1}"]`);
            if (nextCell) {
                nextCell.focus();
                return;
            }
        }

        // Sinon essayer en bas (vertical)
        if (row + 1 < config.gridSize && !this.blocked[row + 1][col]) {
            const nextCell = document.querySelector(`[data-row="${row + 1}"][data-col="${col}"]`);
            if (nextCell) {
                nextCell.focus();
                return;
            }
        }

        // Chercher la prochaine cellule non bloquée
        for (let i = row; i < config.gridSize; i++) {
            for (let j = (i === row ? col + 1 : 0); j < config.gridSize; j++) {
                if (!this.blocked[i][j]) {
                    const nextCell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (nextCell) {
                        nextCell.focus();
                        return;
                    }
                }
            }
        }
    }

    moveToPreviousCell(row, col) {
        // Essayer d'abord à gauche (horizontal)
        if (col - 1 >= 0 && !this.blocked[row][col - 1]) {
            const prevCell = document.querySelector(`[data-row="${row}"][data-col="${col - 1}"]`);
            if (prevCell) {
                prevCell.focus();
                return;
            }
        }

        // Sinon essayer en haut (vertical)
        if (row - 1 >= 0 && !this.blocked[row - 1][col]) {
            const prevCell = document.querySelector(`[data-row="${row - 1}"][data-col="${col}"]`);
            if (prevCell) {
                prevCell.focus();
                return;
            }
        }

        // Si aucune cellule précédente n'est disponible, chercher la cellule non bloquée précédente
        for (let i = row; i >= 0; i--) {
            for (let j = (i === row ? col - 1 : config.gridSize - 1); j >= 0; j--) {
                if (!this.blocked[i][j]) {
                    const prevCell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (prevCell) {
                        prevCell.focus();
                        return;
                    }
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
                clueElement.innerHTML = `<span class="clue-icon">${numberIcon}</span> ${wordData.clue} <span class="clue-length">(${wordData.word.length})</span>`;
                horizontalClues.appendChild(clueElement);
            } else {
                clueElement.innerHTML = `<span class="clue-icon">${numberIcon}</span> ${wordData.clue} <span class="clue-length">(${wordData.word.length})</span>`;
                verticalClues.appendChild(clueElement);
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

            // Sauvegarder l'icône si elle existe
            const iconSpan = cell.querySelector('.cell-icon');

            // Mettre à jour le contenu
            cell.textContent = '';
            if (iconSpan) {
                cell.appendChild(iconSpan);
            }
            cell.appendChild(document.createTextNode(this.solution[row][col]));

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
