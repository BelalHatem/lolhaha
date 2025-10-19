import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../styling/navbar.css";

export default function Navbar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setVisible(e.clientY < 100);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <nav className={`navbar ${visible ? "navbar-visible" : ""}`}>
      <NavLink to="/ourstory" className="nav-link">
        Our story
      </NavLink>
    </nav>
  );
}
