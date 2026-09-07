import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import lumioImg from "./assets/Lumio page.png";
import personalImg from "./assets/personal.jpeg";
import todoImg from "./assets/todo.png";

// ─── 3D scroll-reveal effect ────────────────────────────────────────────────
// Elements register with a rotation distance + threshold delay. A single
// shared scroll listener (rAF-throttled) computes how far each element has
// travelled from "just below the fold" to "settled in view" and maps that
// to a real perspective rotateX + lift, so blocks tilt up and rotate flat
// into place as the page scrolls — not just fade/slide.
const reveal3DRegistry = new Set();
let reveal3DRafId = null;

function updateReveal3D() {
  reveal3DRafId = null;
  const vh = window.innerHeight;
  reveal3DRegistry.forEach(({ ref, distance, delay }) => {
    const el = ref.current;
    if (!el) return;
    const start = vh * 0.92 + delay;
    const end = vh * 0.55 + delay;
    let t = (start - el.getBoundingClientRect().top) / (start - end);
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    const rotate = ((1 - t) * distance).toFixed(2);
    const lift = ((1 - t) * 36).toFixed(2);
    el.style.transform = `perspective(1200px) rotateX(${rotate}deg) translateY(${lift}px)`;
    el.style.opacity = (0.15 + 0.85 * t).toFixed(3);
  });
}

function requestReveal3DUpdate() {
  if (reveal3DRafId == null) reveal3DRafId = requestAnimationFrame(updateReveal3D);
}

if (typeof window !== "undefined") {
  window.addEventListener("scroll", requestReveal3DUpdate, { passive: true });
  window.addEventListener("resize", requestReveal3DUpdate);
}

function useReveal3D(distance = 16, delay = 0) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const entry = { ref, distance, delay };
    reveal3DRegistry.add(entry);
    updateReveal3D();
    return () => reveal3DRegistry.delete(entry);
  }, [distance, delay]);
  return ref;
}

// ─── 3D mouse-tilt effect ───────────────────────────────────────────────────
// Rotates an element toward the cursor based on pointer position within its
// bounds, and springs back flat on mouse leave. Callers compose the returned
// rotateX/rotateY into their own transform string (alongside any hover lift).
function useTilt(maxTilt = 8) {
  const [state, setState] = useState({ x: 0, y: 0, active: false });
  const onMouseMove = (e) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setState({ x: (0.5 - py) * maxTilt * 2, y: (px - 0.5) * maxTilt * 2, active: true });
  };
  const onMouseLeave = () => setState({ x: 0, y: 0, active: false });
  return {
    rotateX: state.x,
    rotateY: state.y,
    transition: state.active ? "transform 0.12s ease-out" : "transform 0.6s cubic-bezier(0.23,1,0.32,1)",
    onMouseMove,
    onMouseLeave,
  };
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = null;

    const update = () => {
      rafId = null;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const next = scrollable > 0 ? window.scrollY / scrollable : 0;
      setProgress(Math.min(1, Math.max(0, next)));
    };

    const requestUpdate = () => {
      if (rafId == null) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress__bar" style={{ transform: `scaleY(${progress})` }} />
      <span style={{ transform: `translateY(${progress * 24}px)` }} />
    </div>
  );
}

const NAV_ITEMS = ["Home", "About", "Portfolio", "Blog", "Contact"];
const EMAIL = "michealugo166@gmail.com";
const WHATSAPP_DISPLAY = "+234 707 134 1196";
const WHATSAPP_LINK = "https://wa.me/2347071341196";

// "Hello" in a spread of languages — including Igbo and Yoruba, a nod to home.
const HELLO_WORDS = [
  "Hello", "Hola", "Bonjour", "Ciao", "Hallo", "Olá",
  "你好", "こんにちは", "안녕하세요", "Привет", "مرحبا", "नमस्ते",
  "Ndewo", "Bawo", "Jambo", "Sawubona",
];

// Cycles through HELLO_WORDS with a fade/slide transition. Skips animation entirely
// for prefers-reduced-motion, matching the convention used by useReveal3D.
function HelloRotator() {
  const [i, setI] = useState(0);
  const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setI(v => (v + 1) % HELLO_WORDS.length), 1800);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: "1.3rem" }}>
      <span style={{ fontSize: 28, display: "inline-block", animation: reduceMotion ? "none" : "helloWave 2.4s ease-in-out infinite" }}>👋</span>
      <span key={i} style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", animation: reduceMotion ? "none" : "helloFade 0.45s ease both", minWidth: 130, display: "inline-block" }}>
        {HELLO_WORDS[i]}
      </span>
    </div>
  );
}

const PROJECTS = [
  {
    id: 1,
    title: "Lumio Weather App",
    category: "Personal Project",
    tags: ["Weather App", "Web App"],
    accentDark: "#18181b",
    accentBg: "#F0EEE9",
    image: lumioImg,
    url: "https://lumioweatherapp.netlify.app",
    desc: "A clean weather forecast web app with real-time conditions.",
    detail: "Lumio is a clean, minimalist weather app that gives you real-time conditions and forecasts for any location, wrapped in a simple, easy-to-read interface.",
  },
  {
    id: 2,
    title: "Lumio To-Do List",
    category: "Personal Project",
    tags: ["To-Do List", "Web App"],
    accentDark: "#18181b",
    accentBg: "#F0EEE9",
    image: todoImg,
    url: "https://lumio-todolist.netlify.app",
    desc: "A simple, clean to-do list app for organizing daily tasks.",
    detail: "Lumio To-Do List is a simple task manager for keeping track of your daily to-dos — add, check off, and organize tasks in a clean, distraction-free interface.",
  },
];

