import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styling/navbar.css";

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isOurStory = pathname.includes("/ourstory") || pathname === "/";
  const isDiary = pathname.includes("/diary");

  return (
    <>
      {/* Desktop / tablet header */}
      <header className="navbar">
        <nav className="nav-inner">
          <Link className={`nav-link ${isOurStory ? "is-active" : ""}`} to="/ourstory">
            Our Story
          </Link>
          <Link className={`nav-link ${isDiary ? "is-active" : ""}`} to="/diary">
            Diary
          </Link>
        </nav>
      </header>

      {/* Mobile hamburger (visible only ≤640px) */}
      <button
        className="mobile-menu-btn"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className="mobile-menu-icon" />
      </button>

      {/* Mobile full-screen sheet */}
      {open && (
        <div className="mobile-sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="mobile-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-sheet-header">
              <div className="mobile-sheet-title">Menu</div>
              <button
                className="mobile-sheet-close"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="mobile-sheet-links">
              <Link
                className={`mobile-link ${isOurStory ? "is-active" : ""}`}
                to="/ourstory"
                onClick={() => setOpen(false)}
              >
                Our Story
              </Link>
              <Link
                className={`mobile-link ${isDiary ? "is-active" : ""}`}
                to="/diary"
                onClick={() => setOpen(false)}
              >
                Diary
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
