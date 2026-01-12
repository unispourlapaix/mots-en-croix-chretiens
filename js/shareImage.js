// Module de génération d'images de partage
class ShareImageGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 1080;  // Format Instagram/Square optimal
        this.height = 1080;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    // Utiliser la base de données de citations
    getBibleQuote(level) {
        // Si biblicalQuotes est disponible (depuis biblicalQuotes.js)
        if (typeof getQuoteForLevel !== 'undefined') {
            return getQuoteForLevel(level);
        }

        // Fallback minimal
        return {
            text: "Je puis tout par celui qui me fortifie",
            ref: "Philippiens 4:13",
            theme: "Force"
        };
    }

    // Dessiner un dégradé doux et inspirant
    drawBackground(style = 'soft') {
        if (style === 'soft') {
            // Dégradé doux rose-bleu
            const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
            gradient.addColorStop(0, '#fff5f9');
            gradient.addColorStop(0.3, '#ffe6f0');
            gradient.addColorStop(0.6, '#f0f8ff');
            gradient.addColorStop(1, '#e6f2ff');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else if (style === 'morning') {
            // Dégradé aube matinale
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#ffeaa7');
            gradient.addColorStop(0.4, '#fab1a0');
            gradient.addColorStop(0.7, '#ff7675');
            gradient.addColorStop(1, '#fd79a8');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else if (style === 'peace') {
            // Dégradé paisible
            const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
            gradient.addColorStop(0, '#dfe6e9');
            gradient.addColorStop(0.5, '#b2bec3');
            gradient.addColorStop(1, '#74b9ff');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else if (style === 'christmas') {
            // Noël - Rouge, vert, or
            const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
            gradient.addColorStop(0, '#fef9e7');
            gradient.addColorStop(0.3, '#ffe4e1');
            gradient.addColorStop(0.6, '#ffebee');
            gradient.addColorStop(1, '#e8f5e9');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else if (style === 'easter') {
            // Pâques - Pastels doux, renaissance
            const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
            gradient.addColorStop(0, '#fff9e6');
            gradient.addColorStop(0.3, '#ffe6f0');
            gradient.addColorStop(0.6, '#e6f7ff');
            gradient.addColorStop(1, '#f0fff4');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else if (style === 'advent') {
            // Avent - Violet, attente
            const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
            gradient.addColorStop(0, '#f3e5f5');
            gradient.addColorStop(0.4, '#e1bee7');
            gradient.addColorStop(0.7, '#ce93d8');
            gradient.addColorStop(1, '#ba68c8');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else if (style === 'pentecost') {
            // Pentecôte - Rouge feu, Esprit Saint
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#fff3e0');
            gradient.addColorStop(0.3, '#ffccbc');
            gradient.addColorStop(0.6, '#ff8a65');
            gradient.addColorStop(1, '#ff7043');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Ajouter des décorations saisonnières spécifiques
        this.drawSeasonalDecorations(style);

        // Ajouter des formes géométriques kawaii (si pas saisonnier)
        if (!['christmas', 'easter', 'advent', 'pentecost'].includes(style)) {
            this.drawGeometricShapes();
        }

        // Ajouter une légère texture
        this.drawTexture();
    }

    // Dessiner des décorations saisonnières
    drawSeasonalDecorations(style) {
        if (style === 'christmas') {
            this.drawChristmasDecorations();
        } else if (style === 'easter') {
            this.drawEasterDecorations();
        } else if (style === 'advent') {
            this.drawAdventDecorations();
        } else if (style === 'pentecost') {
            this.drawPentecostDecorations();
        }
    }

    // Décorations de Noël
    drawChristmasDecorations() {
        this.ctx.globalAlpha = 0.15;

        // Flocons de neige
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            this.drawSnowflake(x, y, 15 + Math.random() * 10);
        }

        // Étoiles dorées
        this.ctx.fillStyle = '#ffd700';
        this.drawStar(this.width / 2, 100, 6, 40, 20);
        this.drawStar(150, 200, 6, 25, 12);
        this.drawStar(this.width - 150, 250, 6, 30, 15);

        // Boules de Noël
        this.ctx.globalAlpha = 0.2;
        const colors = ['#c62828', '#2e7d32', '#ffd700'];
        for (let i = 0; i < 12; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = 15 + Math.random() * 25;
            this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;
    }

    // Flocon de neige
    drawSnowflake(cx, cy, size) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.strokeStyle = '#e3f2fd';
        this.ctx.lineWidth = 2;

        // 6 branches
        for (let i = 0; i < 6; i++) {
            this.ctx.rotate(Math.PI / 3);
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(0, -size);
            this.ctx.stroke();

            // Petites branches
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size * 0.6);
            this.ctx.lineTo(-size * 0.3, -size * 0.8);
            this.ctx.moveTo(0, -size * 0.6);
            this.ctx.lineTo(size * 0.3, -size * 0.8);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    // Décorations de Pâques
    drawEasterDecorations() {
        this.ctx.globalAlpha = 0.15;

        // Fleurs
        const flowerColors = ['#ff6b9d', '#c44569', '#f8b500', '#4b7bec'];
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            this.drawFlower(x, y, 15 + Math.random() * 10, color);
        }

        // Papillons
        this.ctx.globalAlpha = 0.2;
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            this.drawButterfly(x, y, 20 + Math.random() * 15);
        }

        this.ctx.globalAlpha = 1;
    }

    // Fleur simple
    drawFlower(cx, cy, size, color) {
        this.ctx.fillStyle = color;

        // 5 pétales
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const x = cx + Math.cos(angle) * size * 0.6;
            const y = cy + Math.sin(angle) * size * 0.6;

            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Centre
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Papillon simple
    drawButterfly(cx, cy, size) {
        this.ctx.fillStyle = '#ff6b9d';

        // Ailes gauches
        this.ctx.beginPath();
        this.ctx.ellipse(cx - size * 0.4, cy - size * 0.3, size * 0.4, size * 0.6, -0.3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.ellipse(cx - size * 0.4, cy + size * 0.3, size * 0.3, size * 0.5, 0.3, 0, Math.PI * 2);
        this.ctx.fill();

        // Ailes droites
        this.ctx.beginPath();
        this.ctx.ellipse(cx + size * 0.4, cy - size * 0.3, size * 0.4, size * 0.6, 0.3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.ellipse(cx + size * 0.4, cy + size * 0.3, size * 0.3, size * 0.5, -0.3, 0, Math.PI * 2);
        this.ctx.fill();

        // Corps
        this.ctx.fillStyle = '#2d3436';
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy, size * 0.15, size * 0.8, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Décorations de l'Avent
    drawAdventDecorations() {
        this.ctx.globalAlpha = 0.15;

        // Bougies
        const candlePositions = [
            [this.width * 0.2, this.height * 0.7],
            [this.width * 0.4, this.height * 0.8],
            [this.width * 0.6, this.height * 0.75],
            [this.width * 0.8, this.height * 0.7]
        ];

        candlePositions.forEach((pos, index) => {
            this.drawCandle(pos[0], pos[1], 30, index < 2); // 2 premières allumées
        });

        // Étoiles violettes
        this.ctx.fillStyle = '#9c27b0';
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height * 0.5; // Haut de l'image
            this.drawStar(x, y, 5, 15 + Math.random() * 10, 7);
        }

        this.ctx.globalAlpha = 1;
    }

    // Bougie
    drawCandle(cx, cy, height, lit = true) {
        // Corps de la bougie
        this.ctx.fillStyle = '#9c27b0';
        this.ctx.fillRect(cx - 8, cy - height, 16, height);

        // Mèche
        this.ctx.fillStyle = '#2d3436';
        this.ctx.fillRect(cx - 2, cy - height - 5, 4, 5);

        // Flamme (si allumée)
        if (lit) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.beginPath();
            this.ctx.ellipse(cx, cy - height - 10, 6, 10, 0, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.ellipse(cx, cy - height - 8, 4, 6, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // Décorations de la Pentecôte
    drawPentecostDecorations() {
        this.ctx.globalAlpha = 0.2;

        // Flammes de l'Esprit Saint
        const flameColors = ['#ff6b6b', '#ff8787', '#ffa07a', '#ffd93d'];
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const color = flameColors[Math.floor(Math.random() * flameColors.length)];
            this.drawFlame(x, y, 20 + Math.random() * 15, color);
        }

        // Colombes (Esprit Saint)
        this.ctx.globalAlpha = 0.15;
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 6; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height * 0.6; // Partie haute
            this.drawDove(x, y, 25 + Math.random() * 10);
        }

        this.ctx.globalAlpha = 1;
    }

    // Flamme
    drawFlame(cx, cy, size, color) {
        this.ctx.fillStyle = color;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - size);
        this.ctx.bezierCurveTo(
            cx + size * 0.5, cy - size * 0.7,
            cx + size * 0.6, cy,
            cx, cy + size * 0.2
        );
        this.ctx.bezierCurveTo(
            cx - size * 0.6, cy,
            cx - size * 0.5, cy - size * 0.7,
            cx, cy - size
        );
        this.ctx.fill();
    }

    // Colombe simple
    drawDove(cx, cy, size) {
        // Corps
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy, size * 0.4, size * 0.6, 0.2, 0, Math.PI * 2);
        this.ctx.fill();

        // Aile gauche
        this.ctx.beginPath();
        this.ctx.ellipse(cx - size * 0.5, cy, size * 0.6, size * 0.3, -0.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Aile droite
        this.ctx.beginPath();
        this.ctx.ellipse(cx + size * 0.5, cy, size * 0.6, size * 0.3, 0.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Tête
        this.ctx.beginPath();
        this.ctx.arc(cx + size * 0.3, cy - size * 0.5, size * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Ajouter une texture subtile
    drawTexture() {
        this.ctx.globalAlpha = 0.03;
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 2;
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(x, y, size, size);
        }
        this.ctx.globalAlpha = 1;
    }

    // Dessiner des formes géométriques discrètes
    drawGeometricShapes() {
        this.ctx.globalAlpha = 0.08;

        // Cercles décoratifs
        this.ctx.fillStyle = '#ff69b4';
        this.ctx.beginPath();
        this.ctx.arc(150, 150, 120, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(this.width - 150, this.height - 150, 140, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#74b9ff';
        this.ctx.beginPath();
        this.ctx.arc(this.width - 200, 200, 100, 0, Math.PI * 2);
        this.ctx.fill();

        // Étoiles
        this.drawStar(this.width - 180, 150, 5, 40, 20);
        this.drawStar(200, this.height - 150, 5, 35, 17);
        this.drawStar(this.width / 2, 120, 5, 30, 15);

        // Petits points décoratifs
        this.ctx.globalAlpha = 0.2;
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 8 + 4;
            this.ctx.fillStyle = Math.random() > 0.5 ? '#ff69b4' : '#74b9ff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;
    }

    // Dessiner une étoile
    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }

    // Dessiner le header inspirant
    drawHeader(level, medals = []) {
        const centerX = this.width / 2;

        // Icône principale (émoticône inspirante)
        this.ctx.font = '120px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('✨', centerX, 150);

        // Numéro de niveau avec style
        this.ctx.shadowColor = 'rgba(255, 105, 180, 0.3)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 4;

        this.ctx.fillStyle = '#ff1493';
        this.ctx.font = 'bold 90px Arial, sans-serif';
        this.ctx.fillText(`Niveau ${level}`, centerX, 260);

        // Réinitialiser l'ombre
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Médailles débloquées (si présentes)
        if (medals && medals.length > 0) {
            this.drawMedals(medals, centerX, 310);
        }
    }

    // Dessiner les médailles débloquées
    drawMedals(medals, centerX, startY) {
        const medalsToShow = medals.slice(0, 3); // Max 3 médailles
        const spacing = 100;
        const totalWidth = medalsToShow.length * spacing - 20;
        let startX = centerX - totalWidth / 2;

        medalsToShow.forEach((medal, index) => {
            const x = startX + index * spacing;

            // Cercle de fond
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.beginPath();
            this.ctx.arc(x, startY, 35, 0, Math.PI * 2);
            this.ctx.fill();

            // Bordure colorée selon rareté
            const color = this.getMedalColor(medal.rarity);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 4;
            this.ctx.stroke();

            // Icône de la médaille
            this.ctx.font = '50px Arial';
            this.ctx.fillText(medal.icon, x, startY + 5);
        });
    }

    // Obtenir la couleur selon la rareté
    getMedalColor(rarity) {
        const colors = {
            common: '#95a5a6',
            rare: '#3498db',
            epic: '#9b59b6',
            legendary: '#f39c12'
        };
        return colors[rarity] || colors.common;
    }

    // Dessiner la citation biblique de manière inspirante
    drawQuote(quote) {
        const centerX = this.width / 2;
        const startY = 420;

        // Guillemets décoratifs (ouverture)
        this.ctx.font = 'bold 120px Georgia, serif';
        this.ctx.fillStyle = 'rgba(255, 105, 180, 0.2)';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('"', 100, startY - 20);

        // Boîte de citation avec ombre douce
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        this.ctx.shadowBlur = 30;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 10;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.roundRect(80, startY, this.width - 160, 380, 30);
        this.ctx.fill();

        // Réinitialiser l'ombre
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;

        // Barre décorative en haut
        const barGradient = this.ctx.createLinearGradient(100, startY + 10, this.width - 100, startY + 10);
        barGradient.addColorStop(0, '#ff69b4');
        barGradient.addColorStop(0.5, '#ff1493');
        barGradient.addColorStop(1, '#ff69b4');
        this.ctx.fillStyle = barGradient;
        this.ctx.fillRect(100, startY + 10, this.width - 200, 6);

        // Texte de la citation
        this.ctx.fillStyle = '#2d3436';
        this.ctx.font = 'italic 42px Georgia, serif';
        this.ctx.textAlign = 'center';

        // Découper le texte intelligemment
        const maxWidth = this.width - 220;
        const words = quote.text.split(' ');
        let line = '';
        let lines = [];

        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = this.ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                lines.push(line);
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // Centrer verticalement le texte
        const lineHeight = 55;
        const textHeight = lines.length * lineHeight;
        let textStartY = startY + 50 + (280 - textHeight) / 2;

        lines.forEach((line, i) => {
            this.ctx.fillText(line.trim(), centerX, textStartY + i * lineHeight);
        });

        // Référence biblique avec style
        this.ctx.font = 'bold 38px Arial, sans-serif';
        const refGradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
        refGradient.addColorStop(0, '#ff69b4');
        refGradient.addColorStop(1, '#ff1493');
        this.ctx.fillStyle = refGradient;
        this.ctx.fillText('— ' + quote.ref, centerX, startY + 340);

        // Thème en petit (optionnel, discret)
        if (quote.theme) {
            this.ctx.font = '24px Arial, sans-serif';
            this.ctx.fillStyle = 'rgba(255, 105, 180, 0.5)';
            this.ctx.fillText(quote.theme, centerX, startY + 365);
        }

        // Guillemets décoratifs (fermeture)
        this.ctx.font = 'bold 120px Georgia, serif';
        this.ctx.fillStyle = 'rgba(255, 105, 180, 0.2)';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('"', this.width - 100, startY + 350);
    }

    // Dessiner un footer discret
    drawFooter() {
        const centerX = this.width / 2;
        const y = this.height - 80;

        // Message inspirant et non promotionnel
        this.ctx.font = '28px Arial, sans-serif';
        this.ctx.fillStyle = 'rgba(45, 52, 54, 0.6)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Progression spirituelle partagée avec amour', centerX, y);

        // Petit symbole discret
        this.ctx.font = '32px Arial';
        this.ctx.fillStyle = 'rgba(255, 105, 180, 0.4)';
        this.ctx.fillText('✝️', centerX, y + 40);
    }

    // Dessiner un rectangle arrondi
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    // Générer l'image complète
    generateImage(level, options = {}) {
        const {
            medals = [],
            backgroundStyle = 'soft',
            showFooter = true
        } = options;

        const quote = this.getBibleQuote(level);

        // Dessiner tous les éléments
        this.drawBackground(backgroundStyle);
        this.drawHeader(level, medals);
        this.drawQuote(quote);

        if (showFooter) {
            this.drawFooter();
        }

        // Retourner l'image en data URL
        return this.canvas.toDataURL('image/png', 1.0);
    }

    // Télécharger l'image
    downloadImage(level, options = {}) {
        // Récupérer les médailles débloquées si achievementSystem existe
        let medals = [];
        if (typeof achievementSystem !== 'undefined') {
            const recentlyUnlocked = achievementSystem.getUnlockedAchievements().slice(-3);
            medals = recentlyUnlocked;
        }

        const dataUrl = this.generateImage(level, { ...options, medals });
        const link = document.createElement('a');
        link.download = `progression-niveau-${level}.png`;
        link.href = dataUrl;
        link.click();
    }

    // Partager l'image (si l'API Web Share est disponible)
    async shareImage(level, options = {}) {
        // Récupérer les médailles débloquées si achievementSystem existe
        let medals = [];
        if (typeof achievementSystem !== 'undefined') {
            const recentlyUnlocked = achievementSystem.getUnlockedAchievements().slice(-3);
            medals = recentlyUnlocked;
        }

        const dataUrl = this.generateImage(level, { ...options, medals });

        // Convertir data URL en blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `progression-niveau-${level}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                const quote = this.getBibleQuote(level);
                await navigator.share({
                    files: [file],
                    title: `${quote.ref} ✨`,
                    text: `"${quote.text}" - ${quote.ref}`
                });
                return true;
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erreur de partage:', error);
                }
                return false;
            }
        } else {
            // Fallback : télécharger l'image
            this.downloadImage(level, options);
            return true;
        }
    }
}

// ================================================================
// GÉNÉRATEUR D'IMAGES STORIES (Format vertical 1080×1920)
// ================================================================

class StoryImageGenerator extends ShareImageGenerator {
    constructor() {
        super();
        this.width = 1080;
        this.height = 1920;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    // Dessiner le header pour Stories (adapté au format vertical)
    drawHeader(level, medals = []) {
        const centerX = this.width / 2;

        // Icône principale plus grande
        this.ctx.font = '180px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('✨', centerX, 250);

        // Numéro de niveau
        this.ctx.shadowColor = 'rgba(255, 105, 180, 0.3)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 4;

        this.ctx.fillStyle = '#ff1493';
        this.ctx.font = 'bold 110px Arial, sans-serif';
        this.ctx.fillText(`Niveau ${level}`, centerX, 400);

        // Réinitialiser l'ombre
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;

        // Médailles
        if (medals && medals.length > 0) {
            this.drawMedals(medals, centerX, 480);
        }
    }

    // Citation adaptée au format vertical
    drawQuote(quote) {
        const centerX = this.width / 2;
        const startY = 620;

        // Guillemets
        this.ctx.font = 'bold 140px Georgia, serif';
        this.ctx.fillStyle = 'rgba(255, 105, 180, 0.2)';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('"', 100, startY - 30);

        // Boîte
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        this.ctx.shadowBlur = 30;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 10;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.roundRect(60, startY, this.width - 120, 700, 30);
        this.ctx.fill();

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;

        // Barre décorative
        const barGradient = this.ctx.createLinearGradient(80, startY + 15, this.width - 80, startY + 15);
        barGradient.addColorStop(0, '#ff69b4');
        barGradient.addColorStop(0.5, '#ff1493');
        barGradient.addColorStop(1, '#ff69b4');
        this.ctx.fillStyle = barGradient;
        this.ctx.fillRect(80, startY + 15, this.width - 160, 8);

        // Texte citation (plus grand pour lisibilité mobile)
        this.ctx.fillStyle = '#2d3436';
        this.ctx.font = 'italic 50px Georgia, serif';
        this.ctx.textAlign = 'center';

        const maxWidth = this.width - 180;
        const words = quote.text.split(' ');
        let line = '';
        let lines = [];

        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = this.ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                lines.push(line);
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // Centrer verticalement
        const lineHeight = 65;
        const textHeight = lines.length * lineHeight;
        let textStartY = startY + 60 + (550 - textHeight) / 2;

        lines.forEach((line, i) => {
            this.ctx.fillText(line.trim(), centerX, textStartY + i * lineHeight);
        });

        // Référence
        this.ctx.font = 'bold 44px Arial, sans-serif';
        const refGradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
        refGradient.addColorStop(0, '#ff69b4');
        refGradient.addColorStop(1, '#ff1493');
        this.ctx.fillStyle = refGradient;
        this.ctx.fillText('— ' + quote.ref, centerX, startY + 640);

        // Thème
        if (quote.theme) {
            this.ctx.font = '28px Arial, sans-serif';
            this.ctx.fillStyle = 'rgba(255, 105, 180, 0.5)';
            this.ctx.fillText(quote.theme, centerX, startY + 675);
        }

        // Guillemet de fermeture
        this.ctx.font = 'bold 140px Georgia, serif';
        this.ctx.fillStyle = 'rgba(255, 105, 180, 0.2)';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('"', this.width - 100, startY + 650);
    }

    // Footer adapté
    drawFooter() {
        const centerX = this.width / 2;
        const y = this.height - 120;

        this.ctx.font = '32px Arial, sans-serif';
        this.ctx.fillStyle = 'rgba(45, 52, 54, 0.6)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Progression spirituelle', centerX, y);
        this.ctx.fillText('partagée avec amour', centerX, y + 40);

        this.ctx.font = '40px Arial';
        this.ctx.fillStyle = 'rgba(255, 105, 180, 0.4)';
        this.ctx.fillText('✝️', centerX, y + 90);
    }
}

// ================================================================
// GÉNÉRATEUR D'ANIMATIONS (Citation progressive)
// ================================================================

class AnimatedShareGenerator {
    constructor(format = 'square') {
        this.format = format;
        this.generator = format === 'story'
            ? new StoryImageGenerator()
            : new ShareImageGenerator();
        this.frames = [];
    }

    // Générer une animation de citation progressive
    async generateProgressiveAnimation(level, options = {}) {
        const {
            medals = [],
            backgroundStyle = 'soft',
            duration = 5, // secondes
            fps = 30
        } = options;

        const quote = this.generator.getBibleQuote(level);
        const totalFrames = duration * fps;
        this.frames = [];

        // Générer les frames
        for (let i = 0; i < totalFrames; i++) {
            const progress = i / totalFrames;
            const frame = this.generateFrame(level, quote, medals, backgroundStyle, progress);
            this.frames.push(frame);
        }

        return this.frames;
    }

    // Générer une frame avec progression
    generateFrame(level, quote, medals, style, progress) {
        const gen = this.generator;

        // Dessiner le fond (toujours visible)
        gen.drawBackground(style);

        // Header apparaît progressivement (0-0.2)
        if (progress > 0) {
            const headerAlpha = Math.min(progress / 0.2, 1);
            gen.ctx.globalAlpha = headerAlpha;
            gen.drawHeader(level, medals);
            gen.ctx.globalAlpha = 1;
        }

        // Citation apparaît mot par mot (0.3-0.9)
        if (progress > 0.3) {
            this.drawProgressiveQuote(quote, (progress - 0.3) / 0.6);
        }

        // Footer apparaît à la fin (0.9-1.0)
        if (progress > 0.9) {
            const footerAlpha = (progress - 0.9) / 0.1;
            gen.ctx.globalAlpha = footerAlpha;
            gen.drawFooter();
            gen.ctx.globalAlpha = 1;
        }

        return gen.canvas.toDataURL('image/png', 1.0);
    }

    // Dessiner la citation avec progression mot par mot
    drawProgressiveQuote(quote, progress) {
        const gen = this.generator;
        const centerX = gen.width / 2;
        const startY = gen.format === 'story' ? 620 : 420;

        // Boîte (apparaît d'abord)
        gen.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const boxWidth = gen.format === 'story' ? gen.width - 120 : gen.width - 160;
        const boxHeight = gen.format === 'story' ? 700 : 380;
        gen.roundRect(
            gen.format === 'story' ? 60 : 80,
            startY,
            boxWidth,
            boxHeight,
            30
        );
        gen.ctx.fill();

        // Texte progressif
        const words = quote.text.split(' ');
        const visibleWords = Math.floor(words.length * progress);
        const partialText = words.slice(0, visibleWords).join(' ');

        if (partialText) {
            gen.ctx.fillStyle = '#2d3436';
            gen.ctx.font = gen.format === 'story' ? 'italic 50px Georgia, serif' : 'italic 42px Georgia, serif';
            gen.ctx.textAlign = 'center';

            // Découpage du texte visible
            const maxWidth = boxWidth - 100;
            let line = '';
            let lines = [];
            const visibleWordArray = partialText.split(' ');

            for (let word of visibleWordArray) {
                const testLine = line + word + ' ';
                const metrics = gen.ctx.measureText(testLine);
                if (metrics.width > maxWidth && line !== '') {
                    lines.push(line);
                    line = word + ' ';
                } else {
                    line = testLine;
                }
            }
            if (line) lines.push(line);

            const lineHeight = gen.format === 'story' ? 65 : 55;
            const textHeight = lines.length * lineHeight;
            let textStartY = startY + 60 + ((boxHeight - 120) - textHeight) / 2;

            lines.forEach((line, i) => {
                gen.ctx.fillText(line.trim(), centerX, textStartY + i * lineHeight);
            });
        }

        // Référence apparaît quand le texte est complet (progress > 0.8)
        if (progress > 0.8) {
            const refAlpha = (progress - 0.8) / 0.2;
            gen.ctx.globalAlpha = refAlpha;

            gen.ctx.font = gen.format === 'story' ? 'bold 44px Arial, sans-serif' : 'bold 38px Arial, sans-serif';
            const refGradient = gen.ctx.createLinearGradient(0, 0, gen.width, 0);
            refGradient.addColorStop(0, '#ff69b4');
            refGradient.addColorStop(1, '#ff1493');
            gen.ctx.fillStyle = refGradient;
            gen.ctx.fillText(
                '— ' + quote.ref,
                centerX,
                startY + (gen.format === 'story' ? 640 : 340)
            );

            gen.ctx.globalAlpha = 1;
        }
    }

    // Exporter l'animation en ZIP (fallback navigateur)
    async downloadAnimation(level, options = {}) {
        await this.generateProgressiveAnimation(level, options);

        // Pour l'instant, télécharger juste la dernière frame
        // (Une vraie vidéo nécessiterait une lib externe comme ffmpeg.wasm)
        const lastFrame = this.frames[this.frames.length - 1];
        const link = document.createElement('a');
        link.download = `story-niveau-${level}.png`;
        link.href = lastFrame;
        link.click();

        console.log(`Animation générée: ${this.frames.length} frames`);
        return this.frames;
    }
}

// Export
const shareImageGenerator = new ShareImageGenerator();
const storyImageGenerator = new StoryImageGenerator();
const animatedShareGenerator = new AnimatedShareGenerator('square');
const animatedStoryGenerator = new AnimatedShareGenerator('story');
