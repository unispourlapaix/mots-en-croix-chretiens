/**
 * Voice UI - Interface utilisateur pour le chat vocal
 * Intègre les contrôles vocaux dans le menu de chat
 */

class VoiceUI {
    constructor() {
        this.voiceSystem = null;
        this.chatSystem = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        // Attendre que le chat system soit prêt
        if (window.simpleChatSystem) {
            this.chatSystem = window.simpleChatSystem;
            this.voiceSystem = new VoiceChatSystem(this.chatSystem);
            this.isInitialized = true;
            this.setupUI();
            this.setupEventListeners();
        } else {
            // Réessayer dans 500ms
            setTimeout(() => this.init(), 500);
        }
    }

    setupUI() {
        // Vérifier si l'UI est déjà créée
        if (document.getElementById('voiceControlsSection')) {
            return; // Déjà créé
        }

        // Ajouter les contrôles vocaux dans le menu chat
        const chatContainer = document.querySelector('#chatMultiplayerSection');
        
        if (!chatContainer) {
            console.log('⏳ En attente du menu chat...');
            // Réessayer dans 1 seconde si le DOM n'est pas encore chargé
            setTimeout(() => this.setupUI(), 1000);
            return;
        }

        // Créer la section vocale
        const voiceSection = document.createElement('div');
        voiceSection.id = 'voiceControlsSection';
        voiceSection.className = 'voice-controls-section';
        voiceSection.innerHTML = `
            <div class="voice-header">
                <h3>🎤 Salon Vocal</h3>
                <span class="voice-participant-count" id="voiceParticipantCount">0 participant(s)</span>
            </div>
            
            <div class="voice-status" id="voiceStatus">
                <p class="text-muted">Créez ou rejoignez une room de chat pour activer le vocal</p>
            </div>
            
            <div class="voice-buttons" id="voiceButtons" style="display: none;">
                <button class="btn btn-voice-join" id="voiceJoinBtn">
                    🎤 Rejoindre le vocal
                </button>
                
                <button class="btn btn-voice-leave" id="voiceLeaveBtn" style="display: none;">
                    🔇 Quitter le vocal
                </button>
                
                <div class="voice-controls-row" id="voiceControlsRow" style="display: none;">
                    <button class="btn btn-voice-mute" id="voiceMuteBtn" title="Couper/Activer le micro">
                        🎤 Micro
                    </button>
                    
                    <button class="btn btn-voice-deafen" id="voiceDeafenBtn" title="Couper/Activer le son">
                        🔊 Son
                    </button>
                </div>
            </div>
            
            <div class="voice-participants-list" id="voiceParticipantsList" style="display: none;">
                <h4>Participants vocaux</h4>
                <div class="voice-participants" id="voiceParticipants"></div>
            </div>
        `;

        // Insérer à la fin du container chat
        chatContainer.appendChild(voiceSection);

        // Stocker les références
        this.elements = {
            status: document.getElementById('voiceStatus'),
            buttons: document.getElementById('voiceButtons'),
            joinBtn: document.getElementById('voiceJoinBtn'),
            leaveBtn: document.getElementById('voiceLeaveBtn'),
            muteBtn: document.getElementById('voiceMuteBtn'),
            deafenBtn: document.getElementById('voiceDeafenBtn'),
            controlsRow: document.getElementById('voiceControlsRow'),
            participantCount: document.getElementById('voiceParticipantCount'),
            participantsList: document.getElementById('voiceParticipantsList'),
            participants: document.getElementById('voiceParticipants'),
            // Contrôles dans le chat SMS flottant
            smsVoiceBtn: document.getElementById('chatSmsVoiceBtn'),
            smsVoicePopup: document.getElementById('chatSmsVoicePopup'),
            smsMuteBtn: document.getElementById('chatSmsMuteBtn'),
            smsDeafenBtn: document.getElementById('chatSmsDeafenBtn'),
            smsLeaveVoiceBtn: document.getElementById('chatSmsLeaveVoiceBtn'),
            voicePopupClose: document.getElementById('voicePopupClose')
        };
    }

