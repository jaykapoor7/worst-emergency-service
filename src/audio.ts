let context: AudioContext | undefined;
let muted = false;
let enabled = false;
export const setMute = (v: boolean) => {
  muted = v;
  if (v && context?.state === "running") void context.suspend();
  else if (enabled && context?.state === "suspended") void context.resume();
};
export function unlock() {
  enabled = true;
  try {
    context ??= new AudioContext();
    if (!muted) void context.resume();
  } catch {
    /* Silent fallback for unavailable audio hardware. */
  }
}
function note(
  freq: number,
  at: number,
  duration: number,
  type: OscillatorType = "triangle",
  gain = 0.035,
) {
  if (!context || muted || !enabled) return;
  const o = context.createOscillator(),
    g = context.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, context.currentTime + at);
  g.gain.setValueAtTime(0.0001, context.currentTime + at);
  g.gain.exponentialRampToValueAtTime(gain, context.currentTime + at + 0.015);
  g.gain.exponentialRampToValueAtTime(
    0.0001,
    context.currentTime + at + duration,
  );
  o.connect(g);
  g.connect(context.destination);
  o.start(context.currentTime + at);
  o.stop(context.currentTime + at + duration + 0.02);
}
export function play(
  kind:
    | "ring"
    | "click"
    | "siren"
    | "crash"
    | "win"
    | "promotion"
    | "stamp"
    | "secret",
) {
  if (muted || !enabled) return;
  if (kind === "ring") {
    [0, 0.16, 0.32, 0.65, 0.81, 0.97].forEach((t, i) =>
      note(i % 2 ? 880 : 680, t, 0.11, "square", 0.015),
    );
  }
  if (kind === "click") note(430, 0, 0.06);
  if (kind === "stamp") {
    note(100, 0, 0.07, "sawtooth", 0.05);
    note(64, 0.02, 0.07, "triangle", 0.06);
  }
  if (kind === "siren") {
    [440, 660, 440, 660].forEach((f, i) =>
      note(f, i * 0.15, 0.16, "triangle", 0.025),
    );
  }
  if (kind === "crash") {
    [180, 125, 70, 40].forEach((f, i) =>
      note(f, i * 0.045, 0.12, "sawtooth", 0.025),
    );
  }
  if (kind === "win") {
    [392, 523, 659, 784].forEach((f, i) => note(f, i * 0.12, 0.19));
  }
  if (kind === "promotion") {
    [392, 392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => {
      note(f, i * 0.19, 0.3);
      note(f / 2, i * 0.19, 0.3, "triangle", 0.025);
    });
  }
  if (kind === "secret") {
    [440, 330, 220].forEach((f, i) => note(f, i * 0.1, 0.15));
  }
}
