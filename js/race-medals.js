// Système de Médailles de Score Course - 112 Médailles basées sur des mots chrétiens optimistes
// Mode course : score séparé du score principal, bonus de partage

class RaceMedalSystem {
    constructor() {
        // Score de course séparé (bonus de partage)
        this.raceScore = 0;
        this.raceMedalsUnlocked = new Set();
        
        // 112 Mots chrétiens optimistes pour les médailles
        this.inspirationalWords = [
            // Fondamentaux (10)
            { word: 'PAIX', points: 100, icon: '🕊️', meaning: 'La paix du Christ qui surpasse toute intelligence' },
            { word: 'AMOUR', points: 200, icon: '❤️', meaning: 'L\'amour de Dieu manifesté en Christ' },
            { word: 'JOIE', points: 300, icon: '😊', meaning: 'La joie du Seigneur est notre force' },
            { word: 'GRÂCE', points: 400, icon: '✨', meaning: 'Sauvés par grâce, par le moyen de la foi' },
            { word: 'FOI', points: 500, icon: '🙏', meaning: 'La foi qui transporte les montagnes' },
            { word: 'ESPÉRANCE', points: 600, icon: '🌟', meaning: 'L\'espérance qui ne déçoit point' },
            { word: 'LUMIÈRE', points: 700, icon: '💡', meaning: 'Christ, lumière du monde' },
            { word: 'VIE', points: 800, icon: '🌱', meaning: 'La vie éternelle en Jésus-Christ' },
            { word: 'VÉRITÉ', points: 900, icon: '📖', meaning: 'La vérité qui nous affranchit' },
            { word: 'SAGESSE', points: 1000, icon: '🦉', meaning: 'La sagesse d\'en haut' },
            
            // Vertus (15)
            { word: 'PATIENCE', points: 1100, icon: '⏳', meaning: 'Fruit de l\'Esprit : patience' },
            { word: 'BONTÉ', points: 1200, icon: '🤗', meaning: 'La bonté du Seigneur' },
            { word: 'DOUCEUR', points: 1300, icon: '🌸', meaning: 'La douceur hérite la terre' },
            { word: 'HUMILITÉ', points: 1400, icon: '🙇', meaning: 'Dieu fait grâce aux humbles' },
            { word: 'FIDÉLITÉ', points: 1500, icon: '🛡️', meaning: 'Fidèle est celui qui vous appelle' },
            { word: 'COMPASSION', points: 1600, icon: '💕', meaning: 'Soyez pleins de compassion' },
            { word: 'MISÉRICORDE', points: 1700, icon: '🌈', meaning: 'Sa miséricorde dure à toujours' },
            { word: 'PARDON', points: 1800, icon: '🤝', meaning: 'Pardonnez comme Christ vous a pardonné' },
            { word: 'GÉNÉROSITÉ', points: 1900, icon: '🎁', meaning: 'Dieu aime celui qui donne avec joie' },
            { word: 'JUSTICE', points: 2000, icon: '⚖️', meaning: 'Cherchez premièrement le royaume et sa justice' },
            { word: 'COURAGE', points: 2100, icon: '🦁', meaning: 'Fortifie-toi et prends courage' },
            { word: 'FORCE', points: 2200, icon: '💪', meaning: 'Le Seigneur est ma force' },
            { word: 'PERSÉVÉRANCE', points: 2300, icon: '🏃', meaning: 'Courons avec persévérance' },
            { word: 'SINCÉRITÉ', points: 2400, icon: '💎', meaning: 'Dans la sincérité du cœur' },
            { word: 'PURETÉ', points: 2500, icon: '🤍', meaning: 'Heureux ceux qui ont le cœur pur' },
            
            // Relations (15)
            { word: 'FRATERNITÉ', points: 2600, icon: '👫', meaning: 'Aimez-vous les uns les autres' },
            { word: 'UNITÉ', points: 2700, icon: '🤲', meaning: 'Qu\'ils soient un' },
            { word: 'COMMUNION', points: 2800, icon: '🍞', meaning: 'La communion du Saint-Esprit' },
            { word: 'PARTAGE', points: 2900, icon: '🤝', meaning: 'Partager avec les saints' },
            { word: 'ENTRAIDE', points: 3000, icon: '🫂', meaning: 'Portez les fardeaux les uns des autres' },
            { word: 'ÉCOUTE', points: 3100, icon: '👂', meaning: 'Que chacun soit prompt à écouter' },
            { word: 'RESPECT', points: 3200, icon: '🙌', meaning: 'Honorez-vous les uns les autres' },
            { word: 'TOLÉRANCE', points: 3300, icon: '🌍', meaning: 'Supportez-vous avec amour' },
            { word: 'INCLUSION', points: 3400, icon: '🌐', meaning: 'Tous sont un en Christ' },
            { word: 'DIVERSITÉ', points: 3500, icon: '🎨', meaning: 'Un seul corps, plusieurs membres' },
            { word: 'ACCUEIL', points: 3600, icon: '🏠', meaning: 'Accueillez-vous comme Christ vous a accueillis' },
            { word: 'SERVICE', points: 3700, icon: '🙋', meaning: 'Servez-vous les uns les autres' },
            { word: 'ÉDIFICATION', points: 3800, icon: '🏗️', meaning: 'Édifiez-vous mutuellement' },
            { word: 'ENCOURAGEMENT', points: 3900, icon: '💪', meaning: 'Encouragez-vous chaque jour' },
            { word: 'SOLIDARITÉ', points: 4000, icon: '🤜🤛', meaning: 'Membres d\'un même corps' },
            
            // Attitudes spirituelles (15)
            { word: 'RECONNAISSANCE', points: 4100, icon: '🙏', meaning: 'Rendez grâces en toutes choses' },
            { word: 'LOUANGE', points: 4200, icon: '🎵', meaning: 'Louez l\'Éternel de toute votre âme' },
            { word: 'ADORATION', points: 4300, icon: '🛐', meaning: 'Adorez en esprit et en vérité' },
            { word: 'PRIÈRE', points: 4400, icon: '🙏', meaning: 'Priez sans cesse' },
            { word: 'OBÉISSANCE', points: 4500, icon: '✅', meaning: 'Si vous m\'aimez, gardez mes commandements' },
            { word: 'CONFIANCE', points: 4600, icon: '🔐', meaning: 'Confie-toi en l\'Éternel' },
            { word: 'ABANDON', points: 4700, icon: '🕊️', meaning: 'Remets ton sort à l\'Éternel' },
            { word: 'REPENTANCE', points: 4800, icon: '😢', meaning: 'Repentez-vous et croyez' },
            { word: 'SANCTIFICATION', points: 4900, icon: '✨', meaning: 'Soyez saints car je suis saint' },
            { word: 'CONSÉCRATION', points: 5000, icon: '🔥', meaning: 'Présentez vos corps en sacrifice vivant' },
            { word: 'ZÈLE', points: 5100, icon: '🔥', meaning: 'Ne soyez point paresseux, soyez fervents d\'esprit' },
            { word: 'DÉVOTION', points: 5200, icon: '💝', meaning: 'Mon cœur est tout dévoué' },
            { word: 'MÉDITATION', points: 5300, icon: '🧘', meaning: 'Méditez la parole jour et nuit' },
            { word: 'JEÛNE', points: 5400, icon: '🕊️', meaning: 'Prière et jeûne' },
            { word: 'VIGILANCE', points: 5500, icon: '👁️', meaning: 'Veillez et priez' },
            
            // Transformation (15)
            { word: 'RENOUVEAU', points: 5600, icon: '🆕', meaning: 'Soyez transformés par le renouvellement de l\'intelligence' },
            { word: 'RENAISSANCE', points: 5700, icon: '👶', meaning: 'Né de nouveau' },
            { word: 'RESTAURATION', points: 5800, icon: '🔧', meaning: 'Il restaure mon âme' },
            { word: 'GUÉRISON', points: 5900, icon: '💊', meaning: 'Par ses meurtrissures nous sommes guéris' },
            { word: 'DÉLIVRANCE', points: 6000, icon: '🆓', meaning: 'Libéré de la servitude' },
            { word: 'PURIFICATION', points: 6100, icon: '💧', meaning: 'Purifié par le sang de l\'Agneau' },
            { word: 'CROISSANCE', points: 6200, icon: '📈', meaning: 'Croître en toutes choses' },
            { word: 'MATURITÉ', points: 6300, icon: '🌳', meaning: 'Parvenir à la maturité' },
            { word: 'VICTOIRE', points: 6400, icon: '🏆', meaning: 'Plus que vainqueurs' },
            { word: 'TRIOMPHE', points: 6500, icon: '🎖️', meaning: 'Le triomphe de la foi' },
            { word: 'RÉDEMPTION', points: 6600, icon: '✝️', meaning: 'Rachetés par le sang' },
            { word: 'SALUT', points: 6700, icon: '⛑️', meaning: 'Le salut vient de notre Dieu' },
            { word: 'RÉCONCILIATION', points: 6800, icon: '🤝', meaning: 'Réconciliés avec Dieu' },
            { word: 'ADOPTION', points: 6900, icon: '👨‍👩‍👧', meaning: 'Adopté comme enfant de Dieu' },
            { word: 'HÉRITAGE', points: 7000, icon: '💍', meaning: 'Héritiers de Dieu' },
            
            // Dons de l'Esprit (15)
            { word: 'PROPHÉTIE', points: 7100, icon: '📢', meaning: 'Don de prophétie' },
            { word: 'ENSEIGNEMENT', points: 7200, icon: '📚', meaning: 'Don d\'enseignement' },
            { word: 'DISCERNEMENT', points: 7300, icon: '🔍', meaning: 'Discernement des esprits' },
            { word: 'RÉVÉLATION', points: 7400, icon: '💡', meaning: 'Esprit de révélation' },
            { word: 'CONNAISSANCE', points: 7500, icon: '🎓', meaning: 'Parole de connaissance' },
            { word: 'INTELLIGENCE', points: 7600, icon: '🧠', meaning: 'Intelligence spirituelle' },
            { word: 'EXHORTATION', points: 7700, icon: '📣', meaning: 'Don d\'exhortation' },
            { word: 'CONSEIL', points: 7800, icon: '💬', meaning: 'Esprit de conseil' },
            { word: 'MIRACLE', points: 7900, icon: '⚡', meaning: 'Don d\'opérer des miracles' },
            { word: 'PUISSANCE', points: 8000, icon: '⚡', meaning: 'Puissance du Saint-Esprit' },
            { word: 'AUTORITÉ', points: 8100, icon: '👑', meaning: 'Autorité en Christ' },
            { word: 'ONCTION', points: 8200, icon: '🛢️', meaning: 'L\'onction du Saint' },
            { word: 'INSPIRATION', points: 8300, icon: '💭', meaning: 'Inspiré par l\'Esprit' },
            { word: 'CRÉATIVITÉ', points: 8400, icon: '🎨', meaning: 'Créé à l\'image du Créateur' },
            { word: 'INNOVATION', points: 8500, icon: '💡', meaning: 'Faire toutes choses nouvelles' },
            
            // Fruits spirituels (15)
            { word: 'BIENVEILLANCE', points: 8600, icon: '😇', meaning: 'Fruit de bienveillance' },
            { word: 'TEMPÉRANCE', points: 8700, icon: '⚖️', meaning: 'Fruit de tempérance' },
            { word: 'SÉRÉNITÉ', points: 8800, icon: '🧘', meaning: 'La paix de Dieu garde vos cœurs' },
            { word: 'ÉQUILIBRE', points: 8900, icon: '⚖️', meaning: 'Marcher dans l\'équilibre' },
            { word: 'HARMONIE', points: 9000, icon: '🎶', meaning: 'En harmonie les uns avec les autres' },
            { word: 'PLÉNITUDE', points: 9100, icon: '🌕', meaning: 'Rempli de toute la plénitude de Dieu' },
            { word: 'ABONDANCE', points: 9200, icon: '🌊', meaning: 'La vie en abondance' },
            { word: 'PROSPÉRITÉ', points: 9300, icon: '📈', meaning: 'Tu prospéreras en toutes choses' },
            { word: 'FÉCONDITÉ', points: 9400, icon: '🌾', meaning: 'Portez beaucoup de fruit' },
            { word: 'RAYONNEMENT', points: 9500, icon: '✨', meaning: 'Que votre lumière luise' },
            { word: 'EXCELLENCE', points: 9600, icon: '🏆', meaning: 'Cherchez ce qui est excellent' },
            { word: 'PERFECTION', points: 9700, icon: '💯', meaning: 'Tendez à la perfection' },
            { word: 'SAINTETÉ', points: 9800, icon: '👼', meaning: 'Appelés à être saints' },
            { word: 'GLOIRE', points: 9900, icon: '✨', meaning: 'De gloire en gloire' },
            { word: 'ÉTERNITÉ', points: 10000, icon: '♾️', meaning: 'La vie éternelle' },
            
            // Mission et témoignage (12)
            { word: 'ÉVANGÉLISATION', points: 10100, icon: '📣', meaning: 'Allez, faites de toutes les nations des disciples' },
            { word: 'TÉMOIGNAGE', points: 10200, icon: '🗣️', meaning: 'Vous serez mes témoins' },
            { word: 'PROCLAMATION', points: 10300, icon: '📢', meaning: 'Proclamez la bonne nouvelle' },
            { word: 'ANNONCE', points: 10400, icon: '📯', meaning: 'Annoncer les merveilles de Dieu' },
            { word: 'MISSION', points: 10500, icon: '🌍', meaning: 'Envoyés dans le monde' },
            { word: 'AMBASSADEUR', points: 10600, icon: '🎖️', meaning: 'Ambassadeurs pour Christ' },
            { word: 'DISCIPLE', points: 10700, icon: '👥', meaning: 'Faire des disciples' },
            { word: 'MESSAGER', points: 10800, icon: '💌', meaning: 'Messagers de paix' },
            { word: 'SEL', points: 10900, icon: '🧂', meaning: 'Vous êtes le sel de la terre' },
            { word: 'LEVAIN', points: 11000, icon: '🍞', meaning: 'Un peu de levain fait lever toute la pâte' },
            { word: 'BERGER', points: 11100, icon: '🐑', meaning: 'Paissez mes agneaux' },
            { word: 'SACRIFICATEUR', points: 11200, icon: '⛪', meaning: 'Sacrificature royale' }
        ];
        
        // Charger les données sauvegardées
        this.loadRaceMedals();
    }

