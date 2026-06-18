import "./Navbar.css";

export default function Navbar({ user, onLogin, onSignup, onLogout, navigate, currentPage }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="navbar-logo" onClick={() => navigate("home")}>
          <span className="logo-icon">⌨️</span>
          <span className="logo-text">Fastest<span className="logo-accent">Typer</span></span>
        </button>

        <div className="navbar-links">
          <button
            className={`nav-link ${currentPage === "leaderboard" ? "active" : ""}`}
            onClick={() => navigate("leaderboard")}
          >
            Leaderboard
          </button>
          {user && (
            <button
              className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
              onClick={() => navigate("dashboard")}
            >
              My Entries
            </button>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <span className="nav-user">👤 {user.name.split(" ")[0]}</span>
              <button className="btn btn-ghost" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={onLogin}>Log in</button>
              <button className="btn btn-primary" onClick={onSignup}>Sign up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
