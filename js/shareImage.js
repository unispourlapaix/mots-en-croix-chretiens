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
        }

        // Ajouter des formes géométriques kawaii
        this.drawGeometricShapes();

        // Ajouter une légère texture
        this.drawTexture();
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

// Export
const shareImageGenerator = new ShareImageGenerator();
