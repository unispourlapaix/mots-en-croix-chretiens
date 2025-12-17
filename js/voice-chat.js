/**
 * Voice Chat System - Chat vocal P2P pour les rooms de jeu
 * S'intègre avec le système de chat texte existant
 */

class VoiceChatSystem {
    constructor(p2pChatSystem) {
        this.chatSystem = p2pChatSystem;
        this.localStream = null;
        this.voiceCalls = new Map(); // peerId → MediaConnection
        this.remoteStreams = new Map(); // peerId → MediaStream
        this.audioElements = new Map(); // peerId → HTMLAudioElement
        this.isMuted = false;
        this.isDeafened = false;
        this.isInVoiceRoom = false;
        this.volumeLevels = new Map(); // peerId → volume level
        
        // Configuration audio
        this.audioConstraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000
            }
        };
    }

    /**
     * Rejoindre le salon vocal de la room actuelle
     */
    async joinVoiceRoom() {
        if (this.isInVoiceRoom) {
            console.log('⚠️ Déjà dans un salon vocal');
            return;
        }

        if (!this.chatSystem.roomId) {
            throw new Error('Vous devez être dans une room de chat pour rejoindre le vocal');
        }

        try {
            // Demander l'accès au microphone
            this.localStream = await navigator.mediaDevices.getUserMedia(this.audioConstraints);
            
            console.log('🎤 Microphone activé');
            this.isInVoiceRoom = true;

            // Message adapté selon si seul ou avec d'autres
            const connectionCount = this.chatSystem.connections.size;
            const message = connectionCount === 0
                ? `🎤 ${this.chatSystem.username} est prêt en vocal (en attente d'autres joueurs)`
                : `🎤 ${this.chatSystem.username} a rejoint le vocal`;
            
            this.chatSystem.sendSystemMessage(message);

            // Établir les connexions vocales avec tous les peers existants
            this.chatSystem.connections.forEach((dataConn, peerId) => {
                if (dataConn.open) {
                    this.callPeer(peerId);
                }
            });

            // Écouter les appels entrants (nouveau dans cette session et futurs)
            this.setupIncomingCallListener();

            // Notifier l'UI
            this.dispatchVoiceEvent('joined', {
                roomId: this.chatSystem.roomId,
                participantCount: this.voiceCalls.size + 1
            });

            return true;

        } catch (error) {
            console.error('❌ Erreur accès microphone:', error);
            
            let errorMessage = 'Impossible d\'accéder au microphone';
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Permission microphone refusée. Veuillez autoriser l\'accès dans votre navigateur.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'Aucun microphone détecté sur votre appareil.';
            }
            
            throw new Error(errorMessage);
        }
    }

    /**
     * Quitter le salon vocal
     */
    leaveVoiceRoom() {
        if (!this.isInVoiceRoom) return;

        // Arrêter le stream local
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Fermer tous les appels
        this.voiceCalls.forEach((call, peerId) => {
            call.close();
        });
        this.voiceCalls.clear();

        // Arrêter tous les audio elements
        this.audioElements.forEach((audio, peerId) => {
            audio.pause();
            audio.srcObject = null;
        });
        this.audioElements.clear();
        this.remoteStreams.clear();

        this.isInVoiceRoom = false;
        this.isMuted = false;
        this.isDeafened = false;

        // Notifier
        this.chatSystem.sendSystemMessage(`🔇 ${this.chatSystem.username} a quitté le vocal`);
        
        this.dispatchVoiceEvent('left', {
            roomId: this.chatSystem.roomId
        });

        console.log('🔇 Salon vocal quitté');
    }

    /**
     * Appeler un peer spécifique
     */
    callPeer(peerId) {
        if (!this.localStream) {
            console.error('❌ Pas de stream local');
            return;
        }

        // Exclure les bots
        if (peerId.startsWith('bot-')) {
            console.log('⚠️ Appel vocal vers un bot ignoré:', peerId);
            return;
        }

        if (this.voiceCalls.has(peerId)) {
            console.log('⚠️ Appel déjà établi avec', peerId);
            return;
        }

        try {
            const call = this.chatSystem.peer.call(peerId, this.localStream);
            
            call.on('stream', (remoteStream) => {
                this.handleRemoteStream(peerId, remoteStream);
            });

            call.on('close', () => {
                this.handleCallClose(peerId);
            });

            call.on('error', (err) => {
                console.error('❌ Erreur appel avec', peerId, err);
            });

            this.voiceCalls.set(peerId, call);
            console.log('📞 Appel établi avec', peerId);

        } catch (error) {
            console.error('❌ Erreur appel peer:', error);
        }
    }

    /**
     * Écouter les appels entrants
     */
    setupIncomingCallListener() {
        if (!this.chatSystem.peer) return;

        this.chatSystem.peer.on('call', (call) => {
            console.log('📞 Appel entrant de', call.peer);

            // Ignorer les appels des bots
            if (call.peer.startsWith('bot-')) {
                console.log('⚠️ Appel vocal d\'un bot ignoré:', call.peer);
                call.close();
                return;
            }

            // Répondre avec notre stream local
            if (this.localStream && this.isInVoiceRoom) {
                call.answer(this.localStream);

                call.on('stream', (remoteStream) => {
                    this.handleRemoteStream(call.peer, remoteStream);
                });

                call.on('close', () => {
                    this.handleCallClose(call.peer);
                });

                this.voiceCalls.set(call.peer, call);
            } else {
                // Pas dans le vocal, refuser l'appel
                call.close();
            }
        });
    }

    /**
     * Gérer un stream distant
     */
    handleRemoteStream(peerId, stream) {
        this.remoteStreams.set(peerId, stream);

        // Créer ou récupérer l'élément audio
        let audio = this.audioElements.get(peerId);
        if (!audio) {
            audio = new Audio();
            audio.autoplay = true;
            this.audioElements.set(peerId, audio);
        }

        audio.srcObject = stream;
        
        // Appliquer le mute si actif
        if (this.isDeafened) {
            audio.volume = 0;
        }

        // Détecter l'activité vocale
        this.setupVoiceActivityDetection(peerId, stream);

        console.log('🔊 Stream distant reçu de', peerId);
        
        this.dispatchVoiceEvent('peerJoined', {
            peerId,
            participantCount: this.voiceCalls.size + 1
        });
    }

    /**
     * Gérer la fermeture d'un appel
     */
    handleCallClose(peerId) {
        this.voiceCalls.delete(peerId);
        
        const audio = this.audioElements.get(peerId);
        if (audio) {
            audio.pause();
            audio.srcObject = null;
            this.audioElements.delete(peerId);
        }

        this.remoteStreams.delete(peerId);
        this.volumeLevels.delete(peerId);

        console.log('📵 Appel fermé avec', peerId);
        
        this.dispatchVoiceEvent('peerLeft', {
            peerId,
            participantCount: this.voiceCalls.size + 1
        });
    }

    /**
     * Mute/Unmute le microphone
     */
    toggleMute() {
        if (!this.localStream) return;

        this.isMuted = !this.isMuted;
        
        this.localStream.getAudioTracks().forEach(track => {
            track.enabled = !this.isMuted;
        });

        console.log(this.isMuted ? '🔇 Micro coupé' : '🎤 Micro activé');
        
        this.dispatchVoiceEvent('muteChanged', {
            isMuted: this.isMuted
        });

        return this.isMuted;
    }

    /**
     * Deafen/Undeafen (couper le son des autres)
     */
    toggleDeafen() {
        this.isDeafened = !this.isDeafened;

        // Si on se deafen, on se mute aussi automatiquement
        if (this.isDeafened && !this.isMuted) {
            this.toggleMute();
        }

        // Appliquer à tous les audio elements
        this.audioElements.forEach(audio => {
            audio.volume = this.isDeafened ? 0 : 1;
        });

        console.log(this.isDeafened ? '🔇 Son coupé' : '🔊 Son activé');
        
        this.dispatchVoiceEvent('deafenChanged', {
            isDeafened: this.isDeafened
        });

        return this.isDeafened;
    }

    /**
     * Ajuster le volume d'un peer spécifique
     */
    setPeerVolume(peerId, volume) {
        const audio = this.audioElements.get(peerId);
        if (audio && !this.isDeafened) {
            audio.volume = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Détection d'activité vocale (Voice Activity Detection)
     */
    setupVoiceActivityDetection(peerId, stream) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;
            
            microphone.connect(analyser);

            // Vérifier le niveau sonore toutes les 100ms
            const checkVolume = () => {
                if (!this.remoteStreams.has(peerId)) {
                    // Stream fermé, arrêter la détection
                    audioContext.close();
                    return;
                }

                analyser.getByteFrequencyData(dataArray);
                
                // Calculer le volume moyen
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                const normalizedVolume = average / 255;

                // Seuil de détection de parole
                const isSpeaking = normalizedVolume > 0.01;

                this.volumeLevels.set(peerId, {
                    level: normalizedVolume,
                    isSpeaking: isSpeaking
                });

                this.dispatchVoiceEvent('volumeChange', {
                    peerId,
                    level: normalizedVolume,
                    isSpeaking: isSpeaking
                });

                setTimeout(checkVolume, 100);
            };

            checkVolume();

        } catch (error) {
            console.error('❌ Erreur VAD:', error);
        }
    }

    /**
     * Obtenir l'état vocal d'un peer
     */
    getPeerVoiceState(peerId) {
        return this.volumeLevels.get(peerId) || { level: 0, isSpeaking: false };
    }

    /**
     * Obtenir le nombre de participants vocaux
     */
    getVoiceParticipantCount() {
        return this.isInVoiceRoom ? this.voiceCalls.size + 1 : 0;
    }

    /**
     * Dispatcher un événement personnalisé
     */
    dispatchVoiceEvent(eventName, detail) {
        window.dispatchEvent(new CustomEvent(`voice${eventName}`, { detail }));
    }

    /**
     * Vérifier si le navigateur supporte WebRTC
     */
    static isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    /**
     * Nettoyer les ressources
     */
    destroy() {
        this.leaveVoiceRoom();
    }
}

// Export global
window.VoiceChatSystem = VoiceChatSystem;
