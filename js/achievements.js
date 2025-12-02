// Système de médailles et récompenses pour Mots En Croix Chrétiens
// Gère les achievements, badges et collections

class AchievementSystem {
    constructor() {
        // Types de médailles
        this.achievementTypes = {
            PERFECT: 'perfect',           // Niveau complété sans indices
            BONUS: 'bonus',               // Niveau bonus complété
            MILESTONE: 'milestone',       // Jalons de progression (5, 10, 20, etc.)
            SPEED: 'speed',               // Complétion rapide
            STREAK: 'streak',             // Série de niveaux parfaits
            SPECIAL: 'special'            // Événements spéciaux
        };

        // Définition de toutes les médailles disponibles
        this.medals = {
            // Médailles de complétion parfaite (par niveau)
            perfect_level: {
                id: 'perfect_level',
                name: 'Perfection',
                nameKey: 'achievement_perfect_level',
                description: 'Complété un niveau sans utiliser d\'indices',
                descriptionKey: 'achievement_perfect_level_desc',
                icon: '⭐',
                type: this.achievementTypes.PERFECT,
                rarity: 'common',
                points: 10
            },

            // Médailles de niveaux BONUS
            bonus_complete: {
                id: 'bonus_complete',
                name: 'Explorateur Spirituel',
                nameKey: 'achievement_bonus_complete',
                description: 'Complété un niveau BONUS',
                descriptionKey: 'achievement_bonus_complete_desc',
                icon: '🌟',
                type: this.achievementTypes.BONUS,
                rarity: 'rare',
                points: 25
            },

            bonus_perfect: {
                id: 'bonus_perfect',
                name: 'Maître du Bonus',
                nameKey: 'achievement_bonus_perfect',
                description: 'Complété un niveau BONUS sans indices',
                descriptionKey: 'achievement_bonus_perfect_desc',
                icon: '✨',
                type: this.achievementTypes.BONUS,
                rarity: 'epic',
                points: 50
            },

            // Médailles de progression (jalons)
            milestone_5: {
                id: 'milestone_5',
                name: 'Premiers Pas',
                nameKey: 'achievement_milestone_5',
                description: 'Complété 5 niveaux',
                descriptionKey: 'achievement_milestone_5_desc',
                icon: '🌱',
                type: this.achievementTypes.MILESTONE,
                rarity: 'common',
                points: 20,
                requirement: 5
            },

            milestone_10: {
                id: 'milestone_10',
                name: 'Marcheur Fidèle',
                nameKey: 'achievement_milestone_10',
                description: 'Complété 10 niveaux',
                descriptionKey: 'achievement_milestone_10_desc',
                icon: '🌿',
                type: this.achievementTypes.MILESTONE,
                rarity: 'common',
                points: 30,
                requirement: 10
            },

            milestone_20: {
                id: 'milestone_20',
                name: 'Disciple Dévoué',
                nameKey: 'achievement_milestone_20',
                description: 'Complété 20 niveaux',
                descriptionKey: 'achievement_milestone_20_desc',
                icon: '🌳',
                type: this.achievementTypes.MILESTONE,
                rarity: 'rare',
                points: 50,
                requirement: 20
            },

            milestone_40: {
                id: 'milestone_40',
                name: 'Pèlerin Persévérant',
                nameKey: 'achievement_milestone_40',
                description: 'Complété 40 niveaux',
                descriptionKey: 'achievement_milestone_40_desc',
                icon: '⛰️',
                type: this.achievementTypes.MILESTONE,
                rarity: 'epic',
                points: 100,
                requirement: 40
            },

            milestone_77: {
                id: 'milestone_77',
                name: 'Champion de la Foi',
                nameKey: 'achievement_milestone_77',
                description: 'Complété tous les 77 niveaux',
                descriptionKey: 'achievement_milestone_77_desc',
                icon: '👑',
                type: this.achievementTypes.MILESTONE,
                rarity: 'legendary',
                points: 200,
                requirement: 77
            },

            // Médailles de série (streak)
            streak_3: {
                id: 'streak_3',
                name: 'Trinitaire',
                nameKey: 'achievement_streak_3',
                description: '3 niveaux parfaits consécutifs',
                descriptionKey: 'achievement_streak_3_desc',
                icon: '🔥',
                type: this.achievementTypes.STREAK,
                rarity: 'rare',
                points: 30,
                requirement: 3
            },

            streak_7: {
                id: 'streak_7',
                name: 'Sept Dons',
                nameKey: 'achievement_streak_7',
                description: '7 niveaux parfaits consécutifs',
                descriptionKey: 'achievement_streak_7_desc',
                icon: '💎',
                type: this.achievementTypes.STREAK,
                rarity: 'epic',
                points: 70,
                requirement: 7
            },

            streak_12: {
                id: 'streak_12',
                name: 'Douze Apôtres',
                nameKey: 'achievement_streak_12',
                description: '12 niveaux parfaits consécutifs',
                descriptionKey: 'achievement_streak_12_desc',
                icon: '💫',
                type: this.achievementTypes.STREAK,
                rarity: 'legendary',
                points: 120,
                requirement: 12
            },

            // Médailles spéciales
            all_bonus_complete: {
                id: 'all_bonus_complete',
                name: 'Collecteur de Trésors',
                nameKey: 'achievement_all_bonus',
                description: 'Complété tous les niveaux BONUS',
                descriptionKey: 'achievement_all_bonus_desc',
                icon: '🏆',
                type: this.achievementTypes.SPECIAL,
                rarity: 'legendary',
                points: 150
            },

            perfect_game: {
                id: 'perfect_game',
                name: 'Perfection Divine',
                nameKey: 'achievement_perfect_game',
                description: 'Complété tous les niveaux sans utiliser d\'indices',
                descriptionKey: 'achievement_perfect_game_desc',
                icon: '🌟',
                type: this.achievementTypes.SPECIAL,
                rarity: 'legendary',
                points: 500
            },

            first_level: {
                id: 'first_level',
                name: 'Nouveau Départ',
                nameKey: 'achievement_first_level',
                description: 'Complété votre premier niveau',
                descriptionKey: 'achievement_first_level_desc',
                icon: '🎯',
                type: this.achievementTypes.SPECIAL,
                rarity: 'common',
                points: 5
            }
        };

        // Sauvegarde des achievements
        this.userAchievements = this.loadAchievements();

        // Stats par niveau pour tracking
        this.levelStats = this.loadLevelStats();

        // Streak actuel
        this.currentStreak = 0;
    }

