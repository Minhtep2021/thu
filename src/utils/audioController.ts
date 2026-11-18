import { CONFIG } from '../config/confessionConfig';

export type ActiveTrack = 'track1' | 'track2';

class DualAudioController {
  private track1Audio: HTMLAudioElement | null = null;
  private track2Audio: HTMLAudioElement | null = null;
  private activeTrack: ActiveTrack = 'track1';
  private isPlayingState = false;
  private fadeIntervals: number[] = [];
  private maxVolume = 0.65;

  private clearFades() {
    for (const id of this.fadeIntervals) {
      window.clearInterval(id);
    }
    this.fadeIntervals = [];
  }

  private createAudio(src: string): HTMLAudioElement | null {
    try {
      const audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      // Swallow media load errors gracefully when local mp3 files haven't been added yet
      audio.addEventListener('error', () => {
        // Intentional silent fallback so missing mp3 files never break the app
      });
      return audio;
    } catch {
      return null;
    }
  }

  private ensureTrack1(): HTMLAudioElement | null {
    if (!this.track1Audio) {
      this.track1Audio = this.createAudio(CONFIG.audio.track1);
    }
    return this.track1Audio;
  }

  private ensureTrack2(): HTMLAudioElement | null {
    if (!this.track2Audio) {
      this.track2Audio = this.createAudio(CONFIG.audio.track2);
    }
    return this.track2Audio;
  }

  private fadeVolume(
    audio: HTMLAudioElement | null,
    from: number,
    to: number,
    durationMs: number,
    onDone?: () => void
  ) {
    if (!audio) {
      onDone?.();
      return;
    }
    try {
      const steps = 20;
      const stepTime = Math.max(20, Math.floor(durationMs / steps));
      let currentStep = 0;
      audio.volume = Math.max(0, Math.min(1, from));

      const timer = window.setInterval(() => {
        currentStep += 1;
        const progress = Math.min(1, currentStep / steps);
        const nextVol = from + (to - from) * progress;
        try {
          audio.volume = Math.max(0, Math.min(1, nextVol));
        } catch {
          // Ignore volume errors
        }
        if (progress >= 1) {
          window.clearInterval(timer);
          onDone?.();
        }
      }, stepTime);

      this.fadeIntervals.push(timer);
    } catch {
      onDone?.();
    }
  }

  public async startTrack1(): Promise<boolean> {
    this.activeTrack = 'track1';
    this.isPlayingState = true;
    const audio = this.ensureTrack1();
    if (!audio) return true;

    try {
      this.clearFades();
      if (audio.paused) {
        audio.volume = 0;
        await audio.play().catch(() => {
          // Gracefully ignore missing file or browser autoplay block
        });
      }
      this.fadeVolume(audio, audio.volume, this.maxVolume, 1400);
    } catch {
      // Missing audio file handled gracefully
    }
    return this.isPlayingState;
  }

  public async switchToTrack2(): Promise<boolean> {
    this.activeTrack = 'track2';
    const shouldPlay = this.isPlayingState;
    this.clearFades();

    const t1 = this.track1Audio;
    const t2 = this.ensureTrack2();

    if (t1) {
      try {
        this.fadeVolume(t1, t1.volume, 0, 900, () => {
          try {
            t1.pause();
          } catch {
            // ignore
          }
        });
      } catch {
        // ignore
      }
    }

    if (t2 && shouldPlay) {
      try {
        t2.volume = 0;
        await t2.play().catch(() => {
          // Gracefully ignore missing file
        });
        this.fadeVolume(t2, 0, this.maxVolume, 1200);
      } catch {
        // ignore
      }
    }

    return this.isPlayingState;
  }

  public async toggle(): Promise<boolean> {
    const nextPlaying = !this.isPlayingState;
    this.isPlayingState = nextPlaying;
    this.clearFades();

    const target =
      this.activeTrack === 'track1' ? this.ensureTrack1() : this.ensureTrack2();

    if (!target) {
      return this.isPlayingState;
    }

    try {
      if (nextPlaying) {
        await target.play().catch(() => {
          // Gracefully ignore missing file
        });
        this.fadeVolume(target, target.volume, this.maxVolume, 500);
      } else {
        this.fadeVolume(target, target.volume, 0, 350, () => {
          try {
            target.pause();
          } catch {
            // ignore
          }
        });
      }
    } catch {
      // Graceful fallback
    }

    return this.isPlayingState;
  }

  public getIsPlaying(): boolean {
    return this.isPlayingState;
  }

  public getActiveTrack(): ActiveTrack {
    return this.activeTrack;
  }

  public resetToTrack1() {
    this.clearFades();
    try {
      this.track2Audio?.pause();
      if (this.track2Audio) this.track2Audio.currentTime = 0;
    } catch {
      // ignore
    }
    this.activeTrack = 'track1';
  }
}

export const audioController = new DualAudioController();
