// Procedural Audio Synthesizer using Web Audio API
// This provides a beautiful ambient soundscape and bell-like notification chime
// without depending on external MP3 files, eliminating loading lag and network errors.

class AmbientSynth {
  private ctx: AudioContext | null = null;
  private oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private mainGain: GainNode | null = null;
  private isPlaying = false;
  private intervalId: any = null;

  start() {
    if (this.isPlaying) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      
      this.mainGain = this.ctx.createGain();
      // Very soft and non-intrusive background volume
      this.mainGain.gain.setValueAtTime(0.05, this.ctx.currentTime); 
      this.mainGain.connect(this.ctx.destination);
      
      this.isPlaying = true;
      
      // Rich, warm ambient chord progression in a minor/major 9th dreamy sequence
      const progressions = [
        [130.81, 196.00, 261.63, 329.63, 392.00, 493.88], // Cmaj9 (warm, open)
        [110.00, 164.81, 220.00, 293.66, 349.23, 440.00], // Amin9 (wistful, romantic)
        [87.31, 130.81, 174.61, 220.00, 261.63, 349.23],  // Fmaj9 (soft, floating)
        [98.00, 146.83, 196.00, 246.94, 293.66, 392.00]   // G6 (gentle resolution)
      ];
      
      let step = 0;
      const playChord = () => {
        if (!this.isPlaying || !this.ctx) return;
        
        // Ensure the AudioContext is resumed if suspended (browser security autoplay policies)
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        const now = this.ctx.currentTime;
        const notes = progressions[step % progressions.length];
        
        notes.forEach((freq, idx) => {
          if (!this.ctx || !this.mainGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'sine'; // Pure sine tone for smooth, cozy glass/flute-like textures
          osc.frequency.setValueAtTime(freq, now);
          
          // Introduce detune (chorus shimmer) for standard rich wide sound
          osc.detune.setValueAtTime((Math.random() - 0.5) * 10, now);
          
          // Smooth ambient sound envelopes (long attack, long decay)
          gain.gain.setValueAtTime(0, now);
          const startDelay = Math.random() * 0.4;
          gain.gain.linearRampToValueAtTime(0.12, now + 2.5 + startDelay);
          gain.gain.setValueAtTime(0.12, now + 5.5);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 11.5);
          
          osc.connect(gain);
          gain.connect(this.mainGain);
          
          osc.start(now + startDelay);
          osc.stop(now + 12);
          
          this.oscillators.push({ osc, gain });
        });
        
        // Asynchronous node pruning to release browser audio resources
        setTimeout(() => {
          this.oscillators = this.oscillators.filter(item => {
            try {
              item.osc.disconnect();
              item.gain.disconnect();
            } catch (e) {}
            return false;
          });
        }, 13000);
        
        step++;
      };
      
      playChord();
      // Schedule overlapping chord layers
      this.intervalId = setInterval(playChord, 8000);
    } catch (e) {
      console.warn("Ambient synth failed to initialize:", e);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.oscillators.forEach(item => {
      try {
        item.osc.stop();
        item.osc.disconnect();
        item.gain.disconnect();
      } catch (e) {}
    });
    this.oscillators = [];
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
    }
  }

  isSynthPlaying() {
    return this.isPlaying;
  }
}

export const ambientBackgroundSynth = new AmbientSynth();

// Belle-like romantic notification ring
export const playSyntheticNotification = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    // Gentle bell chime sound: C5 to A5
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    console.warn("Synthetic chime failed:", e);
  }
};
