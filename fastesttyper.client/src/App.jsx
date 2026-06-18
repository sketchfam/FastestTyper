import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import TypingPage from "./pages/TypingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import Navbar from "./components/Navbar";
import PaymentModal from "./components/PaymentModal";
import "./styles/globals.css";

export default function App() {
    const [currentPage, setCurrentPage] = useState("home");
    const [user, setUser] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [activeEntry, setActiveEntry] = useState(null);

    const navigate = (page) => setCurrentPage(page);

    // Check if we're on the auth callback URL
    useEffect(() => {
        if (window.location.pathname === "/auth-callback") {
            setCurrentPage("auth-callback");
        }
    }, []);

    // On initial load (including a hard refresh), try to restore the
    // session from the auth cookie. Without this, any page reload looks
    // logged-out even though the cookie/session is still valid server-side.
    useEffect(() => {
        if (window.location.pathname === "/auth-callback") return; // handled separately
        (async () => {
            try {
                const res = await fetch("/api/auth/me", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setCurrentPage((prev) => (prev === "home" ? "dashboard" : prev));
                }
            } catch (err) {
                console.error("Session check failed:", err);
            }
        })();
    }, []);

    // Pulls the latest user + entries from the database. Call this any time
    // the dashboard needs to reflect real, persisted state rather than
    // client-side guesses.
    const refreshUser = async () => {
        try {
            const res = await fetch("/api/auth/me", { credentials: "include" });
            if (!res.ok) return;
            const data = await res.json();
            setUser(data);
        } catch (err) {
            console.error("Failed to refresh user:", err);
        }
    };

    const handleAuthSuccess = (userData) => {
        setUser(userData);
        window.history.replaceState({}, "", "/");
        setCurrentPage("dashboard");
        // userData from the callback only has Id/Name/Email — fetch entries too.
        refreshUser();
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        setCurrentPage("home");
    };

    const handleEnterCompetition = () => {
        if (!user) {
            window.location.href = "/api/auth/login/google";
        } else {
            setShowPaymentModal(true);
        }
    };

    // entry here is the REAL database entry returned by /api/entries/create
    // (has a real integer id), not a client-fabricated object.
    const handlePaymentSuccess = (entry) => {
        setActiveEntry(entry);
        setShowPaymentModal(false);
        setCurrentPage("typing");
        // Refresh so the dashboard's entry list includes this new row too.
        refreshUser();
    };

    const handleTypingComplete = async (result) => {
        // The actual save already happened inside TypingPage via
        // /api/entries/complete. Just refetch the real state from the
        // database instead of guessing/mutating local state.
        await refreshUser();
        setCurrentPage("dashboard");
    };

    const startExistingEntry = (entry) => {
        setActiveEntry(entry);
        setCurrentPage("typing");
    };

    return (
        <div className="app">
            <Navbar
                user={user}
                onLogin={() => { window.location.href = "/api/auth/login/google"; }}
                onSignup={() => { window.location.href = "/api/auth/login/google"; }}
                onLogout={handleLogout}
                navigate={navigate}
                currentPage={currentPage}
            />

            {currentPage === "auth-callback" && (
                <AuthCallbackPage onAuthSuccess={handleAuthSuccess} />
            )}
            {currentPage === "home" && (
                <HomePage onEnter={handleEnterCompetition} navigate={navigate} />
            )}
            {currentPage === "dashboard" && user && (
                <DashboardPage
                    user={user}
                    onEnterAgain={handleEnterCompetition}
                    onStartEntry={startExistingEntry}
                    navigate={navigate}
                />
            )}
            {currentPage === "typing" && activeEntry && (
                <TypingPage
                    entry={activeEntry}
                    user={user}
                    onComplete={handleTypingComplete}
                    navigate={navigate}
                />
            )}
            {currentPage === "leaderboard" && (
                <LeaderboardPage navigate={navigate} />
            )}

            {showPaymentModal && (
                <PaymentModal
                    onSuccess={handlePaymentSuccess}
                    onClose={() => setShowPaymentModal(false)}
                    user={user}
                />
            )}
        </div>
    );
}