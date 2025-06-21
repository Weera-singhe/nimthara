import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <nav
      style={{
        padding: "1rem",
        backgroundColor: "#f0f0f0",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Link to="/" style={{ marginRight: "1rem", textDecoration: "none" }}>
        Home
      </Link>
      <Link
        to="/papers"
        style={{ marginRight: "1rem", textDecoration: "none" }}
      >
        Papers
      </Link>
    </nav>
  );
}
