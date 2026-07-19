let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (!soundEnabled) return null;
  if (!audioCtx) {
    // Lazy initialization on first user interaction
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
  if (!enabled && audioCtx) {
    audioCtx.close().then(() => {
      audioCtx = null;
    });
  }
};

export const isSoundEnabled = () => soundEnabled;

// Play a real cat "meow" sound recording
export const playMeow = (type: 'cute' | 'derp' | 'sleepy' | 'happy' = 'cute') => {
  if (!soundEnabled) return;

  let rate = 1.0;
  if (type === 'happy') rate = 1.25;
  else if (type === 'sleepy') rate = 0.82;
  else if (type === 'derp') rate = 0.72;

  try {
    // Play using native HTML5 Audio for maximum compatibility and realistic sound
    const audio = new Audio('/sounds/meow_cute.wav');
    audio.playbackRate = rate;
    audio.volume = 0.45;

    // Set up a fallback just in case the absolute path fails in custom subfolder deployments
    audio.addEventListener('error', () => {
      console.warn("Local audio failed, falling back to CDN...");
      try {
        const fallbackAudio = new Audio('https://freewavesamples.com/files/Cat-Meow.wav');
        fallbackAudio.playbackRate = rate;
        fallbackAudio.volume = 0.45;
        fallbackAudio.play().catch(e => console.warn("CDN audio playback failed:", e));
      } catch (err) {
        console.error("Fallback audio failed to construct:", err);
      }
    });

    audio.play().catch(err => {
      console.warn("Audio playback blocked (user gesture may be required first):", err);
    });
  } catch (e) {
    console.error("Failed to play meow sound", e);
  }
};

// Play a short "purr" loop / vibration
export const playPurr = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 65; // low frequency rumbly purr

    lfo.type = 'sine';
    lfo.frequency.value = 9; // 9Hz modulation frequency for purr vibration

    lfoGain.gain.value = 15; // frequency modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const duration = 0.8;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + duration);
    osc.stop(now + duration);
  } catch (e) {
    console.error("Purr play failed", e);
  }
};

// Cute cat chirp/trill ("mrrp") sound when successfully placed in the box
export const playSnap = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.18);

    lfo.type = 'sine';
    lfo.frequency.value = 16; // 16Hz vibration to mimic cat purr/trill

    lfoGain.gain.value = 20; // depth of the pitch vibration

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const duration = 0.22;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.03);
    gain.gain.setValueAtTime(0.14, now + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + duration);
    osc.stop(now + duration);
  } catch (e) {
    console.error("Cat trill snap play failed", e);
  }
};

// Click sound for buttons and rotation
export const playClick = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    const now = ctx.currentTime;
    const duration = 0.05;

    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + duration);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.error("Click play failed", e);
  }
};

// Error squeak when placement fails (sounds like a confused/disappointed tiny mew)
export const playBump = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Confused cat squeak/grunt: fast downward frequency pitch bend
    osc.type = 'triangle';
    const now = ctx.currentTime;
    const duration = 0.16;

    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(140, now + duration);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.error("Bump play failed", e);
  }
};

// Cute celebratory fanfare for level completion
export const playFanfare = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Major pentatonic scale notes: C5, D5, E5, G5, A5, C6
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const itemDelay = 0.12;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * itemDelay);

      const noteOn = now + idx * itemDelay;
      const duration = 0.4;

      gain.gain.setValueAtTime(0, noteOn);
      gain.gain.linearRampToValueAtTime(0.08, noteOn + 0.05);
      gain.gain.setValueAtTime(0.08, noteOn + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, noteOn + duration);

      osc.start(noteOn);
      osc.stop(noteOn + duration);
    });

    // Final satisfying harmonic chord meow a bit later
    setTimeout(() => {
      playMeow('happy');
    }, notes.length * itemDelay * 1000 + 100);
  } catch (e) {
    console.error("Fanfare play failed", e);
  }
};
