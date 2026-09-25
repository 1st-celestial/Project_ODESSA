// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css"

export default function Footer() {
  return (
    <footer className="footer pp">
      <div className="footer-content">
        <div className="footer-logo">Odessa</div>
        <ul className="footer-links">
          <li><Link to="/" style={{ textDecoration: "none", color: "inherit" }}>Home</Link></li>
          <li>Features</li>
          <li>Pricing</li>
          <li><Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>Get Started</Link></li>
        </ul>
        <p className="footer-copy">
          © {new Date().getFullYear()} Odessa — created with curiosity by Celestial • built with React
        </p>
      </div>
    </footer>
  );
}
