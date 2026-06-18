import { useState, useEffect, useRef, useCallback } from "react";
import "./TypingPage.css";

export default function TypingPage({ entry, user, onComplete, navigate }) {
    const [passage, setPassage] = useState("");
    const [loading, setLoading] = useState(true);
    const [typed, setTyped] = useState("");
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsed, setElapsed] = useState(0);       // live display, tenths of a second — fine while running
    const [elapsedMs, setElapsedMs] = useState(null); // precise final time in ms — used for result + save
    const [wpm, setWpm] = useState(0);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const inputRef = useRef(null);
    const timerRef = useRef(null);

    // ── Fetch passage from backend ─────────────────────────────
    useEffect(() => {
        fetch("/api/passages/random")
            .then(res => res.json())
            .then(data => {
                setPassage(data.text);
                setLoading(false);
            })
            .catch(() => {
                alert("Failed to load passage. Please try again.");
                navigate("dashboard");
            });
    }, []);

    // ── Timer (live display only — doesn't need ms precision while ticking) ──
    useEffect(() => {
        if (started && !finished) {
            timerRef.current = setInterval(() => {
                setElapsed(((Date.now() - startTime) / 1000).toFixed(1));
            }, 100);
        }
        return () => clearInterval(timerRef.current);
    }, [started, finished, startTime]);

    // ── Save completed entry to backend ─────────────────────────
    const saveEntry = useCallback(async (finalWpm, finalAccuracy, finalElapsedMs) => {
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch("/api/entries/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    entryId: entry.id,
                    wpm: finalWpm,
                    accuracy: finalAccuracy,
                    timeMs: finalElapsedMs,
                }),
            });
            if (!res.ok) throw new Error(`Save failed: ${res.status}`);
        } catch (err) {
            setSaveError("Couldn't save your result. Please check your connection.");
        } finally {
            setSaving(false);
        }
    }, [entry.id]);

    // ── Handle input ───────────────────────────────────────────
    const handleInput = useCallback(
        (e) => {
            const value = e.target.value;

            // Block paste
            if (value.length - typed.length > 2) return;

            if (!started) {
                setStarted(true);
                setStartTime(Date.now());
            }

            setTyped(value);

            // Check completion — trigger once typed length reaches the passage
            // length, rather than requiring an exact string match (which could
            // silently never fire on a stray character/whitespace mismatch).
            if (value.length >= passage.length) {
                clearInterval(timerRef.current);
                setFinished(true);

                const ms = Date.now() - startTime;
                setElapsedMs(ms);

                const minutes = ms / 60000;
                const words = passage.split(" ").length;
                const finalWpm = Math.round(words / minutes);
                setWpm(finalWpm);

                const correctChars = value.split("").filter((c, i) => c === passage[i]).length;
                const finalAccuracy = Math.round((correctChars / value.length) * 100);

                saveEntry(finalWpm, finalAccuracy, ms);
            }
        },
        [started, typed, passage, startTime, saveEntry]
    );

    // Block paste event directly
    const handlePaste = (e) => e.preventDefault();

    // ── Render passage with character highlighting ─────────────
    const renderPassage = () => {
        return passage.split("").map((char, i) => {
            let cls = "char-pending";
            if (i < typed.length) {
                cls = typed[i] === char ? "char-correct" : "char-wrong";
            } else if (i === typed.length) {
                cls = "char-cursor";
            }
            return (
                <span key={i} className={cls}>
                    {char}
                </span>
            );
        });
    };

    const handleFinishContinue = () => {
        onComplete({ entryId: entry.id, wpm, accuracy: 100, timeMs: elapsedMs });
    };

    // ── Format precise time for display, e.g. 24.847s ───────────
    const formatPreciseTime = (ms) => {
        if (ms == null) return "—";
        return (ms / 1000).toFixed(3) + "s";
    };

    const correctChars = typed.split("").filter((c, i) => c === passage[i]).length;
    const accuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100;
    const progress = passage.length > 0 ? Math.round((typed.length / passage.length) * 100) : 0;

    // ── Loading state ──────────────────────────────────────────
    if (loading) {
        return (
            <main className="typing-page">
                <div className="typing-inner">
                    <p style={{ textAlign: "center", marginTop: "4rem" }}>Loading your passage…</p>
                </div>
            </main>
        );
    }

    return (
        <main className="typing-page">
            <div className="typing-inner">

                {/* ── Header ────────────────────────────────────── */}
                <div className="typing-header">
                    <div>
                        <h1 className="typing-title">Your entry</h1>
                        <p className="typing-sub">Type the passage below exactly as shown. No copy-paste.</p>
                    </div>
                    <button className="btn btn-ghost" onClick={() => navigate("dashboard")}>
                        ← Back to entries
                    </button>
                </div>

                {/* ── Live stats bar ────────────────────────────── */}
                <div className="stats-bar">
                    <div className="stat-item">
                        <span className="stat-val">{elapsed}s</span>
                        <span className="stat-lbl">Time</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-val">{started ? Math.round((typed.split(" ").length) / Math.max(elapsed / 60, 0.01)) : "—"}</span>
                        <span className="stat-lbl">WPM (live)</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-val">{accuracy}%</span>
                        <span className="stat-lbl">Accuracy</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-val">{progress}%</span>
                        <span className="stat-lbl">Progress</span>
                    </div>
                </div>

                {/* ── Progress bar ──────────────────────────────── */}
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>

                {/* ── Passage display ───────────────────────────── */}
                {!finished ? (
                    <>
                        <div
                            className="passage-display"
                            onClick={() => inputRef.current?.focus()}
                        >
                            {renderPassage()}
                        </div>

                        {!started && (
                            <div className="start-hint">
                                Click the text above, then start typing to begin the timer.
                            </div>
                        )}

                        {/* Hidden input that captures keystrokes */}
                        <input
                            ref={inputRef}
                            className="hidden-input"
                            value={typed}
                            onChange={handleInput}
                            onPaste={handlePaste}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            aria-label="Type the passage here"
                        />

                        {/* Visible input for mobile users */}
                        <div className="mobile-input-wrap">
                            <p className="mobile-label">Tap here to type (mobile)</p>
                            <textarea
                                className="mobile-textarea"
                                value={typed}
                                onChange={handleInput}
                                onPaste={handlePaste}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                placeholder="Start typing here…"
                                rows={4}
                            />
                        </div>
                    </>
                ) : (
                    /* ── Result screen ───────────────────────────── */
                    <div className="result-card card">
                        <div className="result-trophy">🏆</div>
                        <h2 className="result-title">Entry complete!</h2>
                        <p className="result-sub">Here's how you did, {user?.name?.split(" ")[0]}.</p>

                        <div className="result-stats">
                            <div className="result-stat">
                                <span className="result-val text-coral">{wpm}</span>
                                <span className="result-lbl">Words per minute</span>
                            </div>
                            <div className="result-stat">
                                <span className="result-val text-gold">{formatPreciseTime(elapsedMs)}</span>
                                <span className="result-lbl">Total time</span>
                            </div>
                            <div className="result-stat">
                                <span className="result-val">100%</span>
                                <span className="result-lbl">Accuracy</span>
                            </div>
                        </div>

                        {saving && (
                            <p className="result-note">Saving your result…</p>
                        )}
                        {saveError && (
                            <p className="result-note" style={{ color: "#e06c5c" }}>{saveError}</p>
                        )}
                        {!saving && !saveError && (
                            <p className="result-note">
                                Your result has been saved. Check the leaderboard to see where you stand!
                            </p>
                        )}

                        <div className="result-actions">
                            <button className="btn btn-primary" onClick={handleFinishContinue}>
                                View my entries
                            </button>
                            <button className="btn btn-outline" onClick={() => navigate("leaderboard")}>
                                See leaderboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
