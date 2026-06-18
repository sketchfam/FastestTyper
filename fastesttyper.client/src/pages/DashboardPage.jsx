import "./DashboardPage.css";

const STATUS_MAP = {
  ready:      { label: "Ready to start", badge: "badge-coral" },
  "in-progress": { label: "In progress",  badge: "badge-gold" },
  completed:  { label: "Completed",       badge: "badge-green" },
};

const formatPreciseTime = (ms) => {
    if (ms == null) return "—";
    return (ms / 1000).toFixed(3) + "s";
};

export default function DashboardPage({ user, onEnterAgain, onStartEntry, navigate }) {
  const completed = user.entries?.filter((e) => e.status === "completed") || [];
  const bestWpm = completed.length > 0 ? Math.max(...completed.map((e) => e.wpm)) : null;

  return (
    <main className="dashboard">
      <div className="dashboard-inner">

        {/* ── Greeting ──────────────────────────────────── */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Hey, {user.name.split(" ")[0]} 👋</h1>
            <p className="dash-sub">Here are all your competition entries.</p>
          </div>
          <button className="btn btn-primary" onClick={onEnterAgain}>
            + Enter again — $3 XCD
          </button>
        </div>

        {/* ── Summary cards ─────────────────────────────── */}
        <div className="dash-summary">
          <div className="card summary-card">
            <span className="summary-val">{user.entries?.length || 0}</span>
            <span className="summary-lbl">Total entries</span>
          </div>
          <div className="card summary-card">
            <span className="summary-val text-green">{completed.length}</span>
            <span className="summary-lbl">Completed</span>
          </div>
          <div className="card summary-card">
            <span className="summary-val text-coral">{bestWpm ?? "—"}</span>
            <span className="summary-lbl">Best WPM</span>
          </div>
          <div className="card summary-card">
            <span className="summary-val text-gold">June 30</span>
            <span className="summary-lbl">Closes</span>
          </div>
        </div>

        {/* ── Entries list ──────────────────────────────── */}
        <div className="dash-section">
          <h2 className="dash-section-title">Your entries</h2>

          {(!user.entries || user.entries.length === 0) ? (
            <div className="empty-state card">
              <p className="empty-icon">⌨️</p>
              <p className="empty-title">No entries yet</p>
              <p className="empty-sub">Enter the competition to get your first typing passage.</p>
              <button className="btn btn-primary mt-2" onClick={onEnterAgain}>
                Enter now — $3 XCD
              </button>
            </div>
          ) : (
            <div className="entries-list">
              {user.entries.map((entry, i) => (
                <div className="entry-row card" key={entry.id}>
                  <div className="entry-left">
                    <span className="entry-num">#{i + 1}</span>
                    <div>
                      <span className={`badge ${STATUS_MAP[entry.status]?.badge}`}>
                        {STATUS_MAP[entry.status]?.label}
                      </span>
                      <p className="entry-date">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="entry-right">
                    {entry.status === "completed" ? (
                      <div className="entry-result">
                        <span className="entry-wpm text-coral">{entry.wpm} <small>WPM</small></span>
                        <span className="entry-acc text-muted">100% accuracy</span>
                        <span className="entry-time">{formatPreciseTime(entry.timeMs)}</span>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => onStartEntry(entry)}
                        disabled={entry.status === "in-progress"}
                      >
                        {entry.status === "ready" ? "Start typing →" : "In progress…"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick leaderboard teaser ───────────────────── */}
        <div className="dash-section">
          <div className="leaderboard-teaser card">
            <div>
              <h3 className="teaser-title">🏆 How are you ranking?</h3>
              <p className="teaser-sub">See where you stand against everyone else.</p>
            </div>
            <button className="btn btn-outline" onClick={() => navigate("leaderboard")}>
              View leaderboard
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