    // Charger les achievements depuis localStorage
    loadAchievements() {
        const saved = localStorage.getItem('christianCrosswordAchievements');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Erreur lors du chargement des achievements:', e);
                return {
                    unlocked: [],
                    progress: {},
                    totalPoints: 0,
                    unlockedAt: {}
                };
            }
        }
        return {
            unlocked: [],
            progress: {},
            totalPoints: 0,
            unlockedAt: {}
        };
    }

    // Charger les stats par niveau
    loadLevelStats() {
        const saved = localStorage.getItem('christianCrosswordLevelStats');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Erreur lors du chargement des stats:', e);
                return {};
            }
        }
        return {};
    }

    // Sauvegarder les achievements
    saveAchievements() {
        localStorage.setItem('christianCrosswordAchievements', JSON.stringify(this.userAchievements));
    }

    // Sauvegarder les stats
    saveLevelStats() {
        localStorage.setItem('christianCrosswordLevelStats', JSON.stringify(this.levelStats));
    }

    // Enregistrer la complétion d'un niveau
    recordLevelCompletion(levelNumber, hintsUsed, isBonusLevel = false) {
        const isPerfect = hintsUsed === 0;

        // Enregistrer les stats du niveau
        if (!this.levelStats[levelNumber]) {
            this.levelStats[levelNumber] = {
                completed: 0,
                perfectCompletions: 0,
                hintsUsed: 0,
                bestTime: null,
                isBonus: isBonusLevel
            };
        }

        this.levelStats[levelNumber].completed++;
        if (isPerfect) {
            this.levelStats[levelNumber].perfectCompletions++;
        }
        this.levelStats[levelNumber].hintsUsed += hintsUsed;

        this.saveLevelStats();

        // Vérifier les achievements débloqués
        const newAchievements = [];

        // Achievement: Premier niveau
        if (levelNumber === 1 && !this.isUnlocked('first_level')) {
            newAchievements.push(this.unlockAchievement('first_level'));
        }

        // Achievement: Niveau parfait
        if (isPerfect) {
            this.currentStreak++;

            // On ne débloque pas de médaille individuelle par niveau parfait
            // mais on track pour les streaks et le perfect game

            // Achievements: Streaks
            if (this.currentStreak === 3 && !this.isUnlocked('streak_3')) {
                newAchievements.push(this.unlockAchievement('streak_3'));
            }
            if (this.currentStreak === 7 && !this.isUnlocked('streak_7')) {
                newAchievements.push(this.unlockAchievement('streak_7'));
            }
            if (this.currentStreak === 12 && !this.isUnlocked('streak_12')) {
                newAchievements.push(this.unlockAchievement('streak_12'));
            }
        } else {
            // Reset du streak si pas parfait
            this.currentStreak = 0;
        }

        // Achievement: Niveau BONUS complété
        if (isBonusLevel) {
            if (!this.isUnlocked('bonus_complete')) {
                newAchievements.push(this.unlockAchievement('bonus_complete'));
            }

            if (isPerfect && !this.isUnlocked('bonus_perfect')) {
                newAchievements.push(this.unlockAchievement('bonus_perfect'));
            }
        }

        // Achievements: Jalons de progression
        const completedLevels = Object.keys(this.levelStats).filter(
            level => this.levelStats[level].completed > 0
        ).length;

        [5, 10, 20, 40, 77].forEach(milestone => {
            const achievementId = `milestone_${milestone}`;
            if (completedLevels >= milestone && !this.isUnlocked(achievementId)) {
                newAchievements.push(this.unlockAchievement(achievementId));
            }
        });

        // Achievement: Tous les bonus complétés
        const bonusLevels = Object.keys(this.levelStats).filter(
            level => this.levelStats[level].isBonus && this.levelStats[level].completed > 0
        );
        // On compte 9 niveaux bonus (BONUS 1 à BONUS 9)
        if (bonusLevels.length >= 9 && !this.isUnlocked('all_bonus_complete')) {
            newAchievements.push(this.unlockAchievement('all_bonus_complete'));
        }

        // Achievement: Jeu parfait (tous les 77 niveaux sans indices)
        const perfectLevels = Object.keys(this.levelStats).filter(
            level => this.levelStats[level].perfectCompletions > 0
        ).length;
        if (perfectLevels >= 77 && !this.isUnlocked('perfect_game')) {
            newAchievements.push(this.unlockAchievement('perfect_game'));
        }

        return newAchievements.filter(a => a !== null);
    }

    // Débloquer un achievement
    unlockAchievement(achievementId) {
        if (this.isUnlocked(achievementId)) {
            return null;
        }

        const medal = this.medals[achievementId];
        if (!medal) {
            console.warn(`Achievement ${achievementId} non trouvé`);
            return null;
        }

        this.userAchievements.unlocked.push(achievementId);
        this.userAchievements.totalPoints += medal.points;
        this.userAchievements.unlockedAt[achievementId] = Date.now();

        this.saveAchievements();

        return medal;
    }

    // Vérifier si un achievement est débloqué
    isUnlocked(achievementId) {
        return this.userAchievements.unlocked.includes(achievementId);
    }

    // Obtenir tous les achievements
    getAllAchievements() {
        return Object.values(this.medals);
    }

    // Obtenir les achievements débloqués
    getUnlockedAchievements() {
        return this.userAchievements.unlocked.map(id => this.medals[id]).filter(m => m);
    }

    // Obtenir les achievements par type
    getAchievementsByType(type) {
        return Object.values(this.medals).filter(m => m.type === type);
    }

    // Obtenir le nombre d'achievements débloqués par rareté
    getAchievementsByRarity() {
        const unlocked = this.getUnlockedAchievements();
        return {
            common: unlocked.filter(m => m.rarity === 'common').length,
            rare: unlocked.filter(m => m.rarity === 'rare').length,
            epic: unlocked.filter(m => m.rarity === 'epic').length,
            legendary: unlocked.filter(m => m.rarity === 'legendary').length
        };
    }

    // Obtenir les stats globales
    getGlobalStats() {
        const allLevels = Object.keys(this.levelStats);
        const completedLevels = allLevels.filter(l => this.levelStats[l].completed > 0);
        const perfectLevels = allLevels.filter(l => this.levelStats[l].perfectCompletions > 0);
        const bonusLevels = allLevels.filter(l => this.levelStats[l].isBonus && this.levelStats[l].completed > 0);

        return {
            totalLevelsCompleted: completedLevels.length,
            perfectLevelsCompleted: perfectLevels.length,
            bonusLevelsCompleted: bonusLevels.length,
            totalAchievements: Object.keys(this.medals).length,
            unlockedAchievements: this.userAchievements.unlocked.length,
            totalPoints: this.userAchievements.totalPoints,
            completionPercentage: Math.round(
                (this.userAchievements.unlocked.length / Object.keys(this.medals).length) * 100
            )
        };
    }

    // Obtenir les stats d'un niveau spécifique
    getLevelStats(levelNumber) {
        return this.levelStats[levelNumber] || null;
    }

    // Réinitialiser tous les achievements (pour debug/tests)
    resetAllAchievements() {
        this.userAchievements = {
            unlocked: [],
            progress: {},
            totalPoints: 0,
            unlockedAt: {}
        };
        this.levelStats = {};
        this.currentStreak = 0;
        this.saveAchievements();
        this.saveLevelStats();
    }

    // Obtenir la couleur selon la rareté
    getRarityColor(rarity) {
        const colors = {
            common: '#95a5a6',
            rare: '#3498db',
            epic: '#9b59b6',
            legendary: '#f39c12'
        };
        return colors[rarity] || colors.common;
    }

    // Obtenir le label de rareté
    getRarityLabel(rarity) {
        const labels = {
            common: 'Commun',
            rare: 'Rare',
            epic: 'Épique',
            legendary: 'Légendaire'
        };
        return labels[rarity] || labels.common;
    }
}

// Créer une instance globale
const achievementSystem = new AchievementSystem();

// Exporter pour les modules ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementSystem;
}
