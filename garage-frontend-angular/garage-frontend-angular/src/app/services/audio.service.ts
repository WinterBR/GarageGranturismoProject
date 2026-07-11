import { Injectable, signal } from '@angular/core';

export type MusicTrack = 'login' | 'garage' | 'car-form';

/** One-shot UI sound effects, independent from the looping background music. */
export type SfxName =
  | 'startup'   // signing in
  | 'start'     // deleting a car
  | 'purchase'  // saving a car (created or edited)
  | 'error'     // any failure / validation error
  | 'back'      // cancelling / closing without saving
  | 'move'      // paging to the next/previous table page
  | 'select';   // generic click / selection (dropdowns, rows, etc.)

const TRACKS: Record<MusicTrack, string> = {
  'login':    'assets/music/01__Arcade_Mode.mp3',
  'garage':   'assets/music/21__Home.mp3',
  'car-form': 'assets/music/20__GT_Auto.mp3',
};

const SFX: Record<SfxName, string> = {
  startup:  'assets/sfx/startup.mp3',
  start:    'assets/sfx/start.mp3',
  purchase: 'assets/sfx/purchase.mp3',
  error:    'assets/sfx/error.mp3',
  back:     'assets/sfx/back.mp3',
  move:     'assets/sfx/move.mp3',
  select:   'assets/sfx/select.mp3',
};

/** Sound effects always play at a fixed, comfortable volume — they are
 * short one-shots and are never affected by the music mute toggle. */
const SFX_VOLUME = 0.6;

const MUSIC_MUTED_STORAGE_KEY = 'garage:musicMuted';

const FADE_STEP     = 0.04;   // volume delta per tick
const FADE_INTERVAL = 40;     // ms per tick  (~25 ticks = ~1 s)

/**
 * Singleton music manager.
 * Fades out the current track, then fades in the requested one.
 * Calling play() with the same track that is already playing is a no-op.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {

  private audio:        HTMLAudioElement | null = null;
  private activeTrack:  MusicTrack | null       = null;
  private fadeTimer:    ReturnType<typeof setInterval> | null = null;

  /** Whether background music is muted. Sound effects are never affected
   * by this — only the looping music tracks. Persisted across sessions. */
  private readonly _musicMuted = signal<boolean>(this.readStoredMutedState());
  readonly musicMuted = this._musicMuted.asReadonly();

  /** Flip the music mute state on/off and apply it to whatever track is
   * currently playing (or about to play). */
  toggleMusicMute(): void {
    const next = !this._musicMuted();
    this._musicMuted.set(next);
    if (this.audio) this.audio.muted = next;
    try {
      localStorage.setItem(MUSIC_MUTED_STORAGE_KEY, String(next));
    } catch {
      /* localStorage unavailable (e.g. private mode) – mute still works for this session. */
    }
  }

  private readStoredMutedState(): boolean {
    try {
      return localStorage.getItem(MUSIC_MUTED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  /** Plays a one-shot UI sound effect. Independent of the music track/mute
   * state, and safe to call rapidly — each call uses its own <audio>
   * element so overlapping effects don't cut each other off. */
  playSfx(name: SfxName): void {
    const fx = new Audio(SFX[name]);
    fx.volume = SFX_VOLUME;
    fx.play().catch(() => { /* autoplay blocked – ignore */ });
  }

  /** Switch to a track (with crossfade). Safe to call from ngOnInit. */
  play(track: MusicTrack): void {
    if (this.activeTrack === track && this.audio && !this.audio.paused) return;
    this.fadeTo(track);
  }

  /** Hard stop – call from the last component that uses music. */
  stop(): void {
    this.fadeOut(() => {
      this.audio = null;
      this.activeTrack = null;
    });
  }

  // ── private helpers ──────────────────────────────────────────────────────

  private fadeTo(track: MusicTrack): void {
    if (this.audio && !this.audio.paused) {
      this.fadeOut(() => this.startTrack(track));
    } else {
      this.startTrack(track);
    }
  }

  private startTrack(track: MusicTrack): void {
    const audio   = new Audio(TRACKS[track]);
    audio.loop    = true;
    audio.volume  = 0;
    audio.muted   = this._musicMuted();
    audio.play().catch(() => { /* autoplay blocked – user hasn't interacted yet */ });

    this.audio       = audio;
    this.activeTrack = track;
    this.fadeIn();
  }

  private fadeOut(cb: () => void): void {
    this.clearFade();
    const target = this.audio;
    if (!target) { cb(); return; }

    this.fadeTimer = setInterval(() => {
      if (target.volume > FADE_STEP) {
        target.volume = Math.max(0, target.volume - FADE_STEP);
      } else {
        target.volume = 0;
        target.pause();
        this.clearFade();
        cb();
      }
    }, FADE_INTERVAL);
  }

  private fadeIn(): void {
    this.clearFade();
    const target = this.audio;
    if (!target) return;

    this.fadeTimer = setInterval(() => {
      if (target.volume < 1 - FADE_STEP) {
        target.volume = Math.min(1, target.volume + FADE_STEP);
      } else {
        target.volume = 1;
        this.clearFade();
      }
    }, FADE_INTERVAL);
  }

  private clearFade(): void {
    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }
}
