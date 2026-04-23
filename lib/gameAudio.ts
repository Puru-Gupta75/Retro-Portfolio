// Game audio system (integrates with existing soundEngine)
// Lightweight wrapper for game-specific sounds

export class GameAudio {
  private static enabled = true;

  static toggle(enabled: boolean) {
    this.enabled = enabled;
  }

  static playClick() {
    if (!this.enabled || typeof window === 'undefined') return;
    
    try {
      // Use existing sound engine if available
      if (window.soundEngine?.playClick) {
        window.soundEngine.playClick();
      } else {
        // Fallback to simple beep
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.value = 800;
        gain.gain.value = 0.1;
        
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      // Silent fail
    }
  }

  static playSuccess() {
    if (!this.enabled || typeof window === 'undefined') return;
    
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = 1200;
      gain.gain.value = 0.15;
      
      osc.start();
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Silent fail
    }
  }

  static playError() {
    if (!this.enabled || typeof window === 'undefined') return;
    
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = 200;
      gain.gain.value = 0.2;
      
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // Silent fail
    }
  }
}

// Extend window type for soundEngine
declare global {
  interface Window {
    soundEngine?: {
      playClick: () => void;
      playGlitch: () => void;
      playSuccess: () => void;
    };
  }
}