    // Ajouter des points de course
    addRacePoints(points) {
        this.raceScore += points;
        this.checkForNewMedals();
        this.saveRaceMedals();
    }

    // Vérifier si de nouvelles médailles sont débloquées
    checkForNewMedals() {
        const newMedals = [];
        
        this.inspirationalWords.forEach(medal => {
            const medalId = `race_${medal.word.toLowerCase()}`;
            
            // Si la médaille n'est pas déjà débloquée et que le score est atteint
            if (!this.raceMedalsUnlocked.has(medalId) && this.raceScore >= medal.points) {
                this.raceMedalsUnlocked.add(medalId);
                newMedals.push(medal);
            }
        });

        // Afficher les notifications pour les nouvelles médailles
        if (newMedals.length > 0) {
            this.showMedalNotifications(newMedals);
        }

        return newMedals;
    }

    // Afficher les notifications de médailles
    showMedalNotifications(medals) {
        medals.forEach((medal, index) => {
            setTimeout(() => {
                this.showNotification(
                    `🏅 Médaille de Course débloquée !`,
                    `${medal.icon} ${medal.word}\n${medal.meaning}\n✨ +${medal.points} points bonus`
                );
            }, index * 2000); // Décaler de 2 secondes entre chaque notification
        });

        // Si c'est la 50ème médaille, afficher un message d'encouragement spécial
        if (this.raceMedalsUnlocked.size === 50) {
            setTimeout(() => {
                this.showNotification(
                    '🌟 Mi-parcours atteint !',
                    'La course de la foi continue... Persévérez avec espoir !\n"Courons avec persévérance" - Hébreux 12:1'
                );
            }, medals.length * 2000 + 1000);
        }

        // Si toutes les médailles sont débloquées
        if (this.raceMedalsUnlocked.size === 112) {
            setTimeout(() => {
                this.showNotification(
                    '👑 Toutes les médailles débloquées !',
                    'Vous avez parcouru toute la course de la foi !\nÀ la fin, c\'est bien la paix qui nous attend.\nL\'éternité est de Dieu. 🕊️'
                );
            }, medals.length * 2000 + 2000);
        }
    }

