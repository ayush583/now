import { useEffect, useRef, useState } from "react";
import { confetti, listenForBlow, playBirthday } from "./fx";
import { config } from "./data";

const CANDLES = [96, 120, 144];
const SPRINKLES = [[48, 176, "#fff"], [78, 192, "#ffe08a"], [108, 172, "#a5d8ff"], [140, 194, "#fff"], [170, 174, "#ffe08a"], [198, 190, "#a5d8ff"], [60, 150, "#ffe08a"], [190, 152, "#a5d8ff"]];
const RISERS = ["🎈", "💗", "🧸", "🍦", "🎈", "🌷", "🍫", "🎈", "☕", "💖", "📚", "🌙"];

export default function Cake({ canvasRef }) {
  const { name } = config;
  const [stage, setStage] = useState("idle"); // idle | listening | out
  const [note, setNote] = useState("");
  const stopRef = useRef(null);

  useEffect(() => () => stopRef.current?.(), []);

  const blowOut = () => {
    stopRef.current?.();
    stopRef.current = null;
    setStage("out");
    setNote("");
    [0, 300, 650].forEach((ms, i) =>
      setTimeout(() => confetti(canvasRef.current, [0.2, 0.8, 0.5][i], 0.6, 110), ms)
    );
    playBirthday();
  };

  const startMic = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setNote("Mic isn’t available here. Tap the candles instead.");
      return;
    }
    try {
      stopRef.current = await listenForBlow(blowOut);
      setStage("listening");
      setNote(`Listening… blow on your phone, ${name}.`);
    } catch {
      setNote("No mic access. Just tap the candles.");
    }
  };

  const relight = () => { setStage("idle"); setNote(""); };

  return (
    <section id="cake" className="cake-sec reveal">
      <h2>Make a wish, {name}</h2>
      <p className="sub">
        {stage === "out"
          ? "Your wish is on its way. 💗"
          : "Close your eyes, think of something lovely, then blow out the candles."}
      </p>

      <div className={`cake ${stage}`}>
        <svg viewBox="0 0 240 230" className="cake-svg" role="img" aria-label="Birthday cake with three candles" onClick={stage === "out" ? undefined : blowOut}>
          <ellipse cx="120" cy="212" rx="108" ry="12" fill="var(--plate)" />
          <rect x="30" y="134" width="180" height="74" rx="8" fill="#f48fb1" />
          <path d="M30 134 H210 V150 Q200 166 190 150 Q180 166 170 150 Q160 166 150 150 Q140 166 130 150 Q120 166 110 150 Q100 166 90 150 Q80 166 70 150 Q60 166 50 150 Q40 166 30 150 Z" fill="#fff" />
          <rect x="62" y="92" width="116" height="48" rx="8" fill="#ffc2d8" />
          <path d="M62 92 H178 V108 Q168.3 124 158.7 108 Q149 124 139.3 108 Q129.7 124 120 108 Q110.3 124 100.7 108 Q91 124 81.3 108 Q71.7 124 62 108 Z" fill="#fff" />
          {SPRINKLES.map(([x, y, c], i) => <circle key={i} cx={x} cy={y} r="3" fill={c} />)}
          <text x="120" y="130" textAnchor="middle" fontSize="16">💗</text>
          {CANDLES.map((x) => (
            <g key={x}>
              <rect x={x - 3.5} y="62" width="7" height="30" rx="2" fill="#fff" stroke="#f3b7cd" />
              <rect x={x - 3.5} y="72" width="7" height="4" fill="#ffc2d8" />
              <rect x={x - 3.5} y="82" width="7" height="4" fill="#ffc2d8" />
              <circle className="glow" cx={x} cy="52" r="15" fill="#ffd27a" opacity=".35" />
              <g className="flame">
                <path d={`M${x} 40 C${x + 6} 48 ${x + 6} 56 ${x} 59 C${x - 6} 56 ${x - 6} 48 ${x} 40Z`} fill="#ffb347" />
                <ellipse cx={x} cy="53" rx="2.5" ry="4.5" fill="#fff6c8" />
              </g>
              {stage === "out" && <circle className="smoke" cx={x} cy="50" r="4" />}
            </g>
          ))}
        </svg>
      </div>

      {stage === "out" ? (
        <>
          <div className="banner">Happy birthday, {name}! 🎉</div>
          <button className="btn ghost" onClick={relight}>Light them again</button>
          {RISERS.map((e, i) => (
            <span key={i} className="riser" style={{ left: `${6 + ((i * 8) % 88)}%`, "--d": `${(i % 6) * 0.25}s`, "--t": `${3.6 + (i % 4) * 0.6}s`, fontSize: 26 + (i % 3) * 8 }}>{e}</span>
          ))}
        </>
      ) : (
        <>
          <button className="btn" onClick={startMic} disabled={stage === "listening"}>
            {stage === "listening" ? "Listening…" : "Blow with your mic 🎤"}
          </button>
          <p className="hint">or just tap the candles</p>
        </>
      )}
      {note && <p className="hint" role="status">{note}</p>}
    </section>
  );
}
