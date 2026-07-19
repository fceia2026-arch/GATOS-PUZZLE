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

// Play a cute "meow" synthesizer sound
export const playMeow = (type: 'cute' | 'derp' | 'sleepy' | 'happy' = 'cute') => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    // Set up resonant bandpass filter to create a feline vowel ("m-e-o-w")
    filter.type = 'bandpass';
    filter.Q.value = 1.8; // Gives it a nasal, meow-like vocal resonance

    // Different meow characteristics based on personality!
    let startFreq = 400;
    let midFreq = 580;
    let endFreq = 700;
    let duration = 0.25;
    let startFilterFreq = 1100;
    let endFilterFreq = 600;

    if (type === 'derp') {
      startFreq = 300;
      midFreq = 520;
      endFreq = 420; // weird pitch bend down
      duration = 0.35;
      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      startFilterFreq = 900;
      endFilterFreq = 450;
    } else if (type === 'sleepy') {
      startFreq = 250;
      midFreq = 320;
      endFreq = 350;
      duration = 0.4;
      osc.type = 'sine';
      osc2.type = 'triangle';
      startFilterFreq = 800;
      endFilterFreq = 500;
    } else if (type === 'happy') {
      startFreq = 450;
      midFreq = 620;
      endFreq = 800;
      duration = 0.2;
      osc.type = 'triangle';
      osc2.type = 'sine';
      startFilterFreq = 1300;
      endFilterFreq = 700;
    } else { // cute / normal
      osc.type = 'triangle';
      osc2.type = 'sine';
    }

    // Set up oscillator frequencies
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.linearRampToValueAtTime(midFreq, now + duration * 0.4);
    osc.frequency.linearRampToValueAtTime(endFreq, now + duration);

    osc2.frequency.setValueAtTime(startFreq * 1.01, now);
    osc2.frequency.linearRampToValueAtTime(midFreq * 1.01, now + duration * 0.4);
    osc2.frequency.linearRampToValueAtTime(endFreq * 1.01, now + duration);

    // Sweet vocalic bandpass filter sweep: High-to-Low creates "eee-ooo" nasal meow vowel transition!
    filter.frequency.setValueAtTime(startFilterFreq, now);
    filter.frequency.exponentialRampToValueAtTime(endFilterFreq, now + duration);

    // Envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gain.gain.setValueAtTime(0.15, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration);
    osc2.stop(now + duration);
  } catch (e) {
    console.error("Failed to play audio", e);
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
