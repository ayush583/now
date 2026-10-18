import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { config } from "./data";
import Cake from "./Cake.jsx";
import { confetti, reduceMotion } from "./fx";
const guitarVideo = "https://res.cloudinary.com/vj5mc3kf/video/upload/v1792351686/video1-CswqSRW4.mp4";

const heartVideo = "https://res.cloudinary.com/vj5mc3kf/video/upload/v1792353365/video2_compressed.mp4";

const photoUrl = (file) => import.meta.env.BASE_URL + "photos/" + file;

/* Photo with a soft placeholder if a file is missing */
function Photo({ p, alt, className = "", onClick }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return <div className={`ph ${className}`} role="img" aria-label={alt} onClick={onClick}>{config.name[0]}</div>;
  }
  return (
    <img className={className} src={photoUrl(p.file)} alt={alt} loading="lazy"
      style={{ objectPosition: p.pos }} onError={() => setMissing(true)} onClick={onClick} />
  );
}

/* Full-screen viewer: swipe, arrows, Esc */
function Lightbox({ index, onClose, onChange }) {
  const { photos } = config;
  const touchX = useRef(null);
  const go = useCallback((d) => onChange((index + d + photos.length) % photos.length), [index, onChange, photos.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [go, onClose]);

  const p = photos[index];
  return (
    <div className="lightbox" role="dialog" aria-modal="true"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}>
      <button className="lb-close" onClick={onClose} aria-label="Close">×</button>
      <button className="lb-nav prev" onClick={() => go(-1)} aria-label="Previous photo">‹</button>
      <figure>
        <Photo p={{ file: p.file }} alt={p.cap} />
        <figcaption>{p.cap}</figcaption>
      </figure>
      <button className="lb-nav next" onClick={() => go(1)} aria-label="Next photo">›</button>
    </div>
  );
}

/* Tap the moon */
function Moon() {
  const { moonTitle, moonHint, moon } = config;
  const [on, setOn] = useState(false);
  const stars = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ x: (i * 53) % 100, y: (i * 29) % 100, d: (i % 5) * 0.7, s: 1 + (i % 3) })), []);
  return (
    <section className="moon-sec reveal">
      {stars.map((s, i) => <i key={i} className="star" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s * 2, height: s.s * 2, animationDelay: `${s.d}s` }} />)}
      <button className={`moon ${on ? "on" : ""}`} onClick={() => setOn((o) => !o)} aria-label="Talk to the moon" />
      <h2>{moonTitle}</h2>
      <p className="moon-msg">{on ? moon : moonHint}</p>
    </section>
  );
}

/* Teddy family hugs */
function Bears() {
  const { name } = config;
  const [hugs, setHugs] = useState(0);
  const [pops, setPops] = useState([]);
  const hug = () => {
    const id = Math.random();
    setHugs((h) => h + 1);
    setPops((p) => [...p, { id }]);
    setTimeout(() => setPops((p) => p.filter((pop) => pop.id !== id)), 1200);
  };
  return (
    <section className="bears reveal">
      <h2>A little bear hug</h2>
      <p className="sub">A little comfort, sent with love.</p>
      <div className="bear-stage">
        <button className="bear" aria-label={`Send a hug to ${name}`} onClick={hug}>
          <span className="bear-emoji" aria-hidden="true">🧸</span>
          {pops.map((pop) => <span key={pop.id} className="pop" aria-hidden="true">💗</span>)}
        </button>
      </div>
      <p className="hint" aria-live="polite">{hugs ? `${hugs} hug${hugs > 1 ? "s" : ""} sent to ${name}` : "With love, just for you"}</p>
    </section>
  );
}

const FLOATERS = ["🌸", "💗", "✨", "🌷", "🤍", "💖"];

export default function App() {
  const { name, from, intro, photos, letterTitle, letter, wish } = config;
  const canvasRef = useRef(null);
  const [open, setOpen] = useState(null);

  const floaters = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({ ch: FLOATERS[i % 6], left: (i * 37) % 100, size: 14 + ((i * 7) % 16), dur: 9 + ((i * 5) % 8), delay: -((i * 3) % 10) })),
    []
  );

  useEffect(() => {
    document.title = `Happy Birthday, ${name} 🎂`;
    confetti(canvasRef.current, 0.5, 0.2, 120);
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [name]);

  const start = () => {
    confetti(canvasRef.current, 0.5, 0.75, 80);
    document.getElementById("cake")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
  };

  return (
    <>
      <canvas ref={canvasRef} className="confetti" aria-hidden="true" />

      <header className="hero">
        <div className="floaters" aria-hidden="true">
          {floaters.map((f, i) => (
            <span key={i} className="float" style={{ left: `${f.left}%`, fontSize: f.size, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }}>{f.ch}</span>
          ))}
        </div>
        <div className="photo-backdrop" aria-hidden="true">
          {photos.slice(1, 5).map((p, i) => (
            <img key={p.file} src={photoUrl(p.file)} alt="" style={{ objectPosition: p.pos, "--photo-index": i }} />
          ))}
        </div>
        <Photo p={photos[0]} alt={name} className="hero-photo" />
        <h1>
          {["Happy", "birthday,", name].map((w, i) => (
            <span key={i}><span className="word" style={{ animationDelay: `${0.2 + i * 0.3}s` }}>{w}</span>{" "}</span>
          ))}
        </h1>
        <p className="intro">{intro}</p>
        <button className="btn" onClick={start}>Let’s celebrate</button>
      </header>

      <Cake canvasRef={canvasRef} />

      <section className="gallery reveal">
        <h2>Pictures</h2>
        <div className="photo-grid">
          {photos.map((p, i) => (
            <figure key={p.file} className="slide">
              <Photo p={p} alt={p.cap} onClick={() => setOpen(i)} />
              <figcaption>{p.cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="clips reveal">
        <h2>Just for you</h2>
        <div className="clip-grid">
          <figure className="clip">
            <video className="clip-player" src={guitarVideo} controls playsInline preload="metadata" aria-label="Ayush playing Happy Birthday on guitar" />
            <figcaption><b>A birthday song</b><span>Happy Birthday, played just for you.</span></figcaption>
          </figure>
          <figure className="clip">
            <video className="clip-player" src={heartVideo} controls playsInline preload="metadata" aria-label="Making a heart shape with hair" />
            <figcaption><b>A little heart</b><span>Made with love, just for you.</span></figcaption>
          </figure>
        </div>
      </section>

      <Bears />
      <Moon />

      <section className="note reveal">
        <h2>{letterTitle}</h2>
        <div className="letter">{letter}</div>
        <button className="btn ghost" onClick={() => confetti(canvasRef.current, 0.5, 0.7, 120)}>More confetti</button>
      </section>

      <section className="closing reveal"><p>{wish}</p></section>
      <footer>Made with love by {from}</footer>

      {open !== null && <Lightbox index={open} onClose={() => setOpen(null)} onChange={setOpen} />}
    </>
  );
}
