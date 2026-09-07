import { useEffect, useRef, useState } from "react";
import lumioImg from "./assets/Lumio page.png";
import todoImg from "./assets/todo.png";
import personalImg from "./assets/personal.jpeg";

const EMAIL = "michealugo166@gmail.com";
const WHATSAPP_LINK = "https://wa.me/2347071341196";
const WHATSAPP_DISPLAY = "+234 707 134 1196";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mnpapybo";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const navItems = ["Home", "About", "Work", "Contact"];

const skills = ["React", "JavaScript", "Java", "Spring Boot", "Python", "REST APIs", "Responsive UI", "Git"];

const services = [
  {
    title: "Frontend Engineering",
    text: "I build responsive interfaces with React, modern CSS, accessibility basics, and careful attention to performance.",
  },
  {
    title: "Backend Foundations",
    text: "I design practical API flows with Java, Spring Boot, and database-aware server-side logic.",
  },
  {
    title: "Product Mindset",
    text: "I translate requirements into clear user journeys, test edge cases, and ship work that is easy to improve.",
  },
];

const projects = [
  {
    title: "Lumio Weather App",
    type: "React Web App",
    image: lumioImg,
    url: "https://lumioweatherapp.netlify.app",
    summary: "A polished weather app with live conditions, forecast details, and a clean information hierarchy.",
    stack: ["React", "API Integration", "CSS"],
  },
  {
    title: "Lumio To-Do List",
    type: "Productivity App",
    image: todoImg,
    url: "https://lumio-todolist.netlify.app",
    summary: "A focused task manager for adding, completing, and organizing daily tasks with minimal friction.",
    stack: ["React", "State", "UX"],
  },
];

const metrics = [
  ["2+", "Deployed projects"],
  ["8", "Core technologies"],
  ["Full-stack", "Role focus"],
];

function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const next = Math.min(1, Math.max(0, -rect.top / travel));
      setProgress(next);
    };

    const queueUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);

  return progress;
}

function Header({ active, setActive }) {
  const [open, setOpen] = useState(false);

  const goTo = (item) => {
    setActive(item);
    setOpen(false);
  };

  return (
    <header className="site-header">
      <button className="brand" onClick={() => goTo("Home")} aria-label="Go to home">
        <img src={personalImg} alt="Okafor Michael" />
        <span>Okafor Michael</span>
      </button>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button key={item} className={active === item ? "active" : ""} onClick={() => goTo(item)}>
            {item}
          </button>
        ))}
      </nav>

      <button className="nav-toggle" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={open}>
        <span />
        <span />
        <span />
      </button>

      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <button key={item} className={active === item ? "active" : ""} onClick={() => goTo(item)}>
              {item}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

function Hero({ setActive }) {
  return (
    <section className="hero section-shell">
      <div className="hero-copy">
        <p className="eyebrow">Full-stack developer in progress</p>
        <h1>Building clean web products with front-end polish and backend discipline.</h1>
        <p className="hero-text">
          I am Michael Okafor, a junior developer focused on React interfaces, Java/Spring Boot APIs, and practical
          problem solving. I care about reliable code, readable experiences, and growing through real-world teams.
        </p>

        <div className="hero-actions">
          <button className="button primary" onClick={() => setActive("Work")}>View Work</button>
          <button className="button secondary" onClick={() => setActive("Contact")}>Contact Me</button>
          <a className="button ghost" href="/cv.pdf" download="Okafor-Michael-CV.pdf">Download CV</a>
        </div>

        <div className="skill-strip" aria-label="Core skills">
          {skills.map((skill) => <span key={skill}>{skill}</span>)}
        </div>
      </div>

      <div className="hero-panel" aria-label="Profile summary">
        <div className="profile-frame">
          <img src="/profile.jpg" alt="Okafor Michael" />
        </div>
        <div className="profile-card">
          <span>Available for internships and junior developer roles</span>
          <strong>React | Java | Python</strong>
        </div>
      </div>
    </section>
  );
}

