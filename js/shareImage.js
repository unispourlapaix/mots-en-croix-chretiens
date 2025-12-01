// Module de génération d'images de partage
class ShareImageGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 1200;
        this.height = 630;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    // Citations bibliques inspirantes par niveau
    getBibleQuote(level) {
        const quotes = [
            { text: "Je puis tout par celui qui me fortifie", ref: "Philippiens 4:13" },
            { text: "L'amour ne périt jamais", ref: "1 Corinthiens 13:8" },
            { text: "La foi est une ferme assurance des choses qu'on espère", ref: "Hébreux 11:1" },
            { text: "Tu garderas dans une paix parfaite l'esprit qui s'appuie sur toi", ref: "Ésaïe 26:3" },
            { text: "L'Éternel est ma lumière et mon salut", ref: "Psaume 27:1" },
            { text: "Car je sais les projets que j'ai formés sur vous", ref: "Jérémie 29:11" },
            { text: "Dieu est amour", ref: "1 Jean 4:8" },
            { text: "Cherchez premièrement le royaume et la justice de Dieu", ref: "Matthieu 6:33" },
            { text: "Le fruit de l'Esprit, c'est l'amour, la joie, la paix", ref: "Galates 5:22" },
            { text: "Soyez dans la joie, affermissez-vous, ayez un même sentiment", ref: "2 Corinthiens 13:11" },
            { text: "L'homme ne vit pas de pain seulement", ref: "Matthieu 4:4" },
            { text: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant", ref: "Psaume 91:1" },
            { text: "Tout ce que vous ferez, faites-le de bon cœur", ref: "Colossiens 3:23" },
            { text: "Heureux ceux qui ont le cœur pur, car ils verront Dieu", ref: "Matthieu 5:8" },
            { text: "La grâce de notre Seigneur a surabondé", ref: "1 Timothée 1:14" }
        ];
        
        const index = (level - 1) % quotes.length;
        return quotes[index];
    }

    // Dessiner un dégradé rose kawaii
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#ffe6f0');
        gradient.addColorStop(0.5, '#ffd1e3');
        gradient.addColorStop(1, '#ffb6d9');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Ajouter des formes géométriques kawaii
        this.drawGeometricShapes();
    }

    // Dessiner des formes géométriques discrètes
    drawGeometricShapes() {
        this.ctx.globalAlpha = 0.15;
        
        // Cercles
        this.ctx.fillStyle = '#ff69b4';
        this.ctx.beginPath();
        this.ctx.arc(100, 100, 80, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.width - 100, this.height - 100, 100, 0, Math.PI * 2);
        this.ctx.fill();

        // Étoiles
        this.drawStar(this.width - 150, 120, 5, 30, 15);
        this.drawStar(180, this.height - 120, 5, 25, 12);

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

    // Dessiner le texte principal
    drawMainText(level) {
        const centerX = this.width / 2;
        
        // Titre
        this.ctx.fillStyle = '#ff1493';
        this.ctx.font = 'bold 72px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🙏 Niveau ' + level + ' Complété 🙏', centerX, 120);

        // Sous-titre
        this.ctx.fillStyle = '#ff69b4';
        this.ctx.font = '48px Arial, sans-serif';
        this.ctx.fillText('Mots En Croix Chrétiens', centerX, 200);
    }

    // Dessiner la citation biblique
    drawQuote(quote) {
        const centerX = this.width / 2;
        const centerY = this.height / 2 + 60;
        
        // Boîte de citation avec bordure arrondie
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.strokeStyle = '#ff69b4';
        this.ctx.lineWidth = 4;
        this.roundRect(120, centerY - 80, this.width - 240, 180, 20);
        this.ctx.fill();
        this.ctx.stroke();

        // Texte de la citation
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'italic 36px Georgia, serif';
        this.ctx.textAlign = 'center';
        
        // Découper le texte si trop long
        const maxWidth = this.width - 280;
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

        // Dessiner les lignes
        const lineHeight = 45;
        const startY = centerY - (lines.length * lineHeight) / 2 + 10;
        lines.forEach((line, i) => {
            this.ctx.fillText(line.trim(), centerX, startY + i * lineHeight);
        });

        // Référence
        this.ctx.font = 'bold 28px Arial, sans-serif';
        this.ctx.fillStyle = '#ff1493';
        this.ctx.fillText('— ' + quote.ref, centerX, centerY + 70);
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
    generateImage(level) {
        const quote = this.getBibleQuote(level);
        
        // Dessiner tous les éléments
        this.drawBackground();
        this.drawMainText(level);
        this.drawQuote(quote);

        // Retourner l'image en data URL
        return this.canvas.toDataURL('image/png', 1.0);
    }

    // Télécharger l'image
    downloadImage(level) {
        const dataUrl = this.generateImage(level);
        const link = document.createElement('a');
        link.download = `mots-croix-niveau-${level}.png`;
        link.href = dataUrl;
        link.click();
    }

    // Partager l'image (si l'API Web Share est disponible)
    async shareImage(level) {
        const dataUrl = this.generateImage(level);
        
        // Convertir data URL en blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `mots-croix-niveau-${level}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: `Niveau ${level} Complété 🙏`,
                    text: `J'ai complété le niveau ${level} de Mots En Croix Chrétiens !`
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
            this.downloadImage(level);
            return true;
        }
    }
}

// Export
const shareImageGenerator = new ShareImageGenerator();
