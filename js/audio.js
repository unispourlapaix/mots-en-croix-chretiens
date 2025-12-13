/**
 * Système audio pour Mots Croisés Chrétiens
 * Sons subtils, chaleureux et zen
 */

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3; // Volume général subtil
        this.enabled = true;
        
        // Charger les préférences audio
        const savedEnabled = localStorage.getItem('audio_enabled');
        if (savedEnabled !== null) {
            this.enabled = savedEnabled === 'true';
        }
        
        this.init();
    }
    
    init() {
        // Créer le contexte audio lors de la première interaction utilisateur
        document.addEventListener('click', () => this.ensureAudioContext(), { once: true });
        document.addEventListener('keydown', () => this.ensureAudioContext(), { once: true });
    }
    
    ensureAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    /**
     * Jouer une note avec une enveloppe ADSR
     */
    playNote(frequency, duration, type = 'sine', volume = 1.0) {
        if (!this.enabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = type;
            
            const now = Math.max(0, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(frequency, now);
            
            const attack = 0.01;
            const decay = 0.1;
            const sustain = volume * this.masterVolume * 0.7;
            const release = 0.2;
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume * this.masterVolume, now + attack);
            gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
            gainNode.gain.setValueAtTime(sustain, now + duration - release);
            gainNode.gain.linearRampToValueAtTime(0, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (e) {
            console.warn('Erreur audio:', e);
        }
    }
    
    /**
     * Son de placement de lettre - doux et subtil
     */
    playLetterPlace() {
        if (!this.enabled || !this.audioContext) return;
        
        // Note douce et courte
        this.playNote(523.25, 0.08, 'sine', 0.4); // Do5
    }
    
    /**
     * Son de mot valide - encourageant et harmonieux
     */
    playWordValid() {
        if (!this.enabled || !this.audioContext) return;
        
        // Arpège ascendant chaleureux
        setTimeout(() => this.playNote(523.25, 0.15, 'sine', 0.5), 0);    // Do5
        setTimeout(() => this.playNote(659.25, 0.15, 'sine', 0.5), 80);   // Mi5
        setTimeout(() => this.playNote(783.99, 0.25, 'sine', 0.6), 160);  // Sol5
    }
    
    /**
     * Son d'erreur - doux et non agressif
     */
    playError() {
        if (!this.enabled || !this.audioContext) return;
        
        // Note descendante douce
        this.playNote(392.00, 0.2, 'sine', 0.3); // Sol4
        setTimeout(() => this.playNote(349.23, 0.3, 'sine', 0.3), 100); // Fa4
    }
    
    /**
     * Son de victoire - joyeux mais zen
     */
    playVictory() {
        if (!this.enabled || !this.audioContext) return;
        
        // Mélodie céleste et apaisante
        const melody = [
            { freq: 523.25, delay: 0 },    // Do5
            { freq: 659.25, delay: 150 },  // Mi5
            { freq: 783.99, delay: 300 },  // Sol5
            { freq: 1046.50, delay: 450 }, // Do6
            { freq: 783.99, delay: 600 },  // Sol5
            { freq: 1046.50, delay: 750 }  // Do6
        ];
        
        melody.forEach(note => {
            setTimeout(() => this.playNote(note.freq, 0.4, 'sine', 0.6), note.delay);
        });
    }
    
    /**
     * Son de clic interface - très subtil
     */
    playClick() {
        if (!this.enabled || !this.audioContext) return;
        
        this.playNote(880.00, 0.05, 'sine', 0.2); // La5
    }
    
    /**
     * Son de changement d'onglet - doux
     */
    playTabSwitch() {
        if (!this.enabled || !this.audioContext) return;
        
        this.playNote(659.25, 0.08, 'sine', 0.3); // Mi5
    }
    
    /**
     * Son de connexion réussie - accueillant
     */
    playLoginSuccess() {
        if (!this.enabled || !this.audioContext) return;
        
        setTimeout(() => this.playNote(523.25, 0.15, 'sine', 0.5), 0);   // Do5
        setTimeout(() => this.playNote(783.99, 0.25, 'sine', 0.6), 100); // Sol5
    }
    
    /**
     * Son de message reçu - notification douce
     */
    playMessageReceived() {
        if (!this.enabled || !this.audioContext) return;
        
        this.playNote(698.46, 0.15, 'sine', 0.4); // Fa5
        setTimeout(() => this.playNote(830.61, 0.15, 'sine', 0.4), 100); // Sol#5
    }
    
    /**
     * Activer/désactiver les sons
     */
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('audio_enabled', this.enabled.toString());
        
        // Feedback sonore du toggle
        if (this.enabled) {
            this.playClick();
        }
        
        return this.enabled;
    }
    
    /**
     * Vérifier si les sons sont activés
     */
    isEnabled() {
        return this.enabled;
    }
    
    /**
     * Définir le volume principal
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

// Instance globale
window.audioSystem = new AudioSystem();
