import Phaser from 'phaser';

const STORAGE_KEY = 'glider-gauntlet-audio';

interface AudioSettings {
  musicVolume: number;
  sfxVolume: number;
}

function loadSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { musicVolume: 0.5, sfxVolume: 0.7 };
}

function saveSettings(s: AudioSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

/**
 * Audio manager: MP3 file for music via Phaser sound, Web Audio API for procedural SFX.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings;
  private sfxGain: GainNode | null = null;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private phaserSound: Phaser.Sound.BaseSoundManager | null = null;
  private initialized = false;

  // Pending music track (for when Phaser sound is locked on mobile)
  private pendingTrack: string | null = null;

  // Thruster loop state
  private thrusterOsc: OscillatorNode | null = null;
  private thrusterGain: GainNode | null = null;
  private thrusterActive = false;

  constructor() {
    this.settings = loadSettings();
  }

  /** Must be called from a user gesture (click/keydown/touchstart) */
  init(): void {
    if (this.initialized) return;
    this.ctx = new AudioContext();
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.settings.sfxVolume;
    this.sfxGain.connect(this.ctx.destination);
    this.initialized = true;
    // Resume suspended context (mobile browsers require this)
    this.resumeAudio();
  }

  /** Resume audio context if suspended — safe to call multiple times */
  resumeAudio(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    // Also unlock Phaser's sound manager (needed for mobile WebAudio)
    if (this.phaserSound && 'locked' in this.phaserSound) {
      const sm = this.phaserSound as Phaser.Sound.WebAudioSoundManager;
      if (sm.locked) {
        sm.unlock();
      }
    }
  }

  /** Register Phaser's sound manager so we can play loaded audio assets */
  setPhaserSound(soundManager: Phaser.Sound.BaseSoundManager): void {
    this.phaserSound = soundManager;
    // When Phaser unlocks audio (after first user gesture), retry pending music
    if ('locked' in soundManager && (soundManager as Phaser.Sound.WebAudioSoundManager).locked) {
      soundManager.once('unlocked', () => {
        // If we were trying to play music, restart it now
        if (this.pendingTrack) {
          this.playTrack(this.pendingTrack);
          this.pendingTrack = null;
        }
      });
    }
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) this.init();
    // Always try to resume on mobile
    if (this.ctx!.state === 'suspended') {
      this.ctx!.resume();
    }
    return this.ctx!;
  }

  // --- Volume controls ---

  getMusicVolume(): number { return this.settings.musicVolume; }
  getSfxVolume(): number { return this.settings.sfxVolume; }

  setMusicVolume(v: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, v));
    if (this.currentMusic && 'setVolume' in this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this.settings.musicVolume);
    }
    saveSettings(this.settings);
  }

  setSfxVolume(v: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = this.settings.sfxVolume;
    saveSettings(this.settings);
  }

  // --- Music (audio files via Phaser) ---

  // All available tracks — round-robin assigned to levels
  private static readonly MENU_TRACK = 'music-menu';
  private static readonly LEVEL_TRACKS = [
    'music-level-0',
    'music-level-1',
    'music-level-2',
    'music-level-3',
    'music-level-4',
    'music-level-5',
    'music-level-6',
    'music-level-7',
  ];

  /** File mapping for preloading — called from BootScene */
  static getTrackFiles(): { key: string; url: string }[] {
    return [
      { key: 'music-menu', url: 'audio/title.flac' },
      { key: 'music-level-0', url: 'audio/song18.mp3' },
      { key: 'music-level-1', url: 'audio/chase.flac' },
      { key: 'music-level-2', url: 'audio/boss.flac' },
      { key: 'music-level-3', url: 'audio/battle.flac' },
      { key: 'music-level-4', url: 'audio/shmup2.flac' },
      { key: 'music-level-5', url: 'audio/volcano.flac' },
      { key: 'music-level-6', url: 'audio/underground.flac' },
      { key: 'music-level-7', url: 'audio/fortress.flac' },
    ];
  }

  playMenuMusic(): void {
    this.playTrack(AudioManager.MENU_TRACK);
  }

  playLevelMusic(levelId: number): void {
    const tracks = AudioManager.LEVEL_TRACKS;
    const idx = (levelId - 1) % tracks.length;
    this.playTrack(tracks[idx]);
  }

  private playTrack(key: string): void {
    this.stopMusic();
    if (!this.phaserSound) return;

    // If Phaser sound is still locked (mobile), queue it for later
    const sm = this.phaserSound as Phaser.Sound.WebAudioSoundManager;
    if ('locked' in sm && sm.locked) {
      this.pendingTrack = key;
      return;
    }

    try {
      this.currentMusic = this.phaserSound.add(key, {
        volume: this.settings.musicVolume,
        loop: true,
      });
      this.currentMusic.play();
      this.pendingTrack = null;
    } catch {
      // If play fails, queue for retry after unlock
      this.pendingTrack = key;
    }
  }

  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
    }
  }

  // --- SFX (procedural via Web Audio API) ---

  /** Start warp-speed thruster — call every frame while accelerating */
  startThruster(): void {
    if (this.thrusterActive) return;
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;
    this.thrusterActive = true;

    // Master gain
    this.thrusterGain = ctx.createGain();
    this.thrusterGain.gain.setValueAtTime(0, now);
    this.thrusterGain.gain.linearRampToValueAtTime(0.55, now + 0.06);
    this.thrusterGain.connect(this.sfxGain!);

    // Layer 1: Rising whoosh — high-pitched sweep that settles
    this.thrusterOsc = ctx.createOscillator();
    this.thrusterOsc.type = 'sawtooth';
    this.thrusterOsc.frequency.setValueAtTime(300, now);
    this.thrusterOsc.frequency.exponentialRampToValueAtTime(180, now + 0.3);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2000, now);
    lp.frequency.exponentialRampToValueAtTime(600, now + 0.4);
    lp.Q.value = 3;
    const g1 = ctx.createGain();
    g1.gain.value = 0.5;
    this.thrusterOsc.connect(lp);
    lp.connect(g1);
    g1.connect(this.thrusterGain);
    this.thrusterOsc.start();

    // Layer 2: Detuned second oscillator for stereo-like width
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(305, now);
    osc2.frequency.exponentialRampToValueAtTime(185, now + 0.3);
    const g2 = ctx.createGain();
    g2.gain.value = 0.35;
    osc2.connect(lp);
    g2.connect(this.thrusterGain);
    osc2.start();

    // Layer 3: Rushing wind noise — broadband, filtered
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    noiseSrc.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(3000, now);
    bp.frequency.exponentialRampToValueAtTime(1500, now + 0.3);
    bp.Q.value = 0.8;
    const g3 = ctx.createGain();
    g3.gain.value = 0.4;
    noiseSrc.connect(bp);
    bp.connect(g3);
    g3.connect(this.thrusterGain);
    noiseSrc.start();

    // Layer 4: Sub-bass rumble for power
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = 45;
    const g4 = ctx.createGain();
    g4.gain.value = 0.3;
    sub.connect(g4);
    g4.connect(this.thrusterGain);
    sub.start();

    // Cleanup
    this.thrusterOsc.addEventListener('ended', () => {
      try { osc2.stop(); } catch { /* */ }
      try { noiseSrc.stop(); } catch { /* */ }
      try { sub.stop(); } catch { /* */ }
    }, { once: true });
  }

  /** Stop the thruster — call when no keys are pressed */
  stopThruster(): void {
    if (!this.thrusterActive || !this.thrusterOsc || !this.thrusterGain) return;
    this.thrusterActive = false;
    const ctx = this.ensureCtx();
    // Quick wind-down
    this.thrusterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    const osc = this.thrusterOsc;
    setTimeout(() => { try { osc.stop(); } catch { /* */ } }, 250);
    this.thrusterOsc = null;
    this.thrusterGain = null;
  }

  playHit(): void {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;

    // === BANG — loud initial blast ===

    // 1) Sharp crack transient
    const crackSize = Math.floor(ctx.sampleRate * 0.08);
    const crackBuf = ctx.createBuffer(1, crackSize, ctx.sampleRate);
    const crackData = crackBuf.getChannelData(0);
    for (let i = 0; i < crackSize; i++) {
      crackData[i] = (Math.random() * 2 - 1);
    }
    const crack = ctx.createBufferSource();
    crack.buffer = crackBuf;
    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(1.0, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    crack.connect(crackGain);
    crackGain.connect(this.sfxGain!);
    crack.start(now);

    // 2) Deep sub boom — punch in the gut
    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(100, now);
    boom.frequency.exponentialRampToValueAtTime(12, now + 1.0);
    boomGain.gain.setValueAtTime(1.0, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    boom.connect(boomGain);
    boomGain.connect(this.sfxGain!);
    boom.start(now);
    boom.stop(now + 1.2);

    // === LONG DECAY — fire and rumble trailing off ===

    // 3) Main fireball noise — starts loud, decays slowly over ~2 seconds
    const fireSize = Math.floor(ctx.sampleRate * 2.5);
    const fireBuf = ctx.createBuffer(1, fireSize, ctx.sampleRate);
    const fireData = fireBuf.getChannelData(0);
    for (let i = 0; i < fireSize; i++) {
      fireData[i] = (Math.random() * 2 - 1);
    }
    const fire = ctx.createBufferSource();
    fire.buffer = fireBuf;
    const fireFilter = ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.setValueAtTime(6000, now);
    fireFilter.frequency.exponentialRampToValueAtTime(200, now + 1.5);
    fireFilter.frequency.exponentialRampToValueAtTime(60, now + 2.5);
    fireFilter.Q.value = 0.7;
    const fireGain = ctx.createGain();
    fireGain.gain.setValueAtTime(0.7, now);
    fireGain.gain.setValueAtTime(0.5, now + 0.1);
    fireGain.gain.exponentialRampToValueAtTime(0.15, now + 0.8);
    fireGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    fire.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireGain.connect(this.sfxGain!);
    fire.start(now);

    // 4) Distorted low rumble — sustains under the noise
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    const distortion = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = (Math.PI + 5) * x / (Math.PI + 5 * Math.abs(x));
    }
    distortion.curve = curve;
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(35, now);
    rumble.frequency.exponentialRampToValueAtTime(18, now + 1.5);
    rumbleGain.gain.setValueAtTime(0.3, now + 0.05);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    rumble.connect(distortion);
    distortion.connect(rumbleGain);
    rumbleGain.connect(this.sfxGain!);
    rumble.start(now);
    rumble.stop(now + 2.0);

    // 5) Metallic debris — sparse crackles in the tail
    const debrisSize = Math.floor(ctx.sampleRate * 1.5);
    const debrisBuf = ctx.createBuffer(1, debrisSize, ctx.sampleRate);
    const debrisData = debrisBuf.getChannelData(0);
    for (let i = 0; i < debrisSize; i++) {
      debrisData[i] = (Math.random() * 2 - 1) * (Math.random() > 0.85 ? 1 : 0);
    }
    const debris = ctx.createBufferSource();
    debris.buffer = debrisBuf;
    const debrisHp = ctx.createBiquadFilter();
    debrisHp.type = 'highpass';
    debrisHp.frequency.value = 2000;
    const debrisGain = ctx.createGain();
    debrisGain.gain.setValueAtTime(0, now);
    debrisGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    debrisGain.gain.setValueAtTime(0.15, now + 0.5);
    debrisGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    debris.connect(debrisHp);
    debrisHp.connect(debrisGain);
    debrisGain.connect(this.sfxGain!);
    debris.start(now);
  }

  playCheckpoint(): void {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.08;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  playPowerUp(type: string): void {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;

    const freqMap: Record<string, number[]> = {
      'shield': [440, 554, 659],
      'extra-life': [523, 659, 784],
      'slow-motion': [392, 494, 587],
    };
    const freqs = freqMap[type] ?? [440, 554, 659];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.06;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.02, t + 0.15);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  playLaserBuzz(): void {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playMenuClick(): void {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playGameOver(): void {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;
    const notes = [440, 392, 349, 262]; // A4 G4 F4 C4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.2;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  playLevelComplete(): void {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.1;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.5);
    });

    // Final chord
    const chord = [523, 659, 784, 1047];
    const ct = now + 0.6;
    chord.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ct);
      gain.gain.setValueAtTime(0.1, ct);
      gain.gain.exponentialRampToValueAtTime(0.001, ct + 1.0);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(ct);
      osc.stop(ct + 1.0);
    });
  }

  playMineAlert(): void {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      const t = now + i * 0.12;
      osc.frequency.setValueAtTime(880, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  playCountdownTick(): void {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playCountdownGo(): void {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(1100, now + 0.15);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

// Singleton
export const audioManager = new AudioManager();
