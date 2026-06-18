import "./HomePage.css";

const STATS = [
  { value: "250", label: "Entries so far" },
  { value: "$3 XCD", label: "Per entry" },
  { value: "June 30", label: "Competition closes" },
];

const STEPS = [
  {
    icon: "💳",
    title: "Pay your entry",
    desc: "Pay $3 XCD via PayPal to lock in your spot. You can enter more than once.",
  },
  {
    icon: "⌨️",
    title: "Type when you're ready",
    desc: "You'll get a random passage. Type it exactly — no copy-paste allowed.",
  },
  {
    icon: "🏆",
    title: "See where you rank",
    desc: "Your WPM is logged instantly. The fastest fingers win when entries close.",
  },
];

export default function HomePage({ onEnter, navigate }) {
  return (
    <main className="home">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="badge badge-coral">💘 For Singles — and Everyone Else</span>
          </div>

          <h1 className="hero-title">
            Who's the<br />
            <span className="hero-title-accent">Fastest</span><br />
            Typer?
          </h1>

          <p className="hero-sub">
            A Caribbean typing competition. Pay $3 XCD, race the clock,
            claim your crown. The quickest fingers take it all.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onEnter}>
              Enter Now — $3 XCD
            </button>
            <button className="btn btn-outline" onClick={() => navigate("leaderboard")}>
              View Leaderboard
            </button>
          </div>

          <div className="hero-stats">
            {STATS.map((s) => (
              <div className="hero-stat" key={s.label}>
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative keyboard art */}
        <div className="hero-visual" aria-hidden="true">
          <div className="keyboard-icon">
            <span className="key-pulse">⌨️</span>
            <span className="heart-float">💘</span>
          </div>
          <div className="wpm-badge">
            <span className="wpm-num">142</span>
            <span className="wpm-label">WPM</span>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className="how-section">
        <div className="section-inner">
          <h2 className="section-title">How it works</h2>
          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div className="step-card card" key={i}>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rules ─────────────────────────────────────── */}
      <section className="rules-section">
        <div className="section-inner rules-inner">
          <div>
            <h2 className="section-title">The rules</h2>
            <ul className="rules-list">
              <li>One passage per paid entry — all passages are the same length.</li>
              <li>You must type the passage exactly as shown. No errors skipped.</li>
              <li>Copy-pasting is blocked. Only real typing counts.</li>
              <li>You can enter as many times as you like — each entry is $3 XCD.</li>
              <li>Competition closes <strong>June 30</strong>. Winner announced July 1.</li>
              <li>Prize is the full entry pool (minus PayPal fees).</li>
            </ul>
          </div>
          <div className="rules-cta">
            <p className="rules-cta-text">Think you've got fast fingers?</p>
            <button className="btn btn-gold btn-lg" onClick={onEnter}>
              Enter the Competition
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="home-footer">
        <p>© 2025 FastestTyper · Made with 💘 in the Caribbean</p>
      </footer>
    </main>
  );
}