function ScrollStack3D() {
  const sectionRef = useRef(null);
  const progress = useScrollProgress(sectionRef);
  const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const eased = reduceMotion ? 0.68 : progress;
  const rotateY = -28 + eased * 56;
  const rotateX = 16 - eased * 28;
  const translateZ = -120 + eased * 180;
  const translateY = 44 - eased * 88;

  const layers = [
    ["01", "Interface", "Component-led React screens with responsive CSS."],
    ["02", "Logic", "Clear state, validation, forms, and API wiring."],
    ["03", "Service", "Backend endpoints and data flows built for maintainability."],
  ];

  return (
    <section className="scroll-stage" ref={sectionRef}>
      <div className="scroll-sticky section-shell">
        <div className="scroll-copy">
          <p className="eyebrow">3D scroll system</p>
          <h2>My work moves from interface to logic to service design.</h2>
          <p>
            Scroll this section and the stack rotates through the layers of how I approach a product: visible UI,
            application behavior, and the backend systems that support it.
          </p>
        </div>

        <div className="scene" aria-hidden="true">
          <div
            className="stack-3d"
            style={{
              transform: `translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            }}
          >
            {layers.map(([num, title, text], index) => (
              <div key={title} className={`stack-layer layer-${index + 1}`}>
                <span>{num}</span>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="section-shell two-column">
      <div>
        <p className="eyebrow">About</p>
        <h2>A junior developer with a strong appetite for professional engineering habits.</h2>
      </div>
      <div className="about-body">
        <p>
          I enjoy turning ideas into usable software, especially when I can combine thoughtful UI work with practical
          backend structure. My current stack centers on React, JavaScript, Java, Spring Boot, Python, and modern CSS.
        </p>
        <p>
          I am looking for opportunities where I can contribute, learn from experienced engineers, and become the kind
          of developer teammates can trust with increasingly meaningful work.
        </p>
        <div className="metric-grid">
          {metrics.map(([value, label]) => (
            <div className="metric" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="section-shell">
      <div className="section-heading">
        <p className="eyebrow">Capabilities</p>
        <h2>What I can help build</h2>
      </div>
      <div className="service-grid">
        {services.map((service, index) => (
          <article className="service-card" key={service.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className="section-shell">
      <div className="section-heading">
        <p className="eyebrow">Selected work</p>
        <h2>Deployed projects with practical user flows</h2>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            <a href={project.url} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}`}>
              <img src={project.image} alt={project.title} />
            </a>
            <div>
              <p>{project.type}</p>
              <h3>{project.title}</h3>
              <span>{project.summary}</span>
              <div className="project-stack">
                {project.stack.map((item) => <small key={item}>{item}</small>)}
              </div>
              <a className="text-link" href={project.url} target="_blank" rel="noreferrer">Visit project</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();

    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Unable to send message.");
      form.reset();
      setStatus("sent");
    } catch {
      setError("Something went wrong. You can email me directly instead.");
      setStatus("idle");
    }
  };

  return (
    <section className="section-shell contact-section">
      <div>
        <p className="eyebrow">Contact</p>
        <h2>Have an opportunity or project in mind?</h2>
        <p>
          I am open to internships, junior developer roles, collaborations, and portfolio-building projects with clear
          goals.
        </p>
        <div className="contact-links">
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">{WHATSAPP_DISPLAY}</a>
        </div>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" type="text" placeholder="Your name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" placeholder="you@example.com" required />
        </label>
        <label>
          Message
          <textarea name="message" rows="5" placeholder="Tell me what you are building." required />
        </label>
        {error && <p className="form-note error">{error}</p>}
        {status === "sent" && <p className="form-note success">Message sent. I will get back to you soon.</p>}
        <button className="button primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>
      </form>
    </section>
  );
}

function CurrentPage({ active, setActive }) {
  if (active === "About") return <><About /><Services /><ScrollStack3D /></>;
  if (active === "Work") return <><Work /><ScrollStack3D /></>;
  if (active === "Contact") return <Contact />;

  return (
    <>
      <Hero setActive={setActive} />
      <Services />
      <ScrollStack3D />
      <Work />
      <About />
      <Contact />
    </>
  );
}

export default function App() {
  const [active, setActive] = useState("Home");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [active]);

  return (
    <div className="app">
      <Header active={active} setActive={setActive} />
      <main>
        <CurrentPage active={active} setActive={setActive} />
      </main>
      <footer className="site-footer section-shell">
        <strong>Okafor Michael</strong>
        <span>Junior full-stack developer</span>
        <a href={`mailto:${EMAIL}`}>Email me</a>
      </footer>
    </div>
  );
}
