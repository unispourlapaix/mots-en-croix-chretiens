// Système de navigation par onglets dans le menu
class MenuTabSystem {
    constructor() {
        this.currentTab = 'settings';
        this.init();
    }

    init() {
        // Écouter les clics sur les onglets
        const tabs = document.querySelectorAll('.menu-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // Vérifier l'authentification pour l'onglet chat
                if (tabName === 'chat') {
                    if (typeof authSystem !== 'undefined' && !authSystem.isAuthenticated()) {
                        // Fermer le menu et afficher l'auth modal
                        const menuModal = document.getElementById('menuModal');
                        if (menuModal) {
                            menuModal.classList.add('hidden');
                        }
                        authSystem.showAuthModal();
                        return;
                    }
                }

                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Mettre à jour l'onglet actif
        const tabs = document.querySelectorAll('.menu-tab');
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Mettre à jour le contenu actif
        const contents = document.querySelectorAll('.menu-tab-content');
        contents.forEach(content => {
            if (content.id === `${tabName}TabContent`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Mettre à jour le titre
        const title = document.getElementById('menuTitle');
        if (title) {
            if (tabName === 'settings') {
                title.textContent = '⚙️ Paramètres';
            } else if (tabName === 'chat') {
                title.textContent = '💬 Chat Communautaire';
            }
        }

        this.currentTab = tabName;
    }

    // Ouvrir directement un onglet spécifique
    openTab(tabName) {
        // Ouvrir le menu modal
        const modal = document.getElementById('menuModal');
        if (modal) {
            modal.classList.remove('hidden');
        }

        // Switcher vers l'onglet demandé
        this.switchTab(tabName);
    }
}

// Instance globale
const menuTabSystem = new MenuTabSystem();

// Export pour utilisation externe
if (typeof window !== 'undefined') {
    window.menuTabSystem = menuTabSystem;
}