    setupEventListeners() {
        if (!this.elements) return;

        // Bouton rejoindre
        this.elements.joinBtn?.addEventListener('click', () => this.handleJoinVoice());

        // Bouton quitter
        this.elements.leaveBtn?.addEventListener('click', () => this.handleLeaveVoice());

        // Bouton mute
        this.elements.muteBtn?.addEventListener('click', () => this.handleToggleMute());

        // Bouton deafen
        this.elements.deafenBtn?.addEventListener('click', () => this.handleToggleDeafen());

        // Bouton vocal SMS - rejoint ou ouvre popup selon l'état
        this.elements.smsVoiceBtn?.addEventListener('click', () => this.handleSmsVoiceClick());
        
        // Boutons dans le popup
        this.elements.smsMuteBtn?.addEventListener('click', () => {
            this.handleToggleMute();
            this.updateMuteButton(this.voiceSystem.isMuted);
        });
        this.elements.smsDeafenBtn?.addEventListener('click', () => {
            this.handleToggleDeafen();
            this.updateDeafenButton(this.voiceSystem.isDeafened);
        });
        this.elements.smsLeaveVoiceBtn?.addEventListener('click', () => {
            this.handleLeaveVoice();
            this.closeVoicePopup();
        });
        
        // Fermer le popup
        this.elements.voicePopupClose?.addEventListener('click', () => this.closeVoicePopup());
        
        // Fermer le popup en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (this.elements.smsVoicePopup && 
                this.elements.smsVoicePopup.style.display === 'block' &&
                !this.elements.smsVoicePopup.contains(e.target) &&
                !this.elements.smsVoiceBtn.contains(e.target)) {
                this.closeVoicePopup();
            }
        });

        // Écouter les événements du chat system
        window.addEventListener('roomCreated', () => {
            this.showVoiceSection();
            this.updateVoiceAvailability();
            this.updateSmsVoiceButton();
        });
        window.addEventListener('roomJoined', () => {
            this.showVoiceSection();
            this.updateVoiceAvailability();
            this.updateSmsVoiceButton();
        });

        // Écouter les événements vocaux
        window.addEventListener('voicejoined', (e) => this.handleVoiceJoined(e));
        window.addEventListener('voiceleft', (e) => this.handleVoiceLeft(e));
        window.addEventListener('voicepeerJoined', (e) => this.updateParticipants());
        window.addEventListener('voicepeerLeft', (e) => this.updateParticipants());
        window.addEventListener('voicemuteChanged', (e) => this.updateMuteButton(e.detail.isMuted));
        window.addEventListener('voicedeafenChanged', (e) => this.updateDeafenButton(e.detail.isDeafened));
        window.addEventListener('voicevolumeChange', (e) => this.updateParticipantVolume(e.detail));
        
        // Mettre à jour l'état du bouton SMS dès le départ
        this.updateSmsVoiceButton();

        // Vérifier périodiquement la disponibilité
        setInterval(() => this.updateVoiceAvailability(), 1000);
    }

    async handleJoinVoice() {
        if (!this.voiceSystem) return;

        try {
            this.elements.joinBtn.disabled = true;
            this.elements.joinBtn.textContent = '🎤 Connexion...';

            await this.voiceSystem.joinVoiceRoom();

        } catch (error) {
            console.error('❌ Erreur join vocal:', error);
            await CustomModals.showAlert('❌ Erreur Vocal', error.message || 'Impossible de rejoindre le salon vocal');
            
            this.elements.joinBtn.disabled = false;
            this.elements.joinBtn.textContent = '🎤 Rejoindre le vocal';
        }
    }

    handleSmsVoiceClick() {
        const inVoice = this.voiceSystem?.isInVoiceRoom;
        
        if (inVoice) {
            // Déjà en vocal - ouvrir le popup de contrôles
            this.openVoicePopup();
        } else {
            // Pas encore en vocal - rejoindre
            this.handleJoinVoice();
        }
    }

    openVoicePopup() {
        if (!this.elements.smsVoicePopup) return;
        this.elements.smsVoicePopup.style.display = 'block';
        
        // Mettre à jour l'état des boutons
        this.updatePopupButtons();
    }

    closeVoicePopup() {
        if (!this.elements.smsVoicePopup) return;
        this.elements.smsVoicePopup.style.display = 'none';
    }

    updatePopupButtons() {
        if (!this.voiceSystem) return;
        
        // Mettre à jour le style des boutons selon l'état
        if (this.elements.smsMuteBtn) {
            if (this.voiceSystem.isMuted) {
                this.elements.smsMuteBtn.classList.add('muted');
            } else {
                this.elements.smsMuteBtn.classList.remove('muted');
            }
        }
        
        if (this.elements.smsDeafenBtn) {
            if (this.voiceSystem.isDeafened) {
                this.elements.smsDeafenBtn.classList.add('deafened');
            } else {
                this.elements.smsDeafenBtn.classList.remove('deafened');
            }
        }
    }

    handleLeaveVoice() {
        if (!this.voiceSystem) return;
        this.voiceSystem.leaveVoiceRoom();
    }

    handleToggleMute() {
        if (!this.voiceSystem) return;
        this.voiceSystem.toggleMute();
    }

    handleToggleDeafen() {
        if (!this.voiceSystem) return;
        this.voiceSystem.toggleDeafen();
    }

    handleVoiceJoined(event) {
        // Mettre à jour l'UI
        const participantCount = this.voiceSystem.getVoiceParticipantCount();
        const statusMessage = participantCount === 1 
            ? '🎤 Connecté au salon vocal (en attente d\'autres joueurs)'
            : `🎤 Connecté au salon vocal (${participantCount} participants)`;
        
        this.elements.status.innerHTML = `<p class="text-success">${statusMessage}</p>`;
        
        // Changer le style du bouton pour indiquer qu'on est en vocal
        if (this.elements.smsVoiceBtn) {
            this.elements.smsVoiceBtn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            this.elements.smsVoiceBtn.title = 'Contrôles vocaux (cliquer pour ouvrir)';
        }
        
        this.elements.joinBtn.style.display = 'none';
        this.elements.leaveBtn.style.display = 'block';
        this.elements.controlsRow.style.display = 'flex';
        this.elements.participantsList.style.display = 'block';
        
        this.updateParticipants();
    }

    handleVoiceLeft(event) {
        // Réinitialiser l'UI
        this.elements.status.innerHTML = '<p class="text-muted">Prêt à rejoindre le vocal</p>';
        this.elements.joinBtn.style.display = 'block';
        this.elements.joinBtn.disabled = false;
        this.elements.joinBtn.textContent = '🎤 Rejoindre le vocal';
        this.elements.leaveBtn.style.display = 'none';
        this.elements.controlsRow.style.display = 'none';
        this.elements.participantsList.style.display = 'none';
        
        // Fermer le popup s'il est ouvert
        this.closeVoicePopup();
        
        // Remettre le bouton en mode "rejoindre"
        if (this.elements.smsVoiceBtn) {
            this.elements.smsVoiceBtn.style.background = 'linear-gradient(135deg, #ff69b4, #ff85c1)';
            this.elements.smsVoiceBtn.title = 'Rejoindre le salon vocal';
        }
        
        // Mettre à jour l'état du bouton
        this.updateSmsVoiceButton();
        
        this.updateMuteButton(false);
        this.updateDeafenButton(false);
        this.updateParticipants();
    }

    showVoiceSection() {
        const section = document.getElementById('voiceControlsSection');
        if (section) {
            section.style.display = 'block';
        }
    }

    hideVoiceSection() {
        const section = document.getElementById('voiceControlsSection');
        if (section) {
            section.style.display = 'none';
        }
    }

    updateSmsVoiceButton() {
        const voiceBtn = this.elements?.smsVoiceBtn;
        if (!voiceBtn) return;

        // Vérifier si on est dans une room (via chatSystem.roomId OU simpleChatSystem.roomCode)
        const inRoom = (this.chatSystem && !!this.chatSystem.roomId) || 
                       (window.simpleChatSystem && !!window.simpleChatSystem.roomCode);
        const inVoice = this.voiceSystem?.isInVoiceRoom;

        // Toujours afficher le bouton
        voiceBtn.style.display = 'flex';

        if (inVoice) {
            // En vocal - bouton vert pour ouvrir les contrôles
            voiceBtn.disabled = false;
            voiceBtn.style.opacity = '1';
            voiceBtn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            voiceBtn.title = 'Contrôles vocaux (cliquer pour ouvrir)';
        } else if (inRoom) {
            // Dans une room mais pas en vocal - bouton rose pour rejoindre
            voiceBtn.disabled = false;
            voiceBtn.style.opacity = '1';
            voiceBtn.style.background = 'linear-gradient(135deg, #ff69b4, #ff85c1)';
            voiceBtn.title = 'Rejoindre le salon vocal';
        } else {
            // Pas dans une room - bouton grisé
            voiceBtn.disabled = true;
            voiceBtn.style.opacity = '0.4';
            voiceBtn.style.background = 'linear-gradient(135deg, #95a5a6, #b2bec3)';
            voiceBtn.title = 'Rejoignez un joueur pour activer le vocal';
        }
    }

    updateVoiceAvailability() {
        if (!this.chatSystem || !this.elements) return;

        const inRoom = !!this.chatSystem.roomId;
        const inVoice = this.voiceSystem?.isInVoiceRoom;
        
        // Debug (log uniquement si vocal actif ou debug avancé)
        if (window.CONFIG?.enableLogs && (inVoice || inRoom)) {
            console.log('🔍 Voice availability check:', {
                roomId: this.chatSystem.roomId,
                inRoom,
                inVoice,
                hasConnections: this.chatSystem.connections?.size > 0
            });
        }

        if (inVoice) {
            // Déjà connecté au vocal - ne rien changer (géré par handleVoiceJoined)
            return;
        } else if (inRoom) {
            this.elements.status.innerHTML = '<p class="text-success">✅ Room active - Vocal disponible</p>';
            this.elements.buttons.style.display = 'block';
        } else {
            this.elements.status.innerHTML = '<p class="text-muted">Créez ou rejoignez une room de chat pour activer le vocal</p>';
            this.elements.buttons.style.display = 'none';
        }
    }

    updateMuteButton(isMuted) {
        if (!this.elements.muteBtn) return;
        
        this.elements.muteBtn.textContent = isMuted ? '🔇 Micro' : '🎤 Micro';
        this.elements.muteBtn.classList.toggle('muted', isMuted);
        
        // Mettre à jour aussi le bouton SMS dans le popup
        if (this.elements.smsMuteBtn) {
            this.elements.smsMuteBtn.classList.toggle('muted', isMuted);
        }
        
        // Griser l'icône principale quand muté
        if (this.elements.smsVoiceBtn) {
            if (isMuted) {
                this.elements.smsVoiceBtn.style.background = 'linear-gradient(135deg, #95a5a6, #b2bec3)';
                this.elements.smsVoiceBtn.style.opacity = '0.7';
                this.elements.smsVoiceBtn.title = 'Micro coupé (cliquer pour les contrôles)';
            } else {
                this.elements.smsVoiceBtn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
                this.elements.smsVoiceBtn.style.opacity = '1';
                this.elements.smsVoiceBtn.title = 'Contrôles vocaux (cliquer pour ouvrir)';
            }
        }
    }

    updateDeafenButton(isDeafened) {
        if (!this.elements.deafenBtn) return;
        
        this.elements.deafenBtn.textContent = isDeafened ? '🔇 Son' : '🔊 Son';
        this.elements.deafenBtn.classList.toggle('deafened', isDeafened);
        
        // Mettre à jour aussi le bouton SMS dans le popup
        if (this.elements.smsDeafenBtn) {
            this.elements.smsDeafenBtn.classList.toggle('deafened', isDeafened);
        }
    }

    updateParticipants() {
        if (!this.voiceSystem || !this.elements.participants) return;

        const count = this.voiceSystem.getVoiceParticipantCount();
        const countText = count === 1 
            ? '1 participant (vous)' 
            : `${count} participant(s)`;
        this.elements.participantCount.textContent = countText;

        // Construire la liste des participants
        const participants = [];
        
        // Ajouter soi-même
        participants.push({
            username: this.chatSystem.username,
            color: this.chatSystem.userColor,
            isSelf: true,
            isSpeaking: false
        });

        // Ajouter les autres peers (exclure les bots)
        this.chatSystem.connections.forEach((conn, peerId) => {
            // Exclure les bots
            if (peerId.startsWith('bot-')) {
                return;
            }
            
            if (this.voiceSystem.voiceCalls.has(peerId)) {
                const voiceState = this.voiceSystem.getPeerVoiceState(peerId);
                participants.push({
                    username: conn.metadata?.username || 'Utilisateur',
                    color: conn.metadata?.color || '#999',
                    isSelf: false,
                    isSpeaking: voiceState.isSpeaking,
                    peerId: peerId
                });
            }
        });

        // Afficher (filtrer les participants sans username)
        this.elements.participants.innerHTML = participants
            .filter(p => p.username && typeof p.username === 'string')
            .map(p => `
            <div class="voice-participant ${p.isSpeaking ? 'speaking' : ''}" data-peer-id="${p.peerId || 'self'}">
                <div class="participant-avatar" style="background-color: ${p.color}">
                    ${p.username.charAt(0).toUpperCase()}
                </div>
                <div class="participant-info">
                    <div class="participant-name" style="color: ${p.color}">
                        ${p.username} ${p.isSelf ? '(vous)' : ''}
                    </div>
                    <div class="participant-status">
                        ${p.isSpeaking ? '🎤 Parle' : ''}
                    </div>
                </div>
                ${!p.isSelf ? '<div class="volume-indicator"></div>' : ''}
            </div>
        `).join('');
    }

    updateParticipantVolume(detail) {
        const { peerId, level, isSpeaking } = detail;
        const participant = this.elements.participants?.querySelector(`[data-peer-id="${peerId}"]`);
        
        if (participant) {
            participant.classList.toggle('speaking', isSpeaking);
            
            const volumeIndicator = participant.querySelector('.volume-indicator');
            if (volumeIndicator) {
                volumeIndicator.style.width = `${level * 100}%`;
            }
        }
    }
}

