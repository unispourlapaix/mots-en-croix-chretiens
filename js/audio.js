/**
 * Système audio pour Mots Croisés Chrétiens
 * Sons subtils, chaleureux et zen + Playlist musicale Gospel
 */

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3; // Volume général subtil
        this.enabled = true;
        
        // Système de playlist musicale
        this.musicEnabled = true;
        this.musicVolume = 0.15; // Volume musique (plus faible que les effets)
        this.currentTrack = null;
        this.currentAudio = null;
        this.playlist = [];
        this.playedTracks = new Set();
        this.currentMode = 'normal';
        
        // Charger les préférences audio
        const savedEnabled = localStorage.getItem('audio_enabled');
        if (savedEnabled !== null) {
            this.enabled = savedEnabled === 'true';
        }
        
        const savedMusicEnabled = localStorage.getItem('music_enabled');
        if (savedMusicEnabled !== null) {
            this.musicEnabled = savedMusicEnabled === 'true';
        }
        
        this.init();
        this.initPlaylist();
    }
    
    init() {
        // Créer le contexte audio et démarrer la musique lors de la première interaction utilisateur
        const startAudio = () => {
            this.ensureAudioContext();
            // Démarrer la musique dès le premier clic
            if (this.musicEnabled && !this.currentAudio) {
                this.playNextTrack();
            }
        };
        
        document.addEventListener('click', startAudio, { once: true });
        document.addEventListener('keydown', startAudio, { once: true });
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
            
            // S'assurer que now est toujours positif et dans le futur
            const now = Math.max(this.audioContext.currentTime + 0.001, 0.001);
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
            // Erreur audio ignorée en silence (logs désactivés)
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
     * Activer/désactiver la musique
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem('music_enabled', this.musicEnabled.toString());
        
        if (!this.musicEnabled && this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        } else if (this.musicEnabled && !this.currentAudio) {
            this.playNextTrack();
        }
        
        return this.musicEnabled;
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
    
    /**
     * Définir le volume de la musique
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio) {
            this.currentAudio.volume = this.musicVolume;
        }
    }
    
    /**
     * Initialiser la playlist avec thèmes par mode
     */
    initPlaylist() {
        // Chansons thématiques par mode de jeu
        this.themesByMode = {
            'normal': [
                'Psaumes-27-De-David-LEternel-est-ma-lumiere-et-mon-salut.mp3',
                'La-voix-de-la-Sagesse.mp3',
                'Jesus-Seul.mp3',
                'Que-Je-Vive.mp3',
                'Il-est-lAmour.mp3'
            ],
            'couple': [
                'Amour-Divin.mp3',
                'Tu-es-mon-amour-Jesus.mp3',
                'Qu-est-ce-que-l-amour.mp3',
                'L-Amour-pour-les-autres.mp3',
                'Revetez-vous-d-Amour.mp3',
                'Un-tresor-d-amour-qui-te-libere.mp3'
            ],
            'sagesse': [
                'La-voix-de-la-Sagesse.mp3',
                'Psaumes-34-Preserve-tes-mots-du-mal-rmx.mp3',
                'La-Parole-est-venue.mp3',
                'Le-Chemin-de-la-vie.mp3',
                'Porteur-de-lumiere.mp3'
            ],
            'proverbes': [
                'La-voix-de-la-Sagesse.mp3',
                'Psaumes-34-Preserve-tes-mots-du-mal-rmx.mp3',
                'Veille-a-ton-cœur.mp3',
                'Marche-avec-moi-Exode-33.mp3'
            ],
            'disciple': [
                'Jai-decide-de-marcher-Avec-Jesus.mp3',
                'Choisi-pour-porter-la-bonne-nouvelle.mp3',
                'Il-m-a-choisi-pour-porter-la-bonne-nouvelle.mp3',
                'Prechez-la-nouvelle-la-bonne-nouvelle-rmx.mp3',
                'Chosen-by-God.mp3'
            ],
            'veiller': [
                'Reste-eveille-avec-moi.mp3',
                'Tiens-bon-tiens-bon.mp3',
                'Prends-courage-et-tiens-bon-rmx.mp3',
                'N-abandonne-pas.mp3',
                'Court-jusqu-au-bout.mp3'
            ],
            'aimee': [
                'Amour-de-Jesus-je-taime.mp3',
                'Tu-es-mon-amour-Jesus.mp3',
                'Il-est-lAmour.mp3',
                'Mon-ti-Jesus.mp3',
                'C-est-mon-Jesus-he.mp3'
            ]
        };
        
        // Toutes les chansons disponibles (pour le mode aléatoire)
        this.allTracks = [
            'A-quien-hablas-Gracias-Senor.mp3',
            'Above-All-remix-v2.mp3',
            'Amour-de-Jesus-je-taime.mp3',
            'Amour-Divin.mp3',
            'Choisi-pour-porter-la-bonne-nouvelle.mp3',
            'Chosen-by-God.mp3',
            'Congratulations-Ive-won-yeah.mp3',
            'Cours-vers-ta-destinee.mp3',
            'Court-jusqu-au-bout.mp3',
            'Crie-de-joie-rejouis-toi.mp3',
            'C-est-mon-Jesus-he.mp3',
            'Esperance.mp3',
            'Fais-un-pas-en-avant.mp3',
            'Flame-Inside.mp3',
            'Happy-the-man.mp3',
            'Harmonie-de-priere-pour-la-Paix.mp3',
            'Il-est-lAmour.mp3',
            'Il-m-a-choisi-pour-porter-la-bonne-nouvelle.mp3',
            'Il-y-a-un-espoir-pour-toi-pour-moi.mp3',
            'It-echoes-in-my-heart.mp3',
            'Jai-decide-de-marcher-Avec-Jesus.mp3',
            'Je-chante-et-danse.mp3',
            'Je-chante-je-danse-dans-ton-amour.mp3',
            'Je-dis-boum.mp3',
            'Jesus-mon-Roi-mon-Sauveur.mp3',
            'Jesus-Seul.mp3',
            'La-couronne-de-vie.mp3',
            'La-paix-en-Jesus.mp3',
            'La-paix-renait-toujours.mp3',
            'La-Parole-est-venue.mp3',
            'La-repentance.mp3',
            'La-vie-eternelle-t-appelle.mp3',
            'La-voix-de-la-Sagesse.mp3',
            'Le-Chemin-de-la-vie.mp3',
            'Le-Combats-Spirituel.mp3',
            'Le-Feux-De-lAmour.mp3',
            'Les-battement-Du-bonheur.mp3',
            'L-Amour-pour-les-autres.mp3',
            'Marche-avec-moi-Exode-33.mp3',
            'Messagers-de-Paix.mp3',
            'Mon-coeur.mp3',
            'Mon-cœur-bat.mp3',
            'Mon-ti-Jesus.mp3',
            'Move-with-Joy.mp3',
            'N-abandonne-pas.mp3',
            'N-aie-pas-peur.mp3',
            'N-aie-pas-peur-Je-viens-moi-meme-a-ton-secours.mp3',
            'Nuage-d-amour.mp3',
            'o-Dieu-ecoute-notre-priere.mp3',
            'Porteur-de-lumiere.mp3',
            'Pour-Que-Je-Vive.mp3',
            'Pouring-Light.mp3',
            'Praise-ye-the-LORD-O-my-soul.mp3',
            'Prechez-la-nouvelle-la-bonne-nouvelle-rmx.mp3',
            'Prends-courage-et-tiens-bon-rmx.mp3',
            'Priez-pour-resister-au-mal.mp3',
            'Psaumes-27-De-David-Il-ne-tabandonnera-pas.mp3',
            'Psaumes-27-De-David-LEternel-est-ma-lumiere-et-mon-salut.mp3',
            'Psaumes-34-Preserve-tes-mots-du-mal-rmx.mp3',
            'Psaumes-71-Jesus-viens-a-mon-secours.mp3',
            'Quand-tout-semblait-sombrer.mp3',
            'Que-Je-Vive.mp3',
            'Qu-est-ce-que-l-amour.mp3',
            'Reste-eveille-avec-moi.mp3',
            'Revetez-vous-d-Amour.mp3',
            'Sans-charite-mon-cœur-s-eteint.mp3',
            'Ta-paix-guide-mes-pas.mp3',
            'Tiens-bon-tiens-bon.mp3',
            'Tu-es-appele-a-porte-la-paix.mp3',
            'Tu-es-mon-amour-Jesus.mp3',
            'Un-pas-a-la-fois.mp3',
            'Un-tresor-d-amour-qui-te-libere.mp3',
            'Un-vent-dEspoir.mp3',
            'Unis-pour-la-paix-dans-le-respect.mp3',
            'UnisPourLaPaix.mp3',
            'Unite.mp3',
            'Veille-a-ton-cœur.mp3',
            'Voici-ma-priere.mp3'
        ];
    }
    
    /**
     * Changer de mode et mettre à jour la playlist
     */
    setGameMode(mode) {
        if (this.currentMode === mode) return;
        
        console.log(`🎵 Changement de mode musical: ${mode}`);
        this.currentMode = mode;
        this.playedTracks.clear();
        
        // Arrêter la musique actuelle et démarrer avec le nouveau thème
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        if (this.musicEnabled) {
            this.playNextTrack();
        }
    }
    
    /**
     * Jouer la prochaine piste
     */
    playNextTrack() {
        if (!this.musicEnabled) return;
        
        // 1. D'abord jouer les chansons thématiques du mode
        const themeTracksForMode = this.themesByMode[this.currentMode] || [];
        const unplayedThemes = themeTracksForMode.filter(track => !this.playedTracks.has(track));
        
        let nextTrack;
        
        if (unplayedThemes.length > 0) {
            // Jouer une chanson thématique non encore jouée
            nextTrack = unplayedThemes[Math.floor(Math.random() * unplayedThemes.length)];
            console.log(`🎵 Lecture thème ${this.currentMode}: ${nextTrack}`);
        } else {
            // 2. Ensuite jouer aléatoirement dans toutes les chansons
            const unplayedAll = this.allTracks.filter(track => !this.playedTracks.has(track));
            
            if (unplayedAll.length === 0) {
                // Toutes les chansons ont été jouées, recommencer
                this.playedTracks.clear();
                nextTrack = this.allTracks[Math.floor(Math.random() * this.allTracks.length)];
                console.log(`🎵 Playlist complétée, recommence: ${nextTrack}`);
            } else {
                nextTrack = unplayedAll[Math.floor(Math.random() * unplayedAll.length)];
                console.log(`🎵 Lecture aléatoire: ${nextTrack}`);
            }
        }
        
        this.playTrack(nextTrack);
    }
    
    /**
     * Jouer une piste spécifique
     */
    playTrack(trackName) {
        if (!this.musicEnabled) return;
        
        // Arrêter la piste actuelle si elle existe
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        this.currentTrack = trackName;
        this.playedTracks.add(trackName);
        
        const audio = new Audio(`/public/gospel/${trackName}`);
        audio.volume = this.musicVolume;
        
        // Quand la piste se termine, jouer la suivante
        audio.addEventListener('ended', () => {
            this.playNextTrack();
        });
        
        // Gestion des erreurs - Éviter la boucle infinie
        let errorHandled = false;
        audio.addEventListener('error', (e) => {
            if (errorHandled) return;
            errorHandled = true;
            
            console.warn(`⚠️ Erreur de chargement: ${trackName}`, e);
            // Attendre avant de passer à la suivante pour éviter la boucle
            setTimeout(() => {
                this.playNextTrack();
            }, 1000);
        });
        
        audio.play().catch(err => {
            if (errorHandled) return;
            errorHandled = true;
            
            console.warn(`⚠️ Impossible de jouer: ${trackName}`, err);
            // Attendre avant de passer à la suivante
            setTimeout(() => {
                this.playNextTrack();
            }, 1000);
        });
        
        this.currentAudio = audio;
    }
    
    /**
     * Arrêter la musique
     */
    stopMusic() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
            this.currentTrack = null;
        }
    }
    
    /**
     * Passer à la piste suivante
     */
    skipTrack() {
        this.playNextTrack();
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
