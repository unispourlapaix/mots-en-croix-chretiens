/**
 * Système de modales personnalisées
 * Remplace alert(), confirm() et prompt() avec un design cohérent
 */

class CustomModals {
    /**
     * Affiche une alerte personnalisée
     * @param {string} title - Titre de l'alerte
     * @param {string} message - Message de l'alerte
     * @param {string} buttonText - Texte du bouton (défaut: "OK")
     * @returns {Promise<void>}
     */
    static showAlert(title, message, buttonText = '✓ OK') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'custom-modal custom-alert-modal';
            modal.innerHTML = `
                <div class="custom-modal-overlay"></div>
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="custom-modal-body">
                        <p>${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="custom-modal-footer">
                        <button class="custom-modal-btn custom-modal-ok">${buttonText}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Animation d'entrée
            setTimeout(() => modal.classList.add('show'), 10);
            
            // Gérer le bouton
            const okBtn = modal.querySelector('.custom-modal-ok');
            const overlay = modal.querySelector('.custom-modal-overlay');
            
            const cleanup = () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                    resolve();
                }, 300);
            };
            
            okBtn.addEventListener('click', cleanup);
            overlay.addEventListener('click', cleanup);
            
            // Échap ou Entrée pour fermer
            const keyHandler = (e) => {
                if (e.key === 'Escape' || e.key === 'Enter') {
                    cleanup();
                    document.removeEventListener('keydown', keyHandler);
                }
            };
            document.addEventListener('keydown', keyHandler);
            
            // Focus sur le bouton
            setTimeout(() => okBtn.focus(), 100);
        });
    }

    /**
     * Affiche une confirmation personnalisée
     * @param {string} title - Titre de la confirmation
     * @param {string} message - Message de la confirmation
     * @param {string} confirmText - Texte du bouton de confirmation (défaut: "✓ Confirmer")
     * @param {string} cancelText - Texte du bouton d'annulation (défaut: "✗ Annuler")
     * @returns {Promise<boolean>}
     */
    static showConfirm(title, message, confirmText = '✓ Confirmer', cancelText = '✗ Annuler') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'custom-modal custom-confirm-modal';
            modal.innerHTML = `
                <div class="custom-modal-overlay"></div>
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="custom-modal-body">
                        <p>${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="custom-modal-footer">
                        <button class="custom-modal-btn custom-modal-cancel">${cancelText}</button>
                        <button class="custom-modal-btn custom-modal-ok">${confirmText}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Animation d'entrée
            setTimeout(() => modal.classList.add('show'), 10);
            
            // Gérer les boutons
            const cancelBtn = modal.querySelector('.custom-modal-cancel');
            const confirmBtn = modal.querySelector('.custom-modal-ok');
            const overlay = modal.querySelector('.custom-modal-overlay');
            
            const cleanup = (result) => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                    resolve(result);
                }, 300);
            };
            
            cancelBtn.addEventListener('click', () => cleanup(false));
            overlay.addEventListener('click', () => cleanup(false));
            confirmBtn.addEventListener('click', () => cleanup(true));
            
            // Échap pour annuler
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    cleanup(false);
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
            
            // Focus sur le bouton de confirmation
            setTimeout(() => confirmBtn.focus(), 100);
        });
    }

    /**
     * Affiche un prompt personnalisé avec champ de saisie
     * @param {string} title - Titre du prompt
     * @param {string} message - Message du prompt
     * @param {string} defaultValue - Valeur par défaut (défaut: "")
     * @param {string} placeholder - Placeholder du champ (défaut: "")
     * @param {string} confirmText - Texte du bouton de confirmation (défaut: "✓ OK")
     * @param {string} cancelText - Texte du bouton d'annulation (défaut: "✗ Annuler")
     * @returns {Promise<string|null>} - Valeur saisie ou null si annulé
     */
    static showPrompt(title, message, defaultValue = '', placeholder = '', confirmText = '✓ OK', cancelText = '✗ Annuler') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'custom-modal custom-prompt-modal';
            modal.innerHTML = `
                <div class="custom-modal-overlay"></div>
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="custom-modal-body">
                        <p>${message.replace(/\n/g, '<br>')}</p>
                        <input type="text" class="custom-modal-input" value="${defaultValue}" placeholder="${placeholder}" />
                    </div>
                    <div class="custom-modal-footer">
                        <button class="custom-modal-btn custom-modal-cancel">${cancelText}</button>
                        <button class="custom-modal-btn custom-modal-ok">${confirmText}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Animation d'entrée
            setTimeout(() => modal.classList.add('show'), 10);
            
            // Gérer les boutons
            const cancelBtn = modal.querySelector('.custom-modal-cancel');
            const confirmBtn = modal.querySelector('.custom-modal-ok');
            const overlay = modal.querySelector('.custom-modal-overlay');
            const input = modal.querySelector('.custom-modal-input');
            
            const cleanup = (result) => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                    resolve(result);
                }, 300);
            };
            
            cancelBtn.addEventListener('click', () => cleanup(null));
            overlay.addEventListener('click', () => cleanup(null));
            confirmBtn.addEventListener('click', () => cleanup(input.value));
            
            // Entrée pour confirmer
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    cleanup(input.value);
                }
            });
            
            // Échap pour annuler
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    cleanup(null);
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
            
            // Focus sur le champ de saisie
            setTimeout(() => {
                input.focus();
                input.select();
            }, 100);
        });
    }
}

// Export global pour compatibilité
window.CustomModals = CustomModals;
