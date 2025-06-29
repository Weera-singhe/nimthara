import React from "react";
import { Link, useLocation } from "react-router-dom";
import reactLogo from "../assests/long_logo.png";

export default function Header() {
  const location = useLocation();
  const links = [
    { path: "/", label: "Home" },
    { path: "/papers", label: "Papers" },
    { path: "/price", label: "Price" },
    { path: "/stock", label: "Stock" },
    { path: "/quotation", label: "Quotation" },
  ];

  return (
    <header>
      <img src={reactLogo} alt="long_logo" />
      <nav>
        {links.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            style={{
              fontWeight: location.pathname === path ? "bolder" : "lighter",
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
