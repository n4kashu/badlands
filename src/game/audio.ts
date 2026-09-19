let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let muted = false;

function graph() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    sfx = ctx.createGain();
    sfx.gain.value = 0.22;
    master.gain.value = muted ? 0 : 0.7;
    sfx.connect(master);
    master.connect(ctx.destination);
  }
  return { ctx, master: master!, sfx: sfx! };
}

export function unlockAudio() {
  const g = graph();
  if (!g) return;
  if (g.ctx.state === "suspended") void g.ctx.resume();
}

export function setMuted(v: boolean) {
  muted = v;
  const g = graph();
  if (!g) return;
  g.master.gain.setTargetAtTime(v ? 0 : 0.7, g.ctx.currentTime, 0.02);
}

export function isMuted() {
  return muted;
}

function tone(freq: number, dur: number, type: OscillatorType, gain = 0.4, slide = 0) {
  const g = graph();
  if (!g || muted) return;
  const t0 = g.ctx.currentTime;
  const osc = g.ctx.createOscillator();
  const amp = g.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp);
  amp.connect(g.sfx);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
  osc.onended = () => {
    osc.disconnect();
    amp.disconnect();
  };
}

export const sfxHit = () => tone(180 + Math.random() * 40, 0.09, "square", 0.35, -80);
export const sfxLuck = () => tone(520, 0.16, "triangle", 0.4, 200);
export const sfxKill = () => tone(90, 0.22, "sawtooth", 0.45, -40);
export const sfxOpen = () => tone(340, 0.12, "square", 0.3, 80);
export const sfxDrip = () => tone(880, 0.07, "sine", 0.18, 40);
export const sfxForge = () => tone(140, 0.28, "sawtooth", 0.4, 220);
export const sfxError = () => tone(110, 0.14, "square", 0.25, -30);
export const sfxStep = () => tone(70 + Math.random() * 20, 0.04, "triangle", 0.08);
