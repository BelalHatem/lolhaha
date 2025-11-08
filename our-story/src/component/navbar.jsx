import { Link, useLocation } from "react-router-dom";
import "../styling/navbar.css";

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header className="navbar">
      <nav className="nav-inner">
        <Link className={`nav-link ${pathname.includes("/ourstory") || pathname === "/" ? "is-active" : ""}`} to="/ourstory">
          Our Story
        </Link>
        <Link className={`nav-link ${pathname.includes("/diary") ? "is-active" : ""}`} to="/diary">
          Diary
        </Link>
      </nav>
    </header>
  );
}
