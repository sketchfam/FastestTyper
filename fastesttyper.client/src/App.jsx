import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import TypingPage from "./pages/TypingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import Navbar from "./components/Navbar";
import PaymentModal from "./components/PaymentModal";
import "./styles/globals.css";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function App() {
    const [currentPage, setCurrentPage] = useState("home");
    const [user, setUser] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [activeEntry, setActiveEntry] = useState(null);

    const navigate = (page) => setCurrentPage(page);

    useEffect(() => {
        if (window.location.pathname === "/auth-callback") {
            setCurrentPage("auth-callback");
        }
    }, []);

    useEffect(() => {
        if (window.location.pathname === "/auth-callback") return;
        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/me`, { credentials: "include" });
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

    const refreshUser = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me`, { credentials: "include" });
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
        refreshUser();
    };

    const handleLogout = async () => {
        await fetch(`${API_URL}/api/auth/logout`, { method: "POST" });
        setUser(null);
        setCurrentPage("home");
    };

    const handleEnterCompetition = () => {
        if (!user) {
            window.location.href = `${API_URL}/api/auth/login/google`;
        } else {
            setShowPaymentModal(true);
        }
    };

    const handlePaymentSuccess = (entry) => {
        setActiveEntry(entry);
        setShowPaymentModal(false);
        setCurrentPage("typing");
        refreshUser();
    };

    const handleTypingComplete = async (result) => {
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
                onLogin={() => { window.location.href = `${API_URL}/api/auth/login/google`; }}
                onSignup={() => { window.location.href = `${API_URL}/api/auth/login/google`; }}
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