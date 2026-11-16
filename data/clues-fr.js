/**
 * Module de traduction - Français
 * Agrégateur qui charge tous les modules de clues par mode
 * Pour créer une nouvelle langue, dupliquer ce fichier et les sous-modules
 */

const CLUES_FR = {
    // Charger les clues par mode depuis les modules séparés
    'sagesse': typeof CLUES_SAGESSE_FR !== 'undefined' ? CLUES_SAGESSE_FR : {},
    'proverbes': typeof CLUES_PROVERBES_FR !== 'undefined' ? CLUES_PROVERBES_FR : {},
    'disciple': typeof CLUES_DISCIPLE_FR !== 'undefined' ? CLUES_DISCIPLE_FR : {},
    'veiller': typeof CLUES_VEILLER_FR !== 'undefined' ? CLUES_VEILLER_FR : {},
    'aimee': typeof CLUES_AIMEE_FR !== 'undefined' ? CLUES_AIMEE_FR : {},
    'couple-solide': typeof CLUES_COUPLE_SOLIDE_FR !== 'undefined' ? CLUES_COUPLE_SOLIDE_FR : {},
    
    // Messages par défaut si un mot n'est pas trouvé
    'defaults': {
        'normal': 'Vertu chrétienne à découvrir',
        'sagesse': 'Trésor de sagesse à méditer',
        'proverbes': 'Parole de sagesse des Écritures',
        'disciple': 'Étape du chemin de disciple',
        'veiller': 'Élément du combat spirituel',
        'aimee': 'Reflet de l\'amour qui embrasse l\'infini et le prochain',
        'couple-solide': 'Clé d\'un couple chrétien réussi',
        'course': 'Vertu à découvrir dans la course'
    }
};

// Export pour utilisation dans le jeu
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CLUES_FR;
}