const SERVICES = [
  { title: "Frontend Development", desc: "Building responsive, accessible interfaces with React, JavaScript, and modern CSS.", num: "01" },
  { title: "Backend Development", desc: "Designing REST APIs and server-side logic with Java and Spring Boot.", num: "02" },
  { title: "Scripting & Automation", desc: "Writing Python scripts to automate tasks and process data.", num: "03" },
  { title: "UI Implementation", desc: "Turning designs into pixel-accurate, responsive, cross-browser layouts.", num: "04" },
];

const PROCESS_STEPS = [
  { num: "01", title: "Plan", desc: "Understand the requirements and map out components before writing code." },
  { num: "02", title: "Build", desc: "Write clean, maintainable code — from UI components to backend endpoints." },
  { num: "03", title: "Test", desc: "Check functionality, responsiveness, and edge cases across devices." },
  { num: "04", title: "Ship", desc: "Deploy, document, and keep iterating based on feedback." },
];

// ─── Icons ────────────────────────────────────────────────────────────────
function EmailIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#18181b" strokeWidth="1.8" />
      <path d="M3 6l9 7 9-7" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#18181b" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.4-1.42a9.87 9.87 0 004.64 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.02h-.01a8.2 8.2 0 01-4.18-1.14l-.3-.18-3.2.84.86-3.12-.2-.32a8.2 8.2 0 01-1.26-4.38c0-4.54 3.7-8.24 8.3-8.24 2.22 0 4.3.87 5.87 2.44a8.2 8.2 0 012.43 5.83c0 4.55-3.7 8.27-8.31 8.27zm4.53-6.2c-.25-.12-1.47-.72-1.7-.8-.23-.08-.4-.12-.56.12-.17.25-.65.8-.8.96-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.02 2.58.12.17 1.74 2.66 4.22 3.72.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.2-.57.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28z" />
    </svg>
  );
}

function ClockIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#18181b" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 2" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AvailabilityIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#18181b" strokeWidth="1.8" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ size = 18, color = "#18181b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth="1.8" />
      <path d="M3 9.5h18" stroke={color} strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconLink({ href, label, children, size = 44 }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      style={{ width: size, height: size, borderRadius: "50%", background: "#ffffff", border: "1px solid rgba(24, 24, 27, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(24, 24, 27, 0.06)", flexShrink: 0 }}
    >
      {children}
    </a>
  );
}

// ─── Project thumbnail ───────────────────────────────────────────────────
function Thumb() {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="320" height="200" fill="#0F0F10" />
      <rect x="24" y="24" width="272" height="152" rx="10" fill="#18181b" stroke="#2A2A2E" strokeWidth="1" />
      <rect x="24" y="24" width="272" height="26" rx="10" fill="#1F1F23" />
      <circle cx="40" cy="37" r="4" fill="#E8574F" />
      <circle cx="54" cy="37" r="4" fill="#E8B324" />
      <circle cx="68" cy="37" r="4" fill="#4CAF50" />
      <rect x="120" y="32" width="100" height="10" rx="5" fill="#2A2A2E" />
      <rect x="40" y="66" width="90" height="10" rx="3" fill="#F7F4EE" />
      <rect x="40" y="84" width="140" height="6" rx="3" fill="rgba(247,244,238,0.4)" />
      <rect x="40" y="98" width="110" height="6" rx="3" fill="rgba(247,244,238,0.25)" />
      <rect x="40" y="122" width="70" height="24" rx="12" fill="#F7F4EE" />
      <circle cx="260" cy="130" r="34" fill="rgba(76,175,80,0.12)" />
      <circle cx="230" cy="150" r="20" fill="rgba(31,111,235,0.12)" />
    </svg>
  );
}

