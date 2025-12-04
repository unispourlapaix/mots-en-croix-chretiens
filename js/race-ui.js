// Gestionnaire d'interface pour le mode course multijoueur
document.addEventListener('DOMContentLoaded', () => {
    const startRaceBtn = document.getElementById('startRaceButton');
    const stopRaceBtn = document.getElementById('stopRaceButton');
    const chatInput = document.getElementById('chatSmsInput');

    // Afficher les boutons quand une room est rejointe
    function updateRaceButtonsVisibility() {
        if (window.simpleChatSystem && window.simpleChatSystem.isInRoom()) {
            // Si une course est en cours, afficher le bouton stop
            if (window.multiplayerRace && window.multiplayerRace.isRaceMode) {
                if (startRaceBtn) startRaceBtn.style.display = 'none';
                if (stopRaceBtn) stopRaceBtn.style.display = 'block';
            } else {
                // Sinon, afficher le bouton start
                if (startRaceBtn) startRaceBtn.style.display = 'block';
                if (stopRaceBtn) stopRaceBtn.style.display = 'none';
            }
        } else {
            // Pas dans une room, cacher tous les boutons
            if (startRaceBtn) startRaceBtn.style.display = 'none';
            if (stopRaceBtn) stopRaceBtn.style.display = 'none';
        }
    }

    // Vérifier régulièrement l'état de la room
    setInterval(updateRaceButtonsVisibility, 1000);

    // Bouton démarrer course
    if (startRaceBtn) {
        startRaceBtn.addEventListener('click', () => {
            // Attendre que le système soit initialisé
            if (!window.multiplayerRace) {
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.showMessage('⚠️ Initialisation en cours, veuillez patienter...', 'system');
                }
                // Réessayer après 500ms
                setTimeout(() => {
                    if (window.multiplayerRace) {
                        startRaceBtn.click();
                    } else {
                        console.error('❌ Système de course non initialisé après attente');
                        if (window.simpleChatSystem) {
                            window.simpleChatSystem.showMessage('❌ Erreur: Système de course non disponible', 'system');
                        }
                    }
                }, 500);
                return;
            }

            // Vérifier que le jeu est en cours
            const gameScreen = document.getElementById('gameScreen');
            if (!gameScreen || gameScreen.classList.contains('hidden')) {
                if (window.simpleChatSystem) {
                    window.simpleChatSystem.showMessage('⚠️ Lancez d\'abord une partie !', 'system');
                }
                return;
            }

            window.multiplayerRace.startRace();
            
            // Basculer les boutons - IMPORTANT: masquer immédiatement
            startRaceBtn.style.display = 'none';
            if (stopRaceBtn) stopRaceBtn.style.display = 'block';
            
            console.log('🏁 Course démarrée - bouton start caché, bouton stop affiché');
        });
    }

    // Bouton arrêter course
    if (stopRaceBtn) {
        stopRaceBtn.addEventListener('click', () => {
            if (window.multiplayerRace) {
                window.multiplayerRace.stopRace();
            }

            // Cacher les deux boutons jusqu'à la fin naturelle de la course
            if (startRaceBtn) startRaceBtn.style.display = 'none';
            stopRaceBtn.style.display = 'none';
        });
    }

    // Écouter la fin de course pour réafficher le bouton démarrer
    window.addEventListener('raceEnded', () => {
        if (startRaceBtn) startRaceBtn.style.display = 'block';
        if (stopRaceBtn) stopRaceBtn.style.display = 'none';
        console.log('🏁 Course terminée - bouton start réaffiché');
    });

    // Commande rapide pour démarrer une course via le chat
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            const value = chatInput.value.trim().toLowerCase();
            
            // Commandes spéciales
            if (e.key === 'Enter' && value.startsWith('/')) {
                e.preventDefault();
                
                if (value === '/race' || value === '/course') {
                    // Démarrer la course
                    if (startRaceBtn && startRaceBtn.style.display !== 'none') {
                        startRaceBtn.click();
                        chatInput.value = '';
                    }
                } else if (value === '/stop') {
                    // Arrêter la course
                    if (stopRaceBtn && stopRaceBtn.style.display !== 'none') {
                        stopRaceBtn.click();
                        chatInput.value = '';
                    }
                } else if (value === '/help' || value === '/aide') {
                    // Afficher l'aide
                    if (window.simpleChatSystem) {
                        window.simpleChatSystem.showMessage('📝 Commandes disponibles:', 'system');
                        window.simpleChatSystem.showMessage('/race ou /course - Démarrer une course', 'system');
                        window.simpleChatSystem.showMessage('/stop - Arrêter la course', 'system');
                        window.simpleChatSystem.showMessage('/help ou /aide - Afficher cette aide', 'system');
                    }
                    chatInput.value = '';
                }
            }
        });
    }

    console.log('✅ Interface de course multijoueur initialisée');
});