    // Afficher une notification
    showNotification(title, message) {
        // Utiliser le système de notification existant si disponible
        if (typeof achievementSystem !== 'undefined' && achievementSystem.showNotification) {
            achievementSystem.showNotification(title, message);
        } else {
            // Fallback : alerte simple
            console.log(`${title}: ${message}`);
        }
    }

    // Obtenir toutes les médailles disponibles
    getAllMedals() {
        return this.inspirationalWords.map(medal => ({
            ...medal,
            id: `race_${medal.word.toLowerCase()}`,
            unlocked: this.raceMedalsUnlocked.has(`race_${medal.word.toLowerCase()}`)
        }));
    }

    // Obtenir les médailles débloquées
    getUnlockedMedals() {
        return this.getAllMedals().filter(medal => medal.unlocked);
    }

    // Obtenir le pourcentage de progression
    getProgress() {
        const total = this.inspirationalWords.length;
        const unlocked = this.raceMedalsUnlocked.size;
        return {
            unlocked,
            total,
            percentage: Math.round((unlocked / total) * 100)
        };
    }

    // Sauvegarder les données
    saveRaceMedals() {
        const data = {
            raceScore: this.raceScore,
            raceMedalsUnlocked: Array.from(this.raceMedalsUnlocked)
        };
        localStorage.setItem('raceMedalsData', JSON.stringify(data));
    }

    // Charger les données
    loadRaceMedals() {
        try {
            const saved = localStorage.getItem('raceMedalsData');
            if (saved) {
                const data = JSON.parse(saved);
                this.raceScore = data.raceScore || 0;
                this.raceMedalsUnlocked = new Set(data.raceMedalsUnlocked || []);
            }
        } catch (error) {
            console.error('Erreur chargement médailles course:', error);
        }
    }

    // Réinitialiser les données (debug)
    reset() {
        this.raceScore = 0;
        this.raceMedalsUnlocked.clear();
        this.saveRaceMedals();
    }

    // Obtenir le score de course actuel
    getRaceScore() {
        return this.raceScore;
    }

    // Définir le score (pour la synchronisation)
    setRaceScore(score) {
        this.raceScore = score;
        this.checkForNewMedals();
        this.saveRaceMedals();
    }
}

// Instance globale
if (typeof window !== 'undefined') {
    window.raceMedalSystem = new RaceMedalSystem();
    console.log('✅ Système de Médailles de Course initialisé - 112 médailles disponibles');
}