// ─── Shared Layout Wrapper ────────────────────────────────────────────────────
function PageWrapper({ children }) {
  return (
    <div style={{ animation: "fadeUp 0.35s ease both" }}>
      {children}
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const [hoveredProject, setHoveredProject] = useState(null);
  const [photoHovered, setPhotoHovered] = useState(false);
  const heroTextReveal = useReveal3D(10, 0);
  const servicesHeaderReveal = useReveal3D(12, 0);
  const featuredHeaderReveal = useReveal3D(12, 0);
  const ctaReveal = useReveal3D(16, 0);
  const scatterTransition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";

  return (
    <PageWrapper>
      {/* HERO */}
      <section className="hero-grid" style={{ padding: "5rem 0 4.5rem", position: "relative" }}>
        {/* Ambient drifting glow blobs — pure decoration, no pointer events */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", left: "-8%", top: "-18%", background: "radial-gradient(circle, rgba(58,123,255,0.09) 0%, transparent 70%)", filter: "blur(6px)", animation: "heroFloat1 15s ease-in-out infinite" }} />
          <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", right: "0%", top: "8%", background: "radial-gradient(circle, rgba(76,175,80,0.09) 0%, transparent 70%)", filter: "blur(6px)", animation: "heroFloat2 18s ease-in-out infinite" }} />
          <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", left: "38%", bottom: "-14%", background: "radial-gradient(circle, rgba(255,193,7,0.08) 0%, transparent 70%)", filter: "blur(6px)", animation: "heroFloat3 13s ease-in-out infinite" }} />
        </div>
        <div ref={heroTextReveal} style={{ position: "relative", zIndex: 1, transformOrigin: "center bottom", willChange: "transform, opacity" }}>
          <HelloRotator />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 100, padding: "6px 14px", marginBottom: "2rem" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#166534", letterSpacing: "0.04em" }}>Available for Work &amp; Internships</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.4rem, 4.6vw, 4.4rem)", fontWeight: 700, fontFamily: "var(--font-hero)", lineHeight: 1.08, letterSpacing: "-0.01em", margin: 0 }}>Full Stack</h1>
          <h1 style={{ fontSize: "clamp(3rem, 5.4vw, 5.2rem)", fontWeight: 400, fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.0, letterSpacing: "-0.02em", margin: "0.3rem 0 0.3rem", color: "var(--text-secondary)" }}>Developer &</h1>
          <h1 style={{ fontSize: "clamp(2.4rem, 4.6vw, 4.4rem)", fontWeight: 700, fontFamily: "var(--font-hero)", lineHeight: 1.08, letterSpacing: "-0.01em", margin: "0 0 2rem" }}>Problem-Solver.</h1>
          <p style={{ fontSize: 16.5, fontFamily: "var(--font-warm)", fontWeight: 800, lineHeight: 1.75, color: "#000000", maxWidth: 440, marginBottom: "2.2rem" }}>
            I turn ideas into fast, polished web experiences — from pixel-perfect React interfaces to solid backend APIs in Java, Spring Boot, and Python. Open to full-stack developer roles and internships where I can keep building and growing.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => setPage("Portfolio")} style={{ padding: "13px 28px", borderRadius: 100, background: "#18181b", color: "#ffffff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>View My Work →</button>
            <button onClick={() => setPage("Contact")} style={{ padding: "12px 28px", borderRadius: 100, background: "transparent", color: "#18181b", border: "1.5px solid rgba(24, 24, 27, 0.15)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Hire Me</button>
            <a href="/cv.pdf" download="Okafor-Michael-CV.pdf" style={{ padding: "12px 28px", borderRadius: 100, background: "transparent", color: "#18181b", border: "1.5px solid rgba(24, 24, 27, 0.15)",
              fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Download CV ↓</a>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: "2.2rem" }}>
            {["JavaScript", "React", "Java", "Spring Boot", "Python", "CSS"].map(t => (
              <span key={t} style={{ padding: "5px 12px", borderRadius: 100, background: "rgba(24, 24, 27, 0.05)", border: "1px solid rgba(24, 24, 27, 0.08)", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Profile card */}
        <div
          onMouseEnter={() => setPhotoHovered(true)}
          onMouseLeave={() => setPhotoHovered(false)}
          style={{ position: "relative", zIndex: 1 }}
        >
          <div
            style={{ background: "linear-gradient(145deg, #f4f4f5 0%, #e4e4e7 100%)", borderRadius: 28, overflow: "visible", aspectRatio: "3/4", position: "relative", boxShadow: "0 28px 72px rgba(24, 24, 27, 0.08)" }}
          >
            <img src="/profile.jpg" alt="Okafor Michael" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", borderRadius: 28 }} />
            <div style={{ position: "absolute", bottom: 20, left: 16, right: 16, zIndex: 2, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0, background: "#fff", borderRadius: 14, padding: "10px 12px", boxShadow: "0 8px 32px rgba(26,26,26,0.1)", transform: photoHovered ? "translate(297px, -276px) scale(1.08)" : "translate(0, 0) scale(1)", transition: scatterTransition }}>
                  <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em" }}>Junior</div>
                  <div style={{ fontSize: 11, color: "rgba(26,26,26,0.45)", fontWeight: 600, marginTop: 2 }}>Developer</div>
                </div>
                <div style={{ flex: 1, minWidth: 0, background: "#1A1A1A", borderRadius: 14, padding: "10px 12px", boxShadow: "0 8px 32px rgba(26,26,26,0.2)", transform: photoHovered ? "translate(-169px, -136px) scale(1.08)" : "translate(0, 0) scale(1)", transition: scatterTransition }}>
                  <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.04em", color: "#F7F4EE" }}>6+</div>
                  <div style={{ fontSize: 11, color: "rgba(247,244,238,0.45)", fontWeight: 600, marginTop: 2 }}>Core Skills</div>
                </div>
                <div style={{ flex: 1, minWidth: 0, background: "#EDFAF4", borderRadius: 14, padding: "10px 12px", boxShadow: "0 8px 24px rgba(26,26,26,0.08)", border: "1px solid #A8DFC9", transform: photoHovered ? "translate(44px, 5px) scale(1.08)" : "translate(0, 0) scale(1)", transition: scatterTransition }}>
                  <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em", color: "#1A6B4A" }}>Open</div>
                  <div style={{ fontSize: 11, color: "rgba(26,77,55,0.55)", fontWeight: 600, marginTop: 2 }}>To Work</div>
                </div>
              </div>
              <div style={{ background: "rgba(247,244,238,0.96)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "12px 16px" }}>
                <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>Okafor Michael</div>
                <div style={{ fontSize: 13, color: "rgba(26,26,26,0.48)", fontWeight: 500, marginTop: 2 }}>Junior Frontend / Full-Stack Developer</div>
                <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
                  {["JavaScript", "React", "Java"].map(t => <span key={t} style={{ padding: "2px 9px", borderRadius: 100, background: "#1A1A1A", color: "#F7F4EE", fontSize: 12, fontWeight: 700 }}>{t}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: "2rem 0 5rem" }}>
        <div ref={servicesHeaderReveal} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: "2.5rem", transformOrigin: "center bottom", willChange: "transform, opacity" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>What I Do</p>
            <h2 style={{ fontSize: "clamp(1.7rem, 2.8vw, 2.3rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>Services I <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>Offer</span></h2>
          </div>
          <button onClick={() => setPage("About")} style={{ padding: "9px 20px", borderRadius: 100, border: "1.5px solid rgba(24, 24, 27, 0.15)", background: "transparent", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>See All →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 14 }}>
          {SERVICES.map((s, i) => <ServiceCard key={i} service={s} delay={i * 60} />)}
        </div>
      </section>

      {/* FEATURED PROJECT */}
      <section style={{ padding: "1rem 0 5rem", borderTop: "1px solid rgba(24, 24, 27, 0.08)" }}>
        <div ref={featuredHeaderReveal} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: "2.5rem", transformOrigin: "center bottom", willChange: "transform, opacity" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>My Work</p>
            <h2 style={{ fontSize: "clamp(1.7rem, 2.8vw, 2.3rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>Featured <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>Work</span></h2>
          </div>
          <button onClick={() => setPage("Portfolio")} style={{ padding: "9px 20px", borderRadius: 100, border: "1.5px solid rgba(24, 24, 27, 0.15)", background: "transparent", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>View All →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 380px))", gap: 20 }}>
          {PROJECTS.map((p, i) => <ProjectCard key={p.id} project={p} hovered={hoveredProject === p.id} setHovered={setHoveredProject} delay={i * 60} />)}
        </div>
      </section>

      {/* CTA */}
      <section style={{ marginBottom: "4rem" }}>
        <div ref={ctaReveal} style={{ background: "linear-gradient(160deg, #1c1c20 0%, #18181b 60%, #131316 100%)", borderRadius: 28, padding: "3.5rem clamp(1.5rem, 5vw, 4rem)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "2rem", position: "relative", overflow: "hidden", transformOrigin: "center bottom", willChange: "transform, opacity" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", right: -80, top: -100, background: "radial-gradient(circle, rgba(88,120,255,0.20) 0%, transparent 70%)", animation: "ctaFloat1 9s ease-in-out infinite" }} />
            <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", left: -70, bottom: -110, background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", animation: "ctaFloat2 11s ease-in-out infinite" }} />
            <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", left: "42%", top: "-25%", background: "radial-gradient(circle, rgba(76,175,80,0.14) 0%, transparent 70%)", animation: "ctaFloat3 13s ease-in-out infinite" }} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>Let's Collaborate</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "#ffffff", lineHeight: 1.1 }}>
              Open to internships &<br /><span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "rgba(255,255,255,0.7)" }}>full-time roles.</span>
            </h2>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <button onClick={() => setPage("Contact")} style={{ padding: "13px 26px", borderRadius: 100, background: "#ffffff", color: "#18181b", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Get In Touch →</button>
            <a href={`mailto:${EMAIL}`} style={{ padding: "12px 26px", borderRadius: 100, background: "transparent", color: "#ffffff", border: "1.5px solid rgba(255,255,255,0.2)", fontSize: 15, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>{EMAIL}</a>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage({ setPage }) {
  const headingReveal = useReveal3D(10, 0);
  const imageReveal = useReveal3D(16, 0);
  const textReveal = useReveal3D(12, 60);

  return (
    <PageWrapper>
      <section style={{ padding: "4rem 0 2rem" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,26,26,0.35)", marginBottom: 8 }}>About Me</p>
        <h1 ref={headingReveal} style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "3rem", transformOrigin: "center bottom", willChange: "transform, opacity" }}>
          Building with purpose,<br /><span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>learning with curiosity.</span>
        </h1>
        <div className="about-grid">
          <div>
            <div ref={imageReveal} style={{ background: "linear-gradient(145deg, #EDE8E0, #D4CEC4)", borderRadius: 24, aspectRatio: "4/5", marginBottom: "2rem", position: "relative", overflow: "hidden", transformOrigin: "center bottom", willChange: "transform, opacity" }}>
              <img src="/profile.jpg" alt="Okafor Michael" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", borderRadius: 24 }} />
              <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, background: "rgba(247,244,238,0.95)", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>Okafor Michael</div>
                <div style={{ fontSize: 11, color: "rgba(26,26,26,0.5)", marginTop: 2 }}>Open to remote or on-site work</div>
              </div>
            </div>
          </div>
          <div ref={textReveal} style={{ transformOrigin: "center bottom", willChange: "transform, opacity" }}>
            <p style={{ fontSize: 16, lineHeight: 1.85, color: "rgba(26,26,26,0.65)", marginBottom: "1.5rem" }}>
              I'm a junior frontend/full-stack developer who enjoys turning ideas into clean, working products. I'm comfortable across the stack — from building responsive UIs in React to writing backend logic in Java and Spring Boot.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.85, color: "rgba(26,26,26,0.65)", marginBottom: "2.5rem" }}>
              I'm currently available for junior developer roles and internships, and I'm always looking for opportunities to learn, ship real projects, and grow as an engineer.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))", gap: 12, marginBottom: "2.5rem" }}>
              {[["Junior", "Experience Level"], ["Open", "To Internships"], ["6+", "Core Technologies"], ["Remote", "Or On-site"]].map(([n, l]) => (
                <div key={l} style={{ background: "#fff", borderRadius: 16, padding: "1.4rem", border: "1px solid rgba(26,26,26,0.07)" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: "#1A1A1A" }}>{n}</div>
                  <div style={{ fontSize: 14, color: "rgba(26,26,26,0.45)", marginTop: 4, fontWeight: 500 }}>{l}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: "1rem" }}>Skills & Tools</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "2rem" }}>
              {["JavaScript", "React", "Java", "Spring Boot", "Python", "CSS", "HTML5", "Git"].map(s => (
                <span key={s} style={{ padding: "5px 12px", borderRadius: 8, background: "#fff", border: "1px solid rgba(26,26,26,0.1)", fontSize: 14, fontWeight: 600, color: "rgba(26,26,26,0.65)" }}>{s}</span>
              ))}
            </div>
            <button onClick={() => setPage("Contact")} style={{ padding: "13px 28px", borderRadius: 100, background: "#1A1A1A", color: "#F7F4EE", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Let's Connect →</button>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── PORTFOLIO PAGE ───────────────────────────────────────────────────────────
function PortfolioPage() {
  const [hovered, setHovered] = useState(null);
  const headingReveal = useReveal3D(10, 0);
  const processHeaderReveal = useReveal3D(10, 0);

  return (
    <PageWrapper>
      <section style={{ padding: "4rem 0 2rem" }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>My Work</p>
        <h1 ref={headingReveal} style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "1.2rem", transformOrigin: "center bottom", willChange: "transform, opacity" }}>
          Selected <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>Work</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: "3rem", maxWidth: 520 }}>
          I'm just getting started — here are a few of my early projects. More case studies are on the way as I keep building.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 380px))", gap: 20 }}>
          {PROJECTS.map((p, i) => <ProjectCard key={p.id} project={p} hovered={hovered === p.id} setHovered={setHovered} delay={i * 60} />)}
        </div>
      </section>

      {/* Process */}
      <section style={{ padding: "4rem 0 5rem", borderTop: "1px solid rgba(24, 24, 27, 0.08)" }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>How I Work</p>
        <h2 ref={processHeaderReveal} style={{ fontSize: "clamp(1.7rem, 2.8vw, 2.3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "2.5rem", transformOrigin: "center bottom", willChange: "transform, opacity" }}>My Development <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>Process</span></h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 14 }}>
          {PROCESS_STEPS.map((s, i) => <ServiceCard key={s.num} service={s} delay={i * 60} />)}
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── BLOG PAGE ────────────────────────────────────────────────────────────────
function BlogPage() {
  const headingReveal = useReveal3D(10, 0);
  const cardReveal = useReveal3D(14, 60);

  return (
    <PageWrapper>
      <section style={{ padding: "4rem 0 6rem" }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Thoughts & Writing</p>
        <h1 ref={headingReveal} style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "2rem", transformOrigin: "center bottom", willChange: "transform, opacity" }}>
          The <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>Blog</span>
        </h1>
        <div ref={cardReveal} style={{ background: "#ffffff", border: "1px solid rgba(24, 24, 27, 0.08)", borderRadius: 24, padding: "3.5rem 2rem", textAlign: "center", maxWidth: 560, transformOrigin: "center bottom", willChange: "transform, opacity" }}>
          <div style={{ fontSize: 40, marginBottom: "1rem" }}>✍️</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.6rem" }}>No posts yet</h3>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7 }}>I'm working on my first article about learning frontend and backend development. Check back soon.</p>
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
const CONTACT_INFO = [
  { icon: <EmailIcon size={17} />, label: "Email", value: EMAIL },
  { icon: <WhatsAppIcon size={17} />, label: "WhatsApp", value: WHATSAPP_DISPLAY },
  { icon: <ClockIcon size={17} />, label: "Response Time", value: "Within 24 hours" },
  { icon: <AvailabilityIcon size={17} />, label: "Availability", value: "Open to jobs & internships" },
];

const BOOK_CALL_LINK = `${WHATSAPP_LINK}?text=${encodeURIComponent("Hi Michael, I'd like to book a call to discuss a project.")}`;

function ContactInfoCard({ icon, label, value, delay = 0 }) {
  const reveal = useReveal3D(12, delay);
  const tilt = useTilt(5);
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={reveal} style={{ transformOrigin: "center bottom", willChange: "transform, opacity" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseMove={(e) => { setHovered(true); tilt.onMouseMove(e); }}
        onMouseLeave={() => { setHovered(false); tilt.onMouseLeave(); }}
        style={{
          background: "#ffffff", borderRadius: 18, padding: "1.3rem 1.4rem", border: "1px solid rgba(24, 24, 27, 0.08)",
          boxShadow: hovered ? "0 16px 36px rgba(24, 24, 27, 0.1)" : "0 2px 8px rgba(24, 24, 27, 0.03)",
          transform: `perspective(900px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) translateY(${hovered ? -3 : 0}px)`,
          transition: `box-shadow 0.28s ease, ${tilt.transition}`,
        }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(24, 24, 27, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
          {icon}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#18181b" }}>{value}</div>
      </div>
    </div>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", budget: "", message: "" });
  const [sent, setSent] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const headingReveal = useReveal3D(10, 0);
  const infoReveal = useReveal3D(12, 0);
  const bookCallReveal = useReveal3D(14, 200);
  const formReveal = useReveal3D(16, 60);
  const formTilt = useTilt(2);

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => { if (form.name && form.email && form.message) setSent(true); };

  const fieldStyle = (key) => ({
    width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 16, color: "#18181b", background: "#FAFAFA",
    border: focusedField === key ? "1.5px solid #18181b" : "1.5px solid rgba(24, 24, 27, 0.12)",
    boxShadow: focusedField === key ? "0 0 0 3px rgba(24, 24, 27, 0.08)" : "none",
    outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  });

  return (
    <PageWrapper>
      <section style={{ padding: "4rem 0 5rem", position: "relative" }}>
        {/* Ambient drifting glow blobs — pure decoration, no pointer events */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", right: "-6%", top: "-10%", background: "radial-gradient(circle, rgba(76,175,80,0.08) 0%, transparent 70%)", filter: "blur(6px)", animation: "heroFloat2 17s ease-in-out infinite" }} />
          <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", left: "0%", bottom: "0%", background: "radial-gradient(circle, rgba(58,123,255,0.07) 0%, transparent 70%)", filter: "blur(6px)", animation: "heroFloat3 14s ease-in-out infinite" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Get In Touch</p>
          <h1 ref={headingReveal} style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "3rem", transformOrigin: "center bottom", willChange: "transform, opacity" }}>
            Let's build something<br /><span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>great together.</span>
          </h1>

          <div className="contact-grid">
            {/* Left info */}
            <div>
              <p ref={infoReveal} style={{ fontSize: 17, lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "2rem", transformOrigin: "center bottom", willChange: "transform, opacity" }}>
                I'm currently available for junior developer roles, internships, and freelance projects. Reach out and let's talk.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(160px, 100%), 1fr))", gap: 12, marginBottom: "1.6rem" }}>
                {CONTACT_INFO.map((item, i) => (
                  <ContactInfoCard key={item.label} icon={item.icon} label={item.label} value={item.value} delay={i * 50} />
                ))}
              </div>

              {/* Book a call */}
              <a
                ref={bookCallReveal}
                href={BOOK_CALL_LINK}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 14, textDecoration: "none",
                  background: "#18181b", borderRadius: 18, padding: "1.2rem 1.4rem", marginBottom: "1.6rem",
                  transformOrigin: "center bottom", willChange: "transform, opacity",
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CalendarIcon size={19} color="#ffffff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>Book a Call</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>Message me on WhatsApp to schedule a time</div>
                </div>
                <span style={{ fontSize: 18, color: "rgba(255,255,255,0.4)" }}>→</span>
              </a>

              <div>
                <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>Reach Me Directly</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <IconLink href={`mailto:${EMAIL}`} label="Email me"><EmailIcon /></IconLink>
                  <IconLink href={WHATSAPP_LINK} label="Message me on WhatsApp"><WhatsAppIcon /></IconLink>
                </div>
              </div>
            </div>

            {/* Form */}
            <div
              ref={formReveal}
              onMouseMove={formTilt.onMouseMove}
              onMouseLeave={formTilt.onMouseLeave}
              style={{
                background: "#ffffff", borderRadius: 24, padding: "2.5rem", border: "1px solid rgba(24, 24, 27, 0.08)",
                boxShadow: "0 20px 48px rgba(24, 24, 27, 0.06)",
                transform: `perspective(1200px) rotateX(${formTilt.rotateX.toFixed(2)}deg) rotateY(${formTilt.rotateY.toFixed(2)}deg)`,
                transformOrigin: "center bottom", willChange: "transform, opacity", transition: formTilt.transition,
              }}
            >
              {sent ? (
                <div style={{ textAlign: "center", padding: "3rem 0" }}>
                  <div style={{ fontSize: 48, marginBottom: "1rem" }}>✓</div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.8rem" }}>Message Sent!</h3>
                  <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7 }}>Thanks for reaching out, {form.name}. I'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name: "", email: "", budget: "", message: "" }); }} style={{ marginTop: "1.5rem", padding: "10px 22px", borderRadius: 100, background: "#18181b", color: "#ffffff", border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Send Another</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Send a Message</h3>
                  {[
                    { key: "name", label: "Your Name", placeholder: "John Doe" },
                    { key: "email", label: "Email Address", placeholder: "john@company.com" },
                    { key: "budget", label: "Project Budget (optional)", placeholder: "$5k – $10k" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>{label}</label>
                      <input
                        value={form[key]}
                        onChange={e => handle(key, e.target.value)}
                        onFocus={() => setFocusedField(key)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={placeholder}
                        style={fieldStyle(key)}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>Message</label>
                    <textarea
                      value={form.message}
                      onChange={e => handle("message", e.target.value)}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Tell me about your project..."
                      rows={5}
                      style={{ ...fieldStyle("message"), resize: "vertical" }}
                    />
                  </div>
                  <button onClick={submit} style={{ padding: "13px", borderRadius: 12, background: "#18181b", color: "#ffffff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: "0.4rem" }}>Send Message →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function ServiceCard({ service, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const reveal = useReveal3D(14, delay);
  const tilt = useTilt(6);
  return (
    <div ref={reveal} style={{ transformOrigin: "center bottom", willChange: "transform, opacity" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseMove={(e) => { setHovered(true); tilt.onMouseMove(e); }}
        onMouseLeave={() => { setHovered(false); tilt.onMouseLeave(); }}
        style={{
          background: hovered ? "#18181b" : "#ffffff", borderRadius: 20, padding: "1.8rem", border: "1px solid rgba(24, 24, 27, 0.08)", cursor: "pointer",
          boxShadow: hovered ? "0 20px 48px rgba(24, 24, 27, 0.12)" : "none",
          transform: `perspective(900px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) translateY(${hovered ? -4 : 0}px)`,
          transition: `background 0.28s ease, box-shadow 0.28s ease, ${tilt.transition}`,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: hovered ? "rgba(255,255,255,0.3)" : "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "1.2rem", transition: "color 0.28s" }}>{service.num}</div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: hovered ? "#ffffff" : "#18181b", letterSpacing: "-0.01em", transition: "color 0.28s" }}>{service.title}</h3>
        <p style={{ fontSize: 13, lineHeight: 1.65, color: hovered ? "rgba(255,255,255,0.55)" : "var(--text-secondary)", transition: "color 0.28s" }}>{service.desc}</p>
        <div style={{ marginTop: "1.4rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: hovered ? "rgba(255,255,255,0.35)" : "var(--text-muted)", transition: "color 0.28s" }}>Learn more</span>
          <span style={{ fontSize: 16, color: hovered ? "rgba(255,255,255,0.4)" : "rgba(24, 24, 27, 0.15)", transition: "color 0.28s" }}>→</span>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, hovered, setHovered, delay = 0 }) {
  const reveal = useReveal3D(16, delay);
  const [open, setOpen] = useState(false);
  const tilt = useTilt(6);
  return (
    <div ref={reveal} style={{ transformOrigin: "center bottom", willChange: "transform, opacity" }}>
      <div
        onMouseEnter={() => setHovered(project.id)}
        onMouseMove={(e) => { setHovered(project.id); tilt.onMouseMove(e); }}
        onMouseLeave={() => { setHovered(null); tilt.onMouseLeave(); }}
        onClick={() => setOpen(true)}
        style={{
          background: "#ffffff", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(24, 24, 27, 0.08)", cursor: "pointer",
          boxShadow: hovered ? "0 24px 56px rgba(24, 24, 27, 0.12)" : "0 2px 8px rgba(24, 24, 27, 0.04)",
          transform: `perspective(900px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) translateY(${hovered ? -6 : 0}px)`,
          transition: `box-shadow 0.3s ease, ${tilt.transition}`,
        }}
      >
        <div style={{ height: 210, overflow: "hidden", position: "relative" }}>
          {project.image ? (
            <img src={project.image} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          ) : (
            <Thumb />
          )}
          <div style={{ position: "absolute", inset: 0, background: "rgba(24, 24, 27, 0.55)", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.28s" }}>
            <div style={{ padding: "10px 22px", borderRadius: 100, background: "#ffffff", fontSize: 14, fontWeight: 700, color: "#18181b", letterSpacing: "0.04em" }}>View Details →</div>
          </div>
        </div>
        <div style={{ padding: "1.4rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>{project.title}</h3>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: project.accentDark, background: project.accentBg, borderRadius: 100, padding: "3px 10px", whiteSpace: "nowrap", marginLeft: 10, border: `1px solid ${project.accentDark}22` }}>{project.category}</span>
          </div>
          <p style={{ fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "1rem" }}>{project.desc}</p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {project.tags.map(t => <span key={t} style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", background: "rgba(24, 24, 27, 0.04)", borderRadius: 6, padding: "3px 9px", border: "1px solid rgba(24, 24, 27, 0.06)" }}>{t}</span>)}
          </div>
        </div>
      </div>
      {open && <ProjectModal project={project} onClose={() => setOpen(false)} />}
    </div>
  );
}

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(24, 24, 27, 0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", zIndex: 200 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#ffffff", borderRadius: 24, maxWidth: 480, width: "100%", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", animation: "fadeUp 0.25s ease both" }}
      >
        <div style={{ position: "relative" }}>
          {project.image && <img src={project.image} alt={project.title} style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "top" }} />}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#18181b", display: "flex", alignItems: "center", justifyContent: "center" }}
          >✕</button>
        </div>
        <div style={{ padding: "1.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em" }}>{project.title}</h3>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: project.accentDark, background: project.accentBg, borderRadius: 100, padding: "3px 10px", whiteSpace: "nowrap", border: `1px solid ${project.accentDark}22` }}>{project.category}</span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--text-secondary)", marginBottom: "1.2rem" }}>{project.detail || project.desc}</p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: "1.6rem" }}>
            {project.tags.map(t => <span key={t} style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", background: "rgba(24, 24, 27, 0.04)", borderRadius: 6, padding: "3px 9px", border: "1px solid rgba(24, 24, 27, 0.06)" }}>{t}</span>)}
          </div>
          {project.url && (
            <a href={project.url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: "11px 24px", borderRadius: 100, background: "#18181b", color: "#ffffff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Visit Site →</a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── SPLASH SCREEN ────────────────────────────────────────────────────────────
const SPLASH_NAME = "Okafor Michael";

function SplashScreen({ onDone }) {
  const [typed, setTyped] = useState("");
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    let typeTimeout;
    let i = 0;
    const typeNext = () => {
      i++;
      setTyped(SPLASH_NAME.slice(0, i));
      if (i < SPLASH_NAME.length) {
        typeTimeout = setTimeout(typeNext, 65 + Math.random() * 70);
      }
    };
    typeTimeout = setTimeout(typeNext, 250);

    const TOTAL_MS = 2600;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / TOTAL_MS);
      setProgress(t * 100);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setExiting(true);
        setTimeout(onDone, 550);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      clearTimeout(typeTimeout);
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [onDone]);

  return (
    <div
      role="status"
      aria-label="Loading site"
      style={{
        position: "fixed", inset: 0, zIndex: 1000, background: "#ffffff",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2.4rem",
        opacity: exiting ? 0 : 1, transform: exiting ? "scale(1.03)" : "scale(1)",
        transition: "opacity 0.55s ease, transform 0.6s ease", pointerEvents: exiting ? "none" : "auto",
      }}
    >
      <div style={{ width: 76, height: 76, borderRadius: "50%", overflow: "hidden", boxShadow: "0 8px 28px rgba(24, 24, 27, 0.14)", animation: "splashPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}>
        <img src={personalImg} alt="Okafor Michael" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", fontSize: "clamp(1.7rem, 5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#18181b", fontFamily: "var(--font-display)", minHeight: "1.2em" }}>
        <span>{typed}</span>
        <span style={{ display: "inline-block", width: 3, height: "0.95em", marginLeft: 5, background: "#18181b", animation: "splashBlink 0.9s steps(1) infinite" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ width: 220, height: 3, borderRadius: 100, background: "rgba(24, 24, 27, 0.1)", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", borderRadius: 100, background: "#18181b" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(24, 24, 27, 0.4)" }}>{Math.round(progress)}%</span>
      </div>

      <style>{`
        @keyframes splashBlink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
        @keyframes splashPop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [page, setPage] = useState("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const goTo = (item) => {
    setPage(item);
    setMobileMenuOpen(false);
  };

  const pages = { Home: <HomePage setPage={setPage} />, About: <AboutPage setPage={setPage} />, Portfolio: <PortfolioPage />, Blog: <BlogPage />, Contact: <ContactPage /> };

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <ScrollProgress />
    <div style={{ fontFamily: "var(--font-sans)", background: "#ffffff", color: "var(--text-primary)", minHeight: "100vh" }}>
      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(24, 24, 27, 0.08)" }} className="container-page">
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", height: 68 }}>
          <div onClick={() => goTo("Home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", justifySelf: "start" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
              <img src={personalImg} alt="Okafor Michael" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>Okafor Michael</span>
          </div>
          <div className="nav-links" style={{ background: "rgba(24, 24, 27, 0.05)", borderRadius: 100, padding: "5px 6px", gap: 2, justifySelf: "center" }}>
            {NAV_ITEMS.map(item => (
              <button key={item} onClick={() => goTo(item)} style={{ padding: "7px 18px", borderRadius: 100, border: "none", background: page === item ? "#18181b" : "transparent", color: page === item ? "#ffffff" : "rgba(24, 24, 27, 0.5)", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>{item}</button>
            ))}
          </div>
          <button
            className="nav-toggle"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            style={{ width: 40, height: 40, borderRadius: 100, border: "1px solid rgba(24, 24, 27, 0.15)", background: "transparent", alignItems: "center", justifyContent: "center", cursor: "pointer", flexDirection: "column", gap: 4, justifySelf: "end" }}
          >
            <span style={{ width: 18, height: 2, background: "#18181b", display: "block", transition: "transform 0.2s", transform: mobileMenuOpen ? "translateY(6px) rotate(45deg)" : "none" }} />
            <span style={{ width: 18, height: 2, background: "#18181b", display: "block", opacity: mobileMenuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
            <span style={{ width: 18, height: 2, background: "#18181b", display: "block", transition: "transform 0.2s", transform: mobileMenuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
        {mobileMenuOpen && (
          <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
            {NAV_ITEMS.map(item => (
              <button key={item} onClick={() => goTo(item)} style={{ padding: "10px 16px", borderRadius: 12, border: "none", textAlign: "left", background: page === item ? "#18181b" : "rgba(24, 24, 27, 0.05)", color: page === item ? "#ffffff" : "#18181b", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>{item}</button>
            ))}
          </div>
        )}
      </nav>

      <main className="container-page" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {pages[page]}
      </main>

      {/* FOOTER */}
      <footer className="container-page" style={{ borderTop: "1px solid rgba(24, 24, 27, 0.08)", padding: "1.8rem 0", marginTop: "2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Okafor Michael</span>
          <span style={{ fontSize: 14, color: "rgba(24, 24, 27, 0.45)" }}>© {new Date().getFullYear()} — All rights reserved</span>
          <div style={{ display: "flex", gap: 10 }}>
            <IconLink href={`mailto:${EMAIL}`} label="Email me" size={36}><EmailIcon size={16} /></IconLink>
            <IconLink href={WHATSAPP_LINK} label="Message me on WhatsApp" size={36}><WhatsAppIcon size={16} /></IconLink>
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes helloFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes helloWave { 0%, 100% { transform: rotate(0deg); } 15% { transform: rotate(14deg); } 30% { transform: rotate(-8deg); } 45% { transform: rotate(14deg); } 60% { transform: rotate(0deg); } }
        @keyframes heroFloat1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-26px, 22px) scale(1.12); } }
        @keyframes heroFloat2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -18px) scale(1.08); } }
        @keyframes heroFloat3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(16px, 20px) scale(0.92); } }
        @keyframes ctaFloat1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-30px, 25px) scale(1.15); } }
        @keyframes ctaFloat2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(25px, -20px) scale(1.1); } }
        @keyframes ctaFloat3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(15px, 30px) scale(0.9); } }
        input:focus, textarea:focus { border-color: #18181b !important; background: #ffffff !important; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
    </>
  );
}
