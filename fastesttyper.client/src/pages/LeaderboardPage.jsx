import { useState, useEffect } from "react";
import "./LeaderboardPage.css";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

// Format raw milliseconds as e.g. "24.847s"
const formatPreciseTime = (ms) => {
    if (ms == null) return "—";
    return (ms / 1000).toFixed(3) + "s";
};

export default function LeaderboardPage({ navigate }) {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("/api/leaderboard", { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setLeaders(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Couldn't load the leaderboard. Please try again.");
                setLoading(false);
            });
    }, []);

    const top3 = leaders.slice(0, 3);

    return (
        <main className="leaderboard">
            <div className="leaderboard-inner">

                <div className="lb-header">
                    <div>
                        <h1 className="lb-title">Leaderboard</h1>
                        <p className="lb-sub">
                            Updated live · Competition closes <strong style={{ color: "#F7F4EF" }}>June 30</strong>
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate("home")}>
                        Enter to compete
                    </button>
                </div>

                {loading && (
                    <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading leaderboard…</p>
                )}

                {error && (
                    <p style={{ textAlign: "center", marginTop: "2rem", color: "#e06c5c" }}>{error}</p>
                )}

                {!loading && !error && leaders.length === 0 && (
                    <div className="empty-state card">
                        <p className="empty-title">No entries yet</p>
                        <p className="empty-sub">Be the first to complete a typing entry and claim the top spot.</p>
                    </div>
                )}

                {!loading && !error && leaders.length > 0 && (
                    <>
                        {/* ── Podium top 3 ──────────────────────────────── */}
                        <div className="podium">
                            {top3.map((p) => (
                                <div className={`podium-card card podium-${p.rank}`} key={p.rank}>
                                    <span className="podium-medal">{MEDAL[p.rank]}</span>
                                    <span className="podium-name">{p.name}</span>
                                    <span className="podium-wpm">{p.wpm}</span>
                                    <span className="podium-wpm-label">WPM</span>
                                    <span className="podium-time">{formatPreciseTime(p.timeMs)}</span>
                                </div>
                            ))}
                        </div>

                        {/* ── Full table ────────────────────────────────── */}
                        <div className="lb-table-wrap card">
                            <table className="lb-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Name</th>
                                        <th>Best WPM</th>
                                        <th>Time</th>
                                        <th>Entries</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaders.map((row) => (
                                        <tr key={row.rank} className={row.rank <= 3 ? "top-row" : ""}>
                                            <td className="rank-cell">
                                                {MEDAL[row.rank] || `#${row.rank}`}
                                            </td>
                                            <td className="name-cell">{row.name}</td>
                                            <td className="wpm-cell text-coral">{row.wpm}</td>
                                            <td className="time-cell">{formatPreciseTime(row.timeMs)}</td>
                                            <td className="entries-cell">
                                                <span className="badge badge-muted">{row.entries}×</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="lb-note">
                            Only the best entry per person is shown. All entries count toward the prize pool.
                            Winners announced July 1, 2026.
                        </p>
                    </>
                )}

            </div>
        </main>
    );
}