// Styles CSS inline (à déplacer dans un fichier CSS si besoin)
const voiceStyles = document.createElement('style');
voiceStyles.textContent = `
    .voice-controls-section {
        margin-top: 20px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 2px solid rgba(255, 105, 180, 0.3);
    }

    .voice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .voice-header h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #ff69b4;
    }

    .voice-participant-count {
        font-size: 0.9rem;
        color: #999;
    }

    .voice-status {
        margin: 10px 0;
        padding: 10px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        text-align: center;
    }

    .voice-status p {
        margin: 0;
        font-size: 0.9rem;
    }

    .voice-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 15px 0;
    }

    .voice-controls-row {
        display: flex;
        gap: 10px;
    }

    .btn-voice-join,
    .btn-voice-leave,
    .btn-voice-mute,
    .btn-voice-deafen {
        padding: 10px 15px;
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
    }

    .btn-voice-join {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .btn-voice-join:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-voice-join:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-voice-leave {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
    }

    .btn-voice-leave:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
    }

    .btn-voice-mute,
    .btn-voice-deafen {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .btn-voice-mute:hover,
    .btn-voice-deafen:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
    }

    .btn-voice-mute.muted,
    .btn-voice-deafen.deafened {
        background: rgba(255, 69, 69, 0.3);
        border-color: rgba(255, 69, 69, 0.5);
    }

    .voice-participants-list {
        margin-top: 15px;
    }

    .voice-participants-list h4 {
        font-size: 0.9rem;
        color: #ff69b4;
        margin-bottom: 10px;
    }

    .voice-participants {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .voice-participant {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .voice-participant.speaking {
        background: rgba(102, 126, 234, 0.2);
        border: 2px solid rgba(102, 126, 234, 0.5);
    }

    .participant-avatar {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 1.1rem;
    }

    .participant-info {
        flex: 1;
    }

    .participant-name {
        font-weight: 600;
        font-size: 0.9rem;
    }

    .participant-status {
        font-size: 0.75rem;
        color: #999;
        margin-top: 2px;
    }

    .volume-indicator {
        width: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 2px;
        transition: width 0.1s ease;
    }

    .text-muted {
        color: #999 !important;
    }

    .text-success {
        color: #10ac84 !important;
    }

    /* Contrôles vocaux dans le chat SMS flottant */
    .chat-sms-voice-controls {
        display: none;
        gap: 8px;
        padding: 8px;
        background: rgba(102, 126, 234, 0.1);
        border-bottom: 1px solid rgba(255, 105, 180, 0.2);
        justify-content: center;
    }

    .chat-sms-voice-btn {
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .chat-sms-voice-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }

    .chat-sms-voice-btn.muted,
    .chat-sms-voice-btn.deafened {
        background: rgba(255, 69, 69, 0.3);
        border-color: rgba(255, 69, 69, 0.5);
    }

    .chat-sms-voice-btn.danger {
        background: rgba(245, 87, 108, 0.3);
    }

    .chat-sms-voice-btn.danger:hover {
        background: rgba(245, 87, 108, 0.5);
    }
`;
document.head.appendChild(voiceStyles);

// Initialiser automatiquement
window.addEventListener('DOMContentLoaded', () => {
    window.voiceUI = new VoiceUI();
});
