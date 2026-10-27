/**
 * Celestial Audio Engine
 * Provides peaceful 432Hz ambient singing-bowl & harmonic drone background music
 * paired with a measured, contemplative UK British English voice narration
 * for the 2-3 minute daily horoscope audio broadcast.
 */

class CelestialAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isAmbiencePlaying = false;
  private ambienceGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private ambientVolume = 0.25;

  // Speech Narration State
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isPaused = false;
  private progressCallback: ((currentTime: number, duration: number, isPlaying: boolean) => void) | null = null;
  private timerInterval: any = null;
  private elapsedSeconds = 0;
  private estimatedDuration = 160; // ~2.5 - 3 minutes (160 seconds)

  /**
   * Initializes or resumes the Web Audio context (must be called upon user interaction)
   */
  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Plays peaceful 432Hz harmonic celestial background meditation music
   */
  public startAmbientMusic(volume = 0.22) {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      if (this.isAmbiencePlaying) {
        if (this.ambienceGain) {
          this.ambienceGain.gain.setTargetAtTime(volume, this.audioCtx.currentTime, 0.5);
        }
        return;
      }

      this.ambientVolume = volume;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Master Gain for ambient music
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, now);
      masterGain.gain.exponentialRampToValueAtTime(volume, now + 2); // Soft 2-second fade-in
      masterGain.connect(ctx.destination);
      this.ambienceGain = masterGain;

      // Harmonic Frequencies based on 432Hz sacred tuning:
      // 108Hz (Deep root bowl), 216Hz (Grounding octave), 432Hz (Celestial fundamental), 648Hz (Cosmic 5th)
      const freqs = [108, 216, 432, 648];
      this.oscillators = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        // Sine & triangle waves for warm, soothing crystal bowl resonance
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (idx * 0.4), now); // Subtle celestial detune

        // Low-frequency gentle breathing modulation (tremolo / pulse every 8 seconds)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.12 + (idx * 0.03), now); // ~8 second cycle
        lfoGain.gain.setValueAtTime(0.15, now);
        lfo.connect(lfoGain.gain);

        const subVol = 0.08 / (idx + 1);
        oscGain.gain.setValueAtTime(subVol, now);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        lfo.start();
        this.oscillators.push(osc);
      });

      this.isAmbiencePlaying = true;
    } catch (err) {
      console.warn('Celestial ambience error:', err);
    }
  }

  /**
   * Adjusts ambient music volume
   */
  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambienceGain && this.audioCtx) {
      this.ambienceGain.gain.setTargetAtTime(this.ambientVolume, this.audioCtx.currentTime, 0.1);
    }
  }

  /**
   * Stops peaceful ambient music with a soft fade out
   */
  public stopAmbientMusic() {
    if (!this.isAmbiencePlaying || !this.audioCtx || !this.ambienceGain) return;
    try {
      const now = this.audioCtx.currentTime;
      this.ambienceGain.gain.setTargetAtTime(0.001, now, 0.8);
      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch (_) {}
        });
        this.oscillators = [];
        this.isAmbiencePlaying = false;
      }, 1000);
    } catch (err) {
      this.isAmbiencePlaying = false;
    }
  }

  /**
   * Narrates the 2-3 minute daily horoscope script in UK British English
   */
  public speakHoroscope(
    scriptText: string,
    onProgress?: (currentTime: number, duration: number, isPlaying: boolean) => void,
    onFinished?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported');
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();
    clearInterval(this.timerInterval);
    this.elapsedSeconds = 0;
    this.progressCallback = onProgress || null;

    // Estimate duration: average speech rate 130 words per minute
    const wordCount = scriptText.trim().split(/\s+/).length;
    this.estimatedDuration = Math.max(120, Math.round((wordCount / 130) * 60)); // ~2 to 3 minutes

    // Start background peaceful music softly
    this.startAmbientMusic(this.ambientVolume);

    const utterance = new SpeechSynthesisUtterance(scriptText);
    this.currentUtterance = utterance;

    // Pick best UK English voice
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(v => v.lang === 'en-GB' || v.name.includes('UK') || v.name.includes('British') || v.name.includes('English (United Kingdom)'))
      || voices.find(v => v.lang.startsWith('en'))
      || null;

    if (ukVoice) {
      utterance.voice = ukVoice;
    }
    utterance.lang = 'en-GB';
    utterance.rate = 0.92; // Measured, peaceful, relaxing cadence
    utterance.pitch = 0.98; // Warm, grounded tone

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.startTimer(onFinished);
      if (this.progressCallback) {
        this.progressCallback(this.elapsedSeconds, this.estimatedDuration, true);
      }
    };

    utterance.onpause = () => {
      this.isPaused = true;
      clearInterval(this.timerInterval);
      if (this.progressCallback) {
        this.progressCallback(this.elapsedSeconds, this.estimatedDuration, false);
      }
    };

    utterance.onresume = () => {
      this.isPaused = false;
      this.startTimer(onFinished);
      if (this.progressCallback) {
        this.progressCallback(this.elapsedSeconds, this.estimatedDuration, true);
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      clearInterval(this.timerInterval);
      this.elapsedSeconds = this.estimatedDuration;
      if (this.progressCallback) {
        this.progressCallback(this.estimatedDuration, this.estimatedDuration, false);
      }
      if (onFinished) {
        onFinished();
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.isPaused = false;
      clearInterval(this.timerInterval);
    };

    window.speechSynthesis.speak(utterance);
  }

  private startTimer(onFinished?: () => void) {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.isSpeaking && !this.isPaused) {
        this.elapsedSeconds += 1;
        if (this.progressCallback) {
          this.progressCallback(this.elapsedSeconds, this.estimatedDuration, true);
        }
        if (this.elapsedSeconds >= this.estimatedDuration) {
          clearInterval(this.timerInterval);
        }
      }
    }, 1000);
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isSpeaking) {
      window.speechSynthesis.pause();
      this.isPaused = true;
      clearInterval(this.timerInterval);
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearInterval(this.timerInterval);
    this.isSpeaking = false;
    this.isPaused = false;
    this.elapsedSeconds = 0;
    this.stopAmbientMusic();
    if (this.progressCallback) {
      this.progressCallback(0, this.estimatedDuration, false);
    }
  }

  public isCurrentlyPlaying(): boolean {
    return this.isSpeaking && !this.isPaused;
  }
}

export const celestialAudio = new CelestialAudioEngine();
