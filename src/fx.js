export const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Confetti (one shared loop, many bursts) ---------- */
let parts = [];
let running = false;

export function confetti(canvas, fx = 0.5, fy = 0.55, n = 120) {
  if (!canvas || reduceMotion()) return;
  if (canvas.width !== innerWidth || canvas.height !== innerHeight) {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  const colors = ["#e8508a", "#f6b85a", "#ff8fab", "#b388ff", "#6ec6ff", "#ffd1e3"];
  for (let i = 0; i < n; i++) {
    parts.push({
      x: canvas.width * fx, y: canvas.height * fy,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 4,
      s: Math.random() * 7 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: colors[i % colors.length], life: 180,
    });
  }
  if (running) return;
  running = true;
  const ctx = canvas.getContext("2d");
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.vx *= 0.99; p.r += p.vr; p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.globalAlpha = Math.max(p.life / 180, 0);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    });
    parts = parts.filter((p) => p.life > 0);
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  };
  requestAnimationFrame(tick);
}

/* ---------- "Happy Birthday" tune (Web Audio, no files needed) ---------- */
export function playBirthday() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ac = new AC();
    const f = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392, A: 440, B: 466.16, c: 523.25 };
    const song = "C.75 C.25 D1 C1 F1 E2 C.75 C.25 D1 C1 G1 F2 C.75 C.25 c1 A1 F1 E1 D2 B.75 B.25 A1 F1 G1 F2".split(" ");
    let t = ac.currentTime + 0.1;
    const beat = 0.42;
    song.forEach((n) => {
      const d = parseFloat(n.slice(1)) * beat;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "triangle";
      o.frequency.value = f[n[0]];
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + d * 0.95);
      o.connect(g).connect(ac.destination);
      o.start(t);
      o.stop(t + d);
      t += d;
    });
    setTimeout(() => ac.close(), (t - ac.currentTime + 1) * 1000);
  } catch { /* audio is optional */ }
}

/* ---------- Blow detection with the microphone ---------- */
export async function listenForBlow(onBlow) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const AC = window.AudioContext || window.webkitAudioContext;
  const ac = new AC();
  const an = ac.createAnalyser();
  an.fftSize = 512;
  ac.createMediaStreamSource(stream).connect(an);
  const buf = new Uint8Array(an.fftSize);
  let loud = 0, raf, done = false;

  const stop = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    stream.getTracks().forEach((t) => t.stop());
    ac.close();
  };
  const loop = () => {
    if (done) return;
    an.getByteTimeDomainData(buf);
    let s = 0;
    for (const v of buf) { const d = (v - 128) / 128; s += d * d; }
    const rms = Math.sqrt(s / buf.length);
    loud = rms > 0.1 ? loud + 1 : Math.max(0, loud - 2);
    if (loud > 10) { stop(); onBlow(); return; }
    raf = requestAnimationFrame(loop);
  };
  loop();
  return stop;
}
